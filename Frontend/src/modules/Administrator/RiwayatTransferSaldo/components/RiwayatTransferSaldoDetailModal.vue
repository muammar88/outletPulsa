<script setup lang="ts">
import Modal from '@/components/Modal/Modal.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import dayjs from 'dayjs';

const props = defineProps({
  show: Boolean,
  riwayat: {
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
  <Modal :show="show" title="Detail Riwayat Transfer Saldo" @close="$emit('close')" max-width="lg">
    <div v-if="riwayat" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">ID Transaksi</p>
          <p class="text-sm font-semibold text-gray-900 font-mono">{{ riwayat.trxId || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Tanggal Transfer</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatDate(riwayat.createdAt) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Server Asal</p>
          <p class="text-sm font-semibold text-indigo-700">{{ riwayat.serverAsal?.name || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Server Tujuan</p>
          <p class="text-sm font-semibold text-purple-700">{{ riwayat.serverTujuan?.name || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Saldo Sebelum (Asal)</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(riwayat.saldoSebelumAsal) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Saldo Sesudah (Asal)</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(riwayat.saldoSesudahAsal) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Saldo Sebelum (Tujuan)</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(riwayat.saldoSebelumTujuan) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Saldo Sesudah (Tujuan)</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatCurrency(riwayat.saldoSesudahTujuan) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Nominal Transfer</p>
          <p class="text-lg font-bold text-blue-600">{{ formatCurrency(riwayat.nominal) }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Status</p>
          <div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              :class="{
                'bg-emerald-100 text-emerald-800': riwayat.status === 'SUCCESS' || riwayat.status === 'sukses',
                'bg-red-100 text-red-800': riwayat.status === 'FAILED' || riwayat.status === 'gagal',
                'bg-amber-100 text-amber-800': riwayat.status === 'PENDING' || riwayat.status === 'pending',
                'bg-gray-100 text-gray-800': !riwayat.status
              }"
            >
              {{ riwayat.status || 'Unknown' }}
            </span>
          </div>
        </div>
        
        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Dieksekusi Oleh (Admin)</p>
          <p class="text-sm font-semibold text-gray-900">{{ riwayat.user?.name || '-' }}</p>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 font-medium">Diperbarui Pada</p>
          <p class="text-sm font-semibold text-gray-900">{{ formatDate(riwayat.updatedAt) }}</p>
        </div>

      </div>

      <div v-if="riwayat.keterangan" class="space-y-1 pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 font-medium">Keterangan / Catatan</p>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ riwayat.keterangan }}</p>
      </div>

    </div>

    <div class="mt-6 flex justify-end pt-4 border-t border-gray-200">
      <SecondaryButton @click="$emit('close')">Tutup</SecondaryButton>
    </div>
  </Modal>
</template>
