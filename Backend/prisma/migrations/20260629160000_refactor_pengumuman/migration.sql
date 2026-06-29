-- CreateTable "Notification" (jika belum ada di production)
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image_url" TEXT,
    "payload" TEXT,
    "notification_type" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT,
    "created_by" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "sent_at" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "priority" TEXT DEFAULT 'Normal',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable "NotificationRecipient" (jika belum ada di production)
CREATE TABLE IF NOT EXISTS "NotificationRecipient" (
    "id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "member_id" INTEGER,
    "device_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "error_message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (jika belum ada)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'NotificationRecipient_notification_id_fkey'
    ) THEN
        ALTER TABLE "NotificationRecipient"
            ADD CONSTRAINT "NotificationRecipient_notification_id_fkey"
            FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'NotificationRecipient_member_id_fkey'
    ) THEN
        ALTER TABLE "NotificationRecipient"
            ADD CONSTRAINT "NotificationRecipient_member_id_fkey"
            FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'NotificationRecipient_device_code_fkey'
    ) THEN
        ALTER TABLE "NotificationRecipient"
            ADD CONSTRAINT "NotificationRecipient_device_code_fkey"
            FOREIGN KEY ("device_code") REFERENCES "DeviceConnected"("device_code") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable: Tambah kolom baru jika tabel sudah ada sebelumnya (untuk lokal dev)
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "end_date" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'Normal';
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "start_date" TIMESTAMP(3);

