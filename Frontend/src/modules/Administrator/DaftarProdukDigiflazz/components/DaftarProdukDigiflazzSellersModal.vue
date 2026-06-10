<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { daftarProdukDigiflazzService } from '@/service/administrator/daftarProdukDigiflazz';

const props = defineProps({
  show: Boolean,
  produk: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const isLoading = ref(false);
const sellers = ref<any[]>([]);

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const fetchSellers = async () => {
  if (!props.produk?.id) return;
  isLoading.value = true;
  try {
    const response = await daftarProdukDigiflazzService.getSellers(props.produk.id);
    sellers.value = response.data.data;
  } catch (error: any) {
    console.error('Gagal mengambil data seller', error);
    const errMessage = error.response?.data?.message || 'Gagal mengambil data seller';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      sellers.value = [];
      fetchSellers();
    }
  },
  { immediate: true }
);
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="`Daftar Seller Terhubung: ${produk?.name || 'Produk'}`"
    submit-label=""
    width="w-full max-w-5xl"
    @close="emit('close')"
    @cancel="emit('close')"
  >
    <div class="space-y-4">
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="sellers.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm font-bold text-gray-700">Belum ada seller terhubung</p>
        <p class="text-xs text-gray-500 mt-1 max-w-xs">Produk Digiflazz ini belum memiliki relasi seller aktif di dalam sistem.</p>
      </div>

      <div v-else class="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[5%]">No</th>
              <th scope="col" class="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[25%]">Nama Seller</th>
              <th scope="col" class="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">SKU Buyer</th>
              <th scope="col" class="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[20%]">Harga Seller</th>
              <th scope="col" class="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status Produk</th>
              <th scope="col" class="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]">Status Seller</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr 
              v-for="(seller, index) in sellers" 
              :key="seller.id"
              class="transition-colors hover:bg-gray-50/50"
              :class="{ 'bg-blue-50/50 hover:bg-blue-50': seller.buyerSkuKode === produk?.selectedSellerBuyerSkuKode }"
            >
              <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-medium">
                {{ index + 1 }}
              </td>
              
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-800 flex items-center gap-2">
                      {{ seller.digiflazzSeller?.name || 'Unknown' }}
                      <span v-if="seller.buyerSkuKode === produk?.selectedSellerBuyerSkuKode" class="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide font-bold shadow-sm">
                        Terpilih
                      </span>
                    </span>
                  </div>
                </div>
              </td>
              
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded font-mono shadow-sm">
                  {{ seller.buyerSkuKode || '-' }}
                </span>
              </td>
              
              <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-black text-indigo-700">
                {{ formatCurrency(seller.price) }}
              </td>
              
              <td class="px-4 py-3 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': seller.sellerProductStatus,
                    'bg-rose-50 text-rose-700 border border-rose-200': !seller.sellerProductStatus,
                  }"
                >
                  {{ seller.sellerProductStatus ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>

              <td class="px-4 py-3 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border border-emerald-200': seller.digiflazzSeller?.status === 'unbanned',
                    'bg-red-100 text-red-800 border border-red-300': seller.digiflazzSeller?.status === 'banned',
                  }"
                >
                  {{ seller.digiflazzSeller?.status === 'banned' ? 'BANNED' : 'UNBANNED' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </BaseFormModal>

  <!-- Notification Modal -->
  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
</template>
