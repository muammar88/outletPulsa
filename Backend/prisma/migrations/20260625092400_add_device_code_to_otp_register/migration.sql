-- Drop any remaining data to avoid null constraint errors
TRUNCATE TABLE "OtpRegister";

-- AlterTable
ALTER TABLE "OtpRegister" ADD COLUMN     "device_code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OtpRegister_device_code_key" ON "OtpRegister"("device_code");

-- CreateIndex
CREATE INDEX "OtpRegister_whatsapp_idx" ON "OtpRegister"("whatsapp");
