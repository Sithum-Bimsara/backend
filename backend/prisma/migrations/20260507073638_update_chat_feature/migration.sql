-- AlterTable
ALTER TABLE "AccommodationBooking" ADD COLUMN     "customAddons" JSONB;

-- AlterTable
ALTER TABLE "AccommodationLock" ADD COLUMN     "customAddons" JSONB;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "customAddons" JSONB;

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "accommodationLockId" TEXT,
ADD COLUMN     "dealLockId" TEXT;

-- AlterTable
ALTER TABLE "DealLock" ADD COLUMN     "customAddons" JSONB;

-- CreateIndex
CREATE INDEX "ChatRoom_dealLockId_idx" ON "ChatRoom"("dealLockId");

-- CreateIndex
CREATE INDEX "ChatRoom_accommodationLockId_idx" ON "ChatRoom"("accommodationLockId");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_dealLockId_fkey" FOREIGN KEY ("dealLockId") REFERENCES "DealLock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_accommodationLockId_fkey" FOREIGN KEY ("accommodationLockId") REFERENCES "AccommodationLock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
