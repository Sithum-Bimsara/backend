-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: room_entity_model
-- Summary:
--   1. Creates the new permanent `Room` table (per-unit, named entity)
--   2. Backfills Room rows from existing PhysicalRoom.roomNumber values
--   3. Adds roomId FK column to PhysicalRoom (nullable first for backfill)
--   4. Populates roomId for all existing PhysicalRoom rows
--   5. Makes roomId NOT NULL and drops the old roomNumber column
--   6. Adds indices and unique constraints
-- ══════════════════════════════════════════════════════════════════════════════

-- Step 1: Drop the old unique index that references roomNumber
DROP INDEX "PhysicalRoom_inventoryId_roomNumber_key";

-- Step 2: Create the Room table
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- Step 3: Indices for Room
CREATE INDEX "Room_unitId_idx" ON "Room"("unitId");
CREATE UNIQUE INDEX "Room_unitId_name_key" ON "Room"("unitId", "name");

-- Step 4: FK from Room → Unit
ALTER TABLE "Room" ADD CONSTRAINT "Room_unitId_fkey"
    FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Backfill — insert one Room row per unique (unitId, roomNumber) combination
-- We derive unitId by joining through RoomInventory
INSERT INTO "Room" ("id", "unitId", "name", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    ri."unitId",
    pr."roomNumber",
    NOW(),
    NOW()
FROM "PhysicalRoom" pr
JOIN "RoomInventory" ri ON ri."id" = pr."inventoryId"
GROUP BY ri."unitId", pr."roomNumber";

-- Step 6: Add roomId as nullable first so we can backfill
ALTER TABLE "PhysicalRoom" ADD COLUMN "roomId" TEXT;

-- Step 7: Populate roomId by matching unitId + roomNumber
UPDATE "PhysicalRoom" pr
SET "roomId" = r."id"
FROM "Room" r
JOIN "RoomInventory" ri ON ri."unitId" = r."unitId"
WHERE ri."id" = pr."inventoryId"
  AND r."name" = pr."roomNumber";

-- Step 8: Make roomId NOT NULL now that all rows are populated
ALTER TABLE "PhysicalRoom" ALTER COLUMN "roomId" SET NOT NULL;

-- Step 9: Drop the old roomNumber column
ALTER TABLE "PhysicalRoom" DROP COLUMN "roomNumber";

-- Step 10: Add FK from PhysicalRoom → Room
ALTER TABLE "PhysicalRoom" ADD CONSTRAINT "PhysicalRoom_roomId_fkey"
    FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 11: Add new index and unique constraint
CREATE INDEX "PhysicalRoom_roomId_idx" ON "PhysicalRoom"("roomId");
CREATE UNIQUE INDEX "PhysicalRoom_inventoryId_roomId_key" ON "PhysicalRoom"("inventoryId", "roomId");
