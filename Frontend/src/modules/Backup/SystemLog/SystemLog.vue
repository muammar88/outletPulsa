<script setup lang="ts">
import Pagination from '@/components/Pagination/Pagination.vue';
import { list } from '@/service/system_log';
import DangerButton from '@/components/Button/DangerButton.vue';
import SuccessButton from '@/components/Button/SuccessButton.vue';
import { computed, onMounted, ref } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';

interface Data {
  id: number;
  msg: string;
  ip: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

const searchQuery = ref('');
const data = ref<Data[]>([]);
const totalItems = ref(0);
const itemsPerPage = 10;
const currentPage = ref(1);
const totalPages = ref(1);

const fetchData = async () => {
  try {
    const response = await list({
      search: searchQuery.value,
      perpage: itemsPerPage,
      pageNumber: currentPage.value,
    });
    data.value = response.data;
    totalItems.value = response.total || response.data.length || 0;
    totalPages.value = Math.ceil(response.total / itemsPerPage);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const timeoutId = ref<number | null>(null);

const resetNotificationTimeout = () => {
  if (timeoutId.value) clearTimeout(timeoutId.value);
  timeoutId.value = window.setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref('');

const displayNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  resetNotificationTimeout();
};

const pages = computed<number[]>(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i + 1);
});
const totalColumns = 4; // karena table punya 5 kolom

const handlePrev = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const handleNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const handlePageNow = (page: number) => {
  currentPage.value = page;
};

onMounted(() => {
  fetchData();
});

const filterStatus = ref('');
const OptionFilter = [
  { id: 'verified', name: 'Approve' },
  { id: 'unverified', name: 'Reject' },
  { id: '', name: 'Semua' },
];

const showConfirmDialog = ref(false);
const confirmMessage = ref('');
const confirmTitle = ref('');
const confirmAction = ref<(() => void) | null>(null);

const showConfirmation = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title;
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <div class="flex justify-end items-center mb-5">
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Cari</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          v-model="searchQuery"
          @change="fetchData()"
          placeholder="Nama User . . . ."
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <table class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <!-- Header dengan grouping -->
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Datetimes</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Message</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">User</th>
            <th class="px-6 py-3 font-medium text-gray-900 text-center">Ip</th>
          </tr>
        </thead>
        <!-- Isi Data -->
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-for="(item, idx) in data" :key="item.id">
            <td class="px-3 py-2 text-center">
              {{
                new Date(item.createdAt).toISOString().slice(0, 10).split('-').reverse().join('-')
              }}
            </td>

            <td class="px-3 py-2 text-center">{{ item.msg }}</td>
            <td class="px-3 py-2 text-center">{{ item.name }}</td>
            <td class="px-3 py-2 text-center">{{ item.ip }}</td>
          </tr>
          <!-- Kalau data kosong -->
          <tr v-if="data.length === 0">
            <td :colspan="totalColumns" class="text-center py-6 text-gray-500">Data tidak ada</td>
          </tr>
        </tbody>

        <!-- Footer -->
        <tfoot class="bg-gray-100 font-bold">
          <Pagination
            :total-row="totalItems"
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
            @prev-page="handlePrev"
            @next-page="handleNext"
            @page-now="handlePageNow"
          />
        </tfoot>
      </table>
    </div>
  </div>

  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <button
      @click="confirmAction && confirmAction()"
      class="inline-flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Ya
    </button>
    <button
      @click="showConfirmDialog = false"
      class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
    >
      Tidak
    </button>
  </Confirmation>
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
