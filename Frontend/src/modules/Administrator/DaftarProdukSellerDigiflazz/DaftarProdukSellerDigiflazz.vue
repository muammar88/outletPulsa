<script setup lang="ts">
import { IconRefresh } from '@tabler/icons-vue';

import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';
import { useConfirmation } from '@/composables/useConfirmation';
import { onMounted, ref } from 'vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import { daftarProdukSellerDigiflazzService } from '@/service/administrator/daftarProdukSellerDigiflazz';

const tableColumns = [
  { key: 'buyerSkuKode', label: 'SKU Seller', headerClass: 'text-left w-[15%] pl-4', cellClass: 'text-left pl-4 font-mono font-bold text-slate-700 text-xs' },
  { key: 'produk', label: 'Produk Digiflazz', headerClass: 'text-left w-[25%]', cellClass: 'text-left' },
  { key: 'seller', label: 'Nama Seller', headerClass: 'text-left w-[20%]', cellClass: 'text-left font-medium text-gray-800' },
  { key: 'price', label: 'Harga Seller', headerClass: 'text-right w-[15%]', cellClass: 'text-right font-semibold text-emerald-600' },
  { key: 'status', label: 'Status Produk', headerClass: 'text-center w-[15%] pr-4', cellClass: 'text-center pr-4' },
];

const dataProdukSeller = ref<any[]>([]);
const dataSellers = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const sellerFilter = ref('');

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

const confirmButtonText = ref('Ya, Scan Sekarang');
const confirmButtonClass = ref('bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.5)]');

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 100, totalRow: 0 }
);

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

const fetchSellers = async () => {
  try {
    const response = await daftarProdukSellerDigiflazzService.getSellers();
    dataSellers.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil daftar seller:', error);
  }
};

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await daftarProdukSellerDigiflazzService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      sellerFilter.value
    );
    dataProdukSeller.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data produk seller:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleSync = () => {
  confirmButtonText.value = 'Ya, Sinkronkan';
  confirmButtonClass.value = 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.5)]';
  
  displayConfirmation(
    'Scan Produk Digiflazz',
    'Apakah Anda yakin ingin melakukan sinkronisasi produk dari Digiflazz? Proses ini mungkin memerlukan waktu beberapa saat.',
    async () => {
      isLoading.value = true;
      try {
        const response = await daftarProdukSellerDigiflazzService.sync();
        displayNotification( response.data.message || 'Sinkronisasi berhasil dilakukan', 'success');
        fetchSellers();
        fetchData();
      } catch (error: any) {
        displayNotification(error.response?.data?.message || 'Gagal melakukan sinkronisasi', 'error');
      } finally {
        isLoading.value = false;
      }
    }
  );
};

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
};

onMounted(() => {
  fetchSellers();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Daftar Produk Seller Digiflazz
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Produk & Harga dari Seller Digiflazz
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataProdukSeller"
        :loading="isLoading"
        :pagination="paginationProps"
        @page-change="pageNow"
        :show-numbering="false"
        :show-actions="false"
        :show-search="false"
        :show-add="false"
        @refresh="fetchData"
      >
        <template #filters>
          <div class="flex gap-3">
            <div class="inline-flex rounded-xl shadow-sm" role="group">
              <input
                type="text"
                class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
                v-model="searchQuery"
                @input="onSearch"
                placeholder="Cari SKU atau nama produk..."
              />
              <select
                v-model="sellerFilter"
                @change="applyFilter"
                class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Seller</option>
                <option v-for="s in dataSellers" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>
        </template>

        <template #custom-actions>
          <button
            @click="handleSync"
            class="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            :disabled="isLoading"
          >
            <IconRefresh class=" mr-2" :class="{ 'animate-spin': isLoading }" size="18" />
            {{ isLoading ? 'Memproses...' : 'Scan Produk Digiflazz' }}
          </button>
        </template>

        <template #cell-buyerSkuKode="{ row }">
          <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md font-mono tracking-wide shadow-sm">
            {{ row.buyerSkuKode || '-' }}
          </span>
        </template>

        <template #cell-produk="{ row }">
          <div class="flex flex-col text-left">
            <span class="text-[13px] font-bold text-gray-800 tracking-tight">{{ row.digiflazzProduct?.name || '-' }}</span>
            <span class="text-[10px] text-gray-500 font-mono">{{ row.digiflazzProduct?.selectedSellerBuyerSkuKode || '-' }}</span>
          </div>
        </template>

        <template #cell-seller="{ row }">
          <span class="text-sm">{{ row.digiflazzSeller?.name || '-' }}</span>
        </template>

        <template #cell-price="{ row }">
          {{ formatCurrency(row.price) }}
        </template>

        <template #cell-status="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
            :class="{
              'bg-emerald-50 text-emerald-700 border border-emerald-200/60': row.sellerProductStatus,
              'bg-rose-50 text-rose-700 border border-rose-200/60': !row.sellerProductStatus
            }"
          >
            {{ row.sellerProductStatus ? 'TERSEDIA' : 'KOSONG' }}
          </span>
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
        class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
      >
        Batal
      </button>
      <button
        @click="confirm"
        :class="['rounded-xl px-5 py-2.5 text-sm font-bold text-white focus:outline-none transition-all', confirmButtonClass]"
      >
        {{ confirmButtonText }}
      </button>
    </Confirmation>
  </div>
</template>
