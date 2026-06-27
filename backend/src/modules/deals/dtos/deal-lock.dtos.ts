import { z } from "zod";

export const lockDealSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID"),
  quantity: z.number().int().min(1, "At least 1 slot required").max(20, "Maximum 20 slots"),
});

export const createBookingSchema = z.object({
  lockId: z.string().uuid("Invalid lock ID"),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  selectedExclusionIds: z.array(z.string().uuid("Invalid exclusion ID")).max(50, "Too many selected add-ons").optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
});

export type LockDealDto = z.infer<typeof lockDealSchema>;
export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;
