<script setup lang="ts">
import { IconListDetails, IconPlug, IconList } from '@/components/Icons';

import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, computed, shallowRef } from 'vue';

// Components
import ProdukPascabayarFormModal from './components/ProdukPascabayarFormModal.vue';
import ProdukPascabayarDetailModal from './components/ProdukPascabayarDetailModal.vue';
import ProdukPascabayarPilihServerModal from './components/ProdukPascabayarPilihServerModal.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';

// Button & Icons
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import IconDelete from '@/components/Icons/IconDelete.vue';
import IconEdit from '@/components/Icons/IconEdit.vue';
import { IconCheck, IconBan } from '@/components/Icons';
import ExpandableActionButton from '@/components/Button/ExpandableActionButton.vue';

import { ProdukPascabayarService } from './services/ProdukPascabayarService';
import type { Produk } from './types/ProdukPascabayar';
import { kategoriService } from '@/service/administrator/kategori';

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
  { key: 'checkbox', label: '', headerClass: 'w-12 text-center', cellClass: 'text-center' },
  { key: 'kode', label: 'Kode', headerClass: 'text-left w-[15%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'name', label: 'Nama Produk', headerClass: 'text-left w-[20%]', cellClass: 'text-left' },
  { key: 'server', label: 'Server', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'harga', label: 'Harga (Beli / Jual)', headerClass: 'text-right w-[15%]', cellClass: 'text-right' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[15%]', cellClass: 'text-center' },
];

const dataProduk = shallowRef<Produk[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const filterkategoriId = ref('');

// List Options
const listKategori = ref<any[]>([]);
// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedProduk = ref<Produk | null>(null);
const isSubmitting = ref(false);

// Detail State
const showDetailModal = ref(false);

// Pilih Server State
const showServerModal = ref(false);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 150, totalRow: 0 },
);

// Selection State
const selectedProducts = ref<number[]>([]);
const isBulkActionLoading = ref(false);
const isSelectingAll = ref(false);

const isAllSelected = computed(() => {
  return dataProduk.value.length > 0 && selectedProducts.value.length === dataProduk.value.length;
});

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

const bulkUpdateStatus = async (status: 'active' | 'inactive') => {
  if (selectedProducts.value.length === 0) return;
  
  const actionText = status === 'active' ? 'mengaktifkan' : 'menonaktifkan';
  
  displayConfirmation(
    `Konfirmasi ${status === 'active' ? 'Aktivasi' : 'Nonaktivasi'} Massal`,
    `Apakah Anda yakin ingin ${actionText} ${selectedProducts.value.length} produk yang dipilih?`,
    async () => {
      isBulkActionLoading.value = true;
      try {
        await ProdukPascabayarService.bulkUpdateStatus(selectedProducts.value, status);
        displayNotification(`Berhasil ${actionText} ${selectedProducts.value.length} produk`, 'success');
        selectedProducts.value = [];
        fetchData();
      } catch (error: any) {
        displayNotification(error.response?.data?.message || `Gagal ${actionText} produk`, 'error');
        console.error(`Error bulk update status:`, error);
      } finally {
        isBulkActionLoading.value = false;
      }
    }
  );
};

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await ProdukPascabayarService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      statusFilter.value,
      filterkategoriId.value
    );
    dataProduk.value = response.data.data.list;
    totalRow.value = response.data.data.total;
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

const handleDelete = (row: Produk) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus produk <strong>${row.name}</strong>?`,
    async () => {
      try {
        await ProdukPascabayarService.delete(row.id);
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

const fetchKategoris = async () => {
  try {
    const response = await kategoriService.getAll('', 1000, 1);
    let Kategoris = response.data.data.list || response.data.data;
    listKategori.value = Kategoris.sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Gagal mengambil Kategori:', error);
  }
};

onMounted(() => {
  fetchKategoris();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
    <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
          Produk Pascabayar
        </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
          Kelola daftar produk, konfigurasi Fee, dan comission margin.
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
            v-model="filterkategoriId"
            @change="applyFilter"
            class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option v-for="op in listKategori" :key="op.id" :value="op.id">
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

      <!-- Bulk Actions -->
      <template #custom-actions>
        <ExpandableActionButton
          v-if="selectedProducts.length > 0"
          :label="`Aktifkan Terpilih (${selectedProducts.length})`"
          title="Aktifkan Terpilih"
          class="bg-emerald-500 hover:bg-emerald-600 text-white border-none"
          :disabled="isBulkActionLoading"
          @click="bulkUpdateStatus('active')"
        >
          <template #icon>
            <IconCheck class="w-5 h-5 text-white" />
          </template>
        </ExpandableActionButton>
        
        <ExpandableActionButton
          v-if="selectedProducts.length > 0"
          :label="`Nonaktifkan Terpilih (${selectedProducts.length})`"
          title="Nonaktifkan Terpilih"
          class="bg-rose-500 hover:bg-rose-600 text-white border-none"
          :disabled="isBulkActionLoading"
          @click="bulkUpdateStatus('inactive')"
        >
          <template #icon>
            <IconBan class="w-5 h-5 text-white" />
          </template>
        </ExpandableActionButton>

      </template>

      <!-- Checkbox Column -->
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
          <div v-if="row.kategori" class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[11px] font-medium text-gray-500">{{ row.kategori.name }}</span>
            <span v-if="row.kategori.kode" class="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold rounded-md font-mono tracking-wide shadow-sm">
              {{ row.kategori.kode }}
            </span>
          </div>
        </div>
      </template>

      <template #cell-server="{ row }">
        <div class="flex flex-col gap-1.5 items-start">
          <span 
            v-for="iak in row.iakPascabayarProducts" 
            :key="'iak-' + iak.id"
            :class="['px-2.5 py-1 text-[11px] rounded-md shadow-sm border whitespace-nowrap', 
              row.serverId === 1 ? 'font-bold bg-sky-100 text-sky-800 border-sky-300' : 'font-medium bg-gray-50 text-gray-600 border-gray-200']"
          >
            IAK: {{ iak.name }}
            <span v-if="iak.fee" class="text-emerald-600 font-bold ml-1">[{{ formatCurrency(iak.fee) }}]</span>
          </span>

          <span v-if="(!row.iakPascabayarProducts || row.iakPascabayarProducts.length === 0)" 
                class="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-md whitespace-nowrap shadow-sm">
            Tanpa Provider
          </span>
        </div>
      </template>
      
      <template #cell-harga="{ row }">
        <div class="flex flex-col items-end justify-center pr-4">
          <span class="font-bold text-gray-900 text-[14px]">{{ formatCurrency(row.fee) }}</span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Jual</span>
            <span class="text-[12px] text-emerald-600 font-extrabold">{{ formatCurrency((row.fee || 0) + (row.comission || 0)) }}</span>
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
      @click="confirm"
      class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none shadow-[0_0_15px_rgba(225,29,72,0.5)]"
    >
      Hapus
    </button>
  </Confirmation>

  <ProdukPascabayarFormModal
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

  <ProdukPascabayarDetailModal
    :show="showDetailModal"
    :data="selectedProduk"
    @close="
      showDetailModal = false;
      selectedProduk = null;
    "
  />

  <ProdukPascabayarPilihServerModal
    :show="showServerModal"
    :produk="selectedProduk"
    @close="showServerModal = false; selectedProduk = null;"
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
