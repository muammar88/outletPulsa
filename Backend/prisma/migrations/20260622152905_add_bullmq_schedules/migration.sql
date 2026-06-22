-- AlterTable
ALTER TABLE "PengaturanUmum" ADD COLUMN     "bullmq_schedules" TEXT;

-- CreateIndex
CREATE INDEX "Member_whatsappnumber_idx" ON "Member"("whatsappnumber");

-- CreateIndex
CREATE INDEX "Member_kode_idx" ON "Member"("kode");

-- CreateIndex
CREATE INDEX "Produk_kode_idx" ON "Produk"("kode");

-- CreateIndex
CREATE INDEX "Produk_status_idx" ON "Produk"("status");

-- CreateIndex
CREATE INDEX "Produk_operatorId_idx" ON "Produk"("operatorId");

-- CreateIndex
CREATE INDEX "Transaction_riwayatTransaksiId_idx" ON "Transaction"("riwayatTransaksiId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
