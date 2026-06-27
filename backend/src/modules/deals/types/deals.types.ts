import { Prisma } from "@prisma/client";

export type DealWhereInput = Prisma.DealWhereInput;

/**
 * ─── Deal Detailed View ───
 */
export const dealDetailedInclude = Prisma.validator<Prisma.DealInclude>()({
  merchant: {
    select: {
      id: true,
      businessName: true,
      contactNumber: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  itineraries: { orderBy: { dayNumber: "asc" } },
  inclusions: true,
  exclusions: true,
  _count: {
    select: {
      bookings: true,
      locks: { where: { status: "active" } },
      reviews: true,
    },
  },
});

export type DealDetailed = Prisma.DealGetPayload<{
  include: typeof dealDetailedInclude;
}>;

/**
 * ─── Deal Summary (Listing) ───
 */
export const dealSummarySelect = Prisma.validator<Prisma.DealSelect>()({
  id: true,
  title: true,
  location: true,
  category: true,
  displayedPrice: true,
  dealPrice: true,
  originalPrice: true,
  primaryImageUrl: true,
  isActive: true,
  averageRating: true,
  totalReviews: true,
  createdAt: true,
  merchant: {
    select: {
      id: true,
      businessName: true,
    },
  },
  _count: {
    select: {
      variants: true,
      bookings: true,
      locks: { where: { status: "active" } },
    },
  },
});

export type DealSummary = Prisma.DealGetPayload<{
  select: typeof dealSummarySelect;
}>;

/**
 * ─── Deal Slim (Merchant Pagination) ───
 */
export const dealSlimSelect = {
  id: true,
  title: true,
  location: true,
  category: true,
  displayedPrice: true,
  dealPrice: true,
  originalPrice: true,
  primaryImageUrl: true,
  isActive: true,
  averageRating: true,
  totalReviews: true,
  createdAt: true,
} satisfies Prisma.DealSelect;

export type DealSlimRecord = Prisma.DealGetPayload<{
  select: typeof dealSlimSelect;
}>;

/**
 * ─── Deal Variant Detailed ───
 */
export const dealVariantDetailedInclude = Prisma.validator<Prisma.DealVariantInclude>()({
  deal: {
    select: {
      id: true,
      title: true,
      merchantId: true,
    },
  },
  slots: {
    orderBy: { slotNumber: "asc" },
    include: {
      bookings: {
        where: { paymentStatus: { in: ["paid", "pending"] } },
        include: {
          user: { select: { id: true, name: true, email: true, contactNumber: true } },
          _count: { select: { slots: true } },
        },
      },
      locks: {
        where: { status: "active" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  },
  _count: {
    select: {
      bookings: true,
      locks: { where: { status: "active" } },
    },
  },
});

export type DealVariantDetailed = Prisma.DealVariantGetPayload<{
  include: typeof dealVariantDetailedInclude;
}>;

// ─── Admin Query Types ───────────────────────────────────────────────────────

export const adminMerchantDealsSummarySelect = {
  id: true,
  title: true,
  displayedPrice: true,
  locks: {
    select: { id: true },
  },
  bookings: {
    select: { id: true, totalPrice: true },
  },
} satisfies Prisma.DealSelect;

export type AdminMerchantDealsSummaryRecord = Prisma.DealGetPayload<{
  select: typeof adminMerchantDealsSummarySelect;
}>;

export const adminDealPaginatedSelect = {
  id: true,
  title: true,
  location: true,
  displayedPrice: true,
  dealPrice: true,
  originalPrice: true,
  isActive: true,
  createdAt: true,
  merchant: {
    select: { id: true, businessName: true },
  },
  _count: {
    select: {
      variants: true,
      bookings: true,
      locks: { where: { status: "active" as const } },
    },
  },
} satisfies Prisma.DealSelect;

export type AdminDealPaginatedRecord = Prisma.DealGetPayload<{
  select: typeof adminDealPaginatedSelect;
}>;

export const adminDealDetailInclude = {
  merchant: {
    select: {
      id: true,
      businessName: true,
      contactNumber: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  itineraries: { orderBy: { dayNumber: "asc" as const } },
  inclusions: true,
  exclusions: true,
  variants: {
    orderBy: { startDatetime: "asc" as const },
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
          locks: { where: { status: "active" as const } },
        },
      },
    },
  },
  _count: {
    select: {
      bookings: true,
      locks: { where: { status: "active" as const } },
    },
  },
} satisfies Prisma.DealInclude;

export type AdminDealDetailRecord = Prisma.DealGetPayload<{
  include: typeof adminDealDetailInclude;
}>;

export const adminVariantWithActivitySelect = {
  id: true,
  startDatetime: true,
  _count: {
    select: {
      bookings: { where: { paymentStatus: { in: ["paid", "pending"] } } },
      locks: { where: { status: "active" as const } },
    },
  },
} satisfies Prisma.DealVariantSelect;

export type AdminVariantWithActivityRecord = Prisma.DealVariantGetPayload<{
  select: typeof adminVariantWithActivitySelect;
}>;

export type DealVariantWithSlots = Prisma.DealVariantGetPayload<{
  include: {
    deal: {
      select: {
        id: true;
        title: true;
        merchantId: true;
      };
    };
    slots: {
      include: {
        bookings: true;
        locks: true;
      };
    };
    bookings: true;
    locks: true;
  };
}>;

export type VariantSlotWithVariantAndDeal = Prisma.VariantSlotGetPayload<{
  include: {
    variant: {
      include: {
        deal: true;
      };
    };
  };
}>;

/**
 * ─── Variant Date (date-range conflict check) ───
 */
export const variantDateSelect = {
  id: true,
  startDatetime: true,
} satisfies Prisma.DealVariantSelect;

export type VariantDateRecord = Prisma.DealVariantGetPayload<{
  select: typeof variantDateSelect;
}>;

/**
 * ─── Bulk Variant Creation Input ───
 * Plain interface (not a Prisma.GetPayload) because this is input data,
 * not the result of a database read query.
 */
export interface BulkCreateVariantsParams {
  dealId: string;
  futureDates: Date[];
  totalSlots: number;
  originalPrice: number;
  displayedPrice: number;
}

/**
 * ─── Minimal Island Deal (Trending Islands Cards) ───
 */
export const minimalIslandDealSelect = {
  id: true,
  title: true,
  description: true,
  primaryImageUrl: true,
  displayedPrice: true,
  originalPrice: true,
  averageRating: true,
  totalReviews: true,
  merchant: {
    select: {
      id: true,
      businessName: true,
    },
  },
} satisfies Prisma.DealSelect;

export type MinimalIslandDealRecord = Prisma.DealGetPayload<{
  select: typeof minimalIslandDealSelect;
}>;
