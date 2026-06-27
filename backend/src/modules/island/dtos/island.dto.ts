import { z } from "zod";

// ─── Input Validation ───

export const createIslandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  overview: z.string().min(1, "Overview is required"),
  bestFor: z.string().min(1, "Best for is required"),
  activities: z.array(z.string()).min(1, "At least one activity is required"),
  marineLifeZones: z.array(z.string()).min(1, "At least one marine life zone is required"),
  nightlife: z.string().min(1, "Night life description is required"),
  safetyText: z.string().min(1, "Safety information is required"),
  internetText: z.string().min(1, "Internet information is required"),
  transferDetails: z.array(z.string()).min(1, "At least one transfer mode is required"),
  bestTimeMonths: z.array(z.string()).length(12, "Must contain exactly 12 month conditions"),
  bestTimeTextBest: z.string().optional().nullable(),
  bestTimeTextAvoid: z.string().optional().nullable(),
  bestTimeTextTips: z.string().optional().nullable(),
  costLocal: z.number().nonnegative("Local cost must be a non-negative number"),
  costNonLocal: z.number().nonnegative("Non-local cost must be a non-negative number"),
  costFoodDrinks: z.number().nonnegative("Food and drinks cost must be a non-negative number"),
  costActivities: z.number().nonnegative("Activities cost must be a non-negative number"),
  costExtra: z.number().nonnegative("Extra cost must be a non-negative number"),
  sampleDay: z.array(z.object({
    time: z.string(),
    description: z.string(),
  })).optional().nullable(),
  foodAndDrinkDeals: z.array(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
  })).optional().nullable(),
  insiderTips: z.array(z.string()).optional(),
  images: z.array(z.string()).max(4, "Maximum 4 images allowed").optional(),
});

export const updateIslandSchema = createIslandSchema.partial();

// ─── Pagination Query ───

export const islandQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().optional(),
});

export const suitableQuerySchema = z.object({
  categories: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }),
  activities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }),
});

export const compareQuerySchema = z.object({
  ids: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }),
});

export const islandIdSchema = z.object({
  id: z.string().uuid("Invalid Island ID"),
});

// ─── Output Shaping (Views) ───

export const viewIslandMinSchema = z.object({
  id: z.string(),
  name: z.string(),
  categories: z.array(z.string()),
  firstImage: z.string().nullable(),
  transferDetails: z.array(z.string()),
  costLocal: z.number(),
  costNonLocal: z.number(),
  bestFor: z.string(),
  marineLifeZones: z.array(z.string()),
  createdAt: z.date().or(z.string()),
});

export const viewIslandFullSchema = z.object({
  id: z.string(),
  name: z.string(),
  categories: z.array(z.string()),
  overview: z.string(),
  bestFor: z.string(),
  activities: z.array(z.string()),
  marineLifeZones: z.array(z.string()),
  nightlife: z.string(),
  safetyText: z.string(),
  internetText: z.string(),
  transferDetails: z.array(z.string()),
  bestTimeMonths: z.array(z.string()),
  bestTimeTextBest: z.string().nullable(),
  bestTimeTextAvoid: z.string().nullable(),
  bestTimeTextTips: z.string().nullable(),
  costLocal: z.number(),
  costNonLocal: z.number(),
  costFoodDrinks: z.number(),
  costActivities: z.number(),
  costExtra: z.number(),
  sampleDay: z.any().nullable(), // Allow flexible parsed JSON
  foodAndDrinkDeals: z.any().nullable(),
  insiderTips: z.array(z.string()),
  images: z.array(z.string()),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const paginatedIslandResponseSchema = z.object({
  items: z.array(viewIslandMinSchema),
  totalItems: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
});

// ─── Type Exports ───

export type CreateIslandDto = z.infer<typeof createIslandSchema>;
export type UpdateIslandDto = z.infer<typeof updateIslandSchema>;
export type IslandQueryDto = z.infer<typeof islandQuerySchema>;
export type SuitableQueryDto = z.infer<typeof suitableQuerySchema>;
export type CompareQueryDto = z.infer<typeof compareQuerySchema>;
export type ViewIslandMinDto = z.infer<typeof viewIslandMinSchema>;
export type ViewIslandFullDto = z.infer<typeof viewIslandFullSchema>;
export type PaginatedIslandResponseDto = z.infer<typeof paginatedIslandResponseSchema>;
