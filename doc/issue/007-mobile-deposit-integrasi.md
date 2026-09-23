# ISSUE-007 — Instruksi pembayaran Mobile bisa dibuka ulang dan status deposit diperbarui

Prioritas: P1. Status: OPEN. Dependensi: ISSUE-003, ISSUE-004, ISSUE-005.

## Lokasi dan temuan kode

- `Mobile/lib/services/deposit.dart`: handler Linkqu membaca `res['error_msg']`, sedangkan `Backend/src/common/interceptors/transform.interceptor.ts` mengeluarkan `message`. Ini berisiko menghilangkan alasan kegagalan; periksa juga transformasi network utility sebelum memperbaiki parser.
- `Mobile/lib/module/member/widget/beranda/deposit/payment_instruction_screen.dart`: instruksi membaca `transactionData` dari hasil create, QRIS ditampilkan hanya melalui `imageqris`, dan e-wallet membuka `checkout_url`. Perlu pemulihan dari data backend bila aplikasi ditutup atau hanya QR text tersedia.
- `Mobile/lib/module/member/widget/beranda/deposit/payment_method_screen.dart`, `Mobile/lib/shared/providers/DepositProvider.dart`, `Mobile/lib/services/deposit.dart`: jalur pemilihan/create deposit yang harus mengikuti validasi dan idempotensi ISSUE-004.
- `Backend/src/api/deposit/deposit.service.ts`: respons create memuat `transaction_id`, `partner_reff`, status, dan instruksi; endpoint status/detail payment gateway milik member perlu dirancang atau diverifikasi pada route lain sebelum menambah duplikat.
- `Mobile/lib/module/member/widget/beranda/transaksi/detail_deposit.dart` adalah tujuan klik FCM deposit; kontrak ID-nya harus dicocokkan dengan ID deposit lokal, bukan otomatis UUID gateway atau member ID.

## Hasil yang diinginkan

Pengguna dapat membuat deposit, melihat instruksi yang benar, menutup aplikasi, membuka kembali pembayaran yang sama, dan melihat saldo berubah setelah server memverifikasi pembayaran. Menekan kembali dari e-wallet bukan bukti pembayaran sukses.

## Langkah implementasi

1. Tetapkan satu kontrak API dan fixture HTTP aktual setelah interceptor untuk daftar metode, create, detail/status, serta error. Parser Mobile mengambil pesan yang benar dan menangani data null/status HTTP gagal.
2. Gunakan endpoint detail/status terautentikasi berdasarkan identitas pembayaran. Backend harus membatasi berdasarkan member JWT dan relasi deposit; pengguna A tidak boleh melihat VA/instruksi pengguna B dengan mengganti ID.
3. Persist data yang dibutuhkan untuk membuka ulang instruksi sesuai ISSUE-004. Mobile menyimpan referensi intent/pembayaran, kemudian mengambil status terbaru dari backend saat membuka layar atau resume.
4. Tampilkan VA dan nama bank, total bayar, biaya, nominal masuk saldo, expiry dengan zona waktu jelas. QRIS mendukung QR text bila gambar tidak tersedia. E-wallet membedakan checkout URL dan push notification bila kontrak metode memerlukannya.
5. Tambahkan refresh manual dan polling terbatas selama layar aktif bila belum ada mekanisme realtime yang memadai. Hentikan saat final/dispose; resume boleh cek lagi. Jangan memanggil create untuk sekadar refresh status.
6. Pada status sukses terverifikasi backend, refresh saldo/riwayat dan tampilkan hasil; pada gagal/expired tampilkan alasan aman. Timer lokal hanya memberi indikasi kedaluwarsa, bukan mengubah status pembayaran authoritative.
7. Integrasikan event FCM/socket dengan refresh yang sama; notifikasi hilang tidak boleh membuat deposit tidak dapat dilihat. Tahan double tap dan gunakan key intent yang sama untuk retry.

## Tes wajib / kriteria selesai

- Respons error backend menghasilkan pesan yang dapat dipahami, bukan kosong atau sukses palsu.
- VA, QRIS gambar, QRIS text saja, e-wallet checkout, dan push-only yang didukung menampilkan instruksi sesuai fixture.
- Tutup dan buka ulang aplikasi saat pending: kembali ke invoice yang sama tanpa create/deposit kedua.
- Kembali dari aplikasi e-wallet tanpa membayar: tetap pending sampai backend memastikan sukses.
- Pembayaran sukses saat aplikasi offline: saat resume, status dan saldo benar walaupun FCM tidak diterima.
- Member berbeda mencoba detail/status ID pembayaran: ditolak, tidak bocor data.
- Timeout, daftar metode kosong, expired, gambar gagal dimuat, URL checkout tidak valid: layar tidak crash dan menyediakan tindakan yang masuk akal.
- Satu alur integrasi penuh: create -> callback valid -> kredit sekali -> notifikasi -> detail/riwayat/saldo konsisten. Ulangi callback; saldo tetap sama.

Selesai bila fixture contract test dan widget test lulus, serta alur lengkap tercatat hasilnya pada sandbox/perangkat uji. Jangan menyatakan pembayaran produksi tervalidasi hanya dari hasil mock.
