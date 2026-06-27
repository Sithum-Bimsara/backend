/*
  Warnings:

  - You are about to drop the column `roomId` on the `RoomVariant` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inventoryId,physicalRoomId]` on the table `RoomVariant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `physicalRoomId` to the `RoomVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_unitId_fkey";

-- DropForeignKey
ALTER TABLE "RoomVariant" DROP CONSTRAINT "RoomVariant_roomId_fkey";

-- DropIndex
DROP INDEX "RoomVariant_inventoryId_roomId_key";

-- DropIndex
DROP INDEX "RoomVariant_roomId_idx";

-- AlterTable
ALTER TABLE "RoomVariant" DROP COLUMN "roomId",
ADD COLUMN     "physicalRoomId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Room";

-- CreateTable
CREATE TABLE "PhysicalRoom" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysicalRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhysicalRoom_unitId_idx" ON "PhysicalRoom"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalRoom_unitId_name_key" ON "PhysicalRoom"("unitId", "name");

-- CreateIndex
CREATE INDEX "RoomVariant_physicalRoomId_idx" ON "RoomVariant"("physicalRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomVariant_inventoryId_physicalRoomId_key" ON "RoomVariant"("inventoryId", "physicalRoomId");

-- AddForeignKey
ALTER TABLE "PhysicalRoom" ADD CONSTRAINT "PhysicalRoom_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomVariant" ADD CONSTRAINT "RoomVariant_physicalRoomId_fkey" FOREIGN KEY ("physicalRoomId") REFERENCES "PhysicalRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
