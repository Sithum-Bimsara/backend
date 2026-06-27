import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import { BadRequestException } from "../../../exceptions/bad-request.exception";
import { ForbiddenException } from "../../../exceptions/forbidden.exception";
import { Property, Unit, Prisma } from "@prisma/client";
import type {
  AddUnitDto,
  BulkInventoryUpdateDto,
  CreateAccommodationCompleteDto,
  CreateUnitDto,
  UpdatePropertyDto,
  ViewPropertyDto,
  InventoryDateRangeDto,
  ListPropertiesQueryDto,
  ListLocksQueryDto,
  ListBookingsQueryDto,
  PaginatedPropertyResponseDto,
  PaginatedLockResponseDto,
  PaginatedBookingResponseDto,
} from "../dtos/accommodation.dto";
import { 
  viewPropertySchema, 
  paginatedPropertyResponseSchema,
  paginatedLockResponseSchema,
  paginatedBookingResponseSchema,
  viewUnitSchema
} from "../dtos/accommodation.dto";
import * as repo from "../repositories/accommodation.repository";
import { BED_CAPACITY } from "../accommodation.constants";
import { getSriLankaTime } from "../../../utils/timezone";

// ─── Business Logic Helpers ──────────────────────────────────────────────────

const calculateUnitMaxGuests = (unit: CreateUnitDto): number => {
  if (typeof unit.maxGuests === "number" && unit.maxGuests > 0) {
    return unit.maxGuests;
  }
  const calculated = (unit.bedConfigurations || []).reduce((total, config) => {
    return total + (BED_CAPACITY[config.bedType] || 1) * Math.max(0, config.count);
  }, 0);
  return calculated > 0 ? calculated : 1;
};

const normalizeBedConfigurations = (unit: CreateUnitDto) => {
  return (unit.bedConfigurations || []).filter((config) => config.count > 0);
};

const normalizeUnits = (units?: CreateUnitDto[]): CreateUnitDto[] => {
  return (units || []).map((unit) => {
    const bedConfigurations = normalizeBedConfigurations(unit);
    return {
      ...unit,
      maxGuests: calculateUnitMaxGuests({ ...unit, bedConfigurations }),
      bedConfigurations,
    };
  });
};

const parseInventoryDateRange = (input: InventoryDateRangeDto) => {
  const start = getSriLankaTime(input.startDate);
  const end = getSriLankaTime(input.endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new BadRequestException("Invalid date range");
  }

  const today = getSriLankaTime();
  today.setHours(0, 0, 0, 0);
  if (start < today) {
    throw new BadRequestException("Cannot select dates in the past");
  }

  const daysDifference = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDifference > 15) {
    throw new BadRequestException("Date range cannot exceed 15 days");
  }
  return { start, end };
};

const buildDates = (start: Date, end: Date, daysOfWeek?: number[]) => {
  const dates: Date[] = [];
  let current = new Date(start);
  while (current <= end) {
    if (!daysOfWeek || daysOfWeek.includes(current.getDay())) {
      dates.push(getSriLankaTime(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// ─── Service Methods ─────────────────────────────────────────────────────────

export const getProperty = async (propertyId: string): Promise<ViewPropertyDto> => {
  const property = await repo.getPropertyById(propertyId);
  if (!property) throw new NotFoundException("Property not found");
  
  return viewPropertySchema.parse(property);
};

export const listMyProperties = async (
  merchantProfileId: string,
  query: ListPropertiesQueryDto,
): Promise<PaginatedPropertyResponseDto> => {
  const { items, nextCursor, total } = await repo.listMyPropertiesRaw(merchantProfileId, query);

  return paginatedPropertyResponseSchema.parse({
    items,
    nextCursor,
    total,
  });
};

export const createPropertyComplete = async (
  merchantProfileId: string,
  payload: CreateAccommodationCompleteDto,
): Promise<ViewPropertyDto> => {
  // Business Logic: Enforce private_room for hotel property types
  if (payload.type === 'hotel') {
    payload.homeListingType = 'private_room';
  }

  // Business Logic: Enforce single-unit restriction for entire_place listings
  if (payload.homeListingType === 'entire_place') {
    if (payload.units.length > 1) {
      throw new BadRequestException("Entire place listings can only have one unit.");
    }
    // Force inventory to 1 for the single unit
    if (payload.units.length === 1) {
      payload.units[0].totalInventory = 1;
    }
  }

  const normalizedUnits = normalizeUnits(payload.units);
  const normalizedPayload = { ...payload, units: normalizedUnits };

  const propertyId = await repo.createPropertyComplete(merchantProfileId, normalizedPayload);
  return getProperty(propertyId);
};

export const updateProperty = async (
  propertyId: string,
  payload: UpdatePropertyDto,
): Promise<ViewPropertyDto> => {
  // Security: Restrict core updates for active listings
  // if (property.isActive) {
  //   const isCoreFieldChanged = payload.name || payload.address || payload.city || payload.island;
  //   if (isCoreFieldChanged) {
  //     throw new BadRequestException(
  //       "Core property details cannot be modified while the listing is active. Please contact admin.",
  //     );
  //   }
  // }
  await repo.updateProperty(propertyId, payload);
  return getProperty(propertyId);
};

export const updatePropertyImages = async (
  propertyId: string,
  images: { url: string }[],
): Promise<ViewPropertyDto> => {
  await repo.updatePropertyImages(propertyId, images);
  return getProperty(propertyId);
};

export const addUnitToProperty = async (
  property: Property & { units: Unit[] },
  payload: AddUnitDto,
) => {
  if (property.homeListingType === 'entire_place') {
    throw new BadRequestException("Cannot add units to an 'Entire Place' listing.");
  }

  const normalizedUnit = normalizeUnits([payload])[0];
  const unitId = await repo.addUnitToProperty(property.id, normalizedUnit);
  
  const updatedProperty = await repo.getPropertyById(property.id);
  const unit = updatedProperty?.units.find(u => u.id === unitId);
  
  return viewUnitSchema.parse(unit);
};

export const updateUnitOfProperty = async (
  property: Property & { units: Unit[] },
  unitId: string,
  payload: AddUnitDto,
) => {
  const existingUnit = property.units.find((u) => u.id === unitId);
  if (!existingUnit) {
    throw new NotFoundException("Unit not found in this property.");
  }

  const isPricingChanged =
    payload.pricePerNight !== existingUnit.pricePerNight ||
    payload.localPrice !== existingUnit.localPrice ||
    payload.nonLocalPrice !== existingUnit.nonLocalPrice;

  if (isPricingChanged && existingUnit.verificationStatus === "VERIFIED" && property.isActive) {
    throw new ForbiddenException("Pricing cannot be modified for verified units while active.");
  }

  const normalizedUnit = normalizeUnits([payload])[0];
  const isVerified = existingUnit.verificationStatus === "VERIFIED";

  await repo.updateUnitToProperty(property.id, unitId, normalizedUnit, isVerified);
  
  const updatedProperty = await repo.getPropertyById(property.id);
  const unit = updatedProperty?.units.find(u => u.id === unitId);
  
  return viewUnitSchema.parse(unit);
};

export const previewBulkInventory = async (
  property: Property & { units: Unit[] },
  input: BulkInventoryUpdateDto,
) => {
  const unit = property.units.find((item) => item.id === input.unitId);

  if (!unit) {
    throw new NotFoundException("Unit not found");
  }

  const { start, end } = parseInventoryDateRange(input);
  const dates = buildDates(start, end, input.daysOfWeek);

  const existingInventory = await repo.getExistingInventoryDates(input.unitId, dates);
  const conflicts = existingInventory.map((inventory) => inventory.date.toISOString().split("T")[0]);
  const formattedDates = dates.map((date) => date.toISOString().split("T")[0]);

  return {
    dates: formattedDates,
    conflicts,
  };
};

export const updateBulkInventory = async (
  property: Property & { units: Unit[] },
  input: BulkInventoryUpdateDto,
) => {
  const unit = property.units.find((item) => item.id === input.unitId);

  if (!unit) {
    throw new NotFoundException("Unit not found");
  }

  const { start, end } = parseInventoryDateRange(input);
  const dates = buildDates(start, end, input.daysOfWeek);
  const totalRooms = input.totalRooms ?? unit.totalInventory;

  return repo.updateBulkInventory(input.unitId, dates, input, totalRooms);
};

export const getRoomInventory = async (
  unitId: string,
  startDate: string,
  endDate: string,
) => {
  const start = getSriLankaTime(startDate);
  const end = getSriLankaTime(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return repo.getRoomInventoryRaw(unitId, start, end);
};

export const deleteProperty = async (propertyId: string) => {
  await repo.deletePropertyRaw(propertyId);
  return { success: true };
};

export const blockRoomSlot = async (propertyId: string, slotId: string) => {
  const slot = await repo.getRoomSlotById(slotId);
  if (!slot || slot.inventory.unit.propertyId !== propertyId) {
    throw new NotFoundException("Slot not found");
  }

  if (slot.status === "booked" || slot.status === "locked") {
    throw new BadRequestException("Cannot block a room that is currently booked or locked.");
  }

  if (slot.status === "blocked") {
    return { success: true, slot };
  }

  const updatedSlot = await repo.blockRoomSlotRaw(slotId, slot.inventory.id);
  return { success: true, slot: updatedSlot };
};

export const restoreRoomSlot = async (propertyId: string, slotId: string) => {
  const slot = await repo.getRoomSlotById(slotId);
  if (!slot || slot.inventory.unit.propertyId !== propertyId) {
    throw new NotFoundException("Slot not found");
  }

  if (slot.status !== "blocked") {
    throw new BadRequestException("Only manually blocked slots can be restored.");
  }

  const updatedSlot = await repo.restoreRoomSlotRaw(slotId, slot.inventory.id);
  return { success: true, slot: updatedSlot };
};

export const listPropertyLocks = async (
  propertyId: string,
  query: ListLocksQueryDto,
): Promise<PaginatedLockResponseDto> => {
  const { items, total } = await repo.listPropertyLocksRaw(propertyId, query);

  const mapped = items.map((lock) => {
    const addonsTotal = lock.customAddons.reduce((sum, a) => sum + a.price, 0);
    return {
      id: lock.id,
      checkInDate: lock.checkInDate,
      checkOutDate: lock.checkOutDate,
      lockedPrice: lock.lockedPrice,
      expiresAt: lock.expiresAt,
      quantity: lock.quantity,
      status: lock.status,
      createdAt: lock.createdAt,
      unitName: lock.unit.name,
      unitId: lock.unit.id,
      user: lock.user,
      addons: lock.customAddons.map((a) => ({ id: a.id, name: a.name, price: a.price, details: a.details, addedAt: a.addedAt })),
      addonsTotal,
      grandTotal: lock.lockedPrice + addonsTotal,
      chatRoomId: lock.chatRooms[0]?.id ?? null,
    };
  });

  return paginatedLockResponseSchema.parse({
    items: mapped,
    total,
  });
};

export const listPropertyBookings = async (
  propertyId: string,
  query: ListBookingsQueryDto,
): Promise<PaginatedBookingResponseDto> => {
  const { items, total } = await repo.listPropertyBookingsRaw(propertyId, query);

  const mapped = items.map((booking) => {
    const addonsTotal = booking.customAddons.reduce((sum, a) => sum + a.price, 0);
    return {
      id: booking.id,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      unitName: booking.unit.name,
      unitId: booking.unit.id,
      user: booking.user,
      addons: booking.customAddons.map((a) => ({ id: a.id, name: a.name, price: a.price, details: a.details, addedAt: a.addedAt })),
      addonsTotal,
      grandTotal: booking.totalPrice + addonsTotal,
      lockId: booking.lockId ?? null,
      chatRoomId: booking.lock?.chatRooms?.[0]?.id ?? null,
    };
  });

  return paginatedBookingResponseSchema.parse({
    items: mapped,
    total,
  });
};

// ─── Public Discovery ────────────────────────────────────────────────────────

export const getAccommodationDeals = async (params: { cursor?: string; limit: number; island?: string }, isLocal: boolean = false) => {
  return repo.getAccommodationDealsCursor(params, isLocal);
};

export const getPropertyDetailPublic = async (id: string, isLocal: boolean = false) => {
  const property = await repo.getPropertyDetailPublic(id, isLocal);
  if (!property) throw new NotFoundException("Property not found");
  return property;
};

/**
 * Gets unique island names from active accommodations that have future room availability.
 */
export const getActiveIslandsWithRooms = async (): Promise<string[]> => {
  return repo.getActiveIslandsWithRooms();
};

export const getMinimalIslandAccommodations = async (
  islandName: string,
  params?: { page?: number; limit?: number }
) => {
  return repo.getMinimalIslandAccommodations(islandName, params);
};

export const searchAccommodationsCursor = async (
  params: {
    cursorDate?: Date;
    limit: number;
    search?: string;
    location?: string;
    category?: string;
    island?: string;
    isLocalOnly?: boolean;
  },
  isLocal: boolean = false
) => {
  return repo.searchAccommodationsCursor(params, isLocal);
};

// ========================================== Admin Functions ==========================================

export const countAccommodations = async (where?: Prisma.PropertyWhereInput): Promise<number> => {
  return repo.countAccommodations(where);
};

export const countAccommodationBookings = async (where?: Prisma.AccommodationBookingWhereInput): Promise<number> => {
  return repo.countBookings(where);
};

export const countAccommodationLocks = async (where?: Prisma.AccommodationLockWhereInput): Promise<number> => {
  return repo.countLocks(where);
};

export const getPaidAccommodationBookings = async (
  where: Prisma.AccommodationBookingWhereInput
): Promise<repo.PaidAccommodationBookingForDashboardRecord[]> => {
  return repo.getPaidBookingsForDashboard(where);
};

export const getMerchantAccommodationAnalyticsData = async (merchantId: string) => {
  return repo.getMerchantAccommodationAnalyticsData(merchantId, getSriLankaTime());
};