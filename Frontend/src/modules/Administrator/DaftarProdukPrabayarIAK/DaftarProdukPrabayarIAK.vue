<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref, computed } from 'vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import IconEcosystem from '@/components/Icons/IconEcosystem.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';
import LightButton from '@/components/Button/LightButton.vue';
import DaftarprodukPrabayarIakDetailModal from './components/DaftarprodukPrabayarIakDetailModal.vue';
import DaftarprodukPrabayarIakKoneksiModal from './components/DaftarprodukPrabayarIakKoneksiModal.vue';
import { produkPrabayarIakService } from '@/service/administrator/produkPrabayarIak';
import { operatorIakService } from '@/service/administrator/operatorIak';

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
    label: 'Operator / Type',
    headerClass: 'text-left w-[15%]',
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

const dataprodukPrabayarIak = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const connectionFilter = ref('');
const filterOperatorId = ref('');
const filterKategori = ref('');
const listOperators = ref<any[]>([]);

const listKategori = computed(() => {
  const kats = new Set<string>();
  listOperators.value.forEach(op => {
    kats.add(op.type?.type || 'Lainnya');
  });
  return Array.from(kats).sort();
});

const filteredOperators = computed(() => {
  if (!filterKategori.value) return listOperators.value;
  return listOperators.value.filter(op => (op.type?.type || 'Lainnya') === filterKategori.value);
});

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
    const res = await operatorIakService.getAll('', 1000, 1);
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
    const response = await produkPrabayarIakService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      filterOperatorId.value,
      connectionFilter.value
    );
    dataprodukPrabayarIak.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data:', error);
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
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
};

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
  displayNotification('Berhasil menghubungkan produk prabayar IAK dengan produk prabayar internal', 'success');
  fetchData();
};

const handleSync = () => {
  confirmButtonText.value = 'Ya, Scan Sekarang';
  confirmButtonClass.value = 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(5,150,105,0.5)]';
  
  displayConfirmation(
    'Konfirmasi Scan IAK',
    'Sistem akan melakukan sinkronisasi otomatis dari server IAK mulai dari Tipe, Operator, hingga Produk Prabayar. Ini memakan waktu beberapa saat.',
    async () => {
      isLoading.value = true;
      try {
        const response = await produkPrabayarIakService.sync();
        await fetchData();
        
        const data = response.data.data;
        displayNotification(
          `Sinkronisasi IAK Selesai.<br/>` +
          `<b>Produk Prabayar IAK</b> (Baru: ${data.inserted || 0}, Diperbarui: ${data.updated || 0})<br/>` +
          `Total Produk Prabayar: ${data.total || 0}`,
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
            Daftar Produk Prabayar IAK
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen katalog produk prabayar yang terhubung dengan IAK
          </p>
        </div>
      </div>

      <BaseTable
          :columns="tableColumns"
          :data="dataprodukPrabayarIak"
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
                  {{ op.name }}
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
              <IconEcosystem v-if="!isLoading" class="w-4 h-4 mr-2" />
              <svg v-else class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scan Produk Prabayar IAK
            </button>
          </template>

          <template #cell-kode="{ row }">
            <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md font-mono tracking-wide shadow-sm">
              {{ row.kode }}
            </span>
          </template>

          <template #cell-name="{ row }">
            <div class="flex flex-col">
              <span class="text-[14px] font-bold text-gray-800 tracking-tight">{{ row.name }}</span>
              <span v-if="row.nominal" class="text-[11px] font-semibold text-emerald-600 mt-0.5 tracking-wide">
                Nominal: {{ row.nominal }}
              </span>
            </div>
          </template>

          <template #cell-operator="{ row }">
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="font-medium text-gray-800">{{ row.operator?.name || '-' }}</span>
              </div>
              <span class="text-xs text-gray-500 mt-0.5">{{ row.operator?.type?.type || '-' }}</span>
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
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              :class="{
                'bg-emerald-50 text-emerald-700 border border-emerald-200/60': row.status === 'ACTIVE' || row.status === 'active',
                'bg-rose-50 text-rose-700 border border-rose-200/60': row.status === 'INACTIVE' || row.status === 'inactive' || row.status === 'GANGGUAN',
                'bg-gray-100 text-gray-800': !row.status
              }"
            >
              {{ row.status || 'UNKNOWN' }}
            </span>
          </template>

          <template #cell-action="{ row }">
            <div class="flex justify-center gap-2">
              <LightButton @click="handleDetail(row)" title="Lihat Detail Produk Prabayar">
                <IconDetail class="w-4 h-4" />
              </LightButton>
              <LightButton @click="handleKoneksi(row)" title="Koneksikan Produk Prabayar Internal">
                <IconEcosystem class="w-4 h-4" />
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

    <!-- Modals -->
    <DaftarprodukPrabayarIakDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :produk="selectedProduk"
      @close="showDetailModal = false"
    />

    <DaftarprodukPrabayarIakKoneksiModal
      v-if="showKoneksiModal"
      :show="showKoneksiModal"
      :produk="selectedProduk"
      @close="showKoneksiModal = false"
      @saved="handleKoneksiSaved"
    />
  </div>
</template>
