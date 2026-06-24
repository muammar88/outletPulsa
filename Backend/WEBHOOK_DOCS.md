# Dokumentasi Konfigurasi Webhook (Callback) Outlet Pulsa

Dokumen ini menjelaskan alur, konfigurasi, dan penanganan Webhook (Callback) dari berbagai provider (IAK, Digiflazz, Tripay) ke sistem Outlet Pulsa. 

Sistem Outlet Pulsa telah dikonfigurasi untuk mampu menangkap perubahan status dan menyimpannya secara otomatis ke database (Tabel `Transaction` untuk prabayar, dan `TransactionPascabayar` untuk pascabayar). Jika transaksi berhasil, laba akan dihitung dan Serial Number akan disimpan. Jika transaksi gagal, saldo otomatis dikembalikan (refund) ke member secara utuh (total + fee agen).

---

## 1. Konfigurasi Endpoint di Sistem Outlet Pulsa

Pastikan Anda mengetahui URL *base API* Outlet Pulsa Anda (contoh: `https://api.outletpulsa.com` atau `https://api.domain-anda.com`). Endpoint berikut adalah yang akan didaftarkan ke masing-masing provider:

### A. IAK (Prabayar & Pascabayar)
- **URL Webhook**: `[BASE_URL]/webhook/iak/[KODE_VERIFIKASI]`
  - Ganti `[BASE_URL]` dengan URL backend Anda.
  - Ganti `[KODE_VERIFIKASI]` dengan nilai yang sama persis dengan yang ada di `.env` backend Anda pada variabel `IAK_CALLBACK_KEY`.
- **Contoh URL**: `https://api.outletpulsa.com/webhook/iak/RAHASIA123`
- **Cara Setting di IAK**:
  1. Login ke Dashboard IAK.
  2. Buka menu **API Setting** > **Callback URL**.
  3. Masukkan URL Webhook di atas.
  4. Simpan.

### B. Digiflazz (Prabayar & Pascabayar)
- **URL Webhook**: `[BASE_URL]/webhook/digiflazz`
- **Secret Key / Signature**: Diatur di dashboard Digiflazz. Pastikan nilai `Webhook Secret` di Digiflazz **sama persis** dengan nilai `DIGIFLAZZ_WEBHOOK_SECRET` di `.env` backend Outlet Pulsa Anda.
- **Cara Setting di Digiflazz**:
  1. Login ke Dashboard Digiflazz.
  2. Buka menu **Koneksi** > **Webhook**.
  3. Masukkan URL Webhook: `https://api.outletpulsa.com/webhook/digiflazz`.
  4. Masukkan **Secret Key** dan pastikan cocok dengan `.env`.
  5. Simpan.

### C. Tripay (Prabayar & Pascabayar)
- **URL Webhook**: `[BASE_URL]/webhook/tripay`
- **Secret Key**: Tripay menggunakan validasi Header HTTP `x-callback-secret`. Pastikan nilai Callback Secret di dashboard Tripay sama dengan nilai `TRIPAY_CALLBACK_SECRET` di `.env` backend Anda.
- **Cara Setting di Tripay**:
  1. Login ke Dashboard Tripay.
  2. Buka menu **Merchant** > **Callback**.
  3. Masukkan URL Webhook: `https://api.outletpulsa.com/webhook/tripay`.
  4. Aktifkan/centang notifikasi untuk produk Prabayar/Pascabayar.
  5. Salin *Callback Secret* dari Tripay dan simpan di `.env` backend Anda.

---

## 2. Format Payload (Contoh dari Provider)

Berikut adalah contoh payload yang diterima dari masing-masing provider, dan bagaimana sistem memetakannya:

### IAK
```json
{
  "data": {
    "ref_id": "TRX-20240101-001", 
    "status": 1, // 1 = Sukses, 2 = Gagal, 0 = Pending
    "sn": "1234567890", // Disimpan ke Transaction.serial_number / TransactionPascabayar.serial_number
    "price": 10000,
    "message": "Transaksi Sukses"
  }
}
```

### Digiflazz
```json
{
  "data": {
    "ref_id": "TRX-20240101-001",
    "status": "Sukses",
    "rc": "00", // 00 = Sukses, 03 = Pending, selain itu = Gagal
    "sn": "1234567890",
    "price": 10000,
    "buyer_sku_code": "xld10",
    "message": "Pembelian Sukses"
  }
}
```

### Tripay
```json
[
  {
    "trxid": 12345678, // ID dari sistem Tripay
    "api_trxid": "TRX-20240101-001", // Referensi dari sistem kita
    "code": "TSEL10",
    "status": 1, // 1 = Sukses, 2 = Gagal, 0 = Pending
    "token": "SN1234567890", // Disimpan ke kolom serial_number
    "note": "Pembelian Berhasil",
    "harga": 10000,
    "target": "08123456789"
  }
]
```

---

## 3. Mapping Status Internal

Semua payload provider akan diproses dan diubah ke status internal Outlet Pulsa:

| Status Provider | Status Internal Aplikasi | Aksi yang Dilakukan Sistem |
| :--- | :--- | :--- |
| **Success** (IAK: 1, Tripay: 1, Digi: rc=00) | `sukses` | Update status `sukses`, Hitung & Simpan Laba, Update `serial_number`. |
| **Pending** (IAK: 0, Tripay: 0, Digi: rc=03) | `proses` | Diabaikan (*skip*) sampai mendapatkan callback sukses/gagal. |
| **Failed/Error** (IAK: 2, Tripay: 2, Digi: lainnya) | `gagal` | Update status `gagal`, **Refund Saldo Member** secara atomik beserta fee agen. |

---

## 4. Troubleshooting (Pemecahan Masalah)

Jika Anda menemui masalah terkait webhook (misal status transaksi menggantung), berikut cara memeriksanya:

1. **Callback Tidak Masuk / Status Tidak Berubah**
   - Pastikan URL Webhook dapat diakses dari internet (tidak diblokir oleh Firewall/Cloudflare).
   - Pastikan Anda sudah mendaftarkan URL Webhook yang benar di dashboard masing-masing provider.
   - Cek tabel database `WebhookLog` (atau log terminal `npm run start:dev`). Sistem selalu mencatat setiap webhook yang masuk meskipun gagal diproses.

2. **Signature/Secret Invalid (Error 401)**
   - Cek tabel `WebhookLog` atau terminal backend. Jika terdapat log *"Signature tidak valid"*, artinya Secret Key di `.env` backend Anda **BERBEDA** dengan yang ada di dashboard provider.
   - Segera samakan kembali dan *restart* backend Anda.

3. **Serial Number Tidak Tersimpan**
   - Pastikan provider memang mengirimkan field serial number (berupa `sn`, `token`, atau di dalam `note`). Sistem hanya akan menyimpan `serial_number` jika provider mengirimkannya dalam kondisi tidak kosong.

4. **Callback Terkirim Berkali-kali (Double Callback)**
   - Tidak masalah. Sistem sudah dilengkapi dengan mekanisme **Idempotency**. Jika transaksi sudah berstatus `sukses` atau `gagal`, callback yang datang lagi akan otomatis diabaikan *(ignored)*, sehingga tidak akan terjadi *Double Refund* atau *Double Laba*.

5. **Prisma Generate Error (Windows DLL Lock)**
   - Jika Anda menemui masalah pada proses update tabel (khususnya saat Prisma Update `serial_number`), pastikan tidak ada lock database. Hentikan aplikasi, jalankan `npx prisma generate` lalu mulai kembali.
