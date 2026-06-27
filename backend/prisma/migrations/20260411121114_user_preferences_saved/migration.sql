-- CreateTable
CREATE TABLE "UserRecommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealIds" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRecommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRecommendations_userId_key" ON "UserRecommendations"("userId");

-- AddForeignKey
ALTER TABLE "UserRecommendations" ADD CONSTRAINT "UserRecommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
