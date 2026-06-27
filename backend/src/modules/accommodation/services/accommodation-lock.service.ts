import * as repo from "../repositories/accommodation-lock.repository";
import { AccommodationLockRecord } from "../types/accommodation-lock.types";
import { countTodaysActiveLocks } from "../../deals/repositories/deal-lock.repository";
import * as authRepo from "../../auth/auth.repository";
import { enqueueStayConfirmationJob } from "../../../queues/notificationQueue";
import { enqueueInteractionTrackingJob } from "../../../queues/lockTrackingQueue";
import { getSriLankaTime } from "../../../utils/timezone";

import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import {
  SuspendedAccountException,
  InvalidDatesException,
  SelfLockRestrictedException,
  DailyLockLimitExceededException,
  PropertyInactiveException,
  DealExpiredException,
  LockInactiveException,
  SelfBookingRestrictedException,
  LockExpiredException
} from "../../../exceptions/domain.exceptions";
import { 
  CreateAccommodationBookingDto, 
  LockAccommodationDto, 
  ViewAccommodationLockDto, 
  ViewAccommodationBookingDto,
  viewAccommodationLockSchema,
  viewAccommodationBookingSchema,
  viewAccommodationLockDetailSchema,
  ViewAccommodationLockDetailDto
} from "../dtos/accommodation-lock.dtos";

// ─── Helpers ───

const ensureActiveUser = async (userId: string) => {
  const user = await authRepo.findUserById(userId);
  if (!user) throw new NotFoundException("User not found");
  if (user.status === "suspended") {
    throw new SuspendedAccountException();
  }
  return user;
};

// ─── Service Methods ───

export const lockAccommodation = async (
  userId: string,
  data: LockAccommodationDto
): Promise<ViewAccommodationLockDto> => {
  const user = await ensureActiveUser(userId);
  const { propertyId, unitId, checkInDate, checkOutDate, quantity } = data;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new InvalidDatesException("Invalid date format provided for check-in or check-out.");
  }
  if (checkOut <= checkIn) {
    throw new InvalidDatesException("Checkout date must be after the check-in date.");
  }

  // Fetch unit details via repository helper
  const unit = await repo.getUnitForLocking(unitId);
  if (!unit) throw new NotFoundException("Unit not found");

  // Business Logic
  if (unit.property.merchant.userId === userId) {
    throw new SelfLockRestrictedException();
  }

  const todaysLockCount = await countTodaysActiveLocks(userId);
  if (todaysLockCount >= 5) {
    throw new DailyLockLimitExceededException("You have reached the daily limit of 5 active locks.");
  }

  if (!unit.property.isActive) {
    throw new PropertyInactiveException();
  }

  const now = getSriLankaTime();
  now.setUTCHours(0, 0, 0, 0);
  if (checkIn < now) {
    throw new DealExpiredException("Check-in date cannot be in the past.");
  }

  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const isLocal = user.country === "Maldives";
  const basePrice = isLocal && unit.localPrice ? unit.localPrice : unit.nonLocalPrice || 0;
  const totalPrice = basePrice * nights * quantity;

  const expireDays = unit.dealLockExpireTime ?? 1;
  const expiresAt = getSriLankaTime(Date.now() + expireDays * 24 * 60 * 60 * 1000);

  // Execute Repository Transaction
  const lockRecord = await repo.createAccommodationLock({
    userId,
    propertyId,
    unitId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    lockedPrice: totalPrice,
    expiresAt,
    quantity,
    createdAt: getSriLankaTime(),
  });

  enqueueInteractionTrackingJob({ type: "accommodation", interaction: "lock", userId, propertyId });

  return viewAccommodationLockSchema.parse(lockRecord);
};

export const getAccommodationLockById = async (
  userId: string,
  id: string
): Promise<ViewAccommodationLockDto> => {
  const lock = await repo.getLockById(id);
  if (!lock) throw new NotFoundException("Lock not found");
  
  if (lock.userId !== userId) {
    throw new UnauthorizedException("You do not have access to this lock");
  }

  return viewAccommodationLockSchema.parse(lock);
};

export const getAccommodationLockDetail = async (
  userId: string,
  id: string
): Promise<ViewAccommodationLockDetailDto> => {
  const lock = await repo.getLockDetailById(id);
  if (!lock) throw new NotFoundException("Lock not found");
  
  if (lock.userId !== userId) {
    throw new UnauthorizedException("You do not have access to this lock");
  }

  return viewAccommodationLockDetailSchema.parse(lock);
};

/**
 * Retrieves an accommodation lock specifically for chat initialization context,
 * verifying that the user is either the traveller who locked it or the merchant who owns the property.
 */
export const getLockForChatContext = async (
  lockId: string,
  userId: string
): Promise<AccommodationLockRecord> => {
  const lock = await repo.getLockById(lockId);
  if (!lock) throw new NotFoundException("Lock not found");

  const isTraveller = lock.userId === userId;
  const isMerchant = lock.property?.merchant?.userId === userId;

  if (!isTraveller && !isMerchant) {
    throw new UnauthorizedException("Security Alert: You do not have permission to access this lock context.");
  }

  return lock;
};

export const getAccommodationBookingById = async (
  userId: string,
  id: string
): Promise<ViewAccommodationBookingDto> => {
  const booking = await repo.getBookingById(id);
  if (!booking) throw new NotFoundException("Booking not found");

  if (booking.userId !== userId) {
    throw new UnauthorizedException("You do not have access to this booking");
  }

  return viewAccommodationBookingSchema.parse(booking);
};

export const createAccommodationBooking = async (
  userId: string,
  data: CreateAccommodationBookingDto
): Promise<ViewAccommodationBookingDto> => {
  const user = await ensureActiveUser(userId);

  const lock = await repo.getLockById(data.lockId);
  if (!lock) throw new NotFoundException("Lock not found");
  
  // Validation
  if (lock.userId !== userId) throw new UnauthorizedException("Lock belongs to another user");
  if (lock.status !== "active") throw new LockInactiveException();
  if (lock.property?.merchant?.userId === userId) {
    throw new SelfBookingRestrictedException("You cannot book your own property units");
  }
  if (!lock.property?.isActive) {
    throw new PropertyInactiveException();
  }

  // Handle expiry
  if (lock.expiresAt && lock.expiresAt < getSriLankaTime()) {
    await repo.handleLockExpiry(data.lockId);
    throw new LockExpiredException();
  }

  const customAddons = lock.customAddons || [];
  const addonsTotalPrice = customAddons.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);

  // Execute Repository Transaction
  const bookingRecord = await repo.convertLockToBooking({
    userId,
    lockId: data.lockId,
    guests: data.guests,
    totalPrice: lock.lockedPrice + addonsTotalPrice,
  });

  // Side Effects
  enqueueInteractionTrackingJob({ type: "accommodation", interaction: "booking", userId, propertyId: lock.propertyId });

  if (user.email) {
    enqueueStayConfirmationJob({
      recipientEmail: user.email,
      customerName: user.name,
      bookingId: bookingRecord.id,
      propertyName: bookingRecord.property?.name || "",
      propertyLocation: bookingRecord.property?.city || "",
      unitName: bookingRecord.unit?.name || "",
      checkInDate: bookingRecord.checkInDate,
      checkOutDate: bookingRecord.checkOutDate,
      guests: bookingRecord.guests,
      totalPrice: bookingRecord.totalPrice,
      status: bookingRecord.status,
      createdAt: bookingRecord.createdAt,
    });
  }

  return viewAccommodationBookingSchema.parse(bookingRecord);
};

/**
 * Retrieves paginated accommodation locks for a user.
 */
export const getUserAccommodationLocks = async (
  userId: string,
  query: { page: number; limit: number }
): Promise<{ data: any[]; total: number }> => {
  const skip = (query.page - 1) * query.limit;
  const take = query.limit;
  return repo.getUserAccommodationLocks(userId, skip, take);
};
