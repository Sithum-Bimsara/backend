import { z } from "zod";

//////////////////////////////////////////////////////
// GET PUBLIC DEALS
//////////////////////////////////////////////////////

export const getPublicDealsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  isLocalOnly: z.boolean().optional(),
  island: z.string().optional(),
});

export type GetPublicDealsParamsDto = z.infer<typeof getPublicDealsSchema>;

//////////////////////////////////////////////////////
// LOCK DEAL
//////////////////////////////////////////////////////

export const lockDealSchema = z.object({
  variantId: z.string(),
  quantity: z.number().min(1),
});

export type LockDealRequestDto = z.infer<typeof lockDealSchema>;

//////////////////////////////////////////////////////
// CREATE BOOKING
//////////////////////////////////////////////////////

export const createBookingSchema = z.object({
  lockId: z.string(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  selectedExclusionIds: z.array(z.string()).optional(),
});

export type CreateBookingRequestDto = z.infer<typeof createBookingSchema>;
