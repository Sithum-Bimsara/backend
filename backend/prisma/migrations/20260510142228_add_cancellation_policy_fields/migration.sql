/*
  Warnings:

  - You are about to drop the column `discountPercentage` on the `RatePlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RatePlan" DROP COLUMN "discountPercentage",
ADD COLUMN     "accidentalBookingProtection" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancellationFeeType" TEXT DEFAULT 'first_night',
ADD COLUMN     "cancellationWindow" TEXT DEFAULT '6pm_arrival';
