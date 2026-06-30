<script setup lang="ts">
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref, watch } from 'vue';

// Modal Page
import PengumumanFormModal from './components/PengumumanFormModal.vue';

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
import IconSend from '@/components/Icons/IconSend.vue';

import { pengumumanService, type Pengumuman } from '@/service/administrator/pengumuman';

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

const confirmButtonText = ref('Ya, Lanjutkan');
const confirmButtonClass = ref('bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]');

const {
  showNotification,
  notificationType,
  notificationMessage,
  notificationMessageHtml,
  displayNotification,
  hideNotification,
} = useNotification();

const tableColumns = [
  {
    key: 'title',
    label: 'Judul',
    headerClass: 'text-left w-[25%] pl-4',
    cellClass: 'text-left pl-4 font-bold text-gray-800',
  },
  {
    key: 'priority',
    label: 'Prioritas',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'status',
    label: 'Status',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
  {
    key: 'date',
    label: 'Periode',
    headerClass: 'text-left w-[25%]',
    cellClass: 'text-left text-sm text-gray-500',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[20%]',
    cellClass: 'text-center',
  },
];

const searchQuery = ref('');
const statusFilter = ref('');

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchPengumuman(),
  { perPage: 10, totalRow: 0 },
);

const pengumumans = ref<Pengumuman[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const selectedPengumuman = ref<Pengumuman | null>(null);

const fetchPengumuman = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await pengumumanService.getAll(
      searchQuery.value,
      statusFilter.value,
      perPage.value,
      currentPage.value
    );
    pengumumans.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    displayNotification('Gagal mengambil data pengumuman.', 'error');
  } finally {
    isLoading.value = false;
  }
};

watch(statusFilter, () => {
  currentPage.value = 1;
  fetchPengumuman();
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchPengumuman();
  }, 500);
};

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const openAddModal = () => {
  modalMode.value = 'add';
  selectedPengumuman.value = null;
  isModalOpen.value = true;
};

const openEditModal = (pengumuman: Pengumuman) => {
  modalMode.value = 'edit';
  selectedPengumuman.value = pengumuman;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPengumuman.value = null;
};

const onFormSubmit = () => {
  displayNotification(
    modalMode.value === 'add'
      ? 'Pengumuman berhasil ditambahkan'
      : 'Pengumuman berhasil diperbarui',
    'success'
  );
  fetchPengumuman();
};

const handleDelete = (pengumuman: Pengumuman) => {
  confirmButtonText.value = 'Hapus';
  confirmButtonClass.value = 'bg-rose-600 hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.5)]';
  displayConfirmation(
    'Hapus Pengumuman',
    `Apakah Anda yakin ingin menghapus pengumuman "${pengumuman.title}"? Aksi ini tidak dapat dibatalkan.`,
    async () => {
      try {
        await pengumumanService.delete(pengumuman.id!);
        displayNotification('Pengumuman berhasil dihapus', 'success');
        if (pengumumans.value.length === 1 && currentPage.value > 1) {
          currentPage.value--;
        }
        fetchPengumuman();
      } catch (error: any) {
        displayNotification(
          error.response?.data?.message || 'Gagal menghapus pengumuman',
          'error'
        );
      }
    }
  );
};

const handlePublish = (pengumuman: Pengumuman) => {
  confirmButtonText.value = 'Ya, Publish';
  confirmButtonClass.value = 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.5)]';
  displayConfirmation(
    'Kirim Notifikasi',
    `Kirim push notification pengumuman "${pengumuman.title}" ke semua perangkat mobile pengguna?`,
    async () => {
      try {
        const response: any = await pengumumanService.publish(pengumuman.id!);
        const summary = response.data?.data?.summary;
        
        if (summary) {
          const htmlMsg = `
            <div class="mt-2 text-sm text-gray-700">
              <p class="font-bold mb-1">Ringkasan Pengiriman:</p>
              <ul class="list-disc pl-5 space-y-1">
                <li><span class="text-emerald-600 font-semibold">Berhasil:</span> ${summary.success}</li>
                <li><span class="text-blue-600 font-semibold">Dikirim Ulang (Retry):</span> ${summary.retried}</li>
                <li><span class="text-gray-500 font-semibold">Dilewati (Sudah ada):</span> ${summary.skipped}</li>
                <li><span class="text-rose-600 font-semibold">Gagal:</span> ${summary.failed}</li>
              </ul>
            </div>
          `;
          displayNotification(htmlMsg, 'success', 5000, true);
        } else {
          displayNotification('Push notification sedang diproses ke semua perangkat', 'success');
        }
      } catch (error: any) {
        displayNotification(
          error.response?.data?.message || 'Gagal memproses publikasi notifikasi',
          'error'
        );
      }
    }
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => {
  fetchPengumuman();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Pengumuman
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Pengumuman & Notifikasi Broadcast
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="pengumumans"
        :loading="isLoading"
        :pagination="paginationProps"
        add-label="Tambah Pengumuman"
        @add="openAddModal"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showSearch="false"
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
                placeholder="Cari berdasarkan judul..."
              />
              <select
                v-model="statusFilter"
                class="relative block w-40 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </template>

        <template #cell-title="{ row }">
          <div class="font-semibold text-slate-700">{{ row.title }}</div>
        </template>
        
        <template #cell-priority="{ row }">
          <span
            :class="{
              'px-2 py-1 text-xs font-medium rounded-full': true,
              'bg-rose-100 text-rose-700': row.priority === 'High',
              'bg-blue-100 text-blue-700': row.priority === 'Normal',
              'bg-gray-100 text-gray-700': row.priority === 'Low',
            }"
          >
            {{ row.priority || 'Normal' }}
          </span>
        </template>

        <template #cell-status="{ row }">
          <span
            :class="{
              'px-2 py-1 text-xs font-medium rounded-full': true,
              'bg-emerald-100 text-emerald-700': row.status,
              'bg-rose-100 text-rose-700': !row.status,
            }"
          >
            {{ row.status ? 'Aktif' : 'Tidak Aktif' }}
          </span>
        </template>
        
        <template #cell-date="{ row }">
          <div class="flex flex-col">
            <span>{{ formatDate(row.start_date) }} - {{ formatDate(row.end_date) }}</span>
          </div>
        </template>

        <template #cell-action="{ row }">
          <div class="flex justify-center gap-2">
            <LightButton
              @click="handlePublish(row)"
              title="Publish & Kirim Notifikasi"
              
            >
            
              <IconSend class="w-4 h-4" />
            </LightButton>
            <LightButton @click="openEditModal(row)" title="Edit">
              <IconEdit class="w-4 h-4" />
            </LightButton>
            <DangerButton @click="handleDelete(row)" title="Hapus">
              <IconDelete class="w-4 h-4" />
            </DangerButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modals & Notifications -->
    <PengumumanFormModal
      :show="isModalOpen"
      :mode="modalMode"
      :initial-data="selectedPengumuman"
      :loading="false"
      @close="closeModal"
      @submit="onFormSubmit"
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
        :class="['rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2', confirmButtonClass]"
      >
        {{ confirmButtonText }}
      </button>
    </Confirmation>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      :notificationMessageHtml="notificationMessageHtml"
      @close="hideNotification"
    />
  </div>
</template>
