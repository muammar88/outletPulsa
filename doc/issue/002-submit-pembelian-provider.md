# ISSUE-002 — Pembelian pulsa tidak duplikat dan tidak macet tanpa penyelesaian

Prioritas: P1. Status: OPEN. Dependensi: ISSUE-001.

## Lokasi dan temuan kode

- `Backend/src/api/transaksi/transaksi.service.ts`, `createTransaksiPrabayar`: debit dan record transaksi di-commit sebelum panggilan provider. Respons submit hanya menyimpan `trx_id`/SN; kegagalan tanpa ID dibiarkan menunggu webhook, sementara API tetap dapat mengembalikan `error: false`. Exception setelah debit hanya menghasilkan pesan umum.
- `Backend/src/api/transaksi/dto/create-transaksi-prabayar.dto.ts`: hanya menerima kode produk dan nomor tujuan; belum ada identitas unik satu intent pembelian dari klien.
- Kode transaksi memakai `TRX${Date.now()}`. `Transaction.kode` pada schema belum unik; `trx_id` bertipe `Int?` dan hasil provider dipaksa `parseInt`.
- `getDetailTransaksiPrabayar` memakai mapping Digiflazz terkini untuk cek status. Pengecekan admin di `Backend/src/administrator/transaksi_pulsa/transaksi_pulsa.service.ts` memakai `transaksi.produk?.kode`. Keduanya perlu dibandingkan dengan SKU yang benar-benar dikirim saat pembelian.
- Failover di submit memakai ID server tetap 1/2/3 dan dapat berganti provider/SKU tanpa menyimpan seluruh percobaan sebagai identitas terpisah.
- Adapter: `Backend/src/providers/iak.service.ts`, `digiflazz.service.ts`, `tripay.service.ts`. Klien: `Mobile/lib/module/member/widget/beranda/transaksi/konfirmasi_pembelian.dart`.

## Hasil yang diinginkan

Satu intent pengguna menghasilkan satu pembelian dan satu debit. Status submit diterima/pending dibedakan dari pulsa benar-benar sukses. Timeout berarti hasil belum diketahui, bukan bukti gagal dan bukan izin mengirim pembelian baru.

## Langkah implementasi

1. Buat fixture respons tiap provider dari dokumentasi resmi atau rekaman sandbox yang disamarkan. Normalisasi ke sukses final, gagal final, pending, dan hasil tidak diketahui. Jangan menyamakan HTTP sukses dengan transaksi pulsa sukses.
2. Tambahkan idempotency key per intent pembelian. Mobile membuatnya sekali, menyimpan selama retry, dan membuat key baru hanya untuk pembelian baru. Backend memberi constraint unik per member/key; key sama dengan payload berbeda ditolak. Replay mengembalikan transaksi lama tanpa debit/panggilan baru.
3. Simpan referensi unik, provider, SKU yang dikirim, nomor tujuan, harga, serta percobaan pengiriman sebelum request eksternal. Tentukan penyimpanan ID provider sebagai string bila kontrak memang mengizinkan nonnumerik; audit migrasi dan pemanggil sebelum mengubah `trx_id`.
4. Pastikan pekerjaan submit yang sudah di-commit dapat dipulihkan setelah restart, misalnya outbox/queue yang terhubung ke record DB. HTTP provider harus memiliki timeout. Hindari lock DB selama menunggu jaringan.
5. Gunakan finalizer ISSUE-001 untuk hasil final. Untuk timeout atau hasil ambigu, pertahankan pending dan jadwalkan cek status dengan referensi yang sama. Retry submit hanya bila kontrak provider menjamin idempotensi atau provider memastikan request belum diterima.
6. Pakai snapshot SKU/provider ketika cek status. Audit failover: boleh berpindah hanya setelah kegagalan definitif percobaan sebelumnya, catat setiap attempt, dan cocokkan callback ke attempt yang benar. Jangan mengasumsikan ID server 1/2/3.
7. Hubungkan pemulihan pending ke scheduler yang benar-benar berjalan; baca `Backend/src/scheduler/` dan endpoint cron admin sebelum menambah worker. Beri batas retry/backoff dan status perlu pemeriksaan untuk kasus yang belum terselesaikan, tanpa refund otomatis hanya karena usia transaksi.
8. Mobile menonaktifkan submit selama request, mempertahankan kode transaksi ketika koneksi terputus, dan menampilkan status sedang diproses dengan jelas. Backend tetap wajib mencegah duplikat meskipun tombol sudah dinonaktifkan.

## Tes wajib

| Input/kondisi | Ekspektasi |
| --- | --- |
| Dua submit paralel dengan member dan key sama | Satu debit, satu transaksi, satu pengiriman awal |
| Key sama, nomor tujuan berbeda | Ditolak tanpa efek tambahan |
| Provider gagal final tanpa webhook | Final gagal dan refund sekali |
| Provider sukses langsung tanpa webhook | Final sukses tanpa harus membuka detail |
| Timeout setelah provider menerima request | Pending; cek referensi lama; tidak refund atau failover otomatis |
| Restart setelah debit sebelum submit | Pekerjaan ditemukan dan diselesaikan tanpa debit kedua |
| Mapping produk berubah setelah submit | Pengecekan memakai SKU snapshot |
| ID provider nonnumerik atau sangat panjang | Tidak menjadi `NaN`, terpotong, atau salah cocok |
| Dua pembelian berbeda saat saldo hanya cukup satu | Satu diterima, satu ditolak; saldo tidak negatif |

Selesai bila semua jalur pending memiliki mekanisme pemulihan dan retry Mobile tidak membuat pembelian baru secara tidak sengaja.
