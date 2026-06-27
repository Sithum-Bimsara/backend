-- CreateEnum
CREATE TYPE "DealReviewBadgeType" AS ENUM ('normal', 'verified');

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DealReview" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "badgeType" "DealReviewBadgeType" NOT NULL DEFAULT 'normal',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealReview_dealId_createdAt_idx" ON "DealReview"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "DealReview_userId_idx" ON "DealReview"("userId");

-- CreateIndex
CREATE INDEX "DealReview_badgeType_idx" ON "DealReview"("badgeType");

-- CreateIndex
CREATE UNIQUE INDEX "DealReview_dealId_userId_key" ON "DealReview"("dealId", "userId");

-- AddForeignKey
ALTER TABLE "DealReview" ADD CONSTRAINT "DealReview_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealReview" ADD CONSTRAINT "DealReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
