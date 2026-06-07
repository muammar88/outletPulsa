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
import PowerIcon from '@/components/Icons/PowerIcon.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';

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
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[15%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'name', label: 'Nama Server', headerClass: 'text-left w-[35%]', cellClass: 'text-left font-semibold text-gray-800' },
  { key: 'produk_count', label: 'Jumlah Produk', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[20%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
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

const confirmButtonText = ref('Ya, Lanjutkan');
const currentActionType = ref<'delete' | 'toggle'>('delete');

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
    showConfirmDialog.value = false;
  }
};

const targetStatusToChange = ref('');

const handleConfirmToggle = async () => {
  if (!selectedServer.value) return;
  try {
    await semuaServerService.update(selectedServer.value.id, { status: targetStatusToChange.value });
    displayNotification('Status server berhasil diubah!', 'success');
    fetchData();
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Gagal mengubah status server';
    displayNotification(errMsg, 'error');
  } finally {
    showConfirmDialog.value = false;
  }
};

const executeAction = async () => {
  if (currentActionType.value === 'delete') {
    await handleConfirmDelete();
  } else if (currentActionType.value === 'toggle') {
    await handleConfirmToggle();
  }
}

const triggerDelete = (server: Server) => {
  selectedServer.value = server;
  currentActionType.value = 'delete';
  confirmTitle.value = 'Hapus Server';
  confirmMessage.value = `Anda yakin ingin menghapus server <strong>${server.name}</strong>?`;
  confirmButtonText.value = 'Hapus';
  showConfirmDialog.value = true;
}

const handleRadioClick = (server: Server, desiredStatus: 'active' | 'inactive') => {
  if (server.status === desiredStatus) return; // already in this status, do nothing
  
  targetStatusToChange.value = desiredStatus;
  selectedServer.value = server;
  currentActionType.value = 'toggle';
  
  const actionText = desiredStatus === 'active' ? 'mengaktifkan' : 'menonaktifkan';
  confirmTitle.value = 'Konfirmasi Ubah Status';
  confirmMessage.value = `Anda yakin ingin ${actionText} server <strong>${server.name}</strong>?`;
  confirmButtonText.value = 'Ya, Lanjutkan';
  showConfirmDialog.value = true;
};

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
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showSearch="false"
        :show-add="false"
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

        <template #cell-produk_count="{ row }">
          <div class="flex justify-center">
            <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100 shadow-sm whitespace-nowrap">
              {{ (row._count?.produks || 0) + (row._count?.produkPascabayars || 0) }} Produk
            </span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <div class="flex justify-center items-center">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                class="sr-only peer" 
                :checked="row.status === 'active'"
                @click.prevent="handleRadioClick(row, row.status === 'active' ? 'inactive' : 'active')"
              >
              <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              <span class="ml-2.5 text-[11px] font-bold uppercase tracking-wide" :class="row.status === 'active' ? 'text-emerald-600' : 'text-gray-500'">
                {{ row.status === 'active' ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </label>
          </div>
        </template>

        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleDetail(row)" title="Detail"
              ><IconDetail></IconDetail
            ></LightButton>
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
      :show-confirm-dialog="showConfirmDialog"
      :confirm-title="confirmTitle"
      :confirm-message="confirmMessage"
    >
      <button
        @click="showConfirmDialog = false"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        Batal
      </button>
      <button
        @click="executeAction"
        class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none shadow-[0_0_15px_rgba(225,29,72,0.5)]"
      >
        {{ confirmButtonText }}
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
