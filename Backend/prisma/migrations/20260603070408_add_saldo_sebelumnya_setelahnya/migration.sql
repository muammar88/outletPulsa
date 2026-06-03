/*
  Warnings:

  - Added the required column `saldo_sebelumnya` to the `riwayat_saldo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldo_setelahnya` to the `riwayat_saldo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "riwayat_saldo" ADD COLUMN     "saldo_sebelumnya" INTEGER NOT NULL,
ADD COLUMN     "saldo_setelahnya" INTEGER NOT NULL;
