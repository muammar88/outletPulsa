-- DropIndex
DROP INDEX "OtpRegister_device_code_key";

-- CreateIndex
CREATE INDEX "OtpRegister_device_code_idx" ON "OtpRegister"("device_code");
