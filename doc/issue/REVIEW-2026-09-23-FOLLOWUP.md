# Audit lanjutan implementasi review 23 September 2026

**Verifikasi T1 terbaru:** build gagal TS2345 di webhook.service.ts:772 (configuredClientId nullable tidak cocok parameter processor). Dua suite callback/worker: 92 tes lulus. Ini bukan kelulusan build ataupun PostgreSQL. Perbaiki nullable tanpa cast any dan ulangi build.

**Update pemeriksaan T1:** penahanan callback melalui processor sudah ada dan adapter test-only tidak terdaftar di WebhookModule. Namun operasi finansial justru dipindahkan ke adapter test-only, belum ke service settlement aplikasi asli seperti rencana revisi. Otorisasi masih berdasarkan keberadaan adapter, guard perubahan hold worker melemah, dan constructor integration test belum diperbarui. Koreksi langkah demi langkah tersedia pada bagian paling atas [LANGKAH-PERBAIKAN-C2.md](LANGKAH-PERBAIKAN-C2.md). T1 belum lulus penuh; catatan lama tentang kredit otomatis aktif kini digantikan oleh kondisi hold tanpa adapter ini.

**Update setelah pengerjaan T0:** pemisahan Jest unit/integration dan URL Prisma eksplisit sudah benar. T0 masih perlu koreksi factory validator, assertion tes yang selalu lulus lewat fallback, redaksi error URL, serta jalur migration test aman. Langkah koreksi rinci ada di bagian atas [LANGKAH-PERBAIKAN-C2.md](LANGKAH-PERBAIKAN-C2.md). Audit terbaru: build lulus, empat suite/102 tes lulus; PostgreSQL tidak dijalankan. T1–T9 belum dinyatakan selesai; temuan keenam tetap berlaku kecuali pemilihan URL client integration yang kini telah diperbaiki.

**Panduan eksekusi terbaru:** [LANGKAH-PERBAIKAN-C2.md](LANGKAH-PERBAIKAN-C2.md). Berikan AI pelaksana satu tugas T0–T9 per sesi. Panduan berisi file target, urutan perubahan, kasus uji, kriteria selesai, dan format laporan. Mulai T0 lalu T1; jangan mulai dengan menjalankan seluruh Jest karena integration test lama memakai database aplikasi.

## Status aktif — pemeriksaan keenam setelah implementasi C2

**Belum benar seluruhnya; C2 belum memenuhi rencana revisi.** Bagian ini menjadi acuan aktif, bagian audit sebelumnya merupakan riwayat. Ada inbox persisten, unique settlement_ref pada ledger, foreign key gateway-ledger, worker terdaftar, dan laporan kandidat tanpa auto-credit. Namun penghambat berikut masih ditemukan melalui pembacaan kode.

### Tugas koreksi prioritas, satu tugas per sesi

1. **P0 — Penahanan A1 tidak diimplementasikan.** Handler `webhook.service.ts::handleLinkQuCallback` dan `linkqu-callback-worker.service.ts::processInboxItem` sama-sama tetap mengkredit setelah verifier HMAC asumsi lolos. PENDING_CONTRACT_VERIFICATION hanya ditemukan pada komentar schema, bukan transisi handler/worker. Worker bahkan tidak memeriksa `tx.provider === 'LINKQU'`, berbeda dari handler. **Perbaiki:** satu pipeline bersama, event ditahan tanpa mutasi finansial sebelum adapter provider terbukti; verifikasi provider/merchant/ref pada kedua pintu. Jangan memasang flag untuk mengesahkan asumsi. Tes signature legacy valid tanpa kontrak harus menghasilkan nol kredit di HTTP maupun worker; tes transaksi provider lain ditolak. Ini syarat wajib rencana, bukan tambahan scope baru.
2. **P0 — Tes PostgreSQL belum terisolasi.** `linkqu-c2-postgres.integration.spec.ts::beforeAll` membuat dua `new PrismaClient()` tanpa URL test eksplisit; komentar menyebut outletpulsa_db. Tes menulis member/ledger dan memanggil claimBatch tanpa filter test sehingga dapat mengambil inbox aplikasi yang tersedia pada DB target. **Perbaiki sebelum menjalankan:** TEST_DATABASE_URL wajib, nama/host DB test tervalidasi, tanpa fallback DATABASE_URL aplikasi. Migrasi/cleanup hanya pada DB terisolasi. Tambahkan guard gagal sebelum koneksi/mutasi bila konfigurasi salah. Audit ini sengaja tidak menjalankan suite tersebut; ini bukan hasil lulus/skip PostgreSQL.
3. **P0 — Backfill dapat mengaitkan ledger transaksi lain.** Migration `20260923170000_add_linkqu_c2_hardening/migration.sql` mencocokkan rs.member_id, status deposit, dan nominal pg.amount, tetapi tidak `rs.riwayat_transaksi_id = rd.riwayatTransaksiId`; provider LINKQU juga tidak difilter. Satu ledger top-up lain dengan nominal sama dapat dianggap bukti pembayaran invoice ini. Dua gateway bisa memilih satu ledger sehingga unique index menggagalkan backfill. **Perbaiki:** join berdasarkan referensi transaksi/deposit yang terbukti, member/jenis/nominal benar, filter provider, dan keunikan dua arah. Data ambigu tetap NULL dengan laporan read-only. Uji ledger member sama/nominal sama/referensi berbeda, provider lain, dan satu ledger untuk dua gateway. Jika migration sudah terpasang, jangan edit file itu; buat migration koreksi setelah audit mapping yang salah, tanpa mengubah saldo otomatis. FK saat ini ON DELETE SET NULL juga berbeda dari rencana RESTRICT; pertahankan bukti relasi lewat migration tambahan bila sudah terpasang.
4. **P1 — Fencing/retry tidak mengikuti rencana.** Schema/worker tidak punya lease_token per klaim; hanya workerId. `now` dihitung di awal processInboxItem lalu dipakai lagi setelah awaits sehingga pemeriksaan lease memakai waktu lama. Handler DIRECT_WEBHOOK melakukan update inbox berdasarkan id tanpa fencing. Catch settlement mengembalikan PENDING tanpa backoff/increment retry sehingga error permanen berulang terus. Claim kedua juga tidak mengulang syarat next_retry_at. **Perbaiki:** token unik tiap klaim, waktu DB/check status PROCESSING, predicate klaim lengkap, pipeline worker bersama tanpa settlement langsung terpisah, dan throw/rollback saat token tidak cocok. Terapkan retry terbatas/jitter/manual review untuk error sementara, bukan hanya ref hilang. Tes instance sama dengan token lama, lease kedaluwarsa saat await, handler vs worker, dan permanent failure tidak berputar tanpa batas.
5. **P0/P1 — Jalur deposit belum terkunci konsisten.** Admin hanya menolak `dto.status === 'sukses'`; penolakan gagal invoice gateway masih diizinkan (`administrator/deposit/deposit.service.ts:314`). Handler/worker masih membaca relasi deposit sebelum transaksi dan melakukan requestDeposit.update berdasarkan id tanpa conditional status. **Perbaiki:** tolak sukses DAN gagal lewat admin biasa untuk invoice gateway sesuai rencana; pemeriksaan dan pengaitan gateway memakai protokol atomik yang sama. Settlement harus mengklaim deposit proses dengan count yang diperiksa, dalam transaksi bersama gateway/ledger/inbox. Uji admin menolak vs callback, serta create-failure vs callback pada PostgreSQL nyata, kedua urutan. Jangan memperluas perubahan provider lain tanpa menguji dampaknya (guard baru juga mencakup tripayReference).
6. **P1 — Bukti verifikasi dan data inbox belum sesuai.** Headers disimpan seluruhnya dari req.headers; worker hanya memakai kredensial aktif sehingga key rotation dapat mengubah event sah tertunda menjadi FAILED. Hash memakai signature body meskipun autentikasi bisa lewat header; P2002 langsung dianggap duplikat tanpa membaca status/payload atau nama constraint. **Perbaiki:** allowlist header, identitas akun lokal stabil, serialisasi kanonik/event ID sesuai kontrak, dedup conflict spesifik, versi kredensial/verifier dan kebijakan key hilang/revoked -> review. Jangan menyimpan token/cookie yang tidak diperlukan. Semua perbedaan status final harus menjadi konflik durable, bukan PROCESSED tanpa pemeriksaan (misalnya gateway SUCCESS menerima FAILED).
7. **P1 — Laporan bisa menyembunyikan mapping salah.** `getUncreditedCandidates` menganggap adanya settlement_ledger_id cukup tanpa memvalidasi member/nominal/jenis/ref ledger tertaut. Backfill salah pada poin 3 dapat membuat kandidat menghilang. **Perbaiki:** validasi bukti ledger tertaut dan historis, kategorikan mismatch/ambigu, jangan menerima amount ATAU nominal tanpa kontrak. Query sekarang memuat seluruh SUCCESS sebelum slice pagination; batasi kerja DB dengan query/paging terukur. Tambahkan tes izin admin/permission, bukan hanya service read-only; controller baru hanya menunjukkan JwtAuthGuard, belum bukti permission laporan.

B2 masih mengirim “Saldo telah dikembalikan” saat refund nol dan memakai selisih saldo positif sebagai bukti debit; instruksi pemeriksaan kelima tetap berlaku. D–H belum selesai (Map idempotensi, key deposit dipotong, agregat FCM parsial, polling Mobile lama masih terlihat).

### Verifikasi audit keenam

- `npm.cmd run build`: lulus, exit 0.
- Sepuluh suite unit/regression eksplisit melalui --runTestsByPath: **153 tes lulus** (tujuh suite lama ditambah worker, laporan, dan proteksi admin). Tidak menjalankan integration spec secara tidak sengaja melalui pattern.
- PostgreSQL integration tidak dijalankan karena target belum terisolasi. Migration tidak diterapkan; provider dan Flutter tidak diuji.
- Lima kasus PostgreSQL yang tersedia belum membuktikan pipeline settlement lengkap, fault setelah saldo increment, penahanan A1, ataupun callback-vs-admin. Lengkapi suite sesuai rencana revisi; nama tes/constraint terisolasi saja bukan bukti keseluruhan transaksi.
- Temuan di atas berasal dari kode, bukan klaim reproduksi DB atau insiden produksi. Audit hanya memperbarui dokumen ini.

---

## Status aktif — pemeriksaan kelima, 23 September 2026

**Belum layak dinyatakan selesai. B2/C1 membaik, tetapi masih ada masalah refund, konsistensi antarjalur settlement, dan bukti verifikasi yang belum tersedia.** Bagian pemeriksaan sebelumnya adalah riwayat; gunakan status ini untuk pekerjaan berikut.

### Perubahan yang sudah tepat

- C1 sekarang memeriksa count klaim FAILED/EXPIRED: kalah klaim tidak menulis deposit. Klaim SUCCESS dibatasi PENDING; late success FAILED/EXPIRED dicatat untuk rekonsiliasi. Relasi deposit/member hilang pada jalur sukses DEPOSIT sekarang menyebabkan throw di transaksi.
- B2 menambahkan refund_id deterministik, migration baru/backfill, throw saat member wajib hilang pada refund positif, dan penerusan harga aktual callback/cek admin. Ini kemajuan, tetapi belum cukup membuktikan idempotensi refund dan keamanan data lama.
- Parser sekarang menolak null eksplisit pada response_code/rc/client_id; tes HTTP null dengan signature valid ditambahkan. Proteksi admin B1 tetap ada.

### Temuan tersisa dan instruksi koreksi

1. **P0 — A1 belum memenuhi syarat autentikasi yang terbukti.** Handler tetap mengkredit setelah HMAC asumsi lolos; dokumentasi fixture menyebut kontrak resmi belum tersedia. Instruksi A1 sebelumnya masih berlaku: buktikan kontrak atau verifikasi server-ke-server; tanpa itu jangan mengotorisasi settlement otomatis. Memperbaiki parser tidak menyelesaikan syarat ini.
2. **P0 — C1 masih memakai snapshot deposit dari luar transaksi.** Setelah klaim gateway, kode memakai `tx.requestDeposit` lalu `requestDeposit.update({where:{id}})` tanpa kondisi status. Jalur lain juga mengubah deposit: `Backend/src/administrator/deposit/deposit.service.ts::updateStatus` membaca proses, mengupdate tanpa klaim, dan menulis saldo absolut. Bila callback membaca pending, admin sukses/menolak lebih dahulu, lalu callback melanjutkan, snapshot callback tetap proses. Ini memungkinkan kredit kedua atau penimpaan keputusan admin; klaim gateway saja tidak melindungi jalur admin yang tidak mengklaim gateway. Ini temuan kode, belum reproduksi PostgreSQL. **Tugas:** satukan aturan settlement untuk semua penulis deposit, atau larang finalisasi manual invoice gateway pada jalur admin biasa. Klaim deposit secara bersyarat dalam transaksi yang sama; count nol tidak boleh meneruskan kredit. Baca relasi yang diperlukan secara konsisten. Uji barrier callback-vs-admin dan callback-vs-create-failure pada PostgreSQL, dua urutan, dengan satu kredit/ledger dan status selaras. Jangan hanya mengulang tes dua callback.
3. **P1 — Refund nol diklaim sudah dikembalikan.** `transaksi-finalizer.service.ts:181-211` menolak refund ketika bukti debit tidak ada, tetapi tetap final gagal; baris 314 selalu mengirim “Saldo telah dikembalikan”. Replay final gagal tidak mencoba refund lagi. **Tugas:** simpan status rekonsiliasi/refund terpisah secara durable; tanpa bukti jangan kredit, jangan mengklaim refund berhasil. Tambahkan tes nominal refund 0 dengan assertion isi notifikasi dan pekerjaan rekonsiliasi. Bila bukti ditemukan kemudian, gunakan jalur penyelesaian refund idempotent yang eksplisit, bukan membuka status transaksi.
4. **P1 — Bukti debit/constraint refund belum cukup kuat.** `saldo_sebelum > saldo_sesudah` hanya membuktikan selisih positif, bukan debit sejumlah `selling_price + fee_agen`; snapshot sebelum masih ditulis dari `currentSaldo` di luar transaksi pembelian. Unique refund_id pada baris Transaction mencegah ID sama di dua baris, tetapi menulis nilai sama kembali pada baris yang sama tidak konflik. Ledger `RiwayatSaldo.kode` masih tidak unique; tes menyuntikkan “Unique constraint on kode” yang belum ada di schema. **Tugas:** gunakan bukti debit yang terkait transaksi dan nominal, rapikan snapshot dari hasil debit atomik; buat klaim refund DB bersyarat serta identitas unik ledger/refund terpisah. Uji dua pembaca dengan refund_id null dan refund pertama sudah commit; pemenang tunggal saja boleh increment. Audit backfill berdasarkan member, nominal, dan jenis refund yang cocok; jangan menganggap sembarang ledger deposit terhubung sebagai bukti cukup. Jangan mengubah migration yang sudah terpasang; gunakan migration koreksi tambahan dan laporan kandidat ambigu.
5. **P1 — Konflik refund belum selalu durable.** Digiflazz masih early-return untuk transaksi final (`webhook.service.ts:261`) sebelum finalizer. Log konflik finalizer tidak di-await dan jalur kalah claim tidak mencatat konflik target berbeda. **Tugas:** teruskan konflik final Digiflazz ke pencatatan rekonsiliasi, simpan/await log yang wajib, dan catat konflik setelah kalah claim tanpa mutasi dana. Uji dua status final berbeda secara paralel dan kegagalan penyimpanan log. Validasi harga aktual finite/rentang yang sah di batas finalizer juga diperlukan; pemeriksaan `number && > 0` di pemanggil menerima Infinity.
6. **B1/B2/C1 belum terbukti dengan PostgreSQL.** Tes B2 bernama rollback hanya mengassert exception; mock `$transaction` langsung memanggil callback tanpa rollback state. Barrier C1 juga simulasi mock. **Tugas:** integration test DB terisolasi, dua koneksi, fault setelah klaim dan setelah saldo increment; assert status, refund_id, saldo dan ledger kembali ke kondisi awal saat error. Terapkan migration pada DB uji saja dan verifikasi constraint/backfill. Jangan mengklaim rollback/locking nyata dari nama tes.

C2 (ledger/inbox durable) dan D–H tetap belum selesai. Sampel kode masih menunjukkan Map idempotensi lokal, pemotongan key deposit, agregat FCM parsial Success, dan polling Mobile lama. Pertahankan perbaikan count/transition/null yang sudah benar; fokus pekerjaan berikut pada enam temuan di atas, satu tugas per sesi.

Verifikasi audit kelima: **build lulus, 7 suite / 136 tes lulus** dengan perintah tujuh suite yang tercatat pada pemeriksaan ketiga. Migration dibaca, tidak diterapkan; PostgreSQL/provider/Flutter tidak diuji. Temuan konkurensi di atas berasal dari jalur kode, bukan klaim insiden atau reproduksi DB. Audit hanya mengubah dokumen ini.

---

## Status terbaru — pemeriksaan keempat, 23 September 2026

**Belum selesai seluruhnya. Koreksi validasi A1 dan tes B1 sudah maju, tetapi penghambat finansial utama masih ada.** Bagian ini menjadi status aktif; pemeriksaan sebelumnya di bawah merupakan riwayat.

Sudah benar pada perubahan terbaru:

- `response_code: ["00"]`, `response_code: []`, dan `client_id: []` kini ditolak. Ketiganya diuji ulang langsung terhadap verifier dengan signature fixture valid.
- Label tes sudah menjadi fixture sintetis/internal; skenario autentikasi ENV dan client_id absen kini memakai relasi deposit/member lengkap.
- Mock admin mengabaikan undefined; tes keterangan tidak berubah dan expired -> proses ditolak sudah ditambahkan. Proteksi kode B1 tetap benar.

Belum selesai:

1. **A1/P0:** `webhook.service.ts::handleLinkQuCallback` tetap mengotorisasi kredit setelah HMAC asumsi lolos. Dokumentasi fixture masih menyatakan kontrak belum tersedia. Memperketat parser tidak membuktikan autentikasi provider. Kerjakan langkah 3 “Instruksi koreksi A1” di bawah: kontrak/fixture resmi atau verifikasi server-ke-server yang terbukti; selama belum tersedia, jalur belum terverifikasi tidak boleh mengotorisasi settlement finansial. Jangan mengklaim seluruh A1 selesai.
2. **C1/P0:** klaim sukses tetap `status: { not: 'SUCCESS' }`; jalur FAILED/EXPIRED masih tidak memeriksa count; relasi deposit/member hilang masih dapat meninggalkan gateway SUCCESS tanpa kredit. Menambah relasi pada setup tes autentikasi tidak memperbaiki handler. Kerjakan C1, termasuk regression count nol, relasi hilang, rollback, dan race dua koneksi.
3. **B1/verifikasi:** belum ditemukan integration test PostgreSQL untuk balapan yang diminta. Tes masih memakai Map dan callback `$transaction`. Lengkapi bukti DB nyata; jangan menulis ulang proteksi admin yang sudah benar.
4. **A1/coverage:** null pada response_code/client_id masih dianggap field absen; reproduksi `{ response_code: null, client_id: null }` menghasilkan `isValid: true` dengan signature fixture. Kontrak belum menetapkan apakah null dibolehkan. Dokumentasikan dan uji kebijakan null/missing secara eksplisit; jangan menyebut semua tipe invalid sudah tertutup. Matriks tes baru berupa pemanggilan service belum mencakup HTTP untuk input non-skalar tersebut. Tambahkan HTTP regression memakai signature fixture valid dengan assertion nol mutasi.
5. **B2 dan D–H:** identitas refund masih berbasis waktu; Map idempotensi lokal, key deposit dipotong, agregat FCM parsial Success, dan polling Mobile lama masih terlihat. Instruksi paket terkait tetap berlaku.

Urutan tugas konkret berikut: tuntaskan proteksi A1 yang belum terverifikasi; lengkapi integration test B1; lalu B2 dan C1/C2. Setiap tugas harus melaporkan kriteria yang belum terbukti. Jangan mengulang koreksi array/label fixture/mock undefined yang kini sudah benar.

Verifikasi terbaru: `npm.cmd run build` **lulus, exit 0**; tujuh suite relevan **112 tes lulus**. Uji langsung verifier membuktikan tiga array ditolak dan null masih diterima. PostgreSQL concurrency, kontrak provider eksternal, dan Flutter tidak diuji pada audit ini. Kode aplikasi/tes tidak diubah oleh audit.

---

## Status terkini setelah perubahan B1 (23 September 2026, pemeriksaan ketiga)

**Perbaikan kode B1 sudah tepat untuk menutup jalur admin membuka status final. Seluruh follow-up belum selesai.** Catatan ini menggantikan klaim di audit lama bahwa admin masih dapat membuka status final.

- `transaksi_pulsa.service.ts::updateStatus` kini menggunakan `updateMany` dengan filter `id` dan `status: 'proses'`; cabang tersebut hanya mengedit keterangan/waktu, tanpa membuka status final. Count nol dibedakan menjadi not-found atau conflict. Konflik hasil finalizer juga ditolak.
- `transaksi-pulsa-admin.spec.ts` menjalankan service admin dan finalizer asli dengan mock DB yang menyimpan state. Urutan gagal -> proses -> gagal dan sukses -> proses -> gagal sudah diuji, termasuk saldo dan jumlah ledger. Sepuluh tes admin baru lulus.
- **B1 belum memenuhi seluruh bukti verifikasi yang diminta:** tes balapan memakai Map in-memory dan `$transaction` yang langsung memanggil callback. Ini tidak membuktikan locking/rollback PostgreSQL. Tidak ditemukan integration test PostgreSQL untuk skenario B1 pada pencarian berkas audit ini.
- **A1 masih parsial:** verifier masih mengonversi response_code/client_id dengan String sebelum validasi tipe; otorisasi settlement masih bertumpu pada HMAC asumsi; tes masih memakai label “fixture resmi” serta relasi deposit null yang diharapkan sukses. Instruksi koreksi A1 di bawah tetap berlaku.
- **B2/C1/C2 belum selesai:** refund masih memakai identitas berbasis waktu dan belum memeriksa bukti debit; Linkqu sukses masih mengklaim `not: SUCCESS`, sementara jalur gagal mengabaikan count. B1 tidak menyelesaikan masalah tersebut.
- Penghambat D–H yang dicek masih terlihat: Map idempotensi lokal, key deposit dipotong 25 karakter, agregat notifikasi sukses parsial, token FCM dicetak, dan polling Mobile tanpa lifecycle.

### Tugas berikut untuk AI pelaksana

1. Pertahankan implementasi B1; jangan menulis ulang hanya karena paket lain belum selesai.
2. Lengkapi B1 dengan integration test PostgreSQL terisolasi memakai dua koneksi dan barrier. Uji kedua urutan: finalizer memegang klaim lebih dahulu lalu admin mencoba proses; admin mengedit keterangan lebih dahulu lalu finalizer selesai. Hasil wajib tetap final, refund/ledger maksimal satu. Jangan menganggap Promise.all dengan mock sebagai bukti DB.
3. Tambahkan kasus status expired -> proses ditolak, proses -> proses tanpa keterangan mempertahankan ket, serta transaksi tidak ditemukan. Mock saat ini memakai Object.assign sehingga nilai undefined dapat menimpa field, berbeda dari perilaku Prisma normal; sesuaikan mock agar mengabaikan undefined. Jangan menambah asumsi bahwa mock membuktikan rollback.
4. Jalankan build dan tujuh suite relevan termasuk `transaksi-pulsa-admin.spec`. Jika PostgreSQL belum tersedia, laporkan “kode B1 diperbaiki; verifikasi PostgreSQL belum selesai”, lalu lanjutkan koreksi A1/B2/C1 sesuai instruksi, tanpa mengklaim seluruh follow-up selesai.

Verifikasi pemeriksaan ketiga: `npm.cmd run build` lulus, exit 0. `npm.cmd test -- --runInBand --silent transaksi-pulsa-admin.spec transaksi-finalizer.spec transaksi-submit.spec linkqu-callback.spec deposit-linkqu.spec pengumuman-fcm.spec wapisender.spec` lulus: **7 suite, 92 tes**. PostgreSQL concurrency, kontrak provider dan Flutter tidak diverifikasi pada pemeriksaan ini. Audit hanya memperbarui dokumen; kode aplikasi/tes tidak diubah.

---

## Pemeriksaan ulang setelah perubahan A1 (23 September 2026)

**Status terbaru: A1 masih parsial, belum lulus. B1/B2/C1/C2 dan penghambat D–H belum dapat dinyatakan selesai.** Bagian audit awal di bawah dipertahankan sebagai riwayat; catatan ini menggantikan penilaian A1 dan hasil tes yang sudah berubah.

Yang sudah dikerjakan dengan benar:

- Verifier dipisah ke `Backend/src/api/webhook/linkqu-verifier.ts`.
- Signature dicek tepat 64 karakter hex sebelum decoding; suffix invalid ditolak.
- Validasi amount/ref/status dan konflik alias diperketat; environment key tes disimpan/dipulihkan.
- Tes HTTP melalui controller dan interceptor sudah ditambahkan untuk valid, invalid, ref hilang, serta DB error. Ini membuktikan perilaku aplikasi lokal, belum kontrak acknowledgment provider.
- Penerimaan alternatif amount/total_amount sudah dihapus. Akan tetapi, pemilihan `tx.amount` masih asumsi tanpa kontrak.

Temuan yang harus diperbaiki sebelum A1 dinyatakan selesai:

1. **P0 — Kredit masih diizinkan tanpa kontrak autentikasi yang terbukti.** Dokumen `doc/issue/fixtures/linkqu-callback-fixtures.md` menyatakan kontrak belum tersedia dan HMAC masih asumsi kode. Verifier tetap menghasilkan `isValid: true` berdasarkan rumus tersebut, lalu `webhook.service.ts:801` dapat masuk settlement. Ini belum memenuhi instruksi A1 “kontrak belum tersedia => jalur belum terverifikasi tidak dapat mengkredit”. Memindahkan rumus ke verifier dan menghitung fixture dengan OpenSSL hanya membuktikan konsistensi HMAC, bukan kontrak Linkqu. Jangan menyebut kondisi ini sudah fail-closed terhadap kontrak yang belum terbukti.
2. **P1 — Validasi response_code dan client_id masih melakukan coercion.** `linkqu-verifier.ts:131,177` menggunakan `String(...)` sebelum memeriksa tipe. Reproduksi lokal memakai fixture VA_SUCCESS dan key fixture menunjukkan `response_code: ["00"]`, `response_code: []`, serta `client_id: []` semuanya menghasilkan `isValid: true`. Array kosong menjadi string kosong dan melewati pemeriksaan. Reproduksi ini memakai signature fixture yang valid; bukan bukti bypass tanpa secret. Dokumentasi yang mengklaim response_code non-skalar ditolak tidak sesuai implementasi.
3. **P1 — Fixture sintetis diberi label resmi pada tes.** `linkqu-callback.spec.ts:593` bernama “fixture resmi VA_SUCCESS”, padahal file fixture sendiri mengakui tidak bersumber dari kontrak resmi. Ubah istilah menjadi fixture sintetis/internal dan jangan jadikan tes tersebut bukti kelulusan kontrak.
4. **P0 lintas C1 — Tes baru mengharapkan sukses meskipun relasi deposit hilang.** Skenario ENV fallback dan client_id absen menggunakan `requestDeposit: null` lalu mengharapkan response 00 (`linkqu-callback.spec.ts:182,564`). Handler mengklaim gateway SUCCESS tanpa deposit/kredit. Gunakan relasi lengkap untuk menguji autentikasi; tambahkan tes terpisah bahwa relasi wajib hilang menyebabkan rollback/tidak ada settlement sukses pada C1.

Penghambat lama yang masih terlihat: admin `updateStatus` tetap update tanpa syarat (`transaksi_pulsa.service.ts:249`); klaim sukses masih `not: SUCCESS` (`webhook.service.ts:809`); jalur gagal masih mengabaikan count (`webhook.service.ts:889`). Map idempotensi lokal, pemotongan key deposit, agregat FCM Success parsial, dan log token Mobile juga masih ada. Jangan menganggap perubahan A1 menyelesaikan paket lain. Bila tugas pelaksana hanya A1, paket lain dicatat sebagai pekerjaan berikutnya, bukan pelebaran scope A1.

### Instruksi koreksi A1 untuk sesi berikut

1. Pertahankan validasi dan tes baru yang sudah benar. Tambahkan regression test verifier serta handler/HTTP untuk `response_code`, `rc`, dan `client_id` berupa array, object, boolean, null, string kosong/whitespace. Definisikan optional vs required berdasarkan kontrak; nilai non-skalar yang hadir harus ditolak sebelum konversi. Setiap penolakan harus mengassert nol mutasi gateway/deposit/saldo/ledger.
2. Ganti label fixture resmi dengan sintetis/internal. Dokumentasikan aturan yang masih asumsi, termasuk nominal, autentikasi merchant dan acknowledgment. Jangan mengklaim HTTP 200/response 01 menjamin provider retry tanpa sumber kontrak.
3. Dapatkan kontrak/fixture resmi untuk autentikasi, nominal dan acknowledgment atau verifikasi server-ke-server yang didukung. Jika belum tersedia, pisahkan validasi struktur dari otorisasi settlement: payload yang hanya lolos parser/HMAC asumsi tidak boleh mengotorisasi mutasi finansial. Tambahkan tes menggunakan hash yang cocok dengan rumus lama tetapi tanpa bukti verifier provider; hasil wajib nol kredit. Jangan menambahkan flag “verified” yang bisa mengaktifkan asumsi sebagai bukti kontrak. Catat bahwa proteksi sementara ini menahan settlement otomatis sampai verifikasi tersedia.
4. Perbaiki setup tes autentikasi agar relasi deposit/member lengkap. Pisahkan regression relasi hilang untuk C1; jangan mempertahankan assertion yang meresmikan gateway SUCCESS tanpa kredit.
5. Jalankan build dan enam suite relevan. Laporkan A1 sebagai **parsial / terhambat kontrak** bila fixture resmi dan aturan acknowledgment belum terbukti, sekalipun seluruh tes lokal lulus. Setelah proteksi sementara selesai, lanjutkan B1 sesuai urutan awal.

Verifikasi ulang: `npm.cmd run build` **lulus (exit 0)**; enam suite relevan **82 tes lulus**, termasuk tes HTTP lokal dengan Prisma mock. Reproduksi tiga input non-skalar di atas dijalankan langsung terhadap verifier TypeScript dan semuanya diterima. Tidak ada panggilan provider, pengujian PostgreSQL concurrency, ataupun Flutter pada pemeriksaan ulang ini. Kode aplikasi dan tes pelaksana tidak diubah dalam pemeriksaan ini.

---

Kesimpulan: **belum selesai dan belum layak menutup ISSUE-001 sampai ISSUE-007**. Paket A sudah diperbaiki sebagian; penghambat utama paket B sampai H masih terlihat di working tree. Dokumen ini melengkapi `REVIEW-2026-09-23.md`, bukan menghapus instruksi yang belum selesai.

## Perubahan yang sudah benar

- `WebhookService.handleLinkQuCallback` sekarang menolak key server kosong, signature hilang/salah, amount hilang/nonangka/tidak finite/tidak positif, provider lokal selain LINKQU, client_id berbeda jika kedua nilai tersedia, status kosong/tidak dikenal, serta SUCCESS dengan response_code bukan 00.
- Tes callback sekarang memakai signature untuk skenario settlement. Klaim review lama bahwa tes paralel menerima payload tanpa signature sudah tidak berlaku.
- Referensi Linkqu yang tidak ditemukan sekarang mendapat `response: '01'`, bukan `'00'`. Ini belum membuktikan provider akan retry: controller tetap HTTP 200 dan belum ada inbox persisten.
- Interceptor sudah melewatkan respons WebhookController tanpa membungkusnya. Kesesuaian acknowledgment dengan kontrak provider tetap belum dibuktikan.

## Penghambat yang ditemukan kembali

Nomor baris merujuk working tree saat audit; gunakan nama fungsi bila baris bergeser.

| Prioritas | Bukti kode | Dampak / pekerjaan tersisa |
| --- | --- | --- |
| P0 | `Backend/src/api/webhook/webhook.service.ts:763-779` dan helper createSignature di `linkqu-callback.spec.ts` | Rumus signature masih ditentukan kode yang sama dengan tes. Tidak ditemukan fixture kontrak independen pada berkas yang diperiksa. Tes hijau tidak membuktikan callback resmi diterima dengan benar. |
| P0 | `webhook.service.ts:814,837` | Identitas merchant hanya dibandingkan jika kedua nilai ada; amount masih menerima amount ATAU total_amount. Arti field belum dibuktikan kontrak. |
| P0 | `Backend/src/administrator/transaksi_pulsa/transaksi_pulsa.service.ts:229` | Cabang selain sukses/gagal melakukan update status tanpa syarat. Final gagal dapat dibuka ke proses kemudian direfund lagi. |
| P0 | `webhook.service.ts:957-970` | Jalur gagal mengabaikan count klaim gateway, lalu mengubah deposit memakai status hasil baca lama. Gateway SUCCESS dan saldo terkredit dapat berakhir dengan deposit gagal. |
| P0 | `webhook.service.ts:874-921` | Sukses mengklaim semua status selain SUCCESS; relasi deposit/member hilang masih memungkinkan commit gateway sukses tanpa kredit. |
| P1 | `Backend/src/api/transaksi/transaksi.service.ts:13,109-133,269` | Map lokal dan key dalam ket masih menjadi idempotensi; ket diganti finalizer. Replay sesudah final/restart dan dua instance belum aman. saldo_sebelum masih dari pembacaan sebelum debit. |
| P1 | `Backend/src/api/deposit/deposit.service.ts:392,508,603` | Key dipotong 25 karakter, replay belum membandingkan payload, email dibuat dari nomor, kegagalan create belum atomik dengan deposit. |
| P1 | `transaksi-finalizer.service.ts` dan settlement Linkqu | Notifikasi dipanggil setelah commit tanpa outbox; refund belum punya identitas unik dan bukti debit historis. |
| P1 | `Backend/src/pengumuman/pengumuman.service.ts:82,251` | Satu penerima sukses membuat agregat Success; penerimaan oleh FCM masih mengisi delivered_at. |
| P1 | `Backend/src/api/webhook/webhook.controller.ts::webhookWapisender`, `Backend/src/providers/wapisender.service.ts::sendMessage` | Tidak ada autentikasi pada handler webhook; JSON `{}` masih masuk sent; timeout berakhir sebelum pembacaan body. |
| P1 | `Mobile/lib/services/deposit.dart::processLinkquDeposit`, `payment_instruction_screen.dart:39-73` | Mobile belum mengirim key; polling otomatis belum memakai guard satu request, lifecycle, dan refresh saldo. QR fallback, zona waktu, serta launch URL masih perlu Paket H. |
| P1 | `Mobile/lib/shared/providers/pengumuman_provider.dart:82,98,196` | Cold-start ditandai handled sebelum navigasi, token FCM dicetak penuh, dan log jalur abort dapat mencetak token autentikasi ketika deviceCode kosong. |

Tambahan validasi Paket A: `Buffer.from(signature, 'hex')` bukan parser ketat. Uji lokal Node membuktikan hash valid ditambah `zz` didekode menjadi byte yang sama. Ini bukan bukti penyerang bisa membuat hash valid tanpa secret, tetapi input signature malformed masih dapat diterima. Validasi format sesuai kontrak sebelum decoding.

## Instruksi pelaksanaan untuk AI yang lebih murah

Kerjakan **satu subpaket per sesi**, bukan seluruh tabel sekaligus. Baca issue asli yang dirujuk dan fungsi target saja terlebih dahulu. Pertahankan perubahan pengguna; jangan reset database, menjalankan migrate reset/db push, mengubah migration lama, atau menghubungi provider produksi. Tambahkan migration baru jika diperlukan. Jangan menyatakan selesai bila kriteria belum diuji. Jangan mengurangi assertion demi meluluskan tes.

### A1 — Selesaikan verifikasi kontrak Paket A

Target: `webhook.service.ts`, `linkqu-callback.spec.ts`, controller/interceptor dan dokumentasi fixture. Rujukan: ISSUE-003 dan Paket A review awal.

1. Cari kontrak resmi callback akun Linkqu VA/QRIS/e-wallet. Catat sumber, tanggal, metode, field wajib, autentikasi, arti amount/fee, identitas merchant dan aturan HTTP acknowledgment. Simpan fixture tersamarkan beserta signature yang dihasilkan independen dari helper implementasi. Jangan menyebut fixture buatan tes sebagai fixture provider.
2. Jika kontrak tidak tersedia, laporkan bagian yang tidak terbukti dan pastikan jalur yang belum terverifikasi tidak dapat mengkredit. Jangan mengganti ketidakpastian dengan rumus/header baru atau flag yang dianggap bukti autentikasi. Gunakan verifikasi server-ke-server hanya bila kontraknya tersedia.
3. Implementasikan verifier terpisah yang menghasilkan payload terverifikasi sebelum settlement. Validasi tipe body/ref/status/amount dan signature. Tolak array/object/boolean untuk field skalar numerik, status alias yang saling bertentangan, dan signature malformed. Jika kontrak menetapkan hex SHA-256, pastikan tepat 64 karakter hex sebelum timingSafeEqual.
4. Tentukan satu aturan nominal berdasarkan kontrak; hapus penerimaan amount/total secara alternatif tanpa dasar. Validasi identitas merchant melalui bukti autentikasi yang didukung kontrak, bukan asal mewajibkan field client_id yang mungkin tidak dikirim provider.
5. Tambahkan tes parameterized: null, kosong, nol, negatif, NaN, Infinity, boolean, array/object, status/status_trx konflik, merchant hilang/salah menurut kontrak, signature valid + suffix invalid, key kosong. Setiap penolakan harus memberi nol mutasi gateway/deposit/saldo/ledger.
6. Isolasi `process.env.LINKQU_SIGNATURE_KEY` di tes: simpan nilai asli, hapus/set untuk tiap skenario, lalu pulihkan. Tes key kosong saat ini dapat terpengaruh environment pengembang.
7. Tambahkan tes HTTP melalui controller dan interceptor untuk callback valid, invalid, DB error dan ref belum ada. Assertion status/body harus mengikuti kontrak. Pertahankan tes duplicate yang ada; jangan menganggap mock claimCount sebagai bukti locking DB.

Lulus: fixture resmi valid menghasilkan tepat satu kredit; input invalid nol kredit; HTTP acknowledgment terbukti. Jika kontrak belum ada, laporkan A1 belum selesai meskipun proteksi fail-closed sudah diuji.

### B1 — Tutup jalur admin membuka status final

Target: `transaksi_pulsa.service.ts::updateStatus`, finalizer, serta tes admin baru. Rujukan: ISSUE-001 / Paket B.

1. Buat regression test memanggil service admin dan finalizer nyata dengan dependency DB mock yang menyimpan state: gagal -> proses -> gagal serta sukses -> proses -> gagal. Assert proses ditolak dan tidak ada refund tambahan. Tes hanya memanggil finalizer dua kali tidak menangkap masalah admin ini.
2. Ganti update status proses dengan update bersyarat di DB yang hanya cocok status proses. Jika count nol, baca status terkini dan kembalikan konflik yang jelas. Pemeriksaan findUnique sebelum update saja tidak cukup. Pisahkan edit keterangan bila memang dibutuhkan.
3. Tambahkan tes balapan admin dengan callback/finalizer pada PostgreSQL terisolasi. Jangan menghubungkan integration test ke DATABASE_URL produksi.

Lulus B1: status final tidak dapat dibuka ulang melalui admin. **B1 belum menyelesaikan B2.**

### B2 — Perkuat refund dan audit harga

Ikuti Paket B langkah 3–6: identitas refund unik per transaksi, bukti debit, migration/backfill aman, rollback jika relasi wajib hilang, harga aktual tervalidasi diteruskan dari callback/cek admin, serta konflik final tersimpan untuk rekonsiliasi. Uji fault setelah klaim dan ledger gagal dengan PostgreSQL nyata. Jangan otomatis refund data lama tanpa bukti debit. Dokumentasikan rumus laba sesuai alur fee yang dibuktikan.

### C1 — Perbaiki klaim settlement tanpa mengubah kontrak provider

Target: `handleLinkQuCallback`, tes callback dan integration test baru. Rujukan: ISSUE-003 / Paket C.

1. Tambahkan unit regression: updateMany gateway jalur FAILED/EXPIRED mengembalikan count 0; assert requestDeposit.update tidak pernah dipanggil.
2. Hanya pemenang klaim boleh mengubah deposit. Klaim gateway, perubahan deposit, kredit dan ledger harus dalam satu transaksi DB; baca/validasi relasi wajib secara konsisten di transaksi. Throw agar rollback bila relasi wajib hilang atau transisi deposit tidak sah.
3. Tambahkan PostgreSQL test dengan barrier: sukses dan gagal membaca pending, sukses commit dahulu, gagal lanjut. Hasil akhir gateway SUCCESS, deposit sukses, satu kredit/satu ledger. Uji juga urutan sebaliknya sesuai kebijakan transisi eksplisit.
4. Untuk sukses terlambat setelah FAILED/EXPIRED, jangan tetap memakai `not: SUCCESS`. Simpan konflik untuk rekonsiliasi sampai kebijakan bisnis ditetapkan; jangan kredit otomatis berdasarkan tebakan.

Lulus C1: kehilangan klaim tidak menulis deposit; rollback tidak meninggalkan gateway sukses tanpa kredit. Lanjutkan **C2**, yaitu Paket C langkah 4–6 (constraint ledger/event, inbox/retry yang sesuai kontrak, laporan read-only data historis). Jangan menandai seluruh C selesai setelah tes count saja.

### D sampai H — Pecah paket besar menjadi sesi yang terukur

Instruksi detail dan kriteria kelulusan tetap mengikuti review awal. Gunakan pembagian berikut agar konteks AI tidak terlalu besar:

| Sesi | Ruang lingkup | Bukti selesai |
| --- | --- | --- |
| D1 | Intent pembelian unik member/key, fingerprint, snapshot tetap, debit + pekerjaan submit atomik; perbaiki saldo sebelum | Key sama sesudah final/restart replay transaksi lama; payload berbeda ditolak; dua debit punya saldo audit benar |
| D2 | Attempt provider persisten, identitas string, pemetaan callback/check/failover | Callback attempt lama tidak merefund attempt baru; SKU tidak berubah akibat mapping produk |
| D3 | Worker submit/reconcile dengan lease/backoff/manual review dan key Mobile persisten | Restart setelah debit pulih; dua instance hanya satu pengiriman awal; kiriman ambigu direkonsiliasi |
| E1 | Intent deposit unik dengan key utuh/fingerprint, ID detail eksplisit, owner filter | Prefiks 25 karakter sama tidak bentrok; replay beda payload ditolak; member B ditolak |
| E2 | Adapter kontrak Linkqu, timeout sampai body, validasi kontak/config/fee, gagal atomik | Body macet timeout; respons ambigu tidak final gagal; create gagal tidak menimpa settlement sukses |
| E3 | Worker create/reconcile deposit | Crash sebelum/sesudah send pulih tanpa invoice kedua berdasarkan jaminan kontrak provider |
| F1 | Outbox bersama transaksi/settlement; status per penerima dan retry | Crash sesudah commit pulih; hanya kegagalan sementara diulang; partial tidak disebut Success |
| F2 | Listener/token sync/navigasi akun Mobile dan redaksi log | Login ulang memulihkan token; logout A/login B tidak membuka detail A; tidak ada token utuh di log |
| G1 | Kontrak WAPI, autentikasi webhook, parser sukses eksplisit, timeout body | Tanpa autentikasi nol registrasi/pesan; JSON kosong/penolakan HTTP 200 bukan sent |
| G2 | Inbox/outbox registrasi, unique kode member dan laporan tabrakan nomor lama | Event paralel satu member/satu pekerjaan balasan; crash tidak mengulang registrasi |
| H1 | Key deposit persisten sampai service; guard submit; buka invoice lama | Double tap/restart tidak create kedua; payload/account terikat key |
| H2 | Lifecycle/polling satu request, refresh saldo, QR lokal, waktu dan URL | Tes fake clock/offline/resume/dispose; QR bisa dipindai; saldo refresh tanpa FCM |

Urutan: A1, B1, B2, C1, C2, lalu D1–D3, E1–E3, F1–F2, G1–G2, H1–H2. Jika A1 terhambat sumber kontrak, pertahankan fail-closed dan lanjutkan pekerjaan lokal B/C; jangan mengklaim A lulus. F1 harus menyediakan outbox yang dipakai G2, bukan membuat sistem retry duplikat.

## Verifikasi audit ini

- `cd Backend; npm.cmd run build`: lulus, exit 0.
- `cd Backend; npm.cmd test -- --runInBand --silent transaksi-finalizer.spec transaksi-submit.spec linkqu-callback.spec deposit-linkqu.spec pengumuman-fcm.spec wapisender.spec`: **6 suite, 45 tes lulus**, exit 0.
- Log DB_DEADLOCK, Network timeout dan invalid token berasal dari skenario tes mock.
- Uji Node decoding hex dengan suffix invalid: suffix diabaikan, buffer tetap sama.
- Audit ini tidak menjalankan PostgreSQL concurrency, Flutter/widget/analyze, provider sandbox, HTTP end-to-end atau perangkat fisik. Temuan race/refund di atas berasal dari pembacaan jalur kode, bukan klaim telah mereproduksi pada DB nyata. Kontrak provider eksternal tidak diverifikasi dalam audit ini.
- Tidak mengubah kode aplikasi atau tes pengguna; hasil kerja berupa instruksi review lanjutan.

## Prompt siap salin

> Baca `doc/issue/REVIEW-2026-09-23-FOLLOWUP.md`. Kerjakan **A1 saja**, dengan ISSUE-003 dan Paket A pada review awal sebagai rujukan. Periksa working tree dan pertahankan perubahan pengguna. Jangan mengulang pekerjaan yang sudah dinyatakan benar; tambahkan regression test untuk kekurangan yang tersisa. Jangan mengarang kontrak provider, memanggil produksi atau reset database. Jalankan build dan tes relevan. Laporkan file berubah, hasil tes, dan kriteria yang belum terbukti. Jika kontrak tidak tersedia, pastikan callback yang belum terverifikasi tidak bisa mengkredit dan tandai A1 belum selesai.

Ganti A1 dengan ID sesi berikut saat melanjutkan. Setiap sesi wajib menyertakan langkah reproduksi/test yang bisa dijalankan dan daftar batasan verifikasi.
