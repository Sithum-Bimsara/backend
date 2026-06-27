/*
  Warnings:

  - You are about to drop the column `country` on the `Property` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Property_type_city_country_idx";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "country",
ADD COLUMN     "island" TEXT;

-- CreateIndex
CREATE INDEX "Property_type_city_island_idx" ON "Property"("type", "city", "island");
