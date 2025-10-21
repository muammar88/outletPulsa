<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import { useNotification } from '@/composables/useNotification';
import { list_rekap_distribusi_per_asnaf } from '@/service/rekap_distribusi_per_asnaf';
import BaseButton from '@/components/Button/BaseButton.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const isLoading = ref(false);
const isDownloading = ref(false);
const selectedYear = ref('0');

const currentYear = new Date().getFullYear();
const years = ref<string[]>([]);

const months = [
  { key: '01', label: 'JAN' },
  { key: '02', label: 'FEB' },
  { key: '03', label: 'MAR' },
  { key: '04', label: 'APR' },
  { key: '05', label: 'MEI' },
  { key: '06', label: 'JUN' },
  { key: '07', label: 'JUL' },
  { key: '08', label: 'AGS' },
  { key: '09', label: 'SEP' },
  { key: '10', label: 'OKT' },
  { key: '11', label: 'NOV' },
  { key: '12', label: 'DES' },
];

const bulanNames = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MEI',
  'JUN',
  'JUL',
  'AGS',
  'SEP',
  'OKT',
  'NOV',
  'DES',
];

function generateYears() {
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const yearList = ['0']; // 0 untuk "Pilih Semua Tahun"

  for (let year = currentYear; year >= startYear; year--) {
    yearList.push(year.toString());
  }

  years.value = yearList;
  selectedYear.value = currentYear.toString();
}

const rowsNominal = ref<any[]>([]);
const rowsPenerima = ref<any[]>([]);

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

async function fetchData() {
  isLoading.value = true;
  rowsNominal.value = [];
  rowsPenerima.value = [];

  try {
    const yearParam = selectedYear.value === '0' ? 0 : parseInt(selectedYear.value);
    const res = await list_rekap_distribusi_per_asnaf({ year: yearParam || currentYear });
    console.log('📊 Response backend:', res);

    if (res.error) {
      displayNotification(res.error_msg || 'Data laporan tidak ditemukan', 'error');
      return;
    }

    const raw = res.data || [];
    if (!raw.length) {
      displayNotification('Data laporan penyaluran tidak ditemukan', 'error');
      return;
    }

    const asnafMap: Record<string, { asnaf: string; valuesNominal: any; valuesPenerima: any }> = {};

    if (raw[0]?.data) {
      raw.forEach((bulan: any) => {
        bulan.data.forEach((item: any) => {
          if (!asnafMap[item.asnaf_id]) {
            asnafMap[item.asnaf_id] = {
              asnaf: item.asnaf,
              valuesNominal: {},
              valuesPenerima: {},
            };
          }
          asnafMap[item.asnaf_id].valuesNominal[bulan.month] = item.total_nominal || 0;
          asnafMap[item.asnaf_id].valuesPenerima[bulan.month] = item.total_penerima || 0;
        });
      });
    } else {
      raw.forEach((item: any) => {
        if (!asnafMap[item.asnaf_id]) {
          asnafMap[item.asnaf_id] = {
            asnaf: item.asnaf,
            valuesNominal: {},
            valuesPenerima: {},
          };
        }
        asnafMap[item.asnaf_id].valuesNominal[item.month] = item.total_nominal || 0;
        asnafMap[item.asnaf_id].valuesPenerima[item.month] = item.total_penerima || 0;
      });
    }

    rowsNominal.value = Object.values(asnafMap).map((a: any) => {
      let total = 0;
      months.forEach((m) => {
        const val = a.valuesNominal[m.key] || 0;
        total += val;
        a.valuesNominal[m.key] = val;
      });
      return { label: a.asnaf, values: a.valuesNominal, total };
    });

    rowsPenerima.value = Object.values(asnafMap).map((a: any) => {
      let total = 0;
      months.forEach((m) => {
        const val = a.valuesPenerima[m.key] || 0;
        total += val;
        a.valuesPenerima[m.key] = val;
      });
      return { label: a.asnaf, values: a.valuesPenerima, total };
    });
  } catch (e: any) {
    displayNotification(e.response?.data?.message || 'Gagal memuat data', 'error');
  } finally {
    isLoading.value = false;
  }
}

// Rupiah formatter
function formatRupiah(value: any) {
  const safeValue = Number(value) || 0;
  return 'Rp ' + safeValue.toLocaleString('id-ID');
}

function fixOklchColors(element: HTMLElement) {
  const all = element.querySelectorAll('*');
  all.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = window.getComputedStyle(htmlEl);

    if (style.color.includes('oklch')) htmlEl.style.color = '#000000';
    if (style.backgroundColor.includes('oklch')) htmlEl.style.backgroundColor = '#ffffff';
    if (style.borderColor.includes('oklch')) htmlEl.style.borderColor = '#d1d5db';
  });
}

// Download PDF
async function downloadPDF() {
  if (isDownloading.value) return;
  if (rowsNominal.value.length === 0) {
    displayNotification('Tidak ada data untuk diunduh', 'error');
    return;
  }

  isDownloading.value = true;

  try {
    const tableWrapper = document.getElementById('tables-for-pdf');
    if (!tableWrapper) {
      displayNotification('Tabel tidak ditemukan', 'error');
      isDownloading.value = false;
      return;
    }

    // Clone table untuk PDF
    const clonedTables = tableWrapper.cloneNode(true) as HTMLElement;

    // Buat temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = 'max-content';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '20px';
    tempContainer.appendChild(clonedTables);

    document.body.appendChild(tempContainer);

    // Fix sticky positions untuk PDF
    const stickyElements = tempContainer.querySelectorAll('[class*="sticky"]');
    stickyElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.position = 'relative';
      htmlEl.style.left = '0';
      htmlEl.style.top = '0';
    });

    // Force table layout fixed untuk konsistensi
    const tables = tempContainer.querySelectorAll('table');
    tables.forEach((table) => {
      (table as HTMLElement).style.tableLayout = 'fixed';
    });

    // Fix warna oklch
    fixOklchColors(tempContainer);

    // Tunggu layout settle
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Capture ke canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: tempContainer.scrollWidth,
      windowHeight: tempContainer.scrollHeight,
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    const imgData = canvas.toDataURL('image/png');

    // Buat PDF A4 Landscape
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Convert px to mm
    const imgWidthMM = (canvas.width * 25.4) / 96;
    const imgHeightMM = (canvas.height * 25.4) / 96;

    // Scale untuk fit ke lebar A4
    const scale = pdfWidth / imgWidthMM;
    const scaledHeight = imgHeightMM * scale;

    // Split ke multiple pages jika perlu
    let yPosition = 0;
    while (yPosition < scaledHeight) {
      if (yPosition > 0) pdf.addPage();

      pdf.addImage(imgData, 'PNG', 0, -yPosition, pdfWidth, scaledHeight, '', 'FAST');

      yPosition += pdfHeight;
    }

    // Download
    const yearLabel = selectedYear.value === '0' ? 'Semua_Tahun' : selectedYear.value;
    pdf.save(`Rekap_Distribusi_Per_Asnaf_${yearLabel}.pdf`);
    displayNotification('PDF berhasil diunduh', 'success');
  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    displayNotification('Gagal mengunduh PDF: ' + error.message, 'error');
  } finally {
    isDownloading.value = false;
  }
}

onMounted(async () => {
  generateYears();
  await fetchData();
});

watch(selectedYear, fetchData);
</script>

<template>
  <div class="p-4 space-y-8">
    <!-- Filter Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
      <!-- Kiri: Tombol Download -->
      <div class="flex items-center">
        <BaseButton
          @click="downloadPDF"
          variant="primary"
          type="button"
          :disabled="isDownloading || isLoading"
        >
          <font-awesome-icon
            :icon="isDownloading ? 'fa-solid fa-spinner' : 'fa-solid fa-download'"
            :class="{ 'animate-spin': isDownloading, 'mr-2': true }"
          />
          {{ isDownloading ? 'Mengunduh...' : 'Download PDF' }}
        </BaseButton>
      </div>

      <!-- Kanan: Filter Tahun -->
      <div class="flex items-center">
        <label for="year-filter" class="mr-2 text-sm font-medium text-gray-600 whitespace-nowrap">
          Tahun
        </label>
        <select
          id="year-filter"
          v-model="selectedYear"
          class="w-full sm:w-48 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
        >
          <option value="0">Semua Tahun</option>
          <option v-for="year in years.slice(1)" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <div id="tables-for-pdf" style="margin-top: 20px">
      <!-- Tabel Nominal Distribusi -->
      <div class="mt-0">
        <div class="overflow-x-auto rounded-xl border border-gray-200 shadow">
          <SkeletonTable v-if="isLoading" :columns="months.length + 2" :rows="5" />
          <table
            v-else-if="rowsNominal.length > 0"
            class="min-w-full table-auto border-collapse bg-white shadow-md rounded-xl overflow-hidden text-sm"
          >
            <thead class="text-gray-700 text-center border-b border-gray-300">
              <tr>
                <th
                  colspan="14"
                  class="px-4 py-3 font-medium border border-gray-300 sticky left-0 bg-gray-200 z-30 text-left"
                >
                  <h2 class="text-lg font-bold">DISTRIBUSI (NOMINAL RUPIAH)</h2>
                </th>
              </tr>
              <tr class="bg-gray-50 sticky top-0 z-20">
                <th
                  rowspan="2"
                  class="px-4 py-3 font-medium border-r border-gray-300 sticky left-0 bg-gray-50 z-30 min-w-[180px]"
                >
                  ASNAF
                </th>
                <th
                  :colspan="bulanNames.length"
                  class="px-4 py-3 font-medium border border-gray-300"
                >
                  BULAN
                </th>
                <th
                  rowspan="2"
                  class="px-4 py-3 font-medium bg-gray-100 min-w-[120px] border border-gray-300"
                >
                  JUMLAH
                </th>
              </tr>

              <tr class="bg-gray-50 sticky top-[40px] z-10">
                <th
                  v-for="bulan in bulanNames"
                  :key="bulan"
                  class="px-4 py-3 font-medium border-r border-gray-300 min-w-[120px]"
                >
                  {{ bulan }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(r, i) in rowsNominal"
                :key="r.label"
                class="even:bg-gray-50 hover:bg-indigo-50 transition-colors"
              >
                <!-- px-6 py-4 text-center font-medium text-gray-800 -->
                <td class="px-6 py-4 text-left font-medium text-gray-700 sticky left-0 bg-inherit">
                  {{ r.label }}
                </td>
                <td
                  v-for="m in months"
                  :key="m.key"
                  class="px-4 py-3 text-right tabular-nums whitespace-nowrap"
                >
                  {{ formatRupiah(r.values[m.key]) }}
                </td>
                <td
                  class="px-4 py-3 text-right font-semibold bg-gray-100 whitespace-nowrap italic text-yellow-500 border border-gray-300"
                >
                  {{ formatRupiah(r.total) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  class="px-6 py-4 text-left font-bold text-gray-700 sticky left-0 bg-gray-100 border border-gray-300"
                >
                  Total
                </td>
                <td
                  v-for="m in months"
                  :key="m.key"
                  class="px-4 py-3 text-right font-bold bg-gray-100 whitespace-nowrap italic text-yellow-500 border border-gray-300"
                >
                  {{
                    formatRupiah(
                      rowsNominal.reduce((acc, curr) => acc + (curr.values[m.key] || 0), 0),
                    )
                  }}
                </td>

                <td
                  class="px-4 py-3 text-right font-bold bg-gray-100 whitespace-nowrap italic text-yellow-500 border border-gray-300"
                >
                  {{ formatRupiah(rowsNominal.reduce((acc, curr) => acc + (curr.total || 0), 0)) }}
                </td>
              </tr>
            </tfoot>
          </table>
          <div v-else class="bg-white shadow-md rounded-xl p-12 text-center">
            <p class="text-gray-500 text-lg">Data laporan penyaluran tidak ditemukan</p>
          </div>
        </div>
      </div>

      <!-- Tabel Jumlah Penerima -->
      <div class="mt-10">
        <!-- <h2 class="text-lg font-medium mb-3">Distribusi (Jumlah Penerima)</h2> -->
        <div class="overflow-x-auto rounded-xl border border-gray-200 shadow">
          <SkeletonTable v-if="isLoading" :columns="months.length + 2" :rows="5" />
          <table
            v-else-if="rowsPenerima.length > 0"
            class="min-w-full table-auto border-collapse bg-white shadow-md rounded-xl overflow-hidden text-sm"
          >
            <thead class="text-gray-700 text-center border-b border-gray-300">
              <tr>
                <th
                  colspan="14"
                  class="px-4 py-3 font-medium border border-gray-300 sticky left-0 bg-gray-200 z-30 text-left"
                >
                  <h2 class="text-lg font-bold">DISTRIBUSI (JUMLAH PENERIMA)</h2>
                </th>
              </tr>
              <tr class="bg-gray-50 sticky top-0 z-20">
                <th
                  rowspan="2"
                  class="w-[20%] px-4 py-3 font-medium border-r border-gray-300 sticky left-0 bg-gray-50 z-30 min-w-[180px]"
                >
                  ASNAF
                </th>
                <th
                  :colspan="bulanNames.length"
                  class="px-4 py-3 font-medium border border-gray-300"
                >
                  BULAN
                </th>
                <th rowspan="2" class="px-4 py-3 font-medium bg-gray-100 min-w-[120px]">JUMLAH</th>
              </tr>

              <tr class="bg-gray-50 sticky top-[40px] z-10">
                <th
                  v-for="bulan in bulanNames"
                  :key="bulan"
                  class="px-4 py-3 font-medium border-r border-gray-300 min-w-[100px]"
                >
                  {{ bulan }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(r, i) in rowsPenerima"
                :key="r.label"
                class="even:bg-gray-50 hover:bg-indigo-50 transition-colors"
              >
                <td class="px-6 py-4 text-left font-medium text-gray-700 sticky left-0 bg-inherit">
                  {{ r.label }}
                </td>
                <td
                  v-for="m in months"
                  :key="m.key"
                  class="px-4 py-3 text-center tabular-nums min-w-[120px]"
                >
                  {{ r.values[m.key] || '-' }}
                </td>
                <td
                  class="px-4 py-3 text-center font-semibold bg-gray-100 min-w-[120px] border border-gray-300"
                >
                  {{ r.total }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  class="px-6 py-4 text-left font-bold text-gray-700 sticky left-0 bg-gray-100 border border-gray-300"
                >
                  Total
                </td>
                <td
                  v-for="m in months"
                  :key="m.key"
                  class="px-4 py-3 text-center font-bold bg-gray-100 whitespace-nowrap italic text-yellow-500 border border-gray-300"
                >
                  {{ rowsPenerima.reduce((acc, curr) => acc + (curr.values[m.key] || 0), 0) }}
                </td>

                <td
                  class="px-4 py-3 text-center font-bold bg-gray-100 whitespace-nowrap italic text-yellow-500 border border-gray-300"
                >
                  {{ rowsPenerima.reduce((acc, curr) => acc + (curr.total || 0), 0) }}
                </td>
              </tr>
            </tfoot>
          </table>
          <div v-else class="bg-white shadow-md rounded-xl p-12 text-center">
            <p class="text-gray-500 text-lg">Data laporan penyaluran tidak ditemukan</p>
          </div>
        </div>
      </div>
    </div>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
