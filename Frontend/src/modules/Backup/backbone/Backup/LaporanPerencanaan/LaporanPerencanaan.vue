<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { get_laporan_perencanaan } from '@/service/laporan_perencanaan';
import BaseButton from '@/components/Button/BaseButton.vue';

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// State
const isLoading = ref(false);
const isTableLoading = ref(false);

const itemsPerPage = ref<number>(10);
const totalColumns = ref<number>(10);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Interfaces
interface LaporanPerencanaan {
  uraian: string;
  rencana: {
    jumlah: number;
    satuan: string;
  };
  rincian: {
    vol: number;
    satuan: string;
    jumlah_satuan: number;
    jumlah_satuan_format: number;
  };
  persentase: string;
  ket: string;
}

interface asnaf {
  nama: string;
  program: LaporanPerencanaan[];
  total: number;
}

const datas = ref<asnaf[]>([]);
const grandTotal = ref<string>('');
const tahunOptions = ref<number[]>([2023, 2024, 2025, 2026, 2027]);
const selectedYear = ref<number | null>(new Date().getFullYear());

const programOptions = ref<string[]>([
  'Bantuan Sosial',
  'Bantuan Pemberdayaan Ekonomi',
  'Bantuan Kesehatan',
  'Bantuan Sosial Keagamaan',
  'Bantuan Pendidikan',
  'Bantuan Infaq',
]);
const selectedProgram = ref<string>('');

// Helper Format
const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val);

// Fetch Data
async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_laporan_perencanaan({
      perpage: perPage.value,
      pageNumber: currentPage.value,
      tahun: selectedYear.value || undefined,
      program: selectedProgram.value || undefined,
    });
    datas.value = response.data;
    totalRow.value = response.total;
    grandTotal.value = response.grand_total_format;
  } catch (err) {
    console.error(err);
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(fetchData);
watch([selectedYear, selectedProgram], async () => {
  currentPage.value = 1;
  await fetchData();
});

const isDownloading = ref(false);

// ==================== DOWNLOAD PDF ====================
async function downloadPDF() {
  if (isDownloading.value) return;
  if (datas.value.length === 0) {
    displayNotification('Tidak ada data untuk diunduh', 'error');
    return;
  }

  isDownloading.value = true;

  try {
    // Buat table baru dengan inline styles aja (no Tailwind)
    const tableHTML = `
      <div style="padding: 20px; background: #fff; font-family: Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse; background: #fff; font-size: 12px;">
          <thead style="background: #f9fafb; color: #374151; text-align: center;">
            <tr>
              <th rowspan="2" style="width: 20%; padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Asnaf</th>
              <th colspan="2" style="width: 20%; padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Rencana</th>
              <th colspan="4" style="width: 40%; padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Rincihan Perhitungan (Murni)</th>
              <th rowspan="2" style="width: 10%; padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">%</th>
              <th rowspan="2" style="width: 10%; padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Ket</th>
            </tr>
            <tr>
              <th style="padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Jumlah</th>
              <th style="padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Satuan</th>
              <th style="padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Vol</th>
              <th style="padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Satuan</th>
              <th style="padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Jumlah Satuan</th>
              <th style="padding: 12px; font-weight: 500; border: 1px solid #d1d5db;">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            ${datas.value
              .map(
                (asnaf) => `
              <tr style="background: #f3f4f6; text-align: center;">
                <td colspan="6" style="padding: 8px; font-weight: 600; color: #374151; text-align: left; border: 1px solid #d1d5db;">${asnaf.nama}</td>
                <td style="padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">${formatRupiah(asnaf.total)}</td>
                <td style="padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">100 %</td>
                <td colspan="2" style="border: 1px solid #d1d5db;"></td>
              </tr>
              ${asnaf.program
                .map(
                  (prog) => `
                <tr style="text-align: center;">
                  <td style="padding: 8px; color: #4b5563; text-align: left; border: 1px solid #d1d5db;">${prog.uraian}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${prog.rencana.jumlah}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${prog.rencana.satuan}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${prog.rincian.vol}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${prog.rincian.satuan}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${formatRupiah(prog.rincian.jumlah_satuan)}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${formatRupiah(prog.rincian.satuan == 'tahun' ? prog.rincian.jumlah_satuan * prog.rencana.jumlah : prog.rincian.jumlah_satuan * prog.rincian.vol)}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${prog.persentase}</td>
                  <td style="padding: 8px; color: #4b5563; border: 1px solid #d1d5db;">${prog.ket}</td>
                </tr>
              `,
                )
                .join('')}
            `,
              )
              .join('')}
            <tr style="background: #e5e7eb; text-align: center; font-weight: bold;">
              <td colspan="6" style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Total</td>
              <td style="padding: 8px; border: 1px solid #d1d5db;">${grandTotal.value}</td>
              <td colspan="2" style="border: 1px solid #d1d5db;"></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Bikin temporary container
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tableHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = 'max-content';
    document.body.appendChild(tempDiv);

    // Tunggu render
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Capture pake html2canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Hapus temp element
    document.body.removeChild(tempDiv);

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
    const currentDate = new Date().toISOString().split('T')[0];
    pdf.save(`Laporan_Perencanaan_${currentDate}.pdf`);
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
  <div class="mx-auto p-4">
    <div class="flex flex-wrap items-end justify-between mb-4 gap-4">
      <div class="flex flex-wrap gap-4">
        <!-- Filter Tahun -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
          <select
            v-model="selectedYear"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40"
          >
            <option :value="null">Semua</option>
            <option v-for="tahun in tahunOptions" :key="tahun" :value="tahun">{{ tahun }}</option>
          </select>
        </div>

        <!-- Filter Program -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Program</label>
          <select
            v-model="selectedProgram"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48"
          >
            <option value="">Semua</option>
            <option v-for="prog in programOptions" :key="prog" :value="prog">{{ prog }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-end justify-between gap-4 mb-0">
        <BaseButton @click="downloadPDF" variant="primary" type="button" :disabled="isDownloading">
          <font-awesome-icon icon="fa-solid fa-download" class="mr-2" />
          {{ isDownloading ? 'Downloading...' : 'Download PDF' }}
        </BaseButton>
      </div>
    </div>
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-4">
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <!-- Header -->
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th rowspan="2" class="w-[20%] px-6 py-3 font-medium border border-gray-300">
                Asnaf
              </th>
              <th colspan="2" class="w-[20%] px-6 py-3 font-medium border border-gray-300">
                Rencana
              </th>
              <th colspan="4" class="w-[40%] px-6 py-3 font-medium border border-gray-300">
                Rincihan Perhitungan (Murni)
              </th>
              <th rowspan="2" class="w-[10%] px-6 py-3 font-medium border border-gray-300">%</th>
              <th rowspan="2" class="w-[10%] px-6 py-3 font-medium border border-gray-300">Ket</th>
            </tr>
            <tr>
              <th class="px-6 py-3 font-medium border border-gray-300">Jumlah</th>
              <th class="px-6 py-3 font-medium border border-gray-300">Satuan</th>
              <th class="px-6 py-3 font-medium border border-gray-300">Vol</th>
              <th class="px-6 py-3 font-medium border border-gray-300">Satuan</th>
              <th class="px-6 py-3 font-medium border border-gray-300">Jumlah Satuan</th>
              <th class="px-6 py-3 font-medium border border-gray-300">Jumlah</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="divide-y divide-gray-100">
            <template v-if="datas.length > 0">
              <!-- Kategori Row -->
              <template v-for="asnaf in datas" :key="asnaf.nama">
                <tr class="bg-gray-100 text-center">
                  <td colspan="6" class="px-4 py-2 font-semibold text-gray-700 text-left">
                    {{ asnaf.nama }}
                  </td>
                  <td class="px-6 py-2 font-semibold text-gray-700">
                    {{ formatRupiah(asnaf.total) }}
                  </td>
                  <td class="px-6 py-2 font-semibold text-gray-700">{{ 100 }} %</td>
                  <td colspan="2"></td>
                </tr>

                <!-- Program Row -->
                <tr
                  v-for="(laporanPerencanaan, idx) in asnaf.program"
                  :key="idx"
                  class="hover:bg-gray-50 transition-colors text-center"
                >
                  <td class="px-6 py-2 text-gray-600 text-left">{{ laporanPerencanaan.uraian }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ laporanPerencanaan.rencana.jumlah }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ laporanPerencanaan.rencana.satuan }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ laporanPerencanaan.rincian.vol }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ laporanPerencanaan.rincian.satuan }}</td>
                  <td class="px-6 py-4 text-gray-600">
                    {{ formatRupiah(laporanPerencanaan.rincian.jumlah_satuan) }}
                  </td>
                  <td class="px-6 py-4 text-gray-600">
                    {{
                      formatRupiah(
                        laporanPerencanaan.rincian.satuan == 'tahun'
                          ? laporanPerencanaan.rincian.jumlah_satuan *
                              laporanPerencanaan.rencana.jumlah
                          : laporanPerencanaan.rincian.jumlah_satuan *
                              laporanPerencanaan.rincian.vol,
                      )
                    }}
                  </td>
                  <td class="px-6 py-4 text-gray-600">{{ laporanPerencanaan.persentase }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ laporanPerencanaan.ket }}</td>
                </tr>
              </template>

              <!-- Grand Total -->
              <tr class="bg-gray-200 text-center font-bold">
                <td colspan="6" class="px-6 py-2 text-left">Total</td>
                <td class="px-6 py-2">
                  {{ grandTotal }}
                </td>
                <td colspan="2"></td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="9" class="px-6 py-4 text-gray-600 text-center">
                  Data tidak ditemukan
                </td>
              </tr>
            </template>
          </tbody>

          <!-- Pagination -->
          <tfoot class="bg-gray-100 font-bold">
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :pages="pages"
              :total-columns="totalColumns"
              :total-row="totalRow"
              @prev-page="prevPage"
              @next-page="nextPage"
              @page-now="pageNow"
            />
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Notification -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
