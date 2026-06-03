<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Modal Page
import DaftarMemberFormModal from '@/modules/Administrator/DaftarMember/components/DaftarMemberFormModal.vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
// Modal
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
// Button
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
// Icon
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import { memberService, type Member } from '@/service/administrator/member';

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
    label: 'Kode',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'fullname',
    label: 'Nama Lengkap',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left',
  },
  {
    key: 'whatsappnumber',
    label: 'No WhatsApp',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'saldo',
    label: 'Saldo',
    headerClass: 'text-right w-[15%] pr-4',
    cellClass: 'text-right pr-4',
  },
  {
    key: 'status',
    label: 'Status',
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

const dataMember = ref<Member[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Form State
const showFormModal = ref(false);
const formMode = ref<'add' | 'edit'>('add');
const selectedMember = ref<Member | null>(null);
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
    const response = await memberService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataMember.value = response.data.data.list;
    totalRow.value = response.data.data.total;
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
  selectedMember.value = null;
  showFormModal.value = true;
};

const handleEdit = (row: any) => {
  formMode.value = 'edit';
  selectedMember.value = { ...row };
  showFormModal.value = true;
};

const handleDelete = (row: any) => {
  displayConfirmation(
    'Konfirmasi Hapus',
    `Apakah Anda yakin ingin menghapus member <strong>${row.fullname}</strong>?`,
    async () => {
      try {
        await memberService.delete(row.id);
        displayNotification('Member berhasil dihapus', 'success');
        fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus member', 'error');
        console.error('Error saat menghapus member:', error);
      }
    },
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
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
        Daftar Member
      </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
        Manajemen Data Member
      </p>
      </div>
    </div>

    <BaseTable
      :columns="tableColumns"
      :data="dataMember"
      :loading="isLoading"
      :pagination="paginationProps"
      search-placeholder="Cari member (kode, nama)..."
      add-label="Tambah Member"
      @search="fetchData"
      @add="handleAdd"
      @page-change="pageNow"
      :showNumbering="false"
      :showActions="false"
    >
      <template #cell-kode="{ row }">
        <span class="font-semibold text-slate-700">{{ row.kode }}</span>
      </template>

      <template #cell-fullname="{ row }">
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-gray-800">{{ row.fullname }}</span>
        </div>
      </template>
      
      <template #cell-whatsappnumber="{ row }">
        <span class="text-sm text-gray-600">{{ row.whatsappnumber }}</span>
      </template>
      
      <template #cell-saldo="{ row }">
        <span class="font-medium text-slate-800">{{ formatCurrency(row.saldo) }}</span>
      </template>

      <template #cell-status="{ row }">
        <span
          class="px-2.5 py-1 text-xs font-semibold rounded-full"
          :class="
            row.status === 'verfied'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          "
        >
          {{ row.status === 'verfied' ? 'Verified' : 'Unverified' }}
        </span>
      </template>

      <!-- Kolom Action -->
      <template #cell-action="{ row }">
        <div class="flex justify-center gap-2">
          <LightButton @click="handleEdit(row)" title="Edit Member"
            ><EditIcon></EditIcon
          ></LightButton>
          <DangerButton @click="handleDelete(row)" title="Hapus Member"
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
        class="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none shadow-[0_0_15px_rgba(225,29,72,0.5)]"
      >
        Hapus
      </button>
    </Confirmation>

    <!-- Form Modal Add/Edit -->
    <DaftarMemberFormModal
      :show="showFormModal"
      :mode="formMode"
      :initial-data="selectedMember"
      :loading="isSubmitting"
      @close="
        showFormModal = false;
        fetchData();
        selectedMember = null;
      "
    />
  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Playfair Display', serif;
}
</style>