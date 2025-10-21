<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { daftar_donasi } from '@/service/donasi_member';
import DetailDonasi from './widgets/DetailDonasi.vue';

import { useNotification } from '@/composables/useNotification';
import FormAdd from './widgets/FormAdd.vue';

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

const props = defineProps({
  programName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['back']);

interface Program {
  id: number;
  name: string;
  banner: string;
  waktu_donasi: number;
  total_nominal: number;
}

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const isModalAddOpen = ref(false);
const data = ref<Program[]>([]);
const totalEntries = ref(0);
const currentPage = ref(1);
const perPage = ref(8);
const totalPages = ref(1);
const imageErrors = ref<Set<number>>(new Set());

// State untuk menampilkan PermohonanMember
const showPermohonan = ref(false);
const selectedIdKegiatan = ref<number | null>(null);

const normalizeResponseData = (respData: any): Program[] => {
  if (!respData) return [];
  if (Array.isArray(respData)) {
    return respData.filter((i) => i && Object.keys(i).length > 0);
  }
  if (typeof respData === 'object' && Object.keys(respData).length > 0) {
    return [respData];
  }
  return [];
};

const fetchData = async () => {
  try {
    const response = await daftar_donasi({
      name: props.programName,
      page: currentPage.value,
      perpage: perPage.value,
    });

    const normalized = normalizeResponseData(response?.data);
    const totalFromApi = Number(response?.total?.jumlah_kegiatan ?? NaN);
    totalEntries.value = Number.isFinite(totalFromApi) ? totalFromApi : normalized.length;

    totalPages.value = totalEntries.value > 0 ? Math.ceil(totalEntries.value / perPage.value) : 1;

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
      if (totalEntries.value > 0) {
        return fetchData();
      }
    }

    data.value = normalized;
    imageErrors.value.clear();
  } catch (error) {
    console.error('Error fetching data:', error);
    data.value = [];
    totalEntries.value = 0;
    totalPages.value = 1;
  }
};

onMounted(fetchData);

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData();
  }
};

const goToPage = (page: number) => {
  if (page !== currentPage.value) {
    currentPage.value = page;
    fetchData();
  }
};

const handleImageError = (index: number) => {
  imageErrors.value.add(index);
};

// Handler untuk tombol Detail Program
const openDetailProgram = (idKegiatan: number) => {
  selectedIdKegiatan.value = idKegiatan;
  showPermohonan.value = true;
};

// Handler untuk kembali dari PermohonanMember
const handleBackFromPermohonan = () => {
  showPermohonan.value = false;
  selectedIdKegiatan.value = null;
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);

function openModalAdd() {
  isModalAddOpen.value = true;
}
</script>

<template>
  <!-- Tampilkan PermohonanMember jika showPermohonan true -->
  <DetailDonasi
    v-if="showPermohonan"
    :id-kegiatan="selectedIdKegiatan!"
    @back="handleBackFromPermohonan"
  />

  <!-- Tampilkan list program jika showPermohonan false -->
  <div v-else class="p-6 bg-white rounded-lg shadow-lg">
    <!-- Judul -->
    <h2 class="text-2xl font-extrabold text-green-900 mb-6 text-center uppercase tracking-wide">
      DAFTAR PROGRAM DONASI
    </h2>

    <!-- Card List - Grid 4 kolom x 2 baris -->
    <div v-if="data.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col"
      >
        <!-- Banner -->
        <div class="w-full h-44 bg-gray-100 flex items-center justify-center relative">
          <img
            v-if="item.banner && !imageErrors.has(index)"
            :src="`${BASE_URL}/uploads/img/program_kegiatan_bantuan/${item.banner}`"
            alt="Banner Program"
            class="w-full h-full object-cover"
            @error="handleImageError(index)"
          />
          <div
            v-else
            class="w-full h-full bg-gray-300 flex flex-col items-center justify-center text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-12 h-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16l5-5 4 4 5-5 4 4" />
            </svg>
            <span class="text-sm font-medium">Gambar tidak ditemukan</span>
          </div>
        </div>

        <!-- Konten -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-semibold text-base text-gray-800 mb-3 leading-snug line-clamp-2">
              {{ item.name }}
            </h3>

            <!-- Orang Terbantu -->
            <div class="flex items-center text-sm text-gray-600 mb-3 space-x-2">
              <span class="font-semibold text-gray-800">{{ item.waktu_donasi }}</span>
              <span>Hari Lagi:</span>
            </div>

            <!-- Realisasi -->
            <div class="flex items-center text-sm text-gray-700 mt-1 space-x-2">
              <font-awesome-icon class="fa-solid fa-money text-yellow-500 text-base" />
              <span class="font-medium">Terkumpul:</span>
              <span class="font-semibold text-green-700">{{
                formatRupiah(item.total_nominal)
              }}</span>
            </div>
          </div>

          <button
            @click="openDetailProgram(item.id)"
            class="mt-5 bg-green-600 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-green-700 transition-all duration-200"
          >
            Detail Program
          </button>
        </div>
      </div>
    </div>

    <!-- No Data -->
    <div v-else class="text-center text-gray-500 mt-10">Belum ada data kegiatan</div>

    <!-- Pagination -->
    <div
      v-if="totalEntries > 0"
      class="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4"
    >
      <!-- Pagination Buttons -->
      <div
        class="flex items-center justify-center gap-2 bg-gray-50 px-4 py-2 rounded-xl shadow-sm border border-gray-200"
      >
        <!-- Tombol Prev -->
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-700 hover:bg-green-100'
          "
        >
          ← Prev
        </button>

        <!-- Nomor Halaman -->
        <div class="flex items-center gap-1">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            class="w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-lg transition-all duration-200"
            :class="
              page === currentPage
                ? 'bg-green-700 text-white shadow-md'
                : 'text-gray-700 hover:bg-green-100'
            "
          >
            {{ page }}
          </button>
        </div>

        <!-- Tombol Next -->
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-700 hover:bg-green-100'
          "
        >
          Next →
        </button>
      </div>

      <!-- Total Entries (kanan) -->
      <p class="text-gray-500 text-sm sm:text-right w-full sm:w-auto">
        Total Entries:
        <span class="font-semibold text-gray-800">{{ totalEntries }}</span>
      </p>
    </div>
  </div>
</template>
