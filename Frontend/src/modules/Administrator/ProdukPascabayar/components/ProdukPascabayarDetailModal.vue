<script setup lang="ts">
import BaseFormModal from '@/components/Modal/Form.vue';
import type { Produk } from '../types/ProdukPascabayar';

const props = defineProps<{
  show: boolean;
  data: Produk | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
};
</script>

<template>
  <div>
    <BaseFormModal
      :form-status="show"
      label="Detail Produk"
      submit-label=""
      width="w-full max-w-lg"
      @close="emit('close')"
      @cancel="emit('close')"
    >
      <div v-if="data" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider">Kode Produk</p>
            <p class="font-medium text-gray-900">{{ data.kode }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider">Nama Produk</p>
            <p class="font-medium text-gray-900">{{ data.name }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider">Status</p>
            <span
              class="px-2.5 py-1 text-xs font-semibold rounded-full inline-block mt-1"
              :class="data.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ data.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
            </span>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-500">Fee Pusat</span>
            <span class="text-sm font-bold text-gray-900">{{ formatCurrency(data.fee) }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-500">Komisi Pusat</span>
            <span class="text-sm font-bold text-emerald-600">+ {{ formatCurrency(data.comission) }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-500">Outlet Fee</span>
            <span class="text-sm font-bold text-amber-600">{{ formatCurrency(data.outletFee) }}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-[#0f2155]/5 rounded-lg border border-[#0f2155]/10 mt-6">
            <span class="text-sm font-bold text-[#0f2155]">Total Tagihan (Jual)</span>
            <span class="text-lg font-black text-[#0f2155]">{{ formatCurrency((data.fee || 0) + (data.comission || 0)) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-10 text-gray-500">
        Data tidak tersedia
      </div>
    </BaseFormModal>
  </div>
</template>
