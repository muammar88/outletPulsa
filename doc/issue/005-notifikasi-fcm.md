# ISSUE-005 — Status pengiriman FCM akurat dan token perangkat dapat pulih

Prioritas: P1. Status: OPEN. Dependensi: ISSUE-001 dan ISSUE-003 untuk event saldo/transaksi.

## Lokasi dan temuan kode

- `Backend/src/pengumuman/pengumuman.service.ts`: `processRecipientAndSend` mengembalikan `false` saat gagal, tetapi `sendPengumuman` tetap menulis `Success` setelah `sendToUser`/`sendToDevice`. Device tidak ditemukan atau tidak ada penerima juga bisa berakhir sukses.
- Hasil `getMessaging().send` langsung dicatat `Delivered`; kode ini tidak membuktikan notifikasi tampil atau dibaca pada perangkat.
- Token invalid sudah dibersihkan; jangan menghapus fitur ini. Kegagalan sementara belum mempunyai retry tahan restart dalam service yang dibaca.
- `Backend/src/pengumuman/pengumuman.controller.ts`: update token memakai `x-device-code`; service update hanya berdasarkan device code. `JwtApiGuard` memverifikasi JWT dan memperbarui last_login, tetapi tidak memeriksa kepemilikan device untuk operasi ini.
- `Mobile/lib/shared/providers/pengumuman_provider.dart`: `_initialized` di-set sebelum inisialisasi berhasil. Kegagalan pertama dapat menghalangi percobaan berikutnya. Update token hanya mencetak respons dan tidak memulihkan kegagalan HTTP.
- Listener foreground hanya memanggil history ketika ada notification. History backend sengaja mengecualikan transaksi/deposit; refresh history saja tidak memastikan status saldo/transaksi diperbarui.
- Listener token refresh sudah ada; masalahnya bukan ketiadaan listener. Cold-start click hanya dinavigasikan bila navigator siap dan ID ada, tanpa antrean navigasi tertunda.
- `handleLinkQuCallback` belum memanggil `sendTransactionStatus`; tambahkan melalui event settlement, bukan pengiriman di tengah mutasi saldo.

## Langkah implementasi

1. Tambahkan validasi konfigurasi Firebase yang dapat didiagnosis tanpa membocorkan secret. Verifikasi proyek kredensial backend sama dengan aplikasi Mobile menggunakan environment uji.
2. Return hasil penerima terstruktur: diterima FCM, gagal sementara, token invalid, tidak ada token/penerima. Agregasikan hasil; semua gagal tidak boleh `Success`. Sesuaikan enum/schema dan UI admin bila menambah partial/skipped.
3. Bedakan diterima layanan FCM, tampil pada perangkat, dan dibaca. Simpan message ID bila berguna; jangan mengklaim delivery perangkat hanya dari keberhasilan send.
4. Proses event transaksi/deposit setelah commit memakai outbox/worker yang dapat diulang. Dedup event dan penerima. Retry hanya kegagalan sementara dengan backoff/batas; kegagalan permanen dicatat dan token invalid dibersihkan. Pengiriman eksternal bisa terulang saat crash setelah send; mitigasi juga pada client dengan event ID stabil, jangan menjanjikan exactly-once delivery FCM.
5. Update token harus memverifikasi device milik member JWT, memvalidasi token tidak kosong, dan memberikan hasil API tegas. Audit register/login/logout/pergantian akun: token/member binding tidak boleh mengirim pesan akun lama ke pengguna berikutnya.
6. Mobile memisahkan listener yang dipasang sekali dari sinkronisasi token yang bisa diulang setelah login, jaringan pulih, atau refresh token. Reset state inisialisasi saat gagal dan kelola pembatalan subscription pada dispose.
7. Definisikan payload konsisten: `pengumumanId`, `pengumumanType` (`prabayar`, `pascabayar`, `deposit`), `reference_id`, status, serta event ID dedup. Pastikan deposit memakai ID yang dapat dibuka layar detail, bukan member ID.
8. Foreground memperbarui data terkait dan memberi indikator yang terlihat sesuai UI. Cold start menyimpan navigasi sampai autentikasi/navigator siap; cegah buka detail milik akun berbeda.
9. Hapus log JWT/token lengkap pada provider Mobile dan log objek sensitif terkait. Simpan kode kesalahan yang cukup untuk diagnosis.

## Tes wajib

| Skenario | Ekspektasi |
| --- | --- |
| Semua penerima gagal atau tidak ada token | Tidak dicatat sebagai sukses semua |
| Satu sukses, satu gagal sementara | Status agregat jujur; retry hanya yang perlu |
| Token invalid | Token dihapus; tidak retry tanpa batas |
| Member A mengirim device code member B | Ditolak tanpa mengubah token B |
| Init/token sync gagal lalu jaringan pulih | Token tersinkron tanpa restart wajib |
| Logout A, login B di perangkat sama | Pesan personal A tidak diarahkan ke sesi B |
| Transaksi/deposit final, callback diulang | Satu event bisnis; tidak membanjiri notifikasi |
| Foreground, background, terminated | Uji perangkat nyata: tampilan, refresh saldo, dan klik membuka detail tepat |
| FCM gagal total | Pembelian/deposit tetap selesai dan saldo benar |

Selesai bila unit/integration test lulus dan hasil uji perangkat nyata dicatat terpisah. Emulator/mock saja tidak membuktikan notifikasi diterima pengguna.
