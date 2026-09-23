-- AlterTable: Tambah kolom refund_id pada Transaction
-- Kolom ini menjadi identitas unik refund per transaksi (REFUND-TRX-{id})
-- Mencegah refund ganda melalui unique constraint database level
ALTER TABLE "Transaction" ADD COLUMN "refund_id" TEXT;

-- CreateIndex: Unique constraint untuk mencegah dua refund pada transaksi yang sama
CREATE UNIQUE INDEX "Transaction_refund_id_key" ON "Transaction"("refund_id");

-- Safe Backfill: Isi refund_id hanya untuk transaksi yang SUDAH pernah direfund
-- (status=gagal DAN ada catatan riwayat_saldo tipe deposit yang terhubung via riwayat_transaksi)
-- Transaksi gagal tanpa bukti catatan saldo TIDAK diisi otomatis (menunggu verifikasi manual)
UPDATE "Transaction" t
SET "refund_id" = 'REFUND-TRX-' || t.id
WHERE t.status = 'gagal'
  AND t."refund_id" IS NULL
  AND EXISTS (
    SELECT 1 FROM "riwayat_saldo" rs
    WHERE rs.riwayat_transaksi_id = t."riwayatTransaksiId"
      AND rs.status = 'deposit'
  );
