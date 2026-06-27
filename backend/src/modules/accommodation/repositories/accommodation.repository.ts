import type { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import type {
  BulkInventoryUpdateDto,
  CreateAccommodationCompleteDto,
  CreateUnitDto,
  UpdatePropertyDto,
} from "../dtos/accommodation.dto";
import {
  propertyFullInclude,
  propertySlimSelect,
  RoomInventoryStatus,
  minimalIslandAccommodationSelect,
} from "../types/accommodation.types";
import type { 
  PropertyRecord, 
  PropertySlimRecord,
  MinimalIslandAccommodationRecord,
} from "../types/accommodation.types";
import { getSriLankaTime } from "../../../utils/timezone";
import { InternalProcessingException } from "../../../exceptions/domain.exceptions";

const toInputJson = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value as Prisma.InputJsonValue;
};

// ─── Data Access Methods ─────────────────────────────────────────────────────

export const getPropertyById = async (propertyId: string): Promise<PropertyRecord | null> => {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: propertyFullInclude,
  });
};

export const getPropertyOwnershipInfo = async (propertyId: string) => {
  return prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      merchantId: true,
      isActive: true,
      name: true,
      address: true,
      city: true,
      island: true,
      homeListingType: true,
      units: {
        select: {
          id: true,
          totalInventory: true,
          verificationStatus: true,
          pricePerNight: true,
          localPrice: true,
          nonLocalPrice: true,
        },
      },
    },
  });
};

export const listMyPropertiesRaw = async (
  merchantId: string, 
  query: { limit: number; cursor?: string; page?: number }
): Promise<{ items: PropertySlimRecord[]; nextCursor: string | null; total: number }> => {
  const where = { merchantId };
  const isOffset = query.page !== undefined && query.page > 0;

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: propertySlimSelect,
      take: isOffset ? query.limit : query.limit + 1,
      cursor: (!isOffset && query.cursor) ? { id: query.cursor } : undefined,
      skip: isOffset ? (query.page! - 1) * query.limit : (query.cursor ? 1 : 0),
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where })
  ]);

  let nextCursor: string | null = null;
  if (!isOffset && items.length > query.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor, total };
};

export const createPropertyComplete = async (merchantId: string, payload: CreateAccommodationCompleteDto) => {
  return prisma.$transaction(async (tx) => {
    const property = await tx.property.create({
      data: {
        merchantId,
        type: payload.type,
        name: payload.name,
        description: payload.description,
        address: payload.address,
        city: payload.city,
        island: payload.island,
        zipCode: payload.zipCode,
        latitude: payload.latitude,
        longitude: payload.longitude,
        propertyFacilities: payload.propertyFacilities !== undefined ? toInputJson(payload.propertyFacilities) : undefined,
        services: payload.services !== undefined ? toInputJson(payload.services) : undefined,
        languages: payload.languages !== undefined ? toInputJson(payload.languages) : undefined,
        checkInFrom: payload.houseRules.checkInFrom,
        checkInTo: payload.houseRules.checkInTo,
        checkOutFrom: payload.houseRules.checkOutFrom,
        checkOutTo: payload.houseRules.checkOutTo,
        smokingAllowed: payload.houseRules.smokingAllowed,
        childrenAllowed: payload.houseRules.childrenAllowed,
        partiesAllowed: payload.houseRules.partiesAllowed,
        petsPolicy: toInputJson(payload.houseRules.petsPolicy),
        petFeesPolicy: toInputJson(payload.houseRules.petFeesPolicy),
        hostProfile: toInputJson(payload.hostProfile),
        starRating: payload.starRating,
        homeListingType: payload.homeListingType,
        nearbyPointsOfInterest: payload.nearbyPointsOfInterest !== undefined ? toInputJson(payload.nearbyPointsOfInterest) : undefined,
        marineLifeZones: payload.marineLifeZones !== undefined ? toInputJson(payload.marineLifeZones) : undefined,
        isActive: false,
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
      },
    });

    if (payload.images?.length) {
      await tx.propertyImage.createMany({
        data: payload.images.map((image) => ({
          propertyId: property.id,
          url: image.url,
        })),
      });
    }

    for (const unit of payload.units) {
      const createdUnit = await tx.unit.create({
        data: {
          propertyId: property.id,
          name: unit.name,
          maxGuests: unit.maxGuests ?? null,
          excludeInfants: unit.excludeInfants ?? false,
          bathrooms: unit.bathrooms ?? null,
          size: unit.size ?? null,
          smokingAllowed: unit.smokingAllowed ?? null,
          isBathroomPrivate: unit.isBathroomPrivate ?? null,
          bathroomItems: unit.bathroomItems !== undefined ? toInputJson(unit.bathroomItems) : undefined,
          cribsAvailable: unit.cribsAvailable ?? null,
          roomType: unit.roomType ?? null,
          pricePerNight: unit.pricePerNight,
          localPrice: unit.localPrice,
          nonLocalPrice: unit.nonLocalPrice,
          totalInventory: unit.totalInventory,
          dealLockExpireTime: unit.dealLockExpireTime,
          amenities: unit.amenities !== undefined ? toInputJson(unit.amenities) : undefined,
          verificationStatus: "PENDING",
          createdAt: getSriLankaTime(),
          updatedAt: getSriLankaTime(),
        },
      });

      if (unit.bedConfigurations?.length) {
        await tx.bedConfiguration.createMany({
          data: unit.bedConfigurations.map((bedConfig) => ({
            unitId: createdUnit.id,
            bedType: bedConfig.bedType,
            count: bedConfig.count,
          })),
        });
      }

      if (unit.ratePlan) {
        await tx.ratePlan.create({
          data: {
            propertyId: property.id,
            unitId: createdUnit.id,
            cancellationWindow: unit.ratePlan.cancellationWindow,
            cancellationFeeType: unit.ratePlan.cancellationFeeType,
            accidentalBookingProtection: unit.ratePlan.accidentalBookingProtection,
            occupancyPricingEnabled: unit.ratePlan.occupancyPricing.enabled,
            occupancyPricing: toInputJson(unit.ratePlan.occupancyPricing),
            childPricingEnabled: unit.ratePlan.childPricing.enabled,
            childPricingInfantsFree: unit.ratePlan.childPricing.infantsFree,
            childPricingChildrenFree: unit.ratePlan.childPricing.childrenFree,
            childPricingAgeFrom: unit.ratePlan.childPricing.childrenAgeFrom,
            childPricingAgeTo: unit.ratePlan.childPricing.childrenAgeTo,
            childPricingInfantFixedPrice: unit.ratePlan.childPricing.infantFixedPrice,
            childPricingChildFixedPrice: unit.ratePlan.childPricing.childFixedPrice,
          },
        });
      }
    }

    return property.id;
  });
};

export const updateProperty = async (propertyId: string, payload: UpdatePropertyDto) => {
  return prisma.property.update({
    where: { id: propertyId },
    data: {
      name: payload.name,
      description: payload.description,
      address: payload.address,
      city: payload.city,
      island: payload.island,
      zipCode: payload.zipCode,
      latitude: payload.latitude,
      longitude: payload.longitude,
      propertyFacilities: payload.propertyFacilities !== undefined ? toInputJson(payload.propertyFacilities) : undefined,
      services: payload.services !== undefined ? toInputJson(payload.services) : undefined,
      languages: payload.languages !== undefined ? toInputJson(payload.languages) : undefined,
      checkInFrom: payload.houseRules?.checkInFrom,
      checkInTo: payload.houseRules?.checkInTo,
      checkOutFrom: payload.houseRules?.checkOutFrom,
      checkOutTo: payload.houseRules?.checkOutTo,
      smokingAllowed: payload.houseRules?.smokingAllowed,
      childrenAllowed: payload.houseRules?.childrenAllowed,
      partiesAllowed: payload.houseRules?.partiesAllowed,
      petsPolicy: payload.houseRules?.petsPolicy !== undefined ? toInputJson(payload.houseRules.petsPolicy) : undefined,
      petFeesPolicy: payload.houseRules?.petFeesPolicy !== undefined ? toInputJson(payload.houseRules.petFeesPolicy) : undefined,
      hostProfile: payload.hostProfile !== undefined ? toInputJson(payload.hostProfile) : undefined,
      starRating: payload.starRating,
      homeListingType: payload.homeListingType,
      nearbyPointsOfInterest: payload.nearbyPointsOfInterest !== undefined ? toInputJson(payload.nearbyPointsOfInterest) : undefined,
      marineLifeZones: payload.marineLifeZones !== undefined ? toInputJson(payload.marineLifeZones) : undefined,
      updatedAt: getSriLankaTime(),
    },
  });
};

export const updatePropertyImages = async (propertyId: string, images: { url: string }[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.propertyImage.deleteMany({ where: { propertyId } });
    if (images.length > 0) {
      await tx.propertyImage.createMany({
        data: images.map((img) => ({
          propertyId,
          url: img.url,
        })),
      });
    }
    await tx.property.update({
      where: { id: propertyId },
      data: { updatedAt: getSriLankaTime() },
    });
  });
};

export const addUnitToProperty = async (propertyId: string, unit: CreateUnitDto) => {
  return prisma.$transaction(async (tx) => {
    const createdUnit = await tx.unit.create({
      data: {
        propertyId,
        name: unit.name,
        maxGuests: unit.maxGuests ?? null,
        excludeInfants: unit.excludeInfants ?? false,
        bathrooms: unit.bathrooms ?? null,
        size: unit.size ?? null,
        smokingAllowed: unit.smokingAllowed ?? null,
        isBathroomPrivate: unit.isBathroomPrivate ?? null,
        bathroomItems: unit.bathroomItems !== undefined ? toInputJson(unit.bathroomItems) : undefined,
        cribsAvailable: unit.cribsAvailable ?? null,
        roomType: unit.roomType ?? null,
        pricePerNight: unit.pricePerNight,
        localPrice: unit.localPrice,
        nonLocalPrice: unit.nonLocalPrice,
        totalInventory: unit.totalInventory,
        dealLockExpireTime: unit.dealLockExpireTime,
        amenities: unit.amenities !== undefined ? toInputJson(unit.amenities) : undefined,
        verificationStatus: "PENDING",
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
      },
    });

    if (unit.bedConfigurations?.length) {
      await tx.bedConfiguration.createMany({
        data: unit.bedConfigurations.map((bedConfig) => ({
          unitId: createdUnit.id,
          bedType: bedConfig.bedType,
          count: bedConfig.count,
        })),
      });
    }

    if (unit.ratePlan) {
      await tx.ratePlan.create({
        data: {
          propertyId,
          unitId: createdUnit.id,
          cancellationWindow: unit.ratePlan.cancellationWindow,
          cancellationFeeType: unit.ratePlan.cancellationFeeType,
          accidentalBookingProtection: unit.ratePlan.accidentalBookingProtection,
          occupancyPricingEnabled: unit.ratePlan.occupancyPricing.enabled,
          occupancyPricing: toInputJson(unit.ratePlan.occupancyPricing),
          childPricingEnabled: unit.ratePlan.childPricing.enabled,
          childPricingInfantsFree: unit.ratePlan.childPricing.infantsFree,
          childPricingChildrenFree: unit.ratePlan.childPricing.childrenFree,
          childPricingAgeFrom: unit.ratePlan.childPricing.childrenAgeFrom,
          childPricingAgeTo: unit.ratePlan.childPricing.childrenAgeTo,
          childPricingInfantFixedPrice: unit.ratePlan.childPricing.infantFixedPrice,
          childPricingChildFixedPrice: unit.ratePlan.childPricing.childFixedPrice,
        },
      });
    }

    return createdUnit.id;
  });
};

export const updateUnitToProperty = async (propertyId: string, unitId: string, unit: CreateUnitDto, isVerified: boolean) => {
  return await prisma.$transaction(async (tx) => {
    const updateData: Prisma.UnitUpdateInput = {
      name: unit.name,
      maxGuests: unit.maxGuests ?? null,
      excludeInfants: unit.excludeInfants ?? false,
      bathrooms: unit.bathrooms ?? null,
      size: unit.size ?? null,
      smokingAllowed: unit.smokingAllowed ?? null,
      isBathroomPrivate: unit.isBathroomPrivate ?? null,
      bathroomItems: unit.bathroomItems !== undefined ? toInputJson(unit.bathroomItems) : undefined,
      cribsAvailable: unit.cribsAvailable ?? null,
      roomType: unit.roomType ?? null,
      totalInventory: unit.totalInventory,
      dealLockExpireTime: unit.dealLockExpireTime,
      amenities: unit.amenities !== undefined ? toInputJson(unit.amenities) : undefined,
      updatedAt: getSriLankaTime(),
    };

    if (!isVerified) {
      updateData.pricePerNight = unit.pricePerNight;
      updateData.localPrice = unit.localPrice;
      updateData.nonLocalPrice = unit.nonLocalPrice;
    }

    await tx.unit.update({
      where: { id: unitId },
      data: updateData,
    });

    if (unit.bedConfigurations) {
      await tx.bedConfiguration.deleteMany({ where: { unitId } });
      if (unit.bedConfigurations.length > 0) {
        await tx.bedConfiguration.createMany({
          data: unit.bedConfigurations.map((bedConfig) => ({
            unitId,
            bedType: bedConfig.bedType,
            count: bedConfig.count,
          })),
        });
      }
    }

    if (unit.ratePlan) {
      await tx.ratePlan.deleteMany({ where: { unitId } });
      await tx.ratePlan.create({
        data: {
          propertyId,
          unitId,
          cancellationWindow: unit.ratePlan.cancellationWindow,
          cancellationFeeType: unit.ratePlan.cancellationFeeType,
          accidentalBookingProtection: unit.ratePlan.accidentalBookingProtection,
          occupancyPricingEnabled: unit.ratePlan.occupancyPricing.enabled,
          occupancyPricing: toInputJson(unit.ratePlan.occupancyPricing),
          childPricingEnabled: unit.ratePlan.childPricing.enabled,
          childPricingInfantsFree: unit.ratePlan.childPricing.infantsFree,
          childPricingChildrenFree: unit.ratePlan.childPricing.childrenFree,
          childPricingAgeFrom: unit.ratePlan.childPricing.childrenAgeFrom,
          childPricingAgeTo: unit.ratePlan.childPricing.childrenAgeTo,
          childPricingInfantFixedPrice: unit.ratePlan.childPricing.infantFixedPrice,
          childPricingChildFixedPrice: unit.ratePlan.childPricing.childFixedPrice,
        },
      });
    }

    return unitId;
  });
};

export const getExistingInventoryDates = async (unitId: string, dates: Date[]) => {
  return prisma.roomInventory.findMany({
    where: {
      unitId,
      date: { in: dates },
    },
    select: { date: true },
  });
};

export const updateBulkInventory = async (unitId: string, dates: Date[], input: BulkInventoryUpdateDto, totalRooms: number) => {
  return await prisma.$transaction(async (tx) => {
    const existingInventories = await tx.roomInventory.findMany({
      where: { unitId, date: { in: dates } },
    });

    const existingDatesMap = new Map(existingInventories.map((inventory) => [inventory.date.toISOString(), inventory]));
    const datesToCreate = dates.filter((date) => !existingDatesMap.has(date.toISOString()));

    if (datesToCreate.length > 0) {
      await tx.roomInventory.createMany({
        data: datesToCreate.map((date) => ({
          unitId,
          date,
          totalRooms,
          availableRooms: totalRooms,
          priceOverride: input.priceOverride ?? null,
          status: (input.status as RoomInventoryStatus) ?? "available",
          createdAt: getSriLankaTime(),
          updatedAt: getSriLankaTime(),
        })),
      });
    }

    const inventoryUpdateResult = await tx.roomInventory.updateMany({
      where: { unitId, date: { in: dates } },
      data: {
        totalRooms,
        availableRooms: totalRooms,
        priceOverride: input.priceOverride ?? undefined,
        status: (input.status as RoomInventoryStatus) ?? undefined,
        updatedAt: getSriLankaTime(),
      },
    });

    if (inventoryUpdateResult.count === 0 && dates.length > 0) {
      throw new InternalProcessingException("Failed to update daily inventory records.");
    }

    const allInventories = await tx.roomInventory.findMany({
      where: { unitId, date: { in: dates } },
    });

    const inventoryIds = allInventories.map((inventory) => inventory.id);
    const existingSlots = await tx.roomVariant.findMany({
      where: { inventoryId: { in: inventoryIds } },
    });

    const slotsToCreate: Array<{ inventoryId: string; roomNumber: number; status: "available"; createdAt: Date; updatedAt: Date }> = [];
    const slotsToRemove: string[] = [];

    for (const inventory of allInventories) {
      const currentSlots = existingSlots.filter((slot) => slot.inventoryId === inventory.id);
      const currentRoomNumbers = new Set(currentSlots.map((slot) => slot.roomNumber));
      const targetCount = inventory.totalRooms;

      for (let roomNumber = 1; roomNumber <= targetCount; roomNumber += 1) {
        if (!currentRoomNumbers.has(roomNumber)) {
          slotsToCreate.push({
            inventoryId: inventory.id,
            roomNumber,
            status: "available",
            createdAt: getSriLankaTime(),
            updatedAt: getSriLankaTime(),
          });
        }
      }

      for (const slot of currentSlots) {
        if (slot.roomNumber > targetCount && slot.status === "available") {
          slotsToRemove.push(slot.id);
        }
      }
    }

    if (slotsToCreate.length > 0) {
      await tx.roomVariant.createMany({ data: slotsToCreate, skipDuplicates: true });
    }

    if (slotsToRemove.length > 0) {
      await tx.roomVariant.deleteMany({ where: { id: { in: slotsToRemove } } });
    }

    return { success: true, updatedDays: dates.length };
  }, {
    timeout: 15000,
  });
};

export const getRoomInventoryRaw = async (unitId: string, start: Date, end: Date) => {
  return prisma.roomInventory.findMany({
    where: {
      unitId,
      date: { gte: start, lte: end },
    },
    include: {
      slots: {
        include: {
          bookings: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          locks: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { roomNumber: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });
};

export const deletePropertyRaw = async (propertyId: string) => {
  await prisma.property.delete({ where: { id: propertyId } });
};

export const getRoomSlotById = async (slotId: string) => {
  return prisma.roomVariant.findUnique({
    where: { id: slotId },
    include: { inventory: { include: { unit: true } } },
  });
};

export const blockRoomSlotRaw = async (slotId: string, inventoryId: string) => {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.roomVariant.update({
      where: { id: slotId },
      data: { status: "blocked", updatedAt: getSriLankaTime() },
    });

    await tx.roomInventory.update({
      where: { id: inventoryId },
      data: {
        availableRooms: { decrement: 1 },
        updatedAt: getSriLankaTime(),
      },
    });

    return updated;
  });
};

export const restoreRoomSlotRaw = async (slotId: string, inventoryId: string) => {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.roomVariant.update({
      where: { id: slotId },
      data: { status: "available", updatedAt: getSriLankaTime() },
    });

    await tx.roomInventory.update({
      where: { id: inventoryId },
      data: {
        availableRooms: { increment: 1 },
        updatedAt: getSriLankaTime(),
      },
    });

    return updated;
  });
};

export const listPropertyLocksRaw = async (
  propertyId: string, 
  query: { startDate?: string; endDate?: string; page: number; limit: number }
) => {
  const where: Prisma.AccommodationLockWhereInput = { propertyId };

  let start = query.startDate ? new Date(query.startDate) : undefined;
  let end = query.endDate ? new Date(query.endDate) : undefined;

  if (!start && !end) {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
    
    const monday = new Date(today.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    start = monday;
    end = sunday;
  }

  if (start || end) {
    where.checkInDate = {};
    if (start) where.checkInDate.gte = start;
    if (end) where.checkInDate.lte = end;
  }

  const total = await prisma.accommodationLock.count({ where });

  const items = await prisma.accommodationLock.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    include: {
      unit: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      customAddons: true,
      chatRooms: { select: { id: true }, take: 1 },
    },
  });

  return { items, total };
};

export const listPropertyBookingsRaw = async (
  propertyId: string, 
  query: { startDate?: string; endDate?: string; page: number; limit: number }
) => {
  const where: Prisma.AccommodationBookingWhereInput = { propertyId };

  let start = query.startDate ? new Date(query.startDate) : undefined;
  let end = query.endDate ? new Date(query.endDate) : undefined;

  if (!start && !end) {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
    
    const monday = new Date(today.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    start = monday;
    end = sunday;
  }

  if (start || end) {
    where.checkInDate = {};
    if (start) where.checkInDate.gte = start;
    if (end) where.checkInDate.lte = end;
  }

  const total = await prisma.accommodationBooking.count({ where });

  const items = await prisma.accommodationBooking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    include: {
      unit: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      customAddons: true,
      lock: {
        include: {
          chatRooms: { select: { id: true }, take: 1 },
        },
      },
    },
  });

  return { items, total };
};


// ─── Public Discovery / Discovery Queries ───

export const getAccommodationDealsCursor = async (params: { cursor?: string; limit: number; island?: string }, isLocal: boolean = false) => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);
  
  const where: Prisma.PropertyWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    units: {
      some: {
        inventory: { some: { date: { gte: today }, availableRooms: { gt: 0 }, status: "available" } }
      }
    }
  };

  if (params.island) {
    where.island = { contains: params.island, mode: "insensitive" };
  }
 
  const items = await prisma.property.findMany({
    where,
    take: params.limit + 1,
    cursor: params.cursor ? { id: params.cursor } : undefined,
    skip: params.cursor ? 1 : 0,
    include: {
      images: { take: 1 },
      units: {
        select: { nonLocalPrice: true, localPrice: true, pricePerNight: true },
        orderBy: { nonLocalPrice: "asc" },
        take: 1
      },
      merchant: { select: { id: true, businessName: true, logoUrl: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  let nextCursor = null;
  if (items.length > params.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }
 
  const mappedData = items.map((prop) => {
    const cheapestUnit = prop.units[0];
    const finalPrice = (isLocal && cheapestUnit?.localPrice) 
      ? cheapestUnit.localPrice 
      : (cheapestUnit?.nonLocalPrice || cheapestUnit?.pricePerNight || 0);

    return {
      id: prop.id,
      title: prop.name,
      description: prop.description,
      location: `${prop.city}, ${prop.island}`,
      category: "Accommodation",
      primaryImageUrl: prop.images[0]?.url || null,
      displayedPrice: finalPrice,
      originalPrice: cheapestUnit?.pricePerNight || 0,
      averageRating: prop.averageRating || 5.0,
      totalReviews: prop.totalReviews || 0,
      createdAt: prop.createdAt,
      merchant: prop.merchant,
      isAccommodation: true,
      durationDays: 1,
      isLocalOnly: false,
    };
  });
 
  return { items: mappedData, nextCursor };
};

export const getPropertyDetailPublic = async (id: string, isLocal: boolean = false) => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const property = await prisma.property.findFirst({
    where: { id, isActive: true, merchant: { verificationStatus: "verified" } },
    include: {
      merchant: { select: { id: true, businessName: true, businessDescription: true, logoUrl: true, city: true, country: true } },
      images: true,
      units: {
        include: {
          inventory: {
            where: { date: { gte: today }, availableRooms: { gt: 0 }, status: "available" },
            include: { slots: { where: { status: "available" }, select: { id: true, roomNumber: true } } },
            orderBy: { date: "asc" },
            take: 60,
          },
          bedConfigs: true,
        },
      },
      ratePlans: true,
    },
  });

  if (!property) return null;

  const resolvedUnits = property.units.map(unit => {
    const finalPrice = (isLocal && unit.localPrice) ? unit.localPrice : (unit.nonLocalPrice || unit.pricePerNight || 0);
    return { ...unit, displayedPrice: finalPrice, localPrice: undefined, nonLocalPrice: undefined };
  });

  return { ...property, units: resolvedUnits };
};

/**
 * Gets unique island names from active accommodations that have future room availability.
 */
export const getActiveIslandsWithRooms = async (): Promise<string[]> => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const properties = await prisma.property.findMany({
    where: {
      isActive: true,
      merchant: { verificationStatus: "verified" },
      units: {
        some: {
          inventory: {
            some: {
              date: { gte: today },
              availableRooms: { gt: 0 },
              status: "available",
            },
          },
        },
      },
    },
    select: {
      island: true,
    },
  });

  const islands = new Set<string>();
  for (const prop of properties) {
    if (prop.island) {
      const cleanIsland = prop.island.split(" (")[0].trim();
      islands.add(cleanIsland);
    }
  }
  return Array.from(islands);
};

export const getMinimalIslandAccommodations = async (
  islandName: string,
  params?: { page?: number; limit?: number }
): Promise<{ items: MinimalIslandAccommodationRecord[]; total: number }> => {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const where: Prisma.PropertyWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    island: { contains: islandName, mode: "insensitive" },
    units: {
      some: {
        inventory: {
          some: {
            date: { gte: today },
            availableRooms: { gt: 0 },
            status: "available",
          },
        },
      },
    },
  };

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: minimalIslandAccommodationSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return { items, total };
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
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  // If a category filter is active, and it is NOT "all" and NOT "Accommodation" (case-insensitive),
  // then accommodations should not match.
  if (params.category && params.category.toLowerCase() !== "all" && params.category.toLowerCase() !== "accommodation") {
    return { items: [], nextCursor: null };
  }

  // Active future available rooms condition
  const where: Prisma.PropertyWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    units: {
      some: {
        inventory: {
          some: {
            date: { gte: today },
            availableRooms: { gt: 0 },
            status: "available"
          }
        }
      }
    }
  };

  if (params.cursorDate) {
    where.createdAt = { lt: params.cursorDate };
  }

  // Island filter
  if (params.island) {
    where.island = { contains: params.island, mode: "insensitive" as const };
  }

  // Location filter (searches city or island or address)
  if (params.location) {
    where.OR = [
      { city: { contains: params.location, mode: "insensitive" as const } },
      { island: { contains: params.location, mode: "insensitive" as const } },
      { address: { contains: params.location, mode: "insensitive" as const } }
    ];
  }

  // Search term (searches name, description, city, island, atoll, etc.)
  if (params.search) {
    const term = params.search.trim();
    if (term) {
      const searchConditions = [
        { name: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
        { city: { contains: term, mode: "insensitive" as const } },
        { island: { contains: term, mode: "insensitive" as const } }
      ];
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions }
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }
  }

  // Local Residency pricing check
  if (params.isLocalOnly !== undefined) {
    if (params.isLocalOnly) {
      where.units = {
        some: {
          localPrice: { not: null }
        }
      };
    }
  }

  const items = await prisma.property.findMany({
    where,
    take: params.limit + 1,
    include: {
      images: { take: 1 },
      units: {
        select: { nonLocalPrice: true, localPrice: true, pricePerNight: true },
        orderBy: { nonLocalPrice: "asc" },
        take: 1
      },
      merchant: { select: { id: true, businessName: true, logoUrl: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  let nextCursor = null;
  if (items.length > params.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  const whereCount = { ...where };
  delete whereCount.createdAt;
  const total = await prisma.property.count({ where: whereCount });

  const mappedData = items.map((prop) => {
    const cheapestUnit = prop.units[0];
    const finalPrice = (isLocal && cheapestUnit?.localPrice) 
      ? cheapestUnit.localPrice 
      : (cheapestUnit?.nonLocalPrice || cheapestUnit?.pricePerNight || 0);

    return {
      id: prop.id,
      title: prop.name,
      description: prop.description,
      location: `${prop.city}, ${prop.island}`,
      category: "Accommodation",
      primaryImageUrl: prop.images[0]?.url || null,
      displayedPrice: finalPrice,
      originalPrice: cheapestUnit?.pricePerNight || 0,
      averageRating: prop.averageRating || 5.0,
      totalReviews: prop.totalReviews || 0,
      createdAt: prop.createdAt,
      merchant: prop.merchant,
      isAccommodation: true,
      durationDays: 1,
      isLocalOnly: false,
    };
  });

  return { items: mappedData, nextCursor, total };
};

// ------------- Admin -----------------

export const countAccommodations = async (where?: Prisma.PropertyWhereInput): Promise<number> => {
  return prisma.property.count({ where });
};

export const countBookings = async (where?: Prisma.AccommodationBookingWhereInput): Promise<number> => {
  return prisma.accommodationBooking.count({ where });
};

export const countLocks = async (where?: Prisma.AccommodationLockWhereInput): Promise<number> => {
  return prisma.accommodationLock.count({ where });
};

export interface PaidAccommodationBookingForDashboardRecord {
  createdAt: Date;
  totalPrice: number;
}

export const getPaidBookingsForDashboard = async (
  where: Prisma.AccommodationBookingWhereInput
): Promise<PaidAccommodationBookingForDashboardRecord[]> => {
  return prisma.accommodationBooking.findMany({
    where: {
      status: "confirmed",
      ...where,
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  });
};

export interface MerchantAccommodationAnalyticsData {
  properties: { id: string; name: string | null; isActive: boolean }[];
  locks: { propertyId: string; quantity: number }[];
  bookings: {
    propertyId: string;
    totalPrice: number;
    createdAt: Date;
    lock: { quantity: number } | null;
    slots: { id: string }[];
    unit: { pricePerNight: number | null } | null;
  }[];
}

export const getMerchantAccommodationAnalyticsData = async (merchantId: string, now: Date): Promise<MerchantAccommodationAnalyticsData> => {
  const [properties, locks, bookings] = await Promise.all([
    prisma.property.findMany({
      where: { merchantId },
      select: { id: true, name: true, isActive: true },
    }),
    prisma.accommodationLock.findMany({
      where: {
        property: { merchantId },
        status: "active",
        expiresAt: { gt: now },
      },
      select: { propertyId: true, quantity: true },
    }),
    prisma.accommodationBooking.findMany({
      where: {
        property: { merchantId },
        status: "confirmed",
      },
      select: {
        propertyId: true,
        totalPrice: true,
        createdAt: true,
        lock: { select: { quantity: true } },
        slots: { select: { id: true } },
        unit: { select: { pricePerNight: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return { properties, locks, bookings };
};

