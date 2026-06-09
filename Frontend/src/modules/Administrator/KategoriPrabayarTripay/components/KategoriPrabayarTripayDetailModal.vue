<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps<{
  show: boolean;
  data: any | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY, HH:mm');

const totalProduk = computed(() => {
  if (!props.data?.tripayPrabayarOperators) return 0;
  return props.data.tripayPrabayarOperators.reduce(
    (sum: number, op: any) => sum + (op._count?.tripayPrabayarProduks ?? 0),
    0,
  );
});
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Detail Kategori Prabayar Tripay</h3>
          <p class="text-xs text-gray-500 mt-0.5">ID #{{ data?.id }}</p>
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
            <p class="text-xs text-gray-500 font-medium mb-1">Nama Kategori</p>
            <p class="font-bold text-gray-900">{{ data?.name || '-' }}</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p class="text-xs text-gray-500 font-medium mb-1">Kode / Tipe</p>
            <p class="font-bold text-blue-700">{{ data?.type || '-' }}</p>
          </div>
          <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p class="text-xs text-indigo-600 font-medium mb-1">Jml Operator</p>
            <p class="text-2xl font-black text-indigo-900">{{ data?._count?.tripayPrabayarOperators ?? 0 }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p class="text-xs text-blue-600 font-medium mb-1">Total Produk</p>
            <p class="text-2xl font-black text-blue-900">{{ totalProduk }}</p>
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

        <!-- Operator List -->
        <div>
          <h4 class="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
            Daftar Operator
            <span class="bg-gray-200 text-gray-700 py-0.5 px-2.5 rounded-full text-xs">
              {{ data?.tripayPrabayarOperators?.length ?? 0 }}
            </span>
          </h4>

          <div class="border rounded-xl overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kode</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Operator</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Jml Produk</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr
                  v-for="op in data?.tripayPrabayarOperators ?? []"
                  :key="op.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ op.kode || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ op.name || '-' }}</td>
                  <td class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    {{ op._count?.tripayPrabayarProduks ?? 0 }}
                  </td>
                </tr>
                <tr v-if="!data?.tripayPrabayarOperators?.length">
                  <td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500">
                    Tidak ada operator dalam kategori ini
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
