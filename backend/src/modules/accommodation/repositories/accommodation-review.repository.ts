import { prisma } from "../../../config/prisma";
import { Prisma, DealReviewBadgeType as PrismaBadgeType } from "@prisma/client";
import { reviewSelect, ReviewRecord } from "../types/accommodation-review.types";
import { ReviewQueryDto } from "../dtos/accommodation-review.dtos";

// ─── Read ───

export const getReviewById = async (reviewId: string): Promise<ReviewRecord | null> => {
  return prisma.accommodationReview.findUnique({
    where: { id: reviewId },
    select: reviewSelect,
  });
};

export const findUserReviewForProperty = async (userId: string, propertyId: string): Promise<ReviewRecord | null> => {
  return prisma.accommodationReview.findUnique({
    where: { propertyId_userId: { propertyId, userId } },
    select: reviewSelect,
  });
};

export const findManyByProperty = async (
  propertyId: string,
  query: ReviewQueryDto
): Promise<{ items: ReviewRecord[]; nextCursor: string | null }> => {
  const { limit, cursor, badgeType } = query;

  const where: Prisma.AccommodationReviewWhereInput = {
    propertyId,
    ...(badgeType ? { badgeType: badgeType as PrismaBadgeType } : {}),
  };

  const items = await prisma.accommodationReview.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    select: reviewSelect,
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor };
};

// ─── Aggregates ───

export const getRatingSummary = async (propertyId: string) => {
  const [aggregates, verifiedCount, starCounts] = await Promise.all([
    prisma.accommodationReview.aggregate({
      where: { propertyId },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.accommodationReview.count({
      where: { propertyId, badgeType: "verified" },
    }),
    prisma.accommodationReview.groupBy({
      by: ["rating"],
      where: { propertyId },
      _count: { rating: true },
    }),
  ]);

  return { aggregates, verifiedCount, starCounts };
};

// ─── Write ───

export const createReview = async (
  input: { propertyId: string; userId: string; rating: number; comment?: string },
  badgeType: PrismaBadgeType
): Promise<ReviewRecord> => {
  return prisma.accommodationReview.create({
    data: {
      propertyId: input.propertyId,
      userId: input.userId,
      rating: input.rating,
      comment: input.comment,
      badgeType,
    },
    select: reviewSelect,
  });
};

export const updateReview = async (
  reviewId: string, 
  data: { rating?: number; comment?: string }
): Promise<ReviewRecord> => {
  return prisma.accommodationReview.update({
    where: { id: reviewId },
    data: {
      ...data,
      isEdited: true,
    },
    select: reviewSelect,
  });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await prisma.accommodationReview.delete({ where: { id: reviewId } });
};

export const adminUpdateBadge = async (
  reviewId: string,
  badgeType: PrismaBadgeType
): Promise<ReviewRecord> => {
  return prisma.accommodationReview.update({
    where: { id: reviewId },
    data: { badgeType },
    select: reviewSelect,
  });
};

export const adminBulkUpdateBadge = async (
  reviewIds: string[],
  badgeType: PrismaBadgeType
) => {
  return prisma.accommodationReview.updateMany({
    where: { id: { in: reviewIds } },
    data: { badgeType },
  });
};

export const adminBulkDelete = async (reviewIds: string[]) => {
  return prisma.accommodationReview.deleteMany({
    where: { id: { in: reviewIds } },
  });
};

// ─── Aggregate Recalculation ───

export const updatePropertyAggregatedRating = async (propertyId: string) => {
  const agg = await prisma.accommodationReview.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { id: true },
  });

  const rawAvg = agg._avg.rating ?? 0;
  const averageRating = Math.round(rawAvg * 10) / 10;
  const totalReviews = agg._count.id;

  return prisma.property.update({
    where: { id: propertyId },
    data: { averageRating, totalReviews },
    select: { id: true },
  });
};

// ─── Booking Check ───

export const hasVerifiedBooking = async (userId: string, propertyId: string): Promise<boolean> => {
  const booking = await prisma.accommodationBooking.findFirst({
    where: {
      userId,
      propertyId,
      status: "confirmed",
    },
    select: { id: true },
  });
  return booking !== null;
};

// ─── Featured (Homepage) ───

export const getFeaturedReviews = async (limit = 5): Promise<ReviewRecord[]> => {
  return prisma.accommodationReview.findMany({
    take: limit,
    select: reviewSelect,
    orderBy: { createdAt: "desc" },
  });
};
