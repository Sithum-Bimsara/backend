import { prisma } from "../../../config/prisma";
import { Prisma, LockStatus } from "@prisma/client";
import { getSriLankaTime } from "../../../utils/timezone";
import {
  DealLockDetailed,
  dealLockDetailedInclude,
  DealBookingDetailed,
  dealBookingDetailedInclude,
} from "../types/deal-lock.types";

// ─── Deal Lock Repository ───


/**
 * Fetches a deal variant with its deal and merchant info.
 */
export const getVariantById = async (id: string): Promise<any | null> => {
  return prisma.dealVariant.findUnique({
    where: { id },
    include: {
      deal: {
        select: {
          id: true,
          dealLockExpireTime: true,
          isLocalOnly: true,
          merchant: { select: { id: true, userId: true } },
        },
      },
    },
  });
};

/**
 * Counts how many active locks a user has created today (deal + accommodation combined).
 */
export const countTodaysActiveLocks = async (userId: string): Promise<number> => {
  const today = getSriLankaTime();
  today.setHours(0, 0, 0, 0);

  const tomorrow = getSriLankaTime();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [dealLocks, accLocks] = await Promise.all([
    prisma.dealLock.count({
      where: { userId, status: "active", createdAt: { gte: today, lt: tomorrow } },
    }),
    prisma.accommodationLock.count({
      where: { userId, status: "active", createdAt: { gte: today, lt: tomorrow } },
    }),
  ]);

  return dealLocks + accLocks;
};

/**
 * Creates a deal lock in a transaction.
 */
export const createLock = async (
  data: {
    userId: string;
    dealId: string;
    variantId: string;
    quantity: number;
    lockedPrice: number;
    expiresAt: Date;
    createdAt?: Date;
  },
  tx?: Prisma.TransactionClient
): Promise<DealLockDetailed> => {
  const client = tx || prisma;

  // 1. SELECT AVAILABLE SLOTS
  const availableSlots = await client.variantSlot.findMany({
    where: { variantId: data.variantId, status: "available" },
    take: data.quantity,
    orderBy: { slotNumber: "asc" },
  });

  if (availableSlots.length < data.quantity) {
    throw new Error("Not enough available slots");
  }

  // 2. MARK SLOTS AS 'LOCKED'
  await client.variantSlot.updateMany({
    where: { id: { in: availableSlots.map((s) => s.id) } },
    data: { status: "locked", updatedAt: getSriLankaTime() },
  });

  // 3. DECREMENT VARIANT INVENTORY
  await client.dealVariant.update({
    where: { id: data.variantId },
    data: { availableSlots: { decrement: data.quantity }, updatedAt: getSriLankaTime() },
  });

  // 4. CREATE THE LOCK RECORD
  return client.dealLock.create({
    data: {
      userId: data.userId,
      dealId: data.dealId,
      variantId: data.variantId,
      quantity: data.quantity,
      lockedPrice: data.lockedPrice,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt || getSriLankaTime(),
      updatedAt: getSriLankaTime(),
      status: "active",
      slots: { connect: availableSlots.map((s) => ({ id: s.id })) },
    },
    include: dealLockDetailedInclude,
  });
};

/**
 * Retrieves a deal lock by its ID with full details.
 */
export const getLockById = async (id: string): Promise<DealLockDetailed | null> => {
  return prisma.dealLock.findUnique({
    where: { id },
    include: dealLockDetailedInclude,
  });
};

/**
 * Updates the status of a lock.
 */
export const updateLockStatus = async (id: string, status: "active" | "expired" | "converted"): Promise<any> => {
  return prisma.dealLock.update({ where: { id }, data: { status, updatedAt: getSriLankaTime() } });
};

/**
 * Updates the status of all slots associated with a lock.
 */
export const updateLockSlotStatus = async (lockId: string, status: "available" | "booked" | "locked"): Promise<any> => {
  return prisma.variantSlot.updateMany({
    where: { locks: { some: { id: lockId } } },
    data: { status, updatedAt: getSriLankaTime() },
  });
};

/**
 * Increments the available slots for a variant.
 */
export const incrementVariantSlots = async (id: string, quantity: number): Promise<any> => {
  return prisma.dealVariant.update({
    where: { id },
    data: { availableSlots: { increment: quantity }, updatedAt: getSriLankaTime() },
  });
};

// ─── Booking Repository ───

/**
 * Fetches exclusions for a deal by their IDs.
 */
export const getExclusionsByDealAndIds = async (dealId: string, exclusionIds: string[]): Promise<any[]> => {
  if (!exclusionIds.length) return [];
  return prisma.exclusions.findMany({
    where: { dealId, id: { in: exclusionIds } },
    select: { id: true, description: true, additionalPrice: true },
  });
};

/**
 * Creates a deal booking in a transaction.
 */
export const createBooking = async (
  data: {
    userId: string;
    dealId: string;
    variantId: string;
    lockId: string;
    quantity: number;
    totalPrice: number;
    paymentStatus?: "pending" | "paid" | "failed";
    selectedExclusionIds?: string[];
  },
  tx?: Prisma.TransactionClient
): Promise<DealBookingDetailed> => {
  const execute = async (txClient: Prisma.TransactionClient) => {
    let slotIds: string[] = [];
    if (data.lockId) {
      const lock = await txClient.dealLock.findUnique({
        where: { id: data.lockId },
        include: { slots: { select: { id: true } } },
      });
      slotIds = lock?.slots.map((s) => s.id) || [];
    } else {
      const available = await txClient.variantSlot.findMany({
        where: { variantId: data.variantId, status: "available" },
        take: data.quantity,
        select: { id: true },
      });
      slotIds = available.map((s) => s.id);
    }

    // 1. UPDATE SLOTS TO 'BOOKED'
    await txClient.variantSlot.updateMany({
      where: { id: { in: slotIds } },
      data: { status: "booked", updatedAt: getSriLankaTime() },
    });

    // 2. Fetch existing addons for the lock
    const addons = data.lockId
      ? await txClient.customAddon.findMany({ where: { dealLockId: data.lockId } })
      : [];

    // 3. CREATE THE BOOKING RECORD
    const booking = await txClient.booking.create({
      data: {
        userId: data.userId,
        dealId: data.dealId,
        variantId: data.variantId,
        lockId: data.lockId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        selectedExclusionIds: data.selectedExclusionIds ?? [],
        paymentStatus: data.paymentStatus || "pending",
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
        slots: { connect: slotIds.map((id) => ({ id })) },
        customAddons: { connect: addons.map((a) => ({ id: a.id })) },
      },
      include: dealBookingDetailedInclude,
    });

    // 4. CONVERT THE LOCK STATUS
    if (data.lockId) {
      await txClient.dealLock.update({
        where: { id: data.lockId },
        data: { status: "converted", updatedAt: getSriLankaTime() },
      });
    }

    return booking;
  };

  if (tx) return await execute(tx);
  return await prisma.$transaction(async (innerTx) => execute(innerTx));
};

/**
 * Retrieves paginated booking history for a user.
 */
export const getUserBookings = async (userId: string, skip: number, take: number): Promise<{ data: any[]; total: number }> => {
  const where = { userId };
  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      include: dealBookingDetailedInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);
  return { data, total };
};

/**
 * Retrieves all active and recently expired deal + accommodation locks for a user.
 */
/**
 * Retrieves paginated deal locks for a user.
 */
export const getUserDealLocks = async (userId: string, skip: number, take: number): Promise<{ data: any[]; total: number }> => {
  const where = { userId, status: { in: ["active", "expired"] as LockStatus[] } };
  const [locks, total] = await Promise.all([
    prisma.dealLock.findMany({
      where,
      select: {
        id: true,
        userId: true,
        dealId: true,
        variantId: true,
        quantity: true,
        lockedPrice: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        customAddons: true,
        deal: {
          select: {
            id: true,
            title: true,
            location: true,
            primaryImageUrl: true,
            category: true,
          },
        },
        variant: {
          select: {
            id: true,
            startDatetime: true,
            displayedPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.dealLock.count({ where }),
  ]);

  const mappedLocks = locks.map((lock) => ({
    id: lock.id,
    type: "deal" as const,
    title: lock.deal?.title || "Unknown Deal",
    location: lock.deal?.location || "Unknown Location",
    imageUrl: lock.deal?.primaryImageUrl || null,
    status: lock.status,
    createdAt: lock.createdAt,
    expiresAt: lock.expiresAt,
    price: lock.lockedPrice || 0,
    quantity: lock.quantity || 1,
    variantDate: lock.variant?.startDatetime || null,
    category: lock.deal?.category || "deal",
    dealId: lock.dealId,
    variantId: lock.variantId,
    customAddons: lock.customAddons,
  }));

  return { data: mappedLocks, total };
};

/**
 * Sweeps the database for expired active locks and releases their inventory.
 */
export const releaseExpiredLocks = async (): Promise<{ releasedDealLocks: number; releasedAccommodationLocks: number }> => {
  return await prisma.$transaction(async (tx) => {
    // ─── Deal Locks ───
    const expiredDealLocks = await tx.dealLock.findMany({
      where: { status: "active", expiresAt: { lt: getSriLankaTime() } },
      select: { id: true, variantId: true, quantity: true, slots: { select: { id: true } } },
    });

    let dealReleased = 0;
    if (expiredDealLocks.length > 0) {
      const dealLockIds = expiredDealLocks.map((l) => l.id);
      const dealSlotIds = expiredDealLocks.flatMap((l) => l.slots.map((s) => s.id));

      const result = await tx.dealLock.updateMany({
        where: { id: { in: dealLockIds }, status: "active" },
        data: { status: "expired", updatedAt: getSriLankaTime() },
      });

      if (result.count > 0) {
        dealReleased = result.count;
        const variantIncrements: Record<string, number> = {};
        expiredDealLocks.forEach((lock) => {
          if (lock.variantId && lock.quantity) {
            variantIncrements[lock.variantId] = (variantIncrements[lock.variantId] || 0) + lock.quantity;
          }
        });
        for (const [variantId, quantity] of Object.entries(variantIncrements)) {
          await tx.dealVariant.update({
            where: { id: variantId },
            data: { availableSlots: { increment: quantity }, updatedAt: getSriLankaTime() },
          });
        }
        if (dealSlotIds.length > 0) {
          await tx.variantSlot.updateMany({
            where: { id: { in: dealSlotIds }, status: "locked" },
            data: { status: "available", updatedAt: getSriLankaTime() },
          });
        }
      }
    }

    // ─── Accommodation Locks ───
    const expiredAccLocks = await tx.accommodationLock.findMany({
      where: { status: "active", expiresAt: { lt: getSriLankaTime() } },
      select: { id: true, unitId: true, checkInDate: true, checkOutDate: true, quantity: true, slots: { select: { id: true } } },
    });

    let accReleased = 0;
    if (expiredAccLocks.length > 0) {
      const accLockIds = expiredAccLocks.map((l) => l.id);
      const result = await tx.accommodationLock.updateMany({
        where: { id: { in: accLockIds }, status: "active" },
        data: { status: "expired", updatedAt: getSriLankaTime() },
      });

      if (result.count > 0) {
        accReleased = result.count;
        for (const lock of expiredAccLocks) {
          const slotIds = lock.slots.map((s) => s.id);
          if (slotIds.length > 0) {
            await tx.roomVariant.updateMany({
              where: { id: { in: slotIds }, status: "locked" },
              data: { status: "available", updatedAt: getSriLankaTime() },
            });
          }
          const dates: Date[] = [];
          let current = new Date(lock.checkInDate);
          while (current < lock.checkOutDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
          await tx.roomInventory.updateMany({
            where: { unitId: lock.unitId, date: { in: dates } },
            data: { availableRooms: { increment: lock.quantity }, updatedAt: getSriLankaTime() },
          });
        }
      }
    }

    return { releasedDealLocks: dealReleased, releasedAccommodationLocks: accReleased };
  });
};
