import { prisma } from "../../../config/prisma";
import { Prisma, DealReviewBadgeType as PrismaBadgeType } from "@prisma/client";
import { ReviewRecord, reviewDetailedInclude } from "../types/deal-review.types";
import { CreateDealReviewDto, UpdateDealReviewDto, DealReviewQueryDto } from "../dtos/deal-review.dtos";

// ─── Read ───

export const getReviewById = async (reviewId: string): Promise<ReviewRecord | null> => {
  return prisma.dealReview.findUnique({
    where: { id: reviewId },
    include: reviewDetailedInclude,
  });
};

export const findUserReviewForDeal = async (userId: string, dealId: string): Promise<ReviewRecord | null> => {
  return prisma.dealReview.findUnique({
    where: { dealId_userId: { dealId, userId } },
    include: reviewDetailedInclude,
  });
};

export const getDealReviewsPaginated = async (
  dealId: string,
  params: DealReviewQueryDto
): Promise<{ items: ReviewRecord[]; nextCursor: string | null }> => {
  const { limit, cursor, badgeType } = params;

  const where: Prisma.DealReviewWhereInput = {
    dealId,
    ...(badgeType ? { badgeType } : {}),
  };

  const items = await prisma.dealReview.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: reviewDetailedInclude,
    orderBy: { createdAt: "desc" },
  });

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor };
};

export const getDealReviewsFirstPage = async (dealId: string, limit = 5): Promise<ReviewRecord[]> => {
  return prisma.dealReview.findMany({
    where: { dealId },
    take: limit,
    include: reviewDetailedInclude,
    orderBy: { createdAt: "desc" },
  });
};

// ─── Aggregates ───

export const getDealRatingSummary = async (dealId: string) => {
  const [aggregates, verifiedCount, starCounts] = await Promise.all([
    prisma.dealReview.aggregate({
      where: { dealId },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.dealReview.count({
      where: { dealId, badgeType: "verified" },
    }),
    prisma.dealReview.groupBy({
      by: ["rating"],
      where: { dealId },
      _count: { rating: true },
    }),
  ]);

  const starDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const row of starCounts) {
    if (row.rating >= 1 && row.rating <= 5) {
      starDistribution[row.rating] = row._count.rating;
    }
  }

  const rawAvg = aggregates._avg.rating ?? 0;
  const averageRating = Math.round(rawAvg * 10) / 10;
  const totalReviews = aggregates._count.id;

  return {
    averageRating,
    totalReviews,
    verifiedReviews: verifiedCount,
    starDistribution,
  };
};

export const updateDealAggregatedRating = async (dealId: string) => {
  const summary = await getDealRatingSummary(dealId);
  return prisma.deal.update({
    where: { id: dealId },
    data: { 
      averageRating: summary.averageRating, 
      totalReviews: summary.totalReviews 
    },
    select: { id: true, averageRating: true, totalReviews: true },
  });
};

// ─── Write ───

export const createReview = async (
  userId: string, 
  dealId: string, 
  data: CreateDealReviewDto, 
  badgeType: PrismaBadgeType
): Promise<ReviewRecord> => {
  return prisma.dealReview.create({
    data: {
      dealId,
      userId,
      rating: data.rating,
      comment: data.comment,
      badgeType,
    },
    include: reviewDetailedInclude,
  });
};

export const updateReview = async (reviewId: string, data: UpdateDealReviewDto): Promise<ReviewRecord> => {
  return prisma.dealReview.update({
    where: { id: reviewId },
    data: {
      ...(data.rating !== undefined ? { rating: data.rating } : {}),
      ...(data.comment !== undefined ? { comment: data.comment } : {}),
      isEdited: true,
    },
    include: reviewDetailedInclude,
  });
};

export const deleteReview = async (reviewId: string) => {
  return prisma.dealReview.delete({ where: { id: reviewId } });
};

export const adminUpdateBadge = async (
  reviewId: string,
  badgeType: PrismaBadgeType
): Promise<ReviewRecord> => {
  return prisma.dealReview.update({
    where: { id: reviewId },
    data: { badgeType },
    include: reviewDetailedInclude,
  });
};

export const adminBulkUpdateBadge = async (
  reviewIds: string[],
  badgeType: PrismaBadgeType
) => {
  return prisma.dealReview.updateMany({
    where: { id: { in: reviewIds } },
    data: { badgeType },
  });
};

export const adminBulkDelete = async (reviewIds: string[]) => {
  return prisma.dealReview.deleteMany({
    where: { id: { in: reviewIds } },
  });
};

// ─── Booking check ───

export const hasVerifiedBooking = async (
  userId: string,
  dealId: string
): Promise<boolean> => {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      dealId,
      paymentStatus: "paid",
    },
    select: { id: true },
  });
  return booking !== null;
};

export const getFeaturedReviews = async (limit = 5): Promise<ReviewRecord[]> => {
  return prisma.dealReview.findMany({
    take: limit,
    include: reviewDetailedInclude,
    orderBy: { createdAt: "desc" },
  });
};
