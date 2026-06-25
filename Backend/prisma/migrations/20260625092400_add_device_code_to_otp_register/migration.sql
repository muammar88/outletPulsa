-- Drop any remaining data to avoid null constraint errors
TRUNCATE TABLE "OtpRegister";

-- AlterTable
ALTER TABLE "OtpRegister" DROP COLUMN "createdAt",
DROP COLUMN "nomor_tujuan",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device_code" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "whatsapp" TEXT NOT NULL,
ALTER COLUMN "otp" SET NOT NULL;

-- CreateTable
CREATE TABLE "DeviceConnected" (
    "id" SERIAL NOT NULL,
    "device_code" TEXT NOT NULL,
    "member_id" INTEGER,
    "device_name" TEXT,
    "device_brand" TEXT,
    "device_model" TEXT,
    "os_name" TEXT,
    "os_version" TEXT,
    "app_version" TEXT,
    "last_login" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceConnected_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceConnected_device_code_key" ON "DeviceConnected"("device_code");

-- CreateIndex
CREATE UNIQUE INDEX "Member_whatsappnumber_key" ON "Member"("whatsappnumber");

-- CreateIndex
CREATE INDEX "OtpRegister_device_code_idx" ON "OtpRegister"("device_code");

-- CreateIndex
CREATE INDEX "OtpRegister_whatsapp_idx" ON "OtpRegister"("whatsapp");

-- AddForeignKey
ALTER TABLE "DeviceConnected" ADD CONSTRAINT "DeviceConnected_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
