<script setup lang="ts">
import { IconList, IconLoader2 } from '@/components/Icons';

import { usePagination } from '@/composables/usePaginations';
import { onMounted, ref } from 'vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import { daftarSellerDigiflazzService } from '@/service/administrator/daftarSellerDigiflazz';
import { daftarProdukSellerDigiflazzService } from '@/service/administrator/daftarProdukSellerDigiflazz';
import { useNotification } from '@/composables/useNotification';
import Modal from '@/components/Modal/Modal.vue';

const tableColumns = [
  { key: 'name', label: 'Nama Seller', headerClass: 'text-left w-[40%] pl-4', cellClass: 'text-left pl-4 font-semibold text-gray-800' },
  { key: 'jumlah_produk', label: 'Jumlah Produk', headerClass: 'text-center w-[20%]', cellClass: 'text-center font-medium text-gray-600' },
  { key: 'status', label: 'Status', headerClass: 'text-center w-[20%]', cellClass: 'text-center' },
  { key: 'actions', label: 'Aksi', headerClass: 'text-center w-[20%] pr-4', cellClass: 'text-center pr-4' },
];

const dataSeller = ref<any[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => fetchData(),
  { perPage: 100, totalRow: 0 }
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

const notification = useNotification();

const toggleStatus = async (row: any) => {
  const newStatus = row.status === 'unbanned' ? 'banned' : 'unbanned';
  const oldStatus = row.status;
  try {
    row.status = newStatus;
    await daftarSellerDigiflazzService.updateStatus(row.id, newStatus);
    notification.success({ message: `Status seller berhasil diubah menjadi ${newStatus}` });
  } catch (error) {
    row.status = oldStatus;
    notification.error({ message: 'Gagal mengubah status seller' });
  }
};

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
});

const showProductsModal = ref(false);
const selectedSellerName = ref('');
const sellerProducts = ref<any[]>([]);
const isProductsLoading = ref(false);

const openProductsModal = async (seller: any) => {
  selectedSellerName.value = seller.name;
  showProductsModal.value = true;
  isProductsLoading.value = true;
  sellerProducts.value = [];
  
  try {
    const response = await daftarProdukSellerDigiflazzService.getAll('', 1000, 1, seller.id);
    sellerProducts.value = response.data.data.list;
  } catch (error) {
    console.error('Gagal mengambil data produk seller:', error);
  } finally {
    isProductsLoading.value = false;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
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

        <template #cell-jumlah_produk="{ row }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
            {{ row._count?.digiflazzSellerProducts || 0 }} Produk
          </span>
        </template>

        <template #cell-status="{ row }">
          <div class="flex items-center justify-center">
            <button 
              type="button" 
              class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f2155]/50 focus:ring-offset-1"
              :class="row.status === 'unbanned' ? 'bg-emerald-500' : 'bg-rose-500'"
              @click="toggleStatus(row)"
            >
              <span class="sr-only">Toggle Status</span>
              <span 
                class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="row.status === 'unbanned' ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
            <span class="ml-2 text-xs font-bold uppercase tracking-wider" :class="row.status === 'unbanned' ? 'text-emerald-600' : 'text-rose-600'">
              {{ row.status }}
            </span>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <button
            @click="openProductsModal(row)"
            class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-white bg-[#0f2155] rounded-md hover:bg-[#0f2155]/90 focus:outline-none transition-colors shadow-sm"
          >
            <IconList class="mr-1.5 w-4 h-4" /> Lihat Produk
          </button>
        </template>
      </BaseTable>
    </div>

    <!-- Modal Produk -->
    <Modal
      :show="showProductsModal"
      :title="`Daftar Produk Seller: ${selectedSellerName}`"
      max-width-class="max-w-4xl"
      @close="showProductsModal = false"
    >
      <div v-if="isProductsLoading" class="flex justify-center py-10">
        <IconLoader2 class="animate-spin  text-3xl text-gray-400 w-4 h-4" />
      </div>
      <div v-else class="max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
        <table class="min-w-full divide-y divide-gray-200 border-b border-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[15%]">SKU</th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-[40%]">Produk Digiflazz</th>
              <th scope="col" class="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider w-[25%]">Harga Seller</th>
              <th scope="col" class="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-[20%]">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="product in sellerProducts" :key="product.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-4 py-2.5 whitespace-nowrap text-xs font-mono font-bold text-slate-700 bg-slate-50 border-r border-gray-100">
                {{ product.buyerSkuKode || '-' }}
              </td>
              <td class="px-4 py-2.5 text-sm text-gray-800 font-semibold">
                {{ product.digiflazzProduct?.name || '-' }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap text-sm text-emerald-600 font-bold text-right">
                {{ formatCurrency(product.price) }}
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200/60': product.sellerProductStatus,
                    'bg-rose-50 text-rose-700 border border-rose-200/60': !product.sellerProductStatus
                  }"
                >
                  {{ product.sellerProductStatus ? 'Tersedia' : 'Kosong' }}
                </span>
              </td>
            </tr>
            <tr v-if="sellerProducts.length === 0">
              <td colspan="4" class="px-4 py-10 text-center text-sm text-gray-500 font-medium">
                Belum ada produk untuk seller ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <button
          @click="showProductsModal = false"
          class="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
        >
          Tutup
        </button>
      </template>
    </Modal>
  </div>
</template>
