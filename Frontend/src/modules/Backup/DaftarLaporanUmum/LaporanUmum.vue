<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '@/components/Logo/Logo.vue';
import { useNotification } from '@/composables/useNotification';

import { list } from '@/service/laporan_umum';

const isLoading = ref(false);
const isDownloading = ref(false);

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

const data = ref<any>(null);

const selectedYear = ref<number>(new Date().getFullYear());
const selectedMonth = ref<number>(new Date().getMonth() + 1);

// Generate tahun options (5 tahun ke belakang)
const yearOptions = ref<number[]>([]);
for (let i = 0; i < 5; i++) {
  yearOptions.value.push(new Date().getFullYear() - i);
}

// Generate bulan options
const monthOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

// Function: Fetch Data
async function fetchData() {
  isLoading.value = true;
  try {
    const response = await list(selectedYear.value, selectedMonth.value);
    if (response && response.status) {
      data.value = response.data;
      console.log('Data laporan umum:', data.value);
    } else {
      displayNotification('Gagal mengambil data laporan umum', 'error');
    }
  } catch (error) {
    displayNotification('Terjadi kesalahan saat mengambil data laporan umum', 'error');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

// Function: Handle filter change
async function handleFilterChange() {
  await fetchData();
}

// Function: Fix oklch colors
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

// Function: Download PDF
async function handleDownloadPDF() {
  if (isDownloading.value) return;
  if (!data.value) {
    displayNotification('Tidak ada data untuk diunduh', 'error');
    return;
  }

  isDownloading.value = true;

  try {
    const contentWrapper = document.getElementById('laporan-content');
    if (!contentWrapper) {
      displayNotification('Konten tidak ditemukan', 'error');
      isDownloading.value = false;
      return;
    }

    // Clone content untuk PDF
    const clonedContent = contentWrapper.cloneNode(true) as HTMLElement;

    // Buat temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1200px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '20px';
    tempContainer.appendChild(clonedContent);

    document.body.appendChild(tempContainer);

    // Show PDF header
    const pdfHeader = tempContainer.querySelector('.pdf-header') as HTMLElement;
    if (pdfHeader) {
      pdfHeader.style.display = 'block';
    }

    // Fix oklch colors
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

    // Buat PDF A4
    const pdf = new jsPDF({
      orientation: 'portrait',
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
    pdf.save(`Laporan_Umum_${getMonthName(selectedMonth.value)}_${selectedYear.value}.pdf`);
    displayNotification('PDF berhasil diunduh', 'success');
  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    displayNotification('Gagal mengunduh PDF: ' + error.message, 'error');
  } finally {
    isDownloading.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  await fetchData();
});

// Utils
const formatRupiah = (value: number) => {
  if (!value) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const getMonthName = (month: number) => {
  return monthOptions.find((m) => m.value === month)?.label || '';
};
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <!-- <h2 class="text-lg font-semibold flex items-center mb-2"></h2> -->
    <Logo />
    <!-- Grid Content -->
    <div v-if="data" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <!-- Kiri -->
      <div class="space-y-6">
        <!-- Info Umum -->

        <div>
          <div class="bg-gray-200 px-4 py-2 border-t border-l border-r border-gray-300 font-medium">
            INFO UMUM
          </div>
          <div class="border border-t-0 border-gray-300 divide-y divide-gray-300">
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Member</span>
              <span>:</span>
              <span>{{ data.info_umum.totalMember }} Orang</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Asnaf</span>
              <span>:</span>
              <span>{{ data.info_umum.totalAsnaf }} Asnaf</span>
            </div>
            <div class="border border-t-0 border-gray-300 divide-y divide-gray-300">
              <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
                <span>Total Member</span>
                <span>:</span>
                <span>{{ data.info_umum.totalMember }} Orang</span>
              </div>
              <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
                <span>Total Asnaf</span>
                <span>:</span>
                <span>{{ data.info_umum.totalAsnaf }} Asnaf</span>
              </div>
              <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
                <span>Total Program</span>
                <span>:</span>
                <span>{{ data.info_umum.totalProgram }} Program</span>
              </div>
            </div>
          </div>

          <!-- Info Program Bantuan -->
          <div>
            <div
              class="bg-gray-200 px-4 py-2 border-t border-l border-r border-gray-300 font-medium"
            >
              INFO PROGRAM BANTUAN
            </div>
            <div class="border border-t-0 border-gray-300 divide-y divide-gray-300">
              <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
                <span>Total Program Penyaluran</span>
                <span>:</span>
                <span>{{ data.info_program_bantuan.totalProgramPenyaluran }} Program Bantuan</span>
              </div>
              <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
                <span>Total Penerima Bantuan</span>
                <span>:</span>
                <span>{{ data.info_program_bantuan.totalPenerimaBantuan }} Pemohon</span>
              </div>
              <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
                <span>Total Penyaluran Bantuan</span>
                <span>:</span>
                <span>{{ formatRupiah(data.info_program_bantuan.totalPenyaluranBantuan) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Kanan -->
      <div class="space-y-6">
        <!-- Total Penerimaan Zakat -->
        <div>
          <div class="bg-gray-200 px-4 py-2 border-t border-l border-r border-gray-300 font-medium">
            TOTAL PENERIMAAN ZAKAT
          </div>
          <div class="border border-t-0 border-gray-300 divide-y divide-gray-300">
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Zakat Hari Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_zakat.totalPenerimaanZakatHariIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Zakat Bulan Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_zakat.totalPenerimaanZakatBulanIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Zakat Tahun Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_zakat.totalPenerimaanZakatTahunIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Zakat</span>
              <span>:</span>
              <span>{{ formatRupiah(data.total_penerimaan_zakat.totalPenerimaanZakat) }}</span>
            </div>
          </div>
        </div>

        <!-- Total Penerimaan Infaq -->
        <div>
          <div class="bg-gray-200 px-4 py-2 border-t border-l border-r border-gray-300 font-medium">
            TOTAL PENERIMAAN INFAQ
          </div>
          <div class="border border-t-0 border-gray-300 divide-y divide-gray-300">
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Infaq Hari Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_infaq.totalPenerimaanInfaqHariIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Infaq Bulan Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_infaq.totalPenerimaanInfaqBulanIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Infaq Tahun Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_infaq.totalPenerimaanInfaqTahunIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Infaq</span>
              <span>:</span>
              <span>{{ formatRupiah(data.total_penerimaan_infaq.totalPenerimaanInfaq) }}</span>
            </div>
          </div>
        </div>

        <!-- Total Penerimaan Donasi -->
        <div>
          <div class="bg-gray-200 px-4 py-2 border-t border-l border-r border-gray-300 font-medium">
            TOTAL PENERIMAAN DONASI
          </div>
          <div class="border border-t-0 border-gray-300 divide-y divide-gray-300">
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Donasi Hari Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_donasi.totalPenerimaanDonasiHariIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Donasi Bulan Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_donasi.totalPenerimaanDonasiBulanIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Donasi Tahun Ini</span>
              <span>:</span>
              <span>{{
                formatRupiah(data.total_penerimaan_donasi.totalPenerimaanDonasiTahunIni)
              }}</span>
            </div>
            <div class="grid grid-cols-[1fr_20px_1fr] px-4 py-2">
              <span>Total Penerimaan Donasi</span>
              <span>:</span>
              <span>{{ formatRupiah(data.total_penerimaan_donasi.totalPenerimaanDonasi) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-10">Memuat data laporan umum...</div>

    <!-- Notification Modal -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
