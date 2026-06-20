<template>
  <div class="min-h-screen bg-slate-50">

    <!-- HEADER / NAVBAR -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div class="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">

        <!-- Logo -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 flex items-center justify-center">
            <img src="/logo.webp" alt="Logo" class="w-full h-full object-contain drop-shadow" />
          </div>
          <div>
            <span class="block text-[15px] font-extrabold text-slate-800 leading-tight">Outlet Pulsa</span>
            <span class="block text-[10px] font-semibold text-blue-500 uppercase tracking-widest leading-tight">Member Area</span>
          </div>
        </div>

        <!-- DESKTOP NAV -->
        <nav class="hidden md:flex items-center gap-1">
          <button
            v-for="tab in tabs" :key="tab.key"
            @click="activeTab = tab.key"
            class="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            :class="activeTab === tab.key
              ? 'text-blue-600 bg-blue-50 font-semibold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'"
          >
            {{ tab.label }}
            <span
              v-if="activeTab === tab.key"
              class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"
            ></span>
          </button>
        </nav>

        <!-- Right: user + logout -->
        <div class="hidden md:flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
            <div class="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
              {{ profile.name.charAt(0).toUpperCase() }}
            </div>
            {{ profile.name }}
          </div>
          <button
            @click="doLogout"
            class="px-3 py-1.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

        <!-- MOBILE HAMBURGER -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-xl hover:bg-slate-100 transition text-slate-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- MOBILE MENU -->
      <transition name="slide-down">
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
          <button
            v-for="tab in tabs" :key="tab.key"
            @click="activeTab = tab.key; mobileMenuOpen = false"
            class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition"
            :class="activeTab === tab.key ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'"
          >{{ tab.label }}</button>
          <button
            @click="doLogout"
            class="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
          >Logout</button>
        </div>
      </transition>
    </header>

    <!-- MAIN CONTENT -->
    <main class="max-w-6xl mx-auto px-5 py-8">

      <!-- DASHBOARD -->
      <section v-if="activeTab === 'dashboard'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800">Selamat datang, {{ profile.name }} 👋</h1>
          <p class="text-slate-500 text-sm mt-1">Berikut ringkasan akun Anda hari ini.</p>
        </div>

        <!-- Stats -->
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo</p>
            <p class="text-2xl font-extrabold text-blue-600 mt-1">{{ formatCurrency(saldo) }}</p>
            <p class="text-xs text-slate-400 mt-2">Saldo tersedia</p>
          </div>
          <div class="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
            <p class="text-2xl font-extrabold text-slate-800 mt-1">{{ transaksi.length }}</p>
            <p class="text-xs text-slate-400 mt-2">Semua transaksi</p>
          </div>
          <div class="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Berhasil</p>
            <p class="text-2xl font-extrabold text-green-600 mt-1">{{ transaksi.filter(t => t.status === 'success').length }}</p>
            <p class="text-xs text-slate-400 mt-2">Transaksi sukses</p>
          </div>
        </div>

        <!-- Recent transactions -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-700">Transaksi Terbaru</h2>
            <button @click="activeTab = 'transaksi'" class="text-xs text-blue-500 font-semibold hover:text-blue-700 transition">Lihat semua →</button>
          </div>
          <ul class="divide-y divide-slate-100">
            <li v-for="t in transaksi.slice(0,3)" :key="t.id" class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition">
              <div>
                <p class="text-sm font-semibold text-slate-700">{{ t.desc }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ t.date }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold" :class="t.amount > 0 ? 'text-green-600' : 'text-slate-700'">{{ t.amount > 0 ? '+' : '' }}{{ formatCurrency(t.amount) }}</p>
                <span
                  class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  :class="t.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'"
                >{{ t.status === 'success' ? 'Berhasil' : 'Gagal' }}</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- TOP-UP -->
      <section v-if="activeTab === 'topup'" class="space-y-6 max-w-lg">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800">Top-Up Saldo</h1>
          <p class="text-slate-500 text-sm mt-1">Tambah saldo untuk melakukan transaksi pulsa & data.</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <!-- Current balance -->
          <div class="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
            <span class="text-sm font-semibold text-blue-700">Saldo saat ini</span>
            <span class="text-lg font-extrabold text-blue-600">{{ formatCurrency(saldo) }}</span>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Jumlah Top-Up</label>
            <input
              v-model.number="topupAmount"
              type="number"
              min="1000"
              placeholder="Contoh: 50000"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>
          <!-- Quick amounts -->
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="amount in [10000, 25000, 50000, 100000, 200000, 500000]" :key="amount"
              @click="topupAmount = amount"
              class="py-2 text-xs font-semibold rounded-xl border transition"
              :class="topupAmount === amount ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'"
            >{{ formatCurrencyShort(amount) }}</button>
          </div>
          <button
            @click="doTopup"
            class="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-md shadow-blue-200"
          >Top-Up Sekarang</button>
        </div>
      </section>

      <!-- RIWAYAT TRANSAKSI -->
      <section v-if="activeTab === 'transaksi'" class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800">Riwayat Transaksi</h1>
          <p class="text-slate-500 text-sm mt-1">Semua histori transaksi akun Anda.</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="hidden sm:grid grid-cols-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Tanggal</span>
            <span>Deskripsi</span>
            <span>Jumlah</span>
            <span>Status</span>
          </div>
          <ul class="divide-y divide-slate-100">
            <li v-for="t in transaksi" :key="t.id" class="grid grid-cols-2 sm:grid-cols-4 px-5 py-4 hover:bg-slate-50 transition text-sm items-center">
              <span class="text-slate-400 text-xs">{{ t.date }}</span>
              <span class="text-slate-700 font-medium">{{ t.desc }}</span>
              <span class="font-bold" :class="t.amount > 0 ? 'text-green-600' : 'text-slate-700'">{{ t.amount > 0 ? '+' : '' }}{{ formatCurrency(t.amount) }}</span>
              <span>
                <span
                  class="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  :class="t.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'"
                >{{ t.status === 'success' ? 'Berhasil' : 'Gagal' }}</span>
              </span>
            </li>
          </ul>
          <div v-if="transaksi.length === 0" class="flex flex-col items-center py-12 text-slate-400">
            <svg class="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <p class="text-sm">Belum ada transaksi</p>
          </div>
        </div>
      </section>

      <!-- PROFILE -->
      <section v-if="activeTab === 'profile'" class="space-y-6 max-w-lg">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-800">Profil Saya</h1>
          <p class="text-slate-500 text-sm mt-1">Perbarui informasi akun Anda.</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <!-- Avatar -->
          <div class="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-extrabold">
              {{ profile.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-bold text-slate-800">{{ profile.name }}</p>
              <p class="text-sm text-slate-400">{{ profile.email }}</p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
            <input
              v-model="profile.name"
              type="text"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              v-model="profile.email"
              type="email"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>
          <button
            @click="updateProfile"
            class="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-md shadow-blue-200"
          >Simpan Perubahan</button>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('dashboard');
const mobileMenuOpen = ref(false);

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'topup', label: 'Top-Up' },
  { key: 'transaksi', label: 'Riwayat Transaksi' },
  { key: 'profile', label: 'Profil' },
];

const saldo = ref(150000);
const transaksi = ref([
  { id: 1, date: '2026-02-18', desc: 'Top-Up Saldo', amount: 50000, status: 'success' },
  { id: 2, date: '2026-02-17', desc: 'Pembelian Pulsa', amount: -20000, status: 'success' },
  { id: 3, date: '2026-02-16', desc: 'Pembelian Paket Data', amount: -50000, status: 'failed' },
]);

const topupAmount = ref<number>(0);
const doTopup = () => {
  if (topupAmount.value > 0) {
    transaksi.value.unshift({
      id: transaksi.value.length + 1,
      date: new Date().toISOString().slice(0, 10),
      desc: 'Top-Up Saldo',
      amount: topupAmount.value,
      status: 'success',
    });
    saldo.value += topupAmount.value;
    topupAmount.value = 0;
  }
};

const profile = ref({ name: 'Muammar', email: 'muammar@example.com' });
const updateProfile = () => alert('Profil berhasil diperbarui!');
const doLogout = () => { window.location.href = '/login'; };

const formatCurrency = (value: number) =>
  'Rp ' + Math.abs(value).toLocaleString('id-ID');

const formatCurrencyShort = (value: number) => {
  if (value >= 1000000) return 'Rp ' + value / 1000000 + 'jt';
  if (value >= 1000) return 'Rp ' + value / 1000 + 'rb';
  return 'Rp ' + value;
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
