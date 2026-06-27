import { Prisma } from "@prisma/client";

export const lockFullInclude = {
  property: { select: { name: true, city: true, isActive: true, merchant: { select: { userId: true } } } },
  unit: { select: { id: true, name: true, dealLockExpireTime: true } },
  slots: { select: { id: true } },
  customAddons: true,
} satisfies Prisma.AccommodationLockInclude;

export type AccommodationLockRecord = Prisma.AccommodationLockGetPayload<{
  include: typeof lockFullInclude;
}>;

export const bookingFullInclude = {
  property: { select: { name: true, city: true } },
  unit: { select: { id: true, name: true } },
  slots: { select: { id: true } },
  customAddons: true,
} satisfies Prisma.AccommodationBookingInclude;

export type AccommodationBookingRecord = Prisma.AccommodationBookingGetPayload<{
  include: typeof bookingFullInclude;
}>;
