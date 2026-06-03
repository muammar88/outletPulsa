/*
  Warnings:

  - Added the required column `member_id` to the `riwayat_saldo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "riwayat_saldo" ADD COLUMN     "member_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "riwayat_saldo_member_id_idx" ON "riwayat_saldo"("member_id");

-- AddForeignKey
ALTER TABLE "riwayat_saldo" ADD CONSTRAINT "riwayat_saldo_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
