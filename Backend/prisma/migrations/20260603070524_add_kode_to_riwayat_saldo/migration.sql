/*
  Warnings:

  - Added the required column `kode` to the `riwayat_saldo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "riwayat_saldo" ADD COLUMN     "kode" TEXT NOT NULL;
