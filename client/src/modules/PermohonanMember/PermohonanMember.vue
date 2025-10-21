<script setup lang="ts">
import { ref, onMounted, computed, defineProps, defineEmits } from 'vue';
import {
  get_info,
  get_desc,
  get_kriteria,
  get_syarat,
  get_lokasi,
} from '@/service/permohonan_member';
import FormAdd from './widgets/FormAdd.vue';

import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

const props = defineProps({
  idKegiatan: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['back']);

interface Lokasi {
  id: number;
  name: string;
}

interface Info {
  jumlah_realisasi: number;
  orang_terbantu: number;
  jumlah_permohonan: number;
  jumlah_penerima: number;
}

interface Description {
  id: number;
  nama_kegiatan: string;
  banner: string;
  desc: string;
}

interface Kriteria {
  id: number;
  name: string;
}

interface Syarat {
  id: number;
  name: string;
}

const activeTab = ref<'deskripsi' | 'syarat' | 'kriteria' | 'area'>('deskripsi');
const info = ref<Info | null>(null);
const description = ref<Description | null>(null);
const kriteria = ref<Kriteria[]>([]);
const syarat = ref<Syarat[]>([]);
const lokasi = ref<Lokasi[]>([]);
const imageError = ref(false);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;

    // Fetch info program
    const infoResponse = await get_info({ kegiatan_id: props.idKegiatan });
    info.value = infoResponse?.data || null;

    // Fetch description
    const descResponse = await get_desc({ kegiatan_id: props.idKegiatan });
    description.value = descResponse?.data || null;

    // Fetch kriteria
    const kriteriaResponse = await get_kriteria({ kegiatan_id: props.idKegiatan });
    kriteria.value = Array.isArray(kriteriaResponse?.data) ? kriteriaResponse.data : [];

    // Fetch syarat
    const syaratResponse = await get_syarat({ kegiatan_id: props.idKegiatan });
    syarat.value = Array.isArray(syaratResponse?.data) ? syaratResponse.data : [];

    const lokasiResponse = await get_lokasi({ kegiatan_id: props.idKegiatan });
    console.log('lokasiResponse:', lokasiResponse);

    let dataLokasi = [];

    // kalau ada data array di lokasiResponse.data
    if (Array.isArray(lokasiResponse?.data)) {
      dataLokasi = lokasiResponse.data;

      // kalau langsung objek tunggal (bukan array)
    } else if (lokasiResponse?.data && typeof lokasiResponse.data === 'object') {
      dataLokasi = [lokasiResponse.data];

      // kalau respon langsung objek tunggal tanpa "data"
    } else if (lokasiResponse && typeof lokasiResponse === 'object' && !lokasiResponse.data) {
      dataLokasi = [lokasiResponse];
    }

    lokasi.value = dataLokasi;
    console.log('lokasi.value setelah assign:', lokasi.value);

    loading.value = false;
  } catch (error) {
    console.error('Error fetching program data:', error);
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

const handleImageError = () => {
  imageError.value = true;
};

const bannerUrl = computed(() => {
  if (!description.value?.banner) return '';
  return `${BASE_URL}/uploads/img/program_kegiatan_bantuan/${description.value.banner}`;
});

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

const isModalAddOpen = ref(false);
const selectedKegiatan = ref();
function openModalAdd(id: number) {
  isModalAddOpen.value = true;
  selectedKegiatan.value = id;
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700 mx-auto"></div>
        <p class="mt-4 text-gray-600">Memuat data...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header dengan Judul Program -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 text-center uppercase tracking-wide">
          {{ description?.nama_kegiatan || 'Program Bantuan' }}
        </h1>
      </div>

      <!-- Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kolom Kiri: Banner -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Banner Image -->
            <div class="w-full h-96 bg-gray-100 flex items-center justify-center">
              <img
                v-if="bannerUrl && !imageError"
                :src="bannerUrl"
                alt="Banner Program"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div
                v-else
                class="w-full h-full bg-gray-300 flex flex-col items-center justify-center text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-20 h-20 mb-3"
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
                <span class="text-lg font-medium">Gambar tidak ditemukan</span>
              </div>
            </div>

            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-200">
              <button
                @click="activeTab = 'deskripsi'"
                :class="[
                  'flex-1 py-4 px-6 text-center font-medium transition-colors',
                  activeTab === 'deskripsi'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                Deskripsi
              </button>
              <button
                @click="activeTab = 'syarat'"
                :class="[
                  'flex-1 py-4 px-6 text-center font-medium transition-colors',
                  activeTab === 'syarat'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                Syarat
              </button>
              <button
                @click="activeTab = 'kriteria'"
                :class="[
                  'flex-1 py-4 px-6 text-center font-medium transition-colors',
                  activeTab === 'kriteria'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                Kriteria
              </button>
              <button
                @click="activeTab = 'area'"
                :class="[
                  'flex-1 py-4 px-6 text-center font-medium transition-colors',
                  activeTab === 'area'
                    ? 'text-green-700 border-b-2 border-green-700'
                    : 'text-gray-600 hover:text-gray-900',
                ]"
              >
                Area Penyaluran
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- Deskripsi Tab -->
              <div v-if="activeTab === 'deskripsi'" class="text-gray-700 leading-relaxed">
                <p v-if="description?.desc">{{ description.desc }}</p>
                <p v-else class="text-gray-400 italic">Belum ada deskripsi</p>
              </div>

              <!-- Syarat Tab -->
              <div v-if="activeTab === 'syarat'">
                <ul v-if="syarat.length > 0" class="space-y-3">
                  <li
                    v-for="(item, index) in syarat"
                    :key="index"
                    class="flex items-start space-x-3"
                  >
                    <span
                      class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="text-gray-700 leading-relaxed">{{ item.name }}</span>
                  </li>
                </ul>
                <p v-else class="text-gray-400 italic">Belum ada syarat</p>
              </div>

              <!-- Kriteria Tab -->
              <div v-if="activeTab === 'kriteria'">
                <ul v-if="kriteria.length > 0" class="space-y-3">
                  <li
                    v-for="(item, index) in kriteria"
                    :key="index"
                    class="flex items-start space-x-3"
                  >
                    <span
                      class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="text-gray-700 leading-relaxed">{{ item.name }}</span>
                  </li>
                </ul>
                <p v-else class="text-gray-400 italic">Belum ada kriteria</p>
              </div>

              <!-- Area Penyaluran Tab -->
              <div v-if="activeTab === 'area'" class="text-gray-700">
                <ul v-if="lokasi.length > 0" class="space-y-3">
                  <li
                    v-for="(item, index) in lokasi"
                    :key="index"
                    class="flex items-start space-x-3"
                  >
                    <span
                      class="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-sm font-semibold"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="text-gray-700 leading-relaxed">{{ item.name }}</span>
                  </li>
                </ul>
                <p v-else class="text-gray-400 italic">Belum ada area penyaluran</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Info Card -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <!-- Realisasi -->
            <div class="mb-6">
              <h3 class="text-3xl font-bold text-gray-900">
                {{ info ? formatRupiah(info.jumlah_realisasi) : 'Rp 0' }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">Jumlah Realisasi</p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <!-- Jumlah Pemohon -->
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900">
                  {{ info?.jumlah_permohonan || 0 }} Orang
                </p>
                <p class="text-xs text-gray-600 mt-1">Jumlah Pemohon</p>
              </div>

              <!-- Jumlah Penerima -->
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900">
                  {{ info?.jumlah_penerima || 0 }} Orang
                </p>
                <p class="text-xs text-gray-600 mt-1">Jumlah Penerima</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                @click="isModalAddOpen = true"
                class="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Ajukan Permohonan Bantuan
              </button>

              <button
                @click="emit('back')"
                class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <FormAdd
    :is-modal-open="isModalAddOpen"
    :id_kegiatan="idKegiatan"
    @close="
      isModalAddOpen = false;
      fetchData();
    "
    @status="
      (payload: any) =>
        displayNotification(
          payload.error_msg || 'Tambah/Update Bank gagal',
          payload.error ? 'error' : 'success',
        )
    "
  />
</template>
