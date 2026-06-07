<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import { daftarProdukTripayService } from '@/service/administrator/daftarProdukTripay';

const props = defineProps({
  show: Boolean,
  produk: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'saved']);

const isLoadingOperators = ref(false);
const isLoadingProducts = ref(false);
const isSaving = ref(false);

const searchOperatorKeyword = ref('');
const searchProductKeyword = ref('');

const internalOperators = ref<any[]>([]);
const internalProducts = ref<any[]>([]);

const selectedOperatorId = ref<number | null>(null);
const selectedInternalProduct = ref<number | null>(null);

let searchOperatorTimeout: ReturnType<typeof setTimeout> | null = null;
let searchProductTimeout: ReturnType<typeof setTimeout> | null = null;

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const fetchInternalOperators = async (keyword = '') => {
  isLoadingOperators.value = true;
  try {
    const response = await daftarProdukTripayService.getInternalOperators(keyword);
    internalOperators.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil data operator internal', error);
  } finally {
    isLoadingOperators.value = false;
  }
};

const fetchInternalProducts = async (operatorId: number, keyword = '') => {
  isLoadingProducts.value = true;
  try {
    const response = await daftarProdukTripayService.getInternalProducts(operatorId, keyword);
    internalProducts.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil data produk internal', error);
  } finally {
    isLoadingProducts.value = false;
  }
};

const onSearchOperatorInput = () => {
  if (searchOperatorTimeout) clearTimeout(searchOperatorTimeout);
  searchOperatorTimeout = setTimeout(() => {
    fetchInternalOperators(searchOperatorKeyword.value);
  }, 500);
};

const onSearchProductInput = () => {
  if (searchProductTimeout) clearTimeout(searchProductTimeout);
  if (!selectedOperatorId.value) return;
  searchProductTimeout = setTimeout(() => {
    fetchInternalProducts(selectedOperatorId.value!, searchProductKeyword.value);
  }, 500);
};

watch(selectedOperatorId, (newId, oldId) => {
  if (oldId !== undefined && newId !== props.produk?.produk?.operatorId) {
    selectedInternalProduct.value = null;
  }
  
  searchProductKeyword.value = '';
  if (newId) {
    fetchInternalProducts(newId, '');
  } else {
    internalProducts.value = [];
  }
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      searchOperatorKeyword.value = '';
      searchProductKeyword.value = '';
      internalOperators.value = [];
      internalProducts.value = [];
      
      const existingOperatorId = props.produk?.produk?.operatorId;
      selectedOperatorId.value = existingOperatorId || null;
      selectedInternalProduct.value = props.produk?.produkId || null;
      
      fetchInternalOperators('');
    } else {
      if (searchOperatorTimeout) clearTimeout(searchOperatorTimeout);
      if (searchProductTimeout) clearTimeout(searchProductTimeout);
    }
  }
);

const handleSave = async () => {
  if (!selectedInternalProduct.value) return;
  
  isSaving.value = true;
  try {
    await daftarProdukTripayService.connectProduct(props.produk.id, selectedInternalProduct.value);
    emit('saved');
  } catch (error) {
    console.error('Gagal menyimpan koneksi', error);
    // Ideally emit an error to be handled by parent
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    label="Koneksi Produk Tripay"
    submit-label="Simpan Koneksi"
    width="w-full max-w-2xl"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSave"
  >
    <div v-if="produk" class="space-y-5">
      <!-- Informasi Produk Tripay -->
      <div class="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100/50 shadow-inner">
        <div class="flex items-center gap-2 border-b border-indigo-100 pb-2 mb-2">
          <div class="p-1 bg-indigo-100 text-indigo-600 rounded-md">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wide">Informasi Produk Tripay</h3>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div class="bg-white/60 p-2 rounded-lg border border-white/40 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Kode</p>
            <p class="text-xs font-bold text-gray-800">{{ produk.kode || '-' }}</p>
          </div>
          <div class="bg-white/60 p-2 rounded-lg border border-white/40 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Nama</p>
            <p class="text-xs font-bold text-gray-800 line-clamp-1" :title="produk.name">{{ produk.name || '-' }}</p>
          </div>
          <div class="bg-white/60 p-2 rounded-lg border border-white/40 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Operator</p>
            <p class="text-xs font-bold text-gray-800 line-clamp-1" :title="produk.operator?.name">{{ produk.operator?.name || '-' }}</p>
          </div>
          <div class="bg-indigo-600/5 p-2 rounded-lg border border-indigo-100/50 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Harga Modal</p>
            <p class="text-xs font-black text-indigo-700 line-clamp-1">{{ formatCurrency(produk.price) }}</p>
          </div>
        </div>
      </div>

      <!-- Cascading Dropdowns -->
      <div class="grid grid-cols-2 gap-4 mt-2">
        
        <!-- Pemilihan Operator Internal -->
        <div class="space-y-2 relative">
          <div class="relative group">
            <InputText
              id="searchOperatorKeyword"
              label="1. Pilih Operator Internal"
              placeholder="Cari operator..."
              v-model="searchOperatorKeyword"
              @input="onSearchOperatorInput"
              :required="true"
            />
            
            <div class="absolute right-3 top-[34px] flex items-center pointer-events-none transition-opacity duration-300">
              <svg v-if="isLoadingOperators" class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="h-5 w-5 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-sm custom-scrollbar transition-all duration-300">
            <div v-if="internalOperators.length === 0" class="flex flex-col items-center justify-center py-6 px-4 text-center">
              <div class="bg-gray-50 p-2 rounded-full mb-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p class="text-xs font-medium text-gray-600">Tidak ada operator ditemukan</p>
            </div>
            
            <div v-else class="divide-y divide-gray-100">
              <label
                v-for="item in internalOperators"
                :key="item.id"
                class="flex items-center p-3 hover:bg-indigo-50/60 cursor-pointer transition-all duration-200 group"
                :class="{ 'bg-indigo-50/80 ring-1 ring-inset ring-indigo-200': selectedOperatorId === item.id }"
              >
                <div class="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="internalOperator"
                    :value="item.id"
                    v-model="selectedOperatorId"
                    class="peer sr-only"
                  />
                  <div class="w-4 h-4 border-2 rounded-full border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all flex items-center justify-center">
                    <div class="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-bold text-gray-800 group-hover:text-indigo-900 transition-colors">
                    {{ item.name }}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Pemilihan Produk Internal -->
        <div class="space-y-2 relative" :class="{'opacity-50 pointer-events-none': !selectedOperatorId}">
          <div class="relative group">
            <InputText
              id="searchProductKeyword"
              label="2. Pilih Produk Internal"
              placeholder="Cari produk..."
              v-model="searchProductKeyword"
              @input="onSearchProductInput"
              :required="true"
              :disabled="!selectedOperatorId"
            />
            
            <div class="absolute right-3 top-[34px] flex items-center pointer-events-none transition-opacity duration-300">
              <svg v-if="isLoadingProducts" class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="h-5 w-5 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-sm custom-scrollbar transition-all duration-300">
            <div v-if="!selectedOperatorId" class="flex flex-col items-center justify-center py-6 px-4 text-center">
              <div class="bg-gray-50 p-2 rounded-full mb-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p class="text-xs font-medium text-gray-600">Pilih operator terlebih dahulu</p>
            </div>
            
            <div v-else-if="internalProducts.length === 0" class="flex flex-col items-center justify-center py-6 px-4 text-center">
              <div class="bg-gray-50 p-2 rounded-full mb-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <p class="text-xs font-medium text-gray-600">Tidak ada produk ditemukan</p>
            </div>
            
            <div v-else class="divide-y divide-gray-100">
              <label
                v-for="item in internalProducts"
                :key="item.id"
                class="flex items-center p-3 hover:bg-indigo-50/60 cursor-pointer transition-all duration-200 group"
                :class="{ 'bg-indigo-50/80 ring-1 ring-inset ring-indigo-200': selectedInternalProduct === item.id }"
              >
                <div class="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="internalProduct"
                    :value="item.id"
                    v-model="selectedInternalProduct"
                    class="peer sr-only"
                  />
                  <div class="w-4 h-4 border-2 rounded-full border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all flex items-center justify-center">
                    <div class="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                  </div>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-xs font-bold text-gray-800 group-hover:text-indigo-900 transition-colors">
                    {{ item.name }} 
                  </p>
                  <p class="text-[10px] text-gray-500 mt-0.5">
                    {{ item.kode }} • <span class="font-bold text-emerald-600">{{ formatCurrency(item.purchase_price + (item.markup || 0)) }}</span>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

    </div>
  </BaseFormModal>
</template>
