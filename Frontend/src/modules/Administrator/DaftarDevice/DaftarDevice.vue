<script setup lang="ts">
import { ref } from 'vue';
import { usePagination } from '@/composables/usePaginations';
import { deviceService, type Device } from '@/service/administrator/device';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
import LightButton from '@/components/Button/LightButton.vue';

// Modal
import DaftarDeviceDetailModal from '@/modules/Administrator/DaftarDevice/components/DaftarDeviceDetailModal.vue';

// Icon
import IconEye from '@/components/Icons/IconEye.vue';

// Definisi Kolom Tabel
const tableColumns = [
  {
    key: 'device_name',
    label: 'Nama Device',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'platform_info',
    label: 'Platform',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'app_version',
    label: 'Versi App',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
  {
    key: 'member_info',
    label: 'Pemilik',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left',
  },
  {
    key: 'last_login',
    label: 'Last Login',
    headerClass: 'text-left w-[15%]',
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
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
];

const dataDevice = ref<Device[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Modal State
const showDetailModal = ref(false);
const selectedDevice = ref<Device | null>(null);

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
    const response = await deviceService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataDevice.value = response.data.data.list;
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

const handleDetail = async (row: Device) => {
  try {
    const response = await deviceService.getById(row.id!);
    selectedDevice.value = response.data.data;
    showDetailModal.value = true;
  } catch (error) {
    console.error('Gagal mengambil detail device:', error);
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

fetchData();
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
    <!-- Header Page -->
    <div class="sm:flex sm:justify-between sm:items-center mb-8">
      <div class="mb-4 sm:mb-0">
        <h1 class="text-2xl md:text-3xl text-gray-800 font-bold tracking-tight">Daftar Device</h1>
        <!-- Breadcrumbs -->
        <nav class="flex mt-1.5" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-2">
            <li class="inline-flex items-center">
              <a href="#" class="text-gray-500 hover:text-primary-600">Administrator</a>
            </li>
            <li>
              <div class="flex items-center">
                <span class="text-gray-400 mx-2">/</span>
                <span class="text-gray-800 font-medium">Daftar Device</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Filter & Table Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
      <!-- Card Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="fetchData(searchQuery)"
              placeholder="Cari nama device, merk, atau pemilik..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
            />
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="fetchData()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :columns="tableColumns"
        :data="dataDevice"
        :isLoading="isLoading"
        :pagination="paginationProps"
        @page-change="currentPage = $event"
        @fetch-data="fetchData"
      >
        <template #cell-device_name="{ row }">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-900">{{ row.device_name || '-' }}</div>
              <div class="text-xs text-gray-500">Kode: <span class="font-mono text-[10px]">{{ row.device_code.substring(0, 8) }}...</span></div>
            </div>
          </div>
        </template>

        <template #cell-platform_info="{ row }">
          <div class="text-sm text-gray-900">{{ row.device_brand || '-' }} {{ row.device_model || '' }}</div>
          <div class="text-xs text-gray-500">{{ row.os_name || '-' }} {{ row.os_version || '' }}</div>
        </template>

        <template #cell-app_version="{ row }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ row.app_version || 'Unknown' }}
          </span>
        </template>

        <template #cell-member_info="{ row }">
          <div v-if="row.member">
            <div class="text-sm font-medium text-gray-900">{{ row.member.fullname }}</div>
            <div class="text-xs text-gray-500">{{ row.member.whatsappnumber }}</div>
          </div>
          <div v-else class="text-sm text-gray-400 italic">Tidak ada info</div>
        </template>

        <template #cell-last_login="{ row }">
          <div class="text-sm text-gray-900">{{ formatDate(row.last_login) }}</div>
        </template>

        <template #cell-status="{ row }">
          <span :class="[
              'px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center',
              row.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            ]">
            <span :class="[
              'w-1.5 h-1.5 rounded-full mr-1.5',
              row.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-500'
            ]"></span>
            {{ row.status }}
          </span>
        </template>

        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-2">
            <LightButton @click="handleDetail(row)" class="p-1.5" title="Detail">
              <IconEye class="w-4 h-4 text-blue-600" />
            </LightButton>
          </div>
        </template>
      </BaseTable>
    </div>

    <!-- Modals -->
    <DaftarDeviceDetailModal
      :show="showDetailModal"
      :device="selectedDevice"
      @close="showDetailModal = false"
    />
  </div>
</template>
