import { z } from "zod";

// ─── Input Validation ───

export const createAccommodationReviewSchema = z.object({
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
    .trim()
    .optional(),
});

export const updateAccommodationReviewSchema = z
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
  badgeType: z.enum(["normal", "verified"], {
    error: (issue) =>
      issue.input === undefined
        ? "Badge type is required"
        : "Badge type must be 'normal' or 'verified'",
  }),
});

export const adminBulkUpdateBadgeSchema = z.object({
  reviewIds: z.array(z.uuid("Invalid review ID")).min(1, "At least one review ID is required"),
  badgeType: z.enum(["normal", "verified"], {
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

export const reviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.uuid().optional(),
  badgeType: z.enum(["normal", "verified"]).optional(),
});

// ─── Params ───

export const propertyIdSchema = z.object({ propertyId: z.uuid("Invalid property ID") });
export const reviewIdSchema = z.object({ reviewId: z.uuid("Invalid review ID") });

// ─── Output Shaping (Views) ───

export const viewReviewUserSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
});

export const viewAccommodationReviewSchema = z.object({
  id: z.uuid(),
  propertyId: z.uuid(),
  userId: z.string().uuid().optional(), // Adding this to align with deal reviews if needed, or omit. I'll omit since it wasn't there before and UI might not need it, wait, let's include it for completeness
  rating: z.number().int(),
  comment: z.string().nullable(),
  badgeType: z.enum(["normal", "verified"]),
  isEdited: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  user: viewReviewUserSchema.nullish(),
});

export const starDistributionSchema = z.object({
  5: z.number(),
  4: z.number(),
  3: z.number(),
  2: z.number(),
  1: z.number(),
});

export const viewAccommodationReviewSummarySchema = z.object({
  averageRating: z.number(),
  totalReviews: z.number(),
  verifiedReviews: z.number(),
  starDistribution: starDistributionSchema,
});

export const paginatedReviewResponseSchema = z.object({
  items: z.array(viewAccommodationReviewSchema),
  summary: viewAccommodationReviewSummarySchema,
  nextCursor: z.uuid().nullable(),
});

export const reviewPreviewResponseSchema = z.object({
  reviews: z.array(viewAccommodationReviewSchema),
  summary: viewAccommodationReviewSummarySchema,
});

export const createUpdateReviewResponseSchema = z.object({
  review: viewAccommodationReviewSchema,
  summary: viewAccommodationReviewSummarySchema,
});

// ─── Type Exports ───

export type CreateAccommodationReviewDto = z.infer<typeof createAccommodationReviewSchema>;
export type UpdateAccommodationReviewDto = z.infer<typeof updateAccommodationReviewSchema>;
export type AdminUpdateReviewBadgeDto = z.infer<typeof adminUpdateReviewBadgeSchema>;
export type AdminBulkUpdateBadgeDto = z.infer<typeof adminBulkUpdateBadgeSchema>;
export type AdminBulkDeleteDto = z.infer<typeof adminBulkDeleteSchema>;
export type ReviewQueryDto = z.infer<typeof reviewQuerySchema>;

export type ViewAccommodationReviewDto = z.infer<typeof viewAccommodationReviewSchema>;
export type ViewAccommodationReviewSummaryDto = z.infer<typeof viewAccommodationReviewSummarySchema>;
export type StarDistributionDto = z.infer<typeof starDistributionSchema>;
export type PaginatedReviewResponseDto = z.infer<typeof paginatedReviewResponseSchema>;
export type ReviewPreviewResponseDto = z.infer<typeof reviewPreviewResponseSchema>;
export type CreateUpdateReviewResponseDto = z.infer<typeof createUpdateReviewResponseSchema>;
