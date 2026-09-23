# ISSUE-001 — Satukan finalisasi transaksi pulsa dan cegah refund ganda

Prioritas: P0. Status: OPEN. Dependensi: tidak ada.

## Hasil yang diinginkan

Satu pembelian hanya boleh dipotong sekali dan dikembalikan sekali bila provider memastikan gagal. Callback, detail Mobile, dan pengecekan admin harus menghasilkan status, saldo, laba, dan notifikasi yang konsisten, termasuk ketika berjalan bersamaan.

## Lokasi dan temuan kode

- `Backend/src/api/transaksi/transaksi.service.ts`: `getDetailTransaksiPrabayar` membaca status sebelum `$transaction`, lalu menambah saldo bila hasil cek gagal dan mengubah transaksi berdasarkan `id` saja. Dua pemanggilan dapat sama-sama membaca `proses` lalu melakukan refund.
- `Backend/src/api/webhook/webhook.service.ts`: handler provider mengecek status final sebelum `updateFailedTransaction`; fungsi tersebut menambah saldo dan mengubah status tanpa klaim perubahan status bersyarat di database. Transaksi database saja belum mencegah dua handler memproses event yang sama.
- `Backend/src/administrator/transaksi_pulsa/transaksi_pulsa.service.ts`: `reCheckStatus`, `updateStatus`, `checkStatusServer` adalah jalur perubahan lain yang harus diaudit dan diarahkan ke aturan yang sama. Pembacaan ulang status di transaksi belum otomatis setara dengan penguncian atau update bersyarat.
- `Backend/prisma/schema.prisma`: periksa `Transaction`, `Member`, `RiwayatSaldo`, dan relasi riwayat transaksi sebelum menambah constraint.

## Cara membuktikan masalah

Gunakan member uji bersaldo awal Rp100.000, pembelian Rp10.000, saldo sesudah debit Rp90.000. Mock provider mengembalikan gagal. Tahan dua pembacaan detail/callback sampai keduanya membaca status `proses`, lalu lepaskan bersamaan. Hasil yang benar adalah saldo Rp100.000; saldo Rp110.000 membuktikan refund ganda. Ulangi dengan callback versus cek admin.

## Langkah implementasi

1. Buat satu service finalisasi yang menerima ID transaksi, status hasil normalisasi, identitas sumber/provider, SN, dan harga aktual yang tervalidasi. Pindahkan aturan perubahan finansial ke service ini.
2. Dalam satu transaksi DB, klaim transisi `proses -> sukses/gagal` menggunakan update bersyarat atau penguncian yang sesuai engine database. Hanya proses yang berhasil melakukan klaim boleh mengubah saldo/riwayat. Jika memakai isolation serializable, tangani konflik dengan retry terbatas.
3. Pada gagal, refund `selling_price + fee_agen` dari snapshot transaksi; jangan menghitung ulang harga produk terkini. Catat saldo sebelum/sesudah dari keadaan atomik saat mutasi, bukan objek member yang dibaca sebelum transaksi.
4. Pada sukses, simpan SN, harga aktual, dan laba tanpa refund. Status final yang bertentangan tidak boleh ditimpa diam-diam; catat untuk rekonsiliasi/manual review. Jangan otomatis mengkredit atau mendebit ulang pada konflik.
5. Catat event notifikasi secara tahan restart dalam transaksi yang sama, menggunakan kunci unik transaksi dan jenis transisi. Pengiriman FCM dilakukan setelah commit melalui ISSUE-005; kegagalannya tidak boleh membatalkan transaksi pulsa.
6. Gunakan service yang sama pada detail, callback, dan pengecekan admin. Audit `updateStatus` agar edit admin tidak melewati aturan saldo. Pisahkan koreksi administratif yang memang memerlukan prosedur berbeda.
7. Jangan mengubah pascabayar secara luas dalam issue ini, tetapi pastikan shared helper tidak merusaknya dan catat bila menemukan risiko serupa.

## Pengujian dan kriteria selesai

| Skenario | Hasil wajib |
| --- | --- |
| Callback gagal dikirim 10 kali, berurutan dan bersamaan | Satu refund, satu catatan saldo, satu event final |
| Callback gagal bersamaan dengan detail dan cek admin | Saldo akhir Rp100.000 pada contoh di atas |
| Reseller membayar Rp10.020 | Refund tepat Rp10.020 |
| Callback sukses berulang | Tidak ada refund; SN dan laba konsisten |
| Sukses lalu gagal terlambat | Tidak otomatis refund transaksi sukses; konflik terlacak |
| DB gagal setelah klaim sebelum mutasi saldo selesai | Seluruh perubahan rollback; event dapat diproses ulang |
| FCM gagal setelah commit | Status dan saldo tetap benar; pekerjaan notifikasi dapat diulang |

Selesai bila seluruh jalur finalisasi prabayar mengikuti aturan yang sama dan uji konkurensi database membuktikan efek finansial hanya sekali.
