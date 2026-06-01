-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('administrator', 'staff');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "type" "UserType" NOT NULL DEFAULT 'administrator';
