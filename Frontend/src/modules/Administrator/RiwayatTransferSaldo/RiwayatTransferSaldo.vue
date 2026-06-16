<script setup lang="ts">
import { IconListDetails, IconSearch } from '@/components/Icons';

import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref } from 'vue';

// Table & Modal
import BaseTable from '@/components/Table/BaseTable.vue';
import LightButton from '@/components/Button/LightButton.vue';
import RiwayatTransferSaldoDetailModal from './components/RiwayatTransferSaldoDetailModal.vue';

// Service
import { riwayatTransferSaldoService } from '@/service/administrator/riwayatTransferSaldo';

// Utils
import dayjs from 'dayjs';
import Notification from '@/components/Modal/Notification.vue';

const tableColumns = [
  {
    key: 'createdAt',
    label: 'Tanggal Transfer',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-medium text-gray-800',
  },
  {
    key: 'trxId',
    label: 'ID Transaksi',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left font-mono text-xs',
  },
  {
    key: 'serverAsal',
    label: 'Server Asal',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'serverTujuan',
    label: 'Server Tujuan',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'nominal',
    label: 'Nominal',
    headerClass: 'text-right w-[15%] pr-4',
    cellClass: 'text-right pr-4 font-bold text-blue-600',
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

const dataRiwayat = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterStatus = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');

// Detail Modal State
const showDetailModal = ref(false);
const selectedRiwayat = ref<any | null>(null);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 10, totalRow: 0 },
);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

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

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await riwayatTransferSaldoService.findAll({
      page: currentPage.value,
      limit: perPage.value,
      search: searchQuery.value,
      status: filterStatus.value,
      startDate: filterStartDate.value,
      endDate: filterEndDate.value,
    });
    dataRiwayat.value = response.data.data.data;
    totalRow.value = response.data.data.meta.total;
  } catch (error) {
    console.error('Gagal mengambil data riwayat transfer saldo:', error);
    displayNotification('Gagal mengambil data riwayat transfer saldo', 'error');
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
  selectedRiwayat.value = row;
  showDetailModal.value = true;
};

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD MMM YYYY HH:mm');
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Riwayat Transfer Saldo
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Daftar riwayat transfer saldo antar server
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataRiwayat"
        :is-loading="isLoading"
        search-placeholder="Cari ID transaksi, server..."
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
            <div class="inline-flex rounded-xl shadow-sm" role="group">
              <input
                type="text"
                id="search"
                class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
                v-model="searchQuery"
                @input="onSearch"
                placeholder="Cari ID transaksi, server..."
              />
              <select
                v-model="filterStatus"
                @change="applyFilter"
                class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="SUCCESS">Sukses</option>
                <option value="FAILED">Gagal</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div class="inline-flex items-center gap-2">
              <input
                type="date"
                v-model="filterStartDate"
                @change="applyFilter"
                class="block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              />
              <span class="text-gray-500 font-medium text-sm">s/d</span>
              <input
                type="date"
                v-model="filterEndDate"
                @change="applyFilter"
                class="block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </template>

        <!-- Custom Cells -->
        <template #cell-createdAt="{ row }">
          <span class="text-sm font-medium">{{ formatDate(row.createdAt) }}</span>
        </template>

        <template #cell-trxId="{ row }">
          <span class="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{{ row.trxId }}</span>
        </template>

        <template #cell-serverAsal="{ row }">
          <span class="font-medium text-indigo-700">{{ row.serverAsal?.name || '-' }}</span>
        </template>

        <template #cell-serverTujuan="{ row }">
          <span class="font-medium text-purple-700">{{ row.serverTujuan?.name || '-' }}</span>
        </template>

        <template #cell-nominal="{ row }">
          {{ formatCurrency(row.nominal) }}
        </template>

        <template #cell-status="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            :class="{
              'bg-emerald-100 text-emerald-800': row.status === 'SUCCESS' || row.status === 'sukses',
              'bg-red-100 text-red-800': row.status === 'FAILED' || row.status === 'gagal',
              'bg-amber-100 text-amber-800': row.status === 'PENDING' || row.status === 'pending',
              'bg-gray-100 text-gray-800': !row.status
            }"
          >
            {{ row.status || 'UNKNOWN' }}
          </span>
        </template>

        <!-- Kolom Action -->
        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleDetail(row)" title="Lihat Detail Riwayat">
              <IconListDetails class="w-4 h-4" />
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

    <!-- Modals -->
    <RiwayatTransferSaldoDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :riwayat="selectedRiwayat"
      @close="showDetailModal = false"
    />
  </div>
</template>
