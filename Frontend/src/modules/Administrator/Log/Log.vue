<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';

// Table
import BaseTable from '@/components/Table/BaseTable.vue';
import { logService, type ActivityLog } from '@/service/administrator/log';

// Definisi Kolom Tabel
const tableColumns = [
  {
    key: 'waktu',
    label: 'Waktu',
    headerClass: 'text-left w-[15%] pl-4',
    cellClass: 'text-left pl-4',
  },
  {
    key: 'pelaku',
    label: 'Pelaku',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'action',
    label: 'Aksi',
    headerClass: 'text-center w-[10%]',
    cellClass: 'text-center',
  },
  {
    key: 'entity',
    label: 'Entitas',
    headerClass: 'text-left w-[15%]',
    cellClass: 'text-left',
  },
  {
    key: 'description',
    label: 'Deskripsi',
    headerClass: 'text-left w-[45%] pr-4',
    cellClass: 'text-left pr-4',
  },
];

const dataLog = ref<ActivityLog[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const actionFilter = ref('');

// Inisialisasi Composable Pagination
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
    const response = await logService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      actionFilter.value
    );
    dataLog.value = response.data.data.list;
    totalRow.value = response.data.data.total;
  } catch (error) {
    console.error('Gagal mengambil data log:', error);
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

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date).replace(/\./g, ':');
};

const getBadgeColor = (action: string) => {
  const upper = action?.toUpperCase() || '';
  if (upper.includes('CREATE') || upper.includes('ADD')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (upper.includes('UPDATE') || upper.includes('EDIT')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (upper.includes('DELETE') || upper.includes('REMOVE')) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (upper.includes('LOGIN')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
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
            System Log
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Riwayat Aktivitas Sistem
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataLog"
        :loading="isLoading"
        :pagination="paginationProps"
        @page-change="pageNow"
        :showNumbering="false"
        :showActions="false"
        :showSearch="false"
        :showAdd="false"
      >
        <template #filters>
          <div class="inline-flex rounded-xl shadow-sm" role="group">
            <input
              type="text"
              id="search"
              class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
              v-model="searchQuery"
              @input="onSearch"
              placeholder="Cari aktivitas, pelaku, atau deskripsi..."
            />
            <select
              v-model="actionFilter"
              @change="applyFilter"
              class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>
        </template>

        <template #cell-waktu="{ row }">
          <span class="text-xs text-gray-500">{{ formatDate(row.createdAt) }}</span>
        </template>

        <template #cell-pelaku="{ row }">
          <div class="flex flex-col">
            <span v-if="row.user" class="text-sm font-semibold text-gray-800">{{ row.user.name }} (Admin)</span>
            <span v-else-if="row.member" class="text-sm font-semibold text-gray-800">{{ row.member.fullname }} (Member)</span>
            <span v-else class="text-sm font-semibold text-gray-500">System</span>
            <span v-if="row.member" class="text-[10px] text-gray-400 uppercase tracking-wider">{{ row.member.kode }}</span>
          </div>
        </template>

        <template #cell-action="{ row }">
          <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border" :class="getBadgeColor(row.action)">
            {{ row.action }}
          </span>
        </template>

        <template #cell-entity="{ row }">
          <div class="flex flex-col">
            <span class="font-semibold text-slate-700 text-xs">{{ row.entity || '-' }}</span>
            <span v-if="row.entityId" class="text-[10px] text-gray-400">ID: {{ row.entityId }}</span>
          </div>
        </template>

        <template #cell-description="{ row }">
          <span class="text-xs text-gray-600 line-clamp-2" :title="row.description">{{ row.description || '-' }}</span>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
