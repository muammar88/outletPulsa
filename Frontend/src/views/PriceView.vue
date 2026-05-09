<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <!-- HEADER -->
    <header class="text-center pt-20 pb-10 px-6">
      <h1 class="text-4xl font-extrabold text-gray-800">Daftar Harga Pulsa & PPOB</h1>
      <p class="text-gray-500 mt-2">
        Cek harga terbaru untuk pulsa, paket data, dan pembayaran tagihan.
      </p>
    </header>

    <!-- FILTER KATEGORI -->
    <section class="px-6 pb-6">
      <div class="max-w-5xl mx-auto flex flex-wrap gap-3 justify-center">
        <button
          v-for="c in categories"
          :key="c"
          @click="activeCategory = c"
          class="px-4 py-2 rounded-xl text-sm font-semibold border transition"
          :class="
            activeCategory === c
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          "
        >
          {{ c }}
        </button>
      </div>
    </section>

    <!-- TABEL HARGA -->
    <section class="px-6 pb-20">
      <div
        class="max-w-5xl mx-auto bg-white/95 backdrop-blur rounded-3xl shadow-lg overflow-hidden"
      >
        <!-- Table Header -->
        <div
          class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between"
        >
          <h2 class="font-bold text-gray-800">List Harga {{ activeCategory }}</h2>
          <span class="text-xs text-gray-500">Update realtime</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-blue-50 text-blue-700 uppercase text-xs tracking-wider">
              <tr>
                <th class="text-left px-6 py-4 font-bold">Produk</th>
                <th class="text-left px-6 py-4 font-bold">Nominal</th>
                <th class="text-right px-6 py-4 font-bold">Harga</th>
              </tr>
            </thead>

            <tbody class="">
              <tr
                v-for="item in paginatedPrices"
                :key="item.name + item.nominal"
                class="hover:bg-blue-50/60 transition"
              >
                <td class="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                  {{ item.name }}
                </td>

                <td class="px-6 py-4 text-gray-600">
                  <span class="px-3 py-1 rounded-lg bg-gray-100 text-xs font-semibold">
                    {{ item.nominal }}
                  </span>
                </td>

                <td class="px-6 py-4 text-right">
                  <span class="text-blue-600 font-extrabold text-base">
                    {{ item.price }}
                  </span>
                </td>
              </tr>

              <tr v-if="filteredPrices.length === 0">
                <td colspan="3" class="text-center py-12 text-gray-400">
                  Tidak ada data harga pada kategori ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- PAGINATION -->
      <div class="flex items-center justify-between px-6 py-4 bg-white">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 text-sm disabled:opacity-40"
        >
          Prev
        </button>

        <div class="text-sm text-gray-500">Halaman {{ currentPage }} dari {{ totalPages }}</div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="text-center text-sm text-gray-500 pb-10">
      © 2026 Outlet Pulsa. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const categories = ['Pulsa', 'Paket Data', 'PPOB'];
const activeCategory = ref('Pulsa');

const prices = [
  { category: 'Pulsa', name: 'Telkomsel', nominal: '10.000', price: 'Rp11.200' },
  { category: 'Pulsa', name: 'Telkomsel', nominal: '20.000', price: 'Rp21.100' },
  { category: 'Pulsa', name: 'Indosat', nominal: '10.000', price: 'Rp10.900' },

  { category: 'Paket Data', name: 'Telkomsel 5GB', nominal: '30 Hari', price: 'Rp25.000' },
  { category: 'Paket Data', name: 'Indosat 10GB', nominal: '30 Hari', price: 'Rp32.000' },

  { category: 'PPOB', name: 'PLN Token', nominal: '20.000', price: 'Rp20.500' },
  { category: 'PPOB', name: 'BPJS', nominal: 'Per Bulan', price: 'Rp35.000' },
];

const currentPage = ref(1);
const perPage = 5;

const filteredPrices = computed(() => prices.filter((p) => p.category === activeCategory.value));

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPrices.value.length / perPage)));

const paginatedPrices = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredPrices.value.slice(start, start + perPage);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
</script>

<style></style>
