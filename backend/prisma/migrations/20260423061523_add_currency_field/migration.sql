-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ALTER COLUMN "isActive" SET DEFAULT false;
