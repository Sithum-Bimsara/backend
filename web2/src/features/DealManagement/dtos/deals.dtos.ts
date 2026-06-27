import { z } from 'zod';

// ─── Enums ───

export const RecurringTypeEnum = z.enum(['once', 'daily', 'weekly', 'interval']);
export type RecurringType = z.infer<typeof RecurringTypeEnum>;

// ─── Sub-schemas ───

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1, 'Day number must be at least 1'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const inclusionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
});

const exclusionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  additionalPrice: z.number().min(0).optional(),
});

// ─── Base Deal ───

const baseDealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  durationType: z.string().optional(),
  durationDays: z.number().int().min(0, 'Duration must be at least 0'),
  dealPrice: z.number().min(0, 'Price must be at least 0'),
  originalPrice: z.number().min(0, 'Original price must be at least 0'),
  displayedPrice: z.number().min(0).optional(),
  primaryImageUrl: z.string().url().nullable().or(z.literal('')).optional(),
  secondImageUrl: z.string().url().nullable().or(z.literal('')).optional(),
  thirdImageUrl: z.string().url().nullable().or(z.literal('')).optional(),
  fourthImageUrl: z.string().url().nullable().or(z.literal('')).optional(),
  dealLockExpireTime: z.number().int().min(0, 'Lock expiry must be at least 0'),
  isLocalOnly: z.boolean().optional(),
  currency: z.string().min(1, 'Currency is required'),
  itineraries: z.array(itinerarySchema).optional(),
  inclusions: z.array(inclusionSchema).optional(),
  exclusions: z.array(exclusionSchema).optional(),
});

const dealValidationRefinement = (data: Partial<z.infer<typeof baseDealSchema>>) => {
  if (data.durationDays !== undefined && data.itineraries && data.itineraries.length > 0) {
    if (data.durationDays !== data.itineraries.length) return false;
  }
  return true;
};

export const createDealSchema = baseDealSchema.refine(dealValidationRefinement, {
  message: 'Duration days must match the number of itinerary days',
  path: ['durationDays'],
});

export const updateDealSchema = baseDealSchema.partial().refine(dealValidationRefinement, {
  message: 'Duration days must match the number of itinerary days',
  path: ['durationDays'],
});

// ─── Variant Schemas ───

export const updateVariantSchema = z.object({
  totalSlots: z.number().int().min(1).max(50).optional(),
  availableSlots: z.number().int().min(0).optional(),
  status: z.enum(['active', 'sold_out', 'cancelled']).optional(),
});

// ─── Bulk Generation ───

export const bulkGenerateVariantsSchema = z.object({
  dealId: z.string().uuid(),
  repeatType: RecurringTypeEnum,
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  interval: z.number().int().min(1).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format').optional(),
  totalSlots: z.number().int().min(1).max(50),
});

// ─── Query Schemas ───

export const listDealsQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1).optional(),
  search: z.string().optional(),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const variantsQuerySchema = z.object({
  status: z.enum(['active', 'sold_out', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ─── AI Generation Schemas ───

export const generateItineraryAISchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  durationDays: z.number().int().min(1),
  travelerType: z.string().min(1),
  travelStyle: z.string().min(1),
  accommodationLevel: z.string().min(1),
  highlights: z.string().min(1),
  pace: z.enum(['relaxed', 'balanced', 'packed']),
  notes: z.string().optional(),
  generationDay: z.number().int().optional(),
  previousItineraries: z.array(z.object({
    dayNumber: z.number(),
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
  futureItineraries: z.array(z.object({
    dayNumber: z.number(),
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export const generateAddOnsAISchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  durationDays: z.number().int().min(1),
  dealPrice: z.number().optional(),
  displayedPrice: z.number().optional(),
  itineraries: z.array(z.object({
    dayNumber: z.number(),
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
});

export const generateItineraryAIInputSchema = z.object({
  travelerType: z.string().min(1),
  travelStyle: z.string().min(1),
  accommodationLevel: z.string().min(1),
  highlights: z.string().min(1),
  pace: z.enum(['relaxed', 'balanced', 'packed']),
  notes: z.string().optional(),
});

// ─── Inferred DTO Types ───

export type CreateDealDto = z.infer<typeof createDealSchema>;
export type UpdateDealDto = z.infer<typeof updateDealSchema>;
export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;
export type BulkGenerateVariantsDto = z.infer<typeof bulkGenerateVariantsSchema>;
export type ListDealsQueryDto = z.infer<typeof listDealsQuerySchema>;
export type DateRangeQueryDto = z.infer<typeof dateRangeQuerySchema>;
export type VariantsQueryDto = z.infer<typeof variantsQuerySchema>;
export type GenerateItineraryAIDto = z.infer<typeof generateItineraryAISchema>;
export type GenerateAddOnsAIDto = z.infer<typeof generateAddOnsAISchema>;
export type GenerateItineraryAIInput = z.infer<typeof generateItineraryAIInputSchema>;
