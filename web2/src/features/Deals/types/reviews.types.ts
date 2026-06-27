// ─── Badge type ───

export type ReviewBadgeType = "normal" | "verified";

// ─── Single review item (matches backend ReviewItem) ───

export interface IReviewUser {
  id: string;
  name: string;
}

export interface IReview {
  id: string;
  dealId?: string;
  propertyId?: string;
  rating: number;
  comment: string | null;
  badgeType: ReviewBadgeType;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: IReviewUser;
}

// ─── Star distribution ───

export interface IStarDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

// ─── Rating summary (embedded in deal detail + standalone endpoint) ───

export interface IReviewSummary {
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  starDistribution: IStarDistribution;
}

// ─── Reviews preview embedded in deal detail response ───

export interface IReviewsPreview {
  reviews: IReview[];
  summary: IReviewSummary;
}

// ─── Paginated reviews response ───

export interface IReviewsResponse {
  success: boolean;
  data: IReview[];
  total: number;
  page: number;
  limit: number;
  summary: IReviewSummary;
}

// ─── Request DTOs ───

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface AdminUpdateBadgeRequest {
  badgeType: ReviewBadgeType;
}

// ─── Query params ───

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  badgeType?: ReviewBadgeType;
}

export interface AdminBulkUpdateBadgeRequest {
  reviewIds: string[];
  badgeType: ReviewBadgeType;
}

export interface AdminBulkDeleteRequest {
  reviewIds: string[];
}
