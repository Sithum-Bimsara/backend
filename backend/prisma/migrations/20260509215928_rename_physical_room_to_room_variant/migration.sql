/*
  Warnings:

  - You are about to drop the `PhysicalRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomVariantStatus" AS ENUM ('available', 'booked', 'maintenance', 'blocked', 'locked');

-- DropForeignKey
ALTER TABLE "PhysicalRoom" DROP CONSTRAINT "PhysicalRoom_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "PhysicalRoom" DROP CONSTRAINT "PhysicalRoom_roomId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomBookingSlots" DROP CONSTRAINT "_RoomBookingSlots_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoomLockSlots" DROP CONSTRAINT "_RoomLockSlots_B_fkey";

-- DropTable
DROP TABLE "PhysicalRoom";

-- DropEnum
DROP TYPE "PhysicalRoomStatus";

-- CreateTable
CREATE TABLE "RoomVariant" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" "RoomVariantStatus" NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomVariant_inventoryId_idx" ON "RoomVariant"("inventoryId");

-- CreateIndex
CREATE INDEX "RoomVariant_roomId_idx" ON "RoomVariant"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomVariant_inventoryId_roomId_key" ON "RoomVariant"("inventoryId", "roomId");

-- AddForeignKey
ALTER TABLE "RoomVariant" ADD CONSTRAINT "RoomVariant_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "RoomInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomVariant" ADD CONSTRAINT "RoomVariant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Clear orphaned join table records
DELETE FROM "_RoomLockSlots";
DELETE FROM "_RoomBookingSlots";

-- AddForeignKey
ALTER TABLE "_RoomLockSlots" ADD CONSTRAINT "_RoomLockSlots_B_fkey" FOREIGN KEY ("B") REFERENCES "RoomVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomBookingSlots" ADD CONSTRAINT "_RoomBookingSlots_B_fkey" FOREIGN KEY ("B") REFERENCES "RoomVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
