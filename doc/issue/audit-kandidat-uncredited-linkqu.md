# Prosedur Audit & Klasifikasi Kandidat Transaksi LinkQu Belum Terkredit (C2)

## 1. Latar Belakang & Prinsip Kehati-hatian Finansial

Pada audit finansial sistem payment gateway, klaim bahwa suatu transaksi **"pasti belum dikredit"** secara sepihak hanya berdasarkan ketiadaan entri ledger adalah **asumsi berbahaya (non-faktual)**. Ketiadaan entri ledger dapat disebabkan oleh:
1. Terputusnya relasi database saat callback diterima.
2. Penulisan ke ledger gagal setelah saldo member telah terlanjur di-increment (data drift).
3. Migrasi historis yang belum mengisi foreign key `settlement_ledger_id` atau `settlement_ref`.
4. Transaksi manual yang dicatat di tabel mutasi saldo tanpa korelasi eksplisit.

Oleh karena itu, sistem OutletPulsa menerapkan prinsip **Audit Read-Only Berbasis Fakta (Factual Classification)** tanpa pernah melakukan mutasi/kredit otomatis atas transaksi historis yang ambigu.

---

## 2. Kategori Faktual (Non-Asumtif)

Setiap transaksi LinkQu berstatus `SUCCESS` dievaluasi berdasarkan bukti konkret yang tersimpan di sistem:

| Kategori Faktual | Kriteria & Kondisi Data | Potensi Risiko Finansial | Prosedur Investigasi Manual |
| :--- | :--- | :--- | :--- |
| `BUKTI_KREDIT_TIDAK_DITEMUKAN` | Gateway berstatus `SUCCESS` dan `requestDeposit` berstatus `sukses`, namun tidak ditemukan catatan `riwayat_saldo` (kredit mutasi) maupun `settlement_ledger_id`. | Saldo member belum bertambah ATAU saldo bertambah tanpa jejak audit ledger. | Cek mutasi rekening koran LinkQu & log audit saldo member pada waktu transaksi. |
| `BUKTI_KREDIT_AMBIGU` | Ditemukan lebih dari 1 entri mutasi saldo pada riwayat transaksi yang sama tanpa `settlement_ref` unik. | Risiko double-credit telah terjadi pada sistem lama. | Rekonsiliasi ledger historis, hitung total saldo vs total deposit member. |
| `MISSING_DEPOSIT_RELATION` | Transaksi gateway bertipe `DEPOSIT`, namun record `requestDeposit` bernilai null / tidak ditemukan. | Invoice payment gateway yatim (*orphaned invoice*). | Periksa tabel `payment_gateway_transaction` dan cari invoice yang putus relasi. |
| `DEPOSIT_STATUS_MISMATCH` | Gateway berstatus `SUCCESS`, namun `requestDeposit.status` masih `proses` atau `gagal`. | Pembayaran berhasil di LinkQu tapi status deposit aplikasi tertinggal atau ditolak manual. | Sinkronisasi status hanya setelah verifikasi mutasi dana masuk ke bank settlement LinkQu. |
| `MISSING_MEMBER_RELATION` | Record `requestDeposit` ada, namun relasi `member` tidak ditemukan. | Member telah dihapus atau ID member korup. | Periksa integritas referensial tabel member. |

---

## 3. Kebijakan Fail-Closed & Larangan Auto-Credit

1. **Dilarang Menjalankan Script Batch Crediting Otomatis**:
   Tidak boleh ada worker atau endpoint yang secara otomatis meng-increment saldo member hanya karena statusnya masuk ke salah satu kategori di atas.
2. **Rekonsiliasi Manual Wajib Dua Mata (*Four-Eyes Principle*)**:
   Setiap tindakan koreksi saldo wajib melibatkan:
   - Bukti settlement resmi dari mutasi bank/dashboard LinkQu.
   - Persetujuan administrator berwenang melalui pembuatan tiket penyesuaian khusus (bukan tombol persetujuan deposit biasa).
3. **Penyekatan Jalur Admin**:
   Endpoint admin reguler (`PUT /administrator/deposit/:id`) secara ketat menolak persetujuan manual (`sukses`) untuk seluruh deposit yang terikat dengan `PaymentGatewayTransaction`, baik saat gateway masih `PENDING` maupun setelahnya, guna mencegah tabrakan settlement (*settlement collision*) dan pengkreditan ganda (*double-crediting*).

---

## 4. Spesifikasi API Audit Read-Only

### Endpoint:
`GET /administrator/transaksi-linkqu/uncredited-candidates`

### Autentikasi & Keamanan:
- Wajib menyertakan Header: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- Dilindungi oleh `JwtAuthGuard`

### Query Parameters:
- `page` (number, default: 1): Halaman data.
- `limit` (number, default: 10, max: 100): Jumlah data per halaman.
- `search` (string, opsional): Pencarian berdasarkan `partner_reff`, `payment_method`, atau `bank_name`.
- `category` (string, opsional): Filter kategori faktual (`BUKTI_KREDIT_TIDAK_DITEMUKAN`, `BUKTI_KREDIT_AMBIGU`, `MISSING_DEPOSIT_RELATION`, `DEPOSIT_STATUS_MISMATCH`, `MISSING_MEMBER_RELATION`).

### Contoh Response:
```json
{
  "message": "Berhasil mengambil data kandidat transaksi LinkQu uncredited / anomali",
  "data": {
    "items": [
      {
        "gateway_id": 105,
        "partner_reff": "DEP-20260923-001",
        "provider": "LINKQU",
        "amount": 50000,
        "status": "SUCCESS",
        "payment_method": "VA_PERMATA",
        "category": "BUKTI_KREDIT_TIDAK_DITEMUKAN",
        "reason": "Gateway SUCCESS dan requestDeposit sukses, namun tidak ditemukan riwayat saldo mutasi kredit maupun settlement ledger tertaut",
        "settlement_ref": null,
        "settlement_ledger_id": null,
        "deposit_id": 42,
        "deposit_status": "sukses",
        "member_id": 12,
        "member_name": "Ahmad Dani",
        "created_at": "2026-09-23T10:15:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "per_page": 10,
      "total_pages": 1
    }
  }
}
```
