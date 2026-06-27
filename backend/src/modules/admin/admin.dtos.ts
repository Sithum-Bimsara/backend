import { z } from "zod";
import { 
  MerchantVerificationStatus, 
  AdminDealStatus 
} from "./admin.enums";
import { viewPostSchema, viewCommentSchema, viewReportedCommentSchema } from "../community/community.dto";

// ─── Shared Schemas ──────────────────────────────────────────────────────────

export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ─── Input Validation ────────────────────────────────────────────────────────

export const updateDealAdminSchema = z.object({
  displayedPrice: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateVariantPriceSchema = z.object({
  displayedPrice: z.number().min(0),
});

// ─── Pagination Queries ──────────────────────────────────────────────────────

export const adminMerchantQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  verificationStatus: z.nativeEnum(MerchantVerificationStatus).optional(),
}).merge(dateRangeSchema);

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).merge(dateRangeSchema);

export const adminCommunityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  reportFirst: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const adminDealQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.uuid().optional(),
  status: z.nativeEnum(AdminDealStatus).optional(),
  merchantId: z.uuid().optional(),
}).merge(dateRangeSchema);

// ─── Params ──────────────────────────────────────────────────────────────────

export const merchantIdParamsSchema = z.object({
  id: z.uuid(),
});

export const userIdParamsSchema = z.object({
  id: z.uuid(),
});

export const dealIdParamsSchema = z.object({
  dealId: z.uuid(),
});

export const variantIdParamsSchema = z.object({
  variantId: z.uuid(),
});

// ─── View Schemas (Output Shaping) ───────────────────────────────────────────

export const viewAdminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  contactNumber: z.string().nullable(),
  isTraveller: z.boolean(),
  isMerchant: z.boolean(),
  isAdmin: z.boolean(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  merchantProfile: z.object({
    id: z.string(),
    businessName: z.string(),
    verificationStatus: z.string(),
  }).nullish(),
});

export const viewAdminUserDetailsSchema = z.object({
  profile: viewAdminUserSchema,
  bookingsCount: z.number(),
  locksCount: z.number(),
  postsCount: z.number(),
});

export const viewAdminMerchantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessName: z.string(),
  businessDescription: z.string(),
  contactNumber: z.string().nullable(),
  logoUrl: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  verificationStatus: z.string(),
  createdAt: z.date().or(z.string()),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  _count: z.object({
    deals: z.number(),
    properties: z.number(),
  }),
});

export const viewMerchantDealSummarySchema = z.object({
  dealId: z.string(),
  title: z.string().nullable(),
  displayedPrice: z.number().nullable(),
  locksCount: z.number(),
  bookingsCount: z.number(),
});

export const viewAdminMerchantDetailsSchema = z.object({
  merchant: viewAdminMerchantSchema.omit({ _count: true }).extend({
    businessRegistrationDocUrl: z.string().nullable(),
    businessRegistrationDocName: z.string().nullable(),
  }),
  analytics: z.object({
    totalDeals: z.number(),
    totalLocks: z.number(),
    totalBookings: z.number(),
    totalRevenueGenerated: z.number(),
    platformCommission: z.number(),
    merchantPayout: z.number(),
  }),
  deals: z.array(viewMerchantDealSummarySchema),
});

export const viewAdminDealSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  location: z.string().nullable(),
  displayedPrice: z.number().nullable(),
  dealPrice: z.number().nullable(),
  originalPrice: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date().or(z.string()),
  merchant: z.object({
    id: z.string(),
    businessName: z.string(),
  }),
  _count: z.object({
    variants: z.number(),
    bookings: z.number(),
    locks: z.number(),
  }),
});

export const viewAdminDealVariantSchema = z.object({
  id: z.string(),
  startDatetime: z.date().or(z.string()).nullable(),
  totalSlots: z.number().nullable(),
  availableSlots: z.number().nullable(),
  displayedPrice: z.number().nullable(),
  status: z.string(),
  _count: z.object({ bookings: z.number(), locks: z.number() }),
});

export const viewAdminDealDetailSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  displayedPrice: z.number().nullable(),
  dealPrice: z.number().nullable(),
  originalPrice: z.number().nullable(),
  isActive: z.boolean(),
  category: z.string().nullable(),
  dealLockExpireTime: z.number().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  merchant: z.object({
    id: z.string(),
    businessName: z.string(),
    contactNumber: z.string().nullable(),
    user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  }),
  itineraries: z.array(z.object({
    id: z.string(),
    dayNumber: z.number().nullable(),
    title: z.string().nullable(),
    description: z.string().nullable(),
  })),
  inclusions: z.array(z.object({ id: z.string(), description: z.string() })),
  exclusions: z.array(z.object({ id: z.string(), description: z.string(), additionalPrice: z.number().nullable() })),
  variants: z.array(viewAdminDealVariantSchema),
  _count: z.object({ bookings: z.number(), locks: z.number() }),
});

export const viewAdminDashboardSchema = z.object({
  totalUsers: z.number(),
  totalMerchants: z.number(),
  totalDeals: z.number(),
  totalAccommodations: z.number(),
  totalBookings: z.number(),
  totalLocks: z.number(),
  totalPlatformRevenue: z.number(),
  platformIncomeSeries: z.array(z.object({
    date: z.string(),
    income: z.number(),
  })),
});

// ─── Paginated Response Schemas ──────────────────────────────────────────────

export const paginatedAdminUsersSchema = z.object({
  data: z.array(viewAdminUserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const paginatedAdminMerchantsSchema = z.object({
  data: z.array(viewAdminMerchantSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const paginatedAdminDealsSchema = z.object({
  items: z.array(viewAdminDealSchema),
  nextCursor: z.string().nullable(),
});


export const paginatedAdminCommunityPostSchema = z.object({
  data: z.array(viewPostSchema),
  total: z.number().optional(),
  page: z.number(),
  limit: z.number(),
});

export const paginatedAdminCommunityCommentSchema = z.object({
  data: z.array(viewCommentSchema),
  total: z.number().optional(),
  page: z.number(),
  limit: z.number(),
});


export const paginatedAdminCommunityReportedCommentSchema = z.object({
  data: z.array(viewReportedCommentSchema),
  total: z.number().optional(),
  page: z.number(),
  limit: z.number(),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type AdminMerchantQueryDto = z.infer<typeof adminMerchantQuerySchema>;
export type AdminUserQueryDto = z.infer<typeof adminUserQuerySchema>;
export type AdminDealQueryDto = z.infer<typeof adminDealQuerySchema>;
export type UpdateDealAdminDto = z.infer<typeof updateDealAdminSchema>;
export type UpdateVariantPriceDto = z.infer<typeof updateVariantPriceSchema>;

export type ViewAdminUserDto = z.infer<typeof viewAdminUserSchema>;
export type ViewAdminMerchantDto = z.infer<typeof viewAdminMerchantSchema>;
export type ViewAdminDealDto = z.infer<typeof viewAdminDealSchema>;
export type ViewAdminDealDetailDto = z.infer<typeof viewAdminDealDetailSchema>;
export type ViewAdminDashboardDto = z.infer<typeof viewAdminDashboardSchema>;
export type ViewMerchantDealSummaryDto = z.infer<typeof viewMerchantDealSummarySchema>;

export type PaginatedAdminUsersDto = z.infer<typeof paginatedAdminUsersSchema>;
export type PaginatedAdminMerchantsDto = z.infer<typeof paginatedAdminMerchantsSchema>;
export type PaginatedAdminDealsDto = z.infer<typeof paginatedAdminDealsSchema>;
export type AdminCommunityQueryDto = z.infer<typeof adminCommunityQuerySchema>;
export type PaginatedAdminCommunityPostDto = z.infer<typeof paginatedAdminCommunityPostSchema>;
export type PaginatedAdminCommunityCommentDto = z.infer<typeof paginatedAdminCommunityCommentSchema>;
export type PaginatedAdminCommunityReportedCommentDto = z.infer<typeof paginatedAdminCommunityReportedCommentSchema>;
