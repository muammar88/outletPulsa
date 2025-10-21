<script setup lang="ts">
// Library
import { ref, onMounted, watch, computed } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import Pagination from '@/components/Pagination/Pagination.vue';

// Composable
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';

// Service API
import { get_laporan_asnaf, get_tahun, download_excel_asnaf } from '@/service/laporan_asnaf';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// State Data Laporan
const allLaporanRows = ref<(string | number)[][]>([]);
const paginatedLaporanData = ref<(string | number)[][]>([]);
const selectedTahun = ref('0'); // '0' untuk "Semua Tahun"
const tahunOptions = ref<{ value: string; text: string }[]>([
  { value: '0', text: 'Pilih Semua Tahun' },
]);
const asnafId = 3; // ID untuk Asnaf Muallaf

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: pagination
const itemsPerPage = ref<number>(10);
const totalColumns = ref<number>(7);

function updatePaginatedData() {
  isTableLoading.value = true;
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  paginatedLaporanData.value = allLaporanRows.value.slice(start, end);
  isTableLoading.value = false;
}

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(updatePaginatedData, { perPage: itemsPerPage.value });

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// Function: Fetch Tahun Options
async function fetchTahunOptions() {
  try {
    const response = await get_tahun();
    const years = response.data.data.map((year: string) => ({
      value: year,
      text: `Tahun ${year}`,
    }));
    tahunOptions.value = [{ value: '0', text: 'Pilih Semua Tahun' }, ...years];
  } catch (error) {
    displayNotification('Gagal mengambil data tahun', 'error');
  }
}

// Function: Fetch Data Laporan
async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_laporan_asnaf(selectedTahun.value, asnafId);
    const flattenedData = response.data.data.flatMap((group: any) => group.data);

    allLaporanRows.value = flattenedData;
    totalRow.value = flattenedData.length;
    updatePaginatedData();
  } catch (error) {
    allLaporanRows.value = [];
    totalRow.value = 0;
    paginatedLaporanData.value = [];

    console.error('Error fetching data:', error);

    if (error.response?.status !== 404) {
      if (error.request) {
        displayNotification('Tidak dapat terhubung ke server', 'error');
      } else {
        displayNotification('Terjadi kesalahan saat mengambil data', 'error');
      }
    }
  } finally {
    isTableLoading.value = false;
  }
}

// Function: Download Excel
async function downloadExcel() {
  try {
    const response = await download_excel_asnaf(selectedTahun.value, 'Muallaf');

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Asnaf_Muallaf_${selectedTahun.value}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
    displayNotification('Download berhasil', 'success');
  } catch (error) {
    console.error('Download error:', error);
    displayNotification('Gagal mendownload file', 'error');
  }
}

// Lifecycle Hooks
onMounted(async () => {
  isLoading.value = true;
  await fetchTahunOptions();
  await fetchData();
  isLoading.value = false;
});

// Watcher untuk memuat ulang data ketika tahun diganti
watch(selectedTahun, fetchData);
</script>

<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BaseButton @click="downloadExcel" variant="primary" type="button">
          <font-awesome-icon icon="fa-solid fa-download" class="mr-2" />
          Download Excel Asnaf Muallaf
        </BaseButton>
        <select
          v-model="selectedTahun"
          class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
        >
          <option v-for="option in tahunOptions" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow-md">
        <SkeletonTable v-if="isTableLoading" :columns="7" :rows="itemsPerPage" />
        <table v-else class="min-w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-100 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[10%] px-4 py-3 font-medium">Tanggal</th>
              <th class="w-[25%] px-4 py-3 font-medium">Uraian</th>
              <th class="w-[15%] px-4 py-3 font-medium">NIK</th>
              <th class="w-[20%] px-4 py-3 font-medium">Alamat</th>
              <th class="w-[5%] px-4 py-3 font-medium">Kec</th>
              <th class="w-[10%] px-4 py-3 font-medium">Kode Akun</th>
              <th class="w-[15%] px-4 py-3 font-medium">Kredit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <template v-if="paginatedLaporanData && paginatedLaporanData.length > 0">
              <tr
                v-for="(row, index) in paginatedLaporanData"
                :key="`${currentPage}-${index}`"
                class="hover:bg-gray-50 transition-colors text-gray-600"
              >
                <td class="px-4 py-3 text-center whitespace-nowrap">{{ row[1] }}</td>
                <td class="px-4 py-3 text-center">{{ row[2] }}</td>
                <td class="px-4 py-3 text-center">{{ row[3] }}</td>
                <td class="px-4 py-3 text-center">{{ row[4] }}</td>
                <td class="px-4 py-3 text-center">{{ row[5] }}</td>
                <td class="px-4 py-3 text-center">{{ row[6] }}</td>
                <td class="px-4 py-3 text-center whitespace-nowrap">{{ row[7] }}</td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-12 text-center text-gray-500">
                <font-awesome-icon
                  icon="fa-solid fa-database"
                  class="text-4xl mb-3 text-gray-400"
                />
                <h3 class="text-lg font-medium text-gray-800">
                  Laporan Penyaluran Asnaf Muallaf Tidak Ditemukan
                </h3>
                <p class="mt-1 text-sm">Silakan pilih tahun yang lain atau data belum tersedia.</p>
              </td>
            </tr>
          </tbody>
          <!-- Pagination -->
          <tfoot v-if="paginatedLaporanData && paginatedLaporanData.length > 0">
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
      :show-notification="showNotification"
      :notification-type="notificationType"
      :notification-message="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
