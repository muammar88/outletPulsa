<script setup lang="ts">
import { computed } from 'vue';
import * as Icons from '@/components/Icons';

const props = defineProps<{
  data: any;
  loading: boolean;
}>();

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat('id-ID').format(val || 0);
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <!-- Ringkasan Member -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Icons.IconUsers size="20" />
        </div>
        <h3 class="font-bold text-slate-800">Ringkasan Member</h3>
      </div>
      
      <div v-if="loading" class="animate-pulse space-y-3">
        <div class="h-4 bg-slate-200 rounded w-full" v-for="i in 4" :key="i"></div>
      </div>
      <div v-else class="space-y-3 text-sm">
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Total Keseluruhan</span>
          <span class="font-semibold text-slate-800">{{ formatNumber(data?.memberSummary?.total) }}</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Member Aktif</span>
          <span class="font-semibold text-emerald-600">{{ formatNumber(data?.memberSummary?.active) }}</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Member Tidak Aktif</span>
          <span class="font-semibold text-rose-600">{{ formatNumber(data?.memberSummary?.inactive) }}</span>
        </div>
        <div class="flex justify-between items-center pt-1">
          <span class="text-slate-500">Member Baru (Filter)</span>
          <span class="font-semibold text-blue-600">{{ formatNumber(data?.memberSummary?.newFiltered) }}</span>
        </div>
      </div>
    </div>

    <!-- Ringkasan Saldo -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <Icons.IconWallet size="20" />
        </div>
        <h3 class="font-bold text-slate-800">Ringkasan Saldo</h3>
      </div>
      
      <div v-if="loading" class="animate-pulse space-y-3">
        <div class="h-4 bg-slate-200 rounded w-full" v-for="i in 4" :key="i"></div>
      </div>
      <div v-else class="space-y-3 text-sm">
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Total Saldo Member</span>
          <span class="font-bold text-slate-800">{{ formatCurrency(data?.saldoSummary?.totalSaldo) }}</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Total Saldo Digunakan</span>
          <span class="font-semibold text-blue-600">{{ formatCurrency(data?.saldoSummary?.totalSaldoUsed) }}</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Total Deposit Masuk</span>
          <span class="font-semibold text-emerald-600">{{ formatCurrency(data?.saldoSummary?.depositSuccess) }}</span>
        </div>
        <div class="flex justify-between items-center pt-1">
          <span class="text-slate-500">Total Deposit Pending</span>
          <span class="font-semibold text-amber-600">{{ formatCurrency(data?.saldoSummary?.depositPending) }}</span>
        </div>
      </div>
    </div>

    <!-- Ringkasan Transaksi -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Icons.IconChecklist size="20" />
        </div>
        <h3 class="font-bold text-slate-800">Ringkasan Transaksi (Filter)</h3>
      </div>
      
      <div v-if="loading" class="animate-pulse space-y-3">
        <div class="h-4 bg-slate-200 rounded w-full" v-for="i in 4" :key="i"></div>
      </div>
      <div v-else class="space-y-3 text-sm">
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Total Transaksi</span>
          <span class="font-bold text-slate-800">{{ formatNumber(data?.transactionSummary?.totalAll) }} Trx</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Transaksi Berhasil</span>
          <span class="font-semibold text-emerald-600">{{ formatNumber(data?.transactionSummary?.totalSuccessAll) }} Trx</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-slate-50">
          <span class="text-slate-500">Total Keuntungan</span>
          <span class="font-semibold text-indigo-600">{{ formatCurrency(data?.transactionSummary?.totalLabaAll) }}</span>
        </div>
        <div class="flex justify-between items-center pt-1">
          <span class="text-slate-500">Total Omset Nominal</span>
          <span class="font-semibold text-slate-800">{{ formatCurrency(data?.transactionSummary?.totalNominalAll) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail Per Tipe Transaksi -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" v-if="!loading && data?.transactionSummary">
    <div class="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 p-4">
      <h4 class="font-semibold text-slate-700 mb-3 text-sm">Prabayar</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="text-slate-500">Jumlah: <span class="font-semibold text-slate-800">{{ formatNumber(data.transactionSummary.prabayar.totalCount) }}</span></div>
        <div class="text-slate-500">Sukses: <span class="font-semibold text-emerald-600">{{ formatNumber(data.transactionSummary.prabayar.totalSuccess) }}</span></div>
        <div class="text-slate-500">Nominal: <span class="font-semibold text-slate-800">{{ formatCurrency(data.transactionSummary.prabayar.totalNominal) }}</span></div>
        <div class="text-slate-500">Laba: <span class="font-semibold text-indigo-600">{{ formatCurrency(data.transactionSummary.prabayar.totalLaba) }}</span></div>
      </div>
    </div>
    
    <div class="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 p-4">
      <h4 class="font-semibold text-slate-700 mb-3 text-sm">Pascabayar</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="text-slate-500">Jumlah: <span class="font-semibold text-slate-800">{{ formatNumber(data.transactionSummary.pascabayar.totalCount) }}</span></div>
        <div class="text-slate-500">Sukses: <span class="font-semibold text-emerald-600">{{ formatNumber(data.transactionSummary.pascabayar.totalSuccess) }}</span></div>
        <div class="text-slate-500">Nominal: <span class="font-semibold text-slate-800">{{ formatCurrency(data.transactionSummary.pascabayar.totalNominal) }}</span></div>
        <div class="text-slate-500">Laba: <span class="font-semibold text-indigo-600">{{ formatCurrency(data.transactionSummary.pascabayar.totalLaba) }}</span></div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 p-4">
      <h4 class="font-semibold text-slate-700 mb-3 text-sm">Deposit</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="text-slate-500">Jumlah: <span class="font-semibold text-slate-800">{{ formatNumber(data.transactionSummary.deposit.totalCount) }}</span></div>
        <div class="text-slate-500">Sukses: <span class="font-semibold text-emerald-600">{{ formatNumber(data.transactionSummary.deposit.totalSuccess) }}</span></div>
        <div class="text-slate-500">Nominal: <span class="font-semibold text-slate-800">{{ formatCurrency(data.transactionSummary.deposit.totalNominal) }}</span></div>
        <div class="text-slate-500">Pending: <span class="font-semibold text-amber-600">{{ formatNumber(data.transactionSummary.deposit.totalPending) }}</span></div>
      </div>
    </div>
  </div>
</template>
