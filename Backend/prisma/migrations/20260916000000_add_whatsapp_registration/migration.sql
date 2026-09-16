-- AlterTable
ALTER TABLE "OtpRegister" ADD COLUMN "fullname" TEXT;
ALTER TABLE "OtpRegister" ADD COLUMN "password" TEXT;
ALTER TABLE "OtpRegister" ADD COLUMN "kode_agen" TEXT;
ALTER TABLE "OtpRegister" ADD COLUMN "verification_code" TEXT;
ALTER TABLE "OtpRegister" ALTER COLUMN "otp" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OtpRegister_verification_code_key" ON "OtpRegister"("verification_code");
