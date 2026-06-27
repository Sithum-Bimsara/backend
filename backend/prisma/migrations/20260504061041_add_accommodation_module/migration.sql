-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('apartment', 'home', 'hotel', 'alternative');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('entire_place', 'private_room', 'shared');

-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('twin', 'full', 'queen', 'king', 'sofa', 'bunk', 'futon');

-- CreateEnum
CREATE TYPE "RoomInventoryStatus" AS ENUM ('available', 'blocked', 'sold_out');

-- CreateEnum
CREATE TYPE "AccommodationBookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "RatePlanName" AS ENUM ('standard', 'non_refundable', 'weekly');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL DEFAULT 'apartment',
    "category" TEXT,
    "name" TEXT,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "propertyFacilities" JSONB,
    "services" JSONB,
    "languages" JSONB,
    "houseRules" JSONB,
    "checkInFrom" TEXT,
    "checkInTo" TEXT,
    "checkOutFrom" TEXT,
    "checkOutTo" TEXT,
    "smokingAllowed" BOOLEAN,
    "childrenAllowed" BOOLEAN,
    "partiesAllowed" BOOLEAN,
    "petsPolicy" JSONB,
    "petFeesPolicy" JSONB,
    "hostProfile" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UnitType" NOT NULL,
    "maxGuests" INTEGER,
    "excludeInfants" BOOLEAN NOT NULL DEFAULT false,
    "bathrooms" DOUBLE PRECISION,
    "size" DOUBLE PRECISION,
    "smokingAllowed" BOOLEAN,
    "pricePerNight" DOUBLE PRECISION,
    "amenities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedConfiguration" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "bedType" "BedType" NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "BedConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomInventory" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalRooms" INTEGER NOT NULL,
    "availableRooms" INTEGER NOT NULL,
    "priceOverride" DOUBLE PRECISION,
    "status" "RoomInventoryStatus" NOT NULL DEFAULT 'available',

    CONSTRAINT "RoomInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccommodationBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "AccommodationBookingStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccommodationBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatePlan" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" "RatePlanName" NOT NULL,
    "discountPercentage" DOUBLE PRECISION,
    "cancellationPolicy" JSONB,

    CONSTRAINT "RatePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_merchantId_createdAt_idx" ON "Property"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "Property_type_city_country_idx" ON "Property"("type", "city", "country");

-- CreateIndex
CREATE INDEX "Property_isActive_idx" ON "Property"("isActive");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "Unit_propertyId_idx" ON "Unit"("propertyId");

-- CreateIndex
CREATE INDEX "Unit_type_idx" ON "Unit"("type");

-- CreateIndex
CREATE INDEX "BedConfiguration_unitId_idx" ON "BedConfiguration"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "BedConfiguration_unitId_roomName_bedType_key" ON "BedConfiguration"("unitId", "roomName", "bedType");

-- CreateIndex
CREATE INDEX "RoomInventory_unitId_date_idx" ON "RoomInventory"("unitId", "date");

-- CreateIndex
CREATE INDEX "RoomInventory_status_idx" ON "RoomInventory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RoomInventory_unitId_date_key" ON "RoomInventory"("unitId", "date");

-- CreateIndex
CREATE INDEX "AccommodationBooking_userId_idx" ON "AccommodationBooking"("userId");

-- CreateIndex
CREATE INDEX "AccommodationBooking_propertyId_checkInDate_checkOutDate_idx" ON "AccommodationBooking"("propertyId", "checkInDate", "checkOutDate");

-- CreateIndex
CREATE INDEX "AccommodationBooking_unitId_status_idx" ON "AccommodationBooking"("unitId", "status");

-- CreateIndex
CREATE INDEX "RatePlan_propertyId_idx" ON "RatePlan"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "RatePlan_propertyId_name_key" ON "RatePlan"("propertyId", "name");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "MerchantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedConfiguration" ADD CONSTRAINT "BedConfiguration_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInventory" ADD CONSTRAINT "RoomInventory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationBooking" ADD CONSTRAINT "AccommodationBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationBooking" ADD CONSTRAINT "AccommodationBooking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationBooking" ADD CONSTRAINT "AccommodationBooking_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
