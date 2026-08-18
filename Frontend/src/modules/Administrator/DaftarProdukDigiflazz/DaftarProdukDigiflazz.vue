<script setup lang="ts">
import { IconListDetails, IconPlug, IconTags, IconList } from '@/components/Icons';

import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref, computed } from 'vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import LightButton from '@/components/Button/LightButton.vue';

// Modals
import DaftarProdukDigiflazzKoneksiModal from './components/DaftarProdukDigiflazzKoneksiModal.vue';
import DaftarProdukDigiflazzSellersModal from './components/DaftarProdukDigiflazzSellersModal.vue';

// Service
import { daftarProdukDigiflazzService } from '@/service/administrator/daftarProdukDigiflazz';

const tableColumns = [
  {
    key: 'sku',
    label: 'SKU Seller',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-medium text-gray-800',
  },
  {
    key: 'name',
    label: 'Nama Produk Digiflazz',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left',
  },
  {
    key: 'grouping',
    label: 'Kategori / Brand / Type',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'produk',
    label: 'Produk Internal',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'price',
    label: 'Harga Seller',
    headerClass: 'text-right w-[15%] pr-4',
    cellClass: 'text-right pr-4 font-semibold text-emerald-600',
  },
  {
    key: 'status',
    label: 'Status',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataProduk = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterKategoriId = ref('');
const filterBrandId = ref('');
const filterTypeId = ref('');
const connectionFilter = ref('');

const listCategories = ref<any[]>([]);
const listBrands = ref<any[]>([]);
const listTypes = ref<any[]>([]);

const showKoneksiModal = ref(false);
const showSellersModal = ref(false);
const selectedProduk = ref<any | null>(null);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 100, totalRow: 0 },
);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

const confirmButtonText = ref('Ya, Pilih Termurah');
const confirmButtonClass = ref('bg-emerald-600 hover:bg-emerald-700 shadow-sm');

const handleSelectCheapest = () => {
  confirmButtonText.value = 'Ya, Pilih Termurah';
  confirmButtonClass.value = 'bg-emerald-600 hover:bg-emerald-700 shadow-sm';
  
  displayConfirmation(
    'Konfirmasi Pemilihan Harga Termurah',
    'Sistem akan memindai seluruh produk Digiflazz, mencari seller aktif dengan harga termurah, dan memperbarui SKU serta Harga Seller di sistem. Lanjutkan?',
    async () => {
      isLoading.value = true;
      try {
        const response = await daftarProdukDigiflazzService.selectCheapestSeller();
        await fetchData();
        displayNotification(response.data.message || 'Pemilihan seller termurah berhasil.', 'success');
      } catch (error: any) {
        displayNotification('Gagal: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
        isLoading.value = false;
      }
    }
  );
};

const fetchFilters = async () => {
  try {
    const res = await daftarProdukDigiflazzService.getFilters();
    if (res?.data?.data) {
      listCategories.value = res.data.data.categories || [];
      listBrands.value = res.data.data.brands || [];
      listTypes.value = res.data.data.types || [];
    }
  } catch (error) {
    console.error('Failed to fetch filters', error);
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

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await daftarProdukDigiflazzService.getAll(
      currentPage.value,
      perPage.value,
      searchQuery.value,
      filterKategoriId.value,
      filterBrandId.value,
      filterTypeId.value,
      connectionFilter.value
    );
    dataProduk.value = response.data.data.list;
    totalRow.value = response.data.data.meta.total;
  } catch (error) {
    console.error('Gagal mengambil data produk digiflazz:', error);
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

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const handleKoneksi = (row: any) => {
  selectedProduk.value = row;
  showKoneksiModal.value = true;
};

const handleViewSellers = (row: any) => {
  selectedProduk.value = row;
  showSellersModal.value = true;
};

const handleKoneksiSaved = () => {
  showKoneksiModal.value = false;
  displayNotification('Berhasil menghubungkan produk Digiflazz dengan produk internal', 'success');
  fetchData();
};

const loadingStatusId = ref<number | null>(null);

const confirmToggleStatus = (row: any) => {
  const isCurrentlyActive = row.status === 'active';
  const targetStatus = isCurrentlyActive ? 'Inactive' : 'Active';
  const targetStatusColorClass = isCurrentlyActive ? 'bg-rose-600 hover:bg-rose-700 shadow-sm' : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm';

  confirmButtonText.value = `Ya, Jadikan ${targetStatus}`;
  confirmButtonClass.value = targetStatusColorClass;

  displayConfirmation(
    `Konfirmasi Perubahan Status`,
    `Apakah Anda yakin ingin mengubah status produk <b>${row.name}</b> menjadi <b>${targetStatus}</b>?`,
    async () => {
      loadingStatusId.value = row.id;
      try {
        await daftarProdukDigiflazzService.toggleStatus(row.id);
        displayNotification(`Status produk berhasil diubah menjadi ${targetStatus}.`, 'success');
        // Update state locally without a full reload
        row.status = isCurrentlyActive ? 'inactive' : 'active';
      } catch (error: any) {
        displayNotification('Gagal memperbarui status: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
        loadingStatusId.value = null;
      }
    }
  );
};

onMounted(() => {
  fetchFilters();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Daftar Produk Digiflazz
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Data Produk Utama dari Supplier Digiflazz
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataProduk"
        :is-loading="isLoading"
        search-placeholder="Cari kode SKU atau nama produk..."
        :pagination="paginationProps"
        :show-add="false"
        :show-search="false"
        :show-actions="false"
        @search="fetchData"
        @page-change="(page) => { currentPage = page; fetchData(); }"
        @refresh="fetchData"
      >
        <template #filters>
          <div class="flex flex-wrap gap-3">
            <div class="inline-flex rounded-xl shadow-sm flex-wrap gap-y-2" role="group">
              <input
                type="text"
                id="search"
                class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
                v-model="searchQuery"
                @input="onSearch"
                placeholder="Cari SKU atau nama produk..."
              />
              <select
                v-model="filterKategoriId"
                @change="applyFilter"
                class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option v-for="kat in listCategories" :key="kat.id" :value="kat.id">
                  {{ kat.name }}
                </option>
              </select>
              <select
                v-model="filterBrandId"
                @change="applyFilter"
                class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Brand</option>
                <option v-for="brand in listBrands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
              <select
                v-model="filterTypeId"
                @change="applyFilter"
                class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Type</option>
                <option v-for="t in listTypes" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
              <select
                v-model="connectionFilter"
                @change="applyFilter"
                class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Status Koneksi</option>
                <option value="connected">Terkoneksi</option>
                <option value="disconnected">Belum Terkoneksi</option>
              </select>
            </div>
          </div>
        </template>
        
        <template #custom-actions>
          <button
            @click="handleSelectCheapest"
            class="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            :disabled="isLoading"
          >
            <IconTags class="mr-2 w-4 h-4" :class="{ 'animate-pulse': isLoading }" />
            {{ isLoading ? 'Memproses...' : 'Pilih Produk Seller Termurah' }}
          </button>
        </template>

        <!-- Custom Cells -->
        <template #cell-name="{ row }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800">{{ row.name }}</span>
            <div class="flex items-center gap-1 mt-1">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {{ row._count?.digiflazzSellerProducts || 0 }} Seller Terhubung
              </span>
            </div>
          </div>
        </template>

        <template #cell-sku="{ row }">
          <div class="flex flex-col">
            <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md font-mono tracking-wide shadow-sm w-max">
              {{ row.selectedSellerBuyerSkuKode || '-' }}
            </span>
            <span v-if="row.selectedSellerBuyerSkuKode" class="text-[10px] text-blue-600 font-bold mt-1.5 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {{ row.digiflazzSellerProducts?.find((sp: any) => sp.buyerSkuKode === row.selectedSellerBuyerSkuKode)?.digiflazzSeller?.name || 'Seller Unknown' }}
            </span>
          </div>
        </template>

        <template #cell-grouping="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-800 text-sm">{{ row.brand?.name || '-' }}</span>
            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{{ row.category?.name || '-' }} • {{ row.type?.name || '-' }}</span>
          </div>
        </template>

        <template #cell-produk="{ row }">
          <div v-if="row.produk" class="flex flex-col">
            <span class="font-medium text-indigo-700 text-sm">{{ row.produk.name }}</span>
            <span class="text-[10px] text-gray-500 font-mono">{{ row.produk.kode }}</span>
          </div>
          <span v-else class="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-semibold rounded border border-red-100 uppercase tracking-wider">
            Belum Terkoneksi
          </span>
        </template>

        <template #cell-price="{ row }">
          {{ formatCurrency(row.selectedSellerPrice) }}
        </template>

        <template #cell-status="{ row }">
          <div class="flex flex-col items-center justify-center gap-1.5">
            <button
              type="button"
              @click="confirmToggleStatus(row)"
              class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="row.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'"
              :disabled="loadingStatusId === row.id"
              :title="row.status === 'active' ? 'Nonaktifkan Produk' : 'Aktifkan Produk'"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center"
                :class="row.status === 'active' ? 'translate-x-4' : 'translate-x-0'"
              >
                <svg v-if="loadingStatusId === row.id" class="animate-spin h-3 w-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </button>
            <span
              class="text-[10px] font-bold uppercase tracking-wider"
              :class="row.status === 'active' ? 'text-emerald-600' : 'text-gray-500'"
            >
              {{ row.status === 'active' ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </template>

        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleViewSellers(row)" title="Lihat Produk Seller Terhubung">
              <IconListDetails class="w-4 h-4" />
            </LightButton>
            <LightButton @click="handleKoneksi(row)" title="Koneksikan Produk Internal">
              <IconPlug class="w-4 h-4" />
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

    <!-- Modals -->
    <DaftarProdukDigiflazzSellersModal
      v-if="showSellersModal"
      :show="showSellersModal"
      :produk="selectedProduk"
      @close="showSellersModal = false"
      @saved="fetchData"
    />

    <DaftarProdukDigiflazzKoneksiModal
      v-if="showKoneksiModal"
      :show="showKoneksiModal"
      :produk="selectedProduk"
      @close="showKoneksiModal = false"
      @saved="handleKoneksiSaved"
    />
  </div>
</template>
