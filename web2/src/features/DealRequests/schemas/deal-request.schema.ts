import { z } from 'zod';

/**
 * ─── Create Deal Request Schema (DTO Layer) ───
 */
export const createDealRequestSchema = z.object({
  message: z.string().min(10, 'Please describe your request (minimum 10 characters)'),
  contactNumber: z.string().min(7, 'Contact number is required (minimum 7 characters)'),
});

export type CreateDealRequestDto = z.infer<typeof createDealRequestSchema>;