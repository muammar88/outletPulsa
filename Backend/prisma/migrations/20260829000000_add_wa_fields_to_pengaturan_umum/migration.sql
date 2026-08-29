-- Migration: add_wa_fields_to_pengaturan_umum
-- Menambahkan kolom wa_api_url, wa_api_key, wa_device_key ke tabel PengaturanUmum
-- Menggunakan IF NOT EXISTS agar aman dijalankan berulang kali tanpa error
-- dan tidak akan menghapus atau mengubah data yang sudah ada.

ALTER TABLE "PengaturanUmum"
  ADD COLUMN IF NOT EXISTS "wa_api_url" TEXT,
  ADD COLUMN IF NOT EXISTS "wa_api_key" TEXT,
  ADD COLUMN IF NOT EXISTS "wa_device_key" TEXT;
