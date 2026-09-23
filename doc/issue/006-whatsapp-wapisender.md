# ISSUE-006 — Perbaiki pengiriman dan webhook WhatsApp WAPI Sender

Prioritas: P1. Status: OPEN. Dependensi: tidak ada.

## Cakupan dan temuan kode

Alur yang ditemukan adalah pesan masuk verifikasi registrasi dan balasan WhatsApp. Kebutuhan pesan WhatsApp transaksi/deposit belum dibuktikan dari permintaan atau implementasi yang diperiksa; jangan menambahkan broadcast atau template bisnis baru tanpa kebutuhan jelas.

- `Backend/src/api/webhook/webhook.service.ts`, `sendWhatsappMessage`: menggunakan `WAPISENDER_URL`, `WAPISENDER_API_KEY`, dan `WAPISENDER_DEVICE_KEY`; device ID dari callback dapat mengganti pilihan device. Kredensial tidak lengkap hanya di-log lalu return tanpa hasil kegagalan terstruktur.
- Sukses hanya diperiksa lewat `response.ok`; body respons belum digunakan untuk menentukan penerimaan pesan menurut kontrak provider. Fetch tidak memiliki timeout eksplisit.
- `processWhatsappWebhook`: memeriksa `event === 'message'`, membaca `phone`, `message`, `event_id`; event ID hanya digunakan dalam log, bukan dedup persisten.
- Pengiriman balasan dipanggil di dalam `$transaction` registrasi, termasuk pesan sukses sebelum semua update device selesai. Jaringan lambat dapat memperpanjang transaksi; pesan sukses berisiko terlanjur dikirim sebelum commit.
- Route `Backend/src/api/webhook/webhook.controller.ts` tidak memverifikasi autentikasi khusus WAPI Sender. Mekanisme resmi yang tersedia perlu diperiksa.
- Referensi lokal: `wapisender_docs.pdf`. Baca dokumen sebelum menetapkan endpoint, field, encoding, atau arti respons; isi PDF belum dibaca saat issue ini disusun.

## Langkah implementasi

1. Bandingkan PDF dengan dokumentasi resmi versi akun yang dipakai. Buat tabel kontrak send dan webhook: URL, content type, autentikasi, field tujuan/device, event masuk, ID pesan, format respons gagal/sukses, dan acknowledgment. Gunakan contoh tersamarkan.
2. Pisahkan adapter pengiriman dari logika verifikasi registrasi. Return hasil terstruktur untuk konfigurasi kosong, HTTP gagal, provider menolak dalam HTTP 200, diterima, timeout, dan body tidak valid.
3. Validasi konfigurasi serta batasi device callback ke device milik integrasi yang dikenal; jangan mempercayai device ID arbitrer dari request publik. Terapkan autentikasi callback yang didukung provider; jangan mengarang header resmi.
4. Validasi tipe `phone`/`message` sebelum operasi string. Normalisasi nomor secara konsisten pada registrasi, pencarian member, dan pengiriman. Tentukan pesan grup/from-self/status delivery harus diabaikan atau diproses berdasarkan kontrak, agar tidak menciptakan loop balasan.
5. Simpan identitas event unik sebelum memproses. Perubahan status kode registrasi dan pembuatan member harus atomik dan aman untuk callback bersamaan. Periksa constraint kode member/nomor WhatsApp serta tabrakan kode acak.
6. Dalam transaksi registrasi hanya tulis DB dan pekerjaan balasan. Kirim setelah commit menggunakan worker/outbox. Balasan gagal tidak boleh membatalkan akun yang sudah valid; retry pesan tidak boleh mendaftarkan member ulang.
7. Beri timeout dan retry terbatas untuk kesalahan sementara. Untuk timeout dengan hasil kirim tidak diketahui, gunakan message key/status API bila didukung. Catat risiko duplikasi jika provider tidak menyediakan idempotensi; jangan retry membabi buta.
8. Log correlation/event/message ID dan kategori kegagalan tanpa API key, password, kode verifikasi aktif lengkap, atau nomor penuh. Audit juga log payload mentah yang sekarang dicetak.

## Tes dan kriteria selesai

| Skenario | Hasil wajib |
| --- | --- |
| Nomor 08…, 628…, +628… untuk orang yang sama | Normalisasi konsisten sesuai kebijakan registrasi |
| Pesan valid, kode dan pengirim cocok | Satu member; status registrasi/device benar; balasan setelah commit |
| Event sama dikirim paralel/diulang | Tidak ada member atau pekerjaan balasan ganda |
| Kode tidak ada atau nomor berbeda | Tidak membuat member; balasan aman sesuai kebijakan |
| Body kosong, tipe salah, event bukan message, pesan dari bot sendiri | Tidak crash atau loop |
| HTTP 200 dengan body penolakan provider | Tercatat gagal, bukan sukses |
| Credential kosong, device offline, 429, 5xx, timeout | Diagnosis jelas dan retry sesuai kategori |
| DB rollback sebelum commit | Tidak mengirim pesan registrasi berhasil |
| Worker mati setelah commit | Balasan dapat dipulihkan tanpa membuat akun kedua |

Selesaikan unit/HTTP test dengan fixture, lalu smoke test memakai nomor uji yang dikendalikan tim. Jangan mengirim ke daftar pelanggan untuk pengujian.
