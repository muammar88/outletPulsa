<script setup lang="ts">
import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import { daftarSellerDigiflazzService } from '@/service/administrator/daftarSellerDigiflazz';

const tableColumns = [
  { key: 'name', label: 'Nama Seller', headerClass: 'text-left w-[60%] pl-4', cellClass: 'text-left pl-4 font-semibold text-gray-800' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[40%]', cellClass: 'text-center' },
];

const dataSeller = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 10, totalRow: 0 }
);

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
    const response = await daftarSellerDigiflazzService.getAll(
      searchQuery.value,
      perPage.value,
      currentPage.value
    );
    dataSeller.value = response.data.data.list;
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
            Daftar Seller Digiflazz
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Manajemen Data Seller Digiflazz
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataSeller"
        :loading="isLoading"
        :pagination="paginationProps"
        @page-change="pageNow"
        :show-numbering="false"
        :show-actions="false"
        :show-search="false"
        :show-add="false"
        @refresh="fetchData"
      >
        <template #filters>
          <div class="flex gap-3">
            <div class="inline-flex rounded-xl shadow-sm" role="group">
              <input
                type="text"
                class="relative block w-64 px-4 py-2.5 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus:z-10 focus:border-[#0f2155] focus:ring-[3px] focus:ring-[#0f2155]/10 focus:outline-none transition-all duration-200"
                v-model="searchQuery"
                @input="onSearch"
                placeholder="Cari nama seller..."
              />
            </div>
          </div>
        </template>

        <template #cell-name="{ row }">
          <div class="flex flex-col py-1 text-left">
            <span class="text-[14px] font-bold text-gray-800">{{ row.name }}</span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
            :class="{
              'bg-emerald-50 text-emerald-700 border border-emerald-200/60': row.status === 'unbanned',
              'bg-rose-50 text-rose-700 border border-rose-200/60': row.status === 'banned'
            }"
          >
            {{ row.status || 'UNKNOWN' }}
          </span>
        </template>
      </BaseTable>
    </div>
  </div>
</template>
