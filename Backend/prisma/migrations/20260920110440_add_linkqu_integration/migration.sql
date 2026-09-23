-- CreateEnum
CREATE TYPE "OperatorStatus" AS ENUM ('active', 'non_active');

-- CreateEnum
CREATE TYPE "TempRegistrasiStatus" AS ENUM ('unregistrated', 'regitrated');

-- AlterTable
ALTER TABLE "DigiflazzSellerProduct" ADD COLUMN     "temp_status" "DigiflazzSellerStatus" DEFAULT 'unbanned';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "NotificationRecipient" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Operator" ADD COLUMN     "status" "OperatorStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "PengaturanUmum" ADD COLUMN     "linkqu_base_url_dev" TEXT,
ADD COLUMN     "linkqu_base_url_prod" TEXT,
ADD COLUMN     "linkqu_client_id" TEXT,
ADD COLUMN     "linkqu_client_secret" TEXT,
ADD COLUMN     "linkqu_is_active" BOOLEAN DEFAULT false,
ADD COLUMN     "linkqu_is_sandbox" BOOLEAN DEFAULT true,
ADD COLUMN     "linkqu_merchant_code" TEXT,
ADD COLUMN     "linkqu_payment_ewallet" BOOLEAN DEFAULT true,
ADD COLUMN     "linkqu_payment_qris" BOOLEAN DEFAULT true,
ADD COLUMN     "linkqu_payment_va" BOOLEAN DEFAULT true,
ADD COLUMN     "linkqu_pin" TEXT,
ADD COLUMN     "linkqu_signature_key" TEXT;

-- CreateTable
CREATE TABLE "Temp_registrasi" (
    "id" SERIAL NOT NULL,
    "device_code" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "fullname" TEXT,
    "password" TEXT,
    "kode_agen" TEXT,
    "verification_code" TEXT,
    "status" "TempRegistrasiStatus" NOT NULL DEFAULT 'unregistrated',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Temp_registrasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emoney_linkqus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "image" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emoney_linkqus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_linkqus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "image" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_linkqus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_transactions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "partner_reff" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "bank_code" TEXT,
    "bank_name" TEXT,
    "virtual_account" TEXT,
    "amount" DECIMAL(20,2) NOT NULL,
    "fee_admin" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(20,2) NOT NULL,
    "expired_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'LINKQU',
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "requestDepositId" INTEGER,

    CONSTRAINT "payment_gateway_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Temp_registrasi_verification_code_key" ON "Temp_registrasi"("verification_code");

-- CreateIndex
CREATE INDEX "Temp_registrasi_device_code_idx" ON "Temp_registrasi"("device_code");

-- CreateIndex
CREATE INDEX "Temp_registrasi_whatsapp_idx" ON "Temp_registrasi"("whatsapp");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_transactions_uuid_key" ON "payment_gateway_transactions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_transactions_partner_reff_key" ON "payment_gateway_transactions"("partner_reff");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_transactions_requestDepositId_key" ON "payment_gateway_transactions"("requestDepositId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gateway_transactions" ADD CONSTRAINT "payment_gateway_transactions_requestDepositId_fkey" FOREIGN KEY ("requestDepositId") REFERENCES "RequestDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
