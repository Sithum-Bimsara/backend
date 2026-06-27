-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "childPricingAgeFrom" INTEGER,
ADD COLUMN     "childPricingAgeTo" INTEGER,
ADD COLUMN     "childPricingChildrenFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "childPricingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "childPricingInfantsFree" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "occupancyPricingEnabled" BOOLEAN NOT NULL DEFAULT false;
