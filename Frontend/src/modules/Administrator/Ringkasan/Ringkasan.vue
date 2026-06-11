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
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
      <template v-if="isLoadingDashboard">
        <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse h-32">
          <div class="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div class="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </template>
      <template v-else>
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
      </template>
    </div>

    <!-- Server Balances Row -->
    <div class="mb-5">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-blue-600"></div>
          <h2 class="font-bold text-slate-700 text-base">Informasi Saldo Server</h2>
        </div>
        <button 
          @click="fetchServerBalances"
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          :disabled="isLoadingBalances"
        >
          <IconRefresh class="w-4 h-4" :class="{ 'animate-spin': isLoadingBalances }" />
          Segarkan
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <template v-if="isLoadingBalances && balances.length === 0">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
            <div class="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div class="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-slate-200 rounded w-1/4 mt-4"></div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="server in balances"
            :key="server.id"
            class="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-bold text-slate-700 flex items-center gap-2">
                <IconServerCog class="w-5 h-5 text-indigo-500" />
                {{ server.name }}
              </span>
              <span 
                class="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                :class="server.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="server.status === 'success' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'"></span>
                {{ server.status === 'success' ? 'Online' : 'Error' }}
              </span>
            </div>
            
            <template v-if="server.status === 'success'">
              <p class="text-[13px] font-medium text-slate-400 mb-1">Saldo Terakhir</p>
              <p class="text-2xl font-black text-slate-800">{{ formatCurrency(server.balance) }}</p>
            </template>
            <template v-else>
              <p class="text-[13px] font-medium text-red-400 mb-1">Pesan Error</p>
              <p class="text-sm font-semibold text-red-500 truncate" :title="server.message">{{ server.message || 'Koneksi Gagal' }}</p>
            </template>
            
            <div class="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Diperbarui</span>
              <span>{{ formatTime(server.lastUpdated) }}</span>
            </div>
          </div>
        </template>
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
          <template v-if="isLoadingDashboard">
            <div v-for="i in 5" :key="i" class="flex items-center justify-between px-6 py-3.5 animate-pulse">
              <div class="flex items-center gap-3.5 w-full">
                <div class="w-9 h-9 bg-slate-200 rounded-xl flex-shrink-0"></div>
                <div class="space-y-2 w-full">
                  <div class="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div class="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div v-if="recentTransactions.length === 0" class="py-10 text-center text-sm text-slate-400">
              Belum ada transaksi
            </div>
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
          </template>
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
            <template v-if="isLoadingDashboard">
              <div v-for="i in 4" :key="i" class="animate-pulse">
                <div class="flex justify-between mb-1.5"><div class="w-1/3 h-3 bg-slate-200 rounded"></div><div class="w-8 h-3 bg-slate-200 rounded"></div></div>
                <div class="w-full h-2 bg-slate-200 rounded-full"></div>
                <div class="w-1/4 h-2 bg-slate-200 rounded mt-1"></div>
              </div>
            </template>
            <template v-else>
              <div v-if="topProducts.length === 0" class="text-center text-xs text-slate-400 py-4">Belum ada data</div>
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
            </template>
          </div>
        </div>

        <!-- Status Sistem -->
        <div class="bg-gradient-to-br from-outlet-navy to-blue-800 rounded-2xl p-5 text-white">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 class="font-bold text-sm">Status Sistem</h2>
          </div>
          <div class="space-y-3">
            <template v-if="isLoadingDashboard">
              <div v-for="i in 4" :key="i" class="flex items-center justify-between animate-pulse">
                <div class="w-1/3 h-3 bg-blue-700 rounded"></div>
                <div class="w-1/4 h-3 bg-blue-700 rounded"></div>
              </div>
            </template>
            <template v-else>
              <div v-for="sys in systemStatus" :key="sys.name" class="flex items-center justify-between">
                <span class="text-xs text-blue-200">{{ sys.name }}</span>
                <span class="flex items-center gap-1.5 text-xs font-semibold" :class="sys.ok ? 'text-emerald-400' : 'text-red-400'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="sys.ok ? 'bg-emerald-400' : 'bg-red-400'"></span>
                  {{ sys.ok ? 'Aktif' : 'Gangguan' }}
                </span>
              </div>
            </template>
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
import { ref, computed, onMounted } from 'vue';
import { dashboardService } from '@/service/administrator/dashboard';
import { useNotification } from '@/composables/useNotification';
import {
  IconCurrencyDollar,
  IconUsers,
  IconReceipt,
  IconPackage,
  IconCreditCard,
  IconPhone,
  IconDeviceMobile,
  IconWifi,
  IconServerCog,
  IconRefresh,
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

const formatTime = (isoStr: string) => {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const balances = ref<any[]>([]);
const isLoadingBalances = ref(false);

const stats = ref<any[]>([]);
const recentTransactions = ref<any[]>([]);
const topProducts = ref<any[]>([]);
const systemStatus = ref<any[]>([]);
const isLoadingDashboard = ref(true);

const notification = useNotification();

const fetchServerBalances = async () => {
  if (isLoadingBalances.value) return;
  isLoadingBalances.value = true;
  try {
    const res = await dashboardService.getServerBalances();
    if (res.data) balances.value = res.data;
  } catch (error: any) {
    notification.error({ message: error?.response?.data?.message || 'Gagal memuat saldo server' });
  } finally {
    isLoadingBalances.value = false;
  }
};

const fetchDashboardData = async () => {
  isLoadingDashboard.value = true;
  try {
    const [statsRes, trxRes, prodRes, sysRes] = await Promise.all([
      dashboardService.getStatistics(),
      dashboardService.getRecentTransactions(),
      dashboardService.getTopProducts(),
      dashboardService.getSystemStatus(),
    ]);

    const s = statsRes.data;
    stats.value = [
      {
        label: 'Total Pendapatan',
        value: formatCurrency(s.revenue.value),
        sub: 'Bulan ini',
        trend: `${s.revenue.trend > 0 ? '+' : ''}${s.revenue.trend.toFixed(1)}%`,
        trendUp: s.revenue.trendUp,
        icon: IconCurrencyDollar,
        color: '#2563eb',
        bgColor: '#dbeafe',
        gradient: 'linear-gradient(90deg, #2563eb, #6366f1)',
      },
      {
        label: 'Total Transaksi',
        value: new Intl.NumberFormat('id-ID').format(s.transactions.value),
        sub: `Hari ini: ${s.transactions.today} transaksi`,
        trend: `${s.transactions.trend > 0 ? '+' : ''}${s.transactions.trend.toFixed(1)}%`,
        trendUp: s.transactions.trendUp,
        icon: IconReceipt,
        color: '#059669',
        bgColor: '#d1fae5',
        gradient: 'linear-gradient(90deg, #059669, #10b981)',
      },
      {
        label: 'Member Aktif',
        value: new Intl.NumberFormat('id-ID').format(s.members.value),
        sub: `Baru bulan ini: ${s.members.newThisMonth}`,
        trend: `${s.members.trend > 0 ? '+' : ''}${s.members.trend.toFixed(1)}%`,
        trendUp: s.members.trendUp,
        icon: IconUsers,
        color: '#7c3aed',
        bgColor: '#ede9fe',
        gradient: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
      },
      {
        label: 'Produk Aktif',
        value: new Intl.NumberFormat('id-ID').format(s.products.value),
        sub: 'Siap dijual',
        trend: `${s.products.trend > 0 ? '+' : ''}${s.products.trend.toFixed(1)}%`,
        trendUp: s.products.trendUp,
        icon: IconPackage,
        color: '#d97706',
        bgColor: '#fef3c7',
        gradient: 'linear-gradient(90deg, #d97706, #f59e0b)',
      },
    ];

    recentTransactions.value = trxRes.data.map((t: any) => ({
      id: t.id,
      name: t.name,
      time: formatTime(t.time),
      amount: t.amount,
      status: t.status,
      statusClass: t.status === 'sukses' ? 'bg-emerald-50 text-emerald-600' : t.status === 'gagal' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600',
      icon: t.amount > 0 ? IconPhone : IconWifi,
      iconBg: t.amount > 0 ? 'bg-blue-50' : 'bg-red-50',
      iconColor: t.amount > 0 ? 'text-blue-500' : 'text-red-500'
    }));

    topProducts.value = prodRes.data;
    systemStatus.value = sysRes.data;

  } catch (error: any) {
    notification.error({ message: 'Gagal memuat data dashboard' });
  } finally {
    isLoadingDashboard.value = false;
  }
};

onMounted(() => {
  fetchServerBalances();
  fetchDashboardData();
});
</script>