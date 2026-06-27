-- CreateEnum
CREATE TYPE "PhysicalRoomStatus" AS ENUM ('available', 'maintenance', 'blocked');

-- AlterTable
ALTER TABLE "PhysicalRoom" ADD COLUMN     "status" "PhysicalRoomStatus" NOT NULL DEFAULT 'available';
