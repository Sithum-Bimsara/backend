-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "selectedExclusionIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
