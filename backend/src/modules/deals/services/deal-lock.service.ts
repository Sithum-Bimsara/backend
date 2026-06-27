import * as repo from "../repositories/deal-lock.repository";
import * as authRepo from "../../auth/auth.repository";
import { enqueueBookingTicketJob } from "../../../queues/notificationQueue";
import { enqueueInteractionTrackingJob } from "../../../queues/lockTrackingQueue";
import { prisma } from "../../../config/prisma";
import { getSriLankaTime } from "../../../utils/timezone";

import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import {
  SuspendedAccountException,
  DailyLockLimitExceededException,
  SelfLockRestrictedException,
  SelfBookingRestrictedException,
  LocalDealRestrictedException,
  VariantInactiveException,
  DealExpiredException,
  InsufficientSlotsException,
  LockInactiveException,
  LockExpiredException,
  InvalidAddonsException
} from "../../../exceptions/domain.exceptions";
import {
  LockDealDto,
  CreateBookingDto,
  PaginationDto,
} from "../dtos/deal-lock.dtos";
import {
  DealLockDetailed,
  DealBookingDetailed,
} from "../types/deal-lock.types";

// ─── Shared Helpers ───

/**
 * Ensures a user exists and is not suspended.
 */
const ensureActiveUser = async (userId: string) => {
  const user = await authRepo.findUserById(userId);
  if (!user) throw new NotFoundException("User not found");
  if (user.status === "suspended") {
    throw new SuspendedAccountException();
  }
  return user;
};

// ─── Deal Lock Service ───

/**
 * Places a temporary lock on a deal variant.
 */
export const lockDeal = async (userId: string, data: LockDealDto): Promise<DealLockDetailed> => {
  const user = await ensureActiveUser(userId);

  const variant = await repo.getVariantById(data.variantId);
  if (!variant) {
    throw new NotFoundException("The requested deal variant was not found.");
  }

  // Cannot lock your own deal
  if (variant.deal?.merchant?.userId === userId) {
    throw new SelfLockRestrictedException();
  }

  // Check daily lock limit (5 locks per day)
  const todaysLockCount = await repo.countTodaysActiveLocks(userId);
  if (todaysLockCount >= 5) {
    throw new DailyLockLimitExceededException("You have reached the daily limit of 5 locked deals. Try again tomorrow or complete booking for an existing lock.");
  }

  // Validate variant status
  if (variant.status !== "active") {
    throw new VariantInactiveException();
  }

  const now = getSriLankaTime();
  now.setUTCHours(0, 0, 0, 0);

  if (!variant.startDatetime || variant.startDatetime < now) {
    throw new DealExpiredException();
  }

  // Check Local Only restriction
  if (variant.deal?.isLocalOnly && !user.isMaldivesVerified) {
    throw new LocalDealRestrictedException();
  }

  // Final quantity check
  if (variant.availableSlots === null || variant.availableSlots < data.quantity) {
    throw new InsufficientSlotsException(`Only ${variant.availableSlots ?? 0} slots available, requested ${data.quantity}`);
  }

  const expireDays = variant.deal?.dealLockExpireTime ?? 1;
  const expiresAt = getSriLankaTime(Date.now() + expireDays * 24 * 60 * 60 * 1000);
  const pricePerSlot = variant.displayedPrice ?? 0;
  const lockedPrice = pricePerSlot * data.quantity;

  // Atomic transaction: create lock + decrement slots together
  return await prisma.$transaction(async (tx) => {
    const lock = await repo.createLock(
      { userId, dealId: variant.dealId, variantId: data.variantId, quantity: data.quantity, lockedPrice, expiresAt, createdAt: getSriLankaTime() },
      tx
    );

    if (lock.dealId) {
      enqueueInteractionTrackingJob({ type: "deal", interaction: "lock", userId, dealId: lock.dealId });
    }

    return lock;
  });
};

/**
 * Retrieves details for a specific deal lock by its ID.
 */
export const getLockById = (id: string): Promise<DealLockDetailed | null> => repo.getLockById(id);

/**
 * Retrieves a deal lock specifically for chat initialization context,
 * verifying that the user is either the traveller who locked it or the merchant who owns the deal.
 */
export const getLockForChatContext = async (
  lockId: string,
  userId: string
): Promise<DealLockDetailed> => {
  const lock = await repo.getLockById(lockId);
  if (!lock) throw new NotFoundException("Lock not found");

  const isTraveller = lock.userId === userId;
  const isMerchant = lock.deal?.merchant?.userId === userId;

  if (!isTraveller && !isMerchant) {
    throw new UnauthorizedException("Security Alert: You do not have permission to access this lock context.");
  }

  return lock;
};

/**
 * Retrieves paginated deal locks for a user.
 */
export const getUserDealLocks = async (userId: string, pagination: PaginationDto): Promise<{ data: any[]; total: number }> => {
  const skip = (pagination.page - 1) * pagination.limit;
  const take = pagination.limit;
  return repo.getUserDealLocks(userId, skip, take);
};

// ─── Deal Booking Service ───

/**
 * Converts an active deal lock into a confirmed booking.
 */
export const createBooking = async (
  userId: string,
  data: CreateBookingDto
): Promise<DealBookingDetailed> => {
  const user = await ensureActiveUser(userId);

  const lock = await repo.getLockById(data.lockId);
  if (!lock) throw new NotFoundException("Lock not found");
  if (lock.userId !== userId) throw new UnauthorizedException("Unauthorized: lock belongs to another user");
  if (lock.status !== "active") throw new LockInactiveException();
  if (lock.deal?.merchant?.user?.id === userId) {
    throw new SelfBookingRestrictedException();
  }

  if (lock.expiresAt && lock.expiresAt < getSriLankaTime()) {
    await repo.updateLockStatus(data.lockId, "expired");
    if (lock.variantId && lock.quantity) {
      await repo.updateLockSlotStatus(data.lockId, "available");
      await repo.incrementVariantSlots(lock.variantId, lock.quantity);
    }
    throw new LockExpiredException();
  }

  const normalizedSelectedExclusionIds = Array.from(new Set(data.selectedExclusionIds ?? []));
  let selectedAddOns: Array<{ id: string; description: string; additionalPrice: number }> = [];

  if (normalizedSelectedExclusionIds.length > 0) {
    selectedAddOns = (await repo.getExclusionsByDealAndIds(lock.dealId!, normalizedSelectedExclusionIds)).map((item) => ({
      id: item.id,
      description: item.description?.trim() || "Unnamed add-on",
      additionalPrice: typeof item.additionalPrice === "number" ? item.additionalPrice : 0,
    }));

    if (selectedAddOns.length !== normalizedSelectedExclusionIds.length) {
      throw new InvalidAddonsException();
    }
  }

  const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.additionalPrice, 0);
  const customAddonsTotal = (lock.customAddons as any[])?.reduce((sum, addon) => sum + (addon.price || 0), 0) || 0;
  const totalPrice = (lock.lockedPrice ?? 0) + addOnsTotal + customAddonsTotal;

  // Atomic transaction: create booking + mark slots as booked
  const booking = await prisma.$transaction(async (tx) => {
    return repo.createBooking(
      {
        userId,
        dealId: lock.dealId!,
        variantId: lock.variantId!,
        lockId: data.lockId,
        quantity: lock.quantity ?? 1,
        totalPrice,
        paymentStatus: data.paymentStatus,
        selectedExclusionIds: selectedAddOns.map((item) => item.id),
      },
      tx
    );
  });

  // Post-commit side effects
  if (booking.dealId) {
    enqueueInteractionTrackingJob({ type: "deal", interaction: "booking", userId, dealId: booking.dealId });
  }

  if (data.paymentStatus === "paid" && user.email) {
    enqueueBookingTicketJob({
      recipientEmail: user.email,
      customerName: user.name,
      bookingId: booking.id,
      dealTitle: booking.deal?.title || "Unknown Deal",
      dealLocation: booking.deal?.location || "Unknown Location",
      startDatetime: booking.variant?.startDatetime || new Date(),
      quantity: booking.quantity ?? 1,
      totalPrice: booking.totalPrice ?? 0,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      selectedAddOns: selectedAddOns.map((item) => ({
        description: item.description,
        additionalPrice: item.additionalPrice,
      })),
    });
  }

  return booking;
};

/**
 * Retrieves the booking history for the authenticated traveller.
 */
export const getMyBookings = async (userId: string, pagination: PaginationDto): Promise<{ data: any[]; total: number }> => {
  const skip = (pagination.page - 1) * pagination.limit;
  const take = pagination.limit;
  return repo.getUserBookings(userId, skip, take);
};
