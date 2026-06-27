/*
  Warnings:

  - You are about to drop the column `category` on the `CommunityPost` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `CommunityPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CommunityPost" DROP COLUMN "category",
DROP COLUMN "tags";
