import { api } from "../../../lib/api";
import type { CreatePostDto, CreateCommentDto, GetCommunityPostsParamsDto } from "../dtos/community.dtos";
import type { ICommunityPost, ICommunityComment, IReportedCommunityComment, IPaginatedResponse } from "../types/community.types";

const BASE = "/community";

// ─── Posts ───

export const getPosts = async (params?: GetCommunityPostsParamsDto): Promise<IPaginatedResponse<ICommunityPost>> => {
  const res = await api.get(`${BASE}/posts`, { params });
  return res.data;
};

export const getTopics = async (): Promise<{ success: boolean; data: { topic: string; count: number }[] }> => {
  const res = await api.get(`${BASE}/topics`);
  return res.data;
};

export const getPostById = async (id: string): Promise<{ success: boolean; data: ICommunityPost }> => {
  const res = await api.get(`${BASE}/posts/${id}`);
  return res.data;
};

export const createPost = async (data: CreatePostDto): Promise<{ success: boolean; data: ICommunityPost }> => {
  const res = await api.post(`${BASE}/posts`, data);
  return res.data;
};

export const updatePost = async (id: string, data: { content?: string; mediaUrls?: string[] }): Promise<{ success: boolean; data: ICommunityPost }> => {
  const res = await api.patch(`${BASE}/posts/${id}`, data);
  return res.data;
};

export const toggleLikePost = async (id: string): Promise<{ success: boolean; data: { liked: boolean } }> => {
  const res = await api.post(`${BASE}/posts/${id}/like`);
  return res.data;
};

export const deletePost = async (id: string): Promise<{ success: boolean }> => {
  const res = await api.delete(`${BASE}/posts/${id}`);
  return res.data;
};

export const reportPost = async (id: string): Promise<{ success: boolean; data: { reported: boolean; alreadyReported: boolean; reportCount: number } }> => {
  const res = await api.post(`${BASE}/posts/${id}/report`);
  return res.data;
};

// ─── Comments ───

export const getCommentsForPost = async (
  postId: string, 
  params?: GetCommunityPostsParamsDto
): Promise<IPaginatedResponse<ICommunityComment>> => {
  const res = await api.get(`${BASE}/posts/${postId}/comments`, { params });
  return res.data;
};

export const createComment = async (
  postId: string, 
  data: CreateCommentDto
): Promise<{ success: boolean; data: ICommunityComment }> => {
  const res = await api.post(`${BASE}/posts/${postId}/comments`, data);
  return res.data;
};

export const updateComment = async (id: string, data: { content?: string; mediaUrls?: string[] }): Promise<{ success: boolean; data: ICommunityComment }> => {
  const res = await api.patch(`${BASE}/comments/${id}`, data);
  return res.data;
};

export const toggleLikeComment = async (commentId: string): Promise<{ success: boolean; data: { liked: boolean; likeCount: number } }> => {
  const res = await api.post(`${BASE}/comments/${commentId}/like`);
  return res.data;
};

export const deleteComment = async (commentId: string): Promise<{ success: boolean }> => {
  const res = await api.delete(`${BASE}/comments/${commentId}`);
  return res.data;
};

export const reportComment = async (commentId: string): Promise<{ success: boolean; data: { reported: boolean; alreadyReported: boolean; reportCount: number } }> => {
  const res = await api.post(`${BASE}/comments/${commentId}/report`);
  return res.data;
};

export const getCommentReplies = async (
  commentId: string, 
  params?: GetCommunityPostsParamsDto
): Promise<IPaginatedResponse<ICommunityComment>> => {
  const res = await api.get(`${BASE}/comments/${commentId}/replies`, { params });
  return res.data;
};

export const getReportedPosts = async (params?: GetCommunityPostsParamsDto): Promise<IPaginatedResponse<ICommunityPost>> => {
  const res = await api.get(`${BASE}/reported/posts`, { params });
  return res.data;
};

export const getReportedComments = async (params?: GetCommunityPostsParamsDto): Promise<IPaginatedResponse<IReportedCommunityComment>> => {
  const res = await api.get(`${BASE}/reported/comments`, { params });
  return res.data;
};
