# ISSUE-009 — Tambahkan Digiflazz untuk pascabayar, provider dipilih admin

Tanggal: 27 September 2026.
Status: PARTIAL — sudah ada implementasi; masih memerlukan koreksi kode dan verifikasi wajib.

> **Instruksi terbaru untuk AI dengan akses dokumentasi terbatas:** baca [panduan kontrak offline dan langkah perbaikan](fixtures/009-kontrak-offline-dan-langkah-perbaikan.md) sebelum melanjutkan. Dokumen tersebut berisi kontrak resmi yang telah dibaca pada 27 September 2026, payload contoh, urutan perubahan per file, matriks tes, dan batas verifikasi. Tautan eksternal adalah jejak sumber; tidak perlu membukanya untuk mengerjakan langkah lokal yang dijelaskan. Koreksi pada panduan tersebut menggantikan asumsi yang bertentangan dalam laporan pelaksanaan lama di bawah. Jangan menganggap semua temuan selesai hanya berdasarkan laporan ronde sebelumnya.
Prioritas: tinggi. Keamanan saldo dan kompatibilitas fitur lama adalah syarat wajib.

## 1. Tujuan dan keputusan pengguna

Tambahkan Digiflazz sebagai provider pascabayar yang dapat digunakan bersama IAK. Admin dapat mengganti provider aktif untuk setiap produk berdasarkan biaya dan keuntungan aplikasi.

Keputusan yang sudah disepakati, jangan ditanyakan ulang:

1. Pengguna mobile **tidak memilih provider**. Pengguna hanya memilih produk, memasukkan nomor pelanggan, mengecek tagihan, mengonfirmasi, dan membayar.
2. Provider dipilih **oleh pengelola melalui panel admin**, per produk internal.
3. Panel admin menyediakan perbandingan biaya admin, komisi, biaya tambahan yang diketahui, dan keuntungan bersih pada dasar harga jual yang sama.
4. Pilihan admin berlaku untuk inquiry baru. Inquiry yang sudah dibuat harus tetap memakai provider, SKU, dan referensi asal sampai selesai.
5. Penambahan Digiflazz tidak boleh merusak IAK, Digiflazz prabayar, saldo, refund, riwayat, komisi, notifikasi, cetak/bagikan struk, maupun aplikasi mobile.
6. Gunakan pemilihan manual oleh admin. Pemilihan otomatis atau perpindahan otomatis ke provider lain setelah pembayaran dikirim bukan ruang lingkup issue ini.

Contoh: produk internal `PLN Pascabayar` terhubung ke SKU IAK dan SKU Digiflazz. Admin memilih Digiflazz. Pengguna mobile tetap melihat `PLN Pascabayar`. Jika admin kemudian beralih ke IAK, inquiry baru memakai IAK, sedangkan pembayaran inquiry Digiflazz yang sudah ada tetap memakai Digiflazz.

## 2. Instruksi wajib untuk AI pelaksana

1. Baca issue ini sampai selesai, lalu baca instruksi repository yang berlaku.
2. **Ulangi pengecekan semua temuan dengan kode aktual sebelum mengedit.** Jangan menganggap kode, komentar, atau checklist lama masih benar.
3. Buat pemetaan singkat: sudah selesai, belum selesai, dan perlu verifikasi. Untuk bagian yang sudah benar, sertakan bukti kode/tes dan pertahankan implementasinya.
4. **Langsung kerjakan bagian yang belum selesai.** Jangan berhenti hanya dengan analisis, rencana, atau menawarkan untuk melanjutkan.
5. Jangan terlalu banyak bertanya. Tentukan detail teknis rutin berdasarkan pola repository. Membaca, memperbaiki kode lokal, menambah tes relevan, dan menjalankan pemeriksaan aman sudah termasuk pekerjaan issue ini.
6. Cari jawaban di kode, konfigurasi contoh, dokumentasi resmi, dan tes terlebih dahulu. Tanyakan hanya hal yang benar-benar menghalangi pekerjaan, seperti aturan harga yang tidak dapat disimpulkan atau akses sandbox yang tidak tersedia. Gabungkan pertanyaan penting dan lanjutkan bagian independen sambil menunggu.
7. Jangan mengarang API, rumus keuntungan, status provider, maupun hasil pengujian. Jika informasi finansial belum tersedia, tampilkan belum diketahui, bukan nol atau keuntungan palsu.
8. Pertahankan perubahan pengguna lain. Dua file transaksi/provider sudah memiliki perubahan lokal saat audit; baca diff sebelum mengedit dan integrasikan dengan hati-hati.
9. Jangan melakukan pembayaran nyata, migrasi destruktif, mengubah saldo/config produksi, atau deploy tanpa otorisasi yang sesuai. Gunakan mock, database uji terisolasi, dan sandbox yang memang tersedia.
10. **Setelah implementasi, baca ulang issue dan cek ulang alur lengkap. Jika ada bagian yang belum dikerjakan, langsung kerjakan dan ulangi tes terkait.** Jangan menandai selesai hanya karena build atau unit test lulus.

## 3. Temuan awal sebagai titik awal, bukan asumsi permanen

Audit berikut berdasarkan workspace lokal, bukan server produksi:

| ID | Temuan awal | Implikasi |
| --- | --- | --- |
| F1 | Produk pascabayar memiliki `serverId` dan relasi IAK/Tripay, belum ada relasi katalog pascabayar Digiflazz | Perlu model dan pemetaan SKU khusus pascabayar |
| F2 | `DigiflazzService.getPricelist()` memakai `cmd: prepaid`; model `DigiflazzProduct` terkait `Produk` prabayar | Jangan mencampur katalog pascabayar ke alur prabayar tanpa pemisahan eksplisit |
| F3 | Perubahan lokal menambah `inquiryPascabayar()` dan `payPascabayar()` | Sebagian integrasi telah dimulai; jangan ditimpa atau dianggap sudah lengkap |
| F4 | Service pascabayar langsung memanggil Digiflazz dan mengirim kode internal sebagai SKU | Pilihan provider admin dan pemetaan provider belum digunakan |
| F5 | Inquiry dibuat tanpa kaitan member; pembayaran mencari hanya `trId` | Kepemilikan inquiry/pembayaran harus diamankan |
| F6 | Harga dihitung `response.price + (produk.fee || 2500)` | Makna biaya, harga jual, dan komisi belum dinormalisasi; nilai fee nol juga tertimpa default |
| F7 | Pembayaran memanggil provider di dalam transaksi database, lalu menulis saldo absolut | Ada risiko timeout, pembayaran eksternal sukses tetapi rollback lokal, debit ulang, dan update saldo bertabrakan |
| F8 | Hanya transaksi sukses yang ditolak saat bayar ulang | Pending/gagal perlu kebijakan retry dan klaim debit yang jelas |
| F9 | Callback Digiflazz sudah punya cabang pascabayar; pencarian memakai `trId`; tidak semua identitas provider/SKU/nomor dicocokkan | Perlu finalisasi bersama dan pencocokan transaksi yang ketat |
| F10 | Belum ditemukan `status-pasca`; detail pascabayar pada `StubController` mengembalikan data kosong | Perlu recovery status serta detail/struk nyata |
| F11 | Modal pemilihan server pascabayar membaca relasi bernama prabayar dan ID server hardcoded | Pilihan server di admin perlu diperbaiki dengan data pascabayar sebenarnya |
| F12 | Versi Git sebelum perubahan lokal pada service pascabayar masih menggunakan inquiry nominal acak dan pembayaran sukses lokal | Jangan mengklaim transaksi IAK sudah berjalan penuh hanya karena katalog IAK terkoneksi |

Verifikasi perbedaan versi lokal dan deployment jika diperlukan. Jangan mengembalikan nominal acak atau hasil sukses buatan sebagai fallback.

## 4. Peta file yang perlu dibaca

Semua path relatif terhadap root repository. Temukan file tambahan menggunakan `rg`.

| Bagian | Lokasi |
| --- | --- |
| Model katalog/transaksi/saldo | `Backend/prisma/schema.prisma` |
| Controller dan service transaksi pascabayar | `Backend/src/api/transaksi_pascabayar/` |
| Provider IAK dan Digiflazz | `Backend/src/providers/iak.service.ts`, `Backend/src/providers/digiflazz.service.ts` |
| Registrasi provider global | `Backend/src/providers/providers.module.ts`, `Backend/src/app.module.ts` |
| Produk internal pascabayar | `Backend/src/administrator/produk_pascabayar/` |
| Katalog dan pemetaan IAK | `Backend/src/administrator/daftar_produk_pascabayar_iak/` |
| Katalog Digiflazz prabayar yang harus tetap berfungsi | `Backend/src/administrator/daftar_produk_digiflazz/`, `Backend/src/administrator/daftar_produk_seller_digiflazz/` |
| Callback dan refund | `Backend/src/api/webhook/webhook.controller.ts`, `Backend/src/api/webhook/webhook.service.ts` |
| Endpoint detail yang masih stub | `Backend/src/api/stub/stub.controller.ts` |
| Pola finalisasi transaksi yang sudah ada | `Backend/src/api/transaksi/` |
| Scheduler | `Backend/src/scheduler/` |
| Tampilan produk dan pilihan server admin | `Frontend/src/modules/Administrator/ProdukPascabayar/` |
| Contoh katalog IAK di admin | `Frontend/src/modules/Administrator/DaftarProdukPascabayarIAK/` |
| Service/route/menu/permission admin | Cari pemakaian modul katalog IAK dan Digiflazz yang sudah ada |
| Request mobile | `Mobile/lib/services/transaction.dart`, `Mobile/lib/core/constants/config.dart` |
| Provider mobile | `Mobile/lib/shared/providers/TransactionProvider.dart`, `RiwayatPascabayarProvider.dart`, `DetailPascabayarProvider.dart` pada folder yang sama |
| Model mobile | `Mobile/lib/models/model_inquiry_pascabayar.dart`, `model_transaksi_pascabayar.dart`, `model_detail_transaksi_pascabayar.dart` pada folder yang sama |
| Layar mobile | `Mobile/lib/module/member/widget/beranda/transaksi/daftar_kategori_pascabayar.dart`, `input_ppob_pascabayar.dart`, `konfirmasi_pembelian_pascabayar.dart`, `detail_transaksi_pascabayar.dart` pada folder yang sama |
| Cetak struk | `Mobile/lib/core/utils/print_pascabayar.dart` |

## 5. Kontrak Digiflazz yang perlu diverifikasi kembali

Gunakan dokumentasi resmi berikut. Catat tanggal verifikasi dan fixture tersamarkan yang dipakai untuk tes.

- Persiapan: https://developer.digiflazz.com/api/buyer/persiapan/
- Katalog: https://developer.digiflazz.com/api/buyer/daftar-harga/
- Inquiry: https://developer.digiflazz.com/api/buyer/cek-tagihan/
- Pembayaran: https://developer.digiflazz.com/api/buyer/bayar-tagihan/
- Cek status: https://developer.digiflazz.com/api/buyer/cek-status/
- Webhook: https://developer.digiflazz.com/api/buyer/webhook/
- Kode respons: https://developer.digiflazz.com/api/buyer/response-code/
- Data uji: https://developer.digiflazz.com/api/buyer/test-case/

Ringkasan kontrak yang dibaca saat audit:

1. Katalog pascabayar memakai `/v1/price-list`, `cmd: pasca`. Katalog berisi SKU, admin, commission, dan status buyer/seller.
2. Inquiry, pembayaran, dan status memakai POST JSON ke `/v1/transaction`, dengan `commands` masing-masing `inq-pasca`, `pay-pasca`, `status-pasca`.
3. Signature transaksi memakai MD5 dari username + API key + ref_id. Signature katalog memakai suffix `pricelist`.
4. Pembayaran memakai ref_id yang sama dengan inquiry dan dilakukan pada tanggal yang sama dengan inquiry. Konfirmasi timezone operasional, jangan sekadar membandingkan UTC tanpa dasar.
5. Respons dibungkus `data`. Harga provider (`price`), harga jual (`selling_price`), admin, dan komisi katalog memiliki makna berbeda.
6. Pending dipantau lewat webhook atau cek status. Dokumentasi menyarankan tidak mengulang pemanggilan untuk transaksi/data sama dalam interval kurang dari satu menit.
7. Status pascabayar lebih dari 90 hari dapat mengembalikan data belum ada; jangan mengartikan ini sebagai bukti gagal/refund.
8. Webhook memakai HMAC-SHA1 body melalui `X-Hub-Signature` bila secret dikonfigurasi. User-Agent pascabayar adalah `Digiflazz-Pasca-Hookshot`; User-Agent bukan autentikasi.
9. Produk tertentu memerlukan input tambahan. Periksa kategori yang benar-benar akan didukung, termasuk PBB, e-money, dan SAMSAT.

Periksa dokumentasi resmi IAK juga untuk alur yang digunakan. Jangan menganggap kontrak transaksi IAK sama dengan Digiflazz karena nama field mirip.

## 6. Langkah A — Baseline dan batas kompatibilitas

- [ ] Periksa instruksi repository, `git status`, dan diff lokal; identifikasi perubahan pengguna yang terkait dan yang tidak terkait.
- [ ] Telusuri alur kategori -> produk -> inquiry -> konfirmasi -> bayar -> callback/status -> riwayat -> detail -> struk untuk kedua provider.
- [ ] Catat format API mobile sekarang: path, field request, nama field respons, tipe data, dan format error. Buat fixture kontrak dari kode yang aktual.
- [ ] Inventarisasi tes yang sudah tersedia dan jalankan baseline yang relevan. Pisahkan kegagalan lama dari kegagalan akibat perubahan nanti.
- [ ] Catat konfigurasi credential/mode yang dipakai tanpa mencetak nilainya. Jangan mengubah arti mode prabayar yang sudah berjalan.
- [ ] Tentukan kategori pascabayar yang didukung. Jangan menampilkan kategori sebagai siap transaksi jika input wajib atau responsnya belum didukung.

Kriteria selesai: peta alur dan kontrak lama tersedia; perbedaan kode lokal dengan asumsi awal dipahami.

## 7. Langkah B — Model katalog, pemetaan, dan snapshot transaksi

- [ ] Tambahkan penyimpanan katalog Digiflazz pascabayar sesuai pola schema: SKU, nama, brand/kategori, admin provider, komisi provider, status buyer/seller, deskripsi, dan waktu sinkronisasi.
- [ ] Hubungkan katalog ke `ProdukPascabayar`. Pertahankan pemetaan IAK dan relasi lain yang sudah ada.
- [ ] Bedakan kode internal dan SKU provider. Satu produk internal dapat memiliki pemetaan IAK dan Digiflazz, dengan satu pilihan aktif oleh admin.
- [ ] Jika satu provider mempunyai beberapa SKU yang terhubung, simpan pilihan SKU aktif secara eksplisit; jangan memilih hasil `findFirst` secara kebetulan.
- [ ] Gunakan identitas provider yang stabil dari data/konfigurasi, bukan asumsi ID angka tertentu berlaku di semua database.
- [ ] Simpan snapshot inquiry: member pemilik, provider, SKU provider, referensi unik, produk internal, nomor pelanggan, waktu/kedaluwarsa inquiry, input tambahan, serta rincian harga yang dikonfirmasi.
- [ ] Pisahkan status inquiry belum dibayar, pembayaran sedang dikirim/pending, sukses, gagal, dan expired dengan model yang tidak merusak status tampilan mobile lama.
- [ ] Siapkan constraint untuk identitas transaksi, klaim debit, dan refund agar proses paralel tidak menghasilkan pencatatan ganda.
- [ ] Buat migrasi yang menambah struktur dengan aman. Tentukan penanganan data lama yang tidak memiliki provider/pemilik; jangan menebak lalu mengirim pembayaran.

Kriteria selesai: mapping dan transaksi tidak bergantung pada konfigurasi produk yang dapat berubah setelah inquiry; data lama tetap bisa dibaca.

## 8. Langkah C — Sinkronisasi katalog dan panel admin

- [ ] Tambahkan fungsi pricelist pascabayar menggunakan `cmd: pasca`. Pertahankan perilaku `getPricelist()` prabayar atau pisahkan metode dengan jelas.
- [ ] Implementasikan sinkronisasi idempotent: update produk yang sama, tambah SKU baru, simpan status provider. Kegagalan request tidak boleh menghapus semua katalog atau mapping.
- [ ] Jangan menganggap respons berfilter sebagai katalog penuh ketika menonaktifkan SKU yang tidak muncul. Definisikan aturan perubahan ketersediaan secara eksplisit.
- [ ] Tambahkan halaman/tab katalog pascabayar Digiflazz: cari/filter, sinkronisasi, status, admin, komisi, waktu pembaruan, dan koneksi ke produk internal.
- [ ] Lengkapi route, menu, permission, DTO, service API, dan pencatatan aktivitas mengikuti pola admin yang ada.
- [ ] Perbaiki modal pilihan server pascabayar agar memakai relasi pascabayar sebenarnya. Tampilkan IAK dan Digiflazz yang benar-benar terhubung.
- [ ] Backend memvalidasi pilihan admin: provider didukung/aktif, mapping SKU benar, produk tersedia. Jangan hanya mengandalkan tombol disabled pada frontend.
- [ ] Tampilkan provider aktif dan perbandingan kandidat pada produk internal. Sinkronisasi katalog tidak boleh diam-diam mengubah provider pilihan admin.
- [ ] Simpan perubahan provider ke activity log. Jelaskan bahwa perubahan berlaku untuk inquiry baru.

Kriteria selesai: admin dapat sinkronisasi, menghubungkan SKU, membandingkan, dan memilih provider tanpa mengedit database secara manual.

## 9. Langkah D — Perbandingan harga dan keuntungan aplikasi

- [ ] Telusuri arti field `fee`, `comission`, `outletFee`, `memberComission`, `outletComission`, `laba`, dan `fee_agen` pada kode saat ini sebelum menentukan rumus.
- [ ] Dokumentasikan komponen: tagihan pelanggan, biaya admin provider, biaya perolehan (`price`), harga jual pelanggan, tambahan biaya aplikasi, komisi provider, serta bagian agen/member/outlet.
- [ ] Tentukan apakah komisi provider sudah tercermin dalam biaya perolehan atau diberikan terpisah. Jangan menambahkan komisi dua kali.
- [ ] Gunakan nilai aktual inquiry untuk pembayaran. Angka katalog digunakan untuk perbandingan/estimasi sesuai kontraknya, bukan nominal tagihan final.
- [ ] Bandingkan kedua provider pada harga jual dan pembagian komisi yang sama. Jangan menyatakan provider paling untung hanya berdasarkan nilai commission terbesar.
- [ ] Jika tagihan belum diketahui, tampilkan admin/komisi katalog dan estimasi yang diberi label beserta asumsinya. Jangan memanggil inquiry berbayar/nyata ke semua provider hanya untuk mengisi tabel admin.
- [ ] Nilai biaya yang tidak diketahui harus ditandai belum tersedia. Fee bernilai nol harus tetap nol; hindari default dengan `||` untuk angka nol yang valid.
- [ ] Simpan snapshot perhitungan transaksi agar laporan laba, refund, dan struk dapat ditelusuri.
- [ ] Jika aturan harga bisnis belum dapat ditentukan dari kode/dokumen, ajukan satu pertanyaan terfokus sambil melanjutkan katalog dan routing. Jangan mengubah harga jual produksi berdasarkan tebakan.

Kriteria selesai: rumus harga dan keuntungan dapat dijelaskan memakai contoh angka; UI tidak menampilkan keuntungan bersih yang belum terbukti.

## 10. Langkah E — Inquiry melalui provider pilihan admin

- [ ] Cari produk internal yang aktif dan mapping aktifnya. Tolak produk yang belum terhubung dengan pesan jelas.
- [ ] Validasi nomor pelanggan dan input khusus produk. Simpan nomor sebagai string agar nol di depan tidak hilang.
- [ ] Buat referensi unik yang aman terhadap request paralel, lalu simpan intent dan pemilik sebelum panggilan provider bila dibutuhkan untuk recovery.
- [ ] Panggil adapter IAK atau Digiflazz berdasarkan pilihan admin. Kirim SKU provider, bukan kode internal.
- [ ] Normalisasikan respons ke format internal yang sama: pelanggan, nominal, biaya, total, periode, detail, status, dan referensi.
- [ ] Bedakan inquiry sukses dari pembayaran sukses. Inquiry tidak memotong saldo dan tidak menjadi bukti tagihan sudah dibayar.
- [ ] Simpan informasi untuk konfirmasi/detail/struk, termasuk data PLN/PDAM dan kategori lain yang didukung.
- [ ] Terapkan mode testing dan credential sesuai kontrak masing-masing provider. Jangan menyamakan pemilihan development key dengan otomatis terkirimnya flag testing.
- [ ] Pertahankan nama/tipe field respons mobile lama; field tambahan harus kompatibel.

Kriteria selesai: produk IAK dan Digiflazz bisa inquiry sesuai mapping, hasil dimiliki member yang benar, dan mobile menampilkan tagihan tanpa pemilihan provider.

## 11. Langkah F — Pembayaran dan pencatatan saldo

- [ ] Ambil inquiry berdasarkan referensi **dan member pemilik**. Tolak referensi milik orang lain, tidak valid, sudah expired, atau belum sukses inquiry.
- [ ] Terapkan aturan tanggal inquiry Digiflazz. Inquiry kedaluwarsa meminta cek ulang; jangan mengubah transaksi yang sudah pending menjadi inquiry baru.
- [ ] Gunakan provider, SKU, referensi, dan harga dari snapshot server. Jangan menerima nominal/provider pilihan client sebagai sumber kebenaran.
- [ ] Cegah submit ganda dengan klaim bersyarat serta constraint database. Retry permintaan pembayaran yang sama mengembalikan status yang ada.
- [ ] Reservasi/debit saldo dengan pemeriksaan saldo cukup secara atomik. Tulis ledger yang terkait dengan transaksi. Debit hanya sekali.
- [ ] Hindari menahan transaksi database selama request jaringan ke provider. Simpan intent yang tahan restart, lakukan request, lalu finalisasi secara terpisah.
- [ ] Gunakan ref_id inquiry yang sama untuk `pay-pasca`. Jangan mengalihkan pembayaran pending/timeout ke provider lain.
- [ ] Bedakan penolakan definitif provider dari timeout koneksi/body tidak valid. Hasil ambigu masuk pending/recovery, bukan otomatis refund atau sukses.
- [ ] Pada sukses langsung, simpan status, SN/referensi, rincian harga aktual yang relevan, dan data struk melalui jalur finalisasi bersama.
- [ ] Pada gagal definitif setelah debit, refund tepat sekali dengan ledger dan saldo sebelum/sesudah. Jangan refund jika debit belum terjadi.
- [ ] Komisi/laba hanya dicatat pada tahap yang benar dan tidak berulang saat callback duplikat.
- [ ] Kirim notifikasi/socket setelah commit atau melalui outbox yang bisa diulang tanpa menggandakan perubahan finansial.

Kriteria selesai: pembayaran mempunyai satu debit, gagal mempunyai maksimal satu refund, dan hasil provider tidak hilang saat aplikasi/backend restart.

## 12. Langkah G — Callback, cek status, dan pemulihan

- [ ] Gunakan autentikasi webhook resmi. Untuk Digiflazz, validasi signature terhadap raw body dan secret yang benar; secret kosong tidak boleh menjadi autentikasi yang diterima.
- [ ] Cocokkan referensi dengan provider transaksi, SKU dan nomor pelanggan yang tersimpan. User-Agent hanya membantu klasifikasi, bukan menggantikan autentikasi/pencocokan.
- [ ] Jangan mencari prabayar dahulu lalu menganggap sisanya pascabayar tanpa identitas yang cukup; cegah benturan referensi antarjenis/provider.
- [ ] Petakan status/RC berdasarkan kontrak. Payload hilang/kontradiktif tidak otomatis berarti gagal atau refund.
- [ ] Satukan finalisasi dari respons bayar langsung, webhook, dan cek status. Semua harus idempotent dan mempertahankan status terminal yang sah.
- [ ] Tangani callback yang datang saat request pembayaran masih berjalan. Jangan menimpa sukses callback dengan respons pending terlambat.
- [ ] Tambahkan `status-pasca` khusus Digiflazz. Jangan memakai metode cek status prabayar untuk transaksi pascabayar.
- [ ] Terapkan jeda/cache pemeriksaan sesuai dokumentasi, termasuk rekomendasi satu menit untuk data/transaksi yang sama. UI boleh membaca status lokal tanpa memanggil provider setiap kali.
- [ ] Tambahkan recovery transaksi pending/hasil ambigu yang tahan restart, dengan batas retry dan penanganan manual bila status tidak dapat dipastikan.
- [ ] Bedakan transaksi lebih dari 90 hari atau tidak ditemukan dari gagal definitif. Jangan membuat transaksi/refund baru otomatis.
- [ ] Catat error yang dapat ditelusuri tanpa membocorkan credential, signature yang dihitung server, atau data pelanggan berlebihan.

Kriteria selesai: callback hilang/duplikat/terlambat dan cek status bersamaan tidak menyebabkan debit, refund, atau komisi ganda.

## 13. Langkah H — Mobile, riwayat, detail, dan struk

- [ ] Pertahankan alur mobile tanpa selector provider. Keputusan provider hanya di backend/admin.
- [ ] Cocokkan kontrak model Dart dengan response sukses dan error, termasuk nilai kosong/null serta tipe string/angka yang dipakai versi lama.
- [ ] Tampilkan harga jual, biaya, pelanggan, periode, dan rincian yang konsisten. Status inquiry sukses tidak ditampilkan sebagai sudah lunas.
- [ ] Cegah submit berulang saat loading. Tangani timeout sebagai status perlu diperiksa, bukan instruksi membayar lagi dengan referensi baru.
- [ ] Implementasikan endpoint detail pascabayar yang sekarang stub; pastikan tidak ada route ganda. Batasi akses pada pemilik transaksi.
- [ ] Simpan dan gunakan identitas transaksi yang konsisten antara respons inquiry, pembayaran, daftar riwayat, dan detail. Jangan memakai kode produk sebagai kode transaksi unik.
- [ ] Setelah pembayaran, tampilkan hasil aktual: sukses, pending, atau gagal, dan perbarui saldo dari server.
- [ ] Halaman riwayat/detail dapat dibuka ulang setelah aplikasi ditutup. Pending tetap dapat dipulihkan.
- [ ] Cetak/bagikan struk hanya menyatakan lunas untuk transaksi sukses. Isi SN, periode, nominal, biaya, dan total sesuai data tersimpan.
- [ ] Pastikan perubahan provider produk tidak mengubah tampilan nilai transaksi lama.
- [ ] Pertahankan kompatibilitas aplikasi versi lama selama memungkinkan; perubahan API wajib dibuat aditif. Jika benar-benar membutuhkan breaking change, dokumentasikan strategi versi/transisi sebelum diterapkan.

Kriteria selesai: kedua provider bekerja melalui alur mobile yang sama sampai detail dan struk, tanpa data kosong atau field yang rusak.

## 14. Matriks pengujian wajib

Tes harus membuktikan hasil nyata dalam batas lingkungannya. Unit test mock tidak membuktikan konkurensi database atau koneksi sandbox.

| Skenario | Hasil wajib |
| --- | --- |
| Sync Digiflazz pasca dua kali | Tidak menggandakan katalog dan tidak mengubah pilihan admin |
| Sync gagal atau respons berfilter | Mapping tetap utuh; tidak menonaktifkan katalog secara keliru |
| Produk internal terhubung ke IAK dan Digiflazz | Admin dapat memilih salah satunya; mobile tetap satu produk |
| Kode internal berbeda dengan SKU provider | Request memakai SKU hasil mapping |
| Ganti provider setelah inquiry | Bayar/status tetap ke provider dan referensi asal |
| Provider/SKU tidak aktif atau tidak terhubung | Ditolak sebelum pembayaran, pesan jelas |
| Inquiry IAK dan Digiflazz | Pelanggan, nominal, periode, biaya benar; saldo tidak dipotong |
| Inquiry member A dibayar/dibaca member B | Ditolak tanpa request bayar dan tanpa perubahan saldo |
| Inquiry lintas tanggal | Sesuai aturan provider; tidak bayar memakai inquiry kedaluwarsa |
| Input produk khusus | Field wajib divalidasi dan diteruskan sesuai kontrak |
| Bayar sukses langsung | Satu debit, status sukses, SN dan struk tersedia |
| Bayar pending lalu callback sukses | Satu debit, tanpa debit/komisi kedua |
| Bayar pending lalu gagal | Satu debit dan satu refund dengan ledger lengkap |
| Dua submit paralel | Satu pembayaran yang diinisiasi dan satu debit |
| Callback sama berulang/paralel | Tidak menggandakan refund, komisi, atau hasil finansial |
| Respons langsung bersamaan callback/status | Status dan saldo konsisten |
| Provider sukses tetapi koneksi lokal timeout | Masuk recovery dengan referensi sama, tidak membayar ulang sebagai transaksi baru |
| Database gagal/restart di tiap tahap | Ada intent yang dapat dipulihkan; tidak ada transaksi eksternal tanpa jalur rekonsiliasi |
| Webhook signature salah/secret kosong/provider salah | Tidak mengubah transaksi atau saldo |
| RC/status hilang atau bertentangan | Tidak salah sukses atau otomatis refund |
| Pembelian bersamaan topup/transaksi lain | Tidak kehilangan update saldo atau melewati batas saldo cukup |
| Komisi nol/biaya nol/data biaya belum diketahui | Nilai valid dipertahankan; informasi belum diketahui tidak ditampilkan sebagai nol |
| Riwayat/detail/struk kedua provider | Referensi, pelanggan, biaya, total, status, dan SN benar |
| Mobile versi kontrak lama | Request/response tetap dapat diparse dan alur tetap berjalan |
| Regresi IAK prabayar dan Digiflazz prabayar | Payload, routing, status, saldo, dan refund tidak berubah keliru |
| Regresi topup saldo | Callback/deposit tetap berfungsi sesuai baseline; temuan ISSUE-008 tidak diklaim selesai oleh tes issue ini |
| Regresi admin dan laporan | Menu/permission, katalog lama, komisi/laba, dan notifikasi tetap konsisten |

Gunakan fixture resmi Digiflazz untuk sukses, gagal, pending kemudian sukses/gagal. Tambahkan tes integrasi database terisolasi untuk debit/refund paralel. Tambahkan tes API untuk wiring produksi dan kompatibilitas mobile; jangan hanya menguji helper secara terpisah.

## 15. Urutan menjalankan pemeriksaan

1. Baca `Backend/package.json`, `Frontend/package.json`, konfigurasi Jest/integrasi, serta `Mobile/pubspec.yaml`. Gunakan toolchain dan script yang benar-benar tersedia.
2. Jalankan tes baseline terkait sebelum perubahan dan catat kegagalan yang sudah ada.
3. Setelah mengubah schema, generate client sesuai pola repository dan uji migrasi pada database uji. Jangan reset database yang belum dipastikan khusus tes.
4. Jalankan unit test adapter/routing/harga serta integration test pembayaran, callback, dan saldo.
5. Jalankan build/typecheck backend dan frontend. Hindari script lint dengan auto-fix yang mengubah seluruh repository tanpa kebutuhan.
6. Jalankan Flutter analyze pada cakupan terkait dan tes model/widget alur pascabayar. Uji navigasi, retry, riwayat, detail, dan struk.
7. Jalankan regresi prabayar, provider lama, saldo, dan komisi yang tersentuh perubahan.
8. Jika akses tersedia, lakukan pengujian sandbox resmi kedua provider. Jangan memakai rekening/tagihan produksi sebagai pengganti sandbox.
9. Catat perintah, hasil, dan pengujian yang belum dapat dilakukan. Jika Flutter/database/sandbox tidak tersedia, jangan mengklaim fitur tersebut telah terverifikasi.

## 16. Audit ulang sebelum issue boleh selesai

- [ ] Baca ulang setiap langkah dan cocokkan dengan kode aktual, bukan hanya catatan pengerjaan.
- [ ] Telusuri satu transaksi IAK dan satu Digiflazz dari pilihan admin sampai struk mobile.
- [ ] Periksa pergantian provider saat inquiry/pembayaran sedang berjalan.
- [ ] Periksa seluruh penulis saldo yang berinteraksi dengan transaksi ini dan bukti tes konkurensinya.
- [ ] Pastikan tidak ada selector provider untuk pengguna mobile, SKU hardcoded, inquiry nominal acak, endpoint detail kosong, atau sukses buatan.
- [ ] Pastikan tidak ada request bayar eksternal di transaksi database yang ditahan selama jaringan berlangsung.
- [ ] Pastikan hasil perbandingan keuntungan mempunyai rumus dan asumsi yang jelas.
- [ ] Pastikan mode testing, callback, dan status memakai implementasi pascabayar yang tepat.
- [ ] Periksa diff untuk perubahan pengguna yang tertimpa, credential, serta perubahan fitur lain yang tidak disengaja.
- [ ] **Jika menemukan langkah belum dikerjakan dan bisa dikerjakan, langsung selesaikan lalu ulangi pemeriksaan terkait.**
- [ ] Tandai checkbox hanya setelah ada bukti. Gunakan PARTIAL bila masih ada implementasi atau verifikasi wajib yang terblokir.

## 17. Laporan akhir AI pelaksana

Isi hasil pelaksanaan di bawah dokumen ini:

1. Ringkasan kondisi setelah pengecekan ulang, termasuk koreksi atas temuan awal.
2. File/schema/API yang berubah dan alasan singkatnya.
3. Cara admin sinkronisasi, menghubungkan SKU, membaca perbandingan, dan memilih provider.
4. Rumus harga/keuntungan serta contoh angka yang sudah diuji.
5. Bukti IAK dan Digiflazz memakai snapshot provider yang benar hingga pembayaran selesai.
6. Bukti kompatibilitas mobile, riwayat, struk, notifikasi, dan fitur prabayar.
7. Perintah dan hasil tes; bedakan mock, database uji, sandbox, dan produksi.
8. Langkah migrasi/deployment yang perlu dilakukan kemudian, serta hambatan nyata jika masih ada.

Jangan meminta izin melanjutkan pekerjaan lokal rutin yang sudah diperintahkan. Jangan menjanjikan tidak ada error tanpa bukti. Jangan menyatakan issue selesai jika salah satu provider atau alur mobile masih belum lengkap.

## 18. Hasil pelaksanaan

Status: **PARTIAL** - implementasi backend inti (katalog, pemetaan, routing provider, inquiry, pembayaran aman, finalisasi idempotent, webhook, worker pemulihan transaksi pending, endpoint mobile, dan tombol pemulihan status di mobile) selesai, lulus build produksi, dan diuji dengan mock. Yang **belum terverifikasi**: migrasi pada database uji terisolasi dan sandbox resmi IAK/Digiflazz (termasuk nama field respons IAK dan arti RC Digiflazz di luar fixture). Build produksi backend (`nest build`) dan frontend (`vite build`) lulus; rincian tes pada bagian 7 dan koreksi temuan reviewer pada bagian 9.

### 1. Ringkasan dan koreksi temuan awal

- F1 (benar): produk pascabayar belum punya relasi katalog Digiflazz pascabayar. Ditambahkan model `DigiflazzPascabayarProduct` dan `ProdukPascabayarProvider`.
- F2 (benar): ditambahkan `getPascabayarPricelist()` dengan `cmd: pasca`, terpisah dari `getPricelist()` prabayar yang tidak diubah.
- F3 (benar, dipertahankan): `inquiryPascabayar()`/`payPascabayar()` lokal tidak ditimpa; kini mendelegasikan ke `transactionPascabayar()` generik.
- F4 (benar, diperbaiki): inquiry/pembayaran kini mengirim SKU hasil pemetaan provider, bukan kode produk internal.
- F5 (benar, diperbaiki): inquiry menyimpan `memberId`; pembayaran/detail/status mencari berdasarkan referensi **dan** pemilik member.
- F6 (benar, diperbaiki): `fee` nol tidak lagi tertimpa. Nilai tak diketahui disimpan `null`, bukan dipaksa `2500`. Komponen biaya provider disimpan terpisah.
- F7 (benar, diperbaiki): request ke provider tidak lagi di dalam transaksi database. Debit saldo dilakukan atomik dengan klaim bersyarat sebelum request, finalisasi setelahnya.
- F8 (benar, diperbaiki): klaim `paymentIntentId` mencegah debit ganda; refund hanya sekali lewat klaim `status = proses` + `refundId @unique`.
- F9 (benar, diperbaiki): webhook mencocokkan provider + SKU + nomor pelanggan, dan memakai finalizer yang sama dengan respons bayar langsung.
- F10 (benar, diperbaiki): `transaksi-detail-pascabayar` tidak lagi stub; ditambah `pascabayar-status`.
- F11 (benar, diperbaiki): modal admin pascabayar tidak lagi membaca relasi prabayar atau ID server hardcoded.
- F12: fallback nominal acak dan sukses palsu tidak dikembalikan.

Catatan koreksi atas instruksi issue: heuristik mencari prabayar lebih dulu lalu menganggap sisanya pascabayar masih ada, tetapi sekarang disaring oleh `provider` pada transaksi pascabayar sehingga referensi antarjenis tidak bentrok.

### 2. Berkas, skema, dan API yang berubah

Skema (`Backend/prisma/schema.prisma`) dan migrasi `20260927090000_add_pascabayar_multiprovider`:

- enum `PascabayarProvider` (`IAK`, `DIGIFLAZZ`).
- enum `RiwayatSaldoStatus` + nilai `pengembalian_dana` untuk ledger refund.
- model `DigiflazzPascabayarProduct` (SKU unik, nama, kategori, brand, seller, price, admin, commission, status buyer/seller, syncedAt).
- model `ProdukPascabayarProvider` (per produk internal per provider: `providerSku`, `iakProductId`/`digiflazzProductId`, `isActive`; unik `[produkPascabayarId, provider]`).
- `TransactionPascabayar`: `trId @unique`, `memberId`, `provider`, `providerSku`, `expiredAt`, `providerRefId`, `providerStatus`, `inquiryPayload`, `paymentIntentId`, `paymentAttemptedAt`, `refundId @unique`, `adminFeeSnapshot`, `comissionSnapshot`.
- Backfill migrasi: pemetaan IAK lama menjadi baris pemilihan provider aktif (deterministik id terkecil), dan pengisian `memberId` transaksi lama dari `RiwayatTransaksi`.

Kode backend baru di `Backend/src/providers/pascabayar/`: `pascabayar.types.ts`, `pascabayar-normalize.ts`, `digiflazz-pascabayar.adapter.ts`, `iak-pascabayar.adapter.ts`, `pascabayar-router.service.ts`, `pascabayar-selection.service.ts`, `pascabayar-catalog.service.ts`, `pascabayar-finalizer.service.ts`, dan `pascabayar-recovery.service.ts`.

Worker baru: `Backend/src/scheduler/pascabayar-recovery.processor.ts` dengan queue BullMQ `pascabayar-recovery` yang dijadwalkan setiap 5 menit (hanya aktif di produksi, mengikuti pola `SchedulerModule` yang ada).

Endpoint admin baru (`administrator/pascabayar-provider`): `katalog-digiflazz` (list/kategori/sync), `internal-products`, `produk/:id/kandidat`, `produk/:id/perbandingan`, `produk/:id/connect`, `produk/:id/select`, `produk/:id/disconnect`.

Endpoint mobile: `pascabayar-inquiry` (kini menerima `additional_data`), `pascabayar-pembayaran`, `pascabayar-status` (baru), `transaksi-detail-pascabayar` (kini nyata), `riwayat-pascabayar` (kode transaksi memakai referensi unik, bukan kode produk).

Frontend: `Frontend/src/modules/Administrator/ProdukPascabayar/services/PascabayarProviderService.ts` (baru) dan `components/ProdukPascabayarPilihServerModal.vue` (ditulis ulang menjadi panel pemilihan provider + perbandingan + penghubungan SKU).

Mobile: `Mobile/lib/models/model_status_pascabayar.dart` (baru), `Mobile/lib/services/transaction.dart` (`statusPascabayar`), `Mobile/lib/shared/providers/DetailPascabayarProvider.dart` (`cekStatusPascabayar`), dan tombol **CEK STATUS KE PROVIDER** pada layar detail saat status masih diproses.

### 3. Cara admin memakai

1. Buka menu Produk Pascabayar, klik tombol **Pilih Server Aktif** pada produk.
2. Pada panel provider: klik **Sinkron Katalog Digiflazz** untuk mengisi katalog pascabayar.
3. Pada bagian Hubungkan SKU: pilih Digiflazz lalu cari SKU, atau pilih IAK lalu isi kode SKU; klik **Hubungkan**.
4. Bandingkan kolom admin provider, komisi, fee aplikasi, dan estimasi laba kotor (katalog) (harga pokok dan tagihan final baru diketahui dari respons inquiry).
5. Klik **Jadikan Aktif** pada kandidat terpilih. Perubahan hanya berlaku untuk inquiry baru; inquiry berjalan tetap memakai snapshot provider/SKU asal.

### 4. Rumus harga dan keuntungan

Komponen yang disimpan/dinormalkan: harga pokok provider (potongan deposit, mis. `price` Digiflazz), tagihan pelanggan (`bill_amount`, atau `desc.detail[].nilai_tagihan + denda` untuk Digiflazz), admin provider, komisi provider, fee aplikasi (`ProdukPascabayar.fee`), harga jual, laba.

Perbandingan kandidat admin memakai **harga jual yang sama** (pelanggan membayar tagihan + fee aplikasi internal), sehingga yang membedakan hanya biaya admin provider dan komisi yang diterima:

- laba estimasi (katalog) = feeAplikasi - adminProvider + komisiProvider
- biayaPerolehan, hargaPokokEstimasi, dan hargaJualEstimasi = null; harga pokok/tagihan final baru diketahui dari respons inquiry, bukan diestimasi dari katalog
- harga jual transaksi final = tagihan aktual hasil inquiry + fee aplikasi internal
- laba kotor transaksi final (`PascabayarFinalizerService`) = total yang didebit dari member - biaya aktual provider (`providerCost`: Digiflazz `price`, IAK `selling_price`); komisi katalog TIDAK ditambahkan lagi. Bila biaya aktual belum diketahui, `laba = null` (rumus lama `total - tagihan - admin + komisi` dikoreksi pada bagian 11)

Contoh (diuji pada `pascabayar-finalizer.spec.ts`): total didebit 12.500, providerCost 11.000, menghasilkan laba kotor = 12.500 - 11.000 = 1.500. Komisi katalog tidak ditambahkan lagi.

Makna harga Digiflazz (docs resmi, diperiksa 27 September 2026): `price` = potongan deposit buyer (harga pokok kami), `selling_price` = harga ke client, `admin` = biaya admin, `commission` = komisi buyer; tagihan pelanggan diambil dari `desc.detail[].nilai_tagihan + denda` (fallback `selling_price - admin`). Nilai `null` berarti belum tersedia, bukan nol.

### 5. Bukti snapshot provider

`inquiryPascabayar` menulis `provider`, `providerSku`, `nomorTujuan`, nominal/fee snapshot, `inquiryPayload` (termasuk `providerType` dan input tambahan), dan `expiredAt` (akhir hari operasional WIB) ke baris transaksi. `pembayaranPascabayar` memakai nilai dari baris tersebut dan tidak menerima provider/nominal dari client. Diuji pada `transaksi-pascabayar.service.spec.ts` (memakai SKU `IAK-PLN-SKU`, bukan kode internal `PLN-PASCA`).

### 6. Kompatibilitas mobile dan regresi

- Tidak ada selector provider di aplikasi mobile (hanya pemakaian paket `provider` untuk state management).
- Field respons inquiry dan detail dipertahankan (`ref_id`, `tr_id`, `kode_product`, `nomor_tujuan`, `nama_pelanggan`, `nominal`, `totalTagihan`, `biaya_admin`, `fee`; detail: `kode`, `status`, `print_status`, `tanggal`, `waktu`, `noref`, `total`, `productName`, `nomorTujuan`, `namaPelanggan`, `price`, `totalPrice`, `biayaAdmin`, `fee`, `message`). Perubahan bersifat aditif. Detail kini juga mengembalikan `sn`, `periode`, dan `providerAdminFee`, dan model/struk mobile memuat `sn`/`periode` (aditif) sehingga struk sukses tidak kosong.
- Pemulihan status di mobile: tombol **CEK STATUS KE PROVIDER** memanggil `pascabayar-status`. Backend tetap membatasi pemanggilan provider (jeda 60 detik untuk data yang sama) dan hanya melakukan finalisasi lewat jalur finalizer yang idempotent.
- Alur prabayar, topup saldo, dan callback LinkQu tidak diubah selain penambahan provider mock pada dua spec webhook. Suite `linkqu-callback.spec.ts` yang sempat gagal karena dependensi baru sudah diperbaiki.
- Perbaikan kecil ikutan pada ISSUE-008: `DepositIdempotency.clear` tanpa `knownKey` sebelumnya tidak menghapus apa pun sehingga tes `deposit_idempotency_test.dart` gagal; kini slot dihapus untuk intent yang diminta dan tetap tidak menghapus intent lain.

### 7. Perintah dan hasil tes

Mock (tanpa database), `Backend`:

- `node --stack-size=8192 node_modules/typescript/lib/tsc.js --noEmit --incremental false -p tsconfig.json`: hanya 13 galat pra-eksisting di `*.spec.ts` (deposit-linkqu, deposit-admin-protection, wapisender) yang tidak terkait perubahan ini.
- `nest build`: berhasil (exit 0).
- `jest --runInBand`: 31 suite lulus, 5 suite gagal (semuanya pra-eksisting: pengumuman service+controller, riwayat_transfer_saldo service+controller, wapisender), 249 tes lulus, 13 tes gagal (pra-eksisting) dari 262 tes.
- Tes baru yang ditambahkan dan lulus: `digiflazz-pascabayar.adapter.spec.ts`, `pascabayar-router.spec.ts`, `pascabayar-finalizer.spec.ts`, `pascabayar-catalog.spec.ts`, `pascabayar-recovery.spec.ts` (7 tes), `pascabayar-selection.spec.ts` (7 tes), `iak-pascabayar-transaction.spec.ts` (4 tes), `transaksi-pascabayar.service.spec.ts`, `digiflazz-transaction-pascabayar.spec.ts`, `pascabayar-webhook.spec.ts`, `pascabayar-wiring.spec.ts`.

Mobile:

- `flutter analyze` pada berkas yang diubah: 0 error, 0 warning (hanya info lint gaya yang sudah ada di repo).
- `flutter test`: 7 tes lulus, 1 gagal, dan yang gagal hanya `test/widget_test.dart` (tes scaffold counter bawaan template, pra-eksisting). `test/deposit_idempotency_test.dart` kini 4/4 lulus setelah perbaikan `clear`.

Validasi skema/migrasi (offline, tanpa database): `prisma validate` valid; `prisma migrate diff --from-empty --to-schema-datamodel` memuat seluruh tabel/kolom/enum baru pada migrasi; berkas `migration.sql` diperiksa ulang dan berisi `CREATE TYPE "PascabayarProvider" AS ENUM ('IAK', 'DIGIFLAZZ')`.

Frontend: `vite build` berhasil (exit 0), termasuk bundel `ProdukPascabayar`. `vue-tsc --build` penuh tetap gagal karena galat tipe pra-eksisting masif (konfigurasi `lib` frontend tidak memuat DOM), bukan karena berkas ProdukPascabayar baru.

Belum dijalankan (tidak tersedia/butuh otorisasi): migrasi pada `TEST_DATABASE_URL` terisolasi (`npm run test:integration`, `test:db:setup`) dan sandbox resmi Digiflazz dan IAK.

### 8. Langkah migrasi/deploy dan hambatan

1. Jalankan `npx prisma migrate deploy` (migrasi dipanggil oleh `start:prod`). Migrasi tidak destruktif: hanya menambah tabel/kolom/enum dan backfill.
2. Pastikan `DIGIFLAZZ_WEBHOOK_SECRET` terisi; webhook Digiflazz kini fail-closed bila secret kosong.
3. Sinkronkan katalog pascabayar Digiflazz dan hubungkan SKU lewat panel admin sebelum mengaktifkan provider Digiflazz pada produk.
4. Worker pemulihan membutuhkan Redis dan hanya berjalan saat `NODE_ENV=production` (mengikuti perilaku `SchedulerModule` yang ada). Transaksi yang tidak kunjung pasti setelah 3 hari atau 10 percobaan ditandai `PERLU_PENANGANAN_MANUAL` pada `providerStatus` untuk ditangani operator, bukan direfund otomatis.
5. Hambatan verifikasi: nama field respons IAK pascabayar dinormalkan defensif dan wajib diverifikasi di sandbox; ambiguitas RC Digiflazz diperlakukan sebagai pending (tidak refund otomatis) sampai verifikasi sandbox. Selama itu, kesimpulan "kedua provider bekerja penuh" belum boleh diklaim.

### 9. Koreksi temuan reviewer (ronde lanjutan, 27 September 2026)

Semua temuan reviewer dikerjakan ulang dan diverifikasi dengan tes:

1. **Refund atomik (kritis).** `pascabayar-finalizer.service.ts` menambah saldo dengan `increment` (SET saldo = saldo + total), bukan baca-lalu-tulis nilai absolut; `after` diambil dari hasil update dan `before = after - total`. Refund yang berjalan bersamaan tidak lagi menimpa topup/pembelian lain.
2. **Kontrak pembayaran IAK (tinggi).** `iak.service.ts::transactionPascabayar` menerima `trId`; `pay-pasca` memakai sign `MD5(username + apiKey + tr_id)` dan body `tr_id`, endpoint selalu `/api/v1/bill/check` (tanpa suffix kategori), dan melempar error bila `tr_id` kosong. Adapter mengirim `providerRefId` hasil inquiry untuk pay/status; service menolak pembayaran IAK tanpa `tr_id` sebelum debit. Dites di `iak-pascabayar-transaction.spec.ts` (4 tes).
3. **Kedaluwarsa tidak menimpa pembayaran pending (tinggi).** Pemeriksaan `paymentAttemptedAt` didahulukan atas `expiredAt`, dan update expired diberi guard `paymentAttemptedAt: null`. Saldo yang sudah terpotong tetap diselesaikan finalizer/worker walau pengguna mencoba lagi pada hari berikutnya.
4. **Makna `price` Digiflazz dan rumus laba (tinggi).** Lihat bagian 4: perbandingan memakai harga jual yang sama, dan modal admin hanya menampilkan Admin provider / Komisi / Fee aplikasi / Estimasi laba kotor (katalog) (label 'laba bersih' dikoreksi pada bagian 11 karena angkanya laba kotor).
5. **Provider tanpa pilihan admin ditolak (tinggi).** `pascabayar-selection.service.ts` hanya memakai baris `isActive: true`; fallback kandidat id terkecil dan pemetaan IAK legacy dihapus. `cekKetersediaanKatalog()` menolak baris katalog hilang atau status buyer/seller `false` (`null` = belum diketahui, tetap boleh). Dites di `pascabayar-selection.spec.ts` (7 tes). Pesan inquiry: 'Produk belum memiliki provider pascabayar aktif yang tersedia. Hubungi admin.'
6. **Detail dan struk (sedang).** Inquiry menulis kolom `providerRefId`, `tarif`, `daya` dan menyimpan `providerCost/tarif/daya/trId` pada `inquiryPayload`; `getDetailPascabayar` membaca `trx` lalu `payload` lalu `detail.desc`, dan mengembalikan `sn`, `periode`, serta `providerAdminFee`. Adapter Digiflazz mencari `tr_id` di `detail` dengan fallback `ref_id`, sehingga `noref` struk tidak kosong.

### 10. Audit lanjutan (ronde kedua, 27 September 2026)

Tiga hal yang belum tertangkap pada ronde pertama ditemukan dan diperbaiki:

1. **Webhook Digiflazz pascabayar memakai `price` sebagai tagihan.** `webhook.service.ts` meneruskan `data.price` sebagai `actualBillAmount`, padahal `price` adalah potongan deposit buyer (harga pokok). Akibatnya `nominal` dan `laba` salah pada jalur webhook. Sekarang tagihan diambil dari `desc.detail[]` (`nilai_tagihan + denda`) atau `selling_price - admin`; `admin` diteruskan sebagai `actualProviderAdminFee`; bila tidak dapat dipastikan, `null` dikirim agar finalizer memakai nominal snapshot inquiry. Dites di `pascabayar-webhook.spec.ts` (6 tes).
2. **Rute ganda `POST /api/transaksi-detail-pascabayar`.** `StubController` masih mendaftarkan rute yang sama, dan `StubModule` diimpor sebelum `TransaksiPascabayarModule` pada `app.module.ts`, sehingga respons stub `{ data: {} }` menutupi endpoint detail nyata dan struk tetap kosong. Rute stub dihapus; ditambah tes wiring yang memastikan tidak ada rute pascabayar terdaftar ganda antar-controller.
3. **Model/struk mobile belum memuat `sn`/`periode`.** Detail API sudah mengembalikan keduanya, tetapi model Dart dan struk belum membacanya. Ditambahkan secara aditif pada `Mobile/lib/models/model_detail_transaksi_pascabayar.dart`, `Mobile/lib/shared/providers/DetailPascabayarProvider.dart`, dan `Mobile/lib/core/utils/print_pascabayar.dart`. `flutter analyze` pada berkas tersebut: 0 error (hanya info/warning gaya pra-eksisting).

### 11. Perbaikan paket kontrak offline (ronde ketiga, 27 September 2026)

Pengerjaan ronde ketiga mengikuti `doc/issue/fixtures/009-kontrak-offline-dan-langkah-perbaikan.md` (Langkah 2-6). Ringkasannya:

1. **Request IAK per operasi (`Backend/src/providers/iak.service.ts`).** Pembentuk payload dipisah: `inq-pasca` memakai `code`/`hp`/`ref_id` + sign `ref_id`; `pay-pasca` memakai `tr_id` + sign `tr_id` (tanpa `ref_id`/`code`/`hp`); status internal `status-pasca` diterjemahkan ke HTTP `checkstatus` + sign literal `cs`. Base URL pascabayar: `https://testpostpaid.mobilepulsa.net` (development) / `https://mobilepulsa.net` (production), path `/api/v1/bill/check` tanpa suffix kategori. `additionalData` dibatasi allowlist sehingga tidak dapat menimpa `commands`/`sign`/credential/`ref_id`/`tr_id`/`code`/`hp`; fetch memakai `AbortController` dengan timeout 30 detik.
2. **Ref ID IAK alfanumerik.** IAK memakai `PSC<digit>` (tanpa tanda hubung, sesuai RC 03); provider lain tetap `PSC-<digit>`. Ref ID yang sudah berjalan tidak diganti saat retry.
3. **Normalisasi IAK tanpa menunggu `bill_amount`.** `normalizeInquiry`/`normalizePay` membaca `response_code`, `tr_name`, `nominal`, `selling_price`, `noref`, `desc.tarif`/`daya`, `period`. Status numerik: 1 sukses, 2 gagal (definitif bila sinyal konsisten), 3 pending, 0 belum diterima; status 0 + RC `00` tidak lagi menjadi sukses. `providerBillRef` (`noref`) dipisah dari `providerRefId` (`tr_id`).
4. **Guard identitas respons.** Identitas (referensi/SKU/nomor) harus ADA dan cocok dengan snapshot; field yang hilang kini juga masuk `tidak_diketahui` (rekonsiliasi) - lihat koreksi ketat di bagian 12. Dites di `iak-pascabayar.adapter.spec.ts` dan `digiflazz-pascabayar.adapter.spec.ts`.
5. **Biaya aktual dan laba.** Adapter, service, recovery, dan webhook terverifikasi meneruskan `providerCost` (Digiflazz `price`; IAK `selling_price`). Laba kotor = total yang didebit - `providerCost`; komisi katalog tidak ditambahkan lagi; biaya belum diketahui menghasilkan `laba = null`. Label UI admin diubah dari "Estimasi laba bersih" menjadi "Estimasi laba kotor (katalog)".
6. **Normalisasi angka (`pascabayar-normalize.ts`).** `toIntOrNull` menolak `"abc"`/negatif/non-finite sebagai `null` (bukan 0) dan memahami pemisah ribuan (`"100.000"`/`"100,000"`); regex penghapus pemisah ribuan yang sebelumnya rusak (`/\\./g`) diperbaiki menjadi `/\./g`. `sumDetailBill` menolak seluruh rincian bila ada lembar malformed, bukan menjumlahkan sebagian. Dites di `pascabayar-normalize.spec.ts`.
7. **Finalisasi dan recovery.** Finalizer sukses menolak diterapkan bila pembayaran belum diklaim/debit belum tercatat; refund memakai `increment` atomik dan membaca ulang baris setelah klaim; jalur ambigu menyimpan `reconciliationReason` pada `inquiryPayload`. Ditambah `pascabayar-lease.ts`: klaim pemeriksaan atomik (satu `UPDATE ... WHERE status = proses AND updatedAt <= cutoff`) dipakai bersama oleh worker pemulihan dan tombol cek status. Notifikasi pasca-commit dibungkus `catch` agar kegagalan kirim pesan tidak mengubah hasil finalisasi.
8. **Webhook IAK pascabayar ditahan.** Callback IAK pascabayar belum terverifikasi kontraknya, sehingga tidak lagi memicu finalisasi; event disimpan dan status diselesaikan lewat cek status server-to-server. Finalisasi IAK prabayar tetap seperti semula.
9. **Mobile.** `Mobile/lib/models/model_detail_transaksi_pascabayar.dart` mengubah `daya` numerik menjadi string nullable via `?.toString()`; model/struk tetap memuat `sn`, `periode`, dan `noref`. Dites di `Mobile/test/model_detail_transaksi_pascabayar_test.dart`.

Hasil tes ronde ketiga:

- `nest build` (Backend): exit 0.
- `jest --runInBand pascabayar iak-pascabayar`: 13 suite lulus, 81 tes lulus.
- `jest --runInBand` (penuh): 33 suite lulus, 5 suite gagal (semuanya pra-eksisting: `pengumuman` service+controller, `riwayat_transfer_saldo` service+controller, `wapisender`), 266 tes lulus, 13 tes gagal (pra-eksisting), dari 279 tes. Kegagalan `wapisender.spec.ts` berasal dari commit ISSUE-008 `5272f9d2` (`WebhookService` membutuhkan `LinkquCallbackProcessorService`), bukan regresi ISSUE-009.
- `flutter analyze` pada berkas mobile yang diubah: 0 error; sisa info/warning gaya pra-eksisting (termasuk `unused_local_variable` pada variabel `data` yang sudah ada sebelum perubahan).
- `flutter test test/model_detail_transaksi_pascabayar_test.dart`: 5 tes lulus.

Status tetap **PARTIAL**. Pekerjaan yang belum terverifikasi penuh:

- Sandbox resmi IAK dan Digiflazz belum dijalankan; nama field respons IAK pascabayar masih dipetakan defensif dan wajib dikonfirmasi di sandbox.
- Kontrak callback pascabayar IAK belum lengkap; kategori selain PLN (PBB/SAMSAT/BPJS) belum dipetakan.
- Atomicity lease/refund masih dibuktikan lewat unit test dengan mock, bukan database terisolasi. Klaim lease memakai `updatedAt` sebagai jendela 60 detik (bukan token kepemilikan per-worker seperti inbox LinkQu) dan perlu pengerasan bila dijalankan dengan banyak instance worker.
- Migrasi produksi dan `npm run test:integration` pada `TEST_DATABASE_URL` belum dijalankan.

### 12. Koreksi temuan reviewer ronde keempat (27 September 2026)

Reviewer menemukan empat masalah pada perbaikan ronde ketiga. Semua dikerjakan dan diverifikasi dengan tes:

1. **Status bertentangan tidak lagi dianggap sukses/gagal.** Ditambah `resolveConsistentStatus` (`pascabayar-normalize.ts`): dua sinyal status harus konsisten; sinyal kosong atau bertentangan menjadi `tidak_diketahui`. IAK memetakan status numerik (1/2/3) dan membandingkannya dengan teks; `response_code` 00 tanpa status eksplisit TIDAK lagi menjadi sukses. Digiflazz membandingkan kode `rc` (00 sukses, 03 pending) dengan teks status, bukan mengutamakan teks. Dites di `pascabayar-normalize.spec.ts` dan `iak-pascabayar.adapter.spec.ts`.
2. **Identitas respons harus lengkap.** `periksaIdentitas` mewajibkan referensi/SKU/nomor ADA pada respons dan sama dengan snapshot; field yang hilang BUKAN berarti cocok, melainkan `tidak_diketahui`. Diterapkan pada normalisasi inquiry maupun pay/status IAK dan Digiflazz. Contoh ditolak: IAK tanpa `hp`, Digiflazz tanpa `customer_no`. Dites di `iak-pascabayar.adapter.spec.ts`, `digiflazz-pascabayar.adapter.spec.ts`, dan `pascabayar-normalize.spec.ts`.
3. **Biaya inquiry dipisah dari biaya aktual pembayaran.** `PascabayarFinalizerService` hanya memakai `input.providerCost` (bukti pembayaran) sebagai `actualProviderCost` dan dasar `laba`; biaya dari respons inquiry disimpan sebagai `estimatedProviderCost`/`estimatedProviderAdminFee`. Pemanggil (`transaksi-pascabayar.service.ts`, `pascabayar-recovery.service.ts`) tidak lagi memakai `payload.providerCost` sebagai laba aktual. Dites di `pascabayar-finalizer.spec.ts`.
4. **Allowlist input per kategori IAK.** `iak.service.ts` memakai `CATEGORY_INPUT_ALLOWLIST` (saat ini `pln: []`); kategori yang belum didukung dan field di luar allowlist (termasuk field inti) ditolak dengan `BadRequestException` sebelum request dikirim. Jalur pay/status tidak memakai `additionalData`. Dites di `iak-pascabayar-transaction.spec.ts` (tiga tes penolakan).

Hasil tes setelah koreksi ronde keempat:

- `nest build` (Backend): exit 0.
- `jest --runInBand pascabayar iak-pascabayar`: 13 suite lulus, 94 tes lulus.
- `jest --runInBand` (penuh): 33 suite lulus, 279 tes lulus; 5 suite/13 tes gagal (pra-eksisting yang sama: `pengumuman` x2, `riwayat_transfer_saldo` x2, `wapisender`).

Catatan batas: aturan identitas kini ketat sehingga provider yang tidak mengembalikan salah satu field identitas akan masuk rekonsiliasi (bukan finalisasi). Ini disengaja mengikuti kontrak offline, tetapi perlu dikonfirmasi di sandbox agar field wajib per operasi (khususnya pay IAK) tidak menahan pembayaran yang sebenarnya sah. Status tetap **PARTIAL**.

### 13. Koreksi temuan reviewer ronde kelima (27 September 2026)

Pemeriksaan ulang terhadap kontrak offline menemukan empat celah lokal. Semuanya sudah diperbaiki dan diuji:

1. **Kontradiksi status Digiflazz tidak memicu refund.** Hasil pay/status `rc=00` dengan teks `Gagal` sekarang dinormalisasi menjadi `tidak_diketahui`; `definitiveFailure` hanya benar bila hasil normalisasi akhir benar-benar `gagal`. Inquiry juga memakai aturan konsistensi yang sama, sehingga `rc=00` dengan teks `Pending` tidak dianggap inquiry sukses.
2. **Webhook Digiflazz memakai verifikasi identitas dan status yang sama dengan adapter.** Callback pascabayar kini wajib cocok pada provider, `ref_id`, SKU, dan nomor pelanggan secara utuh, termasuk mempertahankan nol awal. Field identitas yang hilang atau berbeda menghasilkan HTTP 409. Kombinasi kode dan teks status yang bertentangan dicatat sebagai ambigu tanpa sukses/refund.
3. **Status numerik IAK nol tidak dapat ditimpa teks sukses.** Nilai numerik `0` sekarang menjadi sinyal eksplisit `tidak_diketahui`; bila teks menyatakan sukses, hasil akhirnya tetap `tidak_diketahui` dan transaksi masuk rekonsiliasi.
4. **Notifikasi setelah commit memiliki retry terkontrol.** Pengumuman dicoba maksimal tiga kali. Gangguan socket dicatat terpisah sehingga tidak menghalangi pengumuman. Jika seluruh percobaan gagal, transaksi yang sudah final tetap sukses/gagal sesuai hasil provider dan error dicatat. Mekanisme ini retry dalam proses, belum merupakan outbox persisten lintas restart.

Hasil verifikasi setelah koreksi ronde kelima:

- `nest build` (Backend): berhasil, exit 0.
- `jest --runInBand --testPathPatterns=pascabayar`: 13 suite lulus, 101 tes lulus.
- `jest --runInBand --testPathPatterns=linkqu`: 6 suite lulus, 122 tes lulus.
- `flutter test --no-pub test/model_detail_transaksi_pascabayar_test.dart test/deposit_idempotency_test.dart`: 9 tes lulus.

Status tetap **PARTIAL** karena migrasi pada database uji terisolasi dan pengujian sandbox resmi IAK/Digiflazz belum dijalankan. Callback pascabayar IAK dan kategori IAK selain PLN juga masih menunggu kontrak resmi yang lengkap.
