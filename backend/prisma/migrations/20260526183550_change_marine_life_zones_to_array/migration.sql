/*
  Warnings:

  - The `marineLifeZones` column on the `Island` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Island" DROP COLUMN "marineLifeZones",
ADD COLUMN     "marineLifeZones" TEXT[];
