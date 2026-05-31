<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  detail_donasi,
  daftar_donatur,
  konfirmasi,
  riwayat_donasi_user,
} from '@/service/donasi_member';

import { useNotification } from '@/composables/useNotification';
import FormAdd from './FormAdd.vue';
import FormConfirm from './FormConfirm.vue';
import Notification from '@/components/Modal/Notification.vue';

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

const props = defineProps({
  idKegiatan: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['back']);

interface DetailProgram {
  id: number;
  name: string;
  banner: string;
  deskripsi: string;
  waktu_donasi: number;
  target_donasi_terkumpul: number;
  total_donasi: number;
  total_donatur: number;
  status: string;
}

interface Donatur {
  member_id: number;
  id: number;
  name: string;
  nominal: number;
  waktu_donasi: string;
}

interface RiwayatDonasi {
  id: number;
  invoice: string;
  nominal: number;
  status: string;
  waktu_donasi: Date;
}

const RiwayatDonasi = ref<RiwayatDonasi[]>([]);
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const detailProgram = ref<DetailProgram | null>(null);
const daftarDonatur = ref<Donatur[]>([]);
const loadingDetail = ref(false);
const loadingDonatur = ref(false);
const loadingRiwayat = ref(false);
const imageError = ref(false);

// Pagination untuk donatur
const currentPageDonatur = ref(1);
const perPageDonatur = ref(5);
const totalDonatur = ref(0);
const totalPagesDonatur = ref(1);

// Pagination untuk riwayat donasi user
const currentPageRiwayat = ref(1);
const perPageRiwayat = ref(5);
const totalRiwayat = ref(0);
const totalPagesRiwayat = ref(1);

const fetchDetailProgram = async () => {
  loadingDetail.value = true;
  try {
    const response = await detail_donasi({ program_donasi_id: props.idKegiatan });
    detailProgram.value = response || null;
  } catch (error) {
    console.error('Error fetching detail program:', error);
    detailProgram.value = null;
  } finally {
    loadingDetail.value = false;
  }
};

const fetchDaftarDonatur = async () => {
  loadingDonatur.value = true;
  try {
    const response = await daftar_donatur({
      program_donasi_id: props.idKegiatan,
      pageNumber: currentPageDonatur.value,
      perpage: perPageDonatur.value,
    });

    daftarDonatur.value = Array.isArray(response.data) ? response.data : [];

    // Gunakan total dari response API
    const dataDonatur = response?.data || [];

    // Ambil cuma donatur unik berdasarkan member_id
    const donaturUnik = dataDonatur.filter(
      (item: any, index: any, self: any) =>
        index === self.findIndex((t) => t.member_id === item.member_id),
    );

    // Total donatur = jumlah donatur unik
    totalDonatur.value = response?.total?.jumlah_donatur || donaturUnik.length;
    totalPagesDonatur.value = response?.total_page || 1;
  } catch (error) {
    console.error('Error fetching daftar donatur:', error);
    daftarDonatur.value = [];
  } finally {
    loadingDonatur.value = false;
  }
};

const status_konfirmasi = ref(false);
const isModalConfirmOpen = ref(false);

const fetchStatus = async () => {
  try {
    const response = await konfirmasi({ program_donasi_id: props.idKegiatan });
    status_konfirmasi.value = response.status;
  } catch (error) {
    console.error('Error fetching status:', error);
  }
};

const fetchRiwayatDonasi = async () => {
  loadingRiwayat.value = true;
  try {
    const response = await riwayat_donasi_user({
      program_donasi_id: props.idKegiatan,
      pageNumber: currentPageRiwayat.value,
      perpage: perPageRiwayat.value,
    });

    RiwayatDonasi.value = Array.isArray(response.data) ? response.data : [];

    // Gunakan total dari response API
    totalRiwayat.value = response?.total || 0;
    totalPagesRiwayat.value = response?.total_page || 1;
  } catch (error) {
    console.error('Error fetching riwayat donasi:', error);
  } finally {
    loadingRiwayat.value = false;
  }
};

onMounted(() => {
  fetchRiwayatDonasi();
  fetchDetailProgram();
  fetchDaftarDonatur();
  fetchStatus();
});

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

const formatTanggal = (tanggal: string) => {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const calculatePercentage = () => {
  if (!detailProgram.value || !detailProgram.value.target_donasi_terkumpul) return 0;
  const percentage =
    (detailProgram.value.total_donasi / detailProgram.value.target_donasi_terkumpul) * 100;
  return Math.min(percentage, 100);
};

// Pagination untuk daftar donatur
const nextPageDonatur = () => {
  if (currentPageDonatur.value < totalPagesDonatur.value) {
    currentPageDonatur.value++;
    fetchDaftarDonatur();
  }
};

const prevPageDonatur = () => {
  if (currentPageDonatur.value > 1) {
    currentPageDonatur.value--;
    fetchDaftarDonatur();
  }
};

// Pagination untuk riwayat donasi user
const nextPageRiwayat = () => {
  if (currentPageRiwayat.value < totalPagesRiwayat.value) {
    currentPageRiwayat.value++;
    fetchRiwayatDonasi();
  }
};

const prevPageRiwayat = () => {
  if (currentPageRiwayat.value > 1) {
    currentPageRiwayat.value--;
    fetchRiwayatDonasi();
  }
};

const isModalAddOpen = ref(false);
const selectedDonasi = ref<any>(null);

function openModalAdd(id: number) {
  isModalAddOpen.value = true;
  selectedDonasi.value = id;
}

function openModalConfirmById(id: number) {
  isModalConfirmOpen.value = true;
  selectedDonasi.value = id;
}

function openModalConfirmByInvoice(invoice: string) {
  isModalConfirmOpen.value = true;
  selectedDonasi.value = invoice;
}

const handleImageError = () => {
  imageError.value = true;
};
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <button
      @click="emit('back')"
      class="mb-6 flex items-center gap-2 text-green-700 hover:text-green-900 font-medium transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Kembali ke Daftar Program
    </button>

    <div v-if="loadingDetail" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
    </div>

    <div v-else-if="detailProgram" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="w-full h-96 bg-gray-200 relative">
            <img
              v-if="detailProgram.banner && !imageError"
              :src="`${BASE_URL}/uploads/img/program_donasi/${detailProgram.banner}`"
              alt="Banner Program"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <div
              v-else
              class="w-full h-full bg-gray-300 flex flex-col items-center justify-center text-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-20 h-20 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-sm">Gambar tidak tersedia</span>
            </div>
          </div>

          <div class="p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {{ detailProgram.name }}
            </h1>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Sisa Waktu</p>
                    <p class="font-bold text-blue-700 text-lg">
                      {{ detailProgram.waktu_donasi || 0 }} Hari
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Total Donatur</p>
                    <p class="font-bold text-green-700 text-lg">{{ totalDonatur }} Orang</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-8 bg-gray-50 p-6 rounded-lg">
              <div class="flex justify-between items-center mb-3">
                <span class="text-gray-700 font-medium">Dana Terkumpul</span>
                <span class="font-bold text-green-700 text-lg"
                  >{{ calculatePercentage().toFixed(1) }}%</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-4">
                <div
                  class="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500 rounded-full"
                  :style="{ width: `${calculatePercentage()}%` }"
                ></div>
              </div>
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Terkumpul</p>
                  <p class="text-xl font-bold text-green-700">
                    {{ formatRupiah(detailProgram.total_donasi || 0) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500 mb-1">Target</p>
                  <p class="text-xl font-bold text-gray-700">
                    {{ formatRupiah(detailProgram.target_donasi_terkumpul || 0) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Deskripsi Program
              </h2>
              <div class="text-gray-700 leading-relaxed whitespace-pre-line">
                {{ detailProgram.deskripsi || 'Tidak ada deskripsi untuk program ini.' }}
              </div>
            </div>

            <button
              v-if="status_konfirmasi === false"
              @click="openModalAdd(props.idKegiatan)"
              class="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Donasi Sekarang
            </button>

            <button
              v-else
              @click="openModalConfirmById(props.idKegiatan)"
              class="w-full mt-8 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-bold py-4 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-green-900 mb-5 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Riwayat Donasi
          </h2>

          <div v-if="loadingDonatur" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>

          <div
            v-else-if="daftarDonatur.length > 0"
            class="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100"
          >
            <div
              v-for="donatur in daftarDonatur"
              :key="donatur.id"
              class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-gray-50"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold flex-shrink-0"
                >
                  {{ donatur.name.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 text-sm truncate">{{ donatur.name }}</h3>
                  <p class="text-xs text-gray-500">{{ formatTanggal(donatur.waktu_donasi) }}</p>
                  <p class="font-bold text-green-700 text-sm mt-1">
                    {{ formatRupiah(donatur.nominal) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p class="text-sm font-medium">Belum ada donatur</p>
          </div>

          <div
            v-if="totalDonatur > perPageDonatur"
            class="flex justify-between items-center mt-4 pt-4"
          >
            <button
              @click="prevPageDonatur"
              :disabled="currentPageDonatur === 1"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              :class="
                currentPageDonatur === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-700 hover:bg-green-100'
              "
            >
              ← Prev
            </button>

            <span class="text-xs text-gray-600">
              {{ currentPageDonatur }} / {{ totalPagesDonatur }}
            </span>

            <button
              @click="nextPageDonatur"
              :disabled="currentPageDonatur === totalPagesDonatur"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              :class="
                currentPageDonatur === totalPagesDonatur
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-700 hover:bg-green-100'
              "
            >
              Next →
            </button>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-blue-900 mb-5 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Riwayat Donasi Anda
          </h2>

          <div v-if="loadingRiwayat" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>

          <div
            v-else-if="RiwayatDonasi.length > 0"
            class="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100"
          >
            <div
              v-for="donasi in RiwayatDonasi"
              :key="donasi.id"
              class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-medium text-gray-500">Invoice:</span>
                    <span class="text-xs font-semibold text-blue-700">{{ donasi.invoice }}</span>
                  </div>
                  <h3 class="font-bold text-gray-900 text-base mb-1">
                    {{ formatRupiah(donasi.nominal) }}
                  </h3>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-yellow-100 text-yellow-800': donasi.status === 'pending',
                        'bg-green-100 text-green-800': donasi.status === 'success',
                        'bg-red-100 text-red-800': donasi.status === 'failed',
                        'bg-blue-100 text-blue-800': donasi.status === 'processing',
                      }"
                    >
                      {{ donasi.status }}
                    </span>
                    <span class="text-xs text-gray-400">
                      {{ formatTanggal(donasi.waktu_donasi) }}
                    </span>
                  </div>
                </div>
                <button
                  @click="openModalConfirmByInvoice(donasi.invoice)"
                  class="flex-shrink-0 p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors group"
                  title="Lihat Detail"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-10 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p class="text-sm font-medium">Belum ada riwayat donasi</p>
            <p class="text-xs mt-1">Mulai berdonasi untuk program ini</p>
          </div>

          <div
            v-if="totalRiwayat > perPageRiwayat"
            class="flex justify-between items-center mt-4 pt-4"
          >
            <button
              @click="prevPageRiwayat"
              :disabled="currentPageRiwayat === 1"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              :class="
                currentPageRiwayat === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-700 hover:bg-blue-100'
              "
            >
              ← Prev
            </button>

            <span class="text-xs text-gray-600">
              {{ currentPageRiwayat }} / {{ totalPagesRiwayat }}
            </span>

            <button
              @click="nextPageRiwayat"
              :disabled="currentPageRiwayat === totalPagesRiwayat"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              :class="
                currentPageRiwayat === totalPagesRiwayat
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-700 hover:bg-blue-100'
              "
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-500">Data program tidak ditemukan</p>
    </div>
  </div>

  <FormAdd
    :is-modal-open="isModalAddOpen"
    :selected_donasi="selectedDonasi"
    @close="
      isModalAddOpen = false;
      fetchDetailProgram();
      fetchDaftarDonatur();
      fetchRiwayatDonasi();
      fetchStatus();
    "
    @status="
      (payload: any) =>
        displayNotification(
          payload.error_msg || 'Tambah Donasi gagal',
          payload.error ? 'error' : 'success',
        )
    "
  />

  <FormConfirm
    :is-modal-open="isModalConfirmOpen"
    :selected_donasi="selectedDonasi"
    @close="
      isModalConfirmOpen = false;
      fetchDetailProgram();
      fetchDaftarDonatur();
      fetchRiwayatDonasi();
      fetchStatus();
    "
    @status="
      (payload: any) =>
        displayNotification(
          payload.error_msg || 'Konfirmasi pembayaran gagal',
          payload.error ? 'error' : 'success',
        )
    "
  />

  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
