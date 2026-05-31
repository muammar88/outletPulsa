<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
      </div>
      <div class="logo-text">PulsaPro<div class="logo-sub">Admin Panel</div></div>
    </div>

    <div class="nav-section">
      <div class="nav-label">Utama</div>
      <div class="nav-item active">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        Dashboard
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        Transaksi
        <span class="nav-badge">12</span>
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        Pelanggan
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
        Deposit
      </div>

      <div class="nav-label" style="margin-top:8px;">Produk</div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
        Pulsa &amp; Paket
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z"/></svg>
        PLN &amp; Air
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4z"/></svg>
        Voucher Game
      </div>

      <div class="nav-label" style="margin-top:8px;">Sistem</div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        Supplier / H2H
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
        Notifikasi
        <span class="nav-badge">3</span>
      </div>
      <div class="nav-item">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        Pengaturan
      </div>
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">AR</div>
      <div class="user-info">
        <div class="user-name">Admin Reza</div>
        <div class="user-role">Super Admin</div>
      </div>
      <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)" style="width:14px;height:14px;flex-shrink:0"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #1e3a5f;
  border-right: 0.5px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}
.sidebar-logo {
  padding: 20px 20px 16px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  width: 32px; height: 32px; background: #3b82f6; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.logo-icon svg { width: 18px; height: 18px; fill: white; }
.logo-text { color: white; font-size: 14px; font-weight: 600; line-height: 1.2; }
.logo-sub { color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 400; }
.nav-section { padding: 12px 0; flex: 1; overflow-y: auto; }
.nav-label { color: rgba(255,255,255,0.35); font-size: 10px; font-weight: 600; padding: 4px 20px 6px; letter-spacing: 0.08em; text-transform: uppercase; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 20px; color: rgba(255,255,255,0.55); font-size: 13px; cursor: pointer; transition: all 0.15s; border-left: 2px solid transparent; text-decoration: none; user-select: none; }
.nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
.nav-item.active { background: rgba(59,130,246,0.18); color: #93c5fd; border-left: 2px solid #3b82f6; }
.nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
.nav-badge { margin-left: auto; background: #ef4444; color: white; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600; }
.sidebar-user { padding: 14px 20px; border-top: 0.5px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px; cursor: pointer; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; color: #bfdbfe; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-name { color: rgba(255,255,255,0.85); font-size: 12px; font-weight: 600; }
.user-role { color: rgba(255,255,255,0.4); font-size: 10px; }
</style>
