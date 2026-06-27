/*
  Warnings:

  - You are about to drop the `AccommodationBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccommodationLock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Property` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecurringRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccommodationBooking" DROP CONSTRAINT "AccommodationBooking_lockId_fkey";

-- DropForeignKey
ALTER TABLE "AccommodationBooking" DROP CONSTRAINT "AccommodationBooking_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "AccommodationBooking" DROP CONSTRAINT "AccommodationBooking_userId_fkey";

-- DropForeignKey
ALTER TABLE "AccommodationLock" DROP CONSTRAINT "AccommodationLock_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "AccommodationLock" DROP CONSTRAINT "AccommodationLock_userId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_merchantId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringRule" DROP CONSTRAINT "RecurringRule_dealId_fkey";

-- DropForeignKey
ALTER TABLE "RoomInventory" DROP CONSTRAINT "RoomInventory_roomTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RoomType" DROP CONSTRAINT "RoomType_propertyId_fkey";

-- DropTable
DROP TABLE "AccommodationBooking";

-- DropTable
DROP TABLE "AccommodationLock";

-- DropTable
DROP TABLE "Property";

-- DropTable
DROP TABLE "RecurringRule";

-- DropTable
DROP TABLE "RoomInventory";

-- DropTable
DROP TABLE "RoomType";

-- DropEnum
DROP TYPE "AccommodationBookingStatus";

-- DropEnum
DROP TYPE "RecurringType";
