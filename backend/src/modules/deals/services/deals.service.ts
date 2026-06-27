import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import { BadRequestException } from "../../../exceptions/bad-request.exception";
import { Prisma, VariantSlot, Deal } from "@prisma/client";
import * as repo from "../repositories/deals.repository";
import { getSriLankaTime } from "../../../utils/timezone";
import { enqueueDealUpdatedNotification } from "../../../queues/notificationQueue";
import {
  CreateDealDto,
  UpdateDealDto,
  VariantsQueryDto,
  BulkGenerateVariantsDto,
  ListDealsQueryDto,
  PaginatedDealResponseDto,
  paginatedDealResponseSchema,
  UpdateVariantDto,
  BulkGenerateResultDto,
  BulkPreviewResultDto,
  bulkGenerateResultSchema,
  bulkPreviewResultSchema,
  DateRangeQueryDto,
  CreateSearchLogDto,
  CreateDealViewEventDto,
  ListLocksQueryDto,
  ListBookingsQueryDto,
  PaginatedLockResponseDto,
  PaginatedBookingResponseDto,
  paginatedLockResponseSchema,
  paginatedBookingResponseSchema,
} from "../dtos/deals.dtos";
import {
  DealDetailed,
  DealSummary,
  DealVariantDetailed,
  DealVariantWithSlots,
  VariantSlotWithVariantAndDeal,
  DealWhereInput,
  AdminMerchantDealsSummaryRecord,
  AdminDealPaginatedRecord,
  AdminDealDetailRecord,
  AdminVariantWithActivityRecord,
} from "../types/deals.types";
import {
  UpdateDealAdminDto,
} from "../../admin/admin.dtos";

const USD_COMMISSION_RATE = 0.12;
const MVR_COMMISSION_RATE = 0.08;


// ─── Date Generation Logic ───

/**
 * Helper to generate dates from a bulk generation rule.
 */
function generateDatesFromInput(rule: BulkGenerateVariantsDto): Date[] {
  const dates: Date[] = [];
  const start = getSriLankaTime(rule.startDate);
  const end = getSriLankaTime(rule.endDate);

  // Parse time of day
  let hours = 9;
  let minutes = 0;
  if (rule.timeOfDay) {
    const [h, m] = rule.timeOfDay.split(":").map(Number);
    hours = h;
    minutes = m;
  }

  switch (rule.repeatType) {
    case "once": {
      const date = new Date(start);
      date.setHours(hours, minutes, 0, 0);
      dates.push(date);
      break;
    }

    case "daily": {
      const current = new Date(start);
      while (current <= end) {
        const date = new Date(current);
        date.setHours(hours, minutes, 0, 0);
        dates.push(date);
        current.setDate(current.getDate() + 1);
      }
      break;
    }

    case "weekly": {
      const daysOfWeek = rule.daysOfWeek || [];
      const current = new Date(start);
      while (current <= end) {
        if (daysOfWeek.includes(current.getDay())) {
          const date = new Date(current);
          date.setHours(hours, minutes, 0, 0);
          dates.push(date);
        }
        current.setDate(current.getDate() + 1);
      }
      break;
    }

    case "interval": {
      const intervalDays = rule.interval || 1;
      const current = new Date(start);
      while (current <= end) {
        const date = new Date(current);
        date.setHours(hours, minutes, 0, 0);
        dates.push(date);
        current.setDate(current.getDate() + intervalDays);
      }
      break;
    }
  }

  return dates.map(d => getSriLankaTime(d));
}


/**
 * Centrally calculates the platform-displayed price.
 * USD deals (not local only) have 12% commission.
 * MVR deals (local only) have 8% commission.
 */
export const calculateDisplayedPrice = (dealPrice: number, isLocalOnly: boolean = false): number => {
  const rate = isLocalOnly ? MVR_COMMISSION_RATE : USD_COMMISSION_RATE;
  return Math.round(dealPrice * (1 + rate));
};

/**
 * Validates that the displayed price is strictly lower than the original price.
 */
export const validatePricing = (dealPrice: number | undefined | null, originalPrice: number | undefined | null, isLocalOnly: boolean = false) => {
  if (dealPrice == null || originalPrice == null) {
    throw new BadRequestException("Incomplete pricing information: Both Deal Price and Original Price are required.");
  }

  const displayed = calculateDisplayedPrice(dealPrice, isLocalOnly);
  const symbol = isLocalOnly ? 'MVR' : '$';

  if (displayed >= originalPrice) {
    throw new BadRequestException(`Displayed Price (${symbol}${displayed}) must be lower than Original Price (${symbol}${originalPrice}). Please adjust the pricing.`);
  }
};

const normalizeDurationToDays = <T extends { durationType?: string; durationDays?: number }>(
  data: T
): T => {
  return {
    ...data,
    durationType: "days",
  };
};

// ─── Deal Service ───

/**
 * Business logic for listing merchant deals.
 */
export const getDealsByMerchant = async (merchantId: string): Promise<DealSummary[]> => {
  return repo.getDealsByMerchant(merchantId);
};

/**
 * Lists all deals for the authenticated merchant with cursor-based pagination and search.
 */
export const listMyDeals = async (
  merchantId: string,
  query: ListDealsQueryDto
): Promise<PaginatedDealResponseDto> => {
  const { items, nextCursor, total } = await repo.listMyDealsRaw(merchantId, query);

  return paginatedDealResponseSchema.parse({
    items,
    nextCursor,
    total,
  });
};

/**
 * Business logic for creating a new deal.
 */
export const createDeal = async (merchantId: string, data: CreateDealDto): Promise<DealDetailed> => {
  validatePricing(data.dealPrice, data.originalPrice, data.isLocalOnly);
  const normalizedData = normalizeDurationToDays(data);
  const displayedPrice = calculateDisplayedPrice(data.dealPrice, data.isLocalOnly);
  return repo.createDeal({ ...normalizedData, merchantId, displayedPrice });
};

/**
 * Business logic for fetching a single deal by ID.
 */
export const getDealById = async (id: string): Promise<DealDetailed> => {
  const deal = await repo.getDealById(id);
  if (!deal) throw new NotFoundException("Deal not found");
  return deal;
};

/**
 * Fetches analytics for a specific deal.
 */
export const getDealAnalytics = async (dealId: string, query?: DateRangeQueryDto) => {
  return repo.getDealAnalytics(dealId, query?.startDate, query?.endDate);
};

export const updateDeal = async (existing: Deal, data: UpdateDealDto): Promise<DealDetailed | null> => {
  if (data.displayedPrice !== undefined) {
    throw new BadRequestException("Cannot edit displayed price directly. It is automatically calculated from Deal Price.");
  }

  // Constraint: Price can only be edited if deal is inactive
  const isUpdatingPrice = (data.dealPrice !== undefined && data.dealPrice !== existing.dealPrice) ||
    (data.originalPrice !== undefined && data.originalPrice !== existing.originalPrice);

  if (isUpdatingPrice && existing.isActive) {
    throw new BadRequestException("Deal Price and Original Price can only be updated when the deal is inactive. Please contact admin to deactivate the deal first.");
  }

  // Validate pricing with new or existing values
  const finalDealPrice = data.dealPrice !== undefined ? data.dealPrice : (existing.dealPrice ?? undefined);
  const finalOriginalPrice = data.originalPrice !== undefined ? data.originalPrice : (existing.originalPrice ?? undefined);
  const finalIsLocalOnly = data.isLocalOnly !== undefined ? data.isLocalOnly : (existing.isLocalOnly ?? false);
  validatePricing(finalDealPrice, finalOriginalPrice, finalIsLocalOnly);

  const activeBookingsCount = await repo.countActiveBookingsByDeal(existing.id);
  if (activeBookingsCount > 0) {
    throw new BadRequestException("Cannot edit deal details: this deal already has bookings");
  }

  const normalizedData = normalizeDurationToDays(data);
  const updated = await repo.updateDeal(existing.id, normalizedData);

  if (updated) {
    enqueueDealUpdatedNotification(updated.id).catch((err) => {
      console.error(`[DealUpdate] Notification enqueue failed for ${updated.id}:`, err);
    });
  }

  return updated;
};



// ─── Variant Service ───

/**
 * Business logic for fetching variants of a deal.
 */
export const getVariantsByDeal = async (params: VariantsQueryDto): Promise<DealVariantDetailed[]> => {
  return repo.getVariantsByDeal(params);
};

/**
 * Business logic for updating a variant.
 */
export const updateVariant = async (
  id: string,
  merchantId: string,
  data: UpdateVariantDto
): Promise<DealVariantWithSlots | null> => {
  const existing: DealVariantWithSlots | null = await repo.getVariantById(id);
  if (!existing) throw new NotFoundException("Variant not found");

  if (existing.deal.merchantId !== merchantId) {
    throw new UnauthorizedException("Unauthorized: You do not own this deal");
  }

  const occupiedSlots = existing.slots.filter(
    (s) => s.status === 'booked' || s.status === 'locked'
  ).length;

  // Constraint 1: Cannot decrease below booked/locked slots
  if (data.totalSlots !== undefined && data.totalSlots < occupiedSlots) {
    throw new BadRequestException(`Cannot decrease slots below ${occupiedSlots} (number of booked/locked slots)`);
  }

  // Prevent setting availableSlots higher than totalSlots
  const finalTotal = data.totalSlots ?? existing.totalSlots;
  if (data.availableSlots !== undefined && finalTotal !== null && finalTotal !== undefined) {
    if (data.availableSlots > finalTotal) {
      throw new BadRequestException("Available slots cannot exceed total slots");
    }
  }

  const updated = await repo.updateVariant(id, data);

  // Auto-update status based on slots
  if (updated && updated.availableSlots === 0 && updated.status === "active") {
    return repo.updateVariant(id, { status: "sold_out" });
  }

  return updated;
};

/**
 * Business logic for cancelling a variant.
 */
export const cancelVariant = async (id: string, merchantId: string): Promise<DealVariantDetailed> => {
  const existing: DealVariantWithSlots | null = await repo.getVariantById(id);
  if (!existing) throw new NotFoundException("Variant not found");

  // Ownership Check
  if (existing.deal.merchantId !== merchantId) {
    throw new UnauthorizedException("Unauthorized: You do not own this deal");
  }

  // Occupancy Check (Only Paid or Pending bookings)
  const activeBookings = existing.bookings.filter(
    (b) => b.paymentStatus === 'paid' || b.paymentStatus === 'pending'
  );
  if (activeBookings.length > 0) {
    throw new BadRequestException("This variant cannot be cancelled because it has active bookings. Please manage the bookings first.");
  }

  // Active locks already filtered by repository (expiresAt > now)
  if ((existing.locks?.length || 0) > 0) {
    throw new BadRequestException("This variant cannot be cancelled because a traveler is currently in the process of booking it (active lock).");
  }

  return repo.cancelVariant(id);
};

/**
 * Business logic for restoring a variant.
 */
export const restoreVariant = async (
  id: string,
  merchantId: string
): Promise<DealVariantWithSlots | null> => {
  const existing: DealVariantWithSlots | null = await repo.getVariantById(id);
  if (!existing) throw new NotFoundException("Variant not found");

  if (existing.deal.merchantId !== merchantId) {
    throw new UnauthorizedException("Unauthorized: You do not own this deal");
  }

  if (existing.status === "active") {
    throw new BadRequestException("This variant is already active and available for booking.");
  }

  if ((existing.bookings?.length || 0) > 0) {
    throw new BadRequestException("This variant has already been booked by a traveler and cannot be restored from a cancelled state.");
  }

  return repo.restoreVariant(id);
};

/**
 * Business logic for cancelling a specific slot.
 */
export const cancelSlot = async (slotId: string, merchantId: string): Promise<VariantSlot> => {
  const slot: VariantSlotWithVariantAndDeal | null = await repo.getSlotById(slotId);
  if (!slot) throw new NotFoundException("Slot not found");

  if (slot.variant.deal.merchantId !== merchantId) {
    throw new UnauthorizedException("Unauthorized: You do not own this deal");
  }

  if (slot.status === "booked") {
    throw new BadRequestException("This slot was recently booked by a traveler and can no longer be cancelled.");
  }

  if (slot.status === "locked") {
    throw new BadRequestException("A traveler is currently trying to book this slot. Please wait for their session to expire or complete.");
  }

  return repo.cancelSlot(slotId);
};

/**
 * Business logic for restoring a specific slot.
 */
export const restoreSlot = async (slotId: string, merchantId: string): Promise<VariantSlot> => {
  const slot: VariantSlotWithVariantAndDeal | null = await repo.getSlotById(slotId);
  if (!slot) throw new NotFoundException("Slot not found");

  if (slot.variant.deal.merchantId !== merchantId) {
    throw new UnauthorizedException("Unauthorized: You do not own this deal");
  }

  // Can only restore if currently cancelled
  if (slot.status === "booked") {
    throw new BadRequestException("This slot has already been booked by a traveler and cannot be restored.");
  }

  if (slot.status === "locked") {
    throw new BadRequestException("A traveler is currently in the process of booking this slot. It will become available automatically if they don't complete the purchase.");
  }

  if (slot.status === "available") {
    throw new BadRequestException("This slot is already restored and available for booking.");
  }

  return repo.restoreSlot(slotId);
};

/**
 * Business logic for bulk generating variants.
 * Validates deal ownership, date generation rules, and pricing before
 * delegating atomic DB creation to the repository.
 */
export const bulkGenerateVariants = async (
  merchantId: string,
  data: BulkGenerateVariantsDto
): Promise<BulkGenerateResultDto> => {
  const deal = await repo.getDealById(data.dealId);
  if (!deal) throw new NotFoundException("Deal not found");
  if (deal.merchantId !== merchantId) {
    throw new UnauthorizedException("Unauthorized: You do not own this deal");
  }

  const generatedDates = generateDatesFromInput(data);
  const futureDates = generatedDates.filter((d) => d > getSriLankaTime());

  if (futureDates.length === 0) {
    throw new BadRequestException("Bulk generation would not produce any future dates");
  }

  if (futureDates.length > 15) {
    throw new BadRequestException("Cannot generate more than 15 variants at once. Please narrow your date range or interval.");
  }

  const finalOriginalPrice = deal.originalPrice;
  const finalDisplayedPrice = deal.displayedPrice;

  if (finalDisplayedPrice != null && finalOriginalPrice != null && finalDisplayedPrice >= finalOriginalPrice) {
    throw new BadRequestException("Pricing conflict: Displayed Price must be lower than Original Price.");
  }

  for (const date of futureDates) {
    const existingOnDay = await repo.getVariantsByDateRange(data.dealId, date, date);
    if (existingOnDay.length > 0) {
      throw new BadRequestException(`A variant already exists on ${date.toDateString()}. Please select a range without conflicts.`);
    }
  }

  const result = await repo.createBulkVariants({
    dealId: data.dealId,
    futureDates,
    totalSlots: data.totalSlots,
    originalPrice: finalOriginalPrice,
    displayedPrice: finalDisplayedPrice,
  });

  return bulkGenerateResultSchema.parse({
    generatedCount: result.count,
    previewDates: futureDates.map((d) => d.toISOString()),
  });
};

/**
 * Business logic for previewing bulk generation (conflict check, no DB writes).
 */
export const previewBulkGenerateVariants = async (
  data: BulkGenerateVariantsDto
): Promise<BulkPreviewResultDto> => {
  const dates = generateDatesFromInput(data);
  const futureDates = dates.filter((d) => d > getSriLankaTime());

  if (futureDates.length > 15) {
    throw new BadRequestException("Cannot generate more than 15 variants at once. Please narrow your date range or interval.");
  }

  const conflicting = await repo.getVariantsByDateRange(
    data.dealId,
    getSriLankaTime(data.startDate),
    getSriLankaTime(data.endDate)
  );

  const conflicts = conflicting
    .map((v) => v.startDatetime.toISOString())
    .filter((s): s is string => s !== undefined);

  return bulkPreviewResultSchema.parse({
    dates: futureDates.map((d) => d.toISOString()),
    conflicts,
    count: futureDates.length,
  });
};



/**
 * Lists paginated locks for a deal.
 */
export const listDealLocks = async (
  deal: Deal,
  query: ListLocksQueryDto,
): Promise<PaginatedLockResponseDto> => {
  const { items, total } = await repo.listDealLocksRaw(deal.id, query);

  const mapped = items.map((lock) => {
    const addonsTotal = lock.customAddons.reduce((sum, a) => sum + (a.price || 0), 0);
    return {
      id: lock.id,
      checkInDate: lock.variant?.startDatetime ?? lock.createdAt,
      lockedPrice: lock.lockedPrice ?? 0,
      expiresAt: lock.expiresAt ?? new Date(),
      quantity: lock.quantity ?? 0,
      status: lock.status,
      createdAt: lock.createdAt,
      dealTitle: deal.title,
      dealId: deal.id,
      user: {
        id: lock.user?.id ?? "",
        name: lock.user?.name ?? "Guest User",
        email: lock.user?.email ?? "",
      },
      addons: lock.customAddons.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
        details: a.details,
        addedAt: a.addedAt,
      })),
      addonsTotal,
      grandTotal: (lock.lockedPrice ?? 0) + addonsTotal,
      chatRoomId: lock.chatRooms[0]?.id ?? null,
    };
  });

  return paginatedLockResponseSchema.parse({
    items: mapped,
    total,
  });
};

/**
 * Lists paginated bookings for a deal.
 */
export const listDealBookings = async (
  deal: Deal,
  query: ListBookingsQueryDto,
): Promise<PaginatedBookingResponseDto> => {
  const { items, total } = await repo.listDealBookingsRaw(deal.id, query);

  const mapped = items.map((booking) => {
    const addonsTotal = booking.customAddons.reduce((sum, a) => sum + (a.price || 0), 0);
    return {
      id: booking.id,
      checkInDate: booking.variant?.startDatetime ?? booking.createdAt,
      guests: booking.quantity ?? 1,
      totalPrice: booking.totalPrice ?? 0,
      status: booking.paymentStatus,
      createdAt: booking.createdAt,
      dealTitle: deal.title,
      dealId: deal.id,
      user: {
        id: booking.user?.id ?? "",
        name: booking.user?.name ?? "Guest User",
        email: booking.user?.email ?? "",
      },
      addons: booking.customAddons.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
        details: a.details,
        addedAt: a.addedAt,
      })),
      addonsTotal,
      grandTotal: (booking.totalPrice ?? 0) + addonsTotal,
      lockId: booking.lockId ?? null,
      chatRoomId: booking.lock?.chatRooms?.[0]?.id ?? null,
    };
  });

  return paginatedBookingResponseSchema.parse({
    items: mapped,
    total,
  });
};



// ========================================== Admin Functions ==========================================

export const countDeals = async (where?: DealWhereInput): Promise<number> => {
  return repo.countDeals(where);
};

export const countDealBookings = async (where?: Prisma.BookingWhereInput): Promise<number> => {
  return repo.countBookings(where);
};

export const countDealLocks = async (where?: Prisma.DealLockWhereInput): Promise<number> => {
  return repo.countLocks(where);
};

export const getPaidDealBookings = async (
  where: Prisma.BookingWhereInput
): Promise<repo.PaidDealBookingForDashboardRecord[]> => {
  return repo.getPaidBookingsForDashboard(where);
};





















// ─── Public Discovery / Discovery Queries ───

/**
 * Fetches active deals using cursor pagination.
 */
export const getActiveDealsCursor = async (params: { cursor?: string; limit: number; category?: string; isLocalOnly?: boolean }) => {
  return repo.getActiveDealsCursor(params);
};

/**
 * Searches active deals using cursor pagination and multiple filter conditions.
 */
export const searchDealsCursor = async (params: { cursorDate?: Date; limit: number; search?: string; location?: string; category?: string; isLocalOnly?: boolean }) => {
  return repo.searchDealsCursor(params);
};

/**
 * Retrieves deal variants that are active and eligible for locking.
 */
export const getDealVariantsForLockingPublic = async (dealId: string) => {
  const result = await repo.getDealVariantsForLockingPublic(dealId);
  if (!result) throw new NotFoundException("Deal not found");
  return result;
};

/**
 * Logs a deal search event.
 */
export const createSearchLog = async (data: CreateSearchLogDto) => {
  return repo.createSearchLog(data);
};

export const createDealViewEvent = async (data: CreateDealViewEventDto) => {
  return repo.createDealViewEvent(data);
};

/**
 * Retrieves public deal detailed view.
 */
export const getDealDetailPublic = async (id: string) => {
  const deal = await repo.getDealDetailPublic(id);
  if (!deal) throw new NotFoundException("Deal not found");
  return deal;
};

/**
 * Retrieves exclusions (add-ons) for a public deal.
 */
export const getDealExclusionsPublic = async (id: string) => {
  return repo.getDealExclusionsPublic(id);
};

/**
 * Retrieves discovery metrics for public statistics.
 */
export const getPlatformStatsPublic = async () => {
  return repo.getPlatformStatsPublic();
};

/**
 * Gets unique island names from active deals that have future variants.
 */
export const getActiveIslandsWithDeals = async (): Promise<string[]> => {
  return repo.getActiveIslandsWithDeals();
};

export const getMinimalIslandDeals = async (
  islandName: string,
  params?: { page?: number; limit?: number }
) => {
  return repo.getMinimalIslandDeals(islandName, params);
};



/**
 * Lists deals with pagination and filters.
 */
export const findDealsPaginated = async (
  where: DealWhereInput,
  cursor?: string,
  limit: number = 10
): Promise<AdminDealPaginatedRecord[]> => {
  return repo.findDealsPaginated(where, cursor, limit);
};

/**
 * Retrieves deals summary for a specific merchant.
 */
export const getMerchantDealsSummaryAdmin = async (
  merchantId: string,
  createdAtFilter?: Prisma.DateTimeFilter
): Promise<AdminMerchantDealsSummaryRecord[]> => {
  return repo.getMerchantDealsSummaryAdmin(merchantId, createdAtFilter);
};

/**
 * Retrieves deal details for administration.
 */
export const getDealDetailByIdAdmin = async (
  dealId: string
): Promise<AdminDealDetailRecord> => {
  const deal = await repo.getDealDetailByIdAdmin(dealId);
  if (!deal) throw new NotFoundException("Deal not found");
  return deal;
};

/**
 * Updates a deal by an administrator.
 */
export const updateDealAdmin = async (
  dealId: string,
  data: UpdateDealAdminDto
): Promise<{ id: string; title: string | null; displayedPrice: number | null; isActive: boolean; updatedAt: Date }> => {
  const deal = await repo.getDealDetailByIdAdmin(dealId);
  if (!deal) throw new NotFoundException("Deal not found");
  return repo.executeDealAdminUpdateTransaction(dealId, data);
};

/**
 * Retrieves variant details along with booking and lock counts.
 */
export const getVariantWithActivity = async (
  variantId: string
): Promise<AdminVariantWithActivityRecord> => {
  const variant = await repo.getVariantWithActivity(variantId);
  if (!variant) throw new NotFoundException("Variant not found");
  return variant;
};

/**
 * Updates pricing details for a variant by an administrator.
 */
export const updateVariantPriceAdmin = async (
  variantId: string,
  displayedPrice: number
): Promise<{ id: string; displayedPrice: number | null }> => {
  const variant = await repo.getVariantWithActivity(variantId);
  if (!variant) throw new NotFoundException("Variant not found");
  return repo.updateVariantPriceAdmin(variantId, displayedPrice);
};

export const getMerchantDealsAnalyticsData = async (merchantId: string) => {
  return repo.getMerchantDealsAnalyticsData(merchantId, getSriLankaTime());
};

