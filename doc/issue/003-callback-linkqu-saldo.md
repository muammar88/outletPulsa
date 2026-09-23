# ISSUE-003 — Verifikasi callback Linkqu dan kredit saldo secara atomik

Prioritas: P0. Status: OPEN. Dependensi: tidak ada.

## Lokasi dan temuan kode

- `Backend/src/api/webhook/webhook.service.ts`, `handleLinkQuCallback`: tidak ada verifikasi signature/autentikasi callback sebelum saldo diproses; tidak mencocokkan nominal pembayaran dengan record lokal.
- Kondisi `status === 'SUCCESS' || responseCode === '00'` dapat menerima status bertentangan sebagai sukses. Cabang `responseCode !== '00'` juga mencakup kode yang tidak ada, sehingga data belum lengkap dapat dianggap gagal.
- `paymentGatewayTransaction` diubah ke `SUCCESS` sebelum transaksi DB deposit/saldo. Jika bagian kedua gagal, retry berhenti karena gateway sudah `SUCCESS`, padahal saldo belum bertambah.
- Saldo ditulis memakai `member.saldo` dari pembacaan di luar transaksi, kemudian `saldo: saldoSetelahnya`. Deposit dan pembelian yang bersamaan dapat saling menimpa.
- `Backend/src/api/webhook/webhook.controller.ts`: route Nest adalah `/webhook/linkqu`, beserta `/va`, `/qris`, `/ewallet`.
- `Backend/src/common/interceptors/transform.interceptor.ts`: seluruh respons dibungkus menjadi `{error,message,data}`. Kesesuaian bentuk acknowledgment dengan Linkqu belum dibuktikan.

## Reproduksi terkontrol

Buat pembayaran pending milik member uji, lalu panggil handler dengan referensi yang benar tanpa bukti autentikasi. Implementasi saat ini dapat masuk jalur kredit. Untuk konsistensi, paksa DB error setelah update gateway tetapi sebelum update saldo; ulangi event. Untuk konkurensi, jalankan dua pembayaran berbeda bagi member sama bersamaan dengan debit pulsa.

## Langkah implementasi

1. Verifikasi kontrak autentikasi callback resmi Linkqu untuk VA, QRIS, dan e-wallet. Dokumentasikan header/body yang ditandatangani, validasi raw body bila disyaratkan, dan contoh fixture valid/invalid. Bila integrasi tidak menyediakan signature, implementasikan verifikasi server-ke-server yang didukung sebelum kredit; jangan mengarang secret/header sendiri sebagai seolah kontrak resmi.
2. Validasi struktur event, provider, referensi, merchant/identitas transaksi yang tersedia, dan nominal dengan record lokal. Perbedaan nominal/identitas masuk penanganan mismatch tanpa kredit. Jangan memakai saldo/nominal pilihan pengirim callback sebagai sumber kebenaran.
3. Buat tabel pemetaan status berdasarkan kontrak. Pending tetap pending; field hilang/status tak dikenal/kontradiktif tidak boleh menjadi sukses hanya karena `rc=00` dan tidak boleh otomatis menjadi gagal.
4. Dalam satu transaksi DB, klaim settlement secara bersyarat dan ubah gateway, request deposit, saldo, riwayat saldo, serta event notifikasi bersama. Gunakan increment atomik dan pencatatan saldo sebelum/sesudah yang konsisten. Beri constraint ledger/event untuk mencegah settlement kedua.
5. Event duplikat yang sudah diproses boleh mendapat acknowledgment sukses tanpa kredit ulang. Bedakan acknowledgment diterima dari status pembayaran sukses. Kesalahan sementara DB harus tetap dapat dicoba ulang sesuai kontrak provider; jika sudah di-ack, event harus tersimpan tahan restart untuk diproses ulang.
6. Tentukan penanganan referensi belum ditemukan dan callback datang sebelum hasil create tersimpan; jangan membuang event diam-diam. Koordinasikan record intent lokal dengan ISSUE-004.
7. Cocokkan URL callback dari aplikasi dengan route Nest dan konfigurasi reverse proxy. `main.ts` tidak menetapkan global prefix `/api`; URL public tidak boleh disimpulkan hanya dari controller. Uji HTTP melalui jalur deployment dan cek body setelah interceptor.
8. Audit record lama `SUCCESS` yang belum memiliki kredit/ledger. Sediakan laporan read-only berisi kandidat rekonsiliasi. Jangan otomatis mengkredit semuanya tanpa bukti pembayaran dan pemeriksaan apakah saldo pernah ditambahkan.

## Tes wajib / kriteria selesai

| Skenario | Hasil |
| --- | --- |
| Callback valid sukses nominal Rp50.000, saldo Rp100.000 | Saldo Rp150.000, satu ledger, status keduanya sukses |
| Event sukses diulang 10 kali/paralel | Kredit total tetap Rp50.000 |
| Dua deposit Rp50.000 dan Rp20.000 bersamaan | Kenaikan Rp70.000, tidak kehilangan update |
| Deposit bersamaan debit pulsa Rp10.000 | Saldo awal + deposit - Rp10.000 |
| Signature/identitas/nominal tidak valid | Tidak ada kredit; alasan tercatat tanpa secret |
| Pending, field hilang, status konflik | Tidak otomatis dikreditkan atau digagalkan |
| DB gagal di tengah settlement | Semua rollback dan retry dapat menyelesaikan |
| Callback cepat atau referensi tidak dikenal | Kebijakan retry/penyimpanan jelas; tidak hilang diam-diam |
| Respons HTTP aktual | Status dan body acknowledgment sesuai kontrak resmi |

Selesai setelah tes database konkurensi dan tes HTTP end-to-end lulus; unit test pemanggilan service saja tidak cukup.
