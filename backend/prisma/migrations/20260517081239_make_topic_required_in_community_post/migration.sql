/*
  Warnings:

  - Made the column `topic` on table `CommunityPost` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CommunityPost" ALTER COLUMN "topic" SET NOT NULL;
