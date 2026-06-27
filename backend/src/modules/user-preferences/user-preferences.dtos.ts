import { z } from "zod";

/**
 * Zod schema for saving/updating user preferences
 */
export const userPreferenceSchema = z.object({
  travelStyle: z.array(z.string()).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  preferredLocations: z.array(z.string()).optional(),
  accommodationTypes: z.array(z.string()).optional(),
  activityInterests: z.array(z.string()).optional(),
  diverLevel: z.string().optional().nullable(),
  tripDuration: z.string().optional().nullable(),
  travelGroupType: z.string().optional().nullable(),
  transportPreference: z.union([z.string(), z.array(z.string())]).optional().nullable(),
});

export type UserPreferenceDTO = z.infer<typeof userPreferenceSchema>;
