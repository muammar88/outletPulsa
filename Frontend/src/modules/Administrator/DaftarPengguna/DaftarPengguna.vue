<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal Page
import DaftarPenggunaFormModal from './components/DaftarPenggunaFormModal.vue';

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
import { daftarPenggunaService } from '@/service/administrator/daftarPengguna';

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
    key: 'name',
    label: 'Nama Lengkap',
    headerClass: 'text-left w-[25%] pl-4',
    cellClass: 'text-left pl-4 font-semibold text-slate-700',
  },
  {
    key: 'kode',
    label: 'Username / Kode',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'group',
    label: 'Hak Akses (Grup)',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'createdAt',
    label: 'Didaftarkan Pada',
    headerClass: 'text-center w-[20%]',
    cellClass: 'text-center text-sm text-gray-600',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataPengguna = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedPengguna = ref<any | null>(null);
const isSubmitting = ref(false);

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
    const response = await daftarPenggunaService.getAll(
      currentPage.value,
      perPage.value,
      searchQuery.value,
    );
    dataPengguna.value = response.data.data.list;
    totalRow.value = response.data.data.meta.total;
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

// Aksi tabel
const handleAdd = () => {
  formMode.value = 'add';
  selectedPengguna.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: any) => {
  formMode.value = 'edit';
  selectedPengguna.value = { ...row };
  showFormModal.value = true;
};

const confirmButtonText = ref('Ya, Lanjutkan');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const handleDelete = (row: any) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus pengguna <strong>${row.name}</strong>?`,
    async () => {
      try {
        await daftarPenggunaService.delete(row.id!);
        displayNotification('Pengguna berhasil dihapus', 'success');
        fetchData();
      } catch (error: any) {
        displayNotification(error.response?.data?.message || 'Gagal menghapus pengguna', 'error');
        console.error('Error saat menghapus pengguna:', error);
      }
    },
  );
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
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
        Daftar Pengguna
      </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
        Manajemen Akun Administrator / Staff
      </p>
      </div>
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="dataPengguna"
      :loading="isLoading"
      :pagination="paginationProps"
      search-placeholder="Cari pengguna (nama, kode)..."
      add-label="Tambah Pengguna"
      @search="fetchData"
      @add="handleAdd"
      @page-change="pageNow"
      :showNumbering="false"
      :showActions="false"
    >
      <template #cell-name="{ row }">
        <div class="flex flex-col">
          <span class="font-semibold" :class="row.kode === 'admin' ? 'text-gray-400' : 'text-slate-700'">{{ row.name }}</span>
        </div>
      </template>

      <template #cell-kode="{ row }">
        <span class="text-sm font-medium" :class="row.kode === 'admin' ? 'text-gray-400' : 'text-gray-800'">{{ row.kode }}</span>
      </template>
      
      <template #cell-group="{ row }">
        <span v-if="row.group" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="row.kode === 'admin' ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-800'">
          {{ row.group.name }}
        </span>
        <span v-else class="text-sm text-gray-400 italic">Belum diatur</span>
      </template>
      
      <template #cell-createdAt="{ row }">
        <span class="text-sm" :class="row.kode === 'admin' ? 'text-gray-400' : 'text-gray-600'">{{ formatDate(row.createdAt) }}</span>
      </template>

      <!-- Kolom Action -->
      <template #cell-action="{ row }">
        <div v-if="row.kode !== 'admin'" class="flex justify-center gap-2">
          <LightButton @click="handleEdit(row)" title="Edit Pengguna">
            <IconEdit />
          </LightButton>
          <DangerButton @click="handleDelete(row)" title="Hapus Pengguna">
            <IconDelete />
          </DangerButton>
        </div>
        <span v-else class="text-xs text-gray-400 italic">Sistem</span>
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

    <!-- Form Modal Add/Edit -->
    <DaftarPenggunaFormModal
      :show="showFormModal"
      :mode="formMode"
      :initial-data="selectedPengguna"
      :loading="isSubmitting"
      @close="
        showFormModal = false;
        fetchData();
        selectedPengguna = null;
      "
    />
  </div>
</template>
