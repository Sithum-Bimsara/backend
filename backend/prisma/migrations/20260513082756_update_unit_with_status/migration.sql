/*
  Warnings:

  - A unique constraint covering the columns `[unitId]` on the table `RatePlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RatePlan_unitId_key" ON "RatePlan"("unitId");
