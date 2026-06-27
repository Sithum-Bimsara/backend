/*
  Warnings:

  - You are about to drop the column `displayedPrice` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "displayedPrice",
ADD COLUMN     "nonLocalPrice" DOUBLE PRECISION;
