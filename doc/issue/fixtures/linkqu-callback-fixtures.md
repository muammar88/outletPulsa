# Dokumentasi Fixture & Kontrak Callback LinkQu (Paket A - A1)

Tanggal audit: 23 September 2026  
Status kontrak provider: **BELUM TERSEDIA DOKUMEN RESMI LINKQU DI REPOSITORI** (Fail-Closed Enforcement)

---

## 1. Status Sumber & Bukti Kontrak

| Item | Status | Sumber Bukti / Catatan |
|---|---|---|
| Dokumen Kontrak Resmi LinkQu | **TIDAK ADA** di repositori `outletPulsa` | Tidak ditemukan file PDF/spesifikasi resmi LinkQu. Implementasi diturunkan dari commit `dd1116aa` (19 Sep 2026). |
| Endpoint Callback | Terbukti dari implementasi | `POST /webhook/linkqu`, `POST /webhook/linkqu/va`, `POST /webhook/linkqu/qris`, `POST /webhook/linkqu/ewallet` (juga diakses via prefix `/api/webhook/...`). |
| Format Acknowledgment | Terbukti dari implementasi | HTTP 200 dengan payload JSON: `{ "response": "00" }` (sukses/terima) atau `{ "response": "01", "message": "..." }` (ditolak/gagal). Interceptor `TransformInterceptor` dilewati secara eksplisit untuk `WebhookController`. |
| Single Nominal Rule | Diputuskan fail-closed | Nominal yang dicocokkan adalah `tx.amount` (nominal deposit dasar yang ditagihkan). Penerimaan alternatif terhadap `total_amount` tanpa konfirmasi kontrak telah dihapus. |
| Autentikasi Callback | Parsial / Asumsi Kode | HMAC-SHA256 dari `(amount + partner_reff + status).toLowerCase().replace(/[^0-9a-zA-Z]/g, '')` dengan pre-shared secret key `linkqu_signature_key`. Signature dikirim via header (`signature` / `x-signature`) atau field `signature` dalam body. Karena tidak ada bukti dokumen resmi dari LinkQu bahwa rumus ini resmi, sistem menerapkan **Fail-Closed**: tanpa signature yang cocok dan format valid 64 karakter hex, mutasi saldo DITOLAK. |
| Identitas Merchant | Bersyarat | Field `client_id` jika dikirim oleh payload callback divalidasi harus sama persis dengan `pengaturanUmum.linkqu_client_id`. Jika provider tidak mengirim `client_id`, autentikasi bertumpu pada pre-shared secret key HMAC. |

---

## 2. Fixture Tersamarkan Independen

Berikut adalah payload fixture dengan signature yang dihitung secara independen menggunakan OpenSSL/RFC-2104 HMAC-SHA256 dengan secret key `static_fixture_secret_linkqu_key_2026`:

### 2.1 VA SUCCESS (Nominal Rp50.000)
```json
{
  "partner_reff": "DP-FIXTURE-VA-001",
  "amount": 50000,
  "status": "SUCCESS",
  "response_code": "00",
  "client_id": "client_outletpulsa_linkqu_prod",
  "signature": "25c9d5b78cfbbe706f2378336f1b5f46932172b7bea1b3691b4e93dd6d9abbe9"
}
```

### 2.2 QRIS SUCCESS (Nominal Rp25.000)
```json
{
  "partner_reff": "DP-FIXTURE-QRIS-002",
  "amount": 25000,
  "status": "SUCCESS",
  "response_code": "00",
  "client_id": "client_outletpulsa_linkqu_prod",
  "signature": "921393bac9d5e31647a797cb9a56c3fd01789f6844d07596fb4f082bf39ed1d3"
}
```

### 2.3 E-WALLET PENDING (Nominal Rp10.000)
```json
{
  "partner_reff": "DP-FIXTURE-EWALLET-003",
  "amount": 10000,
  "status": "PENDING",
  "response_code": "00",
  "client_id": "client_outletpulsa_linkqu_prod",
  "signature": "18142315c8167dfa94b25fc53d67bea65346bb2271935bb57b7d022c17fb4cde"
}
```

### 2.4 VA FAILED (Nominal Rp75.000)
```json
{
  "partner_reff": "DP-FIXTURE-VA-004",
  "amount": 75000,
  "status": "FAILED",
  "response_code": "01",
  "client_id": "client_outletpulsa_linkqu_prod",
  "signature": "7e184ae215209022a7dc486ff86b96d11263df0a2f9571eee3cda7e4aed305e4"
}
```

### 2.5 QRIS EXPIRED (Nominal Rp30.000)
```json
{
  "partner_reff": "DP-FIXTURE-QRIS-005",
  "amount": 30000,
  "status": "EXPIRED",
  "response_code": "02",
  "client_id": "client_outletpulsa_linkqu_prod",
  "signature": "df8885a3a6426a0c3475efb027e90502a84c689f3d03ccbd5197b4c228e5aaf7"
}
```

---

## 3. Batasan Verifikasi & Perlindungan Fail-Closed

1. **Proteksi Buffer Node.js Malformed Hex**:
   Node.js `Buffer.from(str, 'hex')` mengabaikan karakter non-hex di akhir string (misal `hash + 'zz'` didekode seolah byte valid). Verifier memvalidasi `typeof signature === 'string' && /^[0-9a-fA-F]{64}$/.test(signature)` sebelum perbandingan timing-safe.
2. **Penolakan Tipe Non-Skalar**:
   Field skalar (`amount`, `partner_reff`, `status`, `response_code`) menolak array, objek, boolean, `NaN`, `Infinity`, string kosong, atau angka nol/negatif.
3. **Penyelesaian Konflik Alias**:
   Jika kedua field alias dikirim (`partner_reff` vs `partner_ref`, atau `status` vs `status_trx`, atau `response_code` vs `rc`), keduanya harus bernilai sama. Jika berbeda, callback ditolak sebagai anomali kontradiktif.
4. **Isolasi Lingkungan Uji**:
   Pengujian unit mengisolasi `process.env.LINKQU_SIGNATURE_KEY` sehingga environment lokal pengembang tidak membocorkan kredensial ke kasus uji missing-key.
