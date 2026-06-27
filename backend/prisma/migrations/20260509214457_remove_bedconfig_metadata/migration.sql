/*
  Warnings:

  - You are about to drop the column `roomName` on the `BedConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `roomType` on the `BedConfiguration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[unitId,bedType]` on the table `BedConfiguration` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BedConfiguration_unitId_roomName_bedType_key";

-- AlterTable
ALTER TABLE "BedConfiguration" DROP COLUMN "roomName",
DROP COLUMN "roomType";

-- CreateIndex
CREATE UNIQUE INDEX "BedConfiguration_unitId_bedType_key" ON "BedConfiguration"("unitId", "bedType");
