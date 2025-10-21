<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { list } from '@/service/rekap_pengumpulan_per_kecamatan';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BaseButton from '@/components/Button/BaseButton.vue';

const isLoading = ref(false);
const selectedYear = ref('0'); // ubah ke string untuk konsistensi dengan options
const years = ref<string[]>([]);

function generateYears() {
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const yearList = ['0']; // 0 untuk "Pilih Semua Tahun"

  for (let year = currentYear; year >= startYear; year--) {
    yearList.push(year.toString());
  }

  years.value = yearList;
}

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

const searchKecamatan = ref<string>('');

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

const rows = ref<any[]>([]);
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Computed untuk filter berdasarkan pencarian kecamatan
const filteredRows = computed(() => {
  if (!searchKecamatan.value.trim()) {
    return rows.value;
  }

  const search = searchKecamatan.value.toLowerCase();
  return rows.value.filter((row) => row.nama_kecamatan.toLowerCase().includes(search));
});

async function fetchData() {
  isLoading.value = true;
  try {
    const yearParam = selectedYear.value === '0' ? 0 : parseInt(selectedYear.value);
    const res = await list({ year: yearParam || new Date().getFullYear() });
    const data = res.data || [];

    // Format hasil berdasarkan kecamatan
    const groupedByKecamatan = data.reduce((acc, item) => {
      if (!acc[item.nama_kecamatan]) {
        acc[item.nama_kecamatan] = {
          nama_kecamatan: item.nama_kecamatan,
          year: item.year,
          monthly: {},
          total: 0,
        };
      }
      acc[item.nama_kecamatan].monthly[item.month] = item.total_semua || 0;
      acc[item.nama_kecamatan].total += item.total_semua || 0;
      return acc;
    }, {});

    rows.value = Object.values(groupedByKecamatan);
  } catch (e: any) {
    displayNotification(e.response?.data?.message || 'Gagal memuat data', 'error');
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  generateYears();
  await fetchData();
});

watch(selectedYear, fetchData);

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

const isDownloading = ref(false);

// Download PDF
async function downloadPDF() {
  if (isDownloading.value) return;
  if (filteredRows.value.length === 0) {
    displayNotification('Tidak ada data untuk diunduh', 'error');
    return;
  }

  isDownloading.value = true;

  try {
    const tableWrapper = document.getElementById('table-for-pdf');
    if (!tableWrapper) {
      displayNotification('Tabel tidak ditemukan', 'error');
      isDownloading.value = false;
      return;
    }

    // Clone table untuk PDF
    const clonedTable = tableWrapper.cloneNode(true) as HTMLElement;

    // Buat temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = 'max-content';
    tempContainer.style.background = '#ffffff';
    tempContainer.appendChild(clonedTable);

    document.body.appendChild(tempContainer);

    // Remove sticky positions dari clone
    const stickyElements = tempContainer.querySelectorAll('[class*="sticky"]');
    stickyElements.forEach((el) => {
      (el as HTMLElement).style.position = 'static';
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
    pdf.save(`Rekap_Pengumpulan_Kecamatan_${yearLabel}.pdf`);
    displayNotification('PDF berhasil diunduh', 'success');
  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    displayNotification('Gagal mengunduh PDF: ' + error.message, 'error');
  } finally {
    isDownloading.value = false;
  }
}
</script>

<template>
  <div class="p-4">
    <!-- Filter Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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

      <!-- Kanan: Filter Search dan Tahun -->
      <div class="flex flex-col sm:flex-row gap-3 items-center">
        <div class="flex items-center">
          <label
            for="search-kecamatan"
            class="mr-2 text-sm font-medium text-gray-600 whitespace-nowrap"
          >
            Cari Kecamatan
          </label>
          <input
            id="search-kecamatan"
            type="text"
            v-model="searchKecamatan"
            placeholder="Nama kecamatan..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
        </div>

        <!-- Filter Tahun -->
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
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <SkeletonTable v-if="isLoading" :columns="months.length + 2" :rows="5" />

      <div v-else-if="filteredRows.length > 0" id="table-for-pdf">
        <table
          class="min-w-full table-auto border-collapse bg-white shadow-md rounded-xl overflow-hidden text-sm"
        >
          <thead class="text-gray-700 text-center border-b border-gray-300">
            <tr class="bg-gray-50 sticky top-0 z-20">
              <th
                rowspan="2"
                class="w-[20%] px-4 py-3 font-medium border-r border-gray-300 sticky left-0 bg-gray-50 z-30"
              >
                KECAMATAN
              </th>
              <th :colspan="bulanNames.length" class="px-4 py-3 font-medium border border-gray-300">
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

          <tbody>
            <tr
              v-for="r in filteredRows"
              :key="r.nama_kecamatan"
              class="even:bg-gray-50 hover:bg-indigo-50 transition-colors"
            >
              <td class="px-6 py-3 text-left font-medium text-gray-700 sticky left-0 bg-inherit">
                {{ r.nama_kecamatan }}
              </td>

              <td
                v-for="m in months"
                :key="m.key"
                class="px-6 py-3 text-right tabular-nums whitespace-nowrap"
              >
                {{ formatRupiah(r.monthly[m.key] ?? 0) }}
              </td>

              <td class="px-6 py-3 text-right whitespace-nowrap bg-gray-100 font-semibold">
                {{ formatRupiah(r.total ?? 0) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
      </div>
      <div v-else class="flex flex-col items-center justify-center py-16 text-gray-500">
        <font-awesome-icon icon="fa-solid fa-box-open" class="text-5xl mb-3 text-gray-400" />
        <p class="text-lg font-medium">Tidak ada data tersedia</p>
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
