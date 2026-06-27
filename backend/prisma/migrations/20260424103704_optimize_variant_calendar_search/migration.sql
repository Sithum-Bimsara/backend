-- DropIndex
DROP INDEX "DealVariant_status_idx";

-- CreateIndex
CREATE INDEX "DealVariant_dealId_status_startDatetime_idx" ON "DealVariant"("dealId", "status", "startDatetime");
