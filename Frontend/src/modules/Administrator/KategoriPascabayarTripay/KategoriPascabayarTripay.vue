<script setup lang="ts">
import { IconListDetails, IconList } from '@/components/Icons';

import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal
import KategoriPascabayarTripayFormModal from '@/modules/Administrator/KategoriPascabayarTripay/components/KategoriPascabayarTripayFormModal.vue';
import KategoriPascabayarTripayDetailModal from '@/modules/Administrator/KategoriPascabayarTripay/components/KategoriPascabayarTripayDetailModal.vue';

// Table & UI Components
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import LightButton from '@/components/Button/LightButton.vue';

import { kategoriPascabayarTripayService, type KategoriPascabayarTripay } from '@/service/administrator/kategoriPascabayarTripay';
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
  // { key: 'id', label: 'ID', headerClass: 'text-left w-[5%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'name', label: 'Nama Kategori', headerClass: 'text-left w-[40%]', cellClass: 'text-left' },
  { key: 'jumlah_operator', label: 'Jml Operator', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
  { key: 'createdAt', label: 'Dibuat', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
  { key: 'updatedAt', label: 'Diperbarui', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
];

const dataKategori = ref<KategoriPascabayarTripay[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Form Modal State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedKategori = ref<KategoriPascabayarTripay | null>(null);

// Detail Modal State
const showDetailModal = ref(false);
const selectedDetailKategori = ref<any | null>(null);

// Inisialisasi Composable Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 100, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await kategoriPascabayarTripayService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataKategori.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data kategori prabayar tripay:', error);
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

const handleDetail = async (row: KategoriPascabayarTripay) => {
  try {
    const response = await kategoriPascabayarTripayService.getById(row.id);
    selectedDetailKategori.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    displayNotification('Gagal memuat detail kategori', 'error');
  }
};

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Kategori Pascabayar Tripay
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
        @search="fetchData"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showAdd="false"
      >
        <template #cell-name="{ row }">
          <span class="font-semibold text-slate-700">{{ row.name || '-' }}</span>
        </template>

        <template #cell-jumlah_operator="{ row }">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
            {{ row._count?.tripayPascabayarOperators ?? 0 }}
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
              <IconListDetails class="w-4 h-4" />
            </LightButton>
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
    <KategoriPascabayarTripayFormModal
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
    <KategoriPascabayarTripayDetailModal
      :show="showDetailModal"
      :data="selectedDetailKategori"
      @close="showDetailModal = false"
    />
  </div>
</template>
