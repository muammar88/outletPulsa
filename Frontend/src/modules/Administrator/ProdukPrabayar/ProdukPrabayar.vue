<script setup lang="ts">
import { IconListDetails, IconPlug, IconList, IconCheck, IconBan } from '@/components/Icons';

import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, computed, shallowRef } from 'vue';

// Components
import ProdukPrabayarFormModal from './components/ProdukPrabayarFormModal.vue';
import ProdukPrabayarDetailModal from './components/ProdukPrabayarDetailModal.vue';
import ProdukPrabayarPilihServerModal from './components/ProdukPrabayarPilihServerModal.vue';
import ProdukPrabayarMarkupModal from './components/ProdukPrabayarMarkupModal.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';

// Button & Icons
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import ExpandableActionButton from '@/components/Button/ExpandableActionButton.vue';
import IconDelete from '@/components/Icons/IconDelete.vue';
import IconEdit from '@/components/Icons/IconEdit.vue';

import { ProdukPrabayarService } from './services/ProdukPrabayarService';
import type { Produk } from './types/ProdukPrabayar';
import { operatorService } from '@/service/administrator/operator';

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
  { key: 'checkbox', label: '', headerClass: 'w-[5%] text-center', cellClass: 'text-center' },
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[15%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'name', label: 'Nama Produk', headerClass: 'text-left w-[20%]', cellClass: 'text-left' },
  { key: 'server', label: 'Server', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'harga', label: 'Harga (Beli / Jual)', headerClass: 'text-right w-[15%]', cellClass: 'text-right' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[20%]', cellClass: 'text-center' },
];

const dataProduk = shallowRef<Produk[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const filterOperatorId = ref('');
const filterKategori = ref('');

// List Options
const listOperator = ref<any[]>([]);

const serverSummary = ref({
  iak: 0,
  tripay: 0,
  digiflazz: 0,
  unconnected: 0,
});

const listKategori = computed(() => {
  const kats = new Set<string>();
  listOperator.value.forEach(op => {
    kats.add(op.kategori?.name || 'Lainnya');
  });
  return Array.from(kats).sort();
});

const filteredOperators = computed(() => {
  if (!filterKategori.value) return listOperator.value;
  return listOperator.value.filter(op => (op.kategori?.name || 'Lainnya') === filterKategori.value);
});
// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedProduk = ref<Produk | null>(null);
const isSubmitting = ref(false);

// Detail State
const showDetailModal = ref(false);

// Pilih Server State
const showServerModal = ref(false);

// Markup State
const showMarkupModal = ref(false);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 150, totalRow: 0 },
);

const selectedProducts = ref<number[]>([]);
const isBulkActionLoading = ref(false);

const isAllSelected = computed(() => {
  return dataProduk.value.length > 0 && selectedProducts.value.length === dataProduk.value.length;
});

const isSelectingAll = ref(false);

const toggleSelectAll = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  isSelectingAll.value = true;
  
  setTimeout(() => {
    if (isChecked) {
      selectedProducts.value = dataProduk.value.map(p => p.id);
    } else {
      selectedProducts.value = [];
    }
    isSelectingAll.value = false;
  }, 50);
};

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await ProdukPrabayarService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      statusFilter.value,
      filterOperatorId.value
    );
    dataProduk.value = response.data.data.list;
    totalRow.value = response.data.data.total;
    if (response.data.data.summary) {
      serverSummary.value = response.data.data.summary;
    }
    // Reset selection on fetch
    selectedProducts.value = [];
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

const onCategoryChange = () => {
  filterOperatorId.value = '';
  applyFilter();
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

const handlePilihServer = (row: Produk) => {
  selectedProduk.value = { ...row };
  showServerModal.value = true;
};

const handleEditMarkup = (row: Produk) => {
  selectedProduk.value = { ...row };
  showMarkupModal.value = true;
};

const handleDelete = (row: Produk) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus produk <strong>${row.name}</strong>?`,
    async () => {
      try {
        await ProdukPrabayarService.delete(row.id);
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

const fetchOperators = async () => {
  try {
    const response = await operatorService.getAll('', 1000, 1);
    let operators = response.data.data.list || response.data.data;
    listOperator.value = operators.sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Gagal mengambil operator:', error);
  }
};

const isSyncingTermurah = ref(false);

const handlePilihTermurah = () => {
  displayConfirmation(
    'Konfirmasi Pilih Termurah',
    'Apakah Anda yakin ingin mencari dan mengatur produk termurah secara otomatis? Proses ini akan memperbarui status dan harga beli pada semua produk prabayar Anda berdasarkan server yang terkoneksi.',
    async () => {
      isSyncingTermurah.value = true;
      try {
        const response = await ProdukPrabayarService.syncTermurah();
        const data = response.data.data;
        displayNotification(
          `Berhasil memproses produk!<br>
          <ul class="list-disc pl-4 mt-2 text-sm text-left">
            <li>Berhasil diperbarui: <b>${data.berhasil_diperbarui}</b></li>
            <li>Dinonaktifkan: <b>${data.dinonaktifkan}</b></li>
            <li>Tanpa koneksi: <b>${data.tidak_ada_koneksi}</b></li>
            <li>Gagal: <b>${data.gagal}</b></li>
          </ul>`,
          'success'
        );
        fetchData();
      } catch (error) {
        displayNotification('Gagal memproses produk termurah', 'error');
        console.error('Error sync termurah:', error);
      } finally {
        isSyncingTermurah.value = false;
      }
    }
  );
};

const handleBulkUpdateStatus = (status: 'active' | 'inactive') => {
  if (selectedProducts.value.length === 0) return;

  const actionName = status === 'active' ? 'mengaktifkan' : 'menonaktifkan';

  displayConfirmation(
    `Konfirmasi ${status === 'active' ? 'Aktifkan' : 'Nonaktifkan'} Produk`,
    `Apakah Anda yakin ingin ${actionName} <strong>${selectedProducts.value.length}</strong> produk yang dipilih secara bersamaan?`,
    async () => {
      isBulkActionLoading.value = true;
      try {
        const response = await ProdukPrabayarService.bulkUpdateStatus(selectedProducts.value, status);
        const result = response.data.data;
        
        displayNotification(
          `Berhasil memproses produk!<br>
          <ul class="list-disc pl-4 mt-2 text-sm text-left">
            <li>Total dipilih: <b>${selectedProducts.value.length}</b></li>
            <li>Berhasil ${actionName}: <b>${result.success}</b></li>
            ${status === 'active' ? `<li>Dilewati (tanpa provider): <b>${result.skipped}</b></li>` : ''}
            <li>Gagal: <b>${result.failed}</b></li>
          </ul>`,
          result.success > 0 ? 'success' : 'warning'
        );
        fetchData();
      } catch (error) {
        displayNotification(`Gagal ${actionName} produk`, 'error');
        console.error(`Error bulk ${status}:`, error);
      } finally {
        isBulkActionLoading.value = false;
      }
    }
  );
};

onMounted(() => {
  fetchOperators();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
          Produk Prabayar
        </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
          Kelola daftar produk, konfigurasi harga beli, dan markup margin.
        </p>
      </div>

      <!-- Server Cards -->
      <div class="flex gap-2 flex-wrap">
        <div class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm flex flex-col items-center w-[96px]">
          <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">IAK</span>
          <span class="text-sm font-black text-gray-800">{{ serverSummary.iak }}</span>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm flex flex-col items-center w-[96px]">
          <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Tripay</span>
          <span class="text-sm font-black text-gray-800">{{ serverSummary.tripay }}</span>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm flex flex-col items-center w-[96px]">
          <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Digiflazz</span>
          <span class="text-sm font-black text-gray-800">{{ serverSummary.digiflazz }}</span>
        </div>
        <div class="bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5 shadow-sm flex flex-col items-center w-[96px]">
          <span class="text-[9px] font-bold text-rose-500 uppercase tracking-wider mb-0.5 whitespace-nowrap">Tanpa Server</span>
          <span class="text-sm font-black text-rose-700">{{ serverSummary.unconnected }}</span>
        </div>
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
      <template #custom-actions>
        <ExpandableActionButton
          v-if="selectedProducts.length > 0"
          :label="`Aktifkan Terpilih (${selectedProducts.length})`"
          title="Aktifkan Terpilih"
          variant="emerald"
          :loading="isBulkActionLoading"
          @click="handleBulkUpdateStatus('active')"
        >
          <template #icon>
            <IconCheck class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </template>
        </ExpandableActionButton>

        <ExpandableActionButton
          v-if="selectedProducts.length > 0"
          :label="`Nonaktifkan Terpilih (${selectedProducts.length})`"
          title="Nonaktifkan Terpilih"
          variant="rose"
          :loading="isBulkActionLoading"
          @click="handleBulkUpdateStatus('inactive')"
        >
          <template #icon>
            <IconBan class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </template>
        </ExpandableActionButton>

        <ExpandableActionButton
          :label="'Pilih Produk Termurah'"
          title="Pilih Produk Termurah"
          variant="slate"
          :loading="isSyncingTermurah"
          @click="handlePilihTermurah"
        >
          <template #icon>
            <IconCheck class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </template>
        </ExpandableActionButton>
      </template>
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
            v-model="filterKategori"
            @change="onCategoryChange"
            class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option v-for="kat in listKategori" :key="kat" :value="kat">
              {{ kat }}
            </option>
          </select>
          <select
            v-model="filterOperatorId"
            @change="applyFilter"
            class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Semua Operator</option>
            <option v-for="op in filteredOperators" :key="op.id" :value="op.id">
              {{ op.kode ? `${op.name} (${op.kode})` : op.name }}
            </option>
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
      <template #header-checkbox>
        <div class="flex items-center justify-center">
          <input 
            type="checkbox" 
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 text-[#0f2155] bg-gray-100 border-gray-300 rounded focus:ring-[#0f2155] focus:ring-2 cursor-pointer transition-all"
          >
        </div>
      </template>

      <template #cell-checkbox="{ row }">
        <div class="flex items-center justify-center">
          <input 
            type="checkbox" 
            :value="row.id"
            v-model="selectedProducts"
            class="w-4 h-4 text-[#0f2155] bg-gray-100 border-gray-300 rounded focus:ring-[#0f2155] focus:ring-2 cursor-pointer transition-all"
          >
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
          <div v-if="row.operator" class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[11px] font-medium text-gray-500">{{ row.operator.name }}</span>
            <span v-if="row.operator.kode" class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold rounded-md font-mono tracking-wide shadow-sm">
              {{ row.operator.kode }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-server="{ row }">
        <div class="flex flex-col gap-1.5 items-start">
          <span 
            v-for="iak in row.iakPrabayarProduks" 
            :key="'iak-' + iak.id"
            :class="['px-2.5 py-1 text-[11px] rounded-md shadow-sm border whitespace-nowrap', 
              row.serverId === 1 ? 'font-bold bg-sky-100 text-sky-800 border-sky-300' : 'font-medium bg-gray-50 text-gray-600 border-gray-200']"
          >
            IAK: {{ iak.name }}
            <span v-if="iak.nominal" class="text-emerald-600 font-bold ml-1">[{{ iak.nominal }}]</span>
          </span>
          <span 
            v-for="tripay in row.tripayPrabayarProduks" 
            :key="'tripay-' + tripay.id"
            :class="['px-2.5 py-1 text-[11px] rounded-md shadow-sm border whitespace-nowrap', 
              row.serverId === 2 ? 'font-bold bg-sky-100 text-sky-800 border-sky-300' : 'font-medium bg-gray-50 text-gray-600 border-gray-200']"
          >
            Tripay: {{ tripay.name }}
          </span>
          <span 
            v-for="digi in row.digiflazzProducts" 
            :key="'digi-' + digi.id"
            :class="['px-2.5 py-1 text-[11px] rounded-md shadow-sm border whitespace-nowrap', 
              row.serverId === 3 ? 'font-bold bg-sky-100 text-sky-800 border-sky-300' : 'font-medium bg-gray-50 text-gray-600 border-gray-200']"
          >
            Digiflazz: {{ digi.name }}
          </span>

          <span v-if="(!row.iakPrabayarProduks || row.iakPrabayarProduks.length === 0) && (!row.tripayPrabayarProduks || row.tripayPrabayarProduks.length === 0) && (!row.digiflazzProducts || row.digiflazzProducts.length === 0)" 
                class="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-md whitespace-nowrap shadow-sm">
            Tanpa Provider
          </span>
        </div>
      </template>
      
      <template #cell-harga="{ row }">
        <div class="flex flex-col items-end justify-center pr-4">
          <span class="font-bold text-gray-900 text-[14px]">{{ formatCurrency(row.purchase_price) }}</span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Jual</span>
            <span class="text-[12px] text-emerald-600 font-extrabold">{{ formatCurrency((row.purchase_price || 0) + (row.markup || 0)) }}</span>
          </div>
          <div class="mt-1">
            <span class="px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md shadow-sm">
              Markup: {{ formatCurrency(row.markup || 0) }}
            </span>
          </div>
        </div>
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
          <LightButton @click="handleEditMarkup(row)" title="Edit Markup" class="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </LightButton>
          <LightButton @click="handlePilihServer(row)" title="Pilih Server Aktif" class="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all">
            <IconPlug class="w-4 h-4" />
          </LightButton>
          <LightButton @click="handleDetail(row)" title="Detail Produk" class="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
            <IconListDetails class="w-4 h-4" />
          </LightButton>
          <LightButton @click="handleEdit(row)" title="Edit Produk" class="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all">
            <IconEdit />
          </LightButton>
          <DangerButton @click="handleDelete(row)" title="Hapus Produk" class="hover:shadow-md transition-all">
            <IconDelete />
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
      v-if="confirmTitle.toLowerCase().includes('hapus')"
      @click="confirm"
      class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none shadow-[0_0_15px_rgba(225,29,72,0.5)]"
    >
      Hapus
    </button>
    <button
      v-else
      @click="confirm"
      class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none shadow-[0_0_15px_rgba(5,150,105,0.5)]"
    >
      Lanjutkan
    </button>
  </Confirmation>

  <ProdukPrabayarFormModal
    :show="showFormModal"
    :mode="formMode"
    :initial-data="selectedProduk"
    :loading="isSubmitting"
    :operators="listOperator"
    @close="
      showFormModal = false;
      fetchData();
      selectedProduk = null;
    "
  />

  <ProdukPrabayarDetailModal
    :show="showDetailModal"
    :data="selectedProduk"
    @close="
      showDetailModal = false;
      selectedProduk = null;
    "
  />

  <ProdukPrabayarPilihServerModal
    :show="showServerModal"
    :produk="selectedProduk"
    @close="showServerModal = false; selectedProduk = null;"
    @refresh="fetchData"
    @notify="(msg, type) => displayNotification(msg, type)"
  />

  <ProdukPrabayarMarkupModal
    :show="showMarkupModal"
    :produk="selectedProduk"
    @close="showMarkupModal = false; selectedProduk = null;"
    @refresh="fetchData"
    @notify="(msg, type) => displayNotification(msg, type)"
  />

  <!-- Loading Overlay for Select All -->
  <transition name="fade">
    <div v-if="isSelectingAll" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm mx-4 transform transition-all">
        <div class="relative w-16 h-16 mb-4">
          <svg class="animate-spin w-full h-full text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">Memproses Pilihan</h3>
        <p class="text-sm text-slate-500 text-center">Mohon tunggu sebentar, sistem sedang memproses pilihan Anda...</p>
      </div>
    </div>
  </transition>
  </div>
</template>
