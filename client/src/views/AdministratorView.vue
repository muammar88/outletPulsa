<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HEADER -->
    <header class="bg-green-700 text-white sticky top-0 z-50 shadow-md">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- <img src="/logo.png" alt="Logo" class="h-10 w-auto" /> -->
          <div class="text-lg font-bold">APLIKASI MUSTAHIK & MUZAKKI</div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-sm font-semibold">Administrator</div>
            <div class="text-xs">As Administrator</div>
          </div>
          <!-- <img
            src="/avatar.png"
            alt="avatar"
            class="h-10 w-10 rounded-full border-2 border-white"
          /> -->
        </div>
      </div>
    </header>

    <!-- MENU HORIZONTAL -->
    <nav class="bg-green-600 text-white">
      <div class="max-w-7xl mx-auto px-6">
        <ul class="flex space-x-4">
          <li>
            <button
              class="py-3 px-4 font-semibold hover:bg-green-700 rounded-t-lg transition"
              :class="activeTab === 'beranda' ? 'bg-green-700' : ''"
              @click="activeTab = 'beranda'"
            >
              Beranda
            </button>
          </li>
          <li>
            <button
              class="py-3 px-4 font-semibold hover:bg-green-700 rounded-t-lg transition"
              :class="activeTab === 'layanan' ? 'bg-green-700' : ''"
              @click="activeTab = 'layanan'"
            >
              Layanan
            </button>
          </li>
          <li>
            <button
              class="py-3 px-4 font-semibold hover:bg-green-700 rounded-t-lg transition"
              :class="activeTab === 'keanggotaan' ? 'bg-green-700' : ''"
              @click="activeTab = 'keanggotaan'"
            >
              Keanggotaan
            </button>
          </li>
          <li>
            <button
              class="py-3 px-4 font-semibold hover:bg-green-700 rounded-t-lg transition"
              :class="activeTab === 'laporan' ? 'bg-green-700' : ''"
              @click="activeTab = 'laporan'"
            >
              Laporan
            </button>
          </li>
          <li>
            <button
              class="py-3 px-4 font-semibold hover:bg-green-700 rounded-t-lg transition"
              :class="activeTab === 'pengaturan' ? 'bg-green-700' : ''"
              @click="activeTab = 'pengaturan'"
            >
              Pengaturan
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- MAIN DASHBOARD -->
    <main class="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <section v-if="activeTab === 'beranda'">
        <!-- STATISTIK UTAMA -->
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-green-100 text-green-800 p-4 rounded-xl shadow text-center">
            <p class="text-sm">Total Pengumpulan</p>
            <p class="text-xl font-bold">{{ formatCurrency(totalPengumpulan) }}</p>
          </div>
          <div class="bg-blue-100 text-blue-800 p-4 rounded-xl shadow text-center">
            <p class="text-sm">Total Distribusi</p>
            <p class="text-xl font-bold">{{ formatCurrency(totalDistribusi) }}</p>
          </div>
          <div class="bg-yellow-100 text-yellow-800 p-4 rounded-xl shadow text-center">
            <p class="text-sm">Persentase Distribusi</p>
            <p class="text-xl font-bold">{{ persentaseDistribusi }}%</p>
          </div>
        </div>

        <!-- GRAFIK -->
        <div class="grid md:grid-cols-2 gap-6 mt-6">
          <div class="bg-white p-4 rounded-xl shadow">
            <h2 class="font-semibold mb-2">Pengumpulan & Target Per Bulan</h2>
            <line-chart :chart-data="dataPengumpulan" />
          </div>
          <div class="bg-white p-4 rounded-xl shadow">
            <h2 class="font-semibold mb-2">Distribusi Per Kategori</h2>
            <bar-chart :chart-data="dataDistribusi" />
          </div>
        </div>

        <!-- TABEL DETAIL -->
        <div class="bg-white p-4 rounded-xl shadow mt-6 overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-left">Kategori</th>
                <th class="p-2 text-right">Target Pengumpulan</th>
                <th class="p-2 text-right">Realisasi Pengumpulan</th>
                <th class="p-2 text-right">Capaian</th>
                <th class="p-2 text-right">Target Distribusi</th>
                <th class="p-2 text-right">Realisasi Distribusi</th>
                <th class="p-2 text-right">Capaian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in kategoriData" :key="item.nama" class="border-b">
                <td class="p-2">{{ item.nama }}</td>
                <td class="p-2 text-right">{{ formatCurrency(item.targetPengumpulan) }}</td>
                <td class="p-2 text-right">{{ formatCurrency(item.realisasiPengumpulan) }}</td>
                <td class="p-2 text-right">{{ item.capaianPengumpulan }}%</td>
                <td class="p-2 text-right">{{ formatCurrency(item.targetDistribusi) }}</td>
                <td class="p-2 text-right">{{ formatCurrency(item.realisasiDistribusi) }}</td>
                <td class="p-2 text-right">{{ item.capaianDistribusi }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Halaman lain bisa ditambahkan serupa -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import LineChart from '@/components/chart/LineChart.vue';
// import BarChart from '@/components/chart/BarChart.vue';

const activeTab = ref<string>('beranda');

const totalPengumpulan = ref<number>(0);
const totalDistribusi = ref<number>(0);
const persentaseDistribusi = ref<number>(0);

// Format currency function
const formatCurrency = (value: number): string => {
  return 'Rp ' + value.toLocaleString('id-ID');
};

// TypeScript Interfaces
interface KategoriItem {
  nama: string;
  targetPengumpulan: number;
  realisasiPengumpulan: number;
  capaianPengumpulan: number;
  targetDistribusi: number;
  realisasiDistribusi: number;
  capaianDistribusi: number;
}

const kategoriData = ref<KategoriItem[]>([
  {
    nama: 'Infaq',
    targetPengumpulan: 0,
    realisasiPengumpulan: 0,
    capaianPengumpulan: 0,
    targetDistribusi: 0,
    realisasiDistribusi: 0,
    capaianDistribusi: 0,
  },
  {
    nama: 'Zakat',
    targetPengumpulan: 0,
    realisasiPengumpulan: 0,
    capaianPengumpulan: 0,
    targetDistribusi: 0,
    realisasiDistribusi: 0,
    capaianDistribusi: 0,
  },
  {
    nama: 'Donasi',
    targetPengumpulan: 0,
    realisasiPengumpulan: 0,
    capaianPengumpulan: 0,
    targetDistribusi: 0,
    realisasiDistribusi: 0,
    capaianDistribusi: 0,
  },
]);

interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string | string[];
  tension?: number;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

const dataPengumpulan = ref<ChartData>({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
  datasets: [
    {
      label: 'Realisasi',
      data: Array(12).fill(0),
      borderColor: 'green',
      backgroundColor: 'green',
      tension: 0.3,
    },
    {
      label: 'Target',
      data: Array(12).fill(0),
      borderColor: 'orange',
      backgroundColor: 'orange',
      tension: 0.3,
    },
  ],
});

const dataDistribusi = ref<ChartData>({
  labels: ['Zakat', 'Infaq', 'Donasi'],
  datasets: [
    { label: 'Distribusi', data: [0, 0, 0], backgroundColor: ['blue', 'green', 'orange'] },
  ],
});
</script>
