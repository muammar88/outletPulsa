<script setup lang="ts">
const props = defineProps<{
  products: Array<any>;
  mutations: Array<any>;
  suppliers: Array<any>;
}>();
</script>

<template>
  <div class="side-panels">
    <!-- PRODUK TERLARIS -->
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">Produk Terlaris</div>
        <a href="#" class="panel-action">Detail →</a>
      </div>
      <div class="panel-body">
        <div v-for="prod in products" :key="prod.name" class="prod-item">
          <div class="prod-dot" :style="{ background: prod.color }"></div>
          <div class="prod-name">{{ prod.name }}</div>
          <div class="prod-bar-wrap">
            <div class="prod-bar" :style="{ width: prod.width, background: prod.color }"></div>
          </div>
          <div class="prod-val">{{ prod.val }}</div>
        </div>
      </div>
    </div>

    <!-- MUTASI DEPOSIT -->
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">Mutasi Deposit</div>
        <a href="#" class="panel-action">Lihat →</a>
      </div>
      <div class="panel-body">
        <div v-for="mut in mutations" :key="mut.name" class="tx-item">
          <div class="tx-icon" :style="{ background: mut.iconColor }">
            <svg viewBox="0 0 24 24" :fill="mut.svgColor">
              <path :d="mut.isDown ? 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z' : 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'" />
            </svg>
          </div>
          <div class="tx-meta">
            <div class="tx-name">{{ mut.name }}</div>
            <div class="tx-sub">{{ mut.sub }}</div>
          </div>
          <div :class="['tx-amount', mut.type]">{{ mut.amount }}</div>
        </div>
      </div>
    </div>

    <!-- INFO SUPPLIER -->
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">Status Supplier</div>
      </div>
      <div class="panel-body">
        <div v-for="sup in suppliers" :key="sup.name" class="info-row">
          <span class="info-key">{{ sup.name }}</span>
          <span :class="['badge', sup.badge]">{{ sup.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 0px; }
.panel-head {
  padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
}
.panel-title { font-size: 13px; font-weight: 600; color: #1e293b; }
.panel-action {
  font-size: 12px; color: #2563eb; cursor: pointer; padding: 4px 10px;
  border: 1px solid #bfdbfe; border-radius: 5px; background: #eff6ff; text-decoration: none;
}
.panel-body { padding: 14px 16px; }
.side-panels { display: flex; flex-direction: column; gap: 14px; }

.prod-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f8fafc; }
.prod-item:last-child { border-bottom: none; }
.prod-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.prod-name { font-size: 12px; color: #1e293b; flex: 1; }
.prod-bar-wrap { width: 60px; height: 4px; background: #e2e8f0; border-radius: 2px; }
.prod-bar { height: 4px; border-radius: 2px; }
.prod-val { font-size: 12px; font-weight: 600; color: #1e293b; min-width: 28px; text-align: right; }

.tx-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f8fafc; }
.tx-item:last-child { border-bottom: none; }
.tx-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tx-icon svg { width: 14px; height: 14px; }
.tx-meta { flex: 1; }
.tx-name { font-size: 12px; font-weight: 600; color: #1e293b; }
.tx-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.tx-amount { font-size: 12px; font-weight: 700; white-space: nowrap; }
.tx-amount.pos { color: #16a34a; }
.tx-amount.neg { color: #dc2626; }

.info-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f8fafc; font-size: 12px; }
.info-row:last-child { border-bottom: none; }
.info-key { color: #94a3b8; }
.info-val { color: #1e293b; font-weight: 600; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-amber { background: #fef3c7; color: #92400e; }
.badge-red { background: #fee2e2; color: #b91c1c; }
</style>
