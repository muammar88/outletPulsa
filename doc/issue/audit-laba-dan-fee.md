# Audit Rumus Laba dan Fee — Transaksi Prabayar (B2)

Tanggal: 23 September 2026  
Konteks: ISSUE-001, Sub-paket B2

## Alur Finansial Transaksi Prabayar

### 1. Saat Pembelian (Submit)

`
totalBayar = selling_price + fee_agen
  - selling_price: harga jual ke member (termasuk markup)
  - fee_agen: biaya reseller (Rp20 jika member adalah reseller, 0 jika bukan)

Debit saldo member:
  saldo_sesudah = saldo_sebelum - totalBayar

Bukti debit tersimpan di Transaction:
  - saldo_sebelum: saldo member sebelum debit
  - saldo_sesudah: saldo member sesudah debit
`

### 2. Saat Finalisasi Gagal (Refund)

`
refundAmount = selling_price + fee_agen  (mengembalikan 100% dana member)

Credit saldo member:
  saldo_baru = saldo_sekarang + refundAmount

Identitas refund: refund_id = 'REFUND-TRX-{transaction.id}'
  - Deterministik dan unik per transaksi
  - Mencegah refund ganda melalui unique constraint di DB

Syarat refund:
  1. refund_id belum ada pada transaksi (anti-duplikasi)
  2. saldo_sebelum > saldo_sesudah (bukti debit terjadi)
  3. riwayatTransaksi.member tidak null (relasi wajib)
  4. riwayatSaldo.create berhasil (ledger tidak gagal)

Jika syarat tidak terpenuhi:
  - calculatedRefund = 0
  - activityLog.create dengan action REFUND_DITOLAK_TANPA_BUKTI_DEBIT
  - Tidak ada mutasi saldo member
`

### 3. Saat Finalisasi Sukses

`
actualPurchasePrice = harga yang dibebankan provider (dari callback/checkStatus raw response)
  - Jika provider tidak mengirim harga: gunakan purchase_price snapshot (harga modal saat submit)
  - Validasi: harus finite number > 0

laba = selling_price - actualPurchasePrice - fee_agen

Catatan:
  - selling_price: harga jual ke member
  - actualPurchasePrice: modal riil ke provider (mungkin berbeda dari snapshot akibat diskon/promosi provider)
  - fee_agen: komisi reseller (dibayar ke upline, tidak mengurangi laba outlet langsung)
  - Laba bisa negatif jika provider menagih lebih dari harga jual

Contoh:
  selling_price = 15.000
  actualPurchasePrice = 13.900 (dari callback IAK)
  fee_agen = 50
  laba = 15.000 - 13.900 - 50 = 1.050
`

### 4. Konflik Status

`
Jika transaksi sudah final (sukses/gagal/expired) dan menerima target status berbeda:
  - TIDAK ada refund atau debit
  - TIDAK ada perubahan status
  - activityLog.create dengan action TRANSACTION_STATUS_CONFLICT
  - Perlu rekonsiliasi manual

Skenario umum:
  - Transaksi sukses, callback FAILED terlambat → konflik dicatat, saldo tetap
  - Transaksi gagal, callback SUCCESS terlambat → konflik dicatat, tidak ada kredit
`

## Keterbatasan dan Catatan

- ee_agen saat ini diasumsikan selalu menjadi bagian dari total bayar member.
  Jika ada alur di mana fee_agen tidak termasuk dalam totalBayar, perlu audit lebih lanjut.
- selling_price tidak mencerminkan harga yang dibayar jika ada promo/diskon aplikasi.
  Belum ada alur promo yang terbukti dalam audit ini.
- Harga aktual dari provider (IAK field 'price', Digiflazz field 'price', Tripay field 'price')
  belum diverifikasi terhadap kontrak provider resmi.
  Implementasi B2 menggunakan field tersebut jika tersedia dan > 0, fallback ke snapshot.
- PostgreSQL concurrency untuk refund tidak diuji dalam sesi ini (menunggu ketersediaan DB terisolasi).
