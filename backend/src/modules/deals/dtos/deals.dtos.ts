import { z } from "zod";
import { RecurringType } from "../enums/deals.enums";

// ─── Itinerary / Inclusion / Exclusion ───

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

const inclusionSchema = z.object({
  description: z.string().min(1),
});

const exclusionSchema = z.object({
  description: z.string().min(1),
  additionalPrice: z.number().optional(),
});

// ─── Deal Schemas ───

const baseDealObject = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  durationType: z.string().optional(),
  durationDays: z.number().int().min(0, "Duration must be at least 0"),
  dealPrice: z.number().min(0, "Price must be at least 0"),
  originalPrice: z.number().min(0, "Original price must be at least 0"),
  displayedPrice: z.number().min(0).optional(),
  primaryImageUrl: z.string().url().nullable().or(z.literal("")).optional(),
  secondImageUrl: z.string().url().nullable().or(z.literal("")).optional(),
  thirdImageUrl: z.string().url().nullable().or(z.literal("")).optional(),
  fourthImageUrl: z.string().url().nullable().or(z.literal("")).optional(),
  dealLockExpireTime: z.number().int().min(0, "Lock expiry must be at least 0"),
  isLocalOnly: z.boolean().optional(),
  currency: z.string().min(1, "Currency is required"),
  itineraries: z.array(itinerarySchema).optional(),
  inclusions: z.array(inclusionSchema).optional(),
  exclusions: z.array(exclusionSchema).optional(),
});

const dealValidationRefinement = (data: Partial<z.infer<typeof baseDealObject>>) => {
  // If both durationDays and itineraries are provided, they must match
  if (data.durationDays !== undefined && data.itineraries && data.itineraries.length > 0) {
    if (data.durationDays !== data.itineraries.length) {
      return false;
    }
  }
  return true;
};

export const createDealSchema = baseDealObject.refine(
  dealValidationRefinement,
  {
    message: "Duration days must match the number of itinerary days",
    path: ["durationDays"],
  }
);

export const updateDealSchema = baseDealObject.partial().refine(
  dealValidationRefinement,
  {
    message: "Duration days must match the number of itinerary days",
    path: ["durationDays"],
  }
);

// ─── Variant Schemas ───

export const updateVariantSchema = z.object({
  totalSlots: z.number().int().min(1).max(50).optional(),
  availableSlots: z.number().int().min(0).optional(),
  status: z.enum(["active", "sold_out", "cancelled"]).optional(),
});

// ─── Bulk Generation Schemas ───

export const bulkGenerateVariantsSchema = z.object({
  dealId: z.string().uuid(),
  repeatType: z.nativeEnum(RecurringType),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  interval: z.number().int().min(1).optional(),
  startDate: z.string(),
  endDate: z.string(),
  timeOfDay: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Must be HH:mm format")
    .optional(),
  totalSlots: z.number().int().min(1).max(50),
});

// ─── Query Schemas ───

export const dealsQuerySchema = z.object({
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number),
  search: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  merchantId: z.string().optional(),
  isActive: z.string().transform((v) => v === "true").optional(),
});

export const variantsQuerySchema = z.object({
  dealId: z.string().uuid(),
  status: z.enum(["active", "sold_out", "cancelled"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().default("1").transform(Number),
  limit: z.string().default("10").transform(Number),
});

export type CreateDealDto = z.infer<typeof createDealSchema>;
export type UpdateDealDto = z.infer<typeof updateDealSchema>;
export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;
export type BulkGenerateVariantsDto = z.infer<typeof bulkGenerateVariantsSchema>;
export type DealsQueryDto = z.infer<typeof dealsQuerySchema>;
export type VariantsQueryDto = z.infer<typeof variantsQuerySchema>;

// ─── Paginated Merchant Deals ───
export const listDealsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  search: z.string().optional(),
});

export const viewDealSlimSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  category: z.string(),
  displayedPrice: z.number().nullable(),
  dealPrice: z.number(),
  originalPrice: z.number(),
  primaryImageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
  averageRating: z.number(),
  totalReviews: z.number(),
  createdAt: z.date().or(z.string()),
});

export const paginatedDealResponseSchema = z.object({
  items: z.array(viewDealSlimSchema),
  nextCursor: z.uuid().nullable().optional(),
  total: z.number().int().optional(),
});

export type ListDealsQueryDto = z.infer<typeof listDealsQuerySchema>;
export type PaginatedDealResponseDto = z.infer<typeof paginatedDealResponseSchema>;
export type ViewDealSlimDto = z.infer<typeof viewDealSlimSchema>;

// ─── Bulk Variant Result Schemas ───

/**
 * Shape of the response after bulk generating variants.
 */
export const bulkGenerateResultSchema = z.object({
  generatedCount: z.number().int(),
  previewDates: z.array(z.string()),
});

/**
 * Shape of the response from the bulk preview (conflict check) endpoint.
 */
export const bulkPreviewResultSchema = z.object({
  dates: z.array(z.string()),
  conflicts: z.array(z.string()),
  count: z.number().int(),
});

export type BulkGenerateResultDto = z.infer<typeof bulkGenerateResultSchema>;
export type BulkPreviewResultDto = z.infer<typeof bulkPreviewResultSchema>;

// ─── Analytics Schemas ───

export const dateRangeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type DateRangeQueryDto = z.infer<typeof dateRangeQuerySchema>;

// ─── Event & Log Schemas ───

export const createDealViewEventSchema = z.object({
  userId: z.string().nullable().optional(),
  dealId: z.string(),
});

export const createSearchLogSchema = z.object({
  userId: z.string().nullable().optional(),
  query: z.string().nullable().optional(),
  filters: z.any().optional(), // Prisma.InputJsonValue mapped to any
  resultDealIds: z.any().optional(),
  clickedDealId: z.string().nullable().optional(),
});

export type CreateDealViewEventDto = z.infer<typeof createDealViewEventSchema>;
export type CreateSearchLogDto = z.infer<typeof createSearchLogSchema>;

// ─── Paginated Locks & Bookings for Deal Dashboard ───

export const listLocksQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const listBookingsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type ListLocksQueryDto = z.infer<typeof listLocksQuerySchema>;
export type ListBookingsQueryDto = z.infer<typeof listBookingsQuerySchema>;

export const viewAddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  details: z.string().nullable(),
  addedAt: z.date().or(z.string()),
});

export const viewLockSchema = z.object({
  id: z.string(),
  checkInDate: z.date().or(z.string()), // Maps variant start date for UI compatibility
  lockedPrice: z.number(),
  expiresAt: z.date().or(z.string()),
  quantity: z.number(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  dealTitle: z.string(),
  dealId: z.string(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  addons: z.array(viewAddonSchema),
  addonsTotal: z.number(),
  grandTotal: z.number(),
  chatRoomId: z.string().nullable(),
});

export const paginatedLockResponseSchema = z.object({
  items: z.array(viewLockSchema),
  total: z.number().default(0),
});

export type PaginatedLockResponseDto = z.infer<typeof paginatedLockResponseSchema>;

export const viewBookingSchema = z.object({
  id: z.string(),
  checkInDate: z.date().or(z.string()), // Maps variant start date for UI compatibility
  guests: z.number(),
  totalPrice: z.number(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  dealTitle: z.string(),
  dealId: z.string(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  addons: z.array(viewAddonSchema),
  addonsTotal: z.number(),
  grandTotal: z.number(),
  lockId: z.string().nullable(),
  chatRoomId: z.string().nullable(),
});

export const paginatedBookingResponseSchema = z.object({
  items: z.array(viewBookingSchema),
  total: z.number().default(0),
});

export type PaginatedBookingResponseDto = z.infer<typeof paginatedBookingResponseSchema>;

