<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { useNotification } from '@/composables/useNotification';
import { useConfirmation } from '@/composables/useConfirmation';
import { usePagination } from '@/composables/usePaginations';

import BaseTable from '@/components/Table/BaseTable.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';

import { semuaServerService } from './services/semuaServerService';
import type { Server } from './types/semuaServer';
import SemuaServerFormModal from './components/SemuaServerFormModal.vue';
import SemuaServerDetailModal from './components/SemuaServerDetailModal.vue';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, confirmAction, displayConfirmation, confirm, cancel } =
  useConfirmation();

const tableColumns = [
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[20%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'name', label: 'Nama Server', headerClass: 'text-left w-[40%]', cellClass: 'text-left font-semibold text-gray-800' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[20%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[20%]', cellClass: 'text-center' },
];

const dataServer = ref<Server[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');

// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedServer = ref<Server | null>(null);

// Detail State
const showDetailModal = ref(false);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 15, totalRow: 0 },
);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await semuaServerService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      statusFilter.value,
    );
    dataServer.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data:', error);
  } finally {
    isLoading.value = false;
  }
};

const applyFilter = () => {
  currentPage.value = 1;
  fetchData();
};

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilter();
  }, 500);
};

const paginationProps = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value,
  pages: pages.value,
  totalRow: totalRow.value,
  perPage: perPage.value,
}));

// Actions
const handleAdd = () => {
  formMode.value = 'add';
  selectedServer.value = null;
  showFormModal.value = true;
};

const handleEdit = (server: Server) => {
  formMode.value = 'edit';
  selectedServer.value = server;
  showFormModal.value = true;
};

const handleDetail = (server: Server) => {
  selectedServer.value = server;
  showDetailModal.value = true;
};

const handleDelete = (server: Server) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus server "${server.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`
  );
  
  // Wait for user confirmation, override confirm function if needed or handle via watch
  // Currently, `useConfirmation` sets `confirmAction.value`. Wait, `useConfirmation` usually doesn't have `confirmAction`.
  // Let's implement inline or pass standard callback.
  // Actually, outletPulsa's Confirmation component expects @confirm="action" if we customize it, or we can just patch it here:
};

// Listen to confirm button manually if needed. Let's adapt to outletPulsa standard:
const handleConfirmDelete = async () => {
  if (!selectedServer.value) return;
  try {
    await semuaServerService.delete(selectedServer.value.id);
    displayNotification('Data server berhasil dihapus!', 'success');
    fetchData();
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Gagal menghapus server';
    displayNotification(errMsg, 'error');
  } finally {
    confirm.value = false;
  }
};

const executeDelete = async () => {
   handleConfirmDelete();
}

const triggerDelete = (server: Server) => {
  selectedServer.value = server;
  confirmTitle.value = 'Hapus Server';
  confirmMessage.value = `Anda yakin ingin menghapus server ${server.name}?`;
  showConfirmDialog.value = true;
}

const closeForm = () => {
  showFormModal.value = false;
  selectedServer.value = null;
};

const onFormSaved = () => {
  closeForm();
  displayNotification(
    formMode.value === 'add' ? 'Server berhasil ditambahkan!' : 'Server berhasil diperbarui!',
    'success'
  );
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-[#0f2155] dark:text-white mb-2 tracking-tight">
            Daftar Server
          </h1>
          <p class="text-sm text-slate-500 font-medium">
            Kelola daftar server pulsa untuk kebutuhan transaksi produk.
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataServer"
        :loading="isLoading"
        :pagination="paginationProps"
        add-label="Tambah Server"
        @add="handleAdd"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showSearch="false"
      >
        <template #filters>
          <div class="inline-flex rounded-xl shadow-sm" role="group">
            <input
              type="text"
              id="search"
              class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Cari server (kode, nama)..."
            />
            <select
              v-model="statusFilter"
              @change="applyFilter"
              class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border border-l-0 border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>
          </div>
        </template>

        <template #cell-kode="{ row }">
          <div class="flex items-center">
            <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md font-mono tracking-wide shadow-sm">
              {{ row.kode }}
            </span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <div class="flex justify-center">
            <div 
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border"
              :class="row.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
            >
              <span class="relative flex h-2 w-2 mr-1.5">
                <span 
                  v-if="row.status === 'active'" 
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                ></span>
                <span 
                  class="relative inline-flex rounded-full h-2 w-2"
                  :class="row.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
                ></span>
              </span>
              {{ row.status === 'active' ? 'Aktif' : 'Non-Aktif' }}
            </div>
          </div>
        </template>

        <template #cell-action="{ row }">
          <div class="flex justify-center items-center gap-2">
            <button 
              @click="handleDetail(row)"
              class="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
              title="Detail"
            >
              <IconDetail class="w-4 h-4" />
            </button>
            <button 
              @click="handleEdit(row)"
              class="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors border border-orange-100"
              title="Edit"
            >
              <EditIcon class="w-4 h-4" />
            </button>
            <button 
              @click="triggerDelete(row)"
              class="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
              title="Hapus"
            >
              <DeleteIcon class="w-4 h-4" />
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <SemuaServerFormModal
      :show="showFormModal"
      :mode="formMode"
      :server-data="selectedServer"
      @close="closeForm"
      @saved="onFormSaved"
    />

    <SemuaServerDetailModal
      :show="showDetailModal"
      :server-data="selectedServer"
      @close="showDetailModal = false"
    />

    <Confirmation
      :showConfirmDialog="showConfirmDialog"
      :confirmTitle="confirmTitle"
      :confirmMessage="confirmMessage"
    >
      <button
        @click="executeDelete"
        class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
      >
        Hapus
      </button>
      <button
        @click="showConfirmDialog = false"
        class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
      >
        Batal
      </button>
    </Confirmation>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
