import { useState, useCallback } from "react";
import {
  getModerationPosts,
  getModerationReportedPosts,
  getModerationReportedComments,
  getModerationCommentsForPost,
  deleteCommunityPost,
  deleteCommunityComment,
} from "../api/api";
import type { ICommunityPost, ICommunityComment, IReportedCommunityComment } from "../../Community/types/community.types";
import { getCommentReplies } from "../../Community/api/community.api";

export const useAdminModeration = () => {
  const [reportedPosts, setReportedPosts] = useState<ICommunityPost[]>([]);
  const [reportedComments, setReportedComments] = useState<IReportedCommunityComment[]>([]);
  const [posts, setPosts] = useState<ICommunityPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<ICommunityComment[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModerationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportedPostsRes, reportedCommentsRes, postsRes] = await Promise.all([
        getModerationReportedPosts({ page: 1, limit: 50 }),
        getModerationReportedComments({ page: 1, limit: 50 }),
        getModerationPosts({ page: 1, limit: 50, reportFirst: true }),
      ]);

      if (reportedPostsRes.success) setReportedPosts(reportedPostsRes.data);
      if (reportedCommentsRes.success) setReportedComments(reportedCommentsRes.data);
      if (postsRes.success) setPosts(postsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load moderation data");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPosts = useCallback(async (query: string) => {
    try {
      setError(null);
      const res = await getModerationPosts({ page: 1, limit: 50, reportFirst: true, search: query });
      if (res.success) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error("Failed to search posts", err);
    }
  }, []);

  const loadCommentReplies = useCallback(async (commentId: string) => {
    try {
      const res = await getCommentReplies(commentId, { skip: 0, take: 100 });
      if (res.success) {
        return res.data || res.items || [];
      }
    } catch (err) {
      console.error("Failed to load comment replies", err);
    }
    return [];
  }, []);

  const loadComments = useCallback(async (postId: string) => {
    setSelectedPostId(postId);
    setSelectedPostComments([]);
    setLoadingComments(true);
    try {
      const res = await getModerationCommentsForPost(postId, { page: 1, limit: 50, reportFirst: true });
      if (res.success) {
        setSelectedPostComments(res.data);
      }
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const removePost = useCallback(async (id: string) => {
    try {
      await deleteCommunityPost(id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setReportedPosts((prev) => prev.filter((post) => post.id !== id));

      if (selectedPostId === id) {
        setSelectedPostId(null);
        setSelectedPostComments([]);
      }
    } catch (err) {
      console.error("Failed to remove post", err);
      throw err;
    }
  }, [selectedPostId]);

  const removeComment = useCallback(async (id: string) => {
    try {
      await deleteCommunityComment(id);
      setSelectedPostComments((prev) => prev.filter((comment) => comment.id !== id));
      setReportedComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (err) {
      console.error("Failed to remove comment", err);
      throw err;
    }
  }, []);

  return {
    data: {
      reportedPosts,
      reportedComments,
      posts,
      selectedPostId,
      selectedPostComments,
      loadingComments,
    },
    loading,
    error,
    actions: {
      loadModerationData,
      loadComments,
      removePost,
      removeComment,
      searchPosts,
      loadCommentReplies,
    },
  };
};
