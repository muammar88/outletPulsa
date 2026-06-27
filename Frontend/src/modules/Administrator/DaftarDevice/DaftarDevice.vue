<script setup lang="ts">
import { ref } from 'vue';
import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';
import { useConfirmation } from '@/composables/useConfirmation';
import { deviceService, type Device } from '@/service/administrator/device';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
import LightButton from '@/components/Button/LightButton.vue';

// Modal
import DaftarDeviceDetailModal from '@/modules/Administrator/DaftarDevice/components/DaftarDeviceDetailModal.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';

// Notification
import Notification from '@/components/Modal/Notification.vue';

// Icon
import IconEye from '@/components/Icons/IconEye.vue';
import IconTrash from '@/components/Icons/IconTrash.vue';

// Definisi Kolom Tabel
const tableColumns = [
  {
    key: 'device_name',
    label: 'Nama Device',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'platform_info',
    label: 'Platform',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'app_version',
    label: 'Versi App',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
  {
    key: 'member_info',
    label: 'Pemilik',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'last_login',
    label: 'Last Login',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'status',
    label: 'Status',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
];

const dataDevice = ref<Device[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Modal State
const showDetailModal = ref(false);
const selectedDevice = ref<Device | null>(null);

// Composable Setup
const {
  showNotification,
  notificationMessage,
  notificationType,
  displayNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Inisialisasi Composable Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 10, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await deviceService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataDevice.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data:', error);
  } finally {
    isLoading.value = false;
  }
};

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const handleDetail = async (row: Device) => {
  try {
    const response = await deviceService.getById(row.id!);
    selectedDevice.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    console.error('Gagal mengambil detail device:', error);
  }
};

const handleDelete = (row: Device) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus device <strong>${row.device_name || 'Tidak Bernama'}</strong>?`,
    async () => {
      try {
        await deviceService.delete(row.id!);
        displayNotification('Device berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus device', 'error');
        console.error('Error saat menghapus device:', error);
      }
    },
  );
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

fetchData();
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <!-- Header Page -->
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
          Daftar Device
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
          Manajemen Data Device
          </p>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :columns="tableColumns"
        :data="dataDevice"
        :loading="isLoading"
        :pagination="paginationProps"
        search-placeholder="Cari nama device, merk, atau pemilik..."
        :show-add="false"
        :show-numbering="false"
        :show-actions="false"
        @search="fetchData"
        @page-change="currentPage = $event"
        @fetch-data="fetchData"
      >
        <template #custom-actions>
          <button
            @click="fetchData()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </template>
        <template #cell-device_name="{ row }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">{{ row.device_name || '-' }}</div>
              <div class="text-xs text-gray-500">Kode: <span class="font-mono text-[10px]">{{ row.device_code.substring(0, 8) }}...</span></div>
            </div>
          </div>
        </template>

        <template #cell-platform_info="{ row }">
          <div class="text-sm text-gray-900">{{ row.device_brand || '-' }} {{ row.device_model || '' }}</div>
          <div class="text-xs text-gray-500">{{ row.os_name || '-' }} {{ row.os_version || '' }}</div>
        </template>

        <template #cell-app_version="{ row }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ row.app_version || 'Unknown' }}
          </span>
        </template>

        <template #cell-member_info="{ row }">
          <div v-if="row.member">
            <div class="text-sm font-medium text-gray-900">{{ row.member.fullname }}</div>
            <div class="text-xs text-gray-500">{{ row.member.whatsappnumber }}</div>
          </div>
          <div v-else class="text-sm text-gray-400 italic">Tidak ada info</div>
        </template>

        <template #cell-last_login="{ row }">
          <div class="text-sm text-gray-900">{{ formatDate(row.last_login) }}</div>
        </template>

        <template #cell-status="{ row }">
          <span :class="[
              'px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center',
              row.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            ]">
            <span :class="[
              'w-1.5 h-1.5 rounded-full mr-1.5',
              row.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-500'
            ]"></span>
            {{ row.status }}
          </span>
        </template>

        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-2">
            <LightButton @click="handleDetail(row)" class="p-1.5" title="Detail">
              <IconEye class="w-4 h-4 text-blue-600" />
            </LightButton>
            <LightButton @click="handleDelete(row)" class="p-1.5" title="Hapus">
              <IconTrash class="w-4 h-4 text-red-600" />
            </LightButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modals -->
    <DaftarDeviceDetailModal
      :show="showDetailModal"
      :device="selectedDevice"
      @close="showDetailModal = false"
    />

    <Confirmation
      :show-confirm-dialog="showConfirmDialog"
      :confirm-title="confirmTitle"
      :confirm-message="confirmMessage"
      @cancel="cancel"
      @confirm="confirm"
    />

    <Notification
      :show="showNotification"
      :type="notificationType"
      :message="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
