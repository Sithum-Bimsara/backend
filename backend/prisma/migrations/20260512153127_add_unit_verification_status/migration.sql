-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "verificationStatus" "UnitStatus" NOT NULL DEFAULT 'PENDING';
