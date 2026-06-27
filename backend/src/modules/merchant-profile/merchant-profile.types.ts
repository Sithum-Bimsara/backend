import { Prisma } from "@prisma/client";

export type MerchantProfileWhereInput = Prisma.MerchantProfileWhereInput;
import type { CreateMerchantProfileDto } from "./merchant-profile.dtos";

/**
 * ─── Merchant Profile Standard Include ───
 */
export const merchantProfileDetailedInclude = {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
} satisfies Prisma.MerchantProfileInclude;

export type MerchantProfileRecord = Prisma.MerchantProfileGetPayload<{
  include: typeof merchantProfileDetailedInclude;
}>;

// ─── Admin Query Types ───────────────────────────────────────────────────────

export const adminMerchantProfileInclude = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.MerchantProfileInclude;

export type AdminMerchantProfileRecord = Prisma.MerchantProfileGetPayload<{
  include: typeof adminMerchantProfileInclude;
}>;

export const adminMerchantPaginatedInclude = {
  user: { select: { id: true, name: true, email: true } },
  _count: { select: { deals: true, properties: true } },
} satisfies Prisma.MerchantProfileInclude;

export type AdminMerchantPaginatedRecord = Prisma.MerchantProfileGetPayload<{
  include: typeof adminMerchantPaginatedInclude;
}>;

// ─── Prisma Input Types ──────────────────────────────────────────────────────

export type CreateMerchantProfileData = Pick<
  CreateMerchantProfileDto,
  "businessName" | "businessDescription" | "contactNumber" | "address"
> & {
  city: string | null;
  country: string | null;
  businessRegistrationDocUrl: string;
  businessRegistrationDocName: string | null;
};

export type UpdateMerchantProfileData = Partial<{
  businessName: string;
  businessDescription: string;
  contactNumber: string;
  address: string | null;
  city: string | null;
  country: string | null;
  businessRegistrationDocUrl: string | null;
  businessRegistrationDocName: string | null;
}>;
