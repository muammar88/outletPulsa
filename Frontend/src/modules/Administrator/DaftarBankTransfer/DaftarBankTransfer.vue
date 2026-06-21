<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal Page
import BankTransferFormModal from './components/BankTransferFormModal.vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
// Button
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
// Icon
import IconDelete from '@/components/Icons/IconDelete.vue';
import IconEdit from '@/components/Icons/IconEdit.vue';
import { bankTransferOutletService, type BankTransferOutlet } from '@/service/administrator/bank-transfer-outlet';

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } = useConfirmation();

const confirmButtonText = ref('Ya, Lanjutkan');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const tableColumns = [
  {
    key: 'bank',
    label: 'Bank',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left',
  },
  {
    key: 'accountName',
    label: 'Nama Rekening',
    headerClass: 'text-left w-[30%]',
    cellClass: 'text-left font-bold text-gray-800',
  },
  {
    key: 'accountNumber',
    label: 'Nomor Rekening',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left text-gray-700 font-mono tracking-wider',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[20%]',
    cellClass: 'text-center',
  },
];

const searchQuery = ref('');

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchBankTransfers(),
  { perPage: 10, totalRow: 0 },
);

const bankTransfers = ref<BankTransferOutlet[]>([]);
const isLoading = ref(false);
const isModalOpen = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const selectedOutlet = ref<BankTransferOutlet | null>(null);

const fetchBankTransfers = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await bankTransferOutletService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value
    );
    bankTransfers.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    displayNotification('Gagal mengambil data daftar bank transfer.', 'error');
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

const openAddModal = () => {
  modalMode.value = 'add';
  selectedOutlet.value = null;
  isModalOpen.value = true;
};

const openEditModal = (outlet: BankTransferOutlet) => {
  modalMode.value = 'edit';
  selectedOutlet.value = { ...outlet };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedOutlet.value = null;
};

const onFormSubmit = () => {
  displayNotification(
    modalMode.value === 'add'
      ? 'Bank transfer berhasil ditambahkan'
      : 'Bank transfer berhasil diperbarui',
    'success'
  );
  fetchBankTransfers();
};

const handleDelete = (outlet: BankTransferOutlet) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Hapus Rekening',
    `Apakah Anda yakin ingin menghapus rekening "${outlet.accountName} - ${outlet.accountNumber}"? Aksi ini tidak dapat dibatalkan.`,
    async () => {
      try {
        await bankTransferOutletService.delete(outlet.id!);
        displayNotification('Rekening berhasil dihapus', 'success');
        if (bankTransfers.value.length === 1 && currentPage.value > 1) {
          currentPage.value--;
        }
        fetchBankTransfers();
      } catch (error: any) {
        displayNotification(
          error.response?.data?.message || 'Gagal menghapus rekening',
          'error'
        );
      }
    }
  );
};

onMounted(() => {
  fetchBankTransfers();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Daftar Bank Transfer
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Data Bank Transfer
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="bankTransfers"
        :loading="isLoading"
        :pagination="paginationProps"
        search-placeholder="Cari berdasarkan nama/nomor rekening atau bank..."
        add-label="Tambah Rekening"
        @search="fetchBankTransfers"
        @add="openAddModal"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
      >
        <template #cell-bank="{ row }">
          <div class="flex items-center gap-3">
            <img v-if="row.bank?.image" :src="row.bank.image" alt="Bank Logo" class="h-8 object-contain rounded-sm bg-white border border-gray-100 shadow-sm p-1" @error="row.bank.image = null" />
            <div v-else class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
              <span class="font-bold text-xs uppercase">{{ row.bank?.nama?.charAt(0) || 'B' }}</span>
            </div>
            <span class="font-medium text-gray-700">{{ row.bank?.nama || 'Bank Tidak Diketahui' }}</span>
          </div>
        </template>

        <template #cell-accountName="{ row }">
          <span class="font-bold text-gray-800">{{ row.accountName }}</span>
        </template>
        
        <template #cell-accountNumber="{ row }">
          <span class="font-mono bg-gray-50 px-2 py-1 rounded text-gray-700 border border-gray-100">{{ row.accountNumber }}</span>
        </template>

        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="openEditModal(row)" title="Edit">
              <IconEdit class="w-4 h-4" />
            </LightButton>
            <DangerButton @click="handleDelete(row)" title="Hapus">
              <IconDelete class="w-4 h-4" />
            </DangerButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modals & Notifications -->
    <BankTransferFormModal
      :show="isModalOpen"
      :mode="modalMode"
      :initial-data="selectedOutlet"
      :loading="false"
      @close="closeModal"
      @submit="onFormSubmit"
    />

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
        :class="['rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2', confirmButtonClass]"
      >
        {{ confirmButtonText }}
      </button>
    </Confirmation>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="hideNotification"
    />
  </div>
</template>
