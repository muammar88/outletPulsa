<script setup lang="ts">
const props = defineProps<{
  stats: Array<{
    label: string;
    val: string;
    change: string;
    type: string;
    icon: string;
  }>;
}>();
</script>

<template>
  <div class="stats-row">
    <div v-for="stat in stats" :key="stat.label" :class="['stat-card', stat.type]">
      <div class="stat-header">
        <div class="stat-label">{{ stat.label }}</div>
        <div :class="['stat-icon', stat.type]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path :d="stat.icon" />
          </svg>
        </div>
      </div>
      <div class="stat-val">{{ stat.val }}</div>
      <div :class="['stat-change', stat.change.startsWith('▲') ? 'up' : 'down']">
        {{ stat.change }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card {
  background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 8px; border-left-width: 3px;
}
.stat-card.blue { border-left-color: #2563eb; }
.stat-card.green { border-left-color: #16a34a; }
.stat-card.amber { border-left-color: #d97706; }
.stat-card.red { border-left-color: #dc2626; }
.stat-header { display: flex; justify-content: space-between; align-items: flex-start; }
.stat-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.stat-icon svg { width: 15px; height: 15px; }
.stat-icon.blue { background: #eff6ff; color: #2563eb; }
.stat-icon.green { background: #f0fdf4; color: #16a34a; }
.stat-icon.amber { background: #fffbeb; color: #d97706; }
.stat-icon.red { background: #fef2f2; color: #dc2626; }
.stat-val { font-size: 22px; font-weight: 700; color: #1e293b; }
.stat-change { font-size: 11px; display: flex; align-items: center; gap: 4px; }
.stat-change.up { color: #16a34a; }
.stat-change.down { color: #dc2626; }

@media (max-width: 1100px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
}
</style>
