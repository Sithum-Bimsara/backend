-- AlterTable
ALTER TABLE "SearchLog" ADD COLUMN     "clickedDealId" TEXT,
ADD COLUMN     "resultDealIds" JSONB;

-- CreateTable
CREATE TABLE "DealViewEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "dealId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterestProfile" (
    "userId" TEXT NOT NULL,
    "interestedLocations" JSONB,
    "interestedActivities" JSONB,
    "accommodationTypes" JSONB,
    "preferredPriceMin" DOUBLE PRECISION,
    "preferredPriceMax" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInterestProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "DealStats" (
    "dealId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalLocks" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealStats_pkey" PRIMARY KEY ("dealId")
);

-- CreateIndex
CREATE INDEX "DealViewEvent_userId_idx" ON "DealViewEvent"("userId");

-- CreateIndex
CREATE INDEX "DealViewEvent_dealId_idx" ON "DealViewEvent"("dealId");

-- AddForeignKey
ALTER TABLE "DealViewEvent" ADD CONSTRAINT "DealViewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealViewEvent" ADD CONSTRAINT "DealViewEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterestProfile" ADD CONSTRAINT "UserInterestProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealStats" ADD CONSTRAINT "DealStats_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
