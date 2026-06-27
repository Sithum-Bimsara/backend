/*
  Warnings:

  - You are about to drop the column `lockMinutes` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `lockMinutes` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "lockMinutes";

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "lockMinutes",
ADD COLUMN     "dealLockExpireTime" INTEGER NOT NULL DEFAULT 1;
