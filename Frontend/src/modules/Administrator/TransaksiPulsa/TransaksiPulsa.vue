<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import TransaksiDetailModal from '@/modules/Administrator/TransaksiPulsa/components/TransaksiDetailModal.vue';
// Button
import LightButton from '@/components/Button/LightButton.vue';
// Icon
import InfoIcon from '@/components/Icons/InfoIcon.vue';
import { transaksiPulsaService } from '@/service/administrator/transaksi_pulsa';

// Definisi Kolom Tabel & Interface
const tableColumns = [
  {
    key: 'kode',
    label: 'No. Transaksi',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'createdAt',
    label: 'Tanggal',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'member',
    label: 'Member',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'nomorTujuan',
    label: 'Nomor Tujuan',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left font-semibold',
  },
  {
    key: 'produk',
    label: 'Produk',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'harga',
    label: 'Harga / Laba',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
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
    headerClass: 'text-center w-[5%]',
    cellClass: 'text-center',
  },
];

const dataTransaksi = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');

// Modal State
const showDetailModal = ref(false);
const selectedTransactionId = ref<number | null>(null);

// Inisialisasi Composable Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 10, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await transaksiPulsaService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      statusFilter.value
    );
    dataTransaksi.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data transaksi:', error);
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

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleDetail = (row: any) => {
  selectedTransactionId.value = row.id;
  showDetailModal.value = true;
};

const applyFilter = () => {
  currentPage.value = 1;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="px-8 py-6">
    <div class="mb-10 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black font-semibold text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight">
          Transaksi Pulsa
        </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
          Manajemen dan Riwayat Transaksi Pulsa
        </p>
      </div>
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="dataTransaksi"
      :loading="isLoading"
      :pagination="paginationProps"
      search-placeholder="Cari no. trx, member, tujuan..."
      @search="fetchData"
      @page-change="pageNow"
      :showNumbering="false"
      :showActions="false"
      :hideAddButton="true"
      add-label="Tambah Transaksi Pulsa"
      @add="handleAdd"
    >
      <template #cell-kode="{ row }">
        <span class="text-sm font-medium text-gray-800">{{ row.kode || '-' }}</span>
      </template>

      <template #cell-createdAt="{ row }">
        <span class="text-sm text-gray-600">{{ formatDate(row.createdAt) }}</span>
      </template>

      <template #cell-member="{ row }">
        <div class="flex flex-col">
          <span class="text-sm text-gray-800 font-medium">{{ row.riwayatTransaksi?.member?.fullname || '-' }}</span>
          <span class="text-xs text-gray-500">{{ row.riwayatTransaksi?.member?.whatsappnumber || '-' }}</span>
        </div>
      </template>

      <template #cell-nomorTujuan="{ row }">
        <span class="text-sm text-blue-600">{{ row.nomorTujuan || '-' }}</span>
      </template>

      <template #cell-produk="{ row }">
        <div class="flex flex-col">
          <span class="text-sm text-gray-800">{{ row.produk?.name || '-' }}</span>
          <span class="text-xs text-gray-500">{{ row.produk?.operator?.name || '-' }}</span>
        </div>
      </template>

      <template #cell-harga="{ row }">
        <div class="flex flex-col">
          <span class="text-sm text-gray-800" title="Harga Jual">{{ formatRupiah(row.selling_price) }}</span>
          <span class="text-xs text-green-600 font-medium" title="Keuntungan">+ {{ formatRupiah(row.laba) }}</span>
        </div>
      </template>

      <template #cell-status="{ row }">
        <span 
          :class="[
            'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase',
            row.status === 'sukses' ? 'bg-green-100 text-green-800' : 
            row.status === 'gagal' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          ]"
        >
          {{ row.status }}
        </span>
      </template>

      <template #cell-action="{ row }">
        <div class="flex justify-center gap-2">
          <LightButton @click="handleDetail(row)" title="Detail Transaksi">
            <InfoIcon />
          </LightButton>
        </div>
      </template>
    </BaseTable>

    <!-- Modal Detail Transaksi -->
    <TransaksiDetailModal
      :show="showDetailModal"
      :transactionId="selectedTransactionId"
      @close="
        showDetailModal = false;
        selectedTransactionId = null;
        fetchData();
      "
    />
  </div>
</template>
