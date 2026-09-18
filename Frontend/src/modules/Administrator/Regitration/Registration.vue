<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
// Button
import DangerButton from '@/components/Button/DangerButton.vue';
// Icon
import IconDelete from '@/components/Icons/IconDelete.vue';
import { registrationService } from '@/service/administrator/registration';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Definisi Kolom Tabel
const tableColumns = [
  {
    key: 'device_code',
    label: 'Device Code',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-mono text-xs text-gray-500',
  },
  {
    key: 'fullname',
    label: 'Nama Lengkap',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'whatsapp',
    label: 'No WhatsApp',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'created_at',
    label: 'Tanggal Registrasi',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'status',
    label: 'Status',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataRegistration = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

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
    const response = await registrationService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataRegistration.value = response.data.data.list;
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

const confirmButtonText = ref('Hapus');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const handleDelete = (row: any) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus data registrasi untuk <strong>${row.whatsapp}</strong>?`,
    async () => {
      try {
        await registrationService.delete(row.id);
        displayNotification('Data registrasi berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus data registrasi', 'error');
        console.error('Error saat menghapus registrasi:', error);
      }
    },
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Registration
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Data Registrasi Pengguna
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataRegistration"
        :loading="isLoading"
        :pagination="paginationProps"
        search-placeholder="Cari (whatsapp, nama)..."
        @search="fetchData"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showAdd="false"
      >
        <template #cell-device_code="{ row }">
          <span class="font-semibold text-slate-700">{{ row.device_code }}</span>
        </template>

        <template #cell-fullname="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-800">{{ row.fullname || '-' }}</span>
          </div>
        </template>
        
        <template #cell-whatsapp="{ row }">
          <span class="text-sm font-semibold text-gray-800">{{ row.whatsapp }}</span>
        </template>
        
        <template #cell-created_at="{ row }">
          <span class="text-sm text-gray-600">{{ formatDate(row.created_at) }}</span>
        </template>

        <template #cell-status="{ row }">
          <div class="flex justify-center items-center">
            <span 
              class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border shadow-sm"
              :class="row.status === 'regitrated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
            >
              {{ row.status === 'regitrated' ? 'Registered' : 'Unregistered' }}
            </span>
          </div>
        </template>

        <!-- Kolom Action -->
        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <DangerButton @click="handleDelete(row)" title="Hapus Data"
              ><IconDelete
            /></DangerButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Notification Modal -->
    <Notification
      :show-notification="showNotification"
      :notification-type="notificationType"
      :notification-message-html="notificationMessage"
      @close="hideNotification"
    />

    <!-- Confirmation Modal -->
    <Confirmation
      :show-confirm-dialog="showConfirmDialog"
      :confirm-title="confirmTitle"
      :confirm-message="confirmMessage"
    >
      <button
        @click="cancel"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        Batal
      </button>
      <button
        @click="confirm"
        :class="['rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none', confirmButtonClass]"
      >
        {{ confirmButtonText }}
      </button>
    </Confirmation>
  </div>
</template>
