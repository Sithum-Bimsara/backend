import { z } from "zod";

// ─── Base Layers ─────────────────────────────────────────────────────────────

export const viewDealRequestSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  message: z.string(),
  contactNumber: z.string(),
  status: z.enum(["new", "contacted", "closed"]),
  createdAt: z.date().or(z.string()),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
  }).nullish(),
});

// ─── Input Validation ────────────────────────────────────────────────────────

export const createDealRequestSchema = z.object({
  message: z.string().min(10, "Please describe your request"),
  contactNumber: z.string().min(7, "Contact number is required"),
});

export const updateDealRequestStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});

export const dealRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["new", "contacted", "closed"]).optional(),
  search: z.string().optional(),
});

export const paginatedDealRequestResponseSchema = z.object({
  data: z.array(viewDealRequestSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

// ─── Params ──────────────────────────────────────────────────────────────────

export const dealRequestIdParamsSchema = z.object({
  id: z.uuid("Invalid deal request ID"),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type CreateDealRequestDto = z.infer<typeof createDealRequestSchema>;
export type UpdateDealRequestStatusDto = z.infer<typeof updateDealRequestStatusSchema>;
export type ViewDealRequestDto = z.infer<typeof viewDealRequestSchema>;
export type DealRequestQueryDto = z.infer<typeof dealRequestQuerySchema>;
export type PaginatedDealRequestResponseDto = z.infer<typeof paginatedDealRequestResponseSchema>;
