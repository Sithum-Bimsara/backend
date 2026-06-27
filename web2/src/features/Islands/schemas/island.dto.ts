import { z } from "zod";

export const createIslandSchema = z.object({
  name: z.string().min(1, "Island name is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  overview: z.string().min(1, "Overview is required"),
  bestFor: z.string().min(1, "Best for is required"),
  activities: z.array(z.string()).min(1, "At least one activity is required"),
  marineLifeZones: z.array(z.string()).min(1, "At least one marine life zone is required"),
  nightlife: z.string().min(1, "Nightlife info is required"),
  safetyText: z.string().min(1, "Safety and local customs info is required"),
  internetText: z.string().min(1, "Internet and remote work info is required"),
  transferDetails: z.array(z.string()).min(1, "At least one transfer mode is required"),
  
  // Best Time months (12 strings, each should be: 'excellent' | 'good' | 'fair' | 'avoid')
  bestTimeMonths: z.array(z.enum(["excellent", "good", "fair", "avoid"])).length(12, "Must specify conditions for all 12 months"),
  bestTimeTextBest: z.string().optional().nullable(),
  bestTimeTextAvoid: z.string().optional().nullable(),
  bestTimeTextTips: z.string().optional().nullable(),

  // Cost items
  costLocal: z.coerce.number().nonnegative("Local cost must be non-negative"),
  costNonLocal: z.coerce.number().nonnegative("Non-local cost must be non-negative"),
  costFoodDrinks: z.coerce.number().nonnegative("Food and drinks cost must be non-negative"),
  costActivities: z.coerce.number().nonnegative("Activities cost must be non-negative"),
  costExtra: z.coerce.number().nonnegative("Extra cost must be non-negative"),

  // JSON items
  sampleDay: z.array(
    z.object({
      time: z.string().min(1, "Time is required"),
      description: z.string().min(1, "Description is required"),
    })
  ).default([]),
  
  foodAndDrinkDeals: z.array(
    z.object({
      name: z.string().min(1, "Deal name is required"),
      description: z.string().min(1, "Deal description is required"),
      price: z.coerce.number().nonnegative("Price must be non-negative"),
    })
  ).default([]),

  // Lists
  insiderTips: z.array(z.string()).default([]),
  images: z.array(z.string().url("Invalid image URL")).max(4, "Max 4 images allowed").default([]),
});

export const updateIslandSchema = createIslandSchema.partial();

export type CreateIslandDto = z.infer<typeof createIslandSchema>;
export type UpdateIslandDto = z.infer<typeof updateIslandSchema>;
