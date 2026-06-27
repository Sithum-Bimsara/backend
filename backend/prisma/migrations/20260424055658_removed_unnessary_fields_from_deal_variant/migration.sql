/*
  Warnings:

  - You are about to drop the column `dealPrice` on the `DealVariant` table. All the data in the column will be lost.
  - You are about to drop the column `ruleId` on the `DealVariant` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `DealVariant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DealVariant" DROP CONSTRAINT "DealVariant_ruleId_fkey";

-- AlterTable
ALTER TABLE "DealVariant" DROP COLUMN "dealPrice",
DROP COLUMN "ruleId",
DROP COLUMN "title";
