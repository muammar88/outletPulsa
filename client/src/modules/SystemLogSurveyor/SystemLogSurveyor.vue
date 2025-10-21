<script setup lang="ts">
// Library
import { onMounted, ref } from 'vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import Notification from '@/components/Modal/Notification.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';

// Service API
import { list } from '@/service/system_log_surveyor';

// State: Loading
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(4);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// State Data Surveyor
interface SurveyorLog {
  id: number;
  message: string;
  ip: string;
  nama_surveyor: string | null;
  createdAt: string;
  updatedAt: string;
}

// Function: fetch data
const search = ref('');
const dataSurveyorLog = ref<SurveyorLog[]>([]);

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await list({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    dataSurveyorLog.value = response.data;
    totalRow.value = response.total;
    console.log(dataSurveyorLog.value);
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal mengambil data surveyor', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari surveyor..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[20%] px-6 py-3 font-medium">Datetimes</th>
              <th class="w-[40%] px-6 py-3 font-medium">Message</th>
              <th class="w-[20%] px-6 py-3 font-medium">Surveyor</th>
              <th class="w-[20%] px-6 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="dataSurveyorLog.length > 0">
              <tr
                v-for="data in dataSurveyorLog"
                :key="data.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.createdAt }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.message }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.nama_surveyor }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.ip }}
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
                <p class="text-sm">Belum ada data.</p>
              </td>
            </tr>
          </tbody>

          <!-- Pagination -->
          <tfoot>
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
