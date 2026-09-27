# ISSUE-009 — Panduan implementasi offline IAK dan Digiflazz

Tanggal verifikasi sumber: 27 September 2026. Status: instruksi perbaikan, BUKAN bukti sandbox berhasil.

## 1. Cara memakai dokumen ini

Baca dokumen ini bersama ISSUE-009. AI pelaksana tidak perlu membuka tautan sumber untuk mengerjakan langkah di bawah. Tautan disimpan untuk audit. Ringkasan kontrak berasal dari dokumentasi resmi; contoh bernomor PSC/900001 dan nilai uang di bawah adalah fixture buatan untuk unit test, bukan rekaman transaksi nyata. Instruksi implementasi adalah keputusan teknis untuk repository ini, bukan kutipan dokumentasi provider.

Jika laporan pengerjaan lama berbeda dengan dokumen ini, periksa kode aktual dan gunakan koreksi kontrak di sini. Jangan menandai selesai berdasarkan laporan lama atau jumlah tes saja. Jangan terlalu banyak bertanya: kerjakan perubahan lokal, fixture, dan tes yang aman; catat hambatan eksternal secara terpisah. Jangan melakukan pembayaran nyata atau mengubah produksi.

## 2. Kontrak request IAK yang sudah dibaca

### 2.1 Transport dan lingkungan

Gunakan POST JSON. Dokumentasi mencantumkan base URL pascabayar development `https://testpostpaid.mobilepulsa.net` dan production `https://mobilepulsa.net`. Path transaksi adalah `/api/v1/bill/check`, tanpa suffix kategori. URL prabayar berbeda; jangan mengganti URL prabayar saat memperbaiki pascabayar. Username dan API key harus string yang tepat sesuai credential. Signature berbentuk MD5 atas gabungan username, API key, dan suffix sesuai operasi.

Sumber: [IAK Request](https://api.iak.id/api/guide/request). Panduan umum menyarankan timeout pascabayar 30 detik: [IAK Guide](https://api.iak.id/api/guide).

### 2.2 Inquiry PLN

Field wajib: `commands=inq-pasca`, `username`, `code` (SKU provider), `hp` (nomor pelanggan), `ref_id`, `sign`. Suffix signature adalah ref_id. `customer_id` dan `product_code` bukan pengganti field wajib PLN ini.

Fixture request buatan; hitung sign saat tes, jangan memakai placeholder sebagai signature:

```json
{"commands":"inq-pasca","username":"TEST_USER","code":"PLNPOSTPAID","hp":"001234567890","ref_id":"PSC900001","sign":"<md5(username+key+ref_id)>"}
```

Sumber: [IAK Inquiry PLN](https://api.iak.id/api/postpaid/core/products/pln/inquiry).

### 2.3 Pembayaran

Field wajib pembayaran PLN: `commands=pay-pasca`, `username`, `tr_id` (ID inquiry IAK), `sign`. Suffix signature adalah tr_id, BUKAN ref_id aplikasi. ID inquiry harus diambil dari hasil inquiry server dan disimpan, tidak diterima dari client sebagai sumber kebenaran.

```json
{"commands":"pay-pasca","username":"TEST_USER","tr_id":900001,"sign":"<md5(username+key+tr_id)>"}
```

Sumber: [IAK Payment PLN](https://api.iak.id/api/postpaid/core/products/pln/payment).

### 2.4 Pemeriksaan status — koreksi wajib

Request IAK memakai `commands=checkstatus`, `username`, `ref_id`, `sign=MD5(username+apiKey+'cs')`. Jangan kirim `status-pasca` ke IAK. Respons menyediakan `response_code`, `status`, `nominal`, `admin`, `price`, `selling_price`, `tr_id`, `ref_id`, `code`, `hp`, `tr_name`, `period`, `noref`, dan `desc`. Status numerik: 0 = permintaan bayar belum diterima, 1 = berhasil, 2 = gagal, 3 = masih diproses. `price` adalah nominal ditambah admin; `selling_price` adalah potongan saldo sesudah komisi. Tidak perlu mensyaratkan `bill_amount` untuk membaca status.

```json
{"commands":"checkstatus","username":"TEST_USER","ref_id":"PSC900001","sign":"<md5(username+key+'cs')>"}
```

Sumber: [IAK Check Status](https://api.iak.id/api/postpaid/core/check-status).

### 2.5 Kode respons dan batas dukungan

HTTP 200 tidak otomatis berarti pembayaran sukses. RC IAK `00` menyatakan inquiry/payment berhasil, `05` berarti kondisi pending. RC `02` menyatakan tagihan belum dibayar. RC `03` menyebut referensi tidak valid dan meminta format alfanumerik tanpa spasi; buat referensi IAK baru tanpa tanda hubung. RC `04` berkaitan dengan inquiry kedaluwarsa dan pembayaran pada hari yang sama. Jangan mengganti referensi transaksi yang sudah berjalan.

Sumber: [IAK Response Code](https://api.iak.id/api/postpaid/response-code).

Ringkasan request inquiry di atas terverifikasi untuk PLN. Jangan menyamaratakan input PLN ke PBB, SAMSAT, BPJS, atau kategori lain. Buat daftar kapabilitas per kategori. Pertahankan jalur lama yang terbukti; mapping baru dengan input wajib yang belum terdefinisi tidak boleh ditampilkan sebagai siap bayar. Ini pembatasan implementasi, bukan klaim seluruh kategori tidak didukung provider.

## 3. Kontrak Digiflazz yang diperlukan

### 3.1 Katalog

POST `https://api.digiflazz.com/v1/price-list`, body `cmd: "pasca"`, username, sign MD5(username+key+'pricelist'). Pisahkan katalog pascabayar dari prabayar. Simpan SKU, admin, commission, buyer/seller status, dan waktu sinkronisasi. Data berfilter bukan alasan menonaktifkan seluruh SKU yang tidak ikut dikembalikan.

Sumber: [Digiflazz Daftar Harga](https://developer.digiflazz.com/api/buyer/daftar-harga/).

### 3.2 Inquiry dan harga

POST `https://api.digiflazz.com/v1/transaction`. Inquiry menggunakan commands `inq-pasca`, username, buyer_sku_code, customer_no, ref_id, sign MD5(username+key+ref_id); development memiliki flag `testing: true`. Respons dibungkus `data`. `price` adalah biaya yang dipotong dari deposit buyer; `selling_price` harga untuk client. Rincian PLN berada di `desc`, termasuk tarif/daya dan detail tagihan. Produk PBB/e-money/SAMSAT memiliki input tambahan.

Sumber: [Digiflazz Cek Tagihan](https://developer.digiflazz.com/api/buyer/cek-tagihan/).

### 3.3 Bayar dan status

Pembayaran menggunakan endpoint transaksi, commands `pay-pasca`, SKU/nomor/ref_id yang sama dengan inquiry, username dan sign MD5(username+key+ref_id). Pembayaran pertama harus pada tanggal inquiry. Pending dapat diselesaikan melalui webhook atau pengecekan status. Mode development pembayaran menggunakan testing true.

Sumber: [Digiflazz Bayar Tagihan](https://developer.digiflazz.com/api/buyer/bayar-tagihan/).

Cek status menggunakan commands `status-pasca` beserta username, buyer_sku_code, customer_no, ref_id, sign dengan suffix ref_id. Beri jeda sekurangnya satu menit untuk transaksi/data yang sama. Pascabayar berumur lebih dari 90 hari dapat menghasilkan data belum ada; itu tidak membuktikan pembayaran gagal.

Sumber: [Digiflazz Cek Status](https://developer.digiflazz.com/api/buyer/cek-status/).

### 3.4 Webhook

Digiflazz mengirim POST; X-Hub-Signature menggunakan HMAC-SHA1 atas body dengan secret yang dikonfigurasi. User-Agent pascabayar adalah Digiflazz-Pasca-Hookshot. Header jenis transaksi tidak menggantikan autentikasi.

Sumber: [Digiflazz Webhooks](https://developer.digiflazz.com/api/buyer/webhook/).

## 4. Urutan pekerjaan lokal — kerjakan sampai selesai

### Langkah 1 — Baseline dan koreksi laporan

1. Baca git status/diff dan instruksi repository. Jangan menimpa pekerjaan lain.
2. Baca seluruh `Backend/src/providers/pascabayar`, service transaksi, webhook, scheduler, schema, serta model/struk mobile.
3. Catat kondisi setiap langkah: belum, sudah dengan bukti, atau terhalang layanan eksternal.
4. Koreksi klaim lama bahwa IAK hanya menunggu sandbox karena tidak memiliki bill_amount. Kontrak status sudah tersedia pada bagian 2.4.
5. Angka 64 tes/11 suite adalah hasil audit sebelumnya, bukan target atau hasil otomatis untuk pekerjaan berikutnya. Jalankan ulang dan laporkan hasil aktual.

### Langkah 2 — Pisahkan pembentukan request IAK per operasi

1. Pada `Backend/src/providers/iak.service.ts`, buat pembentuk payload terpisah untuk inquiry, pay, dan checkstatus. Boleh pertahankan nama operasi internal `status-pasca` agar router kompatibel, tetapi terjemahkan menjadi `checkstatus` di batas HTTP IAK.
2. Inquiry PLN memakai code/hp. Pay memakai tr_id dan suffix tr_id. Status memakai ref_id dan suffix literal cs.
3. Perbaiki `postpaidBaseUrl` memakai URL terverifikasi bagian 2.1; jangan menganggap domain postpaid.iak.dev/id setara tanpa bukti. Jika ada konfigurasi deployment eksplisit, jangan mengubah nilai produksi diam-diam; dokumentasikan default dan override.
4. Pada `IakPascabayarAdapter.pay`, kirim `trId: input.providerRefId` ke service. Saat audit, field ini hanya diteruskan oleh metode status, bukan pay.
5. Pastikan aliran: hasil inquiry IAK → providerRefId snapshot → service pembayaran → adapter.pay → payload tr_id. Validasi ID sebelum debit. Pertahankan tipe ID sebagai string internal; serialisasi numerik hanya setelah validasi aman bila kontrak membutuhkannya.
6. Buat ref_id baru alfanumerik untuk IAK. Jangan mengubah ref_id lama atau membuat ref baru pada retry pembayaran.
7. Jangan membiarkan additionalData menimpa command, sign, credential, ref_id, tr_id, code atau hp. Gunakan allowlist input kategori.
8. Tambahkan timeout yang benar-benar membatalkan fetch dengan AbortController, termasuk pembacaan body. Timeout setelah pengiriman berarti hasil ambigu, bukan refund otomatis.

Selesai bila tes memakai IakService dan adapter asli dengan fetch mock membuktikan payload, URL, dan signature ketiga operasi. Tes service dengan adapter mock saja tidak cukup.

### Langkah 3 — Normalisasi IAK tanpa menunggu bill_amount

1. Baca data.response_code, bukan hanya rc; alias lama hanya untuk kompatibilitas fixture yang jelas.
2. Map nama pelanggan tr_name, nomor hp, SKU code, nominal nominal, periode period, inquiry ID tr_id. Pisahkan biller reference noref dari ID inquiry; keduanya bukan field yang sama.
3. Status-check 1 → sukses, 2 → gagal definitif bila identitas dan sinyal respons konsisten, 3 → pending, 0 → belum diterima/rekonsiliasi. Missing/asing/kontradiktif → tidak_diketahui.
4. Jangan mengubah status 0 menjadi sukses hanya karena response_code 00; jangan langsung refund atau kirim ulang pembayaran ketika hasil ambigu.
5. Status sukses yang valid tanpa rincian harga tetap boleh menyelesaikan pembayaran yang sebelumnya didebit. Pertahankan snapshot nominal, tandai harga aktual belum tersedia; jangan menunggu bill_amount yang tidak diwajibkan alur aplikasi.
6. Normalisasi inquiry dan status secara terpisah: inquiry berhasil tidak berarti tagihan dibayar.
7. Periksa ref_id, provider, SKU dan nomor terhadap snapshot. Field identitas tidak lengkap atau berbeda harus masuk rekonsiliasi, bukan dianggap cocok secara otomatis. Pertahankan nol awal nomor pelanggan.
8. Terapkan normalisasi sama pada hasil langsung, tombol cek status, worker, dan callback terverifikasi. Jangan menganggap callback IAK prabayar sebagai bukti kontrak callback pascabayar; jika belum terverifikasi, simpan event dan gunakan status server-to-server sebelum finalisasi.

### Langkah 4 — Biaya aktual dan laba

1. Perbaiki komentar/tipe: biaya deposit Digiflazz = price; biaya deposit IAK status = selling_price. Jangan memakai nama field yang sama sebagai makna universal.
2. Teruskan providerCost melalui adapter, service, recovery, webhook terverifikasi, dan finalizer. Simpan harga inquiry terpisah dari harga aktual pembayaran.
3. Laba kotor terverifikasi = total yang didebit dari member dikurangi biaya aktual provider. Jangan tambah komisi katalog lagi bila sudah tercermin dalam biaya deposit.
4. Laba bersih membutuhkan pembagian agen/member/outlet serta biaya tambahan aktual. Jika komponen belum diketahui, simpan null/belum tersedia; jangan memberi label laba bersih pada laba kotor.
5. Jangan mengubah harga jual yang telah dikonfirmasi. Jika biaya aktual berbeda, catat selisih dan kebutuhan penanganan; jangan mendebit tambahan tanpa alur persetujuan pelanggan.
6. Untuk estimasi katalog dengan harga jual yang sama, fee aplikasi dikurangi admin ditambah komisi hanya boleh dipakai dengan asumsi eksplisit dan data lengkap. Estimasi tidak boleh ditulis sebagai laba aktual transaksi.
7. Jangan menjumlahkan sebagian detail tagihan lalu mengabaikan lembar yang malformed. Tolak nilai negatif/non-finite dan rincian tidak lengkap. Input "abc" tidak boleh berubah menjadi 0 akibat regex.
8. Pertahankan refund increment atomik, ledger dalam transaksi yang sama, guard debit/refund, serta larangan mengubah pending menjadi expired setelah debit.

### Langkah 5 — Finalisasi, retry, dan recovery

1. Klaim pembayaran secara atomik dan debit sekali; jangan memanggil jaringan di dalam transaksi database.
2. Finalizer sukses harus memastikan pembayaran benar-benar sudah diklaim dan debit tercatat. Endpoint status tidak boleh membuat inquiry belum dibayar menjadi transaksi sukses lokal.
3. Finalizer gagal harus membaca keadaan debit yang konsisten setelah klaim/lock, agar callback yang bersamaan dengan debit tidak memakai snapshot lama dan melewatkan refund.
4. Semua hasil terminal duplikat harus idempoten. Hasil bertentangan sesudah terminal dicatat untuk audit, tidak diam-diam menimpa saldo/status.
5. Worker dan tombol status memakai klaim pemeriksaan yang sama (timestamp/lease atomik), bukan sekadar membaca updatedAt lalu memanggil provider bersamaan.
6. Crash sesudah debit sebelum request harus memiliki jalur penanganan. Status belum diterima/unknown tidak boleh memicu pembayaran baru ke provider lain. Simpan intent dan alasan rekonsiliasi yang dapat ditelusuri operator.
7. Notifikasi gagal sesudah commit tidak boleh mengubah transaksi sukses menjadi gagal; sediakan retry/outbox atau bukti mekanisme yang ada.

### Langkah 6 — Mobile dan admin

1. Perbaiki `model_detail_transaksi_pascabayar.dart`: konversi daya numerik menjadi string nullable (`data['daya']?.toString()`) atau sesuaikan kontrak seluruh pemakai. Jangan assign int ke String?.
2. Uji model dengan daya 1300, "1300", null, dan field tidak ada. Pastikan detail dan struk menampilkan SN/periode, bukan hanya API mengembalikannya.
3. Tampilkan noref biller jika tersedia; jangan menyamakan ref_id aplikasi dengan nomor bukti provider tanpa label yang jelas.
4. Provider tetap dipilih admin. Inquiry lama tetap memakai snapshot meskipun pilihan admin berubah. Inquiry baru menolak mapping kosong/nonaktif/tidak tersedia.
5. Perubahan pascabayar jangan mengembalikan bug idempotency topup ISSUE-008; jangan mengubah penghapusan key tanpa tes transaksi lama vs transaksi baru.

## 5. Fixture dan matriks tes wajib

Semua data berikut buatan untuk pengujian. Secret memakai nilai dummy lokal; tidak ada request provider nyata.

### Fixture IAK status (bungkus dalam data)

```json
{"data":{"ref_id":"PSC900001","tr_id":900001,"code":"PLNPOSTPAID","hp":"001234567890","tr_name":"PELANGGAN UJI","period":"202609","nominal":100000,"admin":2500,"price":102500,"selling_price":101500,"status":1,"response_code":"00","noref":"BILLERTEST900001","desc":{"tarif":"R1","daya":1300}}}
```

Gunakan fixture ini untuk menguji keputusan aplikasi, bukan mengklaim sampel resmi. Buat variasi status 0/2/3, tanpa nominal, identitas salah, JSON rusak, dan HTTP error. Untuk sinyal RC yang belum dicatat kontraknya, harapkan tidak_diketahui sampai ada bukti; jangan mengarang kombinasi RC sebagai kontrak resmi.

### Fixture finansial internal

Total member 103000; providerCost 101500; laba kotor 1500. Komisi katalog 1000 tidak membuat laba menjadi 2500. Cost tidak tersedia → laba aktual belum diketahui. Biaya pembagian internal 300 yang terverifikasi → laba bersih 1200. Angka ini adalah contoh aritmetika aplikasi, bukan ketentuan harga bisnis baru.

| Tes | Bukti yang wajib diassert |
| --- | --- |
| Inquiry IAK PLN | code/hp benar, suffix ref_id, URL tanpa kategori |
| Bayar IAK melalui adapter asli | tr_id dari snapshot benar-benar sampai ke fetch; suffix tr_id |
| Status IAK melalui worker dan tombol | checkstatus + suffix cs, bukan status-pasca |
| IAK status 1 tanpa bill_amount | status sukses, nominal snapshot tidak dihapus |
| IAK status 0/3 atau sinyal bertentangan | tidak sukses/refund/kirim bayar baru otomatis |
| Inquiry sukses belum bayar | saldo dan ledger tidak berubah |
| Request bayar 10 kali bersamaan | satu klaim, satu debit, satu pengiriman |
| Callback dan hasil status bersamaan | satu finalisasi, satu refund jika gagal |
| Refund bersamaan topup/debit | saldo akhir benar, ledger cocok, gunakan database terisolasi |
| Retry pembayaran besok | pending tetap pending; inquiry belum bayar boleh expired |
| Admin mengganti provider | transaksi lama menggunakan provider/SKU/ref asal |
| Harga aktual | laba memakai providerCost, tidak menggandakan komisi |
| Respons provider salah identitas | tidak ada finalisasi saldo |
| Detail mobile daya numerik | parsing dan render struk tidak melempar TypeError |
| Regresi | prabayar, LinkQu, riwayat, komisi, notifikasi tetap sesuai kontrak |

Perintah baseline backend dari folder Backend:

```powershell
.\node_modules\.bin\jest.cmd --runInBand --testPathPatterns=pascabayar
.\node_modules\.bin\jest.cmd --runInBand --testPathPatterns=linkqu
```

Tambahkan tes model/widget pascabayar pada Mobile lalu jalankan file tes tersebut dengan `flutter test --no-pub <path-tes>`. Jalankan build backend dan analisis file mobile yang diubah. Jangan menyalin angka tes dari dokumen sebelumnya. Pisahkan kegagalan lama yang dibuktikan baseline dari regresi baru.

## 6. Batas verifikasi dan cara menutup pekerjaan

- Tidak punya browser bukan hambatan untuk langkah 1–6: kontrak inti tersedia di sini.
- Tidak punya sandbox bukan alasan menunda perbaikan command, signature, field, forwarding tr_id, laba, atau tipe Dart.
- Jika database uji tersedia, pastikan host/nama khusus tes dan tidak menunjuk produksi sebelum migrasi/tes konkurensi. Jika tidak tersedia, tulis perintah yang belum dijalankan dan alasannya; jangan menyebut tes mock sebagai bukti atomicity database.
- Jangan mengeksekusi migrasi produksi, mengubah credential produksi, atau melakukan pembayaran nyata untuk membuktikan issue.
- Kontrak kategori di luar yang dijelaskan dan kontrak callback pascabayar IAK belum lengkap pada paket ini. Catat batas dukungan tersebut dan jangan mengarang field. Selesaikan jalur PLN serta status/recovery yang sudah jelas terlebih dahulu.
- Baca ulang issue dan dokumen ini setelah perubahan. Cocokkan setiap klaim dengan kode, payload mock, hasil tes, dan daftar pekerjaan tersisa. Jika ada pekerjaan lokal yang belum selesai, langsung kerjakan lalu ulangi pemeriksaan, tanpa meminta izin rutin lagi.
- Laporan akhir wajib memisahkan: implementasi lokal selesai, unit/widget test, database integration, sandbox, dan produksi. Status tetap PARTIAL selama verifikasi wajib belum terpenuhi.
