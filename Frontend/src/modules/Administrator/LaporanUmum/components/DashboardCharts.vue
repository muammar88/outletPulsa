<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: any;
  loading: boolean;
}>();

// Chart Options Builder
const buildAreaChartOptions = (title: string, categories: string[], yAxisFormatter: (val: number) => string) => {
  return {
    chart: { type: 'area', height: 300, toolbar: { show: false }, fontFamily: 'Poppins, sans-serif' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories, tooltip: { enabled: false } },
    yaxis: {
      labels: {
        formatter: yAxisFormatter
      }
    },
    title: { text: title, align: 'left', style: { fontSize: '14px', fontWeight: 600, color: '#334155' } },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    colors: ['#3b82f6', '#10b981'],
    legend: { position: 'top', horizontalAlign: 'right' }
  };
};

const buildPieChartOptions = (title: string, labels: string[]) => {
  return {
    chart: { type: 'donut', fontFamily: 'Poppins, sans-serif' },
    labels,
    title: { text: title, align: 'left', style: { fontSize: '14px', fontWeight: 600, color: '#334155' } },
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%' }
  };
};

// Daily Chart (Count & Nominal)
const dailyChartOptions = computed(() => {
  const dates = (props.data?.charts?.dailyTx || []).map((item: any) => {
    const d = new Date(item.date);
    return `${d.getDate()}/${d.getMonth()+1}`;
  });
  return buildAreaChartOptions('Transaksi Harian (30 Hari)', dates, (val) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val));
});

const dailyChartSeries = computed(() => {
  const counts = (props.data?.charts?.dailyTx || []).map((item: any) => item.count);
  return [
    { name: 'Jumlah Transaksi', data: counts }
  ];
});

// Monthly Profit Chart
const monthlyChartOptions = computed(() => {
  const months = (props.data?.charts?.monthlyTx || []).map((item: any) => {
    const d = new Date(item.date);
    return d.toLocaleString('id-ID', { month: 'short' });
  });
  return buildAreaChartOptions('Keuntungan Bulanan', months, (val) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val));
});

const monthlyChartSeries = computed(() => {
  const laba = (props.data?.charts?.monthlyTx || []).map((item: any) => item.laba);
  return [
    { name: 'Laba (Rp)', data: laba }
  ];
});

// Success vs Failed Pie
const statusChartOptions = computed(() => {
  const data = props.data?.charts?.statusComparison || [];
  const labels = data.map((d: any) => d.status.toUpperCase());
  const options = buildPieChartOptions('Rasio Status Transaksi', labels);
  // mapping colors for specific status
  const mappedColors = labels.map((l: string) => {
    if (l === 'SUKSES') return '#10b981';
    if (l === 'PROSES') return '#f59e0b';
    if (l === 'GAGAL') return '#ef4444';
    return '#94a3b8';
  });
  options.colors = mappedColors;
  return options;
});

const statusChartSeries = computed(() => {
  const data = props.data?.charts?.statusComparison || [];
  return data.map((d: any) => d.count);
});

// Monthly Deposit Area
const depositChartOptions = computed(() => {
  const months = (props.data?.charts?.monthlyDeposit || []).map((item: any) => {
    const d = new Date(item.month + '-01'); // it's YYYY-MM
    return d.toLocaleString('id-ID', { month: 'short' });
  });
  return buildAreaChartOptions('Deposit Masuk Bulanan', months, (val) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val));
});

const depositChartSeries = computed(() => {
  const nominals = (props.data?.charts?.monthlyDeposit || []).map((item: any) => item.nominal);
  return [
    { name: 'Nominal Deposit', data: nominals }
  ];
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8" v-if="!loading && data?.charts">
    <!-- Daily Tx Chart -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 xl:col-span-2">
      <apexchart type="area" height="300" :options="dailyChartOptions" :series="dailyChartSeries"></apexchart>
    </div>

    <!-- Status Ratio Pie -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center justify-center">
      <apexchart type="donut" width="100%" height="300" :options="statusChartOptions" :series="statusChartSeries"></apexchart>
    </div>

    <!-- Monthly Profit Chart -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <apexchart type="area" height="300" :options="monthlyChartOptions" :series="monthlyChartSeries"></apexchart>
    </div>

    <!-- Deposit Chart -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 xl:col-span-2">
      <apexchart type="area" height="300" :options="depositChartOptions" :series="depositChartSeries"></apexchart>
    </div>
  </div>
  
  <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-2xl border border-slate-100 p-5 h-[340px] xl:col-span-2 animate-pulse flex items-center justify-center bg-slate-50">Loading chart...</div>
    <div class="bg-white rounded-2xl border border-slate-100 p-5 h-[340px] animate-pulse flex items-center justify-center bg-slate-50">Loading chart...</div>
    <div class="bg-white rounded-2xl border border-slate-100 p-5 h-[340px] animate-pulse flex items-center justify-center bg-slate-50">Loading chart...</div>
    <div class="bg-white rounded-2xl border border-slate-100 p-5 h-[340px] xl:col-span-2 animate-pulse flex items-center justify-center bg-slate-50">Loading chart...</div>
  </div>
</template>
