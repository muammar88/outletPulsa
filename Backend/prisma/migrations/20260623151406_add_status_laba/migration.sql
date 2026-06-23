-- CreateEnum
CREATE TYPE "StatusLaba" AS ENUM ('paid', 'unpaid');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status_laba" "StatusLaba" DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE "TransactionPascabayar" ADD COLUMN     "status_laba" "StatusLaba" DEFAULT 'unpaid';
