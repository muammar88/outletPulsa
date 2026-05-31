<template>
  <div class="panel" style="margin-bottom:20px;">
    <div class="panel-head">
      <div class="panel-title">Aksi Cepat</div>
    </div>
    <div class="quick-action-grid">
      <div class="qa-btn">
        <div class="qa-icon">📱</div>
        <div class="qa-label">Input Pulsa</div>
      </div>
      <div class="qa-btn">
        <div class="qa-icon">⚡</div>
        <div class="qa-label">Token PLN</div>
      </div>
      <div class="qa-btn">
        <div class="qa-icon">🎮</div>
        <div class="qa-label">Voucher Game</div>
      </div>
      <div class="qa-btn">
        <div class="qa-icon">💰</div>
        <div class="qa-label">Top Up Deposit</div>
      </div>
      <div class="qa-btn">
        <div class="qa-icon">📋</div>
        <div class="qa-label">Cetak Laporan</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.panel-head { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
.panel-title { font-size: 13px; font-weight: 600; color: #1e293b; }
.quick-action-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 14px 16px; }
.qa-btn {
  padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
  text-align: center; cursor: pointer; transition: all 0.15s; text-decoration: none; display: block;
}
.qa-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
.qa-icon { font-size: 20px; margin-bottom: 4px; }
.qa-label { font-size: 11px; font-weight: 600; color: #475569; }

@media (max-width: 768px) {
  .quick-action-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
