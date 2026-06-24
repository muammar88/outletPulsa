<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { onMounted, onUnmounted, ref } from 'vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import TransaksiDetailModal from '@/modules/Administrator/TransaksiPulsa/components/TransaksiDetailModal.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
// Button
import LightButton from '@/components/Button/LightButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
// Icon
import IconInfo from '@/components/Icons/IconInfo.vue';
import IconDelete from '@/components/Icons/IconDelete.vue';
import { useNotification } from '@/composables/useNotification';
import { useConfirmation } from '@/composables/useConfirmation';
import Notification from '@/components/Modal/Notification.vue';
import { transaksiPulsaService } from '@/service/administrator/transaksi_pulsa';
import { IconClockPlay, IconServerCog, IconX, IconChecks } from '@/components/Icons';

// Definisi Kolom Tabel & Interface
const tableColumns = [
  {
    key: 'kode',
    label: 'No. Transaksi',
    headerClass: 'text-left w-[10%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'createdAt',
    label: 'Tanggal',
    headerClass: 'text-left w-[10%]',
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
    headerClass: 'text-left w-[10%]',
    cellClass: 'text-left font-semibold',
  },
  {
    key: 'produk',
    label: 'Produk',
    headerClass: 'text-left w-[10%]',
    cellClass: 'text-left',
  },
  {
    key: 'harga',
    label: 'Harga / Laba',
    headerClass: 'text-left w-[10%]',
    cellClass: 'text-left',
  },
  {
    key: 'feeAgen',
    label: 'Fee Agen',
    headerClass: 'text-left w-[10%]',
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
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataTransaksi = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');

const isCronLoading = ref(false);
const isStatusLoading = ref(false);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Modal State
const showDetailModal = ref(false);
const selectedTransactionId = ref<number | null>(null);

// Inisialisasi Composable Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 10, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event, isBackground = false) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  if (!isBackground) {
    isLoading.value = true;
  }
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
    if (!isBackground) {
      isLoading.value = false;
    }
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

const handleRunCron = async () => {
  isCronLoading.value = true;
  try {
    const res = await transaksiPulsaService.runCronJob();
    displayNotification(res.data?.message || 'Cron job berhasil dijalankan', 'success');
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal menjalankan cron job', 'error');
  } finally {
    isCronLoading.value = false;
  }
};

const handleCheckStatus = async () => {
  isStatusLoading.value = true;
  try {
    const res = await transaksiPulsaService.checkStatusServer();
    displayNotification(res.data?.message || 'Berhasil memeriksa status di server', 'success');
    fetchData();
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal memeriksa status di server', 'error');
  } finally {
    isStatusLoading.value = false;
  }
};

const handleDeleteTransaksi = (id: number) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    'Apakah Anda Yakin Untuk Menghapus Transaksi Ini?',
    async () => {
      try {
        const res = await transaksiPulsaService.delete(id);
        displayNotification(res.data?.message || 'Transaksi berhasil dihapus', 'success');
        fetchData();
      } catch (error: any) {
        displayNotification(error.response?.data?.message || 'Gagal menghapus transaksi', 'error');
      }
    }
  );
};

const handleCheckStatusTransaksi = async (id: number) => {
  try {
    const res = await transaksiPulsaService.reCheckStatus(id);
    displayNotification(res.data?.message || 'Pengecekan status berhasil', 'success');
    fetchData();
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal memeriksa status', 'error');
  }
};

let refreshInterval: ReturnType<typeof setInterval> | null = null;

const startAutoRefresh = () => {
  if (!refreshInterval) {
    refreshInterval = setInterval(() => {
      fetchData(undefined, true);
    }, 5000);
  }
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
};

onMounted(() => {
  fetchData();
  startAutoRefresh();
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  stopAutoRefresh();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<template>
  <div class="px-8 py-6">
    <div class="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
      :showAdd="false"
    >
      <template #custom-actions>
        <!-- <BaseButton
          variant="secondary"
          size="md"
          :loading="isCronLoading"
          @click="handleRunCron"
          class="uppercase tracking-wider text-sm font-bold"
        >
          <template #icon-left v-if="!isCronLoading">
            <IconClockPlay class="h-4 w-4 mr-1.5 text-gray-700" />
          </template>
          Jalankan Cron Job
        </BaseButton> -->

        <BaseButton
          variant="primary"
          size="md"
          :loading="isStatusLoading"
          @click="handleCheckStatus"
          class="uppercase tracking-wider text-sm font-bold shadow-[0_4px_12px_rgba(15,33,85,0.2)] hover:shadow-[0_6px_16px_rgba(15,33,85,0.3)]"
        >
          <template #icon-left v-if="!isStatusLoading">
            <IconServerCog class="h-4 w-4 mr-1.5 text-white" />
          </template>
          Check Status Di Server
        </BaseButton>
      </template>

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

      <template #cell-feeAgen="{ row }">
        <div class="flex flex-col">
          <span class="text-sm text-gray-800" title="Fee Agen">{{ formatRupiah(row.fee_agen || 0) }}</span>
          <span 
            v-if="row.fee_agen"
            :class="[
              'text-[10px] font-bold uppercase',
              row.status_fee_agen === 'paid' ? 'text-green-600' : 'text-red-500'
            ]"
          >
            {{ row.status_fee_agen === 'paid' ? 'SUDAH DIBAYAR' : 'BELUM DIBAYAR' }}
          </span>
          <span v-else class="text-[10px] text-gray-400 font-medium">-</span>
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
        <div class="flex justify-center gap-1 flex-wrap">
          <LightButton 
            v-if="row.status === 'proses'" 
            @click="handleCheckStatusTransaksi(row.id)" 
            title="Periksa Request"
          >
            <IconChecks class="h-4 w-4 text-gray-700" />
          </LightButton>

          <LightButton 
            v-else 
            @click="handleCheckStatusTransaksi(row.id)" 
            title="Periksa Ulang Request"
          >
            <IconChecks class="h-4 w-4 text-gray-700" />
          </LightButton>

          <LightButton @click="handleDetail(row)" title="Detail Transaksi">
            <IconInfo />
          </LightButton>

          <DangerButton 
            @click="handleDeleteTransaksi(row.id)" 
            title="Hapus Transaksi"
            class="hover:shadow-md transition-all"
          >
            <IconDelete />
          </DangerButton>
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
    <!-- Notification Modal -->
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
  </div>
</template>
