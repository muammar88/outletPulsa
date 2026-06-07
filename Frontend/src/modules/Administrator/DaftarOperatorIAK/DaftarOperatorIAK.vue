<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import { operatorIakService } from '@/service/administrator/operatorIak';
import { typeIakService } from '@/service/administrator/typeIak';
import dayjs from 'dayjs';

const tableColumns = [
  {
    key: 'id',
    label: 'ID',
    headerClass: 'text-left w-[10%] pl-4',
    cellClass: 'text-left pl-4 font-mono font-medium',
  },
  {
    key: 'name',
    label: 'Nama Operator',
    headerClass: 'text-left w-[30%]',
    cellClass: 'text-left font-bold text-gray-800',
  },
  {
    key: 'type',
    label: 'Tipe',
    headerClass: 'text-left w-[20%]',
    cellClass: 'text-left text-sm',
  },
  {
    key: 'productsCount',
    label: 'Jumlah Produk',
    headerClass: 'text-center w-[20%]',
    cellClass: 'text-center',
  },
  {
    key: 'updatedAt',
    label: 'Terakhir Diperbarui',
    headerClass: 'text-right w-[20%] pr-4',
    cellClass: 'text-right pr-4 text-sm text-gray-500',
  },
];

const dataOperatorIak = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const filterTypeId = ref('');
const listTypes = ref<any[]>([]);

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 15, totalRow: 0 },
);

const fetchTypes = async () => {
  try {
    const res = await typeIakService.getAll('', 1000, 1);
    const types = res.data.data.list || res.data.data;
    listTypes.value = types.sort((a: any, b: any) => a.type.localeCompare(b.type));
  } catch (error) {
    console.error('Failed to fetch types', error);
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

const fetchData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword;
    currentPage.value = 1;
  }

  isLoading.value = true;
  try {
    const response = await operatorIakService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
      filterTypeId.value
    );
    dataOperatorIak.value = response.data.data.list;
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

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

onMounted(() => {
  fetchTypes();
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Daftar Operator IAK
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Operator Prabayar IAK
          </p>
        </div>
      </div>

      <BaseTable
          :columns="tableColumns"
          :data="dataOperatorIak"
          :loading="isLoading"
          :pagination="paginationProps"
          @page-change="pageNow"
          :showNumbering="false"
          :showActions="false"
          :showSearch="false"
          :showAddButton="false"
        >
          <template #filters>
            <div class="inline-flex rounded-xl shadow-sm" role="group">
              <input
                type="text"
                id="search"
                class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-s-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
                v-model="searchQuery"
                @input="onSearch"
                placeholder="Cari nama operator..."
              />
              <select
                v-model="filterTypeId"
                @change="applyFilter"
                class="relative block w-48 px-4 py-2.5 text-sm text-gray-800 bg-white border-y border-r border-gray-200 rounded-e-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="">Semua Tipe</option>
                <option v-for="t in listTypes" :key="t.id" :value="t.id">
                  {{ t.type }}
                </option>
              </select>
            </div>
          </template>

          <template #cell-type="{ row }">
            <span class="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-md uppercase tracking-wider">
              {{ row.type?.type || '-' }}
            </span>
          </template>

          <template #cell-productsCount="{ row }">
            <span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
              {{ row._count?.iakPrabayarProduks || 0 }} Produk
            </span>
          </template>

          <template #cell-updatedAt="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </BaseTable>
    </div>
  </div>
</template>
