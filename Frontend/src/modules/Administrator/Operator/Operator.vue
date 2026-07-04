<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, computed } from 'vue';

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
import { kategoriService, type Kategori } from '@/service/administrator/kategori';

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

const dataOperator = ref<Operator[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterKategori = ref('');
const filterTipe = ref('');
const categories = ref<Kategori[]>([]);

const filteredCategories = computed(() => {
  if (!filterTipe.value) return categories.value;
  return categories.value.filter(cat => cat.type === filterTipe.value);
});

const onTipeChange = () => {
  filterKategori.value = '';
  currentPage.value = 1;
  fetchData();
};

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
    const response = await operatorService.getAll(searchQuery.value, perPage.value, currentPage.value, filterKategori.value, undefined, filterTipe.value);
    dataOperator.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data operator:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const res = await kategoriService.getAll('', 1000, 1);
    categories.value = res.data.data.list;
  } catch (error) {
    console.error('Gagal memuat daftar kategori', error);
  }
};

const onSearch = () => {
  applyFilter();
};

const applyFilter = () => {
  currentPage.value = 1;
  fetchData();
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

const toggleStatus = async (row: Operator) => {
  if (!row.id) return;
  const newStatus = row.status === 'active' ? 'non_active' : 'active';
  const originalStatus = row.status;
  
  // Optimistic update
  row.status = newStatus;
  
  try {
    await operatorService.update(row.id, { status: newStatus });
    displayNotification(`Status operator berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Non Aktif'}`, 'success');
  } catch (error: any) {
    // Revert on error
    row.status = originalStatus;
    const errMessage = error.response?.data?.message || 'Gagal mengubah status operator';
    displayNotification(errMessage, 'error');
    console.error('Error saat mengubah status operator:', error);
  }
};

onMounted(() => {
  fetchCategories();
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
        :showSearch="false"
      >
        <template #filters>
          <div class="inline-flex rounded-xl shadow-sm" role="group">
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Cari operator (kode, nama)..."
              class="relative block w-64 px-4 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
            />
            <select
              v-model="filterTipe"
              @change="onTipeChange"
              class="relative block w-40 px-4 py-2 text-sm text-gray-800 bg-white border-y border-gray-200 hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Tipe</option>
              <option value="prabayar">Prabayar</option>
              <option value="pascabayar">Pascabayar</option>
            </select>
            <select
              v-model="filterKategori"
              @change="applyFilter"
              class="relative block w-48 px-4 py-2 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }} <template v-if="!filterTipe">({{ cat.type }})</template>
              </option>
            </select>
          </div>
        </template>
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
        
        <template #cell-status="{ row }">
          <div class="flex justify-center items-center h-full">
            <button 
              @click="toggleStatus(row)"
              type="button" 
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f2155] focus:ring-offset-2 transition-colors duration-200 ease-in-out"
              :class="row.status === 'active' ? 'bg-emerald-500' : 'bg-gray-200'"
              :aria-pressed="row.status === 'active'"
            >
              <span class="sr-only">Toggle status</span>
              <span 
                aria-hidden="true" 
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="row.status === 'active' ? 'translate-x-2' : '-translate-x-2'"
              />
            </button>
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
