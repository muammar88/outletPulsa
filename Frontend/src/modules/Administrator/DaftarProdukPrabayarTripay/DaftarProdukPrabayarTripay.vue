<script setup lang="ts">
import { IconListDetails, IconPlug, IconList } from '@/components/Icons';

import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref, computed } from 'vue';

// Table & Modal
import BaseTable from '@/components/Table/BaseTable.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DaftarProdukPrabayarTripayDetailModal from './components/DaftarProdukPrabayarTripayDetailModal.vue';
import DaftarProdukPrabayarTripayKoneksiModal from './components/DaftarProdukPrabayarTripayKoneksiModal.vue';

// Service
import { daftarProdukPrabayarTripayService } from '@/service/administrator/daftarProdukPrabayarTripay';
import { operatorPrabayarTripayService } from '@/service/administrator/operatorPrabayarTripay';

// Utils
import dayjs from 'dayjs';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';

const tableColumns = [
  {
    key: 'kode',
    label: 'Kode Produk Prabayar',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-medium text-gray-800',
  },
  {
    key: 'name',
    label: 'Nama Produk Prabayar',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left',
  },
  {
    key: 'operator',
    label: 'Operator / Kategori',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'produk',
    label: 'Produk Prabayar Internal',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'price',
    label: 'Harga',
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
const connectionFilter = ref('');
const filterOperatorId = ref('');
const filterKategori = ref('');
const listOperators = ref<any[]>([]);

const listKategori = computed(() => {
  const kats = new Set<string>();
  listOperators.value.forEach(op => {
    kats.add(op.kategori?.name || 'Lainnya');
  });
  return Array.from(kats).sort();
});

const filteredOperators = computed(() => {
  if (!filterKategori.value) return listOperators.value;
  return listOperators.value.filter(op => (op.kategori?.name || 'Lainnya') === filterKategori.value);
});

// Detail Modal State
const showDetailModal = ref(false);
const showKoneksiModal = ref(false);
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

const confirmButtonText = ref('Ya, Scan Sekarang');
const confirmButtonClass = ref('bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.5)]');

const fetchOperators = async () => {
  try {
    const res = await operatorPrabayarTripayService.getAll('', 1000, 1);
    let ops = [];
    if (res?.data?.data?.list) {
      ops = res.data.data.list;
    } else if (Array.isArray(res?.data?.data)) {
      ops = res.data.data;
    } else if (Array.isArray(res?.data)) {
      ops = res.data;
    }
    
    listOperators.value = ops
      .filter((op: any) => op && op.name)
      .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
  } catch (error) {
    console.error('Failed to fetch operators', error);
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

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await daftarProdukPrabayarTripayService.getAll(
      currentPage.value,
      perPage.value,
      searchQuery.value,
      filterOperatorId.value,
      '',
      '',
      connectionFilter.value
    );
    dataProduk.value = response.data.data.list;
    totalRow.value = response.data.data.meta.total;
  } catch (error) {
    console.error('Gagal mengambil data produk prabayar tripay:', error);
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

const handleDetail = (row: any) => {
  selectedProduk.value = row;
  showDetailModal.value = true;
};

const handleKoneksi = (row: any) => {
  selectedProduk.value = row;
  showKoneksiModal.value = true;
};

const handleKoneksiSaved = () => {
  showKoneksiModal.value = false;
  displayNotification('Berhasil menghubungkan produk prabayar Tripay dengan produk prabayar internal', 'success');
  fetchData();
};

const loadingStatusId = ref<number | null>(null);

const confirmToggleStatus = (row: any) => {
  const isCurrentlyActive = row.status === 'ACTIVE' || row.status === 'active';
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
        await daftarProdukPrabayarTripayService.toggleStatus(row.id);
        displayNotification(`Status produk berhasil diubah menjadi ${targetStatus}.`, 'success');
        // Update state locally without a full reload
        row.status = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
      } catch (error: any) {
        displayNotification('Gagal memperbarui status: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
        loadingStatusId.value = null;
      }
    }
  );
};

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const handleSync = () => {
  confirmButtonText.value = 'Ya, Scan Sekarang';
  confirmButtonClass.value = 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.5)]';
  
  displayConfirmation(
    'Konfirmasi Scan berantai',
    'Sistem akan melakukan sinkronisasi berantai mulai dari Kategori, Operator, hingga Produk Prabayar. Ini mungkin memakan waktu agak lama.',
    async () => {
      isLoading.value = true;
      try {
        const response = await daftarProdukPrabayarTripayService.sync();
        await fetchData();
        
        const data = response.data.data;
        displayNotification(
          `Sinkronisasi Hierarkis Selesai.<br/>` +
          `<b>Kategori</b> (Baru: ${data.categories?.inserted || 0}, Diperbarui: ${data.categories?.updated || 0})<br/>` +
          `<b>Operator</b> (Baru: ${data.operators?.inserted || 0}, Diperbarui: ${data.operators?.updated || 0})<br/>` +
          `<b>Produk Prabayar</b> (Baru: ${data.products?.inserted || 0}, Diperbarui: ${data.products?.updated || 0})`,
          'success'
        );
      } catch (error: any) {
        displayNotification(
          'Gagal sinkronisasi: ' + (error.response?.data?.message || error.message),
          'error'
        );
      } finally {
        isLoading.value = false;
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
            Daftar Produk Prabayar Tripay
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Produk Prabayar PPOB Tripay
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataProduk"
        :is-loading="isLoading"
        search-placeholder="Cari kode atau nama produk prabayar..."
        :pagination="paginationProps"
        :show-add="false"
        :show-search="false"
        :show-actions="false"
        @search="fetchData"
        @page-change="(page) => { currentPage = page; fetchData(); }"
        @refresh="fetchData"
      >
        <template #filters>
          <div class="flex gap-3">
            <div class="inline-flex rounded-xl shadow-sm" role="group">
              <input
                type="text"
                id="search"
                class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
                v-model="searchQuery"
                @input="onSearch"
                placeholder="Cari kode atau nama produk prabayar..."
              />
              <select
                v-model="filterKategori"
                @change="onCategoryChange"
                class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option v-for="kat in listKategori" :key="kat" :value="kat">
                  {{ kat }}
                </option>
              </select>
              <select
                v-model="filterOperatorId"
                @change="applyFilter"
                class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Operator</option>
                <option v-for="op in filteredOperators" :key="op.id" :value="op.id">
                  {{ op.name }} {{ op.kode ? `(${op.kode})` : '' }}
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
        
        <!-- Tombol Sync -->
        <template #custom-actions>
          <button
            @click="handleSync"
            class="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            :disabled="isLoading"
          >
            <IconPlug v-if="!isLoading" class="w-4 h-4 mr-2" />
            <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scan Produk Prabayar Tripay
          </button>
        </template>

        <!-- Custom Cells -->
        <template #cell-operator="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-800">{{ row.operator?.name || '-' }}</span>
            <span class="text-xs text-gray-500">{{ row.operator?.kategori?.name || '-' }}</span>
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
          {{ formatCurrency(row.price) }}
        </template>

        <template #cell-status="{ row }">
          <div class="flex flex-col items-center justify-center gap-1.5">
            <button
              type="button"
              @click="confirmToggleStatus(row)"
              class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="(row.status === 'ACTIVE' || row.status === 'active') ? 'bg-emerald-500' : 'bg-gray-300'"
              :disabled="loadingStatusId === row.id"
              :title="(row.status === 'ACTIVE' || row.status === 'active') ? 'Nonaktifkan Produk' : 'Aktifkan Produk'"
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center"
                :class="(row.status === 'ACTIVE' || row.status === 'active') ? 'translate-x-4' : 'translate-x-0'"
              >
                <svg v-if="loadingStatusId === row.id" class="animate-spin h-3 w-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </button>
            <span
              class="text-[10px] font-bold uppercase tracking-wider"
              :class="(row.status === 'ACTIVE' || row.status === 'active') ? 'text-emerald-600' : 'text-gray-500'"
            >
              {{ (row.status === 'ACTIVE' || row.status === 'active') ? 'Active' : (row.status === 'GANGGUAN' ? 'Gangguan' : 'Inactive') }}
            </span>
          </div>
        </template>

        <!-- Kolom Action -->
        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleDetail(row)" title="Lihat Detail Produk Prabayar">
              <IconListDetails class="w-4 h-4" />
            </LightButton>
            <LightButton @click="handleKoneksi(row)" title="Koneksikan Produk Prabayar Internal">
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
    <DaftarProdukPrabayarTripayDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :produk="selectedProduk"
      @close="showDetailModal = false"
    />

    <DaftarProdukPrabayarTripayKoneksiModal
      v-if="showKoneksiModal"
      :show="showKoneksiModal"
      :produk="selectedProduk"
      @close="showKoneksiModal = false"
      @saved="handleKoneksiSaved"
    />
  </div>
</template>
