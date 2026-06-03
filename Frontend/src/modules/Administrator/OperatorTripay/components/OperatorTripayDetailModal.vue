<script setup lang="ts">
import dayjs from 'dayjs';

const props = defineProps<{
  show: boolean;
  data: any | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Detail Operator Tripay</h3>
          <p class="text-xs text-gray-500 mt-0.5">ID #{{ data?.id }} &mdash; Kode: {{ data?.kode }}</p>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors focus:outline-none"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        <!-- Info Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p class="text-xs text-gray-500 font-medium mb-1">Nama Operator</p>
            <p class="font-bold text-gray-900">{{ data?.name || '-' }}</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p class="text-xs text-gray-500 font-medium mb-1">Kode</p>
            <p class="font-bold text-slate-700">{{ data?.kode || '-' }}</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p class="text-xs text-purple-600 font-medium mb-1">Kategori</p>
            <p class="font-bold text-purple-900">{{ data?.kategori?.name || '-' }}</p>
          </div>
          <div class="bg-green-50 rounded-xl p-4 border border-green-100">
            <p class="text-xs text-green-600 font-medium mb-1">Total Produk</p>
            <p class="text-2xl font-black text-green-900">{{ data?._count?.tripayPrabayarProduks ?? data?.tripayPrabayarProduks?.length ?? 0 }}</p>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span class="font-medium">Dibuat: </span>
            {{ data?.createdAt ? formatDate(data.createdAt) : '-' }}
          </div>
          <div>
            <span class="font-medium">Diperbarui: </span>
            {{ data?.updatedAt ? formatDate(data.updatedAt) : '-' }}
          </div>
        </div>

        <!-- Product List -->
        <div>
          <h4 class="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
            Daftar Produk
            <span class="bg-gray-200 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
              {{ data?.tripayPrabayarProduks?.length ?? 0 }}
            </span>
          </h4>

          <div class="border rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kode</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Produk</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr
                  v-for="prod in data?.tripayPrabayarProduks ?? []"
                  :key="prod.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ prod.kode || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prod.name || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {{ prod.price ? formatCurrency(prod.price) : '-' }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                        prod.status === 'ACTIVE' || prod.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : prod.status === 'GANGGUAN'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ prod.status || 'UNKNOWN' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!data?.tripayPrabayarProduks?.length">
                  <td colspan="4" class="px-4 py-8 text-center text-sm text-gray-500">
                    Tidak ada produk dalam operator ini
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
