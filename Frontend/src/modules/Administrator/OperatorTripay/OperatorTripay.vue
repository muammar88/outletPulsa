<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, watch } from 'vue';

// Modal
import OperatorTripayFormModal from '@/modules/Administrator/OperatorTripay/components/OperatorTripayFormModal.vue';
import OperatorTripayDetailModal from '@/modules/Administrator/OperatorTripay/components/OperatorTripayDetailModal.vue';

// Table & UI Components
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';

import { operatorTripayService, type OperatorTripay } from '@/service/administrator/operatorTripay';
import { kategoriTripayService, type KategoriTripay } from '@/service/administrator/kategoriTripay';
import dayjs from 'dayjs';

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
  { key: 'id', label: 'ID', headerClass: 'text-left w-[5%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[12%]', cellClass: 'text-left' },
  { key: 'name', label: 'Nama Operator', headerClass: 'text-left w-[22%]', cellClass: 'text-left' },
  { key: 'kategori', label: 'Kategori', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'jumlah_produk', label: 'Jml Produk', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
  { key: 'createdAt', label: 'Dibuat', headerClass: 'text-center w-[13%]', cellClass: 'text-center' },
  { key: 'updatedAt', label: 'Diperbarui', headerClass: 'text-center w-[13%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
];

const dataOperator = ref<OperatorTripay[]>([]);
const listKategori = ref<KategoriTripay[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterKategoriId = ref<number | undefined>(undefined);

// Form Modal State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedOperator = ref<OperatorTripay | null>(null);

// Detail Modal State
const showDetailModal = ref(false);
const selectedDetailOperator = ref<any | null>(null);

// Inisialisasi Composable Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 10, totalRow: 0 },
);

// Load daftar kategori untuk filter
const fetchKategori = async () => {
  try {
    const response = await kategoriTripayService.getAllFlat();
    listKategori.value = response.data.data.list;
  } catch (error) {
    console.error('Gagal mengambil daftar kategori:', error);
  }
};

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await operatorTripayService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      'createdAt',
      'desc',
      filterKategoriId.value,
    );
    dataOperator.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data operator tripay:', error);
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

// Aksi Tabel
const handleAdd = () => {
  formMode.value = 'add';
  selectedOperator.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: OperatorTripay) => {
  formMode.value = 'edit';
  selectedOperator.value = { ...row };
  showFormModal.value = true;
};

const handleDetail = async (row: OperatorTripay) => {
  try {
    const response = await operatorTripayService.getById(row.id);
    selectedDetailOperator.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    displayNotification('Gagal memuat detail operator', 'error');
  }
};

const confirmButtonText = ref('Ya, Hapus');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const handleDelete = (row: OperatorTripay) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus operator <strong>${row.name}</strong>?`,
    async () => {
      try {
        await operatorTripayService.delete(row.id);
        displayNotification('Operator berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus operator', 'error');
      }
    },
  );
};

// Watch filter kategori
watch(filterKategoriId, () => {
  currentPage.value = 1;
  fetchData();
});

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

onMounted(() => {
  fetchKategori();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Operator Tripay
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Master Data Operator PPOB
          </p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="mb-4 flex items-center gap-3">
        <label class="text-sm text-gray-600 font-medium">Filter Kategori:</label>
        <select
          v-model="filterKategoriId"
          class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border bg-white"
        >
          <option :value="undefined">Semua Kategori</option>
          <option v-for="kat in listKategori" :key="kat.id" :value="kat.id">
            {{ kat.name }}
          </option>
        </select>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataOperator"
        :loading="isLoading"
        :pagination="paginationProps"
        search-placeholder="Cari operator (kode, nama, kategori)..."
        add-label="Tambah Operator"
        @search="fetchData"
        @add="handleAdd"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
      >
        <template #cell-kode="{ row }">
          <span class="font-semibold text-slate-700">{{ row.kode || '-' }}</span>
        </template>

        <template #cell-name="{ row }">
          <span class="font-semibold text-gray-800">{{ row.name || '-' }}</span>
        </template>

        <template #cell-kategori="{ row }">
          <span
            v-if="row.kategori"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            {{ row.kategori.name }}
          </span>
          <span v-else class="text-gray-400 text-xs">-</span>
        </template>

        <template #cell-jumlah_produk="{ row }">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-xs font-bold">
            {{ row._count?.tripayPrabayarProduks ?? 0 }}
          </span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="text-xs text-gray-500">{{ formatDate(row.createdAt) }}</span>
        </template>

        <template #cell-updatedAt="{ row }">
          <span class="text-xs text-gray-500">{{ formatDate(row.updatedAt) }}</span>
        </template>

        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleDetail(row)" title="Detail Operator">
              <IconDetail />
            </LightButton>
            <LightButton @click="handleEdit(row)" title="Edit Operator">
              <EditIcon />
            </LightButton>
            <DangerButton @click="handleDelete(row)" title="Hapus Operator">
              <DeleteIcon />
            </DangerButton>
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

    <!-- Form Modal Add/Edit -->
    <OperatorTripayFormModal
      :show="showFormModal"
      :mode="formMode"
      :initial-data="selectedOperator"
      :loading="false"
      :kategori-list="listKategori"
      @close="
        showFormModal = false;
        fetchData();
        selectedOperator = null;
      "
    />

    <!-- Detail Modal -->
    <OperatorTripayDetailModal
      :show="showDetailModal"
      :data="selectedDetailOperator"
      @close="showDetailModal = false"
    />
  </div>
</template>
