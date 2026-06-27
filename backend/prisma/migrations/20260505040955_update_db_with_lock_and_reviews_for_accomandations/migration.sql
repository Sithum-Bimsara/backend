/*
  Warnings:

  - A unique constraint covering the columns `[lockId]` on the table `AccommodationBooking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PhysicalRoomStatus" AS ENUM ('available', 'booked', 'maintenance', 'blocked');

-- AlterTable
ALTER TABLE "AccommodationBooking" ADD COLUMN     "lockId" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PhysicalRoom" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "status" "PhysicalRoomStatus" NOT NULL DEFAULT 'available',

    CONSTRAINT "PhysicalRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccommodationLock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "lockedPrice" DOUBLE PRECISION NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "LockStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccommodationLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccommodationReview" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "badgeType" "DealReviewBadgeType" NOT NULL DEFAULT 'normal',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccommodationReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomLockSlots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomLockSlots_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RoomBookingSlots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomBookingSlots_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "PhysicalRoom_inventoryId_idx" ON "PhysicalRoom"("inventoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalRoom_inventoryId_roomNumber_key" ON "PhysicalRoom"("inventoryId", "roomNumber");

-- CreateIndex
CREATE INDEX "AccommodationLock_userId_idx" ON "AccommodationLock"("userId");

-- CreateIndex
CREATE INDEX "AccommodationLock_status_expiresAt_idx" ON "AccommodationLock"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "AccommodationReview_propertyId_createdAt_idx" ON "AccommodationReview"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "AccommodationReview_userId_idx" ON "AccommodationReview"("userId");

-- CreateIndex
CREATE INDEX "AccommodationReview_badgeType_idx" ON "AccommodationReview"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "AccommodationReview_propertyId_userId_key" ON "AccommodationReview"("propertyId", "userId");

-- CreateIndex
CREATE INDEX "_RoomLockSlots_B_index" ON "_RoomLockSlots"("B");

-- CreateIndex
CREATE INDEX "_RoomBookingSlots_B_index" ON "_RoomBookingSlots"("B");

-- CreateIndex
CREATE UNIQUE INDEX "AccommodationBooking_lockId_key" ON "AccommodationBooking"("lockId");

-- AddForeignKey
ALTER TABLE "PhysicalRoom" ADD CONSTRAINT "PhysicalRoom_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "RoomInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationLock" ADD CONSTRAINT "AccommodationLock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationLock" ADD CONSTRAINT "AccommodationLock_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationLock" ADD CONSTRAINT "AccommodationLock_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationBooking" ADD CONSTRAINT "AccommodationBooking_lockId_fkey" FOREIGN KEY ("lockId") REFERENCES "AccommodationLock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationReview" ADD CONSTRAINT "AccommodationReview_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationReview" ADD CONSTRAINT "AccommodationReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomLockSlots" ADD CONSTRAINT "_RoomLockSlots_A_fkey" FOREIGN KEY ("A") REFERENCES "AccommodationLock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomLockSlots" ADD CONSTRAINT "_RoomLockSlots_B_fkey" FOREIGN KEY ("B") REFERENCES "PhysicalRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomBookingSlots" ADD CONSTRAINT "_RoomBookingSlots_A_fkey" FOREIGN KEY ("A") REFERENCES "AccommodationBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomBookingSlots" ADD CONSTRAINT "_RoomBookingSlots_B_fkey" FOREIGN KEY ("B") REFERENCES "PhysicalRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
