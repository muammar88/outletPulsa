<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import {
  daftarProdukPascabayarSellerDigiflazzService,
  type DigiflazzPascabayarCatalogItem,
  type InternalProductOption,
} from '@/service/administrator/daftarProdukPascabayarSellerDigiflazz';

const props = defineProps<{
  show: boolean;
  item: DigiflazzPascabayarCatalogItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
  (e: 'notify', message: string): void;
}>();

const isLoadingProducts = ref(false);
const isSaving = ref(false);
const searchKeyword = ref('');
const options = ref<InternalProductOption[]>([]);
const selectedId = ref<number | null>(null);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Belum tersedia';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const mapsToCurrentCatalog = (option: InternalProductOption) =>
  option.digiflazzMappings.some((mapping) => mapping.digiflazzProductId === props.item?.id);

const fetchProducts = async (keyword = '') => {
  if (!props.item) return;
  isLoadingProducts.value = true;
  try {
    const response = await daftarProdukPascabayarSellerDigiflazzService.listInternalProducts({
      search: keyword.trim() || undefined,
      provider: 'DIGIFLAZZ',
      connection: 'available',
      catalogId: props.item.id,
    });
    options.value = response.data.data ?? [];
  } catch (error: any) {
    emit('notify', error.response?.data?.message || 'Gagal memuat produk pascabayar internal');
  } finally {
    isLoadingProducts.value = false;
  }
};

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => fetchProducts(searchKeyword.value), 450);
};

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      searchKeyword.value = '';
      options.value = [];
      selectedId.value = null;
      fetchProducts('');
    } else if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchTimeout = null;
    }
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!props.item || isSaving.value) return;
  if (!selectedId.value) {
    emit('notify', 'Pilih produk pascabayar internal terlebih dahulu');
    return;
  }

  isSaving.value = true;
  try {
    await daftarProdukPascabayarSellerDigiflazzService.connect(selectedId.value, {
      provider: 'DIGIFLAZZ',
      providerSku: props.item.buyerSkuCode,
      digiflazzProductId: props.item.id,
      iakProductId: null,
    });
    emit('saved');
  } catch (error: any) {
    emit('notify', error.response?.data?.message || 'Gagal menyimpan koneksi produk');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    label="Hubungkan Produk Pascabayar Digiflazz"
    submit-label="Simpan Koneksi"
    width="w-full max-w-lg"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSave"
  >
    <div v-if="item" class="space-y-5">
      <div class="bg-gradient-to-br from-sky-50 to-indigo-50 p-3 rounded-xl border border-indigo-100/50">
        <div class="flex items-center gap-2 border-b border-indigo-100 pb-2 mb-2">
          <div class="p-1 bg-indigo-100 text-indigo-600 rounded-md">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wide">Informasi Katalog Digiflazz</h3>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white/70 p-2 rounded-lg border border-white/50 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">SKU</p>
            <p class="text-xs font-bold text-gray-800 font-mono">{{ item.buyerSkuCode || '-' }}</p>
          </div>
          <div class="bg-white/70 p-2 rounded-lg border border-white/50 col-span-2">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Nama</p>
            <p class="text-xs font-bold text-gray-800 truncate" :title="item.name || '-'">{{ item.name || 'Nama belum tersedia' }}</p>
          </div>
          <div class="bg-white/70 p-2 rounded-lg border border-white/50 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Seller</p>
            <p class="text-xs font-bold text-gray-800 truncate" :title="item.sellerName || '-'">
              {{ item.sellerName || 'Seller tidak tersedia' }}
            </p>
          </div>
          <div class="bg-white/70 p-2 rounded-lg border border-white/50 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Kategori</p>
            <p class="text-xs font-bold text-gray-800 truncate" :title="item.category || '-'">{{ item.category || '-' }}</p>
          </div>
          <div class="bg-white/70 p-2 rounded-lg border border-white/50 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Admin</p>
            <p class="text-xs font-bold text-emerald-700 truncate">{{ formatCurrency(item.admin) }}</p>
          </div>
          <div class="bg-white/70 p-2 rounded-lg border border-white/50 col-span-1">
            <p class="text-[10px] text-indigo-600/70 font-semibold mb-0.5 uppercase tracking-wider">Komisi</p>
            <p class="text-xs font-bold text-indigo-700 truncate">{{ formatCurrency(item.commission) }}</p>
          </div>
        </div>
      </div>

      <div class="space-y-2 relative">
        <div class="relative group">
          <InputText
            id="searchInternalProduct"
            label="Pilih Produk Pascabayar Internal"
            placeholder="Cari kode atau nama produk internal..."
            v-model="searchKeyword"
            @input="onSearchInput"
            :required="true"
          />
          <div class="absolute right-3 top-[34px] flex items-center pointer-events-none">
            <svg v-if="isLoadingProducts" class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>

        <div class="border border-gray-200 rounded-xl max-h-56 overflow-y-auto bg-white shadow-sm">
          <div v-if="options.length === 0" class="flex flex-col items-center justify-center py-6 px-4 text-center">
            <p class="text-xs font-medium text-gray-600">
              {{ isLoadingProducts ? 'Memuat produk internal...' : 'Tidak ada produk internal yang tersedia' }}
            </p>
            <p class="text-[10px] text-gray-400 mt-1">
              Produk yang sudah terhubung ke SKU Digiflazz lain harus dilepas terlebih dahulu.
            </p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <label
              v-for="option in options"
              :key="option.id"
              class="flex items-start p-3 cursor-pointer transition-all duration-200 group"
              :class="{
                'bg-indigo-50/80 ring-1 ring-inset ring-indigo-200': selectedId === option.id,
                'hover:bg-indigo-50/60': !mapsToCurrentCatalog(option),
              }"
            >
              <div class="relative flex items-center justify-center pt-1">
                <input
                  type="radio"
                  name="internalProduct"
                  :value="option.id"
                  v-model="selectedId"
                  :disabled="isSaving"
                  class="peer sr-only"
                />
                <div class="w-4 h-4 border-2 rounded-full border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 transition-all flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 scale-0 peer-checked:scale-100 transition-transform duration-200"></div>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-xs font-bold text-gray-800 group-hover:text-indigo-900 transition-colors">
                  {{ option.name || 'Nama belum tersedia' }}
                </p>
                <p class="text-[10px] text-gray-500 mt-0.5 font-mono">{{ option.kode || '-' }}</p>
                <p class="text-[10px] text-gray-500 mt-0.5">
                  {{ option.kategori || 'Tanpa kategori' }} &middot;
                  Fee: <span class="font-semibold text-emerald-600">{{ formatCurrency(option.fee) }}</span> &middot;
                  Komisi: <span class="font-semibold text-indigo-600">{{ formatCurrency(option.comission) }}</span>
                </p>
                <span
                  v-if="mapsToCurrentCatalog(option)"
                  class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700"
                >
                  Sudah terhubung ke katalog ini
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <p class="text-[11px] text-gray-500">
        Koneksi baru disimpan sebagai kandidat. Provider akan dipilih sebagai aktif dari alur Produk Pascabayar, bukan dari halaman ini.
      </p>
    </div>
  </BaseFormModal>
</template>