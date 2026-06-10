<script setup lang="ts">
import { IconListDetails, IconList } from '@tabler/icons-vue';

import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, watch } from 'vue';

// Modal
import OperatorPascabayarTripayFormModal from '@/modules/Administrator/OperatorPascabayarTripay/components/OperatorPascabayarTripayFormModal.vue';
import OperatorPascabayarTripayDetailModal from '@/modules/Administrator/OperatorPascabayarTripay/components/OperatorPascabayarTripayDetailModal.vue';

// Table & UI Components
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import LightButton from '@/components/Button/LightButton.vue';

import { operatorPascabayarTripayService, type OperatorPascabayarTripay } from '@/service/administrator/operatorPascabayarTripay';
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
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[20%]', cellClass: 'text-left' },
  { key: 'name', label: 'Nama Operator', headerClass: 'text-left w-[30%]', cellClass: 'text-left' },
  { key: 'kategori', label: 'Kategori', headerClass: 'text-left w-[20%]', cellClass: 'text-left' },
  { key: 'jumlah_produk', label: 'Jml Produk', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
];

const dataOperator = ref<OperatorPascabayarTripay[]>([]);
const listKategori = ref<KategoriPascabayarTripay[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterKategoriId = ref<number | undefined>(undefined);

// Form Modal State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedOperator = ref<OperatorPascabayarTripay | null>(null);

// Detail Modal State
const showDetailModal = ref(false);
const selectedDetailOperator = ref<any | null>(null);

// Inisialisasi Composable Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 100, totalRow: 0 },
);

// Load daftar kategori untuk filter
const fetchKategori = async () => {
  try {
    const response = await kategoriPascabayarTripayService.getAllFlat();
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
    const response = await operatorPascabayarTripayService.getAll(
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
    console.error('Gagal mengambil data operator prabayar tripay:', error);
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

const handleDetail = async (row: OperatorPascabayarTripay) => {
  try {
    const response = await operatorPascabayarTripayService.getById(row.id);
    selectedDetailOperator.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    displayNotification('Gagal memuat detail operator', 'error');
  }
};

// Watch filter kategori
watch(filterKategoriId, () => {
  currentPage.value = 1;
  fetchData();
});

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchData();
  }, 500);
};


onMounted(() => {
  fetchKategori();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Operator Pascabayar Tripay
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Master Data Operator Pascabayar Tripay
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataOperator"
        :loading="isLoading"
        :pagination="paginationProps"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showSearch="false"
        :showAdd="false"
      >
        <template #filters>
          <div class="inline-flex rounded-xl shadow-sm" role="group">
            <input
              type="text"
              id="search"
              class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Cari operator (kode, nama)..."
            />
            <select
              v-model="filterKategoriId"
              class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option :value="undefined">Semua Kategori</option>
              <option v-for="kat in listKategori" :key="kat.id" :value="kat.id">
                {{ kat.name }}
              </option>
            </select>
          </div>
        </template>
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
            {{ row._count?.tripayPascabayarProduks ?? 0 }}
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
              <IconListDetails />
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
    <OperatorPascabayarTripayFormModal
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
    <OperatorPascabayarTripayDetailModal
      :show="showDetailModal"
      :data="selectedDetailOperator"
      @close="showDetailModal = false"
    />
  </div>
</template>
