-- CreateTable
CREATE TABLE "TakeLaba" (
    "id" SERIAL NOT NULL,
    "kode_invoice" TEXT NOT NULL,
    "jumlah_laba" INTEGER NOT NULL,
    "jumlah_transaksi" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TakeLaba_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TakeLaba_kode_invoice_key" ON "TakeLaba"("kode_invoice");
