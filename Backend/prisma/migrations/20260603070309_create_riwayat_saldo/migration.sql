/*
  Warnings:

  - You are about to drop the column `agenType` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Member` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RiwayatSaldoStatus" AS ENUM ('pembelian_pulsa', 'deposit', 'transfer_pulsa', 'pencairan_fee_agen');

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "agenType",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "AgenType";

-- DropEnum
DROP TYPE "MemberType";

-- CreateTable
CREATE TABLE "riwayat_saldo" (
    "id" SERIAL NOT NULL,
    "nominal" INTEGER NOT NULL,
    "status" "RiwayatSaldoStatus" NOT NULL,
    "ket" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "riwayat_saldo_pkey" PRIMARY KEY ("id")
);
