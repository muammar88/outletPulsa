# ISSUE-004 — Validasi dan pulihkan pembuatan pembayaran deposit Linkqu

Prioritas: P1. Status: OPEN. Dependensi: ISSUE-003 untuk pembayaran lengkap.

## Lokasi dan temuan kode

- `Backend/src/api/deposit/deposit.service.ts`: `processLinkquDeposit` mengirim create ke provider sebelum membuat `RequestDeposit` dan `PaymentGatewayTransaction`. Timeout atau kegagalan DB setelah provider sukses berisiko meninggalkan pembayaran tanpa record lokal.
- Callback URL ditulis tetap `https://outletpulsa.com/api/webhook/linkqu`, sedangkan route controller tidak memakai prefix tersebut; reverse proxy perlu diperiksa sebelum menyimpulkan 404.
- `Backend/src/api/deposit/dto/deposit-linkqu.dto.ts`: nominal hanya `IsNotEmpty`. Service menghapus karakter nondigit pada string, sehingga input negatif/formatted/teks dapat berubah arti; belum ada batas nominal yang jelas.
- Create memeriksa aktivasi gateway, tetapi belum memvalidasi pilihan metode/bank terhadap flag metode dan master aktif seperti daftar metode pembayaran.
- Request memakai fallback nomor `081234567890` dan email `user@example.com`, kredensial kosong, serta tidak memasang timeout fetch eksplisit.
- Signature dibuat inline per metode; kebenaran rumus, endpoint khusus Permata/OVO, timezone expiry, dan bentuk respons harus diverifikasi, bukan diasumsikan salah atau benar.
- Field VA dapat diisi `checkout_url`, sehingga arti kolom bercampur. `feeadmin` dipakai langsung untuk penjumlahan tanpa normalisasi tipe.

## Langkah implementasi

1. Buat adapter Linkqu terpisah untuk konfigurasi, endpoint, signature, timeout, dan normalisasi hasil. Baca juga `Backend/src/administrator/bank_linkqu/bank_linkqu.service.ts` dan `Backend/src/administrator/emoney_linkqu/emoney_linkqu.service.ts` agar pemilihan environment konsisten.
2. Simpan bukti kontrak resmi per metode: field wajib, jenis respons, fee, expiry/timezone, signature, arti sukses create versus lunas, dan endpoint cek status. Buat fixture request/response/signature deterministik tanpa kredensial sungguhan.
3. Validasi nominal sebagai rupiah bulat positif dalam batas bisnis/provider. Tolak nilai pecahan, negatif, nol, teks, `NaN`, dan overflow; jangan membersihkan string sembarangan. Validasi enum metode, kode bank/e-wallet wajib sesuai metode, dan status aktif server-side.
4. Tolak konfigurasi tidak lengkap sebelum request. Gunakan data pelanggan yang valid; jika field wajib belum tersedia, tangani secara eksplisit tanpa identitas palsu. Jadikan callback URL konfigurasi tervalidasi sesuai ISSUE-003.
5. Buat intent deposit dan referensi unik sebelum request. Tambahkan idempotency key agar retry intent yang sama mengembalikan pembayaran yang sama. Simpan kondisi creating/pending/unknown secara jelas sesuai schema yang disepakati.
6. Bila provider timeout, cek status referensi yang sama; jangan langsung membuat invoice kedua atau menandai gagal final. Sediakan rekonsiliasi untuk create diterima tetapi respons/penyimpanan hasil gagal.
7. Normalisasi angka fee/amount sebelum penjumlahan. Pisahkan nominal yang dikreditkan, biaya admin, dan total dibayar sesuai kontrak provider. Kredit saldo tidak otomatis termasuk fee.
8. Simpan VA, QR text/image, checkout URL, provider ID, expiry, dan status secara jelas agar instruksi dapat dibuka ulang. Jangan hanya mengembalikan data penting pada respons create.
9. Periksa schema dan migration Linkqu yang sudah ada. Buat perubahan migration tambahan bila perlu; jangan menimpa migration pengguna yang belum terlacak.

## Tes dan kriteria selesai

- VA biasa, VA Permata, QRIS, OVO, dan e-wallet lain mempunyai fixture tersendiri; metode yang benar-benar tidak didukung ditolak dengan alasan jelas.
- Nominal `-10000`, `0`, `1.5`, `abc`, nilai terlalu besar, metode palsu, bank nonaktif, dan fitur yang dimatikan ditolak tanpa request provider.
- `feeadmin` berbentuk angka dan string numerik menghasilkan total yang sama; field invalid tidak diam-diam menjadi nol. Contoh nominal Rp50.000 + fee Rp1.000 menghasilkan total Rp51.000 dan kredit Rp50.000 bila itu aturan kontraknya.
- Double tap/retry memakai key sama tidak membuat dua intent/provider reference.
- Timeout, HTTP 4xx/5xx, body non-JSON, signature ditolak, dan DB error setelah provider menerima request dapat ditelusuri dan dipulihkan tanpa invoice ganda.
- Callback dapat ditemukan walaupun tiba sangat cepat. Expiry yang disimpan dan ditampilkan merujuk waktu yang sama pada UTC dan zona deployment.

Selesai bila pembayaran dapat dibuat dan dipulihkan menggunakan data persisten, lalu diselesaikan aman oleh ISSUE-003.
