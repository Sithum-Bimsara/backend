/*
  Warnings:

  - You are about to drop the column `weekendPrice` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "weekendPrice",
ADD COLUMN     "displayedPrice" DOUBLE PRECISION;
