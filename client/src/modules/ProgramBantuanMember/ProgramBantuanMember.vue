<script setup lang="ts">
const programs = [
  { name: 'Program Bantuan Sosial', icon: '/images/icon_program2.svg', link: '#' },
  { name: 'Program Pemberdayaan Ekonomi', icon: '/images/icon_program2.svg', link: '#' },
  { name: 'Program Bantuan Kesehatan', icon: '/images/icon_program2.svg', link: '#' },
  { name: 'Program Bantuan Pendidikan', icon: '/images/icon_program2.svg', link: '#' },
  { name: 'Program Bantuan Keagamaan', icon: '/images/icon_program2.svg', link: '#' },
  { name: 'Program Bantuan Infak', icon: '/images/icon_program2.svg', link: '#' },
];

// Library
import { ref, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import Notification from '@/components/Modal/Notification.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import DaftarProgram from './widgets/DaftarProgram.vue';
import RiwayatPermohonanMember from '@/modules/RiwayatPermohonanMember/RiwayatPermohonanMember.vue';

// Composable
import { useNotification } from '@/composables/useNotification';

// Service API
import { get_laporan } from '@/service/program_bantuan_member';

// === State ===
const isLoading = ref(false);
const tahun = ref<number>(new Date().getFullYear());
const selectedProgram = ref<string | null>(null);
const showRiwayat = ref(false);

const chartSeries = ref<any[]>([]);
const chartOptions = ref<any>({});
const orang_terbantu = ref(0);
const total_bantuan = ref(0);

const formatRupiah = (angka: number) => {
  if (!angka) return 'Rp 0';
  return angka
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    .replace(/^/, 'Rp ');
};

// Notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

const fetchData = async () => {
  try {
    isLoading.value = true;
    const response = await get_laporan({ tahun: tahun.value });
    const data = response?.data || [];
    total_bantuan.value = response.total.sudah_direalisasi;
    orang_terbantu.value = response.total.total_penerima;

    const labels = data.map((d: any) => d.program);
    const realisasiSeries = data.map((d: any) => d.persentase_realisasi || 0);
    const belumSeries = data.map((d: any) => 100 - (d.persentase_realisasi || 0));

    chartSeries.value = [
      { name: 'Realisasi', data: realisasiSeries },
      { name: 'Belum Terealisasi', data: belumSeries },
    ];

    chartOptions.value = {
      chart: {
        type: 'bar',
        foreColor: '#000',
        toolbar: { show: true },
        stacked: true,
        animations: { enabled: true, easing: 'easeinout', speed: 800 },
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const programName = labels[config.dataPointIndex];
            const realisasi = realisasiSeries[config.dataPointIndex];
            console.log('Program selected:', programName, realisasi);
          },
        },
      },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '45%', borderRadius: 6 },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      xaxis: { categories: labels },
      yaxis: {
        labels: { formatter: (val: number) => `${val}%` },
        max: 100,
        title: { text: 'Persentase Realisasi' },
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        },
      },
      title: { text: 'Persentase Realisasi Program', align: 'left' },
      colors: ['#16a34a', '#facc15'], // hijau & kuning
      legend: { position: 'bottom' },
    };
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

const daftarTahun = ref<number[]>([]);

const initTahun = () => {
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2020; i--) {
    daftarTahun.value.push(i);
  }
};

// handle klik program
const handleProgramClick = (programName: string) => {
  selectedProgram.value = programName;
};

// handle klik riwayat
const handleRiwayatClick = () => {
  showRiwayat.value = true;
};

// handle back dari riwayat
const handleBackFromRiwayat = () => {
  showRiwayat.value = false;
};

onMounted(() => {
  initTahun();
  fetchData();
});
</script>

<template>
  <!-- Tampilkan RiwayatPermohonanMember jika showRiwayat true -->
  <div v-if="showRiwayat">
    <RiwayatPermohonanMember @back="handleBackFromRiwayat" />
  </div>

  <!-- Tampilkan DaftarProgram jika selectedProgram ada -->
  <div v-else-if="selectedProgram">
    <DaftarProgram :program-name="selectedProgram" @back="selectedProgram = null" />
  </div>

  <!-- Tampilkan halaman utama jika tidak ada yang dipilih -->
  <div v-else>
    <div
      class="w-full p-6 md:p-10 bg-white rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row justify-start items-start gap-10 overflow-hidden"
    >
      <div class="w-full flex flex-col lg:flex-row gap-6">
        <!-- === Kiri: List Program === -->
        <div
          class="w-full lg:w-[35%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 overflow-hidden"
        >
          <p class="text-green-900 text-3xl font-semibold mt-3">Program Bantuan</p>
          <p class="text-gray-400 max-w-3xl">
            Ayo, kita cari tahu bersama program-program bantuan apa saja yang sedang tersedia di
            Baitul Mal Kabupaten Bener Meriah!
          </p>

          <a
            v-for="(program, index) in programs"
            :key="index"
            href="#"
            @click.prevent="handleProgramClick(program.name)"
            class="w-full max-w-sm px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 focus:bg-yellow-500 rounded-lg inline-flex justify-start items-center gap-2.5 font-semibold text-[14px]"
          >
            <img :src="program.icon" />
            {{ program.name }}
          </a>

          <a
            href="#"
            @click.prevent="handleRiwayatClick"
            class="w-full max-w-sm px-6 py-2.5 bg-green-800 hover:bg-green-700 focus:bg-green-500 rounded-lg inline-flex justify-start items-center gap-2.5 font-semibold text-[14px] text-white"
          >
            <font-awesome-icon icon="fa-solid fa-hand-holding-dollar mr-3" size="xl" />
            <span>Riwayat Program Bantuan</span>
          </a>
        </div>

        <!-- === Kanan: Chart === -->
        <div
          class="w-full lg:w-[65%] flex-1 gap-[30px] px-[24px] md:px-[32px] lg:px-[75px] py-10 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-black/20 flex flex-col justify-start items-center overflow-hidden"
        >
          <div class="flex flex-col md:flex-row justify-between w-full relative gap-6">
            <div class="flex gap-4">
              <div class="justify-center text-neutral-800 text-base font-normal leading-normal">
                Pilih Tahun Anggaran:
              </div>
              <select
                v-model="tahun"
                @change="fetchData"
                class="h-fit py-3 px-4 pe-9 block w-full border border-gray-200 rounded-lg text-sm focus:border-green-900 focus:ring-green-900 disabled:opacity-50 disabled:pointer-events-none"
              >
                <option v-for="(t, i) in daftarTahun" :key="i" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="flex">
              <div class="flex items-start gap-3">
                <img src="/images/icon_orang_terbantu.svg" />
                <div class="flex flex-col">
                  <div class="justify-center text-green-900 text-xl font-bold leading-loose">
                    +{{ orang_terbantu }}
                  </div>
                  <div class="justify-center text-neutral-800 text-base font-normal leading-normal">
                    Orang<br />Terbantu
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <img src="/images/icon_bantuan_tersalurkan.svg" />
                <div class="flex flex-col">
                  <div class="justify-center text-green-900 text-xl font-bold leading-loose">
                    +{{ formatRupiah(total_bantuan) }}
                  </div>
                  <div class="justify-center text-neutral-800 text-base font-normal leading-normal">
                    Bantuan<br />Disalurkan
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <div v-if="!isLoading" class="w-full mt-6">
            <VueApexCharts type="bar" height="350" :options="chartOptions" :series="chartSeries" />
          </div>
          <div v-else class="flex justify-center items-center h-40">
            <span class="text-gray-400">Loading chart...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.apexcharts-text),
:deep(.apexcharts-legend-text),
:deep(.apexcharts-xaxis-label),
:deep(.apexcharts-yaxis-label) {
  fill: #000 !important;
  color: #000 !important;
  font-size: 12px !important;
}
</style>
