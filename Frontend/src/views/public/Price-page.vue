<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col" style="font-family: 'Poppins', sans-serif;">
    <!-- NAVBAR -->
    <Navbar />
    <div class="h-20"></div>

    <!-- HERO HEADER -->
    <section class="relative pt-16 pb-12 px-6 text-center overflow-hidden fade-in-up">
      <!-- Abstract BG -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl"></div>
        <div class="absolute -top-20 -right-32 w-80 h-80 bg-indigo-300 opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-2xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold mb-5 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Harga Diperbarui Secara Real-Time
        </div>

        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Daftar Harga
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pulsa & PPOB</span>
        </h1>
        <p class="text-gray-500 text-lg leading-relaxed">
          Cek harga terbaru untuk pulsa, paket data, dan tagihan dari semua operator terpercaya.
        </p>
      </div>
    </section>

    <!-- MAIN CONTENT -->
    <section class="px-4 md:px-6 pb-24 flex-grow">
      <div class="max-w-5xl mx-auto">

        <!-- FILTER TABS -->
        <div class="flex flex-wrap gap-3 justify-center mb-8 fade-in-up delay-100">
          <button
            v-for="c in categories"
            :key="c"
            @click="setCategory(c)"
            class="relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300"
            :class="
              activeCategory === c
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
            "
          >
            <span class="relative z-10 flex items-center gap-2">
              <component :is="categoryIcons[c]" class="w-4 h-4" :stroke="2.5" />
              {{ c }}
            </span>
          </button>
        </div>

        <!-- STATS ROW -->
        <div class="grid grid-cols-3 gap-4 mb-6 fade-in-up delay-200">
          <div class="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p class="text-2xl font-extrabold text-blue-600">{{ filteredPrices.length }}</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Produk</p>
          </div>
          <div class="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p class="text-2xl font-extrabold text-indigo-600">Live</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Update Harga</p>
          </div>
          <div class="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p class="text-2xl font-extrabold text-blue-600">24/7</p>
            <p class="text-xs text-gray-400 font-medium mt-0.5">Transaksi</p>
          </div>
        </div>

        <!-- PRICE TABLE CARD -->
        <div class="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100/80 fade-in-up delay-300">
          <!-- Card Header -->
          <div class="relative px-6 py-5 overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
            <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 24px 24px;"></div>
            <div class="relative z-10 flex items-center justify-between">
              <div>
                <h2 class="font-bold text-white text-lg tracking-tight">List Harga {{ activeCategory }}</h2>
                <p class="text-blue-200 text-xs mt-0.5">{{ filteredPrices.length }} produk tersedia</p>
              </div>
              <div class="flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-white text-xs font-semibold">Realtime</span>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50/80 border-b border-gray-100">
                  <th class="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produk</th>
                  <th class="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nominal</th>
                  <th class="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Harga</th>
                </tr>
              </thead>

              <transition-group name="list" tag="tbody">
                <tr
                  v-for="(item, idx) in paginatedPrices"
                  :key="item.name + item.nominal"
                  class="border-b border-gray-50 hover:bg-blue-50/60 transition-colors duration-150 group"
                  :class="{ 'bg-white': idx % 2 === 0, 'bg-gray-50/30': idx % 2 !== 0 }"
                >
                  <td class="px-6 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <component :is="categoryIcons[activeCategory]" class="w-4 h-4 text-blue-600" :stroke="2.5" />
                      </div>
                      <span class="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{{ item.name }}</span>
                    </div>
                  </td>

                  <td class="px-6 py-5">
                    <span class="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-gray-600 text-xs font-bold border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-all">
                      {{ item.nominal }}
                    </span>
                  </td>

                  <td class="px-6 py-5 text-right">
                    <span class="inline-flex items-center justify-end gap-1">
                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-base tracking-tight">
                        {{ item.price }}
                      </span>
                    </span>
                  </td>
                </tr>

                <tr v-if="filteredPrices.length === 0">
                  <td colspan="3" class="text-center py-20">
                    <div class="flex flex-col items-center gap-3 text-gray-400">
                      <IconInbox class="w-12 h-12 opacity-40" :stroke="1.5" />
                      <p class="font-semibold">Tidak ada data pada kategori ini</p>
                    </div>
                  </td>
                </tr>
              </transition-group>
            </table>
          </div>

          <!-- PAGINATION -->
          <div class="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
            >
              <IconChevronLeft class="w-4 h-4" :stroke="2.5" />
              Sebelumnya
            </button>

            <div class="flex items-center gap-2">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                class="w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200"
                :class="
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-blue-600'
                "
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
            >
              Berikutnya
              <IconChevronRight class="w-4 h-4" :stroke="2.5" />
            </button>
          </div>
        </div>

        <!-- CTA MINI -->
        <div class="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
          <div class="text-center md:text-left">
            <h3 class="text-xl font-bold text-white mb-1">Siap mulai berjualan?</h3>
            <p class="text-blue-100 text-sm">Daftar gratis dan langsung akses semua produk.</p>
          </div>
          <a
            href="/registration"
            class="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-blue-600 font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 whitespace-nowrap"
          >
            <IconRocket class="w-5 h-5 text-blue-500" :stroke="2" />
            Daftar Sekarang
          </a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IconDeviceMobile,
  IconWifi,
  IconCreditCard,
  IconChevronLeft,
  IconChevronRight,
  IconRocket,
  IconInbox,
} from '@tabler/icons-vue';
import Navbar from '@/views/public/components/Navbar.vue';
import Footer from '@/views/public/components/Footer.vue';

const categoryIcons: Record<string, any> = {
  'Pulsa': IconDeviceMobile,
  'Paket Data': IconWifi,
  'PPOB': IconCreditCard,
};

const categories = ['Pulsa', 'Paket Data', 'PPOB'];
const activeCategory = ref('Pulsa');

const prices = [
  { category: 'Pulsa', name: 'Telkomsel', nominal: '10.000', price: 'Rp11.200' },
  { category: 'Pulsa', name: 'Telkomsel', nominal: '20.000', price: 'Rp21.100' },
  { category: 'Pulsa', name: 'Telkomsel', nominal: '50.000', price: 'Rp51.500' },
  { category: 'Pulsa', name: 'Indosat', nominal: '10.000', price: 'Rp10.900' },
  { category: 'Pulsa', name: 'Indosat', nominal: '25.000', price: 'Rp25.800' },
  { category: 'Pulsa', name: 'XL Axiata', nominal: '10.000', price: 'Rp10.800' },
  { category: 'Pulsa', name: 'XL Axiata', nominal: '50.000', price: 'Rp51.000' },
  { category: 'Pulsa', name: 'Smartfren', nominal: '10.000', price: 'Rp10.700' },

  { category: 'Paket Data', name: 'Telkomsel 5GB', nominal: '30 Hari', price: 'Rp25.000' },
  { category: 'Paket Data', name: 'Telkomsel 10GB', nominal: '30 Hari', price: 'Rp45.000' },
  { category: 'Paket Data', name: 'Indosat 10GB', nominal: '30 Hari', price: 'Rp32.000' },
  { category: 'Paket Data', name: 'XL 5GB', nominal: '30 Hari', price: 'Rp28.000' },

  { category: 'PPOB', name: 'PLN Token', nominal: '20.000', price: 'Rp20.500' },
  { category: 'PPOB', name: 'PLN Token', nominal: '50.000', price: 'Rp51.000' },
  { category: 'PPOB', name: 'BPJS Kesehatan', nominal: 'Per Bulan', price: 'Rp35.000' },
  { category: 'PPOB', name: 'PDAM', nominal: 'Per Bulan', price: 'Rp5.000' },
];

const currentPage = ref(1);
const perPage = 6;

function setCategory(c: string) {
  activeCategory.value = c;
  currentPage.value = 1;
}

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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

/* Transition Group for table rows */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
.list-leave-active {
  position: absolute;
}
</style>
