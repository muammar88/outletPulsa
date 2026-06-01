<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Components
import SemuaProdukFormModal from './components/SemuaProdukFormModal.vue';
import SemuaProdukDetailModal from './components/SemuaProdukDetailModal.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';

// Button & Icons
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';

import { semuaProdukService } from './services/semuaProdukService';
import type { Produk } from './types/semuaProduk';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

const tableColumns = [
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[20%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'name', label: 'Nama Produk', headerClass: 'text-left w-[20%]', cellClass: 'text-left' },
  { key: 'harga', label: 'Harga (Beli / Jual)', headerClass: 'text-right w-[20%]', cellClass: 'text-right' },
  { key: 'type', label: 'Tipe', headerClass: 'text-center w-[15%]', cellClass: 'text-center capitalize' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
];

const dataProduk = ref<Produk[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedProduk = ref<Produk | null>(null);
const isSubmitting = ref(false);

// Detail State
const showDetailModal = ref(false);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 150, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await semuaProdukService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      statusFilter.value,
      typeFilter.value
    );
    dataProduk.value = response.data.data.list;
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

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const handleAdd = () => {
  formMode.value = 'add';
  selectedProduk.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: Produk) => {
  formMode.value = 'edit';
  selectedProduk.value = { ...row };
  showFormModal.value = true;
};

const handleDetail = (row: Produk) => {
  selectedProduk.value = { ...row };
  showDetailModal.value = true;
};

const handleDelete = (row: Produk) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus produk <strong>${row.name}</strong>?`,
    async () => {
      try {
        await semuaProdukService.delete(row.id);
        displayNotification('Produk berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus produk', 'error');
        console.error('Error saat menghapus produk:', error);
      }
    },
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
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
          Semua Produk
        </h1>
        <p class="text-sm text-slate-500 font-medium">
          Kelola daftar produk, konfigurasi harga beli, dan markup margin.
        </p>
      </div>
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="dataProduk"
      :loading="isLoading"
      :pagination="paginationProps"
      add-label="Tambah Produk"
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
            placeholder="Cari produk (kode, nama)..."
          />
          <select
            v-model="typeFilter"
            @change="applyFilter"
            class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Semua Tipe</option>
            <option value="prabayar">Prabayar</option>
            <option value="pascabayar">Pascabayar</option>
          </select>
          <select
            v-model="statusFilter"
            @change="applyFilter"
            class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
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

      <template #cell-name="{ row }">
        <div class="flex flex-col">
          <span class="text-[14px] font-bold text-gray-800 tracking-tight">{{ row.name }}</span>
        </div>
      </template>
      
      <template #cell-harga="{ row }">
        <div class="flex flex-col items-end justify-center pr-4">
          <span class="font-bold text-gray-900 text-[14px]">{{ formatCurrency(row.purchase_price) }}</span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Jual</span>
            <span class="text-[12px] text-emerald-600 font-extrabold">{{ formatCurrency((row.purchase_price || 0) + (row.markup || 0)) }}</span>
          </div>
        </div>
      </template>

      <template #cell-type="{ row }">
        <span
          class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border"
          :class="
            row.type === 'prabayar'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
              : 'bg-violet-50 text-violet-700 border-violet-100'
          "
        >
          {{ row.type }}
        </span>
      </template>

      <template #cell-status="{ row }">
        <div class="flex justify-center">
          <div
            class="flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
            :class="
              row.status === 'active'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            "
          >
            <div class="w-1.5 h-1.5 rounded-full"
                 :class="row.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"
            ></div>
            <span class="text-[10px] font-bold uppercase tracking-wide">
              {{ row.status === 'active' ? 'Aktif' : 'Non-Aktif' }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-action="{ row }">
        <div class="flex justify-center gap-2 items-center transition-opacity duration-200">
          <LightButton @click="handleDetail(row)" title="Detail Produk" class="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
            <IconDetail />
          </LightButton>
          <LightButton @click="handleEdit(row)" title="Edit Produk" class="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all">
            <EditIcon />
          </LightButton>
          <DangerButton @click="handleDelete(row)" title="Hapus Produk" class="hover:shadow-md transition-all">
            <DeleteIcon />
          </DangerButton>
        </div>
      </template>
    </BaseTable>
  </div>

  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
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
      class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none shadow-[0_0_15px_rgba(225,29,72,0.5)]"
    >
      Hapus
    </button>
  </Confirmation>

  <SemuaProdukFormModal
    :show="showFormModal"
    :mode="formMode"
    :initial-data="selectedProduk"
    :loading="isSubmitting"
    @close="
      showFormModal = false;
      fetchData();
      selectedProduk = null;
    "
  />

  <SemuaProdukDetailModal
    :show="showDetailModal"
    :data="selectedProduk"
    @close="
      showDetailModal = false;
      selectedProduk = null;
    "
  />
  </div>
</template>
