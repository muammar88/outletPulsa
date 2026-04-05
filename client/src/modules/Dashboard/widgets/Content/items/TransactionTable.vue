<script setup lang="ts">
const props = defineProps<{
  transactions: Array<{
    id: string;
    product: string;
    phone: string;
    amount: string;
    status: string;
    statusClass: string;
    time: string;
  }>;
}>();
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <div class="panel-title">Transaksi Terbaru</div>
      <a href="#" class="panel-action">Lihat semua →</a>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID / Produk</th>
          <th>Nomor HP</th>
          <th>Nominal</th>
          <th>Status</th>
          <th>Waktu</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trx in transactions" :key="trx.id">
          <td>
            <div style="font-weight:600">{{ trx.id }}</div>
            <div class="td-op">{{ trx.product }}</div>
          </td>
          <td>{{ trx.phone }}</td>
          <td>{{ trx.amount }}</td>
          <td><span :class="['badge', trx.statusClass]">{{ trx.status }}</span></td>
          <td class="td-op">{{ trx.time }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.panel-head {
  padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
}
.panel-title { font-size: 13px; font-weight: 600; color: #1e293b; }
.panel-action {
  font-size: 12px; color: #2563eb; cursor: pointer; padding: 4px 10px;
  border: 1px solid #bfdbfe; border-radius: 5px; background: #eff6ff; text-decoration: none;
}
table { width: 100%; border-collapse: collapse; }
thead th {
  padding: 9px 14px; text-align: left; font-size: 11px; font-weight: 600;
  color: #64748b; background: #f8fafc; text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid #f1f5f9;
}
tbody tr { border-bottom: 1px solid #f8fafc; cursor: pointer; transition: background 0.1s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: #f8fafc; }
td { padding: 10px 14px; font-size: 12px; color: #1e293b; }
.td-op { color: #94a3b8; font-size: 11px; margin-top: 1px; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-amber { background: #fef3c7; color: #92400e; }
.badge-red { background: #fee2e2; color: #b91c1c; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }
</style>
