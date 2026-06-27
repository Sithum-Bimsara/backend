import { z } from "zod";
import { DealReviewBadgeType } from "../enums/deal-review.enums";

// ─── Input Validation ───

export const createDealReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating is required")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(1, "Comment is required")
    .min(3, "Comment must be at least 3 characters")
    .max(2000, "Comment must be at most 2000 characters")
    .trim(),
});

export const updateDealReviewSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string()
      .min(3, "Comment must be at least 3 characters")
      .max(2000, "Comment must be at most 2000 characters")
      .trim()
      .optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "At least one field (rating or comment) must be provided",
  });

export const adminUpdateReviewBadgeSchema = z.object({
  badgeType: z.nativeEnum(DealReviewBadgeType, {
    error: (issue) =>
      issue.input === undefined
        ? "Badge type is required"
        : "Badge type must be 'normal' or 'verified'",
  }),
});

export const adminBulkUpdateBadgeSchema = z.object({
  reviewIds: z.array(z.uuid("Invalid review ID")).min(1, "At least one review ID is required"),
  badgeType: z.nativeEnum(DealReviewBadgeType, {
    error: (issue) =>
      issue.input === undefined
        ? "Badge type is required"
        : "Badge type must be 'normal' or 'verified'",
  }),
});

export const adminBulkDeleteSchema = z.object({
  reviewIds: z.array(z.uuid("Invalid review ID")).min(1, "At least one review ID is required"),
});

// ─── Pagination Query ───

export const dealReviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.uuid().optional(),
  badgeType: z.nativeEnum(DealReviewBadgeType).optional(),
});

// ─── Params ───

export const dealIdParamsSchema = z.object({ dealId: z.uuid("Invalid deal ID") });
export const reviewIdParamsSchema = z.object({ reviewId: z.uuid("Invalid review ID") });

// ─── Output Shaping (Views) ───

export const viewDealReviewSchema = z.object({
  id: z.uuid(),
  dealId: z.uuid(),
  userId: z.uuid(),
  rating: z.number().int(),
  comment: z.string(),
  badgeType: z.nativeEnum(DealReviewBadgeType),
  isEdited: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }).nullish(),
});

export const starDistributionSchema = z.object({
  5: z.number(),
  4: z.number(),
  3: z.number(),
  2: z.number(),
  1: z.number(),
});

export const reviewSummarySchema = z.object({
  averageRating: z.number(),
  totalReviews: z.number(),
  verifiedReviews: z.number(),
  starDistribution: starDistributionSchema,
});

export const paginatedDealReviewResponseSchema = z.object({
  items: z.array(viewDealReviewSchema),
  summary: reviewSummarySchema,
  nextCursor: z.uuid().nullable(),
});

export const reviewPreviewResponseSchema = z.object({
  reviews: z.array(viewDealReviewSchema),
  summary: reviewSummarySchema,
});

export const createUpdateReviewResponseSchema = z.object({
  review: viewDealReviewSchema,
  summary: reviewSummarySchema,
});

// ─── Type Exports ───

export type CreateDealReviewDto = z.infer<typeof createDealReviewSchema>;
export type UpdateDealReviewDto = z.infer<typeof updateDealReviewSchema>;
export type AdminUpdateReviewBadgeDto = z.infer<typeof adminUpdateReviewBadgeSchema>;
export type AdminBulkUpdateBadgeDto = z.infer<typeof adminBulkUpdateBadgeSchema>;
export type AdminBulkDeleteDto = z.infer<typeof adminBulkDeleteSchema>;
export type DealReviewQueryDto = z.infer<typeof dealReviewQuerySchema>;

export type ViewDealReviewDto = z.infer<typeof viewDealReviewSchema>;
export type ReviewSummaryDto = z.infer<typeof reviewSummarySchema>;
export type StarDistributionDto = z.infer<typeof starDistributionSchema>;
export type PaginatedDealReviewResponseDto = z.infer<typeof paginatedDealReviewResponseSchema>;
export type ReviewPreviewResponseDto = z.infer<typeof reviewPreviewResponseSchema>;
export type CreateUpdateReviewResponseDto = z.infer<typeof createUpdateReviewResponseSchema>;
