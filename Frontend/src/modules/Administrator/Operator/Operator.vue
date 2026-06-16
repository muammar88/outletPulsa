<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal Page
import OperatorFormModal from '@/modules/Administrator/Operator/components/OperatorFormModal.vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
// Button
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
// Icon
import IconDelete from '@/components/Icons/IconDelete.vue';
import IconEdit from '@/components/Icons/IconEdit.vue';
import { operatorService, type Operator } from '@/service/administrator/operator';

const {
  showConfirmation,
  confirmationTitle,
  confirmationMessage,
  displayConfirmation,
  hideConfirmation,
  confirmAction,
} = useConfirmation();

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const tableColumns = [
  {
    key: 'kode',
    label: 'Kode',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4 font-mono font-bold tracking-wide text-slate-700',
  },
  {
    key: 'name',
    label: 'Nama Operator',
    headerClass: 'text-left w-[30%]',
    cellClass: 'text-left font-bold text-gray-800',
  },
  {
    key: 'kategori',
    label: 'Kategori',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left',
  },
  {
    key: 'produk_count',
    label: 'Jumlah Produk',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataOperator = ref<Operator[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedOperator = ref<Operator | null>(null);

// Pagination
const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 100, totalRow: 0 },
);

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await operatorService.getAll(searchQuery.value, perPage.value, currentPage.value);
    dataOperator.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data operator:', error);
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

const handleAdd = () => {
  formMode.value = 'add';
  selectedOperator.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: Operator) => {
  formMode.value = 'edit';
  selectedOperator.value = { ...row };
  showFormModal.value = true;
};

const handleDelete = (row: Operator) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus operator <strong>${row.name}</strong>?`,
    async () => {
      try {
        await operatorService.delete(row.id!);
        displayNotification('Operator berhasil dihapus', 'success');
        fetchData();
      } catch (error: any) {
        const errMessage = error.response?.data?.message || 'Gagal menghapus operator';
        displayNotification(errMessage, 'error');
        console.error('Error saat menghapus operator:', error);
      }
    },
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
            Operator
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Data Operator
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataOperator"
        :loading="isLoading"
        :pagination="paginationProps"
        search-placeholder="Cari operator (kode, nama)..."
        add-label="Tambah Operator"
        @search="fetchData"
        @add="handleAdd"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
      >
        <template #cell-kode="{ row }">
          <span class="font-semibold text-slate-700">{{ row.kode }}</span>
        </template>

        <template #cell-name="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-800">{{ row.name }}</span>
          </div>
        </template>
        
        <template #cell-kategori="{ row }">
          <div class="flex flex-col" v-if="row.kategori">
            <span class="text-sm font-semibold text-gray-700">{{ row.kategori.name }}</span>
            <span class="text-xs text-gray-500 uppercase">{{ row.kategori.type }}</span>
          </div>
          <span v-else class="text-sm text-gray-400 italic">Tidak ada kategori</span>
        </template>
        
        <template #cell-produk_count="{ row }">
          <div class="flex justify-center">
            <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-100 shadow-sm whitespace-nowrap">
              {{ row._count?.produks || 0 }} Produk
            </span>
          </div>
        </template>

        <!-- Kolom Action -->
        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton @click="handleEdit(row)" title="Edit Operator">
              <IconEdit></IconEdit>
            </LightButton>
            <DangerButton @click="handleDelete(row)" title="Hapus Operator">
              <IconDelete />
            </DangerButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Form Modal -->
    <OperatorFormModal
      :show="showFormModal"
      :mode="formMode"
      :initial-data="selectedOperator"
      :loading="false"
      @close="
        showFormModal = false;
        fetchData();
      "
    />

    <!-- Confirmation Modal -->
    <Confirmation
      :show="showConfirmation"
      :title="confirmationTitle"
      :message="confirmationMessage"
      @cancel="hideConfirmation"
      @confirm="confirmAction"
    />

    <!-- Notification Modal -->
    <Notification
      :show-notification="showNotification"
      :notification-type="notificationType"
      :notification-message-html="notificationMessage"
      @close="hideNotification"
    />
  </div>
</template>
