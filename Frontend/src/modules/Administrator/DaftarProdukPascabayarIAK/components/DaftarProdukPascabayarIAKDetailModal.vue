<script setup lang="ts">
import Modal from '@/components/Modal/Modal.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import dayjs from 'dayjs';

const props = defineProps({
  show: Boolean,
  produk: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY HH:mm');
};
</script>

<template>
  <Modal :show="show" title="Detail Produk IAK" @close="$emit('close')" max-width="md">
    <div v-if="produk" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Kode Produk</p>
          <p class="text-sm font-semibold text-gray-900">{{ produk.code || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Nama Produk</p>
          <p class="text-sm font-semibold text-gray-900">{{ produk.name || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Kategori</p>
          <p class="text-sm font-semibold text-gray-900">{{ produk.type?.type || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Fee</p>
          <p class="text-sm font-semibold text-emerald-600">{{ formatCurrency(produk.fee) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Komisi</p>
          <p class="text-sm font-semibold text-indigo-600">{{ formatCurrency(produk.komisi) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Status</p>
          <div>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': produk.status === 'ACTIVE' || produk.status === 'active',
                'bg-red-100 text-red-800': produk.status === 'INACTIVE' || produk.status === 'inactive' || produk.status === 'GANGGUAN',
                'bg-gray-100 text-gray-800': !produk.status
              }"
            >
              {{ produk.status || 'Unknown' }}
            </span>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Dibuat Pada</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatDate(produk.createdAt) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Diperbarui Pada</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatDate(produk.updatedAt) }}</p>
        </div>

      </div>

      <div v-if="produk.deskripsi" class="space-y-1 pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 font-medium">Deskripsi Lengkap</p>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ produk.deskripsi }}</p>
      </div>

    </div>

    <div class="mt-6 flex justify-end pt-4 border-t border-gray-200">
      <SecondaryButton @click="$emit('close')">Tutup</SecondaryButton>
    </div>
  </Modal>
</template>

