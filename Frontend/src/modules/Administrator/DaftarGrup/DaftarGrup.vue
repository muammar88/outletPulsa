<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal Page
import DaftarGrupFormModal from './components/DaftarGrupFormModal.vue';
import HakAksesModal from './components/HakAksesModal.vue';

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
import IconList from '@/components/Icons/IconList.vue';
import { daftarGrupService } from '@/service/administrator/daftarGrup';
import { format } from 'date-fns';

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
    label: 'Nama Grup',
    headerClass: 'text-left w-[20%] pl-4',
    cellClass: 'text-left pl-4 font-semibold text-slate-700',
  },
  {
    key: 'description',
    label: 'Deskripsi',
    headerClass: 'text-left w-[30%]',
    cellClass: 'text-left text-sm text-gray-600',
  },
  {
    key: 'userCount',
    label: 'Jumlah Pengguna',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center text-sm font-medium',
  },
  {
    key: 'createdAt',
    label: 'Dibuat Pada',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center text-sm text-gray-600',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataGrup = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedGrup = ref<any | null>(null);
const isSubmitting = ref(false);

// Permission Modal State
const showPermissionModal = ref(false);
const permissionGrupId = ref<number | null>(null);
const permissionGrupName = ref('');
const currentPermissions = ref<any[]>([]);

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
    const response = await daftarGrupService.getAll(
      currentPage.value,
      perPage.value,
      searchQuery.value,
    );
    dataGrup.value = response.data.data.list;
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
  selectedGrup.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: any) => {
  formMode.value = 'edit';
  selectedGrup.value = { ...row };
  showFormModal.value = true;
};

const handleManagePermissions = (row: any) => {
  permissionGrupId.value = row.id;
  permissionGrupName.value = row.name;
  currentPermissions.value = row.permissions.map((p: any) => p.permission.id);
  showPermissionModal.value = true;
};

const confirmButtonText = ref('Ya, Lanjutkan');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const handleDelete = (row: any) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus grup <strong>${row.name}</strong>?`,
    async () => {
      try {
        await daftarGrupService.delete(row.id!);
        displayNotification('Grup berhasil dihapus', 'success');
        fetchData();
      } catch (error: any) {
        displayNotification(error.response?.data?.message || 'Gagal menghapus grup', 'error');
        console.error('Error saat menghapus grup:', error);
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
        Daftar Grup
      </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
        Manajemen Peran dan Hak Akses
      </p>
      </div>
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="dataGrup"
      :loading="isLoading"
      :pagination="paginationProps"
      search-placeholder="Cari grup..."
      add-label="Tambah Grup"
      @search="fetchData"
      @add="handleAdd"
      @page-change="pageNow"
      :showNumbering="false"
      :showActions="false"
    >
      <template #cell-name="{ row }">
        <span class="font-semibold" :class="row.name === 'Administrator' ? 'text-gray-400' : 'text-slate-700'">{{ row.name }}</span>
      </template>

      <template #cell-description="{ row }">
        <span class="text-sm" :class="row.name === 'Administrator' ? 'text-gray-400' : 'text-gray-600'">{{ row.description || '-' }}</span>
      </template>
      
      <template #cell-userCount="{ row }">
        <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full"
              :class="row.name === 'Administrator' ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-indigo-100'">
          {{ row._count?.users || 0 }}
        </span>
      </template>
      
      <template #cell-createdAt="{ row }">
        <span class="text-sm" :class="row.name === 'Administrator' ? 'text-gray-400' : 'text-gray-600'">{{ formatDate(row.createdAt) }}</span>
      </template>

      <!-- Kolom Action -->
      <template #cell-action="{ row }">
        <div v-if="row.name !== 'Administrator'" class="flex justify-center gap-2">
          <LightButton @click="handleManagePermissions(row)" title="Kelola Hak Akses">
            <IconList />
          </LightButton>
          <LightButton @click="handleEdit(row)" title="Edit Grup">
            <IconEdit />
          </LightButton>
          <DangerButton @click="handleDelete(row)" title="Hapus Grup">
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
    <DaftarGrupFormModal
      :show="showFormModal"
      :mode="formMode"
      :initial-data="selectedGrup"
      :loading="isSubmitting"
      @close="
        showFormModal = false;
        fetchData();
        selectedGrup = null;
      "
    />

    <!-- Modal Hak Akses -->
    <HakAksesModal
      :show="showPermissionModal"
      :grup-id="permissionGrupId"
      :grup-name="permissionGrupName"
      :current-permissions="currentPermissions"
      @close="showPermissionModal = false"
      @success="
        showPermissionModal = false;
        fetchData();
      "
    />
  </div>
</template>
