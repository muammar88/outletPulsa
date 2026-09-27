<script setup lang="ts">
import Modal from '@/components/Modal/Modal.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import dayjs from 'dayjs';
import type { DigiflazzPascabayarCatalogItem } from '@/service/administrator/daftarProdukPascabayarSellerDigiflazz';

defineProps<{
  show: boolean;
  item: DigiflazzPascabayarCatalogItem | null;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Belum tersedia';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string | null | undefined) =>
  value ? dayjs(value).format('DD MMM YYYY HH:mm') : '-';

const statusLabel = (value: boolean | null) => {
  if (value === true) return 'Tersedia';
  if (value === false) return 'Tidak tersedia';
  return 'Belum diketahui';
};

const statusClass = (value: boolean | null) => {
  if (value === true) return 'bg-emerald-100 text-emerald-800';
  if (value === false) return 'bg-rose-100 text-rose-800';
  return 'bg-slate-100 text-slate-700';
};
</script>

<template>
  <Modal :show="show" title="Detail Produk Pascabayar Digiflazz" @close="emit('close')" max-width-class="max-w-2xl">
    <div v-if="item" class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">SKU Seller</p>
          <p class="text-sm font-semibold text-gray-900 font-mono">{{ item.buyerSkuCode || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Nama Produk</p>
          <p class="text-sm font-semibold text-gray-900">{{ item.name || 'Nama belum tersedia' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Seller</p>
          <p class="text-sm font-semibold text-gray-900">{{ item.sellerName || 'Seller tidak tersedia' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Kategori</p>
          <p class="text-sm font-semibold text-gray-900">{{ item.category || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Brand</p>
          <p class="text-sm font-semibold text-gray-900">{{ item.brand || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Admin Provider</p>
          <p class="text-sm font-semibold text-emerald-600">{{ formatCurrency(item.admin) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Komisi</p>
          <p class="text-sm font-semibold text-indigo-600">{{ formatCurrency(item.commission) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Status Buyer</p>
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass(item.buyerProductStatus)">
            {{ statusLabel(item.buyerProductStatus) }}
          </span>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Status Seller</p>
          <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClass(item.sellerProductStatus)">
            {{ statusLabel(item.sellerProductStatus) }}
          </span>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Sinkron Terakhir</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatDate(item.syncedAt) }}</p>
        </div>
      </div>

      <div class="space-y-1 pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 font-medium">Deskripsi</p>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ item.desc || 'Deskripsi belum tersedia' }}</p>
      </div>

      <div class="space-y-2 pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 font-medium">Koneksi Produk Internal</p>
        <div v-if="item.providerSelections && item.providerSelections.length" class="space-y-2">
          <div
            v-for="m in item.providerSelections"
            :key="m.id"
            class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
          >
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-gray-800">{{ m.produkPascabayar?.name || '-' }}</span>
              <span class="text-[11px] text-gray-500 font-mono">
                {{ m.produkPascabayar?.kode || '-' }} | {{ m.provider }} / {{ m.providerSku }}
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              :class="m.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'"
            >
              {{ m.isActive ? 'Aktif' : 'Kandidat' }}
            </span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Belum ada koneksi produk internal.</p>
      </div>
    </div>

    <div class="mt-6 flex justify-end pt-4 border-t border-gray-200">
      <SecondaryButton @click="emit('close')">Tutup</SecondaryButton>
    </div>
  </Modal>
</template>