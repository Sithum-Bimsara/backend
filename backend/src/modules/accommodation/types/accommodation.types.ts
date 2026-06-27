import { Prisma, RoomInventoryStatus, UnitStatus } from "@prisma/client";

export { RoomInventoryStatus, UnitStatus };

// ─── Prisma Include Shapes ───────────────────────────────────────────────────

export const unitFullInclude = {
  bedConfigs: true,
  ratePlan: true,
} satisfies Prisma.UnitInclude;

export const propertyFullInclude = {
  images: true,
  units: {
    include: unitFullInclude,
  },
  ratePlans: true,
} satisfies Prisma.PropertyInclude;

export const propertySlimSelect = {
  id: true,
  name: true,
  city: true,
  island: true,
  isActive: true,
  images: {
    take: 1,
    select: {
      url: true,
    },
  },
} satisfies Prisma.PropertySelect;

// ─── Prisma Derived Record Types ─────────────────────────────────────────────
// These are the raw shapes Prisma returns from the DB.
// Import these in the repository for type-safe access to raw records.

export type PropertyRecord = Prisma.PropertyGetPayload<{
  include: typeof propertyFullInclude;
}>;

export type PropertySlimRecord = Prisma.PropertyGetPayload<{
  select: typeof propertySlimSelect;
}>;

export type UnitRecord = Prisma.UnitGetPayload<{
  include: typeof unitFullInclude;
}>;

/**
 * ─── Minimal Island Accommodation (Trending Islands Cards) ───
 */
export const minimalIslandAccommodationSelect = {
  id: true,
  name: true,
  description: true,
  images: {
    take: 1,
    select: {
      url: true,
    },
  },
  units: {
    select: {
      nonLocalPrice: true,
      localPrice: true,
      pricePerNight: true,
    },
    orderBy: {
      nonLocalPrice: "asc",
    },
    take: 1,
  },
  averageRating: true,
  totalReviews: true,
  merchant: {
    select: {
      id: true,
      businessName: true,
    },
  },
} satisfies Prisma.PropertySelect;

export type MinimalIslandAccommodationRecord = Prisma.PropertyGetPayload<{
  select: typeof minimalIslandAccommodationSelect;
}>;

