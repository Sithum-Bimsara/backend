import * as repo from "../repositories/deal-review.repository";
import { prisma } from "../../../config/prisma";
import {
  CreateDealReviewDto,
  UpdateDealReviewDto,
  AdminUpdateReviewBadgeDto,
  DealReviewQueryDto,
  AdminBulkUpdateBadgeDto,
  AdminBulkDeleteDto,
  CreateUpdateReviewResponseDto,
  ViewDealReviewDto,
  PaginatedDealReviewResponseDto,
  ReviewPreviewResponseDto,
  createUpdateReviewResponseSchema,
  viewDealReviewSchema,
  paginatedDealReviewResponseSchema,
  reviewPreviewResponseSchema
} from "../dtos/deal-review.dtos";
import { DealReviewBadgeType as PrismaBadgeType } from "@prisma/client";
import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import { ConflictException } from "../../../exceptions/conflict.exception";
import { ReviewRecord } from "../types/deal-review.types";

// ─── Helpers ───

const assertDealExists = async (dealId: string) => {
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, isActive: true },
    select: { id: true },
  });
  if (!deal) {
    throw new NotFoundException("Deal not found or is inactive");
  }
  return deal;
};

const assertReviewExists = async (reviewId: string): Promise<ReviewRecord> => {
  const review = await repo.getReviewById(reviewId);
  if (!review) {
    throw new NotFoundException("Review not found");
  }
  return review;
};

// ─── Public: get deal reviews ───

export const getDealReviews = async (dealId: string, params: DealReviewQueryDto): Promise<PaginatedDealReviewResponseDto> => {
  const [{ items, nextCursor }, summary] = await Promise.all([
    repo.getDealReviewsPaginated(dealId, params),
    repo.getDealRatingSummary(dealId),
  ]);

  return paginatedDealReviewResponseSchema.parse({
    items: items.map(item => viewDealReviewSchema.parse(item)),
    summary,
    nextCursor
  });
};

// ─── Traveller: create review ───

export const createReview = async (
  userId: string,
  dealId: string,
  dto: CreateDealReviewDto
): Promise<CreateUpdateReviewResponseDto> => {
  await assertDealExists(dealId);

  const existing = await repo.findUserReviewForDeal(userId, dealId);
  if (existing) {
    throw new ConflictException("You have already reviewed this deal");
  }

  const isVerified = await repo.hasVerifiedBooking(userId, dealId);
  const badgeType: PrismaBadgeType = isVerified ? "verified" : "normal";

  const review = await repo.createReview(userId, dealId, dto, badgeType);
  await repo.updateDealAggregatedRating(dealId);
  const summary = await repo.getDealRatingSummary(dealId);

  return createUpdateReviewResponseSchema.parse({
    review: viewDealReviewSchema.parse(review),
    summary
  });
};

// ─── Traveller: update own review ───

export const updateReview = async (
  userId: string,
  reviewId: string,
  dto: UpdateDealReviewDto
): Promise<CreateUpdateReviewResponseDto> => {
  const review = await assertReviewExists(reviewId);

  if (review.userId !== userId) {
    throw new UnauthorizedException("You are not authorised to edit this review");
  }

  const updated = await repo.updateReview(reviewId, dto);
  await repo.updateDealAggregatedRating(review.dealId);
  const summary = await repo.getDealRatingSummary(review.dealId);

  return createUpdateReviewResponseSchema.parse({
    review: viewDealReviewSchema.parse(updated),
    summary
  });
};

// ─── Admin: delete review ───

export const deleteReview = async (reviewId: string): Promise<void> => {
  const review = await assertReviewExists(reviewId);
  await repo.deleteReview(reviewId);
  await repo.updateDealAggregatedRating(review.dealId);
};

// ─── Admin: update badge type ───

export const adminUpdateBadge = async (
  reviewId: string,
  dto: AdminUpdateReviewBadgeDto
): Promise<ViewDealReviewDto> => {
  await assertReviewExists(reviewId);
  const review = await repo.adminUpdateBadge(reviewId, dto.badgeType as PrismaBadgeType);
  return viewDealReviewSchema.parse(review);
};

// ─── Admin: list reviews for a deal ───

export const getAdminDealReviews = async (dealId: string, params: DealReviewQueryDto): Promise<PaginatedDealReviewResponseDto> => {
  return getDealReviews(dealId, params);
};

// ─── Deal detail enrichment: summary + first page of reviews ───

export const getDealReviewsPreview = async (dealId: string): Promise<ReviewPreviewResponseDto> => {
  const [firstPage, summary] = await Promise.all([
    repo.getDealReviewsFirstPage(dealId, 5),
    repo.getDealRatingSummary(dealId),
  ]);

  return reviewPreviewResponseSchema.parse({
    reviews: firstPage.map(r => viewDealReviewSchema.parse(r)),
    summary
  });
};

export const getUserReviewForDeal = async (userId: string, dealId: string): Promise<ViewDealReviewDto | null> => {
  const review = await repo.findUserReviewForDeal(userId, dealId);
  if (!review) return null;
  return viewDealReviewSchema.parse(review);
};

// ─── Admin: bulk actions ───

export const adminBulkUpdateBadge = async (dto: AdminBulkUpdateBadgeDto): Promise<void> => {
  if (dto.reviewIds.length === 0) return;

  await repo.adminBulkUpdateBadge(dto.reviewIds, dto.badgeType as PrismaBadgeType);

  const firstReview = await repo.getReviewById(dto.reviewIds[0]);
  if (firstReview) {
    await repo.updateDealAggregatedRating(firstReview.dealId);
  }
};

export const adminBulkDelete = async (dto: AdminBulkDeleteDto): Promise<void> => {
  if (dto.reviewIds.length === 0) return;

  const firstReview = await repo.getReviewById(dto.reviewIds[0]);
  await repo.adminBulkDelete(dto.reviewIds);

  if (firstReview) {
    await repo.updateDealAggregatedRating(firstReview.dealId);
  }
};

export const getFeaturedReviews = async (limit = 5): Promise<ViewDealReviewDto[]> => {
  const reviews = await repo.getFeaturedReviews(limit);
  return reviews.map(r => viewDealReviewSchema.parse(r));
};
