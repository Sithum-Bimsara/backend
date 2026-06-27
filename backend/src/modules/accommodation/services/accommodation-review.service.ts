import * as repo from "../repositories/accommodation-review.repository";
import { prisma } from "../../../config/prisma";
import { DealReviewBadgeType as PrismaBadgeType } from "@prisma/client";
import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import { BadRequestException } from "../../../exceptions/bad-request.exception";
import { 
  viewAccommodationReviewSchema, 
  viewAccommodationReviewSummarySchema,
  ReviewQueryDto,
  CreateAccommodationReviewDto,
  UpdateAccommodationReviewDto,
  ViewAccommodationReviewDto,
  ViewAccommodationReviewSummaryDto,
  PaginatedReviewResponseDto,
  ReviewPreviewResponseDto,
  CreateUpdateReviewResponseDto,
  createUpdateReviewResponseSchema,
  reviewPreviewResponseSchema,
  AdminUpdateReviewBadgeDto,
  AdminBulkUpdateBadgeDto,
  AdminBulkDeleteDto
} from "../dtos/accommodation-review.dtos";

// ─── Helpers ───

const assertPropertyExists = async (propertyId: string) => {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, isActive: true },
    select: { id: true },
  });
  if (!property) {
    throw new NotFoundException("Property not found or is inactive");
  }
  return property;
};

const assertReviewExists = async (reviewId: string) => {
  const review = await repo.getReviewById(reviewId);
  if (!review) {
    throw new NotFoundException("Review not found");
  }
  return review;
};

interface RawSummaryData {
  aggregates: {
    _avg: { rating: number | null };
    _count: { id: number };
  };
  verifiedCount: number;
  starCounts: {
    rating: number;
    _count: { rating: number };
  }[];
}

const mapSummary = (raw: RawSummaryData) => {
  const { aggregates, verifiedCount, starCounts } = raw;
  const starDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const row of starCounts) {
    if (row.rating >= 1 && row.rating <= 5) {
      starDistribution[row.rating] = row._count.rating;
    }
  }
  const rawAvg = aggregates._avg.rating ?? 0;
  const averageRating = Math.round(rawAvg * 10) / 10;

  return viewAccommodationReviewSummarySchema.parse({
    averageRating,
    totalReviews: aggregates._count.id,
    verifiedReviews: verifiedCount,
    starDistribution,
  });
};

// ─── Public ───

export const getPropertyReviews = async (
  propertyId: string, 
  query: ReviewQueryDto
): Promise<PaginatedReviewResponseDto> => {
  const [result, rawSummary] = await Promise.all([
    repo.findManyByProperty(propertyId, query),
    repo.getRatingSummary(propertyId),
  ]);

  const items = result.items.map((item) => viewAccommodationReviewSchema.parse(item));
  const summary = mapSummary(rawSummary);

  return {
    items,
    nextCursor: result.nextCursor,
    summary,
  };
};

export const getPropertyReviewsPreview = async (propertyId: string): Promise<ReviewPreviewResponseDto> => {
  const [result, rawSummary] = await Promise.all([
    repo.findManyByProperty(propertyId, { limit: 5 }),
    repo.getRatingSummary(propertyId),
  ]);

  const reviews = result.items.map((item) => viewAccommodationReviewSchema.parse(item));
  const summary = mapSummary(rawSummary);

  return reviewPreviewResponseSchema.parse({ reviews, summary });
};

// ─── Traveller ───

export const createReview = async (
  userId: string,
  propertyId: string,
  dto: CreateAccommodationReviewDto
): Promise<CreateUpdateReviewResponseDto> => {
  await assertPropertyExists(propertyId);

  const existing = await repo.findUserReviewForProperty(userId, propertyId);
  if (existing) {
    throw new BadRequestException("You have already reviewed this property");
  }

  const isVerified = await repo.hasVerifiedBooking(userId, propertyId);
  const badgeType: PrismaBadgeType = isVerified ? "verified" : "normal";

  const reviewRecord = await repo.createReview(
    { propertyId, userId, rating: dto.rating, comment: dto.comment },
    badgeType
  );

  await repo.updatePropertyAggregatedRating(propertyId);
  const rawSummary = await repo.getRatingSummary(propertyId);

  return createUpdateReviewResponseSchema.parse({
    review: viewAccommodationReviewSchema.parse(reviewRecord),
    summary: mapSummary(rawSummary),
  });
};

export const updateReview = async (
  userId: string,
  reviewId: string,
  dto: UpdateAccommodationReviewDto
): Promise<CreateUpdateReviewResponseDto> => {
  const review = await assertReviewExists(reviewId);

  if (review.user.id !== userId) {
    throw new UnauthorizedException("You are not authorised to edit this review");
  }

  const updatedRecord = await repo.updateReview(reviewId, dto);
  await repo.updatePropertyAggregatedRating(review.propertyId);
  const rawSummary = await repo.getRatingSummary(review.propertyId);

  return createUpdateReviewResponseSchema.parse({
    review: viewAccommodationReviewSchema.parse(updatedRecord),
    summary: mapSummary(rawSummary),
  });
};

export const deleteReview = async (userId: string, reviewId: string): Promise<void> => {
  const review = await assertReviewExists(reviewId);

  if (review.user.id !== userId) {
    throw new UnauthorizedException("You are not authorised to delete this review");
  }

  await repo.deleteReview(reviewId);
  await repo.updatePropertyAggregatedRating(review.propertyId);
};

export const getUserReviewForProperty = async (userId: string, propertyId: string): Promise<ViewAccommodationReviewDto | null> => {
  const record = await repo.findUserReviewForProperty(userId, propertyId);
  return record ? viewAccommodationReviewSchema.parse(record) : null;
};

// ─── Admin ───

export const getAdminPropertyReviews = async (propertyId: string, query: ReviewQueryDto): Promise<PaginatedReviewResponseDto> => {
  return getPropertyReviews(propertyId, query);
};

export const adminUpdateBadge = async (
  reviewId: string,
  dto: AdminUpdateReviewBadgeDto
): Promise<ViewAccommodationReviewDto> => {
  await assertReviewExists(reviewId);
  const updatedRecord = await repo.adminUpdateBadge(reviewId, dto.badgeType as PrismaBadgeType);
  return viewAccommodationReviewSchema.parse(updatedRecord);
};

export const adminBulkUpdateBadge = async (dto: AdminBulkUpdateBadgeDto): Promise<void> => {
  if (dto.reviewIds.length === 0) return;
  
  await repo.adminBulkUpdateBadge(dto.reviewIds, dto.badgeType as PrismaBadgeType);
  
  const firstReview = await repo.getReviewById(dto.reviewIds[0]);
  if (firstReview) {
    await repo.updatePropertyAggregatedRating(firstReview.propertyId);
  }
};

export const adminBulkDelete = async (dto: AdminBulkDeleteDto): Promise<void> => {
  if (dto.reviewIds.length === 0) return;

  const firstReview = await repo.getReviewById(dto.reviewIds[0]);
  await repo.adminBulkDelete(dto.reviewIds);

  if (firstReview) {
    await repo.updatePropertyAggregatedRating(firstReview.propertyId);
  }
};

export const adminDeleteReview = async (reviewId: string): Promise<void> => {
  const review = await assertReviewExists(reviewId);
  await repo.deleteReview(reviewId);
  await repo.updatePropertyAggregatedRating(review.propertyId);
};

// ─── Featured (Homepage) ───

export const getFeaturedReviews = async (limit = 5): Promise<ViewAccommodationReviewDto[]> => {
  const records = await repo.getFeaturedReviews(limit);
  return records.map((r) => viewAccommodationReviewSchema.parse(r));
};
