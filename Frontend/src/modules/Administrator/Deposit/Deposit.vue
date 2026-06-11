<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, watch } from 'vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
// Icon
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import { depositService, type RiwayatSaldo } from '@/service/administrator/deposit';
import DepositManualModal from './components/DepositManualModal.vue';

const showDepositModal = ref(false);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Definisi Kolom Tabel
const tableColumns = [
  {
    key: 'kode',
    label: 'Kode Trx',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'member',
    label: 'Member',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'nominal',
    label: 'Nominal',
    headerClass: 'text-right w-[15%] pr-4',
    cellClass: 'text-right pr-4',
  },
  {
    key: 'saldo_setelahnya',
    label: 'Saldo Akhir',
    headerClass: 'text-right w-[15%] pr-4',
    cellClass: 'text-right pr-4 text-emerald-600 font-semibold',
  },
  {
    key: 'kategori',
    label: 'Kategori',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
  {
    key: 'ket',
    label: 'Keterangan',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
];

const dataDeposit = ref<RiwayatSaldo[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Filter Kategori
const selectedKategori = ref('');

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
    const response = await depositService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      selectedKategori.value
    );
    dataDeposit.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data deposit:', error);
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

watch(selectedKategori, () => {
  applyFilter();
});

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const confirmButtonText = ref('Ya, Lanjutkan');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const handleDelete = (row: RiwayatSaldo) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus riwayat <strong>${row.kode}</strong>?`,
    async () => {
      try {
        await depositService.delete(row.id!);
        displayNotification('Riwayat deposit berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus riwayat deposit', 'error');
        console.error('Error saat menghapus riwayat deposit:', error);
      }
    },
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

const formatKategori = (status: string) => {
  const map: Record<string, string> = {
    pembelian_pulsa: 'Pembelian Pulsa',
    deposit: 'Deposit',
    transfer_pulsa: 'Transfer Pulsa',
    pencairan_fee_agen: 'Pencairan Fee Agen',
  };
  return map[status] || status;
};

const badgeClass = (status: string) => {
  switch (status) {
    case 'deposit':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pencairan_fee_agen':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'pembelian_pulsa':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'transfer_pulsa':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
    <div class="mb-10 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
        Riwayat Deposit
      </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
        Manajemen Data Riwayat Saldo
      </p>
      </div>
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="dataDeposit"
      :loading="isLoading"
      :pagination="paginationProps"
      @page-change="pageNow"
      :showNumbering="false"
      :showActions="false"
      :showSearch="false"
      :showAdd="true"
      addLabel="Tambah Saldo"
      @add="showDepositModal = true"
    >
      <template #filters>
        <div class="inline-flex rounded-xl shadow-sm" role="group">
          <input
            type="text"
            id="search"
            class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
            v-model="searchQuery"
            @input="onSearch"
            placeholder="Cari kode atau member..."
          />
          <select
            v-model="selectedKategori"
            @change="applyFilter"
            class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option value="deposit">Deposit</option>
            <option value="pembelian_pulsa">Pembelian Pulsa</option>
            <option value="transfer_pulsa">Transfer Pulsa</option>
            <option value="pencairan_fee_agen">Pencairan Fee Agen</option>
          </select>
        </div>
      </template>

      <template #cell-kode="{ row }">
        <span class="font-semibold text-slate-700 text-xs">{{ row.kode }}</span>
      </template>

      <template #cell-member="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-800">{{ row.member?.fullname || '-' }}</span>
          <span class="text-[10px] text-gray-400 uppercase tracking-wider">{{ row.member?.kode || '' }}</span>
        </div>
      </template>
      
      <template #cell-nominal="{ row }">
        <span class="font-medium text-slate-800">{{ formatCurrency(row.nominal) }}</span>
      </template>

      <template #cell-saldo_setelahnya="{ row }">
        <span class="">{{ formatCurrency(row.saldo_setelahnya) }}</span>
      </template>

      <template #cell-kategori="{ row }">
        <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border" :class="badgeClass(row.status)">
          {{ formatKategori(row.status) }}
        </span>
      </template>

      <template #cell-ket="{ row }">
        <span class="text-xs text-gray-500 line-clamp-2" :title="row.ket">{{ row.ket || '-' }}</span>
      </template>

      <!-- Kolom Action -->
      <template #cell-action="{ row }">
        <div class="flex justify-center gap-2">
          <DangerButton @click="handleDelete(row)" title="Hapus Riwayat"
            ><DeleteIcon
          /></DangerButton>
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

    <!-- Deposit Manual Modal -->
    <DepositManualModal
      v-if="showDepositModal"
      :show="showDepositModal"
      @close="showDepositModal = false"
      @success="() => { showDepositModal = false; displayNotification('Berhasil menambahkan saldo member', 'success'); fetchData(); }"
    />
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Playfair Display', serif;
}
</style>
