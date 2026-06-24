<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';
import { useConfirmation } from '@/composables/useConfirmation';
import { IconCheck } from '@/components/Icons';

// Components
import BaseTable from '@/components/Table/BaseTable.vue';
import ExpandableActionButton from '@/components/Button/ExpandableActionButton.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';

import { LabaDiambilService } from './services/LabaDiambilService';
import type { TakeLaba, SummaryUnpaid } from './types/LabaDiambil';

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
  { key: 'kode_invoice', label: 'Kode Invoice', headerClass: 'text-left w-[25%] pl-4', cellClass: 'text-left pl-4' },
  { key: 'jumlah_laba', label: 'Jumlah Laba', headerClass: 'text-right w-[20%]', cellClass: 'text-right' },
  { key: 'jumlah_transaksi', label: 'Jumlah Transaksi', headerClass: 'text-center w-[20%]', cellClass: 'text-center' },
  { key: 'tanggal', label: 'Tanggal Diambil', headerClass: 'text-center w-[25%]', cellClass: 'text-center' },
];

const dataLaba = ref<TakeLaba[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

const isTakingLaba = ref(false);

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
    const response = await LabaDiambilService.getAll(searchQuery.value, perPage.value, currentPage.value);
    dataLaba.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data:', error);
  } finally {
    isLoading.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchData();
  }, 500);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const handleAmbilLaba = async () => {
  isTakingLaba.value = true;
  try {
    const response = await LabaDiambilService.getSummaryUnpaid();
    const summary: SummaryUnpaid = response.data.data;

    if (summary.totalLaba === 0) {
      displayNotification('Tidak ada laba yang dapat diambil saat ini (Rp 0).', 'warning');
      return;
    }

    displayConfirmation(
      'Konfirmasi Pengambilan Laba',
      `Anda akan menarik laba dari <strong>${summary.totalTransaksi}</strong> transaksi yang belum diambil.<br><br>
      Total Laba: <strong>${formatCurrency(summary.totalLaba)}</strong><br><br>
      Seluruh laba transaksi terkait akan ditandai sebagai <em>"sudah diambil (paid)"</em>. Lanjutkan?`,
      async () => {
        try {
          await LabaDiambilService.takeLaba();
          displayNotification('Laba berhasil diambil!', 'success');
          fetchData();
        } catch (error: any) {
          console.error(error);
          displayNotification(error.response?.data?.message || 'Gagal mengambil laba', 'error');
        }
      }
    );
  } catch (error) {
    console.error('Gagal memuat summary:', error);
    displayNotification('Gagal memuat ringkasan laba', 'error');
  } finally {
    isTakingLaba.value = false;
  }
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
            Riwayat Laba Diambil
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Kelola dan ambil laba dari transaksi yang berstatus unpaid secara atomik.
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataLaba"
        :loading="isLoading"
        :pagination="paginationProps"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showSearch="false"
        :showAddButton="false"
        :showAdd="false"
      >
        <template #custom-actions>
          <ExpandableActionButton
            label="Ambil Laba Sekarang"
            title="Ambil Seluruh Laba Unpaid"
            variant="emerald"
            :loading="isTakingLaba"
            @click="handleAmbilLaba"
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
              class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Cari invoice..."
            />
          </div>
        </template>

        <template #cell-kode_invoice="{ row }">
          <div class="flex items-center">
            <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-md font-mono tracking-wide shadow-sm">
              {{ row.kode_invoice }}
            </span>
          </div>
        </template>

        <template #cell-jumlah_laba="{ row }">
          <div class="flex justify-end">
            <span class="font-bold text-emerald-600 text-[14px]">{{ formatCurrency(row.jumlah_laba) }}</span>
          </div>
        </template>

        <template #cell-jumlah_transaksi="{ row }">
          <div class="flex justify-center">
            <span class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold rounded-md whitespace-nowrap shadow-sm">
              {{ row.jumlah_transaksi }} Transaksi
            </span>
          </div>
        </template>

        <template #cell-tanggal="{ row }">
          <div class="flex justify-center flex-col items-center">
            <span class="text-[13px] font-medium text-gray-800">{{ formatDate(row.createdAt) }}</span>
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
        class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none shadow-[0_0_15px_rgba(5,150,105,0.5)]"
      >
        Ya, Lanjutkan
      </button>
    </Confirmation>
  </div>
</template>
