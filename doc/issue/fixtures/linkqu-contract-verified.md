# Catatan Kontrak LinkQu (Verifikasi Terbatas) — ISSUE-008

Tanggal: 27 September 2026.
Status: **SEBAGIAN BESAR BELUM TERVERIFIKASI RESMI.** Tidak ada salinan dokumentasi resmi LinkQu
di repositori ini dan akses jaringan terbatas, sehingga kontrak di bawah hanya dapat dibuktikan
dari implementasi lama (`dd1116aa`) dan fixture internal. Bagian yang diasumsikan ditandai jelas.

## 1. Ringkasan status

| Bagian | Status | Sumber / Catatan |
| --- | --- | --- |
| URL create VA/QRIS/e-wallet | Asumsi dari kode | `/linkqu-partner/transaction/create/va`, `/vapermata`, `/qris`, `/ovopush`, `/paymentewallet`; base URL dev/prod dari pengaturan. Tidak ada salinan doc resmi. |
| Header create | Asumsi dari kode | `client-id`, `client-secret`, `Content-Type: application/json`. |
| Signature request create | Asumsi dari kode | `HMAC-SHA256(signPath + 'POST' + normalize(amount+expired+...+clientId))` dengan `linkqu_signature_key`. |
| Signature callback | **Asumsi, belum terverifikasi** | `HMAC-SHA256(normalize(amount + partner_reff + status))`, dikirim via header `signature`/`x-signature` atau field `signature`. Tidak ada bukti dokumen resmi. |
| Identitas merchant callback | Sebagian | `client_id` divalidasi bila dikirim provider dan dikonfigurasi server. |
| Field status callback | Sebagian | `SUCCESS`/`FAILED`/`EXPIRED`/`PENDING` + alias `status_trx`; `response_code`/`rc`. |
| Format acknowledgment | Terbukti dari implementasi | HTTP 200, body `{ response: '00' }` (terima) / `{ response: '01', message }` (tolak), melewati `TransformInterceptor`. |
| API inquiry status | **TIDAK DIKETAHUI** | Tidak ada kontrak resmi. Rekonsiliasi timeout belum diimplementasikan (lihat laporan). |
| Nominal yang dicocokkan | Diputuskan fail-closed | Hanya `tx.amount`. `total_amount` tidak diterima sebagai alternatif. |
| Biaya admin | Asumsi dari kode | `feeadmin`/`fee` pada respons create; tidak dianggap bagian saldo topup. |

## 2. Konsekuensi keamanan

1. Callback **fail-closed**: tanpa signature 64-hex yang cocok, event ditolak (`response: '01'`)
   dan tidak masuk inbox, sehingga tidak ada kredit saldo.
2. Karena rumus signature callback adalah asumsi, bila LinkQu memakai mekanisme berbeda,
   callback sah berpotensi ditolak. Ini adalah kegagalan yang aman (tidak mengkredit) dan
   harus ditangani dengan menyesuaikan verifier setelah kontrak resmi diperoleh.
3. Rekonsiliasi resmi (inquiry) belum dapat dibuat tanpa kontrak; pekerjaan ini dilaporkan
   sebagai terblokir, bukan diisi dengan endpoint karangan.

## 3. Sumber

- Panduan signature request (umum, tidak otomatis berlaku untuk callback): https://www.linkqu.id/en/support/panduan-signatur-untuk-api-linkqu/
- Perubahan URL gateway produksi: https://www.linkqu.id/kabar-linkqu/perubahan-url-gateway-linkqu-mulai-1-mei-2025/
- Fixture internal callbacks: `doc/issue/fixtures/linkqu-callback-fixtures.md`

## 4. Gate kredit otomatis (WAJIB)

Karena rumus signature callback di atas **belum terbukti resmi**, kredit saldo otomatis
**DEFAULT DITAHAN**. Adapter settlement produksi hanya boleh mengkredit setelah operator
memverifikasi kontrak resmi LinkQu dan menyalakan gate secara eksplisit:

- `LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED=true` — izinkan kredit otomatis dari settlement.
  Selama tidak diset, event sukses tetap disimpan dan dijadwalkan ulang (PENDING) tetapi
  **tidak pernah** menambah saldo.

## 5. Inquiry/rekonsiliasi (opsional, default mati)

Tanpa kontrak resmi, inquiry **tidak diaktifkan**. Setelah path/field resmi dipastikan,
aktifkan lewat env berikut:

- `LINKQU_INQUIRY_ENABLED=true` (wajib untuk mengaktifkan)
- `LINKQU_INQUIRY_PATH=/linkqu-partner/...` (wajib; path inquiry resmi)
- `LINKQU_INQUIRY_STATUS_FIELD=status` (nama field status pada respons)
- `LINKQU_INQUIRY_SIGN_PATH` / `LINKQU_INQUIRY_SIGN_RAW` / `LINKQU_INQUIRY_METHOD` (signature request inquiry)
- `LINKQU_INQUIRY_MIN_AGE_MS` / `LINKQU_INQUIRY_DEBOUNCE_MS` (jeda agar tidak membanjiri provider)

Hasil inquiry tidak mengkredit langsung; ia hanya membuat event inbox `event_type=INQUIRY`
yang diselesaikan oleh jalur settlement yang sama (idempoten) dan tetap tunduk pada gate
otorisasi kredit di atas. Status inquiry yang tidak dikenal tidak dianggap terminal.
