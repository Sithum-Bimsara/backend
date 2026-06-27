import { NotFoundException } from "../../exceptions/not-found.exception";
import { ForbiddenException } from "../../exceptions/forbidden.exception";
import * as repository from "./community.repository";
import type {
  CreatePostDto,
  CreateCommentDto,
  UpdatePostDto,
  UpdateCommentDto,
  PostQueryDto,
  CommentQueryDto,
  ViewPostDto,
  ViewCommentDto,
  ViewReportedCommentDto,
  PaginatedPostResponseDto,
  PaginatedCommentResponseDto,
  ViewTopicDto
} from "./community.dto";
import {
  viewPostSchema,
  viewCommentSchema,
  viewReportedCommentSchema,
  paginatedPostResponseSchema,
  paginatedCommentResponseSchema,
  viewTopicSchema
} from "./community.dto";
import { supabase } from "../../config/supabase";
import { sendCommentNotificationEmail } from "../email/email.service";
import type { CommunityPostRecord, CommunityCommentRecord, CommunityReportedCommentRecord, CommunityPostWhereInput } from "./community.types";


// ─── Helpers ─────────────────────────────────────────────────────────────────

const deleteMediaFilesFromStorage = async (mediaUrls: string[]): Promise<void> => {
  if (!mediaUrls.length) return;

  const filePaths = mediaUrls
    .map((url) => {
      const match = url.match(/\/community-media\/(.+)$/);
      return match ? match[1] : null;
    })
    .filter((path): path is string => path !== null);

  if (!filePaths.length) return;

  try {
    const { error } = await supabase.storage.from("community-media").remove(filePaths);
    if (error) console.error("[community] storage delete error:", error.message);
  } catch (error) {
    console.error("[community] storage delete exception:", error);
  }
};

const mapPostToView = (post: CommunityPostRecord): ViewPostDto => {
  return viewPostSchema.parse({
    ...post,
    isLiked: (post.likes?.length ?? 0) > 0,
    isReported: (post.reports?.length ?? 0) > 0,
  });
};

const mapCommentToView = (comment: CommunityCommentRecord): ViewCommentDto => {
  return viewCommentSchema.parse({
    ...comment,
    isLiked: (comment.likes?.length ?? 0) > 0,
    isReported: (comment.reports?.length ?? 0) > 0,
  });
};

const mapReportedCommentToView = (comment: CommunityReportedCommentRecord): ViewReportedCommentDto => {
  return viewReportedCommentSchema.parse({
    ...comment,
    isLiked: (comment.likes?.length ?? 0) > 0,
    isReported: (comment.reports?.length ?? 0) > 0,
  });
};


// ─── Topic Services ──────────────────────────────────────────────────────────

export const getTopics = async (): Promise<ViewTopicDto[]> => {
  const topics = await repository.getTopics();
  return topics.map(t => viewTopicSchema.parse(t));
};

// ─── Post Services ───────────────────────────────────────────────────────────

export const createPost = async (userId: string, data: CreatePostDto): Promise<ViewPostDto> => {
  const post = await repository.createPost(userId, data);
  return mapPostToView(post);
};

export const getPosts = async (params: PostQueryDto & { userId?: string }): Promise<PaginatedPostResponseDto> => {
  const { items, nextCursor, total } = await repository.getPosts({
    ...params,
    currentUserId: params.userId
  });

  return paginatedPostResponseSchema.parse({
    items: items.map(mapPostToView),
    nextCursor,
    total,
  });
};

export const getPostById = async (id: string, userId?: string): Promise<ViewPostDto> => {
  const post = await repository.getPostById(id, userId);
  if (!post) throw new NotFoundException("Post not found");
  return mapPostToView(post);
};

export const updatePost = async (userId: string, postId: string, data: UpdatePostDto): Promise<ViewPostDto> => {
  const post = await repository.getPostById(postId);
  if (!post) throw new NotFoundException("Post not found");
  if (post.userId !== userId) throw new ForbiddenException("Not authorized to update this post");

  if (data.mediaUrls !== undefined) {
    const currentMedia = await repository.getPostMedia(postId);
    const currentUrls = currentMedia.map((m) => m.url);
    const urlsToDelete = currentUrls.filter(url => !data.mediaUrls?.includes(url));
    const urlsToAdd = (data.mediaUrls || []).filter(url => !currentUrls.includes(url));

    if (urlsToDelete.length > 0) {
      await deleteMediaFilesFromStorage(urlsToDelete);
      await repository.deleteMediaByUrl(urlsToDelete);
    }
    if (urlsToAdd.length > 0) {
      await repository.addMediaToPost(postId, urlsToAdd);
    }
  }

  const updatedPost = await repository.updatePost(postId, data);
  return mapPostToView(updatedPost);
};

export const deletePost = async (userId: string, postId: string) => {
  const post = await repository.getPostById(postId);
  if (!post) throw new NotFoundException("Post not found");
  if (post.userId !== userId) throw new ForbiddenException("Not authorized to delete this post");

  const postMedia = await repository.getPostMedia(postId);
  const commentsMedia = await repository.getAllCommentsMediaByPostId(postId);
  const allMediaUrls = [...postMedia.map(m => m.url), ...commentsMedia.map(m => m.url)];

  await deleteMediaFilesFromStorage(allMediaUrls);
  await repository.deletePost(postId);
  return { success: true };
};

export const toggleLikePost = async (userId: string, postId: string) => {
  const post = await repository.getPostById(postId);
  if (!post) throw new NotFoundException("Post not found");
  return repository.toggleLikePost(userId, postId);
};

export const reportPost = async (userId: string, postId: string) => {
  const post = await repository.getPostById(postId);
  if (!post) throw new NotFoundException("Post not found");
  return repository.reportPost(userId, postId);
};

// ─── Comment Services ────────────────────────────────────────────────────────

export const createComment = async (userId: string, postId: string, data: CreateCommentDto): Promise<ViewCommentDto> => {
  const postOwner = await repository.getPostOwnerInfo(postId);
  if (!postOwner) throw new NotFoundException("Post not found");

  const comment = await repository.createComment(userId, postId, data);

  if (postOwner.user.id !== userId && postOwner.user.email) {
    try {
      await sendCommentNotificationEmail({
        recipientEmail: postOwner.user.email,
        recipientName: postOwner.user.name,
        commenterName: comment.user?.name || "Someone",
        commentContent: comment.content,
        postId: postOwner.id,
        postPreview: postOwner.content,
      });
    } catch (error) {
      console.error("[community] failed to send email notification", error);
    }
  }

  return mapCommentToView(comment);
};

export const getCommentsByPostId = async (postId: string, params: CommentQueryDto & { userId?: string }): Promise<PaginatedCommentResponseDto> => {
  const { items, nextCursor } = await repository.getCommentsByPostId(postId, {
    ...params,
    currentUserId: params.userId
  });

  return paginatedCommentResponseSchema.parse({
    items: items.map(mapCommentToView),
    nextCursor,
  });
};

export const getRepliesByCommentId = async (commentId: string, params: CommentQueryDto & { userId?: string }): Promise<PaginatedCommentResponseDto> => {
  const { items, nextCursor } = await repository.getRepliesByCommentId(commentId, {
    ...params,
    currentUserId: params.userId
  });

  return paginatedCommentResponseSchema.parse({
    items: items.map(mapCommentToView),
    nextCursor,
  });
};

export const updateComment = async (userId: string, commentId: string, data: UpdateCommentDto): Promise<ViewCommentDto> => {
  const comment = await repository.getCommentById(commentId);
  if (!comment) throw new NotFoundException("Comment not found");
  if (comment.userId !== userId) throw new ForbiddenException("Not authorized to update this comment");

  if (data.mediaUrls !== undefined) {
    const currentMedia = await repository.getCommentMedia(commentId);
    const currentUrls = currentMedia.map((m) => m.url);
    const urlsToDelete = currentUrls.filter(url => !data.mediaUrls?.includes(url));
    const urlsToAdd = (data.mediaUrls || []).filter(url => !currentUrls.includes(url));

    if (urlsToDelete.length > 0) {
      await deleteMediaFilesFromStorage(urlsToDelete);
      await repository.deleteMediaByUrl(urlsToDelete);
    }
    if (urlsToAdd.length > 0) {
      await repository.addMediaToComment(commentId, urlsToAdd);
    }
  }

  const updatedComment = await repository.updateComment(commentId, data);
  return mapCommentToView(updatedComment);
};

export const deleteComment = async (userId: string, commentId: string) => {
  const comment = await repository.getCommentById(commentId);
  if (!comment) throw new NotFoundException("Comment not found");
  if (comment.userId !== userId) throw new ForbiddenException("Not authorized to delete this comment");

  const media = await repository.getCommentTreeMedia(commentId);
  await deleteMediaFilesFromStorage(media.map(m => m.url));
  await repository.deleteComment(commentId);
  return { success: true };
};

export const toggleLikeComment = async (userId: string, commentId: string) => {
  const comment = await repository.getCommentById(commentId);
  if (!comment) throw new NotFoundException("Comment not found");
  return repository.toggleLikeComment(userId, commentId);
};

export const reportComment = async (userId: string, commentId: string) => {
  const comment = await repository.getCommentById(commentId);
  if (!comment) throw new NotFoundException("Comment not found");
  return repository.reportComment(userId, commentId);
};




export const countCommunityPosts = async (where?: CommunityPostWhereInput): Promise<number> => {
  return repository.countCommunityPosts(where);
};



/**
 * Administrative action to delete post.
 */
export const deletePostAdmin = async (id: string) => {
  const post = await repository.getPostById(id);
  if (!post) throw new NotFoundException("Post not found");

  const postMedia = await repository.getPostMedia(id);
  const commentsMedia = await repository.getAllCommentsMediaByPostId(id);
  const allMediaUrls = [...postMedia.map(m => m.url), ...commentsMedia.map(m => m.url)];

  await deleteMediaFilesFromStorage(allMediaUrls);
  await repository.deletePost(id);
  return { success: true };
};

/**
 * Administrative action to delete comment.
 */
export const deleteCommentAdmin = async (commentId: string) => {
  const comment = await repository.getCommentById(commentId);
  if (!comment) throw new NotFoundException("Comment not found");

  const media = await repository.getCommentTreeMedia(commentId);
  await deleteMediaFilesFromStorage(media.map(m => m.url));
  await repository.deleteComment(commentId);
  return { success: true };
};

export const getReportedPostsAdmin = async (params: { limit: number; page: number }) => {
  const { items } = await repository.getReportedPostsAdmin(params);
  return { items: items.map(mapPostToView) };
};

export const getReportedCommentsAdmin = async (params: { limit: number; page: number }) => {
  const { items } = await repository.getReportedCommentsAdmin(params);
  return { items: items.map(mapReportedCommentToView) };
};

export const getPostsAdmin = async (params: { limit: number; page: number, reportFirst?: boolean, search?: string }) => {
  const { limit, page, reportFirst, search } = params;
  const { items, total } = await repository.getPosts({ take: limit, skip: (page - 1) * limit, limit, reportFirst: reportFirst ?? false, search });
  return { items: items.map(mapPostToView), total };
};

export const getCommentsByPostIdAdmin = async (postId: string, params: { limit: number; page: number, reportFirst?: boolean }) => {
  const { limit, page, reportFirst } = params;
  const { items } = await repository.getCommentsByPostIdAdmin(postId, { limit, page, reportFirst });
  return { items: items.map(mapCommentToView) };
};
