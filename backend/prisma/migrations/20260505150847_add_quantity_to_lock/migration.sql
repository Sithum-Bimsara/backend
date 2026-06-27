/*
  Warnings:

  - Added the required column `quantity` to the `AccommodationLock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccommodationLock" ADD COLUMN     "quantity" INTEGER NOT NULL;
