<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePagination } from '@/composables/usePaginations';
import BaseTable from '@/components/Table/BaseTable.vue';
import { laporanUmumService } from '@/service/administrator/laporanUmum';

const props = defineProps<{
  dateFilter: { startDate?: string; endDate?: string };
}>();

const tableColumns = [
  { key: 'date', label: 'Tanggal', headerClass: 'text-left w-[12%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'invoice', label: 'Invoice', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'member', label: 'Member', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'type', label: 'Jenis', headerClass: 'text-center w-[8%]', cellClass: 'text-center' },
  { key: 'produk', label: 'Produk / Layanan', headerClass: 'text-left w-[15%]', cellClass: 'text-left' },
  { key: 'tujuan', label: 'Tujuan', headerClass: 'text-left w-[10%]', cellClass: 'text-left' },
  { key: 'harga', label: 'Harga / Nominal', headerClass: 'text-right w-[10%]', cellClass: 'text-right' },
  { key: 'keuntungan', label: 'Keuntungan', headerClass: 'text-right w-[8%]', cellClass: 'text-right' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[7%] pr-4', cellClass: 'text-center pr-4' },
];

const dataRows = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const typeFilter = ref('all');

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 25, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await laporanUmumService.getTable(
      currentPage.value,
      perPage.value,
      searchQuery.value,
      props.dateFilter.startDate,
      props.dateFilter.endDate,
      typeFilter.value
    );
    dataRows.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data tabel transaksi:', error);
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

// Listen to date changes from parent
watch(() => props.dateFilter, () => {
  applyFilter();
}, { deep: true, immediate: true });

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date).replace(/\./g, ':');
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
};

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'sukses') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (s === 'proses' || s === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (s === 'gagal' || s === 'expired') return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100">
    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
      <h3 class="font-bold text-slate-800">Detail Transaksi & Deposit</h3>
    </div>
    
    <BaseTable
      :columns="tableColumns"
      :data="dataRows"
      :loading="isLoading"
      :pagination="paginationProps"
      @page-change="pageNow"
      :showNumbering="false"
      :showActions="false"
      :showSearch="false"
      :showAdd="false"
    >
      <template #filters>
        <div class="inline-flex rounded-xl shadow-sm my-4 px-4" role="group">
          <input
            type="text"
            id="search"
            class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
            v-model="searchQuery"
            @input="onSearch"
            placeholder="Cari invoice, tujuan, member..."
          />
          <select
            v-model="typeFilter"
            @change="applyFilter"
            class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="prabayar">Prabayar</option>
            <option value="pascabayar">Pascabayar</option>
            <option value="deposit">Deposit</option>
          </select>
        </div>
      </template>

      <template #cell-date="{ row }">
        <span class="text-[11px] text-gray-500 font-medium">{{ formatDate(row.date) }}</span>
      </template>

      <template #cell-invoice="{ row }">
        <span class="text-xs font-semibold text-slate-700">{{ row.invoice || '-' }}</span>
      </template>

      <template #cell-member="{ row }">
        <div class="flex flex-col">
          <span class="text-xs font-semibold text-gray-800 line-clamp-1">{{ row.member || 'Unknown' }}</span>
          <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ row.member_kode || '-' }}</span>
        </div>
      </template>

      <template #cell-type="{ row }">
        <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border bg-blue-50 text-blue-600 border-blue-100">
          {{ row.type }}
        </span>
      </template>

      <template #cell-produk="{ row }">
        <span class="text-xs text-slate-600 line-clamp-2" :title="row.produk">{{ row.produk || '-' }}</span>
      </template>

      <template #cell-tujuan="{ row }">
        <span class="text-xs font-medium text-slate-600">{{ row.tujuan || '-' }}</span>
      </template>

      <template #cell-harga="{ row }">
        <span class="text-xs font-semibold text-slate-800">{{ formatCurrency(row.harga) }}</span>
      </template>
      
      <template #cell-keuntungan="{ row }">
        <span class="text-xs font-semibold text-emerald-600" v-if="row.keuntungan > 0">{{ formatCurrency(row.keuntungan) }}</span>
        <span class="text-xs font-medium text-gray-400" v-else>-</span>
      </template>

      <template #cell-status="{ row }">
        <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border" :class="getStatusColor(row.status)">
          {{ row.status }}
        </span>
      </template>
    </BaseTable>
  </div>
</template>
