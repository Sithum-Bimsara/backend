import { api } from '../../../lib/api';
import type {
  IReview,
  IReviewSummary,
  IReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  AdminUpdateBadgeRequest,
  ReviewQueryParams,
  AdminBulkUpdateBadgeRequest,
  AdminBulkDeleteRequest,
} from '../types/reviews.types';

const BASE = '/deal-reviews';
const ACC_BASE = '/accommodation-reviews';

// ─── Public ───

export const getDealReviews = async (
  dealId: string,
  params?: ReviewQueryParams
): Promise<IReviewsResponse> => {
  const res = await api.get(`${BASE}/deal/${dealId}`, { params });
  return res.data;
};

export const getPropertyReviews = async (
  propertyId: string,
  params?: ReviewQueryParams
): Promise<IReviewsResponse> => {
  const res = await api.get(`${ACC_BASE}/property/${propertyId}`, { params });
  return res.data;
};

// ─── Traveller (auth required) ───

export const createReview = async (
  dealId: string,
  data: CreateReviewRequest
): Promise<{ success: boolean; data: { review: IReview; summary: IReviewSummary } }> => {
  const res = await api.post(`${BASE}/deal/${dealId}`, data);
  return res.data;
};

export const updateReview = async (
  reviewId: string,
  data: UpdateReviewRequest
): Promise<{ success: boolean; data: { review: IReview; summary: IReviewSummary } }> => {
  const res = await api.put(`${BASE}/${reviewId}`, data);
  return res.data;
};

export const createAccommodationReview = async (
  propertyId: string,
  data: CreateReviewRequest
): Promise<{ success: boolean; data: { review: IReview; summary: IReviewSummary } }> => {
  const res = await api.post(`${ACC_BASE}/property/${propertyId}`, data);
  return res.data;
};

export const updateAccommodationReview = async (
  reviewId: string,
  data: UpdateReviewRequest
): Promise<{ success: boolean; data: { review: IReview; summary: IReviewSummary } }> => {
  const res = await api.put(`${ACC_BASE}/${reviewId}`, data);
  return res.data;
};

export const deleteAccommodationReview = async (reviewId: string): Promise<void> => {
  await api.delete(`${ACC_BASE}/${reviewId}`);
};

// ─── Admin ───

export const getAdminDealReviews = async (
  dealId: string,
  params?: ReviewQueryParams
): Promise<IReviewsResponse> => {
  const res = await api.get(`${BASE}/admin/deal/${dealId}`, { params });
  return res.data;
};

export const adminDeleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`${BASE}/admin/${reviewId}`);
};

export const adminUpdateBadge = async (
  reviewId: string,
  data: AdminUpdateBadgeRequest
): Promise<{ success: boolean; data: IReview }> => {
  const res = await api.patch(`${BASE}/admin/${reviewId}/badge`, data);
  return res.data;
};

export const adminBulkUpdateBadge = async (
  data: AdminBulkUpdateBadgeRequest
): Promise<{ success: boolean; message: string }> => {
  const res = await api.patch(`${BASE}/admin/bulk-badge`, data);
  return res.data;
};

export const adminBulkDelete = async (
  data: AdminBulkDeleteRequest
): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`${BASE}/admin/bulk-delete`, { data });
  return res.data;
};
