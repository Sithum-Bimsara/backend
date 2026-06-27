/*
  Warnings:

  - Made the column `title` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `durationDays` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originalPrice` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dealLockExpireTime` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dealPrice` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `displayedPrice` on table `Deal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `Deal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "durationDays" SET NOT NULL,
ALTER COLUMN "originalPrice" SET NOT NULL,
ALTER COLUMN "dealLockExpireTime" SET NOT NULL,
ALTER COLUMN "dealPrice" SET NOT NULL,
ALTER COLUMN "displayedPrice" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL;
