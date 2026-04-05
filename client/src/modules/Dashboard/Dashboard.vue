<script setup lang="ts">
import { ref } from 'vue';
import SidebarArea from './widgets/Sidebar/SidebarArea.vue';
import HeaderArea from './widgets/Header/HeaderArea.vue';
import DashboardContent from './widgets/Content/DashboardContent.vue';

// Sample data for the dashboard
const transactions = ref([
  { id: 'TRX-8821', product: 'Telkomsel 50K', phone: '0812-3456-7890', amount: 'Rp 50.000', status: 'Sukses', statusClass: 'badge-green', time: '14:32' },
  { id: 'TRX-8820', product: 'XL 25K', phone: '0817-9988-1234', amount: 'Rp 25.000', status: 'Pending', statusClass: 'badge-amber', time: '14:28' },
  { id: 'TRX-8819', product: 'PLN Token', phone: '5219087321', amount: 'Rp 100.000', status: 'Sukses', statusClass: 'badge-green', time: '14:11' },
  { id: 'TRX-8818', product: 'Indosat 10K', phone: '0856-1122-3344', amount: 'Rp 10.000', status: 'Gagal', statusClass: 'badge-red', time: '13:58' },
  { id: 'TRX-8817', product: 'Paket Data 1GB', phone: '0813-5566-7788', amount: 'Rp 15.000', status: 'Sukses', statusClass: 'badge-green', time: '13:44' },
  { id: 'TRX-8816', product: 'Voucher ML', phone: '—', amount: 'Rp 80.000', status: 'Proses', statusClass: 'badge-blue', time: '13:31' },
  { id: 'TRX-8815', product: 'Tri 20K', phone: '0896-4455-6677', amount: 'Rp 20.000', status: 'Sukses', statusClass: 'badge-green', time: '13:15' },
  { id: 'TRX-8814', product: 'Smartfren 5K', phone: '0889-2233-4455', amount: 'Rp 5.000', status: 'Gagal', statusClass: 'badge-red', time: '12:58' },
]);

const products = ref([
  { name: 'Telkomsel', val: 423, color: '#2563eb', width: '85%' },
  { name: 'Indosat', val: 312, color: '#7c3aed', width: '62%' },
  { name: 'XL / Axis', val: 241, color: '#0891b2', width: '48%' },
  { name: 'PLN Token', val: 148, color: '#d97706', width: '30%' },
  { name: 'Tri / By.U', val: 99, color: '#16a34a', width: '20%' },
]);

const mutations = ref([
  { name: 'Top Up BCA', sub: '13:00 · Konfirmasi manual', amount: '+500.000', type: 'pos', iconColor: '#dcfce7', svgColor: '#16a34a', isDown: true },
  { name: 'Pemakaian Transaksi', sub: '12:00–14:00 · 89 trx', amount: '-340.000', type: 'neg', iconColor: '#fee2e2', svgColor: '#dc2626', isDown: false },
  { name: 'Top Up Mandiri', sub: '09:15 · Transfer bank', amount: '+1.000.000', type: 'pos', iconColor: '#dcfce7', svgColor: '#16a34a', isDown: true },
]);

const suppliers = ref([
  { name: 'Digiflazz', status: 'Online', badge: 'badge-green' },
  { name: 'VocaGame', status: 'Online', badge: 'badge-green' },
  { name: 'Imparcel', status: 'Lambat', badge: 'badge-amber' },
  { name: 'iReap POS', status: 'Offline', badge: 'badge-red' },
]);

const stats = ref([
  { label: 'Total Transaksi', val: '1.248', change: '▲ +8,3% dari kemarin', type: 'blue', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
  { label: 'Omzet Hari Ini', val: 'Rp 4,2 Jt', change: '▲ +12,1% dari kemarin', type: 'green', icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
  { label: 'Saldo Deposit', val: 'Rp 2,85 Jt', change: '▼ Rp 340rb digunakan', type: 'amber', icon: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2-.9 2-2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
  { label: 'Transaksi Gagal', val: '17', change: '▼ +3 dari kemarin', type: 'red', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
]);
</script>

<template>
  <div class="dashboard-layout">
    <SidebarArea />
    <div class="main-wrapper">
      <HeaderArea />
      <DashboardContent 
        :stats="stats" 
        :transactions="transactions" 
        :products="products" 
        :mutations="mutations" 
        :suppliers="suppliers" 
      />
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f4f8;
  font-family: 'Segoe UI', sans-serif;
}
.main-wrapper {
  flex: 1;
  margin-left: 220px; /* Sidebar width */
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (max-width: 768px) {
  .main-wrapper { margin-left: 0; }
}
</style>
