-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "cancellationPolicy" JSONB;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "localPrice" DOUBLE PRECISION,
ADD COLUMN     "occupancyPricing" JSONB,
ADD COLUMN     "weekendPrice" DOUBLE PRECISION;
