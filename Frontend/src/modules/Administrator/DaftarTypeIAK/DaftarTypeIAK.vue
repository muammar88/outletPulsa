<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import { typeIakService } from '@/service/administrator/typeIak';
import dayjs from 'dayjs';

const tableColumns = [
  {
    key: 'type',
    label: 'Tipe',
    headerClass: 'text-left w-[40%]',
    cellClass: 'text-left font-bold text-gray-800',
  },
  {
    key: 'operatorsCount',
    label: 'Jumlah Operator',
    headerClass: 'text-center w-[35%]',
    cellClass: 'text-center',
  },
  {
    key: 'updatedAt',
    label: 'Terakhir Diperbarui',
    headerClass: 'text-right w-[25%] pr-4',
    cellClass: 'text-right pr-4 text-sm text-gray-500',
  },
];

const dataTypeIak = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

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
    const response = await typeIakService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value,
    );
    dataTypeIak.value = response.data.data.list;
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

const formatDate = (date: string) => {
  return dayjs(date).format('DD MMM YYYY, HH:mm');
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Daftar Tipe IAK
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Tipe Produk Prabayar IAK
          </p>
        </div>
      </div>

      <BaseTable
          :columns="tableColumns"
          :data="dataTypeIak"
          :loading="isLoading"
          :pagination="paginationProps"
          search-placeholder="Cari tipe..."
          @search="fetchData"
          @page-change="pageNow"
          :showNumbering="false"
          :showActions="false"
          :showAdd="false"
        >
          <template #cell-operatorsCount="{ row }">
            <span class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-100">
              {{ row._count?.iakPrabayarOperators || 0 }} Operator
            </span>
          </template>

          <template #cell-updatedAt="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </BaseTable>
    </div>
  </div>
</template>
