<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { laporanUmumService } from '@/service/administrator/laporanUmum';
import SummaryCards from './components/SummaryCards.vue';
import DashboardCharts from './components/DashboardCharts.vue';
import TransactionTable from './components/TransactionTable.vue';
import * as Icons from '@/components/Icons';
import dayjs from 'dayjs';

const summaryData = ref<any>(null);
const isLoading = ref(false);

const dateFilterOptions = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Kemarin', value: 'yesterday' },
  { label: 'Minggu Ini', value: 'this_week' },
  { label: 'Bulan Ini', value: 'this_month' },
  { label: 'Tahun Ini', value: 'this_year' }
];

const selectedFilter = ref('this_month');
const customStartDate = ref('');
const customEndDate = ref('');
const dateFilterObj = ref({ startDate: '', endDate: '' });

const calculateDateRange = () => {
  const now = dayjs();
  let start = '';
  let end = '';

  switch (selectedFilter.value) {
    case 'today':
      start = now.startOf('day').format('YYYY-MM-DD');
      end = now.endOf('day').format('YYYY-MM-DD');
      break;
    case 'yesterday':
      start = now.subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
      end = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD');
      break;
    case 'this_week':
      start = now.startOf('week').format('YYYY-MM-DD'); // note: dayjs week starts on Sun by default, but it's okay for UI filter
      end = now.endOf('day').format('YYYY-MM-DD');
      break;
    case 'this_month':
      start = now.startOf('month').format('YYYY-MM-DD');
      end = now.endOf('day').format('YYYY-MM-DD');
      break;
    case 'this_year':
      start = now.startOf('year').format('YYYY-MM-DD');
      end = now.endOf('day').format('YYYY-MM-DD');
      break;
    case 'custom':
      start = customStartDate.value;
      end = customEndDate.value;
      break;
  }
  
  dateFilterObj.value = { startDate: start, endDate: end };
};

const loadSummary = async () => {
  isLoading.value = true;
  calculateDateRange();
  
  try {
    const { startDate, endDate } = dateFilterObj.value;
    const res = await laporanUmumService.getSummary(startDate, endDate);
    summaryData.value = res.data.data;
  } catch (error) {
    console.error('Failed to load summary', error);
  } finally {
    isLoading.value = false;
  }
};

const onFilterChange = () => {
  if (selectedFilter.value === 'custom' && (!customStartDate.value || !customEndDate.value)) {
    return; // Wait for both custom dates
  }
  loadSummary();
};

onMounted(() => {
  loadSummary();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <!-- Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Laporan Umum
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Dashboard Statistik dan Analitik Transaksi
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Filters -->
          <div class="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <select 
              v-model="selectedFilter" 
              @change="onFilterChange"
              class="bg-transparent text-sm font-medium text-slate-700 outline-none border-none focus:ring-0 cursor-pointer pl-3 pr-8 py-1.5"
            >
              <option v-for="opt in dateFilterOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              <option value="custom">Pilih Tanggal...</option>
            </select>
            
            <div v-if="selectedFilter === 'custom'" class="flex items-center gap-2 px-2 border-l border-slate-200 ml-2">
              <input type="date" v-model="customStartDate" @change="onFilterChange" class="text-xs border border-slate-200 rounded px-2 py-1" />
              <span class="text-slate-400">-</span>
              <input type="date" v-model="customEndDate" @change="onFilterChange" class="text-xs border border-slate-200 rounded px-2 py-1" />
            </div>
          </div>
          
          <button @click="loadSummary" class="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
            <Icons.IconRefresh size="18" :class="{'animate-spin': isLoading}" />
          </button>
        </div>
      </div>

      <!-- Empty/Error State can go here, but usually dashboard always has data/0 -->
      
      <!-- Summary Cards -->
      <SummaryCards :data="summaryData" :loading="isLoading" />
      
      <!-- Dashboard Charts -->
      <DashboardCharts :data="summaryData" :loading="isLoading" />

      <!-- Transaction Table -->
      <TransactionTable :dateFilter="dateFilterObj" />

    </div>
  </div>
</template>
