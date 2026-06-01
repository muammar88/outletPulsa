<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard Ringkasan</h1>
        <p class="text-sm text-slate-500 mt-0.5">Selamat datang kembali! Ini adalah ringkasan aktivitas hari ini.</p>
      </div> -->
      <div>
        <h1 class="text-3xl font-black font-semibold text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight">
          Dashboard Ringkasan
        </h1>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
          Selamat datang kembali! Ini adalah ringkasan aktivitas hari ini.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2">
        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
      >
        <!-- Accent bar -->
        <div class="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" :style="{ background: stat.gradient }"></div>

        <!-- Icon -->
        <div class="flex items-start justify-between mb-4">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ background: stat.bgColor }">
            <component :is="stat.icon" class="w-5 h-5" :style="{ color: stat.color }" :stroke="2" />
          </div>
          <span
            class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            :class="stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" :d="stat.trendUp ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'" />
            </svg>
            {{ stat.trend }}
          </span>
        </div>

        <p class="text-[13px] font-medium text-slate-400 mb-1">{{ stat.label }}</p>
        <p class="text-2xl font-extrabold text-slate-800">{{ stat.value }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ stat.sub }}</p>
      </div>
    </div>

    <!-- Main Content Row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

      <!-- Transaksi Terbaru -->
      <div class="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
            <h2 class="font-bold text-slate-700 text-sm">Transaksi Terbaru</h2>
          </div>
          <button class="text-xs text-blue-600 font-semibold hover:underline">Lihat semua</button>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="trx in recentTransactions" :key="trx.id" class="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors duration-150">
            <div class="flex items-center gap-3.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :class="trx.iconBg">
                <component :is="trx.icon" class="w-4 h-4" :class="trx.iconColor" :stroke="2" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-700">{{ trx.name }}</p>
                <p class="text-xs text-slate-400">{{ trx.time }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold" :class="trx.amount > 0 ? 'text-emerald-600' : 'text-red-500'">
                {{ trx.amount > 0 ? '+' : '' }}{{ formatCurrency(trx.amount) }}
              </p>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="trx.statusClass">{{ trx.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="flex flex-col gap-5">

        <!-- Aktivitas Penjualan -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-purple-600"></div>
            <h2 class="font-bold text-slate-700 text-sm">Produk Terlaris</h2>
          </div>
          <div class="space-y-3">
            <div v-for="product in topProducts" :key="product.name">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-semibold text-slate-600">{{ product.name }}</span>
                <span class="text-xs font-bold text-slate-700">{{ product.percent }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700 ease-out"
                  :style="{ width: product.percent + '%', background: product.color }"
                ></div>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">{{ product.count }} transaksi</p>
            </div>
          </div>
        </div>

        <!-- Status Sistem -->
        <div class="bg-gradient-to-br from-outlet-navy to-blue-800 rounded-2xl p-5 text-white">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 class="font-bold text-sm">Status Sistem</h2>
          </div>
          <div class="space-y-3">
            <div v-for="sys in systemStatus" :key="sys.name" class="flex items-center justify-between">
              <span class="text-xs text-blue-200">{{ sys.name }}</span>
              <span class="flex items-center gap-1.5 text-xs font-semibold" :class="sys.ok ? 'text-emerald-400' : 'text-red-400'">
                <span class="w-1.5 h-1.5 rounded-full" :class="sys.ok ? 'bg-emerald-400' : 'bg-red-400'"></span>
                {{ sys.ok ? 'Aktif' : 'Gangguan' }}
              </span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span class="text-xs text-blue-300">Uptime 30 hari</span>
            <span class="text-sm font-extrabold text-emerald-400">99.8%</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IconCurrencyDollar,
  IconUsers,
  IconReceipt,
  IconPackage,
  IconCreditCard,
  IconPhone,
  IconDeviceMobile,
  IconWifi,
} from '@tabler/icons-vue';

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Math.abs(value));
};

const stats = ref([
  {
    label: 'Total Pendapatan',
    value: 'Rp 48,5 Jt',
    sub: 'Bulan Juni 2026',
    trend: '+12.4%',
    trendUp: true,
    icon: IconCurrencyDollar,
    color: '#2563eb',
    bgColor: '#dbeafe',
    gradient: 'linear-gradient(90deg, #2563eb, #6366f1)',
  },
  {
    label: 'Total Transaksi',
    value: '1.284',
    sub: 'Hari ini: 47 transaksi',
    trend: '+8.1%',
    trendUp: true,
    icon: IconReceipt,
    color: '#059669',
    bgColor: '#d1fae5',
    gradient: 'linear-gradient(90deg, #059669, #10b981)',
  },
  {
    label: 'Member Aktif',
    value: '3.921',
    sub: 'Baru bulan ini: 128',
    trend: '+5.2%',
    trendUp: true,
    icon: IconUsers,
    color: '#7c3aed',
    bgColor: '#ede9fe',
    gradient: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
  },
  {
    label: 'Stok Produk',
    value: '342',
    sub: 'Perlu restok: 12',
    trend: '-3.0%',
    trendUp: false,
    icon: IconPackage,
    color: '#d97706',
    bgColor: '#fef3c7',
    gradient: 'linear-gradient(90deg, #d97706, #f59e0b)',
  },
]);

const recentTransactions = ref([
  { id: 1, name: 'Pulsa Telkomsel 50K',   time: '2 menit lalu',   amount:  50000, status: 'Sukses',  statusClass: 'bg-emerald-50 text-emerald-600', icon: IconPhone,        iconBg: 'bg-red-50',    iconColor: 'text-red-500' },
  { id: 2, name: 'Paket Data XL 10GB',    time: '15 menit lalu',  amount:  89000, status: 'Sukses',  statusClass: 'bg-emerald-50 text-emerald-600', icon: IconWifi,         iconBg: 'bg-blue-50',   iconColor: 'text-blue-500' },
  { id: 3, name: 'Pulsa Indosat 25K',     time: '32 menit lalu',  amount: -25000, status: 'Gagal',   statusClass: 'bg-red-50 text-red-500',         icon: IconPhone,        iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500' },
  { id: 4, name: 'Paket Data Telkomsel',  time: '1 jam lalu',     amount: 120000, status: 'Sukses',  statusClass: 'bg-emerald-50 text-emerald-600', icon: IconDeviceMobile, iconBg: 'bg-red-50',    iconColor: 'text-red-500' },
  { id: 5, name: 'Tagihan BPJS',          time: '2 jam lalu',     amount: 150000, status: 'Pending', statusClass: 'bg-amber-50 text-amber-600',      icon: IconCreditCard,   iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
]);

const topProducts = ref([
  { name: 'Pulsa Telkomsel', percent: 82, count: 1052, color: 'linear-gradient(90deg, #2563eb, #6366f1)' },
  { name: 'Paket Data XL',   percent: 65, count: 834,  color: 'linear-gradient(90deg, #059669, #34d399)' },
  { name: 'Pulsa Indosat',   percent: 48, count: 615,  color: 'linear-gradient(90deg, #d97706, #fbbf24)' },
  { name: 'Tagihan BPJS',    percent: 31, count: 397,  color: 'linear-gradient(90deg, #7c3aed, #a78bfa)' },
]);

const systemStatus = ref([
  { name: 'API Gateway',       ok: true },
  { name: 'Database',          ok: true },
  { name: 'Payment Gateway',   ok: true },
  { name: 'Notifikasi SMS',    ok: false },
]);
</script>