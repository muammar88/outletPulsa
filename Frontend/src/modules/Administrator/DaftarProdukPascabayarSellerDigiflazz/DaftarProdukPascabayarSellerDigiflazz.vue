<script setup lang="ts">
import { IconListDetails, IconPlug, IconRefresh } from '@/components/Icons';
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DaftarProdukPascabayarSellerDigiflazzDetailModal from './components/DaftarProdukPascabayarSellerDigiflazzDetailModal.vue';
import DaftarProdukPascabayarSellerDigiflazzKoneksiModal from './components/DaftarProdukPascabayarSellerDigiflazzKoneksiModal.vue';
import {
  daftarProdukPascabayarSellerDigiflazzService,
  type DigiflazzPascabayarCatalogItem,
  type DigiflazzPascabayarConnection,
} from '@/service/administrator/daftarProdukPascabayarSellerDigiflazz';

const tableColumns = [
  {
    key: 'buyerSkuCode',
    label: 'SKU Seller',
    headerClass: 'text-left w-[11%] pl-4',
    cellClass: 'text-left pl-4 font-mono text-[11px] font-bold text-slate-700',
  },
  { key: 'name', label: 'Produk Digiflazz', headerClass: 'text-left w-[14%]', cellClass: 'text-left' },
  { key: 'sellerName', label: 'Seller', headerClass: 'text-left w-[10%]', cellClass: 'text-left' },
  { key: 'kategori', label: 'Kategori / Brand', headerClass: 'text-left w-[12%]', cellClass: 'text-left' },
  {
    key: 'admin',
    label: 'Admin Provider',
    headerClass: 'text-right w-[9%]',
    cellClass: 'text-right font-semibold text-emerald-600',
  },
  {
    key: 'commission',
    label: 'Komisi',
    headerClass: 'text-right w-[8%]',
    cellClass: 'text-right font-semibold text-indigo-600',
  },
  { key: 'buyerProductStatus', label: 'Status Buyer', headerClass: 'text-center w-[8%]', cellClass: 'text-center' },
  { key: 'sellerProductStatus', label: 'Status Seller', headerClass: 'text-center w-[8%]', cellClass: 'text-center' },
  { key: 'produkInternal', label: 'Produk Internal', headerClass: 'text-left w-[12%]', cellClass: 'text-left' },
  { key: 'providerAktif', label: 'Provider Aktif', headerClass: 'text-center w-[8%]', cellClass: 'text-center' },
  {
    key: 'syncedAt',
    label: 'Sinkron Terakhir',
    headerClass: 'text-left w-[9%]',
    cellClass: 'text-left text-xs text-gray-600',
  },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[11%] pr-4', cellClass: 'text-center pr-4' },
];

const rows = ref<DigiflazzPascabayarCatalogItem[]>([]);
const sellers = ref<string[]>([]);
const categories = ref<string[]>([]);

const isLoading = ref(false);
const isSyncing = ref(false);
const isSubmitting = ref(false);

const searchQuery = ref('');
const sellerFilter = ref('');
const categoryFilter = ref('');
const connectionFilter = ref('');
const availabilityFilter = ref('');

const showDetailModal = ref(false);
const showKoneksiModal = ref(false);
const selectedRow = ref<DigiflazzPascabayarCatalogItem | null>(null);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(() => fetchData(), {
  perPage: 20,
  totalRow: 0,
});

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

const confirmButtonText = ref('Ya, Lanjutkan');
const confirmButtonClass = ref('bg-emerald-600 hover:bg-emerald-700 shadow-sm');

const paginationProps = ref({ currentPage, totalPages, pages, totalRow, perPage });

/** Escape data provider sebelum dimasukkan ke dialog konfirmasi (v-html). */
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
const formatRupiah = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Belum tersedia';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string | null | undefined) =>
  value ? dayjs(value).format('DD MMM YYYY HH:mm') : '-';

const statusLabel = (value: boolean | null) => {
  if (value === true) return 'Tersedia';
  if (value === false) return 'Tidak tersedia';
  return 'Belum diketahui';
};

const statusClass = (value: boolean | null) => {
  if (value === true) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (value === false) return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const inactiveMappings = (row: DigiflazzPascabayarCatalogItem): DigiflazzPascabayarConnection[] =>
  (row.providerSelections || []).filter((mapping) => !mapping.isActive);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await daftarProdukPascabayarSellerDigiflazzService.listKatalog({
      page: currentPage.value,
      limit: perPage.value,
      search: searchQuery.value.trim() || undefined,
      seller: sellerFilter.value || undefined,
      category: categoryFilter.value || undefined,
      availability: availabilityFilter.value || undefined,
      connected: connectionFilter.value || undefined,
    });
    rows.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error: any) {
    displayNotification(
      error.response?.data?.message || 'Gagal memuat katalog produk pascabayar Digiflazz',
      'error',
    );
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
  searchTimeout = setTimeout(() => applyFilter(), 450);
};

const fetchSellers = async () => {
  try {
    const response = await daftarProdukPascabayarSellerDigiflazzService.listSellers();
    sellers.value = response.data.data ?? [];
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal memuat daftar seller', 'error');
  }
};

const fetchCategories = async () => {
  try {
    const response = await daftarProdukPascabayarSellerDigiflazzService.listCategories();
    categories.value = response.data.data ?? [];
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal memuat daftar kategori', 'error');
  }
};

const onNotify = (message: string) => displayNotification(message, 'error');

const handleDetail = (row: DigiflazzPascabayarCatalogItem) => {
  selectedRow.value = row;
  showDetailModal.value = true;
};

const handleKoneksi = (row: DigiflazzPascabayarCatalogItem) => {
  selectedRow.value = row;
  showKoneksiModal.value = true;
};

const handleKoneksiSaved = () => {
  showKoneksiModal.value = false;
  displayNotification('Produk internal berhasil dihubungkan ke katalog Digiflazz', 'success');
  fetchData();
};

const handleDisconnect = (
  row: DigiflazzPascabayarCatalogItem,
  mapping: DigiflazzPascabayarConnection,
) => {
  if (mapping.isActive) {
    displayNotification('Provider aktif tidak dapat dilepas. Pilih provider pengganti terlebih dahulu.', 'error');
    return;
  }

  const nama = mapping.produkPascabayar?.name || 'Produk internal';
  const kode = mapping.produkPascabayar?.kode || '-';
  const seller = row.sellerName || 'Seller tidak tersedia';

  confirmButtonText.value = 'Ya, Lepas Koneksi';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-sm';
  displayConfirmation(
    'Lepas Koneksi Provider',
    `Lepas koneksi ${escapeHtml(nama)} (${escapeHtml(kode)}) dari SKU ${escapeHtml(row.buyerSkuCode)} - ${escapeHtml(seller)}? Katalog Digiflazz tidak akan dihapus.`,
    async () => {
      if (isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        await daftarProdukPascabayarSellerDigiflazzService.disconnect(
          mapping.produkPascabayarId,
          'DIGIFLAZZ',
        );
        displayNotification('Koneksi provider berhasil dilepas', 'success');
        fetchData();
      } catch (error: any) {
        displayNotification(error.response?.data?.message || 'Gagal melepas koneksi provider', 'error');
      } finally {
        isSubmitting.value = false;
      }
    },
  );
};

const handleSync = () => {
  if (isSyncing.value) return;

  confirmButtonText.value = 'Ya, Sinkronkan';
  confirmButtonClass.value = 'bg-emerald-600 hover:bg-emerald-700 shadow-sm';
  displayConfirmation(
    'Sinkronkan Produk Pascabayar Digiflazz',
    'Sinkronisasi akan menarik katalog pascabayar terbaru dari Digiflazz. Katalog dan koneksi lama tidak akan dihapus. Lanjutkan?',
    async () => {
      if (isSyncing.value) return;
      isSyncing.value = true;
      try {
        const response = await daftarProdukPascabayarSellerDigiflazzService.sync();
        const result = response.data.data;
        displayNotification(
          `Sinkronisasi selesai. Baru: ${result.inserted}, Diperbarui: ${result.updated}, Total: ${result.total}`,
          'success',
        );
        await Promise.all([fetchSellers(), fetchCategories()]);
        currentPage.value = 1;
        fetchData();
      } catch (error: any) {
        displayNotification(
          error.response?.data?.message || 'Gagal melakukan sinkronisasi katalog pascabayar Digiflazz',
          'error',
        );
      } finally {
        isSyncing.value = false;
      }
    },
  );
};

onMounted(() => {
  fetchSellers();
  fetchCategories();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight">
            Daftar Produk Pascabayar Seller Digiflazz
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Katalog seller, biaya, ketersediaan, dan koneksi produk pascabayar Digiflazz
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="rows"
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
          <div class="flex flex-wrap gap-3">
            <input
              type="text"
              class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Cari SKU, nama, brand, atau seller..."
            />
            <select
              v-model="sellerFilter"
              @change="applyFilter"
              class="block w-44 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Seller</option>
              <option v-for="s in sellers" :key="s" :value="s">{{ s }}</option>
            </select>
            <select
              v-model="categoryFilter"
              @change="applyFilter"
              class="block w-44 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
            <select
              v-model="connectionFilter"
              @change="applyFilter"
              class="block w-44 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Koneksi</option>
              <option value="connected">Sudah terhubung</option>
              <option value="disconnected">Belum terhubung</option>
            </select>
            <select
              v-model="availabilityFilter"
              @change="applyFilter"
              class="block w-44 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Ketersediaan</option>
              <option value="available">Tersedia</option>
              <option value="unavailable">Tidak tersedia</option>
              <option value="unknown">Belum diketahui</option>
            </select>
          </div>
        </template>

        <template #custom-actions>
          <button
            @click="handleSync"
            class="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            :disabled="isSyncing || isLoading"
          >
            <IconRefresh class="mr-2 w-4 h-4" :class="{ 'animate-spin': isSyncing }" />
            {{ isSyncing ? 'Memproses...' : 'Sinkronkan Produk Pascabayar Digiflazz' }}
          </button>
        </template>

        <template #cell-buyerSkuCode="{ row }">
          <span
            class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-md font-mono tracking-wide"
          >
            {{ row.buyerSkuCode || '-' }}
          </span>
        </template>

        <template #cell-name="{ row }">
          <div class="flex flex-col">
            <span class="text-[13px] font-semibold text-gray-800">{{ row.name || 'Nama belum tersedia' }}</span>
          </div>
        </template>

        <template #cell-sellerName="{ row }">
          <span class="text-sm text-gray-700">{{ row.sellerName || '-' }}</span>
        </template>

        <template #cell-kategori="{ row }">
          <div class="flex flex-col">
            <span class="text-xs font-medium text-gray-700">{{ row.category || '-' }}</span>
            <span class="text-[10px] text-gray-500">{{ row.brand || '-' }}</span>
          </div>
        </template>

        <template #cell-admin="{ row }">
          <span :class="row.admin === null || row.admin === undefined ? 'text-gray-400 font-normal text-xs' : ''">
            {{ formatRupiah(row.admin) }}
          </span>
        </template>

        <template #cell-commission="{ row }">
          <span
            :class="row.commission === null || row.commission === undefined ? 'text-gray-400 font-normal text-xs' : ''"
          >
            {{ formatRupiah(row.commission) }}
          </span>
        </template>

        <template #cell-buyerProductStatus="{ row }">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
            :class="statusClass(row.buyerProductStatus)"
          >
            {{ statusLabel(row.buyerProductStatus) }}
          </span>
        </template>

        <template #cell-sellerProductStatus="{ row }">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
            :class="statusClass(row.sellerProductStatus)"
          >
            {{ statusLabel(row.sellerProductStatus) }}
          </span>
        </template>

        <template #cell-produkInternal="{ row }">
          <div v-if="row.providerSelections && row.providerSelections.length" class="flex flex-col gap-1">
            <div v-for="m in row.providerSelections" :key="m.id" class="flex flex-col">
              <span class="text-xs font-semibold text-indigo-700">{{ m.produkPascabayar?.name || '-' }}</span>
              <span class="text-[10px] text-gray-500 font-mono">{{ m.produkPascabayar?.kode || '-' }}</span>
            </div>
          </div>
          <span
            v-else
            class="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-semibold rounded border border-slate-200"
          >
            Belum terhubung
          </span>
        </template>

        <template #cell-providerAktif="{ row }">
          <div v-if="row.providerSelections && row.providerSelections.length" class="flex flex-col items-center gap-1">
            <span
              v-for="m in row.providerSelections"
              :key="m.id"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              :class="m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
            >
              {{ m.isActive ? 'Aktif' : 'Kandidat' }}
            </span>
          </div>
          <span v-else class="text-[10px] text-gray-400">-</span>
        </template>

        <template #cell-syncedAt="{ row }">
          {{ formatDate(row.syncedAt) }}
        </template>

        <template #cell-action="{ row }">
          <div class="flex flex-col items-center gap-1">
            <div class="flex justify-center gap-2">
              <LightButton @click="handleDetail(row)" title="Lihat detail katalog">
                <IconListDetails class="w-4 h-4" />
              </LightButton>
              <LightButton @click="handleKoneksi(row)" title="Hubungkan ke produk internal">
                <IconPlug class="w-4 h-4" />
              </LightButton>
            </div>
            <button
              v-for="m in inactiveMappings(row)"
              :key="m.id"
              type="button"
              class="text-[10px] font-semibold rounded px-2 py-0.5 border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              :disabled="isSubmitting"
              :title="`Lepas koneksi ${m.produkPascabayar?.name || m.providerSku}`"
              @click="handleDisconnect(row, m)"
            >
              Lepas {{ m.produkPascabayar?.kode || m.providerSku }}
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <Notification
      :show-notification="showNotification"
      :notification-type="notificationType"
      :notification-message="notificationMessage"
      @close="hideNotification"
    />

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

    <DaftarProdukPascabayarSellerDigiflazzDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :item="selectedRow"
      @close="showDetailModal = false"
    />

    <DaftarProdukPascabayarSellerDigiflazzKoneksiModal
      v-if="showKoneksiModal"
      :show="showKoneksiModal"
      :item="selectedRow"
      @close="showKoneksiModal = false"
      @saved="handleKoneksiSaved"
      @notify="onNotify"
    />
  </div>
</template>