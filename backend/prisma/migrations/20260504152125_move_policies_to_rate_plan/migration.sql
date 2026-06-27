/*
  Warnings:

  - You are about to drop the column `cancellationPolicy` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `childPricingAgeFrom` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `childPricingAgeTo` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `childPricingChildrenFree` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `childPricingEnabled` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `childPricingInfantsFree` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `occupancyPricing` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `occupancyPricingEnabled` on the `Unit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "cancellationPolicy",
DROP COLUMN "childPricingAgeFrom",
DROP COLUMN "childPricingAgeTo",
DROP COLUMN "childPricingChildrenFree",
DROP COLUMN "childPricingEnabled",
DROP COLUMN "childPricingInfantsFree";

-- AlterTable
ALTER TABLE "RatePlan" ADD COLUMN     "childPricingAgeFrom" INTEGER,
ADD COLUMN     "childPricingAgeTo" INTEGER,
ADD COLUMN     "childPricingChildrenFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "childPricingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "childPricingInfantsFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occupancyPricing" JSONB,
ADD COLUMN     "occupancyPricingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "occupancyPricing",
DROP COLUMN "occupancyPricingEnabled";
