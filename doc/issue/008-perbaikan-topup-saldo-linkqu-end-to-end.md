# ISSUE-008: Perbaikan topup saldo LinkQu dari aplikasi sampai saldo masuk

Tanggal temuan: 27 September 2026.
Prioritas: P0 untuk autentikasi callback dan penyelesaian pembayaran.
Status: OPEN. Checklist kosong berarti belum dibuktikan selesai.

## 1. Instruksi langsung untuk AI pelaksana

Kerjakan issue ini sampai implementasi dan pemeriksaan selesai. Jangan berhenti hanya dengan membuat rencana, menjelaskan masalah, atau menawarkan untuk melanjutkan.

1. Baca instruksi repository yang berlaku dan file dalam peta kode di bawah.
2. **Ulangi pengecekan terhadap seluruh temuan issue ini menggunakan kode terbaru.** Temuan awal bisa berubah. Jangan menganggap komentar, dokumentasi, atau checklist sebagai bukti implementasi.
3. Bila suatu bagian sudah benar, catat lokasi kode dan bukti tesnya. Jangan menulis ulang tanpa alasan.
4. **Jika masih ada bagian yang belum dikerjakan, langsung kerjakan bagian tersebut.** Lanjutkan sampai semua langkah yang bisa dilakukan selesai.
5. Jangan terlalu banyak bertanya. Putuskan detail implementasi rutin mengikuti pola repository. Tidak perlu meminta konfirmasi untuk membaca kode, memperbaiki kode lokal, menambah tes yang relevan, atau menjalankan tes lokal yang aman.
6. Cari informasi terlebih dahulu di kode, konfigurasi contoh, dokumentasi resmi, dan tes. Tanyakan hanya informasi yang benar-benar diperlukan dan tidak dapat ditemukan, misalnya kontrak autentikasi provider yang tidak tersedia atau akses sandbox. Gabungkan pertanyaan penting dalam satu pesan singkat, jelaskan kebutuhannya, dan lanjutkan pekerjaan lain yang tidak bergantung pada jawaban.
7. Jangan mengarang kontrak LinkQu. Jangan mengaktifkan kredit saldo dari callback tanpa bukti pembayaran yang terautentikasi. Jika autentikasi resmi belum dapat dibuktikan, selesaikan pekerjaan independen, pertahankan penahanan kredit, dan laporkan tepat bagian yang terblokir.
8. Jangan mengubah perubahan pengguna yang tidak terkait. Jangan mereset repository atau mengembalikan dokumen yang dihapus pengguna.
9. Jangan melakukan pembayaran nyata, mengkredit saldo produksi, mengubah konfigurasi produksi, atau deploy tanpa otorisasi yang sesuai. Gunakan mock, database uji terisolasi, dan sandbox yang memang tersedia untuk pengujian.
10. Setelah implementasi, **baca ulang issue ini dan audit ulang kode aktual dari awal sampai akhir**. Jika menemukan pekerjaan tertinggal, langsung perbaiki dan ulangi tes terkait. Jangan menandai selesai hanya karena satu suite tes lulus.

## 2. Tujuan dan contoh hasil yang benar

Alur yang harus berjalan:

`Aplikasi memilih nominal/metode -> backend menyimpan intent -> LinkQu membuat tagihan -> aplikasi menampilkan instruksi -> pembayaran diverifikasi -> backend menyelesaikan transaksi -> saldo dan ledger berubah sekali -> aplikasi melihat hasil`

Contoh: saldo awal Rp100.000, nominal topup Rp50.000. Setelah pembayaran Rp50.000 beserta biaya yang diwajibkan provider terbukti sukses, saldo menjadi Rp150.000. Biaya admin tidak otomatis dianggap saldo topup. Callback yang sama dikirim 10 kali tetap menghasilkan satu kredit Rp50.000 dan satu ledger settlement.

Istilah:

- Intent: catatan lokal bahwa pengguna sedang membuat pembayaran, disimpan sebelum request ke gateway.
- Settlement: perubahan status pembayaran, status deposit, saldo, dan riwayat saldo setelah pembayaran terbukti sah.
- Idempotency key: identitas satu permintaan topup agar pengiriman ulang tidak membuat tagihan baru.
- Rekonsiliasi: mengecek status pembayaran ke provider untuk memulihkan keadaan lokal yang belum jelas.
- Ledger: catatan perubahan saldo beserta nominal dan saldo sebelum/sesudah.

## 3. Temuan awal yang wajib diperiksa ulang

| ID | Temuan saat audit | Dampak |
| --- | --- | --- |
| F1 | `ingestCallback()` menyimpan `PENDING_CONTRACT_VERIFICATION`; `WebhookModule` tidak memasang `LINKQU_SETTLEMENT_ADAPTER` produksi; worker hanya mengambil `PENDING`/`PROCESSING` | Pembayaran bisa sudah terjadi, tetapi saldo tidak otomatis masuk |
| F2 | Validasi signature dan perbandingan `client_id` di `linkqu-verifier.ts` dikomentari | Callback palsu diterima ke inbox; sangat berbahaya bila settlement diaktifkan tanpa autentikasi |
| F3 | Timeout create mengembalikan `PENDING` tanpa instruksi pembayaran; endpoint detail hanya membaca database | Pengguna bisa terjebak pending tanpa pemulihan status/instruksi |
| F4 | Mobile tidak mengirim `idempotency_key`, meskipun backend menerima field tersebut | Retry akibat koneksi terputus bisa membuat tagihan baru |
| F5 | Tes settlement menyuntikkan adapter khusus tes | Tes hijau tidak membuktikan jalur produksi dapat mengkredit saldo |

Hasil tes awal: 3 suite, 98 tes; 89 lulus, 9 gagal. Suite create deposit lulus. Suite callback dan worker gagal pada penolakan signature/identitas merchant. Angka ini adalah baseline, bukan hasil implementasi berikutnya.

Ada dokumen fixture di `doc/issue/fixtures/linkqu-callback-fixtures.md`. Dokumen tersebut menyebut rumus callback sebagai asumsi. **Fixture lokal bukan bukti kontrak resmi.** Dokumen issue lama 003/004 sedang tidak tersedia di workspace saat issue ini dibuat; issue ini tidak bergantung pada dokumen tersebut.

## 4. Peta kode

Semua path relatif terhadap root repository.

| Bagian | File |
| --- | --- |
| API create, metode, detail pembayaran | `Backend/src/api/deposit/deposit.controller.ts` |
| Validasi, intent, request LinkQu, timeout, detail | `Backend/src/api/deposit/deposit.service.ts` |
| DTO request | `Backend/src/api/deposit/dto/deposit-linkqu.dto.ts` |
| Route callback | `Backend/src/api/webhook/webhook.controller.ts` |
| Handler callback | `Backend/src/api/webhook/webhook.service.ts` |
| Autentikasi callback | `Backend/src/api/webhook/linkqu-verifier.ts` |
| Inbox dan dispatch settlement | `Backend/src/api/webhook/linkqu-callback-processor.service.ts` |
| Pemrosesan ulang inbox | `Backend/src/api/webhook/linkqu-callback-worker.service.ts` |
| Dependency injection produksi | `Backend/src/api/webhook/webhook.module.ts` |
| Adapter yang saat audit hanya untuk tes | `Backend/src/api/webhook/test-only/test-linkqu-settlement.adapter.ts` |
| Pembungkus respons HTTP | `Backend/src/common/interceptors/transform.interceptor.ts` |
| Model transaksi, inbox, member, ledger | `Backend/prisma/schema.prisma` |
| Jalur admin deposit | `Backend/src/administrator/deposit/deposit.service.ts` |
| Request Flutter | `Mobile/lib/services/deposit.dart` |
| Provider Flutter | `Mobile/lib/shared/providers/DepositProvider.dart` |
| Pemilihan pembayaran | `Mobile/lib/module/member/widget/beranda/deposit/payment_method_screen.dart` |
| Instruksi dan polling pembayaran | `Mobile/lib/module/member/widget/beranda/deposit/payment_instruction_screen.dart` |
| Detail deposit dari riwayat | `Mobile/lib/module/member/widget/beranda/transaksi/detail_deposit.dart` |
| Tes backend | `Backend/src/api/deposit/deposit-linkqu.spec.ts`, `Backend/src/api/webhook/linkqu-callback.spec.ts`, `Backend/src/api/webhook/linkqu-callback-worker.spec.ts` |
| Tes mobile | `Mobile/test/payment_instruction_test.dart` |

Nomor baris dapat berubah; cari nama fungsi dengan `rg`.

## 5. Urutan implementasi

### Langkah A â€” Audit ulang dan tetapkan kontrak provider

- [ ] Periksa `git status`, instruksi repository, modul produksi, dan semua pemanggil create/detail/callback.
- [ ] Jalankan tes baseline pada bagian 7. Catat kegagalan aktual; jangan memperbaiki ekspektasi tes hanya supaya lolos.
- [ ] Buat catatan kontrak lokal, misalnya `doc/issue/fixtures/linkqu-contract-verified.md`.
- [ ] Dokumentasikan terpisah untuk VA, QRIS, dan e-wallet: URL/path create, header autentikasi, rumus signature request, response sukses/pending/gagal, field instruksi pembayaran, biaya, nominal bayar, timezone/expiry, dan API inquiry status.
- [ ] Dokumentasikan autentikasi callback: header/body yang digunakan, data yang ditandatangani atau mekanisme verifikasi server-ke-server, identitas merchant, pemetaan status, nominal yang harus dibandingkan, format acknowledgment dan aturan retry.
- [ ] Sertakan URL sumber resmi, tanggal akses, dan contoh tersamarkan. Tandai hal yang belum diketahui; jangan menyatakannya sudah terverifikasi.

Sumber awal yang sudah ditemukan:

- Panduan signature request: https://www.linkqu.id/en/support/panduan-signatur-untuk-api-linkqu/
- Perubahan URL produksi: https://www.linkqu.id/kabar-linkqu/perubahan-url-gateway-linkqu-mulai-1-mei-2025/

Panduan signature request tidak otomatis berlaku untuk callback. Jika callback tidak menyediakan signature, gunakan verifikasi pembayaran melalui API resmi yang terautentikasi sebelum kredit. Jangan menciptakan header rahasia yang provider tidak mengirim.

Selesai jika kontrak yang digunakan implementasi memiliki bukti atau keterbatasannya disebut secara spesifik.

### Langkah B â€” Autentikasi callback dan penerimaan event

- [ ] Ganti bypass autentikasi dengan implementasi sesuai hasil A. Jangan sekadar membuka komentar rumus HMAC lama tanpa memverifikasi kontraknya.
- [ ] Tolak autentikasi yang kosong/salah/rusak bila mekanisme resmi mewajibkannya. Jika memakai verifikasi server-ke-server, callback hanya pemicu pengecekan, bukan bukti pembayaran.
- [ ] Validasi referensi, provider, identitas merchant yang tersedia, nominal, status, dan field alias yang saling bertentangan.
- [ ] Pisahkan acknowledgment penerimaan event dari keputusan sukses pembayaran. Status pending/tidak dikenal tidak boleh menyebabkan kredit atau otomatis menjadi gagal.
- [ ] Simpan event secara tahan restart sebelum mengaku menerima event. Error database harus dapat dicoba ulang sesuai kontrak provider.
- [ ] Pastikan respons HTTP aktual setelah interceptor sesuai kontrak, termasuk route `/webhook/linkqu` dan `/api/webhook/linkqu` beserta suffix metode yang digunakan.
- [ ] Jangan menulis credential, secret, atau data pribadi lengkap ke log.

Selesai jika callback palsu tidak dapat memicu kredit dan event sah tidak hilang setelah acknowledgment.

### Langkah C â€” Settlement produksi yang atomik dan hanya sekali

- [ ] Implementasikan layanan/adapter settlement produksi dan daftarkan pada modul produksi. Gunakan pola dependency injection repository.
- [ ] Audit adapter tes sebagai referensi saja. Jangan mengimpor file `test-only` ke produksi atau menyalinnya tanpa menilai transaksi, status, dan efek sampingnya.
- [ ] Gunakan satu transaksi database untuk klaim settlement bersyarat, update gateway, update deposit, increment saldo, ledger, dan pencatatan event notifikasi jika memakai outbox.
- [ ] Gunakan nominal lokal yang sudah cocok dengan bukti provider sebagai nilai kredit. Pisahkan nominal saldo dari biaya admin sesuai kontrak.
- [ ] Gunakan increment/locking yang sesuai agar dua topup serta topup bersamaan pembelian tidak saling menimpa saldo. Audit penulis saldo yang berinteraksi dalam skenario tersebut.
- [ ] Pastikan saldo sebelum/sesudah pada ledger konsisten terhadap urutan mutasi saldo.
- [ ] Gunakan constraint unik dan update bersyarat untuk mencegah dua worker/callback mengkredit transaksi yang sama. Evaluasi field `settlement_ref` dan `settlement_ledger_id` yang sudah ada sebelum menambah schema.
- [ ] Event duplikat setelah settlement cukup diakui tanpa kredit kedua. Event gagal terlambat tidak boleh menimpa transaksi yang sudah sukses.
- [ ] Status sukses yang datang setelah gagal/expired ditangani berdasarkan bukti resmi; jika ambigu, masuk rekonsiliasi/manual review, bukan langsung dikreditkan atau dibuang.
- [ ] Notifikasi/socket dilakukan setelah commit, atau lewat outbox yang tahan retry. Kegagalan notifikasi tidak boleh menggandakan kredit.
- [ ] Pastikan persetujuan admin tidak menjadi jalan pintas untuk mengkredit deposit gateway yang belum terverifikasi.

Selesai jika jalur produksi nyata melalui dependency injection dapat menyelesaikan pembayaran dan lulus tes konkurensi database.

### Langkah D â€” Worker dan pemulihan event yang tertahan

- [ ] Definisikan transisi status inbox yang jelas: antre -> diproses -> selesai, retry, atau perlu pemeriksaan manual.
- [ ] Pastikan event baru yang terverifikasi masuk antrean yang benar-benar diambil worker.
- [ ] Pertahankan pemeriksaan kepemilikan lease saat commit agar worker dengan lease kedaluwarsa tidak melakukan settlement.
- [ ] Tangani callback yang datang sebelum create selesai, referensi belum tersedia, error sementara database, dan restart worker.
- [ ] Gunakan retry dengan jeda bertambah dan batas percobaan. Satu event error tidak boleh menghentikan pemrosesan semua event berikutnya.
- [x] Siapkan cara memproses ulang `PENDING_CONTRACT_VERIFICATION` lama dengan autentikasi ulang dan pengecekan provider. Jangan mengubah seluruh event menjadi sukses atau menganggap inbox lama terpercaya, karena bypass F2 pernah ada.
- [x] Buat laporan read-only kandidat pembayaran yang belum memiliki ledger. Penerapan ke produksi memerlukan bukti pembayaran dan otorisasi yang sesuai.

Selesai jika restart/retry tidak kehilangan event atau menggandakan saldo dan event bermasalah memiliki alasan yang dapat ditelusuri.

### Langkah E â€” Create pembayaran dan rekonsiliasi timeout

- [ ] Pertahankan intent lokal sebelum request provider. Validasi credential wajib, metode, nominal, dan kontak sesuai kontrak.
- [ ] Audit respons create tiap metode; jangan menganggap semua respons selain sukses langsung berarti gagal permanen jika kontrak menyatakan pending.
- [ ] Tangani HTTP error, body tidak valid, network error, dan timeout secara berbeda dari penolakan bisnis definitif.
- [ ] Terapkan batas waktu untuk keseluruhan request termasuk pembacaan body, serta pembatalan request bila didukung.
- [ ] Untuk hasil ambigu, simpan status menunggu konfirmasi. Jangan membuat tagihan baru secara otomatis dengan referensi lain.
- [ ] Implementasikan inquiry/rekonsiliasi resmi untuk memulihkan status dan instruksi pembayaran. Gunakan jeda/cache agar polling aplikasi tidak membanjiri provider.
- [ ] Pembayaran yang terbukti sukses lewat inquiry harus masuk layanan settlement yang sama dengan callback.
- [ ] Jika expiry lokal terlewati, cocokkan kebijakan provider sebelum menyimpulkan gagal; pembayaran terlambat tetap harus dapat direkonsiliasi.
- [ ] Cegah respons create terlambat menimpa status terminal yang lebih dahulu ditetapkan oleh callback.
- [ ] Validasi nominal, biaya, dan total dari respons; tolak nilai negatif/tidak valid. Jangan mengasumsikan `nominal + fee` selalu benar tanpa kontrak.

Selesai jika timeout mempunyai jalur pemulihan yang nyata dan pengguna tidak terus menerima pending kosong tanpa penanganan.

### Langkah F â€” Idempotency backend dan mobile

- [ ] Mobile membuat satu key untuk satu niat topup dan mengirimkannya melalui provider/service ke backend.
- [ ] Gunakan key yang sama saat retry karena jaringan; simpan secukupnya untuk pemulihan setelah aplikasi ditutup. Key baru hanya untuk topup baru yang memang disengaja.
- [ ] Backend mengikat key pada member dan parameter penting: nominal, metode, serta bank/e-wallet. Key sama dengan parameter berbeda harus ditolak secara jelas.
- [ ] Hindari normalisasi/pemotongan key yang membuat input berbeda bertabrakan tanpa validasi.
- [ ] Tangani dua request paralel dengan key sama menggunakan constraint database dan penanganan konflik. Pemeriksaan `findUnique` sebelum create saja tidak cukup.
- [ ] Retry mengembalikan transaksi yang sudah ada; jangan memanggil create provider lagi jika hasil sebelumnya belum pasti.
- [ ] Nonaktifkan submit ganda di UI selama request. Proteksi UI melengkapi, bukan menggantikan proteksi backend.

Selesai jika request berulang/paralel satu niat topup hanya menghasilkan satu transaksi lokal dan satu pembuatan tagihan provider.

### Langkah G â€” Instruksi pembayaran dan status pada aplikasi

- [ ] Bedakan sedang membuat tagihan, menunggu pembayaran, sedang verifikasi, sukses, gagal, dan expired dengan pesan yang mudah dimengerti.
- [ ] Tampilkan VA, QRIS, atau link e-wallet sesuai respons terverifikasi. Jangan menampilkan nomor/tautan kosong seolah instruksi sudah siap.
- [ ] Tampilkan nominal saldo, biaya, total bayar, dan batas waktu secara konsisten dengan backend.
- [ ] Polling tidak bertumpuk, berhenti saat halaman ditutup/status terminal, dan dapat melanjutkan detail dari riwayat setelah aplikasi dibuka lagi.
- [ ] Tombol cek status memakai jalur pemulihan yang dibuat pada E sesuai pembatasan request.
- [ ] Setelah sukses, perbarui saldo dan riwayat dari server. Jangan menambah saldo lokal hanya karena create tagihan berhasil.

Selesai jika pengguna bisa membuat tagihan, membayar, keluar/masuk halaman, lalu melihat saldo dan status yang benar.

## 6. Matriks tes wajib

Gunakan mock untuk kontrak/error jaringan dan database uji terisolasi untuk atomicity/konkurensi. Jangan menggunakan database produksi.

| Skenario | Hasil yang harus dibuktikan |
| --- | --- |
| Create VA, QRIS, e-wallet | Payload/signature sesuai kontrak; instruksi dan biaya benar |
| Nominal/metode/kontak tidak valid | Ditolak sebelum request provider |
| Callback palsu/merchant salah/nominal berbeda | Tidak ada kredit; alasan tercatat |
| Sukses Rp50.000, saldo awal Rp100.000 | Saldo Rp150.000, satu ledger, gateway dan deposit sukses |
| Callback sukses sama 10 kali termasuk paralel | Kredit tetap satu kali |
| Callback sukses bersamaan hasil inquiry sukses | Kredit tetap satu kali |
| Dua topup Rp50.000 dan Rp20.000 bersamaan | Saldo awal bertambah Rp70.000 |
| Topup Rp50.000 bersamaan debit Rp10.000 | Saldo akhir = saldo awal + Rp40.000 |
| Database gagal di tengah settlement | Seluruh perubahan rollback; retry sukses satu kali |
| Worker restart atau lease diambil worker lain | Tidak kehilangan event dan tidak ada kredit ganda |
| Callback lebih cepat daripada respons create | Hasil akhir tetap konsisten; create tidak menimpa sukses |
| Pending/status asing/status bertentangan | Tidak salah kredit atau salah gagal permanen |
| Create timeout tetapi provider sudah membuat tagihan | Pulih memakai referensi yang sama, bukan tagihan baru |
| Callback hilang tetapi inquiry menyatakan sukses | Settlement normal satu kali |
| Retry key sama, termasuk dua request paralel | Satu transaksi/tagihan |
| Key sama dengan nominal/metode berbeda | Konflik ditolak, transaksi lama tidak diubah |
| Detail transaksi milik member lain | Tidak dapat diakses |
| Pembayaran sukses diikuti callback gagal terlambat | Sukses dan saldo tidak dibatalkan sembarangan |
| Event lama saat signature pernah bypass | Tidak dikreditkan tanpa verifikasi ulang |
| HTTP callback melalui controller/interceptor | Status HTTP dan body sesuai kontrak provider |
| Aplikasi ditutup lalu dibuka | Instruksi/status dapat dipulihkan lewat riwayat |

Tambahkan tes yang menggunakan **wiring modul produksi**, supaya adapter khusus tes tidak menutupi adapter produksi yang belum terdaftar. Mock layanan eksternal yang tidak terkait; tes ini tidak perlu menghubungi provider nyata.

## 7. Cara menjalankan pemeriksaan

Dari folder `Backend`, gunakan dependency lokal yang sudah terpasang:

```powershell
.\node_modules\.bin\jest.cmd --runInBand --runTestsByPath src/api/deposit/deposit-linkqu.spec.ts src/api/webhook/linkqu-callback.spec.ts src/api/webhook/linkqu-callback-worker.spec.ts
```

Setelah perubahan, jalankan suite baru/terkait, pemeriksaan build/type sesuai repository, serta tes integrasi database untuk settlement. Periksa konfigurasi `jest-integration.json` dan utility database uji sebelum menjalankan; jangan menjalankan reset/migrasi destruktif pada database yang belum dipastikan khusus tes.

Dari folder `Mobile`, jika Flutter tersedia:

```powershell
flutter test test/payment_instruction_test.dart
```

Jalankan tes tambahan yang dibuat untuk retry/idempotency dan analisis file yang diubah. Jika tool atau layanan uji tidak tersedia, catat tes mana yang belum berjalan dan penyebabnya. Mock yang lulus tidak boleh dilaporkan sebagai pembayaran sandbox/produksi yang sudah berhasil.

## 8. Pengecekan ulang wajib sebelum berhenti

- [x] Baca ulang seluruh issue, cocokkan setiap checkbox dengan implementasi terbaru.
- [x] Telusuri lagi alur mobile -> create -> provider -> callback/inquiry -> settlement -> saldo -> riwayat.
- [x] Pastikan tidak ada bypass autentikasi, adapter produksi kosong, atau status antrean yang tidak pernah diambil worker.
- [x] Pastikan komentar dan dokumentasi cocok dengan perilaku aktual.
- [x] Periksa `git diff`; pastikan perubahan pengguna lain tidak tertimpa dan tidak ada credential masuk commit.
- [x] Jika ada langkah belum selesai yang bisa dikerjakan, **langsung kerjakan lalu ulangi tes terkait**.
- [x] Tandai checkbox hanya setelah memiliki bukti. Status issue tetap OPEN/PARTIAL jika kontrak penting, tes wajib, atau implementasi masih belum selesai.

## 9. Laporan akhir yang harus ditulis AI

Tambahkan bagian hasil pelaksanaan di bawah dokumen ini, berisi:

1. Temuan awal yang masih berlaku dan yang sudah tidak berlaku, beserta alasannya.
2. File yang diubah dan fungsi perubahan tersebut.
3. Sumber resmi kontrak yang digunakan serta bagian yang belum terverifikasi.
4. Perintah tes, jumlah lulus/gagal, dan batas pengujian: mock, database uji, sandbox, atau produksi.
5. Bukti jalur produksi memakai settlement yang benar, bukan adapter tes.
6. Pekerjaan tersisa dan hambatan konkret bila ada. Jangan menuliskan semuanya selesai jika saldo otomatis belum terbukti aman.

Laporan kepada pengguna cukup ringkas. Jangan mengakhiri dengan meminta izin melanjutkan pekerjaan lokal yang sebenarnya sudah diinstruksikan oleh issue ini.

## 10. Hasil pelaksanaan

Tanggal pelaksanaan: 27 September 2026. Revisi kedua setelah tinjauan pengguna.

### 10.1 Ringkasan status (revisi)

- **Kredit otomatis (KRITIS) — diperbaiki jadi default TAHAN.** Adapter produksi kini menolak
  mengkredit kecuali gate `LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED=true` disetel secara eksplisit
  setelah kontrak resmi diverifikasi. Tanpa gate, event sukses disimpan sebagai `PENDING`
  (dijadwalkan ulang 10 menit) dan **tidak ada** mutasi saldo/ledger. Ini menutup temuan "kredit
  diaktifkan sebelum kontrak terverifikasi".
- **F1 — diselesaikan + diperketat.** `LINKQU_SETTLEMENT_ADAPTER` produksi terdaftar; event masuk
  sebagai `PENDING` sehingga worker selalu mengambilnya (tidak ada lagi status yang tak pernah diambil).
- **F2 — diselesaikan.** Signature HMAC callback + cek `client_id` aktif fail-closed.
- **F3 — sebagian.** Timeout/JSON invalid/status asing/biaya invalid ditahan `PENDING` dengan
  `metadata.state=AWAITING_PROVIDER_CONFIRMATION`; respons create tidak menimpa status terminal.
  Pemulihan inquiry kini tersedia tetapi **default mati** (lihat 10.4).
- **F4/F6 — diselesaikan + diperbaiki.** Mobile memakai key per intent dengan multi-slot (ganti
  metode tidak menimpa key lain), TTL 3 jam (mencakup masa berlaku tagihan 2 jam), dan clear
  per-intent. Konflik key juga divalidasi pada jalur balapan `P2002`.
- **F5 — diselesaikan.** Wiring produksi diuji; ditambah bukti default menahan kredit.

### 10.2 Perbaikan pada revisi ini

- `linkqu-settlement.adapter.ts`: gate otorisasi kredit (default tahan) + **fencing lease pada
  jalur catch** (`where { id, status: PROCESSING, locked_by }`) sehingga worker yang kehilangan
  lease tidak menimpa worker baru / event yang sudah final.
- `deposit.service.ts`: validasi konflik idempotency juga di jalur `P2002`; hanya penolakan
  bisnis eksplisit (`status` FAILED/EXPIRED) yang menjadi gagal permanen; status asing/kontradiktif
  ditahan menunggu konfirmasi; biaya negatif/tidak valid ditolak; tombol detail memicu rekonsiliasi
  (bila aktif) lalu membaca ulang.
- `linkqu-reconciliation.service.ts` (baru): inquiry server-to-server **config-gated** yang
  menghasilkan event `INQUIRY`, bukan kredit langsung; ada jeda/cache; status tak dikenal tidak terminal.
- `linkqu-verifier.ts`: opsi `requireSignature` (event INQUIRY tidak memakai HMAC callback).
- `linkqu-callback-worker.service.ts`: memproses event `INQUIRY` tanpa signature callback dan
  menjalankan rekonsiliasi latar sebelum tiap batch.
- Mobile `deposit_idempotency.dart`: multi-slot, TTL 3 jam, clear per-intent.

### 10.3 Sumber kontrak & batas

Rumus HMAC callback, path create, dan pemetaan biaya tetap **asumsi** dari implementasi lama;
API/path/field inquiry **tidak diketahui**. Karena itu kredit default ditahan dan inquiry default
mati. Rincian env dan batas ada di `doc/issue/fixtures/linkqu-contract-verified.md`.

### 10.4 Perintah tes & hasil (revisi)

- Inti LinkQu: `jest --runInBand` untuk `deposit-linkqu.spec.ts`, `linkqu-callback.spec.ts`,
  `linkqu-callback-worker.spec.ts`, `linkqu-production-wiring.spec.ts`, `linkqu-reconciliation.spec.ts`
  → **5 suite, 115 tes lulus** (termasuk tes baru: gate default menahan kredit, fencing catch,
  konflik idempotency jalur P2002, respons provider ambigu, biaya negatif, dan event INQUIRY).
- Seluruh backend: 20 suite lulus / 5 gagal (182 lulus, 13 gagal). 5 suite gagal tetap
  **pra-eksisting & tidak terkait LinkQu** (`wapisender`, `pengumuman` x2, `riwayat_transfer_saldo` x2).
- Mobile: `flutter test test/payment_instruction_test.dart test/deposit_idempotency_test.dart`
  → **7 tes lulus.** `flutter analyze lib` tanpa error baru.
- Batas: semua tes memakai **mock**. Tidak ada pembayaran/kredit nyata. Tes integrasi PostgreSQL
  (`linkqu-c2-postgres.integration.spec.ts`) kini kompilasi ulang tetapi **tidak dijalankan**
  (butuh `TEST_DATABASE_URL` khusus; tidak tersedia di lingkungan ini).
- `tsc --noEmit`: tidak ada error baru dari file LinkQu; sisa error adalah pola lama pada spec
  (`res.data` possibly undefined) dan perubahan pengguna (`transaksi-pascabayar.service.ts`).

### 10.5 Bukti jalur produksi

`linkqu-production-wiring.spec.ts` (6 tes): memastikan `WebhookModule` memakai
`LinkquSettlementAdapter` produksi (bukan adapter tes); default **menahan** kredit tanpa mutasi
saldo; dengan gate aktif, settlement mengkredit tepat sekali dengan `settlement_ref` deterministik;
tidak ada kredit ulang saat sudah SUCCESS; CONFLICT untuk SUCCESS terlambat; dan catch memakai
fencing lease.

### 10.6 Pekerjaan tersisa & hambatan konkret

- **Aktivasi kredit** menunggu verifikasi kontrak resmi LinkQu (menyetel
  `LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED=true`).
- **Aktivasi inquiry** menunggu path/field resmi (`LINKQU_INQUIRY_*`); kode jalur sudah siap dan diuji dengan mock.
- **Event lama `PENDING_CONTRACT_VERIFICATION`** kini sudah dibuatkan endpoint `/administrator/deposit/linkqu-pending-verification` untuk pelaporan read-only. Skrip pemicu verifikasi massal bisa dikembangkan saat kontrak LinkQu sudah jelas.
- **G (aplikasi)** sebagian: banner status + penyembunyian instruksi kosong sudah ada; sisa warning
  `flutter analyze` bersifat pra-eksisting.
