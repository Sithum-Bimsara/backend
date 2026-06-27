/*
  Warnings:

  - You are about to drop the column `physicalRoomId` on the `RoomVariant` table. All the data in the column will be lost.
  - You are about to drop the `PhysicalRoom` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inventoryId,roomNumber]` on the table `RoomVariant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomNumber` to the `RoomVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PhysicalRoom" DROP CONSTRAINT "PhysicalRoom_unitId_fkey";

-- DropForeignKey
ALTER TABLE "RoomVariant" DROP CONSTRAINT "RoomVariant_physicalRoomId_fkey";

-- DropIndex
DROP INDEX "RoomVariant_inventoryId_physicalRoomId_key";

-- DropIndex
DROP INDEX "RoomVariant_physicalRoomId_idx";

-- AlterTable
ALTER TABLE "RoomVariant" DROP COLUMN "physicalRoomId",
ADD COLUMN     "roomNumber" INTEGER NOT NULL;

-- DropTable
DROP TABLE "PhysicalRoom";

-- DropEnum
DROP TYPE "PhysicalRoomStatus";

-- CreateIndex
CREATE UNIQUE INDEX "RoomVariant_inventoryId_roomNumber_key" ON "RoomVariant"("inventoryId", "roomNumber");
