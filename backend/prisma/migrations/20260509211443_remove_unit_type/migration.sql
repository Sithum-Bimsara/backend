/*
  Warnings:

  - You are about to drop the column `type` on the `Unit` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Unit_type_idx";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "type";
