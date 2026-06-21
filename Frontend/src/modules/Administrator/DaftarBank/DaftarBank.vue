<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal Page
import BankFormModal from './components/BankFormModal.vue';

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
import { bankService, type Bank } from '@/service/administrator/bank';

const {
  showConfirmation,
  confirmationTitle,
  confirmationMessage,
  displayConfirmation,
  hideConfirmation,
  confirmAction,
} = useConfirmation();

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const tableColumns = [
  {
    key: 'kode',
    label: 'Kode',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-mono font-bold tracking-wide text-slate-700',
  },
  {
    key: 'nama',
    label: 'Nama Bank',
    headerClass: 'text-left w-[30%]',
    cellClass: 'text-left font-bold text-gray-800',
  },
  {
    key: 'outlets_count',
    label: 'Jml Outlet',
    headerClass: 'text-center w-[20%]',
    cellClass: 'text-center',
  },
  {
    key: 'mutasi_count',
    label: 'Jml Mutasi',
    headerClass: 'text-center w-[20%]',
    cellClass: 'text-center',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const {
  currentPage,
  itemsPerPage,
  searchQuery,
  totalPages,
  handlePageChange,
  handleSearch,
} = usePagination(10);

const banks = ref<Bank[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const selectedBank = ref<Bank | null>(null);

const fetchBanks = async () => {
  isLoading.value = true;
  try {
    const response = await bankService.getAll(
      searchQuery.value,
      itemsPerPage.value,
      currentPage.value
    );
    banks.value = response.data.data.list;
    totalPages.value = response.data.data.totalPages;
  } catch (error) {
    displayNotification('error', 'Gagal mengambil data bank.');
  } finally {
    isLoading.value = false;
  }
};

const onSearch = (query: string) => {
  handleSearch(query);
  fetchBanks();
};

const onPageChange = (page: number) => {
  handlePageChange(page);
  fetchBanks();
};

const openAddModal = () => {
  modalMode.value = 'add';
  selectedBank.value = null;
  isModalOpen.value = true;
};

const openEditModal = (bank: Bank) => {
  modalMode.value = 'edit';
  selectedBank.value = bank;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedBank.value = null;
};

const onFormSubmit = () => {
  displayNotification(
    'success',
    modalMode.value === 'add'
      ? 'Bank berhasil ditambahkan'
      : 'Bank berhasil diperbarui'
  );
  fetchBanks();
};

const handleDelete = (bank: Bank) => {
  displayConfirmation(
    'Hapus Bank',
    `Apakah Anda yakin ingin menghapus bank "${bank.nama}"? Aksi ini tidak dapat dibatalkan.`,
    async () => {
      try {
        await bankService.delete(bank.id!);
        displayNotification('success', 'Bank berhasil dihapus');
        if (banks.value.length === 1 && currentPage.value > 1) {
          currentPage.value--;
        }
        fetchBanks();
      } catch (error: any) {
        displayNotification(
          'error',
          error.response?.data?.message || 'Gagal menghapus bank'
        );
      }
    }
  );
};

onMounted(() => {
  fetchBanks();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Daftar Bank</h1>
      <p class="text-gray-500 mt-1">Kelola data master bank untuk sistem</p>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Search & Add Action -->
      <div class="p-6 border-b border-gray-100 bg-gray-50/50">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="w-full sm:w-96 relative">
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="onSearch(searchQuery)"
              placeholder="Cari berdasarkan kode atau nama..."
              class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
            />
            <svg
              class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            @click="openAddModal"
            class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Bank
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <BaseTable
        :columns="tableColumns"
        :data="banks"
        :is-loading="isLoading"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="onPageChange"
      >
        <template #cell-outlets_count="{ row }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {{ row._count?.bankTransferOutlets || 0 }}
          </span>
        </template>
        <template #cell-mutasi_count="{ row }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            {{ row._count?.riwayatMutasis || 0 }}
          </span>
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
    <BankFormModal
      :show="isModalOpen"
      :mode="modalMode"
      :initial-data="selectedBank"
      :loading="false"
      @close="closeModal"
      @submit="onFormSubmit"
    />

    <Confirmation
      :show="showConfirmation"
      :title="confirmationTitle"
      :message="confirmationMessage"
      @close="hideConfirmation"
      @confirm="confirmAction"
    />

    <Notification
      :show="showNotification"
      :type="notificationType"
      :message="notificationMessage"
      @close="hideNotification"
    />
  </div>
</template>
