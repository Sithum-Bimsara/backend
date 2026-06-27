import { Prisma } from "@prisma/client";

/**
 * ─── Deal Lock Detailed View ───
 */
export const dealLockDetailedInclude = Prisma.validator<Prisma.DealLockInclude>()({
  deal: {
    select: {
      id: true,
      title: true,
      location: true,
      primaryImageUrl: true,
      category: true,
      dealLockExpireTime: true,
      merchant: {
        select: {
          id: true,
          userId: true,
          businessName: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  },
  variant: {
    select: {
      id: true,
      startDatetime: true,
      displayedPrice: true,
    },
  },
  slots: true,
  customAddons: true,
});

export type DealLockDetailed = Prisma.DealLockGetPayload<{
  include: typeof dealLockDetailedInclude;
}>;

/**
 * ─── Deal Booking Detailed View ───
 */
export const dealBookingDetailedInclude = Prisma.validator<Prisma.BookingInclude>()({
  deal: {
    select: {
      id: true,
      title: true,
      location: true,
      primaryImageUrl: true,
      category: true,
      durationDays: true,
    },
  },
  variant: {
    select: {
      id: true,
      startDatetime: true,
      displayedPrice: true,
    },
  },
  slots: true,
  customAddons: true,
});

export type DealBookingDetailed = Prisma.BookingGetPayload<{
  include: typeof dealBookingDetailedInclude;
}>;
