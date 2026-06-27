/*
  Warnings:

  - You are about to drop the column `customAddons` on the `AccommodationBooking` table. All the data in the column will be lost.
  - You are about to drop the column `customAddons` on the `AccommodationLock` table. All the data in the column will be lost.
  - You are about to drop the column `customAddons` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `customAddons` on the `DealLock` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationPolicy` on the `RatePlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccommodationBooking" DROP COLUMN "customAddons";

-- AlterTable
ALTER TABLE "AccommodationLock" DROP COLUMN "customAddons";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "customAddons";

-- AlterTable
ALTER TABLE "DealLock" DROP COLUMN "customAddons";

-- AlterTable
ALTER TABLE "RatePlan" DROP COLUMN "cancellationPolicy";

-- CreateTable
CREATE TABLE "CustomAddon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "details" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealLockId" TEXT,
    "accommodationLockId" TEXT,
    "dealBookingId" TEXT,
    "accommodationBookingId" TEXT,

    CONSTRAINT "CustomAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomAddon_dealLockId_idx" ON "CustomAddon"("dealLockId");

-- CreateIndex
CREATE INDEX "CustomAddon_accommodationLockId_idx" ON "CustomAddon"("accommodationLockId");

-- CreateIndex
CREATE INDEX "CustomAddon_dealBookingId_idx" ON "CustomAddon"("dealBookingId");

-- CreateIndex
CREATE INDEX "CustomAddon_accommodationBookingId_idx" ON "CustomAddon"("accommodationBookingId");

-- AddForeignKey
ALTER TABLE "CustomAddon" ADD CONSTRAINT "CustomAddon_dealLockId_fkey" FOREIGN KEY ("dealLockId") REFERENCES "DealLock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAddon" ADD CONSTRAINT "CustomAddon_accommodationLockId_fkey" FOREIGN KEY ("accommodationLockId") REFERENCES "AccommodationLock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAddon" ADD CONSTRAINT "CustomAddon_dealBookingId_fkey" FOREIGN KEY ("dealBookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAddon" ADD CONSTRAINT "CustomAddon_accommodationBookingId_fkey" FOREIGN KEY ("accommodationBookingId") REFERENCES "AccommodationBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
