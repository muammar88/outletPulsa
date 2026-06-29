-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priority" TEXT DEFAULT 'Normal',
ADD COLUMN     "start_date" TIMESTAMP(3);

