<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref } from 'vue';

// Table & Modal
import BaseTable from '@/components/Table/BaseTable.vue';
import LightButton from '@/components/Button/LightButton.vue';
import IconDetail from '@/components/Icons/IconDetail.vue';
import DaftarProdukTripayDetailModal from './components/DaftarProdukTripayDetailModal.vue';
import IconEcosystem from '@/components/Icons/IconEcosystem.vue';

// Service
import { daftarProdukTripayService } from '@/service/administrator/daftarProdukTripay';

// Utils
import dayjs from 'dayjs';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';

const tableColumns = [
  {
    key: 'kode',
    label: 'Kode Produk',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-medium text-gray-800',
  },
  {
    key: 'name',
    label: 'Nama Produk',
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

// Detail Modal State
const showDetailModal = ref(false);
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

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await daftarProdukTripayService.getAll(
      currentPage.value,
      perPage.value,
      searchQuery.value
    );
    dataProduk.value = response.data.data.list;
    totalRow.value = response.data.data.meta.total;
  } catch (error) {
    console.error('Gagal mengambil data produk tripay:', error);
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
    'Sistem akan melakukan sinkronisasi berantai mulai dari Kategori, Operator, hingga Produk. Ini mungkin memakan waktu agak lama.',
    async () => {
      isLoading.value = true;
      try {
        const response = await daftarProdukTripayService.sync();
        await fetchData();
        
        const data = response.data.data;
        displayNotification(
          `Sinkronisasi Hierarkis Selesai.<br/>` +
          `<b>Kategori</b> (Baru: ${data.categories?.inserted || 0}, Diperbarui: ${data.categories?.updated || 0})<br/>` +
          `<b>Operator</b> (Baru: ${data.operators?.inserted || 0}, Diperbarui: ${data.operators?.updated || 0})<br/>` +
          `<b>Produk</b> (Baru: ${data.products?.inserted || 0}, Diperbarui: ${data.products?.updated || 0})`,
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
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
          Daftar Produk Tripay
        </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
          Manajemen Produk PPOB Tripay
        </p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
      <BaseTable
        :columns="tableColumns"
        :data="dataProduk"
        :is-loading="isLoading"
        title="Daftar Produk Tripay"
        subtitle="Manajemen katalog produk prabayar yang terhubung dengan Tripay"
        search-placeholder="Cari kode atau nama produk..."
        :pagination="paginationProps"
        :show-add="false"
        @search="fetchData"
        @page-change="(page) => { currentPage = page; fetchData(); }"
        @refresh="fetchData"
      >
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
            Scan Produk Tripay
          </button>
        </template>

        <!-- Custom Cells -->
        <template #cell-operator="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-800">{{ row.operator?.name || '-' }}</span>
            <span class="text-xs text-gray-500">{{ row.operator?.kategori?.name || '-' }}</span>
          </div>
        </template>

        <template #cell-price="{ row }">
          {{ formatCurrency(row.price) }}
        </template>

        <template #cell-status="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="{
              'bg-green-100 text-green-800': row.status === 'ACTIVE' || row.status === 'active',
              'bg-red-100 text-red-800': row.status === 'INACTIVE' || row.status === 'inactive' || row.status === 'GANGGUAN',
              'bg-gray-100 text-gray-800': !row.status
            }"
          >
            {{ row.status || 'Unknown' }}
          </span>
        </template>

        <!-- Kolom Action -->
        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleDetail(row)" title="Lihat Detail Produk">
              <IconDetail class="w-4 h-4" />
            </LightButton>
          </div>
        </template>
      </BaseTable>
    </div>

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
    <DaftarProdukTripayDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :produk="selectedProduk"
      @close="showDetailModal = false"
    />
  </div>
</template>
