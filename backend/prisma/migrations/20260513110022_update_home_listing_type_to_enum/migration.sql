/*
  Warnings:

  - The `homeListingType` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "homeListingType",
ADD COLUMN     "homeListingType" "UnitType" NOT NULL DEFAULT 'private_room';
