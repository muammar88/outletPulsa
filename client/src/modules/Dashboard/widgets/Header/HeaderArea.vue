<template>
  <div class="topbar">
    <div class="topbar-title">Dashboard</div>
    <div class="topbar-search">
      <svg viewBox="0 0 24 24" fill="#94a3b8"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      <input type="text" placeholder="Cari transaksi...">
    </div>
    <div class="topbar-btn">
      <svg viewBox="0 0 24 24" fill="#64748b"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
      <div class="notif-dot"></div>
    </div>
    <div class="topbar-avatar">AR</div>
  </div>
</template>

<style scoped>
.topbar {
  background: white; border-bottom: 1px solid #e2e8f0;
  padding: 0 24px; height: 52px; display: flex; align-items: center; gap: 16px;
  position: sticky; top: 0; z-index: 10;
}
.topbar-title { font-size: 15px; font-weight: 600; color: #1e293b; flex: 1; }
.topbar-search {
  display: flex; align-items: center; gap: 8px; background: #f0f4f8;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 6px 12px; width: 220px;
}
.topbar-search input {
  border: none; background: transparent; font-size: 13px;
  color: #1e293b; outline: none; width: 100%; font-family: inherit;
}
.topbar-search svg { width: 13px; height: 13px; color: #94a3b8; flex-shrink: 0; }
.topbar-btn {
  width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: white; display: flex; align-items: center; justify-content: center;
  cursor: pointer; position: relative;
}
.topbar-btn svg { width: 15px; height: 15px; }
.notif-dot {
  position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
  background: #ef4444; border-radius: 50%; border: 1.5px solid white;
}
.topbar-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: #1e3a5f;
  display: flex; align-items: center; justify-content: center;
  color: #93c5fd; font-size: 11px; font-weight: 600; cursor: pointer;
}
</style>
