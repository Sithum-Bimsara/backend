import { Prisma } from "@prisma/client";

export type UserWhereInput = Prisma.UserWhereInput;

/**
 * ─── User Profile Standard View ───
 */
export const userProfileDetailedSelect = {
  id: true,
  name: true,
  email: true,
  contactNumber: true,
  address: true,
  city: true,
  country: true,
  createdAt: true,
  isTraveller: true,
  isMerchant: true,
  isAdmin: true,
} satisfies Prisma.UserSelect;

export type UserProfileRecord = Prisma.UserGetPayload<{
  select: typeof userProfileDetailedSelect;
}>;

/**
 * ─── Phone Verification View ───
 */
export const userPhoneVerificationSelect = {
  id: true,
  phone: true,
  phoneVerified: true,
  isMaldivesVerified: true,
} satisfies Prisma.UserSelect;

export type UserPhoneVerificationRecord = Prisma.UserGetPayload<{
  select: typeof userPhoneVerificationSelect;
}>;

// ─── Admin Query Types ───────────────────────────────────────────────────────

export const adminUserPaginatedInclude = {
  merchantProfile: {
    select: { id: true, businessName: true, verificationStatus: true },
  },
} satisfies Prisma.UserInclude;

export type AdminUserPaginatedRecord = Prisma.UserGetPayload<{
  include: typeof adminUserPaginatedInclude;
}>;

export const adminUserStatusSelect = {
  id: true,
  name: true,
  email: true,
  contactNumber: true,
  isTraveller: true,
  isMerchant: true,
  isAdmin: true,
  status: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type AdminUserStatusRecord = Prisma.UserGetPayload<{
  select: typeof adminUserStatusSelect;
}>;

export const adminUserWithProfileInclude = {
  merchantProfile: {
    select: { id: true, businessName: true, verificationStatus: true },
  },
} satisfies Prisma.UserInclude;

export type AdminUserWithProfileRecord = Prisma.UserGetPayload<{
  include: typeof adminUserWithProfileInclude;
}>;

// ─── Prisma Input Types ──────────────────────────────────────────────────────

export type UpdateUserProfileData = Partial<{
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
}>;
