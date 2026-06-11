<script setup lang="ts">
import dayjs from 'dayjs';
import Modal from '@/components/Modal/Modal.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';

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
  <Modal :show="show" @close="emit('close')" max-widthClass="max-w-4xl">
    <!-- Premium Header -->
    <div class="relative bg-[#0f2155] px-6 py-8 overflow-hidden shrink-0 -mt-6 -mx-6 rounded-t-lg">
        <!-- Abstract background pattern -->
        <div class="absolute inset-0 opacity-10">
          <svg class="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 32V.5H32" fill="none" stroke="currentColor" stroke-width="1"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern-grid)"></rect>
          </svg>
        </div>

        <button
          @click="emit('close')"
          class="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors focus:outline-none z-10"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="relative z-10 flex items-start gap-5">
          <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shrink-0 shadow-inner">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Operator Pascabayar Tripay
              </span>
              <span class="text-white/50 text-xs font-mono font-medium">ID #{{ data?.id }}</span>
            </div>
            <h3 class="text-3xl font-black text-white tracking-tight leading-tight">{{ data?.name || '-' }}</h3>
            <div class="flex items-center gap-3 mt-2 text-sm text-white/70 font-medium">
              <span class="px-2 py-0.5 bg-white/10 rounded-md font-mono text-xs font-bold text-white border border-white/10">{{ data?.kode || '-' }}</span>
              <span class="w-1 h-1 rounded-full bg-white/30"></span>
              <span>Kategori: <span class="text-white">{{ data?.kategori?.name || '-' }}</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body: Scrollable Area -->
      <div class="flex-1 overflow-y-auto bg-[#f8fafc]">
        <div class="p-6 md:p-8 space-y-8">
          
          <!-- Key Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-center gap-4 transition-transform hover:-translate-y-0.5">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p class="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Total Produk Prabayar</p>
                <p class="text-2xl font-black text-slate-800">{{ data?._count?.tripayPascabayarProduks ?? data?.tripayPascabayarProduks?.length ?? 0 }}</p>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col justify-center space-y-3">
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span class="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Dibuat Pada</span>
                <span class="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md">{{ data?.createdAt ? formatDate(data.createdAt) : '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-slate-600">
                <span class="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Diperbarui Pada</span>
                <span class="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md">{{ data?.updatedAt ? formatDate(data.updatedAt) : '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Product List -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight">
                Daftar Produk
                <span class="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs font-bold shadow-inner">
                  {{ data?.tripayPascabayarProduks?.length ?? 0 }}
                </span>
              </h4>
            </div>

            <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-100">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Kode</th>
                      <th class="px-5 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Nama Produk</th>
                      <th class="px-5 py-4 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Harga</th>
                      <th class="px-5 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr
                      v-for="prod in data?.tripayPascabayarProduks ?? []"
                      :key="prod.id"
                      class="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td class="px-5 py-4 text-sm font-bold text-slate-700 font-mono tracking-wide">
                        <span class="px-2 py-1 bg-slate-100 border border-slate-200/60 rounded-md group-hover:bg-white transition-colors">{{ prod.kode || '-' }}</span>
                      </td>
                      <td class="px-5 py-4 text-sm font-bold text-slate-800">{{ prod.name || '-' }}</td>
                      <td class="px-5 py-4 text-sm text-right font-black text-emerald-600">
                        {{ prod.price ? formatCurrency(prod.price) : '-' }}
                      </td>
                      <td class="px-5 py-4 text-center">
                        <span
                          :class="[
                            'inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider',
                            prod.status === 'ACTIVE' || prod.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : prod.status === 'GANGGUAN'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          ]"
                        >
                          {{ prod.status || 'UNKNOWN' }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="!data?.tripayPascabayarProduks?.length">
                      <td colspan="4" class="px-5 py-16 text-center">
                        <div class="flex flex-col items-center justify-center text-slate-400">
                          <svg class="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p class="text-sm font-medium">Belum ada produk untuk operator ini</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>

    <template #footer>
      <SecondaryButton @click="emit('close')">Tutup</SecondaryButton>
    </template>
  </Modal>
</template>
