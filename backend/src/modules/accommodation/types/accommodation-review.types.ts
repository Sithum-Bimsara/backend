import { Prisma } from "@prisma/client";

/**
 * ─── Review Repository Select ───
 * Used by the repository to ensure we fetch all fields needed by the Service for DTO mapping.
 */
export const reviewSelect = {
  id: true,
  propertyId: true,
  rating: true,
  comment: true,
  badgeType: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.AccommodationReviewSelect;

export type ReviewRecord = Prisma.AccommodationReviewGetPayload<{
  select: typeof reviewSelect;
}>;

export interface RawReviewSummary {
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  starDistribution: Record<number, number>;
}
