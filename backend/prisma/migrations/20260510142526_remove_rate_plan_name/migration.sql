/*
  Warnings:

  - You are about to drop the column `name` on the `RatePlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RatePlan" DROP COLUMN "name";

-- DropEnum
DROP TYPE "RatePlanName";
