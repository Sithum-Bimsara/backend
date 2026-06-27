const fs = require('fs');
const path = require('path');

// Target files
const dealsRepoFile = path.resolve('C:/Users/User/Documents/Tourism-Deals-Platform/backend/src/modules/deals/repositories/deals.repository.ts');
const accRepoFile = path.resolve('C:/Users/User/Documents/Tourism-Deals-Platform/backend/src/modules/accommodation/repositories/accommodation.repository.ts');

const dealsRepoAppend = `

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

export const searchDealsCursor = async (params: { cursor?: string; limit: number; search?: string; location?: string; category?: string; minPrice?: number; maxPrice?: number; isLocalOnly?: boolean }) => {
  const today = getSriLankaTime();
  today.setUTCHours(0, 0, 0, 0);

  const variantConditions: Prisma.DealVariantWhereInput = {
    status: "active",
    startDatetime: { gte: today },
    availableSlots: { gt: 0 },
  };

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    variantConditions.displayedPrice = { gte: params.minPrice, lte: params.maxPrice };
  }

  const where: Prisma.DealWhereInput = {
    isActive: true,
    merchant: { verificationStatus: "verified" },
    variants: { some: variantConditions },
  };

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

  let nextCursor = null;
  if (items.length > params.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }
  return { items, nextCursor };
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
  } catch (error: any) {
    if (error?.code === "P2021" || error?.code === "P2022") return null;
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
  } catch (error: any) {
    if (error?.code === "P2021" || error?.code === "P2022") return null;
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
`;

const accRepoAppend = `

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
      location: \`\${prop.city}, \${prop.island}\`,
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
`;

fs.appendFileSync(dealsRepoFile, dealsRepoAppend);
fs.appendFileSync(accRepoFile, accRepoAppend);

console.log("Migration appended to files.");
