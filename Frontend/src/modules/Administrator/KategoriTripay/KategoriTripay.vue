<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal
import KategoriTripayFormModal from '@/modules/Administrator/KategoriTripay/components/KategoriTripayFormModal.vue';
import KategoriTripayDetailModal from '@/modules/Administrator/KategoriTripay/components/KategoriTripayDetailModal.vue';

// Table & UI Components
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';

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
  { key: 'type', label: 'Kode / Tipe', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'name', label: 'Nama Kategori', headerClass: 'text-left w-[25%]', cellClass: 'text-left' },
  { key: 'jumlah_operator', label: 'Jml Operator', headerClass: 'text-center w-[12%]', cellClass: 'text-center' },
  { key: 'createdAt', label: 'Dibuat', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
  { key: 'updatedAt', label: 'Diperbarui', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[13%]', cellClass: 'text-center' },
];

const dataKategori = ref<KategoriTripay[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Form Modal State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedKategori = ref<KategoriTripay | null>(null);

// Detail Modal State
const showDetailModal = ref(false);
const selectedDetailKategori = ref<any | null>(null);

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
    const response = await kategoriTripayService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataKategori.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data kategori tripay:', error);
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
  selectedKategori.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: KategoriTripay) => {
  formMode.value = 'edit';
  selectedKategori.value = { ...row };
  showFormModal.value = true;
};

const handleDetail = async (row: KategoriTripay) => {
  try {
    const response = await kategoriTripayService.getById(row.id);
    selectedDetailKategori.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    displayNotification('Gagal memuat detail kategori', 'error');
  }
};

const confirmButtonText = ref('Ya, Hapus');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const handleDelete = (row: KategoriTripay) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus kategori <strong>${row.name}</strong>?`,
    async () => {
      try {
        await kategoriTripayService.delete(row.id);
        displayNotification('Kategori berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus kategori', 'error');
      }
    },
  );
};

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

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
            Kategori Tripay
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Master Data Kategori PPOB
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataKategori"
        :loading="isLoading"
        :pagination="paginationProps"
        search-placeholder="Cari kategori (nama, kode)..."
        add-label="Tambah Kategori"
        @search="fetchData"
        @add="handleAdd"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
      >
        <template #cell-type="{ row }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ row.type || '-' }}
          </span>
        </template>

        <template #cell-name="{ row }">
          <span class="font-semibold text-slate-700">{{ row.name || '-' }}</span>
        </template>

        <template #cell-jumlah_operator="{ row }">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
            {{ row._count?.tripayPrabayarOperators ?? 0 }}
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
            <LightButton @click="handleDetail(row)" title="Detail Kategori">
              <IconDetail />
            </LightButton>
            <LightButton @click="handleEdit(row)" title="Edit Kategori">
              <EditIcon />
            </LightButton>
            <DangerButton @click="handleDelete(row)" title="Hapus Kategori">
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
    <KategoriTripayFormModal
      :show="showFormModal"
      :mode="formMode"
      :initial-data="selectedKategori"
      :loading="false"
      @close="
        showFormModal = false;
        fetchData();
        selectedKategori = null;
      "
    />

    <!-- Detail Modal -->
    <KategoriTripayDetailModal
      :show="showDetailModal"
      :data="selectedDetailKategori"
      @close="showDetailModal = false"
    />
  </div>
</template>
