import { prisma } from "../../../config/prisma";
import { Prisma, VariantSlot } from "@prisma/client";
import { getSriLankaTime } from "../../../utils/timezone";
import { InternalProcessingException } from "../../../exceptions/domain.exceptions";
import { 
  CreateDealDto, 
  UpdateDealDto, 
  UpdateVariantDto, 
  VariantsQueryDto,
} from "../dtos/deals.dtos";
import {
  DealDetailed,
  DealSummary,
  DealVariantDetailed,
  dealDetailedInclude,
  dealSummarySelect,
  dealVariantDetailedInclude,
  DealWhereInput,
  AdminMerchantDealsSummaryRecord,
  AdminDealPaginatedRecord,
  adminDealPaginatedSelect,
  AdminDealDetailRecord,
  AdminVariantWithActivityRecord,
  adminVariantWithActivitySelect,
  DealSlimRecord,
  dealSlimSelect,
  VariantSlotWithVariantAndDeal,
  variantDateSelect,
  VariantDateRecord,
  BulkCreateVariantsParams,
  MinimalIslandDealRecord,
  minimalIslandDealSelect,
} from "../types/deals.types";

// ─── Deal Repository ───

/**
 * Creates a new deal.
 */
export const createDeal = async (
  data: CreateDealDto & { merchantId: string; displayedPrice: number }
): Promise<DealDetailed> => {
  const { itineraries, inclusions, exclusions, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    // 1) Create the parent Deal record
    const deal = await tx.deal.create({
      data: {
        merchantId: rest.merchantId,
        title: rest.title,
        description: rest.description || "",
        location: rest.location || "",
        category: rest.category || "",
        durationDays: rest.durationDays || 0,
        originalPrice: rest.originalPrice || 0,
        dealPrice: rest.dealPrice || 0,
        displayedPrice: rest.displayedPrice,
        dealLockExpireTime: rest.dealLockExpireTime || 5,
        durationType: rest.durationType,
        primaryImageUrl: rest.primaryImageUrl,
        secondImageUrl: rest.secondImageUrl,
        thirdImageUrl: rest.thirdImageUrl,
        fourthImageUrl: rest.fourthImageUrl,
        isLocalOnly: rest.isLocalOnly ?? false,
        currency: rest.currency ?? "USD",
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
      },
    });

    // 2) Save related lists sequentially using the generated deal ID
    if (itineraries && itineraries.length > 0) {
      await tx.itinerary.createMany({
        data: itineraries.map((it) => ({
          dayNumber: it.dayNumber,
          title: it.title,
          description: it.description,
          dealId: deal.id,
        })),
      });
    }

    if (inclusions && inclusions.length > 0) {
      await tx.inclusions.createMany({
        data: inclusions.map((inc) => ({
          description: inc.description,
          dealId: deal.id,
        })),
      });
    }

    if (exclusions && exclusions.length > 0) {
      await tx.exclusions.createMany({
        data: exclusions.map((exc) => ({
          description: exc.description,
          additionalPrice: exc.additionalPrice,
          dealId: deal.id,
        })),
      });
    }

    // 3) Fetch and return the fully populated deal record matching DealDetailed type
    const finalDeal = await tx.deal.findUnique({
      where: { id: deal.id },
      include: dealDetailedInclude,
    });

    if (!finalDeal) {
      throw new InternalProcessingException("Failed to retrieve created deal inside transaction");
    }

    return finalDeal;
  });
};

/**
 * Finds a deal by ID with full details.
 */
export const getDealById = async (id: string): Promise<DealDetailed | null> => {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      ...dealDetailedInclude,
      variants: {
        orderBy: { startDatetime: "asc" },
      },
    },
  });
};

/**
 * Counts active bookings for a specific deal.
 */
export const countActiveBookingsByDeal = async (dealId: string): Promise<number> => {
  return prisma.booking.count({
    where: {
      dealId,
      paymentStatus: { in: ['paid', 'pending'] },
    },
  });
};

/**
 * Lists all deals for a merchant.
 */
export const getDealsByMerchant = async (merchantId: string): Promise<DealSummary[]> => {
  return prisma.deal.findMany({
    where: { merchantId },
    select: dealSummarySelect,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Lists merchant deals with cursor-based pagination and searching.
 */
export const listMyDealsRaw = async (
  merchantId: string,
  query: { limit: number; cursor?: string; page?: number; search?: string }
): Promise<{ items: DealSlimRecord[]; nextCursor: string | null; total: number }> => {
  const where: Prisma.DealWhereInput = {
    merchantId,
  };

  if (query.search) {
    const term = query.search.trim();
    if (term) {
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { category: { contains: term, mode: "insensitive" } },
      ];
    }
  }

  const isOffset = query.page !== undefined && query.page > 0;

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      take: isOffset ? query.limit : query.limit + 1,
      cursor: (!isOffset && query.cursor) ? { id: query.cursor } : undefined,
      skip: isOffset ? (query.page! - 1) * query.limit : (query.cursor ? 1 : 0),
      orderBy: { createdAt: "desc" },
      select: dealSlimSelect,
    }),
    prisma.deal.count({ where })
  ]);

  let nextCursor: string | null = null;
  if (!isOffset && items.length > query.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor, total };
};

/**
 * Updates an existing deal and its variants' pricing if changed.
 */
export const updateDeal = async (id: string, data: UpdateDealDto): Promise<DealDetailed | null> => {
  const { itineraries, inclusions, exclusions, ...dealData } = data;

  return prisma.$transaction(async (tx) => {
    const updatePayload: Prisma.DealUpdateInput = {
      ...dealData,
      updatedAt: getSriLankaTime()
    };

    let isUpdatingPrice = false;
    if (dealData.dealPrice !== undefined) {
      isUpdatingPrice = true;
      const existing = await tx.deal.findUnique({ where: { id }, select: { isLocalOnly: true, originalPrice: true } });
      const isLocalOnly = dealData.isLocalOnly !== undefined ? dealData.isLocalOnly : (existing?.isLocalOnly ?? false);
      const rate = isLocalOnly ? 0.08 : 0.12;
      updatePayload.displayedPrice = Math.round(dealData.dealPrice * (1 + rate));
    }

    // 1) Update the deal core fields
    const updatedDeal = await tx.deal.update({
      where: { id },
      data: updatePayload,
    });

    // 2) If pricing was updated, propagate to all variants atomically
    if (isUpdatingPrice) {
      await tx.dealVariant.updateMany({
        where: { dealId: id },
        data: {
          originalPrice: updatedDeal.originalPrice,
          displayedPrice: updatedDeal.displayedPrice,
          updatedAt: getSriLankaTime(),
        },
      });
    }

    // 3) Handle related collections (itineraries, inclusions, exclusions)
    if (itineraries) {
      await tx.itinerary.deleteMany({ where: { dealId: id } });
      await tx.itinerary.createMany({
        data: itineraries.map((it) => ({ ...it, dealId: id })),
      });
    }

    if (inclusions) {
      await tx.inclusions.deleteMany({ where: { dealId: id } });
      await tx.inclusions.createMany({
        data: inclusions.map((inc) => ({ ...inc, dealId: id })),
      });
    }

    if (exclusions) {
      await tx.exclusions.deleteMany({ where: { dealId: id } });
      await tx.exclusions.createMany({
        data: exclusions.map((exc) => ({ ...exc, dealId: id })),
      });
    }

    // Fetch and return the fully updated deal with relations
    return tx.deal.findUnique({
      where: { id },
      include: {
        ...dealDetailedInclude,
        variants: {
          orderBy: { startDatetime: "asc" },
        },
      },
    });
  });
};


/**
 * Fetches analytics for a specific deal.
 */
export const getDealAnalytics = async (dealId: string, startDate?: string, endDate?: string) => {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (startDate) dateFilter.gte = getSriLankaTime(startDate);
  if (endDate) dateFilter.lte = getSriLankaTime(endDate);

  const [bookings, locks, earningsAggregate] = await Promise.all([
    prisma.booking.findMany({
      where: {
        dealId,
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true, contactNumber: true } },
        variant: { select: { id: true, startDatetime: true } },
        _count: { select: { slots: true } }
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.dealLock.findMany({
      where: {
        dealId,
        status: "active",
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      include: {
        user: { select: { id: true, name: true } },
        variant: { select: { id: true, startDatetime: true } },
        _count: { select: { slots: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.booking.aggregate({
      where: {
        dealId,
        paymentStatus: "paid",
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      _sum: {
        totalPrice: true,
      },
    }),
  ]);

  return {
    totalEarnings: earningsAggregate._sum.totalPrice || 0,
    bookings,
    locks,
  };
};

// ─── Variant Repository ───

/**
 * Finds a variant by ID with full details (slots, bookings, locks).
 */
export const getVariantById = async (id: string) => {
  // but we will use the detailed include.
  return prisma.dealVariant.findUnique({
    where: { id },
    include: {
      ...dealVariantDetailedInclude,
      slots: {
        orderBy: { slotNumber: "asc" },
        include: {
          bookings: {
            where: { paymentStatus: { in: ['paid', 'pending'] } },
            include: {
              user: { select: { id: true, name: true, email: true, contactNumber: true } },
              _count: { select: { slots: true } }
            }
          },
          locks: {
            where: { status: "active", expiresAt: { gt: getSriLankaTime() } },
            include: { user: { select: { id: true, name: true } } }
          }
        }
      },
      bookings: {
        where: { paymentStatus: { in: ['paid', 'pending'] } },
        include: {
          user: { select: { id: true, name: true, email: true, contactNumber: true } },
          _count: { select: { slots: true } }
        },
      },
      locks: {
        where: {
          status: "active",
          expiresAt: { gt: getSriLankaTime() },
        },
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { slots: true } },
        },
      },
    },
  });
};

/**
 * Lists variants for a deal with filters.
 */
export const getVariantsByDeal = async (params: VariantsQueryDto) => {
  const where: Prisma.DealVariantWhereInput = {
    dealId: params.dealId,
  };

  if (params.status) where.status = params.status;

  if (params.startDate || params.endDate) {
    where.startDatetime = {};

    if (params.startDate) {
      const start = getSriLankaTime(params.startDate);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        (where.startDatetime as Prisma.DateTimeNullableFilter).gte = start;
      }
    }

    if (params.endDate) {
      const end = getSriLankaTime(params.endDate);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        (where.startDatetime as Prisma.DateTimeNullableFilter).lte = end;
      }
    }

    if (Object.keys(where.startDatetime).length === 0) {
      delete where.startDatetime;
    }
  }

  const skip = (params.page - 1) * params.limit;
  const take = params.limit;

  return prisma.dealVariant.findMany({
    where,
    orderBy: { startDatetime: "asc" },
    skip,
    take,
    include: dealVariantDetailedInclude,
  });
};

/**
 * Updates a variant and syncs slots if totalSlots changed.
 */
export const updateVariant = async (id: string, data: UpdateVariantDto) => {
  const updateData: Prisma.DealVariantUpdateInput = {};

  if (data.totalSlots !== undefined) updateData.totalSlots = data.totalSlots;
  if (data.availableSlots !== undefined) updateData.availableSlots = data.availableSlots;
  if (data.status !== undefined) updateData.status = data.status;
  updateData.updatedAt = getSriLankaTime();

  await prisma.dealVariant.update({
    where: { id },
    data: updateData,
  });

  if (data.totalSlots !== undefined) {
    await syncSlots(id, data.totalSlots);
    await recalculateVariantAvailability(id);
  }

  return getVariantById(id);
};

/**
 * Cancels a variant.
 */
export const cancelVariant = async (id: string): Promise<DealVariantDetailed> => {
  return prisma.dealVariant.update({
    where: { id },
    data: { status: "cancelled", availableSlots: 0, updatedAt: getSriLankaTime() },
    include: dealVariantDetailedInclude,
  });
};

/**
 * Restores a cancelled variant.
 */
export const restoreVariant = async (id: string) => {
  await prisma.dealVariant.update({
    where: { id },
    data: { status: "active", updatedAt: getSriLankaTime() },
  });
  await recalculateVariantAvailability(id);
  return getVariantById(id);
};




/**
 * Syncs slots for a variant based on totalSlots.
 */
export const syncSlots = async (variantId: string, totalSlots: number): Promise<void> => {
  const currentSlots = await prisma.variantSlot.findMany({
    where: { variantId },
    orderBy: { slotNumber: "asc" },
  });

  if (currentSlots.length < totalSlots) {
    // Add missing slots
    const toCreate = Array.from({ length: totalSlots - currentSlots.length }).map((_, i) => ({
      variantId,
      slotNumber: currentSlots.length + i + 1,
      status: "available" as const,
      createdAt: getSriLankaTime(),
      updatedAt: getSriLankaTime(),
    }));
    await prisma.variantSlot.createMany({ data: toCreate });
  } else if (currentSlots.length > totalSlots) {
    // Remove excess available slots
    const deletableSlots = currentSlots
      .filter(s => s.status === "available" || s.status === "cancelled")
      .reverse()
      .slice(0, currentSlots.length - totalSlots);

    if (deletableSlots.length > 0) {
      await prisma.variantSlot.deleteMany({
        where: { id: { in: deletableSlots.map(s => s.id) } }
      });
    }
  }
};

/**
 * Finds a slot by ID with its variant and deal.
 */
export const getSlotById = async (id: string): Promise<VariantSlotWithVariantAndDeal | null> => {
  return prisma.variantSlot.findUnique({
    where: { id },
    include: { variant: { include: { deal: true } } }
  });
};

/**
 * Cancels a specific slot.
 */
export const cancelSlot = async (id: string): Promise<VariantSlot> => {
  const slot = await prisma.variantSlot.update({
    where: { id },
    data: { status: "cancelled", updatedAt: getSriLankaTime() },
  });
  await recalculateVariantAvailability(slot.variantId);
  return slot;
};

/**
 * Restores a cancelled slot.
 */
export const restoreSlot = async (id: string): Promise<VariantSlot> => {
  const slot = await prisma.variantSlot.update({
    where: { id },
    data: { status: "available", updatedAt: getSriLankaTime() },
  });
  await recalculateVariantAvailability(slot.variantId);
  return slot;
};

/**
 * Recalculates availableSlots for a variant based on active slots.
 */
export const recalculateVariantAvailability = async (variantId: string): Promise<void> => {
  const variant = await prisma.dealVariant.findUnique({
    where: { id: variantId },
    select: { totalSlots: true, status: true }
  });

  if (!variant) return;

  const nonAvailableCount = await prisma.variantSlot.count({
    where: { variantId, status: { not: "available" } }
  });

  const availableSlots = Math.max(0, (variant.totalSlots || 0) - nonAvailableCount);

  await prisma.dealVariant.update({
    where: { id: variantId },
    data: {
      availableSlots,
      status: variant.status === "cancelled"
        ? "cancelled"
        : (availableSlots === 0 ? "sold_out" : "active"),
      updatedAt: getSriLankaTime()
    }
  });
};

/**
 * Checks if a variant exists for a specific datetime.
 */
export const checkExistingVariant = async (
  dealId: string,
  startDatetime: Date
) => {
  return prisma.dealVariant.findUnique({
    where: {
      dealId_startDatetime: { dealId, startDatetime },
    },
  });
};

/**
 * Finds variants for a specific deal within a date range, regardless of time.
 */
export const getVariantsByDateRange = async (
  dealId: string,
  startDate: Date,
  endDate: Date
): Promise<{ id: string; startDatetime: Date }[]> => {
  const start = getSriLankaTime(startDate);
  start.setHours(0, 0, 0, 0);

  const end = getSriLankaTime(endDate);
  end.setHours(23, 59, 59, 999);

  const variants: VariantDateRecord[] = await prisma.dealVariant.findMany({
    where: {
      dealId,
      startDatetime: {
        gte: start,
        lte: end,
      },
      status: { not: "cancelled" },
    },
    select: variantDateSelect,
  });

  return variants.filter(
    (v): v is VariantDateRecord & { startDatetime: Date } => v.startDatetime !== null
  );
};

/**
 * Creates all variants and their slots atomically for a bulk schedule.
 * Moves the $transaction into the repository to keep DB concerns out of the service.
 */
export const createBulkVariants = async (
  params: BulkCreateVariantsParams
): Promise<Prisma.BatchPayload> => {
  const { randomUUID } = await import("crypto");
  const { dealId, futureDates, totalSlots, originalPrice, displayedPrice } = params;

  const variantData: Prisma.DealVariantCreateManyInput[] = [];
  const slotData: Prisma.VariantSlotCreateManyInput[] = [];

  for (const date of futureDates) {
    const variantId = randomUUID();

    variantData.push({
      id: variantId,
      dealId,
      startDatetime: date,
      totalSlots,
      availableSlots: totalSlots,
      originalPrice,
      displayedPrice,
      createdAt: getSriLankaTime(),
      updatedAt: getSriLankaTime(),
      status: "active",
    });

    for (let i = 0; i < totalSlots; i++) {
      slotData.push({
        id: randomUUID(),
        variantId,
        slotNumber: i + 1,
        status: "available",
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
      });
    }
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.dealVariant.createMany({ data: variantData });
      if (slotData.length > 0) {
        await tx.variantSlot.createMany({ data: slotData });
      }
      return { count: variantData.length };
    },
    { timeout: 15000 }
  );
};


/**
 * Fetches overall analytics for a merchant.
 */
export const getMerchantOverallAnalytics = async (
  merchantId: string,
  startDate?: string,
  endDate?: string
) => {
  const dateFilter: Prisma.DateTimeFilter = {};
  if (startDate) dateFilter.gte = getSriLankaTime(startDate);
  if (endDate) dateFilter.lte = getSriLankaTime(endDate);

  // 1) Find all deals of the merchant
  const deals = await prisma.deal.findMany({
    where: { merchantId },
    select: { id: true, title: true }
  });

  const dealIds = deals.map(d => d.id);

  if (dealIds.length === 0) {
    return {
      overall: { totalEarnings: 0, totalBookings: 0, totalLocks: 0 },
      dealsBreakdown: [],
      timeSeriesRevenue: []
    };
  }

  // 2) Aggregated data for ALL deals
  const [overallEarnings, overallBookings, overallLocks] = await Promise.all([
    prisma.booking.aggregate({
      where: {
        dealId: { in: dealIds },
        paymentStatus: "paid",
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      _sum: { totalPrice: true }
    }),
    prisma.variantSlot.count({
      where: {
        status: "booked",
        bookings: {
          some: {
            dealId: { in: dealIds },
            createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          }
        }
      }
    }),
    prisma.dealLock.aggregate({
      where: {
        dealId: { in: dealIds },
        status: { in: ["active", "converted", "expired"] },
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      _sum: { quantity: true }
    })
  ]);

  // 3) Breakdown per deal
  const dealsBreakdown = await Promise.all(deals.map(async (deal) => {
    const [earnings, bookingsCount, locksCount] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          dealId: deal.id,
          paymentStatus: "paid",
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        _sum: { totalPrice: true }
      }),
      prisma.variantSlot.count({
        where: {
          status: "booked",
          bookings: {
            some: {
              dealId: deal.id,
              createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            }
          }
        }
      }),
      prisma.dealLock.aggregate({
        where: {
          dealId: deal.id,
          status: { in: ["active", "converted", "expired"] },
          createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        _sum: { quantity: true }
      })
    ]);

    return {
      dealId: deal.id,
      title: deal.title || "Untitled",
      bookingsCount,
      locksCount: locksCount._sum.quantity || 0,
      earnings: earnings._sum.totalPrice || 0,
    };
  }));

  return {
    overall: {
      totalEarnings: overallEarnings._sum.totalPrice || 0,
      totalBookings: overallBookings,
      totalLocks: overallLocks._sum.quantity || 0,
    },
    dealsBreakdown: dealsBreakdown.sort((a, b) => b.earnings - a.earnings),
    timeSeriesRevenue: await calculateTimeSeriesRevenue(dealIds, startDate, endDate),
  };
};

/**
 * Calculates time series revenue for a set of deals.
 */
export const calculateTimeSeriesRevenue = async (dealIds: string[], start?: string, end?: string) => {
  const startDate = start ? getSriLankaTime(start) : getSriLankaTime(getSriLankaTime().getTime() - 7 * 24 * 60 * 60 * 1000);
  const endDate = end ? getSriLankaTime(end) : getSriLankaTime();

  const timeSeries: { date: string; earnings: number }[] = [];

  for (let d = getSriLankaTime(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayStart = getSriLankaTime(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = getSriLankaTime(d);
    dayEnd.setHours(23, 59, 59, 999);

    const agg = await prisma.booking.aggregate({
      where: {
        dealId: { in: dealIds },
        paymentStatus: "paid",
        createdAt: { gte: dayStart, lte: dayEnd }
      },
      _sum: { totalPrice: true }
    });

    timeSeries.push({
      date: dayStart.toISOString().split('T')[0],
      earnings: agg._sum.totalPrice || 0
    });
  }

  return timeSeries;
};

/**
 * Lists users who have active locks for a deal.
 */
export const getLockedUsersForDeal = async (dealId: string): Promise<{ id: string; name: string; email: string }[]> => {
  const locks = await prisma.dealLock.findMany({
    where: {
      dealId,
      status: "active",
      expiresAt: { gt: getSriLankaTime() },
      user: {
        isTraveller: true,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Extract unique users
  const userMap = new Map<string, { id: string; name: string; email: string }>();
  for (const lock of locks) {
    if (lock.user?.id && lock.user.email) {
      userMap.set(lock.user.id, {
        id: lock.user.id,
        name: lock.user.name,
        email: lock.user.email,
      });
    }
  }

  return Array.from(userMap.values());
};

// ─── Admin/Global Queries ───

export const countDeals = async (where?: DealWhereInput): Promise<number> => {
  return prisma.deal.count({ where });
};

export const getMerchantDealsSummaryAdmin = async (merchantId: string, createdAtFilter?: Prisma.DateTimeFilter): Promise<AdminMerchantDealsSummaryRecord[]> => {
  return prisma.deal.findMany({
    where: { merchantId },
    select: {
      id: true,
      title: true,
      displayedPrice: true,
      locks: {
        where: createdAtFilter ? { createdAt: createdAtFilter } : undefined,
        select: { id: true },
      },
      bookings: {
        where: createdAtFilter ? { createdAt: createdAtFilter, paymentStatus: "paid" } : { paymentStatus: "paid" },
        select: { id: true, totalPrice: true },
      },
    },
  });
};

export const findDealsPaginated = async (
  where: DealWhereInput, 
  cursor: string | undefined, 
  limit: number
): Promise<AdminDealPaginatedRecord[]> => {
  return prisma.deal.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: "desc" },
    select: adminDealPaginatedSelect,
  });
};

export const getDealDetailByIdAdmin = async (id: string): Promise<AdminDealDetailRecord | null> => {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      merchant: {
        select: {
          id: true,
          businessName: true,
          contactNumber: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      itineraries: { orderBy: { dayNumber: "asc" } },
      inclusions: true,
      exclusions: true,
      variants: {
        orderBy: { startDatetime: "asc" },
        select: {
          id: true,
          startDatetime: true,
          totalSlots: true,
          availableSlots: true,
          displayedPrice: true,
          status: true,
          _count: {
            select: {
              bookings: true,
              locks: { where: { status: "active" } },
            },
          },
        },
      },
      _count: {
        select: {
          bookings: true,
          locks: { where: { status: "active" } },
        },
      },
    },
  });
};

export const executeDealAdminUpdateTransaction = async (
  dealId: string, 
  data: { displayedPrice?: number; originalPrice?: number; isActive?: boolean }
) => {
  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.DealUpdateInput = {};
    if (data.displayedPrice !== undefined) updateData.displayedPrice = data.displayedPrice;
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedDeal = await tx.deal.update({
      where: { id: dealId },
      data: updateData,
      select: {
        id: true,
        title: true,
        displayedPrice: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (data.displayedPrice !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eligibleVariants = await tx.dealVariant.findMany({
        where: {
          dealId: dealId,
          startDatetime: { gte: today },
          locks: { none: { status: "active" } },
          bookings: { none: { paymentStatus: { in: ["paid", "pending"] } } }
        },
        select: { id: true }
      });

      if (eligibleVariants.length > 0) {
        await tx.dealVariant.updateMany({
          where: {
            id: { in: eligibleVariants.map(v => v.id) }
          },
          data: { displayedPrice: data.displayedPrice }
        });
      }
    }

    return updatedDeal;
  });
};

export const getVariantWithActivity = async (variantId: string): Promise<AdminVariantWithActivityRecord | null> => {
  return prisma.dealVariant.findUnique({
    where: { id: variantId },
    select: adminVariantWithActivitySelect,
  });
};

export const updateVariantPriceAdmin = async (variantId: string, displayedPrice: number) => {
  return prisma.dealVariant.update({
    where: { id: variantId },
    data: { displayedPrice },
  });
};


// ─── Public Discovery / Discovery Queries ───

export const getActiveDealsCursor = async (params: { cursor?: string; limit: number; category?: string; isLocalOnly?: boolean }) => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const variantWhere: Prisma.DealVariantWhereInput = {
    status: "active",
    startDatetime: { gte: today },
    availableSlots: { gt: 0 },
  };

  const where: Prisma.DealWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    variants: { some: variantWhere },
  };

  if (params.category && params.category !== "all") {
    where.category = { equals: params.category, mode: "insensitive" };
  }
  where.isLocalOnly = params.isLocalOnly ?? false;

  const items = await prisma.deal.findMany({
    where,
    take: params.limit + 1,
    cursor: params.cursor ? { id: params.cursor } : undefined,
    skip: params.cursor ? 1 : 0,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      category: true,
      primaryImageUrl: true,
      durationDays: true,
      isLocalOnly: true,
      displayedPrice: true,
      originalPrice: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
      merchant: {
        select: { id: true, businessName: true, logoUrl: true },
      },
    },
  });

  let nextCursor = null;
  if (items.length > params.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }
  return { items, nextCursor };
};

export const searchDealsCursor = async (params: { cursorDate?: Date; limit: number; search?: string; location?: string; category?: string; isLocalOnly?: boolean }) => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const variantConditions: Prisma.DealVariantWhereInput = {
    status: "active",
    startDatetime: { gte: today },
    availableSlots: { gt: 0 },
  };

  const where: Prisma.DealWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    variants: { some: variantConditions },
  };

  if (params.cursorDate) {
    where.createdAt = { lt: params.cursorDate };
  }

  if (params.location) where.location = { contains: params.location, mode: "insensitive" };
  if (params.category && params.category !== "all") where.category = { equals: params.category, mode: "insensitive" };
  if (params.search) {
    const term = params.search.trim();
    if (term) {
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { category: { contains: term, mode: "insensitive" } },
      ];
    }
  }
  where.isLocalOnly = params.isLocalOnly ?? false;

  const items = await prisma.deal.findMany({
    where,
    take: params.limit + 1,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      category: true,
      primaryImageUrl: true,
      durationDays: true,
      dealLockExpireTime: true,
      isLocalOnly: true,
      displayedPrice: true,
      originalPrice: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
      merchant: {
        select: { id: true, businessName: true, logoUrl: true },
      },
    },
  });

  const whereCount = { ...where };
  delete whereCount.createdAt;
  const total = await prisma.deal.count({ where: whereCount });

  let nextCursor = null;
  if (items.length > params.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }
  return { items, nextCursor, total };
};

export const getDealVariantsForLockingPublic = async (dealId: string) => {
  return prisma.deal.findFirst({
    where: {
      id: dealId,
      isActive: true,
      merchant: { verificationStatus: "verified" },
    },
    select: {
      dealLockExpireTime: true,
      variants: {
        where: {
          status: "active",
          startDatetime: { gte: getSriLankaTime() },
          availableSlots: { gt: 0 },
        },
        orderBy: { startDatetime: "asc" },
        select: {
          id: true,
          originalPrice: true,
          displayedPrice: true,
          startDatetime: true,
          totalSlots: true,
          availableSlots: true,
          status: true,
        },
      },
    },
  });
};

export const createSearchLog = async (data: { userId?: string | null; query?: string | null; filters?: Prisma.InputJsonValue; resultDealIds?: Prisma.InputJsonValue; clickedDealId?: string | null }) => {
  try {
    return await prisma.searchLog.create({
      data: {
        userId: data.userId ?? null,
        query: data.query ?? null,
        filters: data.filters ?? Prisma.JsonNull,
        resultDealIds: data.resultDealIds ?? Prisma.JsonNull,
        clickedDealId: data.clickedDealId ?? null,
      },
    });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "P2021" || err?.code === "P2022") return null;
    throw error;
  }
};

export const createDealViewEvent = async (data: { userId?: string | null; dealId: string }) => {
  try {
    if (data.userId) {
      const dedupeWindowStart = getSriLankaTime(Date.now() - 15 * 1000);
      const existing = await prisma.dealViewEvent.findFirst({
        where: { userId: data.userId, dealId: data.dealId, viewedAt: { gte: dedupeWindowStart } },
        select: { id: true },
      });
      if (existing) return null;
    }
    return await prisma.dealViewEvent.create({
      data: { userId: data.userId ?? null, dealId: data.dealId },
    });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === "P2021" || err?.code === "P2022") return null;
    throw error;
  }
};

export const getDealDetailPublic = async (id: string) => {
  return prisma.deal.findFirst({
    where: { id, isActive: true, merchant: { verificationStatus: "verified" } },
    include: {
      merchant: { select: { id: true, businessName: true, businessDescription: true, logoUrl: true, city: true, country: true } },
      itineraries: { orderBy: { dayNumber: "asc" } },
      inclusions: true,
      exclusions: true,
      variants: {
        where: { status: "active", startDatetime: { gte: getSriLankaTime() } },
        orderBy: { startDatetime: "asc" },
        include: { _count: { select: { bookings: true, locks: true } } },
      },
    },
  });
};

export const getDealExclusionsPublic = async (id: string) => {
  const deal = await prisma.deal.findUnique({ where: { id }, select: { exclusions: true } });
  return deal?.exclusions || [];
};

export const getPlatformStatsPublic = async () => {
  const [totalDeals, totalTravellers, totalLocks] = await Promise.all([
    prisma.deal.count({ where: { isActive: true, merchant: { verificationStatus: "verified" } } }),
    prisma.user.count({ where: { isTraveller: true } }),
    prisma.dealLock.count(),
  ]);
  return { totalDeals, totalTravellers, totalLocks };
};

/**
 * Gets unique island names from active deals that have future variants.
 */
export const getActiveIslandsWithDeals = async (): Promise<string[]> => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const deals = await prisma.deal.findMany({
    where: {
      isActive: true,
      merchant: { verificationStatus: "verified" },
      variants: {
        some: {
          status: "active",
          startDatetime: { gte: today },
          availableSlots: { gt: 0 },
        },
      },
    },
    select: {
      location: true,
    },
  });

  const islands = new Set<string>();
  for (const deal of deals) {
    if (deal.location) {
      const islandName = deal.location.split(" (")[0].trim();
      islands.add(islandName);
    }
  }
  return Array.from(islands);
};

export const getMinimalIslandDeals = async (
  islandName: string,
  params?: { page?: number; limit?: number }
): Promise<{ items: MinimalIslandDealRecord[]; total: number }> => {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const where: Prisma.DealWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    location: { contains: islandName, mode: "insensitive" },
    variants: {
      some: {
        status: "active",
        startDatetime: { gte: today },
        availableSlots: { gt: 0 },
      },
    },
  };

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      select: minimalIslandDealSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.deal.count({ where }),
  ]);

  return { items, total };
};

export const listDealLocksRaw = async (
  dealId: string, 
  query: { startDate?: string; endDate?: string; page: number; limit: number }
) => {
  const where: Prisma.DealLockWhereInput = { dealId };

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
    const dateCond: Prisma.DateTimeNullableFilter = {};
    if (start) dateCond.gte = start;
    if (end) dateCond.lte = end;
    where.variant = {
      startDatetime: dateCond
    };
  }

  const total = await prisma.dealLock.count({ where });

  const items = await prisma.dealLock.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    include: {
      deal: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
      customAddons: true,
      variant: { select: { id: true, startDatetime: true } },
      chatRooms: { select: { id: true }, take: 1 },
    },
  });

  return { items, total };
};

export const listDealBookingsRaw = async (
  dealId: string, 
  query: { startDate?: string; endDate?: string; page: number; limit: number }
) => {
  const where: Prisma.BookingWhereInput = { dealId };

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
    const dateCond: Prisma.DateTimeNullableFilter = {};
    if (start) dateCond.gte = start;
    if (end) dateCond.lte = end;
    where.variant = {
      startDatetime: dateCond
    };
  }

  const total = await prisma.booking.count({ where });

  const items = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    include: {
      deal: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
      customAddons: true,
      variant: { select: { id: true, startDatetime: true } },
      lock: {
        include: {
          chatRooms: { select: { id: true }, take: 1 },
        },
      },
    },
  });

  return { items, total };
};

// ------------------------------ Admin ------------------------------

export const countBookings = async (where?: Prisma.BookingWhereInput): Promise<number> => {
  return prisma.booking.count({ where });
};

export const countLocks = async (where?: Prisma.DealLockWhereInput): Promise<number> => {
  return prisma.dealLock.count({ where });
};

export interface PaidDealBookingForDashboardRecord {
  createdAt: Date;
  quantity: number | null;
  variant: {
    displayedPrice: number | null;
  } | null;
  deal: {
    displayedPrice: number | null;
    dealPrice: number | null;
  } | null;
}

export const getPaidBookingsForDashboard = async (
  where: Prisma.BookingWhereInput
): Promise<PaidDealBookingForDashboardRecord[]> => {
  return prisma.booking.findMany({
    where: {
      paymentStatus: "paid",
      ...where,
    },
    select: {
      createdAt: true,
      quantity: true,
      variant: {
        select: {
          displayedPrice: true,
        },
      },
      deal: {
        select: {
          displayedPrice: true,
          dealPrice: true,
        },
      },
    },
  });
};

export interface MerchantDealsAnalyticsData {
  activeDealsCount: number;
  deals: { id: string; title: string; dealPrice: number; displayedPrice: number; isActive: boolean }[];
  locks: { dealId: string | null; quantity: number | null }[];
  bookings: {
    dealId: string | null;
    quantity: number | null;
    totalPrice: number | null;
    createdAt: Date;
    deal: { dealPrice: number } | null;
  }[];
}

export const getMerchantDealsAnalyticsData = async (merchantId: string, now: Date): Promise<MerchantDealsAnalyticsData> => {
  const [activeDealsCount, deals, locks, bookings] = await Promise.all([
    prisma.deal.count({
      where: { merchantId, isActive: true },
    }),
    prisma.deal.findMany({
      where: { merchantId },
      select: { id: true, title: true, dealPrice: true, displayedPrice: true, isActive: true },
    }),
    prisma.dealLock.findMany({
      where: {
        deal: { merchantId },
        status: "active",
        expiresAt: { gt: now },
      },
      select: { dealId: true, quantity: true },
    }),
    prisma.booking.findMany({
      where: {
        deal: { merchantId },
        paymentStatus: "paid",
      },
      select: {
        dealId: true,
        quantity: true,
        totalPrice: true,
        createdAt: true,
        deal: { select: { dealPrice: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return { activeDealsCount, deals, locks, bookings };
};




