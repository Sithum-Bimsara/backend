import { api } from "../../../lib/api";
import type {
  AdminDashboardResponse,
  AdminMerchantListItem,
  MerchantDetailsResponse,
  AdminUserListItem,
  AdminUserDetailsResponse,
  AdminDealRequestItem,
  AdminDealListItem,
  AdminDealDetail,
  PaginatedResponse,
  CursorPaginatedResponse,
  MerchantListQuery,
  UserListQuery,
  DealRequestListQuery,
  DealListQuery,
  UpdateDealAdminInput,
  UpdateVariantPriceInput,
} from "../types/admin.types";

import type { ICommunityPost, ICommunityComment, IReportedCommunityComment } from "../../Community/types/community.types";

const BASE = "/admin";

export const getAdminDashboard = async (params?: { startDate?: string; endDate?: string }): Promise<{ success: boolean; data: AdminDashboardResponse }> => {
  const res = await api.get(`${BASE}/dashboard`, { params });
  return res.data;
};

export const getMerchants = async (
  params?: MerchantListQuery
): Promise<{ success: boolean } & PaginatedResponse<AdminMerchantListItem>> => {
  const res = await api.get(`${BASE}/merchants`, { params });
  return res.data;
};

export const verifyMerchant = async (id: string) => {
  const res = await api.patch(`${BASE}/merchants/${id}/verify`);
  return res.data;
};

export const unverifyMerchant = async (id: string) => {
  const res = await api.patch(`${BASE}/merchants/${id}/unverify`);
  return res.data;
};

export const getMerchantDetails = async (
  id: string,
  params?: { startDate?: string; endDate?: string }
): Promise<{ success: boolean; data: MerchantDetailsResponse }> => {
  const res = await api.get(`${BASE}/merchants/${id}/details`, { params });
  return res.data;
};



export const getAdminDeals = async (
  merchantId: string,
  params?: Omit<DealListQuery, "merchantId">
): Promise<{ success: boolean } & CursorPaginatedResponse<AdminDealListItem>> => {
  const res = await api.get(`${BASE}/merchants/${merchantId}/deals`, { params });
  return res.data;
};

export const getAdminDealDetail = async (
  dealId: string
): Promise<{ success: boolean; data: AdminDealDetail }> => {
  const res = await api.get(`${BASE}/deals/${dealId}`);
  return res.data;
};

export const updateDealAdmin = async (
  dealId: string,
  payload: UpdateDealAdminInput
): Promise<{ success: boolean; data: any }> => {
  const res = await api.patch(`${BASE}/deals/${dealId}`, payload);
  return res.data;
};

export const updateVariantPrice = async (
  variantId: string,
  payload: UpdateVariantPriceInput
): Promise<{ success: boolean; data: any }> => {
  const res = await api.patch(`${BASE}/variants/${variantId}/price`, payload);
  return res.data;
};

export const getUsers = async (
  params?: UserListQuery
): Promise<{ success: boolean } & PaginatedResponse<AdminUserListItem>> => {
  const res = await api.get(`${BASE}/users`, { params });
  return res.data;
};

export const getUserDetails = async (
  id: string
): Promise<{ success: boolean; data: AdminUserDetailsResponse }> => {
  const res = await api.get(`${BASE}/users/${id}/details`);
  return res.data;
};

export const suspendUser = async (id: string) => {
  const res = await api.patch(`${BASE}/users/${id}/suspend`);
  return res.data;
};

export const activateUser = async (id: string) => {
  const res = await api.patch(`${BASE}/users/${id}/activate`);
  return res.data;
};

export const getDealRequests = async (
  params?: DealRequestListQuery
): Promise<{ success: boolean } & PaginatedResponse<AdminDealRequestItem>> => {
  const res = await api.get(`${BASE}/deal-requests`, { params });
  return res.data;
};

export const markDealRequestContacted = async (id: string) => {
  const res = await api.patch(`${BASE}/deal-requests/${id}/status`, { status: "contacted" });
  return res.data;
};

export const markDealRequestClosed = async (id: string) => {
  const res = await api.patch(`${BASE}/deal-requests/${id}/status`, { status: "closed" });
  return res.data;
};

export const deleteCommunityPost = async (id: string) => {
  const res = await api.delete(`${BASE}/community/posts/${id}`);
  return res.data;
};

export const deleteCommunityComment = async (id: string) => {
  const res = await api.delete(`${BASE}/community/comments/${id}`);
  return res.data;
};

export const getModerationPosts = async (params: { page: number; limit: number; reportFirst?: boolean; search?: string }) => {
  const res = await api.get<{ success: boolean; data: ICommunityPost[]; total?: number; page: number; limit: number }>(`${BASE}/moderation/posts`, { params });
  return res.data;
};

export const getModerationReportedPosts = async (params: { page: number; limit: number }) => {
  const res = await api.get<{ success: boolean; data: ICommunityPost[]; page: number; limit: number }>(`${BASE}/moderation/reported-posts`, { params });
  return res.data;
};

export const getModerationReportedComments = async (params: { page: number; limit: number }) => {
  const res = await api.get<{ success: boolean; data: IReportedCommunityComment[]; page: number; limit: number }>(`${BASE}/moderation/reported-comments`, { params });
  return res.data;
};

export const getModerationCommentsForPost = async (postId: string, params: { page: number; limit: number; reportFirst?: boolean }) => {
  const res = await api.get<{ success: boolean; data: ICommunityComment[]; page: number; limit: number }>(`${BASE}/moderation/posts/${postId}/comments`, { params });
  return res.data;
};
