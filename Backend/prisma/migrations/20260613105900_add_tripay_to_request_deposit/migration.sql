-- AlterTable
ALTER TABLE "RequestDeposit" ADD COLUMN     "checkoutUrl" TEXT,
ADD COLUMN     "tripayFee" INTEGER,
ADD COLUMN     "tripayMerchantRef" TEXT,
ADD COLUMN     "tripayMethod" TEXT,
ADD COLUMN     "tripayReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RequestDeposit_tripayReference_key" ON "RequestDeposit"("tripayReference");
