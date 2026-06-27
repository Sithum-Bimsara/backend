-- DropIndex
DROP INDEX "RatePlan_propertyId_name_key";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "homeListingType" TEXT;

-- AlterTable
ALTER TABLE "RatePlan" ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "bathroomItems" JSONB,
ADD COLUMN     "cribsAvailable" BOOLEAN,
ADD COLUMN     "isBathroomPrivate" BOOLEAN,
ADD COLUMN     "roomType" TEXT;

-- CreateIndex
CREATE INDEX "RatePlan_unitId_idx" ON "RatePlan"("unitId");

-- AddForeignKey
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
