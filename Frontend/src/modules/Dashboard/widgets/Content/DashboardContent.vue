<script setup lang="ts">
import StatsRow from './items/StatsRow.vue';
import TransactionTable from './items/TransactionTable.vue';
import SidebarPanels from './items/SidebarPanels.vue';
import QuickActions from './items/QuickActions.vue';

const props = defineProps<{
  stats: any[];
  transactions: any[];
  products: any[];
  mutations: any[];
  suppliers: any[];
}>();
</script>

<template>
  <div class="content">
    <!-- PAGE HEADER -->
    <div class="page-header">
      <div class="page-header-left">
        <h1>Selamat datang, Reza 👋</h1>
        <p>Minggu, 5 April 2026 · Periode aktif hari ini</p>
      </div>
      <div class="page-header-right">
        <select class="filter-select">
          <option>Hari ini</option>
          <option>7 hari terakhir</option>
          <option>30 hari terakhir</option>
          <option>Bulan ini</option>
        </select>
        <button class="btn-outline">📊 Laporan</button>
        <button class="btn-primary">+ Transaksi Baru</button>
      </div>
    </div>

    <!-- STAT CARDS -->
    <StatsRow :stats="stats" />

    <!-- MAIN GRID -->
    <div class="grid-2">
      <TransactionTable :transactions="transactions" />
      <SidebarPanels 
        :products="products" 
        :mutations="mutations" 
        :suppliers="suppliers" 
      />
    </div>

    <!-- QUICK ACTIONS -->
    <QuickActions />
  </div>
</template>

<style scoped>
.content { padding: 20px 24px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-header-left h1 { font-size: 18px; font-weight: 600; color: #1e293b; }
.page-header-left p { font-size: 12px; color: #64748b; margin-top: 2px; }
.page-header-right { display: flex; gap: 8px; }
.grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 20px; }

.btn-outline {
  font-size: 12px; padding: 7px 14px; border: 1px solid #bfdbfe;
  border-radius: 6px; background: #eff6ff; color: #1d4ed8; cursor: pointer; font-family: inherit;
}
.btn-primary {
  font-size: 12px; padding: 7px 14px; border: none;
  border-radius: 6px; background: #2563eb; color: white; cursor: pointer; font-family: inherit;
}
select.filter-select {
  font-size: 12px; padding: 7px 10px; border: 1px solid #e2e8f0;
  border-radius: 6px; background: white; color: #1e293b; font-family: inherit; cursor: pointer;
}

@media (max-width: 1100px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>
