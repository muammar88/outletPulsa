# Langkah perbaikan C2 untuk AI pelaksana

## Pemeriksaan T1 terbaru — belum sesuai rencana yang direvisi

Kemajuan: HTTP dan worker sudah memakai LinkquCallbackProcessorService; tanpa adapter terdaftar, event yang lolos pemeriksaan lokal ditahan. WebhookModule tidak mendaftarkan adapter test-only. Ini menutup jalur kredit otomatis yang sebelumnya masih aktif, tetapi belum memenuhi desain T1.

**Koreksi T1 berikut harus dikerjakan sebelum lanjut T2:**

1. `test-only/test-linkqu-settlement.adapter.ts` masih berisi member.update, requestDeposit.update dan riwayatSaldo.create. Ini justru desain yang sudah ditolak. Buat `linkqu-settlement.service.ts` sebagai service aplikasi asli, pindahkan logika transaksi ke situ, lalu ganti adapter test-only menjadi adapter VERIFIKASI yang hanya menghasilkan data sintetis. Adapter tes tidak boleh memiliki PrismaService/operasi finansial.
2. Processor saat ini hanya memeriksa `if (this.settlementAdapter)`. Ganti dengan adapter verifikasi yang menghasilkan VERIFIED / REJECTED / UNVERIFIED. Modul produksi mendaftarkan implementasi penahan UNVERIFIED; TestModule dapat override hasil verifikasi lalu menjalankan service settlement asli. Adapter tersedia tetapi UNVERIFIED/REJECTED wajib tetap nol kredit. Jangan mengaktifkan jalur finansial hanya karena ada provider DI.
3. `processWorkerItem` mengupdate hold hanya berdasarkan id + locked_by, tanpa status PROCESSING/expiry dan tanpa memeriksa count. Pertahankan guard kepemilikan existing, periksa count, kembalikan FENCING_REJECTED bila kalah. Jangan melaporkan hold berhasil jika update nol. Token per klaim tetap T4, tetapi T1 tidak boleh melemahkan guard lama. Return hasil HELD/UNVERIFIED yang jelas, bukan FAILED untuk event yang sebenarnya menunggu kontrak.
4. Worker masih menandai FAILED ketika verifier gagal karena key tidak tersedia. Pisahkan belum dapat diverifikasi dari invalid yang terbukti. Key/kontrak belum tersedia -> hold/review, bukan event final gagal karena asumsi autentikasi.
5. `linkqu-c2-postgres.integration.spec.ts:43-44` masih memanggil constructor worker dengan tiga argumen, sedangkan constructor kini memerlukan empat (processor). Perbarui melalui TestModule/service asli yang tepat; jangan menyisipkan null/as any untuk menyembunyikan ketidakcocokan. Build aplikasi mengecualikan spec, jadi build hijau tidak membuktikan spec integration dapat dikompilasi. Periksa tipe tanpa menghubungkan DB; jangan menjalankan integration pada DB aplikasi.
6. Tambahkan matriks HTTP + worker tanpa adapter resmi untuk SUCCESS/FAILED/EXPIRED; assert inbox tertahan dan gateway/deposit/member/ledger tidak berubah, FCM/socket pembayaran nol panggilan. Tambahkan duplicate held, penyimpanan inbox gagal, key unavailable, adapter hadir UNVERIFIED/REJECTED, serta lease hilang saat await. Tes settlement historis harus memanggil service aplikasi asli, bukan kode finansial di adapter test-only.
7. Jangan mengubah status provider lain atau menghapus member.update callback lain dalam WebhookService. Pertahankan pemisahan T0; koreksi T0 yang belum selesai tetap dicatat, bukan diasumsikan selesai karena T1 dikerjakan.

**Hasil aktual:** dua suite callback/worker, 92 tes lulus; **build gagal TS2345** pada `webhook.service.ts:772`: configuredClientId bertipe string | null | undefined dikirim ke parameter string | undefined. Perbaiki kontrak nullable secara eksplisit (misalnya normalisasi null menjadi undefined atau terima null lalu tangani di processor); jangan gunakan cast any. Jalankan ulang build setelah koreksi. PostgreSQL tidak dijalankan. Keberhasilan tes tidak menghapus koreksi arsitektur di atas.

---

## Hasil cek terbaru: T0 sudah sebagian, masih perlu koreksi

Sudah benar: integration suite memanggil validator sebelum membuat client, URL diberikan eksplisit ke kedua client, cleanup menjaga client yang belum dibuat, dan Jest unit mengecualikan integration. `npm.cmd test -- --listTests --runInBand` mengonfirmasi integration tidak tercantum. Build lulus; empat suite yang diperiksa (validator, callback, worker, admin protection) menghasilkan 102 tes lulus. Ini bukan hasil PostgreSQL nyata; integration tidak dijalankan pada audit ini.

**Selesaikan T0 dengan langkah berikut sebelum menyebutnya lulus penuh:**

1. Di `Backend/src/common/test-utils/test-db-validator.ts`, panggil validateAndGetTestDatabaseUrl di dalam createTestPrismaClient sebelum `new PrismaClient`. Nama parameter validatedUrl tidak menjamin input sudah tervalidasi. Reproduksi tanpa koneksi DB menunjukkan factory masih menerima URL outletpulsa_db. Pemanggil integration saat ini sudah memvalidasi dahulu; temuan ini adalah kelemahan factory reusable, bukan bukti integration sekarang memakai DB aplikasi.
2. Di spec validator, ganti assertion `_engineConfig?... || validUrl`. Fallback tersebut membuat tes tetap lulus meskipun URL datasource tidak disuntikkan. Mock constructor PrismaClient dan assert dipanggil dengan `{datasources:{db:{url: expectedUrl}}}`. Untuk URL hilang/aplikasi/host salah, assert constructor dan metode koneksi/mutasi tidak pernah dipanggil. Jangan mengandalkan private field Prisma.
3. Jangan sertakan connection string dalam pesan error. maskDatabaseUrl hanya mengganti password userinfo, tetapi query masih dicetak utuh. Reproduksi dengan query `password=FAKE_QUERY_SECRET` pada host ditolak menunjukkan secret muncul di pesan. Gunakan pesan generik dan metadata aman seperlunya. Tambahkan tes query sensitif/fragment/malformed URL; jangan mencetak fixture secret ke output.
4. Tambahkan jalur migration test yang memakai validator sama dan URL test eksplisit pada child process. Saat ini hanya ada test:integration; belum ada bukti migration test memakai target tervalidasi. Tolak URL sebelum spawn migration. Jangan mengubah .env aplikasi atau menjalankan migration pada DB aplikasi. Unit-test env child process/argumen melalui mock spawn; integration migration hanya dijalankan bila DB test tersedia.
5. Allowlist nama sebaiknya tetap eksplisit outletpulsa_c2_test sampai pola tambahan disetujui. Jangan menyebut semua nama berakhiran `_test` otomatis terisolasi. Tolak parameter URL yang dapat mengubah target bila tidak diperlukan, bukan meneruskan konfigurasi ambigu.
6. Jalankan unit validator, tes relevan, dan build. Laporkan integration sebagai belum dijalankan bila DB test tidak tersedia. Setelah T0 dikoreksi, kerjakan T1 saja; jangan langsung T2–T9.

T1 belum dikerjakan pada pemeriksaan ini: DIRECT_WEBHOOK masih ada, PENDING_CONTRACT_VERIFICATION hanya ditemukan di komentar schema, dan lease_token belum tersedia. Jangan menilai pekerjaan T0 sebagai penyelesaian keseluruhan C2.

---

Dokumen ini menerjemahkan pemeriksaan keenam pada REVIEW-2026-09-23-FOLLOWUP.md menjadi tugas kecil yang dapat diuji. Status saat dokumen dibuat: build dan 153 tes mock lulus, tetapi persyaratan C2 belum terpenuhi. Jangan memakai jumlah tes sebagai bukti keamanan DB atau kontrak provider.

## Cara menjalankan tugas

Kerjakan satu ID tugas per sesi, berurutan T0 sampai T9. Baca hanya bagian tugas aktif, status audit keenam, dan file target terlebih dahulu. Pertahankan perubahan pengguna. Jangan reset DB, mengedit migration terpasang, atau menghubungi provider produksi. Jangan menambahkan flag env yang mengesahkan autentikasi yang belum terbukti.

Setiap sesi: baca kode -> tulis regression test -> jalankan dan pastikan gagal karena bug yang dimaksud -> perbaiki -> jalankan tes relevan dan build -> laporkan hasil. Jika assertion berubah karena perilaku baru yang memang diminta, jelaskan perubahan; jangan menghapus cakupan agar tes hijau. Bila prasyarat belum selesai, laporkan secara spesifik dan jangan menebak.

## T0 — Amankan target pengujian sebelum menjalankan integration

**Buka:** `Backend/src/api/webhook/linkqu-c2-postgres.integration.spec.ts`, `Backend/package.json`, konfigurasi Prisma/Jest. Jangan membuka atau mencetak secret .env ke laporan.

1. Buat helper validasi TEST_DATABASE_URL yang berjalan sebelum PrismaClient dibuat dan sebelum migration/cleanup. Tanpa variabel tersebut, suite integration harus gagal dengan pesan konfigurasi, bukan fallback DATABASE_URL dan bukan skip yang dilaporkan pass.
2. Parse URL tanpa mencetak password. Izinkan hanya host test yang eksplisit dan nama DB `outletpulsa_c2_test` atau pola test khusus yang disepakati. Tolak `outletpulsa_db`, nama aplikasi/produksi, serta URL ambigu. Host localhost saja tidak menjamin DB aman.
3. Berikan URL tervalidasi secara eksplisit ke dua PrismaClient. Semua setup/cleanup memakai client tersebut. Jangan membuat client default tersembunyi melalui PrismaService.
4. Pisahkan script/config unit dari integration agar perintah unit umum tidak mengeksekusi integration spec. Tambahkan script khusus integration yang menjalankan helper tersebut. Pastikan perintah Prisma migration test memakai URL test yang sama pada environment proses khusus, bukan mengubah .env aplikasi.
5. Cleanup hanya fixture/DB test terverifikasi. Jangan menulis logika hapus database generik. Jangan menjalankan tes sampai target test telah disediakan dan diperiksa.
6. Unit-test helper dengan URL hilang, URL aplikasi, host tidak diizinkan, dan URL test sah. Assert koneksi/mutasi belum dipanggil pada input ditolak.

**Lulus T0:** salah konfigurasi berhenti sebelum akses DB; unit test tidak menyentuh integration; bila DB test belum tersedia, tulis “integration belum dijalankan”.

## T1 — Tutup dua jalur kredit tanpa bukti kontrak

**Buka:** `webhook.service.ts::handleLinkQuCallback`, `linkqu-callback-worker.service.ts::processInboxItem`, `linkqu-verifier.ts`, kedua spec callback/worker, dan `webhook.module.ts` di `Backend/src/api/webhook`.

1. Cari seluruh pemanggilan member.update dan ledger.create pada alur callback LinkQu. Ada dua implementasi settlement: handler HTTP dan worker. Keduanya wajib ditahan.
2. Pisahkan hasil validasi struktur/HMAC legacy dari otorisasi provider. Saat kontrak belum tersedia, hasil tahap otorisasi selalu “belum terverifikasi”; tidak ada cabang production yang mengubahnya menjadi authorized berdasarkan boolean request/env.
3. Simpan callback yang lolos pemeriksaan lokal ke inbox dengan status `PENDING_CONTRACT_VERIFICATION`, penjelasan alasan, dan tanpa lease aktif. Jangan ubah gateway/deposit/saldo/ledger dari event ini, termasuk FAILED/EXPIRED. Jangan mengirim FCM sukses/gagal pembayaran dari event tertahan.
4. Worker yang menemukan event lama PENDING/PROCESSING juga melewati pemeriksaan yang sama dan menahannya. Jangan hanya menahan event baru di HTTP.
5. Tambahkan service bersama untuk keputusan proses inbox (misalnya `linkqu-callback-processor.service.ts`); handler cukup ingestion. Hapus settlement langsung lama setelah cakupannya dipindahkan. Jangan membuat service bersama yang masih dapat dilewati handler.
6. Untuk kasus tidak lolos parser, tolak tanpa mutasi finansial. Bedakan signature invalid dari key/kontrak belum tersedia; kasus belum dapat diverifikasi tidak dinyatakan pembayaran gagal. Dokumentasikan batasan HTTP acknowledgment, karena kontraknya belum terbukti.
7. Tes handler HTTP dan worker dengan signature fixture legacy valid, ref lokal sah, serta status SUCCESS: assert event tertahan, member/ledger/gateway/deposit tidak berubah, tidak ada notifikasi sukses. Tambahkan FAILED dan EXPIRED. Tes provider lokal bukan LINKQU juga tidak boleh settlement.
8. Tes settlement lama tidak dibuang. Pindahkan cakupan transaksi finansial ke primitive settlement dengan adapter test-only yang di-inject pada TestModule; jangan daftarkan adapter itu pada WebhookModule produksi.

**Lulus T1:** nol kredit melalui kedua pintu tanpa kontrak. Ini proteksi sementara yang benar; A1 tetap belum selesai sebagai integrasi provider. Saldo deposit otomatis akan tertahan sampai adapter resmi terbukti tersedia; tuliskan dampak ini di laporan.

## T2 — Perbaiki schema dan bukti historis

**Buka:** `Backend/prisma/schema.prisma`, migration `20260923170000_add_linkqu_c2_hardening`, laporan kandidat.

1. Tentukan apakah migration sudah terpasang dari metadata migration pada target yang diizinkan, atau informasi pengguna. Jika tidak diketahui, anggap mungkin terpasang dan jangan mengeditnya. Jangan menyebut “belum di-commit” sebagai bukti belum terpasang.
2. Tambahkan migration baru untuk lease_token UUID/string, credential_version/verifier_version/verification_state yang diperlukan. Tambahkan index pemulihan PROCESSING/locked_until. Ubah FK ledger menjadi RESTRICT agar bukti tidak hilang diam-diam.
3. Gunakan settlement_ref stabil berdasarkan deposit lokal untuk settlement baru. Jangan mengganti ref historis yang sudah dipakai tanpa strategi kompatibilitas yang diuji.
4. Backfill yang benar memerlukan provider LINKQU, gateway/deposit sukses, `rs.riwayat_transaksi_id = rd.riwayatTransaksiId`, member cocok, jenis kredit cocok, dan nominal sesuai aturan yang terbukti. Member + nominal sama saja tidak cukup. Periksa hanya satu pasangan dari sisi gateway DAN ledger.
5. Jika arti nominal/ref ledger belum cukup terbukti, jangan backfill pasangan itu. Buat laporan read-only; NULL lebih tepat daripada kaitan tebakan.
6. Untuk mapping lama yang mungkin salah, buat laporan kandidat dan SQL koreksi terpisah yang dapat ditinjau. Jangan otomatis menghapus ledger, mengubah saldo, atau memutus mapping yang belum terbukti salah. Jangan menjalankan ulang migration lama pada DB aplikasi.
7. Uji pada DB test: ledger transaksi lain dengan member/nominal sama tidak terhubung; provider lain tidak terhubung; satu ledger tidak dipasangkan dengan dua gateway; relasi FK invalid ditolak; deletion ledger tertaut ditolak.

**Lulus T2:** migration baru tervalidasi pada DB test, tanpa perubahan saldo; pasangan ambigu tetap ditandai untuk review. Laporkan backfill belum terverifikasi jika DB test belum tersedia.

## T3 — Deduplikasi dan bukti replay yang konsisten

**Buka:** ingestion di `webhook.service.ts`, verifier, model inbox, spec callback.

1. Buat fungsi ekstraksi signature/header yang sama untuk ingestion dan replay. Simpan hanya header autentikasi yang diperlukan, bukan JSON.stringify(req.headers) seluruhnya. Jangan menyimpan cookie/token pengguna/secret server.
2. Identitas merchant berasal dari konfigurasi akun lokal yang stabil, bukan body yang dipercaya begitu saja. Simpan versi kredensial yang digunakan, bukan nilai secret.
3. Gunakan event ID provider bila ada kontrak keunikannya. Sebelum itu, hash fingerprint internal menggunakan serialisasi array/object kanonik yang jelas; jangan klaim hash internal adalah identitas event resmi. Normalisasi amount/status hanya sesuai aturan yang terdokumentasi. Pisahkan perubahan signature dari identitas pembayaran.
4. Atomic insert; bila P2002, periksa bahwa constraint yang konflik memang event hash/event ID. Baca event lama, cocokkan payload identitas, dan tangani statusnya. P2002 ledger atau constraint lain tidak boleh dianggap duplicate callback biasa.
5. Duplikat event tertahan tetap tertahan; jangan mengubahnya menjadi PROCESSED. Event SUCCESS vs FAILED adalah event berbeda dan konflik tetap tersimpan.
6. Replay menggunakan versi key sesuai kebijakan rotasi. Key tidak tersedia/dicabut -> review tanpa kredit, bukan fallback ke key yang salah lalu pembayaran dianggap gagal. Selama A1 belum tersedia, seluruh event masih tertahan.
7. Tes duplikat paralel, signature header vs body, event berbeda status, duplicate event ID dengan payload berbeda, rotasi key, dan tidak adanya cookie/Authorization pada data tersimpan.

**Lulus T3:** event berbeda tidak hilang; duplikat tidak memicu kredit; data tersimpan cukup untuk penelusuran tanpa secret yang tidak diperlukan.

## T4 — Lease worker yang benar dan retry terbatas

**Buka:** `linkqu-callback-worker.service.ts`, worker spec, integration spec.

1. Setiap klaim menghasilkan lease_token baru, walaupun workerId sama. PENDING hanya eligible jika next_retry_at sudah lewat; PROCESSING hanya jika locked_until kedaluwarsa. Ulangi predicate lengkap pada conditional UPDATE, bukan hanya pada findMany.
2. Gunakan waktu DB untuk expiry. Klaim atomik dengan row lock/SKIP LOCKED atau conditional UPDATE setara. Jangan memakai waktu `now` di awal fungsi untuk semua check setelah awaits.
3. Setiap update hasil harus mencocokkan id, PROCESSING, lease_token, dan lease aktif. locked_by hanya untuk diagnosis. Token lama tidak boleh mengubah status, retry, conflict, atau saldo.
4. Settlement mengunci/check inbox pada transaksi yang sama dengan mutasi finansial. Count nol -> throw supaya seluruh transaksi rollback. Jangan return setelah saldo terlanjur berubah.
5. Jika durasi kerja melebihi lease, gunakan renewal dengan token/check aktif atau batalkan hasil. Jaringan dilakukan di luar transaksi DB. Matikan timer pada destroy dan hindari loop ganda.
6. Pisahkan error sementara (DB/jaringan/ref belum ada), error permanen, konflik, dan kontrak belum tersedia. Error sementara menaikkan retry_count, menjadwalkan exponential backoff + jitter, lalu manual review pada batas. Kontrak belum tersedia tidak menghabiskan retry hanya karena menunggu.
7. Bila DB mati sehingga retry tidak dapat disimpan, lease expiry menjadi recovery. Jangan catch settlement lalu selalu PENDING dengan retry_count tetap.
8. Tes token lama dengan workerId sama, expiry saat await, takeover dua worker, next_retry_at dipindah ke masa depan sesudah read, permanent error tidak berulang tanpa batas, dan restart PROCESSING expired.

**Lulus T4:** seluruh update dilindungi token; worker lama tidak dapat commit; retry tidak berputar tanpa batas. Buktikan pada PostgreSQL setelah T0.

## T5 — Satu primitive settlement dan klaim deposit

**Buka:** service processor bersama dari T1, handler/worker, spec transaksi DB.

1. Primitive hanya menerima hasil adapter provider internal; bukan boolean dari request. Pada produksi tanpa adapter terbukti, primitive tidak dapat dicapai. Adapter test-only hanya ada pada TestModule.
2. Dalam satu transaksi dengan urutan lock konsisten: validasi token inbox -> klaim gateway PENDING -> baca/validasi deposit/member terkini -> klaim deposit proses -> increment -> create ledger unique -> kaitkan gateway -> tandai event spesifik selesai.
3. Klaim deposit wajib updateMany dengan filter id + status proses; count nol throw/konflik tanpa kredit. Jangan memakai `tx.requestDeposit` hasil read sebelum transaksi sebagai satu-satunya bukti status/member.
4. Relasi/member/nominal invalid membuat rollback. Tolak reference_type yang belum didukung, jangan gateway SUCCESS tanpa ledger.
5. Ledger unique conflict harus rollback; setelah itu baca bukti settlement yang sudah ada untuk menentukan duplikat vs anomali. Jangan sekadar catch dan return sukses.
6. SUCCESS terlambat setelah FAILED/EXPIRED dan FAILED setelah SUCCESS harus tercatat sebagai konflik durable sesuai kebijakan; jangan menimpa dana. Penandaan event dan catatan konflik atomik.
7. Tidak boleh mengirim notifikasi sukses pada replay tanpa settlement baru. Outbox notifikasi F1 tetap pekerjaan tersendiri; jangan menyebut notifikasi tahan restart sebelum outbox dibuat.
8. PostgreSQL test fault sesudah gateway claim, setelah increment, setelah ledger, sebelum PROCESSED: assert gateway/deposit/saldo/ledger/inbox kembali ke state sebelum transaksi. Retry dengan adapter test-only menghasilkan satu kredit.

**Lulus T5:** satu primitive teruji DB; handler/worker tidak punya implementasi finansial duplikat. Ini tidak mengesahkan kontrak A1.

## T6 — Tutup penulis deposit lain

**Buka:** `Backend/src/administrator/deposit/deposit.service.ts::updateStatus`, `deposit-admin-protection.spec.ts`, `Backend/src/api/deposit/deposit.service.ts::processLinkquDeposit` dan spec create deposit.

1. Pada deposit terkait LinkQu, tolak admin status sukses DAN gagal melalui jalur biasa. Saat ini guard hanya memeriksa sukses. Test kedua status untuk gateway PENDING/SUCCESS/FAILED.
2. Pertahankan perilaku manual deposit non-gateway yang sah. Guard sekarang juga menyentuh tripayReference; uji perilaku existing atau batasi perubahan sesuai scope, jangan mengubah provider lain tanpa penilaian.
3. Pemeriksaan gateway dan perubahan deposit harus memakai protokol lock yang sama dengan pembuatan/pengaitan gateway. Baca create yang sudah membuat request+gateway dalam transaksi, lalu tentukan cara mencegah celah pengaitan belakangan. Jangan cukup findFirst di luar lock.
4. Jalur create failure saat ini mengupdate gateway/deposit terpisah. Buat atomik dan conditional agar tidak menimpa settlement final. Timeout ambigu tidak otomatis final gagal; rekonsiliasi create lengkap tetap E3.
5. PostgreSQL barrier test: admin gagal dulu/callback dulu, admin sukses dulu/callback dulu, dan create failure vs settlement. Gunakan adapter test-only untuk jalur kredit. Assert status konsisten dan satu ledger/kredit maksimal.

**Lulus T6:** tidak ada admin biasa yang menimpa invoice LinkQu; seluruh transisi terkait memakai klaim yang konsisten.

## T7 — Laporan kandidat yang tidak menyembunyikan anomali

**Buka:** `administrator/transaksi_linkqu/transaksi_linkqu.service.ts`, controller, spec, `administrator/common/strategies/jwt.strategy.ts`, model permission yang tersedia.

1. Jangan menganggap settlement_ledger_id terisi otomatis bukti benar. Periksa member, jenis, nominal, referensi transaksi, settlement_ref dan relasi deposit. Mismatch masuk kategori ambigu/anomali.
2. Ledger historis tanpa link diperiksa dengan aturan yang sama. Jangan menerima amount ATAU nominal tanpa aturan kontrak; bila tidak terbukti, laporkan ambigu.
3. Gunakan query/paging terukur di DB; jangan mengambil semua gateway SUCCESS plus seluruh riwayat saldo untuk kemudian slice array. Total dan item harus mengikuti filter kategori yang sama.
4. Validasi page/limit/category, limit maksimum, dan pilih hanya data yang dibutuhkan. Jangan mengembalikan seluruh member/saldo/nomor jika tidak diperlukan laporan.
5. Tambahkan pemeriksaan permission baca laporan sesuai mekanisme proyek. Bila belum ada guard reusable, buat guard minimal dengan lookup izin existing; jangan menganggap adanya JWT otomatis memberi izin semua laporan.
6. HTTP test: tanpa token ditolak, member ditolak, admin tanpa izin ditolak, admin berizin diterima. Service test: ledger tertaut milik member lain/nominal salah tetap kandidat, mapping valid bukan kandidat, nol mutation.
7. Perbarui `doc/issue/audit-kandidat-uncredited-linkqu.md` dengan route aktual dan kategori faktual; tidak boleh auto-credit.

**Lulus T7:** tautan ledger salah tidak menghilangkan kandidat; endpoint berizin dan query tidak memuat semua data tanpa batas.

## T8 — Verifikasi gabungan dan status C2

1. Jalankan unit/regression dengan path eksplisit agar suite DB tidak terseret. Contoh dari Backend:

```powershell
npm.cmd test -- --runInBand --silent --runTestsByPath src/api/webhook/linkqu-callback.spec.ts src/api/webhook/linkqu-callback-worker.spec.ts src/administrator/deposit/deposit-admin-protection.spec.ts src/administrator/transaksi_linkqu/transaksi_linkqu.service.spec.ts
npm.cmd run build
```

2. Jalankan suite PostgreSQL melalui script aman T0 setelah DB test tervalidasi. Perintah ini tidak boleh fallback DB aplikasi. Lampirkan jumlah kasus benar-benar dieksekusi; jelaskan setiap skip.
3. Lengkapi integration dengan migration/backfill, dedup dua koneksi, fencing, restart, fault transaction, dan callback-vs-admin. Assertion harus membaca state committed melalui koneksi DB lain.
4. Jalankan enam suite terkait transaksi/refund/create/FCM/WAPI lainnya sesuai file proyek. Jangan menjalankan provider atau mengirim notifikasi nyata; gunakan adapter transport mock.
5. Baca diff akhir dan cari sisa `DIRECT_WEBHOOK`, pemeriksaan kepemilikan hanya workerId, `new PrismaClient()` default pada integration, serta jalur increment di luar primitive. Setiap sisa harus dijelaskan atau diperbaiki.
6. Laporkan “C2 infrastruktur selesai, settlement tertahan menunggu A1” hanya jika bukti T0–T7 lengkap. Bila PostgreSQL belum berjalan, tulis belum terverifikasi, jangan lulus penuh.

## T9 — Pekerjaan B2 yang tetap terpisah

Setelah koreksi C2, kembali ke pemeriksaan kelima/keenam untuk B2. Jangan menyatakan B2 selesai karena ledger settlement C2 unique; refund adalah alur lain.

1. Tambahkan test finalizer tanpa bukti debit: refundAmount 0 dan notifikasi tidak boleh mengatakan saldo dikembalikan.
2. Simpan kebutuhan rekonsiliasi/refund terpisah secara durable; jangan membuka status transaksi final untuk mencoba refund ulang.
3. Kaitkan refund dengan bukti debit/nominal yang benar, perbaiki snapshot debit dari hasil mutasi atomik, dan klaim refund dengan constraint/identitas unik sendiri.
4. Uji PostgreSQL refund bersamaan serta fault setelah increment; teruskan konflik Digiflazz yang masih early-return dan await pencatatan wajib.
5. Pekerjaan D–H tetap memakai instruksi paket aslinya, satu sesi per subpaket.

## Format laporan wajib per sesi

```text
Tugas: Tn
File diubah:
Bug yang ditangkap regression test:
Perintah tes dan hasil (jumlah pass/fail/skip):
PostgreSQL: dijalankan / belum; target test tersamarkan tanpa kredensial:
Migration: baru / belum diterapkan / diterapkan hanya pada DB test:
Kriteria yang sudah terbukti:
Kriteria yang belum terbukti dan alasannya:
Dampak operasional (termasuk settlement tertahan):
Tugas berikut:
```

## Prompt siap salin

> Baca `doc/issue/LANGKAH-PERBAIKAN-C2.md` dan status audit keenam pada `doc/issue/REVIEW-2026-09-23-FOLLOWUP.md`. Kerjakan **T0 saja**. Periksa working tree, pertahankan perubahan pengguna. Jangan menjalankan integration test lama atau menghubungkan PrismaClient default ke DB aplikasi. Tambahkan regression test, perbaiki sesuai langkah, jalankan tes yang aman, lalu laporkan dengan format wajib. Jangan menyatakan C2/A1 selesai. Jika DB test belum tersedia, tetap selesaikan helper isolasi dan unit test, lalu laporkan integration belum dijalankan.

Pada sesi berikut, ganti T0 dengan T1, dan seterusnya. Jangan memberikan semua tugas sekaligus kepada AI pelaksana.
