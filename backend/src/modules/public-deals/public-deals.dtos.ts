import { z } from "zod";
import { Request } from "express";
import { DealCategory } from "../deals/enums/deals.enums";

// ─── Query / Input Schemas ───

export const publicDealQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  cursor: z.string().uuid().optional(),
  location: z.string().optional(),
  category: z.union([z.nativeEnum(DealCategory), z.string()]).optional(),
  island: z.string().optional(),
  isLocalOnly: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return val;
  }, z.boolean().optional()),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const dealDetailQuerySchema = z.object({
  trackView: z.preprocess((val) => {
    if (val === "false") return false;
    return true; // default true
  }, z.boolean()).optional(),
});

export type PublicDealQueryDto = z.infer<typeof publicDealQuerySchema>;

/**
 * ─── Request Context DTO ───
 * Defining properties attached by middlewares using Zod for consistency.
 */
export const publicDealRequestSchema = z.object({
  userId: z.uuid().nullish(),
  isLocal: z.boolean().optional(),
});

export type PublicDealRequestData = z.infer<typeof publicDealRequestSchema>;

/**
 * Augmented Express Request for the Public Deals module.
 */
export interface PublicDealRequest extends Request, PublicDealRequestData {}

// ─── Output Validation Schemas (View Schemas) ───

export const viewPublicDealSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  category: z.string(),
  primaryImageUrl: z.string().nullish(),
  durationDays: z.number(),
  isLocalOnly: z.boolean(),
  displayedPrice: z.number(),
  originalPrice: z.number(),
  averageRating: z.number().nullish(),
  totalReviews: z.number().nullish(),
  createdAt: z.date(),
  dealLockExpireTime: z.number().optional(), // For search results
  merchant: z.object({
    id: z.string().uuid(),
    businessName: z.string(),
    logoUrl: z.string().nullish(),
  }).nullish(),
});

export const viewAccommodationDealSchema = viewPublicDealSchema.extend({
  isAccommodation: z.boolean(),
});

export type ViewPublicDealDto = z.infer<typeof viewPublicDealSchema>;

// Pagination Response DTO
export const paginatedPublicDealResponseSchema = z.object({
  items: z.array(viewPublicDealSchema),
  nextCursor: z.string().nullable(),
  total: z.number().optional(),
});

export const paginatedAccommodationDealResponseSchema = z.object({
  items: z.array(viewAccommodationDealSchema),
  nextCursor: z.string().nullable(),
  total: z.number().optional(),
});

// View Platform Stats Schema
export const viewPlatformStatsSchema = z.object({
  totalDeals: z.number(),
  totalTravellers: z.number(),
  totalLocks: z.number(),
});

export const minimalCardItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullish(),
  primaryImageUrl: z.string().nullish(),
  displayedPrice: z.number(),
  originalPrice: z.number().nullish(),
  averageRating: z.number().nullish(),
  totalReviews: z.number().nullish(),
  isAccommodation: z.boolean(),
  merchant: z.object({
    id: z.string().uuid(),
    businessName: z.string(),
  }),
});

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export const islandListingsResponseSchema = z.object({
  deals: z.array(minimalCardItemSchema),
  accommodations: z.array(minimalCardItemSchema),
  pagination: z.object({
    deals: paginationMetaSchema,
    accommodations: paginationMetaSchema,
  }),
});

export type MinimalCardItem = z.infer<typeof minimalCardItemSchema>;
