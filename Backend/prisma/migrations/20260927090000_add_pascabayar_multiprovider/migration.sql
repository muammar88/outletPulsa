-- CreateEnum
CREATE TYPE "PascabayarProvider" AS ENUM ('IAK', 'DIGIFLAZZ');

-- AlterEnum
ALTER TYPE "RiwayatSaldoStatus" ADD VALUE IF NOT EXISTS 'pengembalian_dana';

-- CreateTable
CREATE TABLE "DigiflazzPascabayarProduct" (
    "id" SERIAL NOT NULL,
    "buyerSkuCode" TEXT NOT NULL,
    "name" TEXT,
    "category" TEXT,
    "brand" TEXT,
    "sellerName" TEXT,
    "price" INTEGER,
    "admin" INTEGER,
    "commission" INTEGER,
    "buyerProductStatus" BOOLEAN,
    "sellerProductStatus" BOOLEAN,
    "desc" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DigiflazzPascabayarProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdukPascabayarProvider" (
    "id" SERIAL NOT NULL,
    "produkPascabayarId" INTEGER NOT NULL,
    "provider" "PascabayarProvider" NOT NULL,
    "providerSku" TEXT NOT NULL,
    "iakProductId" INTEGER,
    "digiflazzProductId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProdukPascabayarProvider_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "TransactionPascabayar"
    ADD COLUMN "memberId" INTEGER,
    ADD COLUMN "provider" "PascabayarProvider",
    ADD COLUMN "providerSku" TEXT,
    ADD COLUMN "expiredAt" TIMESTAMP(3),
    ADD COLUMN "providerRefId" TEXT,
    ADD COLUMN "providerStatus" TEXT,
    ADD COLUMN "inquiryPayload" JSONB,
    ADD COLUMN "paymentIntentId" TEXT,
    ADD COLUMN "paymentAttemptedAt" TIMESTAMP(3),
    ADD COLUMN "refundId" TEXT,
    ADD COLUMN "adminFeeSnapshot" INTEGER,
    ADD COLUMN "comissionSnapshot" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "DigiflazzPascabayarProduct_buyerSkuCode_key" ON "DigiflazzPascabayarProduct"("buyerSkuCode");
CREATE INDEX "DigiflazzPascabayarProduct_category_idx" ON "DigiflazzPascabayarProduct"("category");
CREATE INDEX "DigiflazzPascabayarProduct_brand_idx" ON "DigiflazzPascabayarProduct"("brand");
CREATE UNIQUE INDEX "ProdukPascabayarProvider_produkPascabayarId_provider_key" ON "ProdukPascabayarProvider"("produkPascabayarId", "provider");
CREATE INDEX "ProdukPascabayarProvider_produkPascabayarId_idx" ON "ProdukPascabayarProvider"("produkPascabayarId");
CREATE UNIQUE INDEX "TransactionPascabayar_trId_key" ON "TransactionPascabayar"("trId");
CREATE UNIQUE INDEX "TransactionPascabayar_refundId_key" ON "TransactionPascabayar"("refundId");

-- AddForeignKey
ALTER TABLE "ProdukPascabayarProvider" ADD CONSTRAINT "ProdukPascabayarProvider_produkPascabayarId_fkey" FOREIGN KEY ("produkPascabayarId") REFERENCES "ProdukPascabayar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProdukPascabayarProvider" ADD CONSTRAINT "ProdukPascabayarProvider_iakProductId_fkey" FOREIGN KEY ("iakProductId") REFERENCES "IakPascabayarProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProdukPascabayarProvider" ADD CONSTRAINT "ProdukPascabayarProvider_digiflazzProductId_fkey" FOREIGN KEY ("digiflazzProductId") REFERENCES "DigiflazzPascabayarProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransactionPascabayar" ADD CONSTRAINT "TransactionPascabayar_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill pemetaan IAK lama menjadi pemilihan provider eksplisit (satu SKU aktif per produk, deterministik id terkecil)
INSERT INTO "ProdukPascabayarProvider" ("produkPascabayarId", "provider", "providerSku", "iakProductId", "isActive", "createdAt", "updatedAt")
SELECT DISTINCT ON (i."produkPascabayarId") i."produkPascabayarId", 'IAK', COALESCE(i."code", ''), i."id", true, NOW(), NOW()
FROM "IakPascabayarProduct" i
WHERE i."produkPascabayarId" IS NOT NULL
ORDER BY i."produkPascabayarId", i."id" ASC
ON CONFLICT ("produkPascabayarId", "provider") DO NOTHING;

-- Backfill pemilik transaksi lama dari riwayat transaksi induk
UPDATE "TransactionPascabayar" t
SET "memberId" = r."memberId"
FROM "RiwayatTransaksi" r
WHERE t."riwayatTransaksiId" = r."id" AND t."memberId" IS NULL;