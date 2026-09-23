# Daftar issue perbaikan OutletPulsa

Review implementasi terbaru: [REVIEW-2026-09-23.md](REVIEW-2026-09-23.md). Ketujuh issue masih selesai sebagian; dokumen review memuat temuan tersisa, hasil tes, dan delapan paket instruksi perbaikan untuk AI pelaksana.

Tanggal pemeriksaan: 23 September 2026. Status seluruh issue: OPEN.

Dokumen ini berdasarkan pembacaan kode lokal, bukan reproduksi insiden produksi. Gejala pengguna belum disertai log, nomor transaksi, atau respons provider. Bagian **temuan kode** menyatakan perilaku yang terlihat pada implementasi; risiko dan skenario uji belum berarti telah terjadi pada produksi. Tidak ada transaksi uang, pengiriman pesan, atau perubahan kode aplikasi yang dilakukan saat menyusun issue.

Nama “Linqku” pada permintaan pengguna dipetakan ke **Linkqu/LinkQu**, sesuai nama integrasi dalam repository. Jangan mengganti nama field atau tabel hanya untuk menyesuaikan ejaan.

## Urutan pengerjaan

| Urutan | Issue | Prioritas | Ketergantungan |
| --- | --- | --- | --- |
| 1 | [001 — Finalisasi transaksi dan refund satu kali](001-finalisasi-transaksi-refund.md) | P0: saldo | Tidak ada |
| 2 | [002 — Submit pembelian dan rekonsiliasi provider](002-submit-pembelian-provider.md) | P1: pembelian macet/duplikat | 001 |
| 3 | [003 — Callback Linkqu dan kredit saldo satu kali](003-callback-linkqu-saldo.md) | P0: saldo dan autentikasi callback | Tidak ada |
| 4 | [004 — Pembuatan pembayaran Linkqu](004-pembuatan-deposit-linkqu.md) | P1: deposit gagal/macet | 003 untuk alur lengkap |
| 5 | [005 — Pengiriman FCM dan siklus token](005-notifikasi-fcm.md) | P1: notifikasi | 001 dan 003 untuk event finansial |
| 6 | [006 — WhatsApp WAPI Sender](006-whatsapp-wapisender.md) | P1: registrasi dan pesan | Tidak ada |
| 7 | [007 — Tampilan dan pemulihan deposit Mobile](007-mobile-deposit-integrasi.md) | P1: pengalaman pembayaran | 003, 004, 005 |

P0 berarti dikerjakan lebih dahulu karena dapat memengaruhi kebenaran saldo. P1 berarti alur utama pengguna terganggu. Nomor issue adalah identitas, bukan kewajiban mengerjakan semuanya dalam satu perubahan.

## Petunjuk untuk AI pelaksana

1. Baca satu issue beserta dependensinya. Buka file yang disebutkan dan cari nama fungsi; nomor baris sengaja tidak dijadikan patokan karena mudah berubah.
2. Buat pengujian yang memperlihatkan masalah, lalu ubah bagian sekecil mungkin. Jangan mengganti semua arsitektur sekaligus.
3. Gunakan database pengujian terisolasi dan provider mock. Uji konkurensi saldo memakai database dengan engine yang sama dengan aplikasi, bukan hanya mock Prisma.
4. Pertahankan kontrak API Mobile dan admin. Bila kontrak/schema berubah, perbarui pemanggil, migration, dan pengujian pada perubahan yang sama. Jangan menjalankan `db:migrate:reset` terhadap database yang berisi data pengguna.
5. Untuk kontrak eksternal, verifikasi dokumentasi resmi yang berlaku bagi akun/integrasi ini. Simpan URL, tanggal akses, dan contoh payload yang sudah disamarkan. Jangan mengarang nama header autentikasi, rumus signature, arti kode status, atau aturan retry. PDF lokal `wapisender_docs.pdf` tersedia sebagai bahan pemeriksaan WAPI Sender, tetapi isinya belum diverifikasi dalam audit ini.
6. Jangan mencetak API key, PIN, password, JWT, private key Firebase, token FCM lengkap, atau data pribadi lengkap ke log. Gunakan ID korelasi dan data uji.
7. Periksa perubahan pengguna sebelum mengedit. Pada awal audit sudah ada perubahan `.gitignore` dan migration belum terlacak `Backend/prisma/migrations/20260920110440_add_linkqu_integration/`; jangan menghapus atau menimpanya.
8. Setelah implementasi, jalankan dari `Backend`: `npm run build` dan `npm test -- --runInBand <nama-file-spec>`. Untuk Mobile yang berubah, jalankan dari `Mobile`: `flutter analyze` dan `flutter test <path-test>`. Catat perintah, hasil, dan kegagalan lama yang tidak terkait. Jangan menyatakan selesai bila tes penting belum dijalankan.

## Istilah

- **Idempotensi**: request/event yang sama diulang tidak menambah efek finansial kedua kali.
- **Atomik**: perubahan status, saldo, dan catatan saldo berhasil bersama atau batal bersama.
- **Rekonsiliasi**: memeriksa status transaksi lama ke provider untuk menyelesaikan status yang belum pasti.
- **Outbox**: catatan pekerjaan/event di database, disimpan bersama transaksi bisnis dan diproses worker setelah commit. Ini mencegah pekerjaan hilang ketika proses mati.

## Bukti selesai yang harus dilaporkan

Setiap issue harus menghasilkan daftar file berubah, hasil tes sesuai tabel skenario, dampak migration/API, serta hal yang masih memerlukan sandbox atau perangkat fisik. Bedakan “lulus dengan mock”, “lulus sandbox”, dan “terverifikasi produksi”. Dokumen issue ini sendiri belum memperbaiki bug aplikasi.
