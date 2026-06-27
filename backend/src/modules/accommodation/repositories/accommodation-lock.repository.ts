import { prisma } from "../../../config/prisma";
import { Prisma, LockStatus } from "@prisma/client";
import { 
  RoomsNotAvailableException, 
  InternalProcessingException,
  LockInactiveException
} from "../../../exceptions/domain.exceptions";
import { getSriLankaTime } from "../../../utils/timezone";
import { 
  lockFullInclude, 
  bookingFullInclude, 
  AccommodationLockRecord, 
  AccommodationBookingRecord 
} from "../types/accommodation-lock.types";

// ─── Helpers ───

/**
 * Normalizes a date to the start of the day in UTC (00:00:00.000).
 * This ensures consistency with how dates are stored in the RoomInventory table.
 */
const normalizeToStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

// ─── Read ───

export const getLockById = async (id: string): Promise<AccommodationLockRecord | null> => {
  return prisma.accommodationLock.findUnique({
    where: { id },
    include: lockFullInclude,
  });
};

export const getLockDetailById = async (id: string): Promise<AccommodationLockRecord | null> => {
  return prisma.accommodationLock.findUnique({
    where: { id },
    include: lockFullInclude,
  });
};

export const getBookingById = async (id: string): Promise<AccommodationBookingRecord | null> => {
  return prisma.accommodationBooking.findUnique({
    where: { id },
    include: bookingFullInclude,
  });
};

export const getUnitForLocking = async (unitId: string) => {
  return prisma.unit.findUnique({
    where: { id: unitId },
    include: { property: { include: { merchant: true } } },
  });
};

export const findManyLocks = async (
  where: Prisma.AccommodationLockWhereInput,
  limit: number,
  cursor?: string
): Promise<{ items: AccommodationLockRecord[]; nextCursor: string | null }> => {
  const items = await prisma.accommodationLock.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: lockFullInclude,
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor };
};

// ─── Write (Transactions) ───

export const createAccommodationLock = async (data: {
  userId: string;
  propertyId: string;
  unitId: string;
  checkInDate: Date;
  checkOutDate: Date;
  lockedPrice: number;
  expiresAt: Date;
  quantity: number;
  createdAt: Date;
}): Promise<AccommodationLockRecord> => {
  const checkIn = normalizeToStartOfDay(data.checkInDate);
  const checkOut = normalizeToStartOfDay(data.checkOutDate);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  return prisma.$transaction(async (tx) => {
    // 1. Re-verify availability inside the transaction to prevent race conditions
    const inventories = await tx.roomInventory.findMany({
      where: {
        unitId: data.unitId,
        date: { gte: checkIn, lt: checkOut },
        status: "available",
      },
      include: {
        slots: {
          where: {
            status: "available",
            locks: {
              none: {
                status: "active",
                expiresAt: { gt: getSriLankaTime() },
              },
            },
            bookings: {
              none: {
                status: { in: ["confirmed", "pending"] },
              },
            },
          },
          select: { id: true, roomNumber: true },
        },
      },
    });

    // 2. Defensive check: Ensure all dates in range have inventory records
    if (inventories.length !== nights) {
      throw new RoomsNotAvailableException(`Inventory records missing or unavailable for ${nights} nights.`);
    }

    // 3. Identification of physical rooms available across the entire stay
    const roomOccurrences: Record<number, number> = {};
    inventories.forEach((inv) => {
      inv.slots.forEach((slot) => {
        roomOccurrences[slot.roomNumber] = (roomOccurrences[slot.roomNumber] || 0) + 1;
      });
    });

    const availableRoomNumbers = Object.keys(roomOccurrences)
      .map(Number)
      .filter((num) => roomOccurrences[num] === nights);

    if (availableRoomNumbers.length < data.quantity) {
      throw new RoomsNotAvailableException("The selected room is no longer available for these dates.");
    }

    availableRoomNumbers.sort((a, b) => a - b);
    const selectedRoomNumbers = availableRoomNumbers.slice(0, data.quantity);
    const selectedSlotIds = inventories.flatMap((inv) =>
      inv.slots
        .filter((slot) => selectedRoomNumbers.includes(slot.roomNumber))
        .map((s) => s.id)
    );

    if (selectedSlotIds.length === 0) {
      throw new RoomsNotAvailableException("Failed to identify room slots for locking.");
    }

    // 4. Create the Lock Record
    const lock = await tx.accommodationLock.create({
      data: {
        userId: data.userId,
        propertyId: data.propertyId,
        unitId: data.unitId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        lockedPrice: data.lockedPrice,
        expiresAt: data.expiresAt,
        quantity: data.quantity,
        createdAt: data.createdAt,
        updatedAt: getSriLankaTime(),
        status: "active",
        slots: {
          connect: selectedSlotIds.map((id) => ({ id })),
        },
      },
      include: lockFullInclude,
    });

    // 5. Update Room Slots status (Critical: Check affected rows)
    const uniqueRoomVariantIds = [...new Set(selectedSlotIds)];
    const roomUpdateResult = await tx.roomVariant.updateMany({
      where: { id: { in: uniqueRoomVariantIds }, status: "available" },
      data: { status: "locked", updatedAt: getSriLankaTime() },
    });

    if (roomUpdateResult.count === 0) {
      throw new RoomsNotAvailableException("Failed to lock room slots. They might have been taken.");
    }

    // 6. Update Daily Inventory (Critical: Check affected rows and prevent negative inventory)
    const inventoryUpdateResult = await tx.roomInventory.updateMany({
      where: {
        unitId: data.unitId,
        date: { gte: checkIn, lt: checkOut },
        availableRooms: { gte: data.quantity } // Atomic check to prevent negative inventory
      },
      data: {
        availableRooms: { decrement: data.quantity },
        updatedAt: getSriLankaTime(),
      },
    });

    if (inventoryUpdateResult.count !== nights) {
      throw new InternalProcessingException(`Failed to update inventory for all ${nights} nights. Partial success detected.`);
    }

    return lock;
  });
};

export const convertLockToBooking = async (data: {
  userId: string;
  lockId: string;
  guests: number;
  totalPrice: number;
}): Promise<AccommodationBookingRecord> => {
  return prisma.$transaction(async (tx) => {
    const lock = await tx.accommodationLock.findUnique({
      where: { id: data.lockId },
      include: { slots: { select: { id: true } }, customAddons: true },
    });

    if (!lock || lock.status !== "active") {
      throw new LockInactiveException("Lock not found or is no longer active.");
    }

    const slotIds = lock.slots.map((s) => s.id);
    const addonIds = lock.customAddons.map((a) => a.id);

    if (slotIds.length === 0) {
      throw new InternalProcessingException("Lock has no associated room slots.");
    }

    // 1. Create Booking
    const booking = await tx.accommodationBooking.create({
      data: {
        userId: data.userId,
        propertyId: lock.propertyId,
        unitId: lock.unitId,
        lockId: data.lockId,
        checkInDate: lock.checkInDate,
        checkOutDate: lock.checkOutDate,
        guests: data.guests,
        totalPrice: data.totalPrice,
        status: "confirmed",
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
        slots: { connect: slotIds.map((id) => ({ id })) },
        customAddons: { connect: addonIds.map((id) => ({ id })) },
      },
      include: bookingFullInclude,
    });

    // 2. Convert Lock Status
    const lockUpdateResult = await tx.accommodationLock.updateMany({
      where: { id: data.lockId, status: "active" },
      data: { status: "converted", updatedAt: getSriLankaTime() },
    });

    if (lockUpdateResult.count === 0) {
      throw new LockInactiveException("Failed to convert lock. It may have already been processed.");
    }

    // 3. Mark physical rooms as 'booked'
    const roomUpdateResult = await tx.roomVariant.updateMany({
      where: { id: { in: slotIds }, status: "locked" },
      data: { status: "booked", updatedAt: getSriLankaTime() },
    });

    if (roomUpdateResult.count === 0) {
      throw new InternalProcessingException("Failed to transition room slots from locked to booked.");
    }

    return booking;
  });
};

export const handleLockExpiry = async (lockId: string): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const lock = await tx.accommodationLock.findUnique({
      where: { id: lockId },
      include: { slots: { select: { id: true } } },
    });

    if (!lock || lock.status !== "active") return;

    // 1. Update status
    const lockUpdateResult = await tx.accommodationLock.updateMany({
      where: { id: lockId, status: "active" },
      data: { status: "expired", updatedAt: getSriLankaTime() },
    });

    if (lockUpdateResult.count === 0) return; // Already processed

    // 2. Release rooms
    const slotIds = lock.slots.map((s) => s.id);
    if (slotIds.length > 0) {
      const roomUpdateResult = await tx.roomVariant.updateMany({
        where: { id: { in: slotIds }, status: "locked" },
        data: { status: "available", updatedAt: getSriLankaTime() },
      });
      
      if (roomUpdateResult.count === 0) {
        throw new InternalProcessingException("Failed to release room slots during expiry.");
      }
    }

    // 3. Restore inventory
    const nights = Math.max(1, Math.round((lock.checkOutDate.getTime() - lock.checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const inventoryUpdateResult = await tx.roomInventory.updateMany({
      where: {
        unitId: lock.unitId,
        date: { gte: lock.checkInDate, lt: lock.checkOutDate },
      },
      data: { availableRooms: { increment: lock.quantity }, updatedAt: getSriLankaTime() },
    });

    if (inventoryUpdateResult.count !== nights) {
      throw new InternalProcessingException(`Incomplete inventory restoration for expiry. Expected ${nights} nights.`);
    }
  });
};

/**
 * Retrieves paginated accommodation locks for a user.
 */
export const getUserAccommodationLocks = async (
  userId: string,
  skip: number,
  take: number
): Promise<{ data: any[]; total: number }> => {
  const where = { userId, status: { in: ["active", "expired"] as LockStatus[] } };
  const [locks, total] = await Promise.all([
    prisma.accommodationLock.findMany({
      where,
      select: {
        id: true,
        userId: true,
        propertyId: true,
        unitId: true,
        checkInDate: true,
        checkOutDate: true,
        lockedPrice: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        quantity: true,
        customAddons: true,
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            images: { take: 1, select: { url: true } },
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.accommodationLock.count({ where }),
  ]);

  const mappedLocks = locks.map((lock) => ({
    id: lock.id,
    type: "accommodation" as const,
    title: lock.property?.name || "Unknown Property",
    location: lock.property?.city || "Unknown City",
    imageUrl: lock.property?.images?.[0]?.url || null,
    status: lock.status,
    createdAt: lock.createdAt,
    expiresAt: lock.expiresAt,
    price: lock.lockedPrice || 0,
    quantity: lock.quantity || 1,
    checkInDate: lock.checkInDate,
    checkOutDate: lock.checkOutDate,
    unitName: lock.unit?.name || "Unknown Unit",
    propertyId: lock.propertyId,
    unitId: lock.unitId,
    customAddons: lock.customAddons,
  }));

  return { data: mappedLocks, total };
};

