/*
  Warnings:

  - You are about to drop the column `submenu_id` on the `TabMenu` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TabMenu" DROP CONSTRAINT "TabMenu_submenu_id_fkey";

-- AlterTable
ALTER TABLE "TabMenu" DROP COLUMN "submenu_id";
