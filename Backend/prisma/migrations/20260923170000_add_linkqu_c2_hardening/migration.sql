-- Migration: Sub-paket C2 — Constraint Ledger Unik, Inbox Callback, dan Relasi Settlement
-- Tanggal: 23 September 2026

-- 1. Tambah settlement_ref pada riwayat_saldo (Identitas unik ledger per settlement transaksi)
ALTER TABLE "riwayat_saldo" ADD COLUMN "settlement_ref" TEXT;
CREATE UNIQUE INDEX "riwayat_saldo_settlement_ref_key" ON "riwayat_saldo"("settlement_ref");

-- 2. Tambah settlement_ref dan settlement_ledger_id pada payment_gateway_transactions
ALTER TABLE "payment_gateway_transactions" ADD COLUMN "settlement_ref" TEXT;
ALTER TABLE "payment_gateway_transactions" ADD COLUMN "settlement_ledger_id" INTEGER;
CREATE UNIQUE INDEX "payment_gateway_transactions_settlement_ref_key" ON "payment_gateway_transactions"("settlement_ref");
CREATE UNIQUE INDEX "payment_gateway_transactions_settlement_ledger_id_key" ON "payment_gateway_transactions"("settlement_ledger_id");

-- Foreign key relasi settlementLedger
ALTER TABLE "payment_gateway_transactions" 
  ADD CONSTRAINT "payment_gateway_transactions_settlement_ledger_id_fkey" 
  FOREIGN KEY ("settlement_ledger_id") REFERENCES "riwayat_saldo"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Buat tabel payment_gateway_callback_inbox untuk penyimpanan event durable & deduplikasi
CREATE TABLE "payment_gateway_callback_inbox" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'LINKQU',
    "merchant_id" TEXT,
    "partner_reff" TEXT NOT NULL,
    "event_hash" TEXT NOT NULL,
    "event_type" TEXT DEFAULT 'callback',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" TEXT NOT NULL,
    "headers" TEXT,
    "signature" TEXT,
    "locked_until" TIMESTAMP(3),
    "locked_by" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 5,
    "next_retry_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_error" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_gateway_callback_inbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_gateway_callback_inbox_event_hash_key" ON "payment_gateway_callback_inbox"("event_hash");
CREATE INDEX "payment_gateway_callback_inbox_partner_reff_idx" ON "payment_gateway_callback_inbox"("partner_reff");
CREATE INDEX "payment_gateway_callback_inbox_status_next_retry_at_idx" ON "payment_gateway_callback_inbox"("status", "next_retry_at");

-- 4. Safe Unambiguous Backfill:
-- Hanya mengaitkan transaksi gateway SUCCESS dengan ledger deposit yang terbukti 1-ke-1 tanpa ambiguitas
WITH unambiguous_pairs AS (
  SELECT 
    pg.id AS pg_id,
    pg.partner_reff AS partner_reff,
    rs.id AS rs_id,
    COUNT(*) OVER (PARTITION BY pg.id) AS match_count
  FROM "payment_gateway_transactions" pg
  JOIN "RequestDeposit" rd ON rd.id = pg."requestDepositId"
  JOIN "RiwayatTransaksi" rt ON rt.id = rd."riwayatTransaksiId"
  JOIN "riwayat_saldo" rs ON rs.member_id = rt."memberId"
    AND rs.status = 'deposit'
    AND rs.nominal = pg.amount
  WHERE pg.status = 'SUCCESS'
    AND rd.status = 'sukses'
    AND pg.settlement_ref IS NULL
)
UPDATE "payment_gateway_transactions" target_pg
SET 
  "settlement_ref" = 'SETTLE-LINKQU-' || up.partner_reff,
  "settlement_ledger_id" = up.rs_id
FROM unambiguous_pairs up
WHERE target_pg.id = up.pg_id
  AND up.match_count = 1; -- STRICT: Hanya pasangan yang tepat 1 (tidak ambigu)

-- Backfill settlement_ref pada riwayat_saldo yang terikat dari pasangan unambigu di atas
UPDATE "riwayat_saldo" rs
SET "settlement_ref" = pg.settlement_ref
FROM "payment_gateway_transactions" pg
WHERE pg.settlement_ledger_id = rs.id
  AND pg.settlement_ref IS NOT NULL
  AND rs.settlement_ref IS NULL;
