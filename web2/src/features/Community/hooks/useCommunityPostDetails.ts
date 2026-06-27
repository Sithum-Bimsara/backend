import { useState, useEffect, useCallback } from 'react';
import { getPostById, getCommentsForPost, createComment as createCommentApi, toggleLikePost, toggleLikeComment } from '../api/community.api';
import type { ICommunityPost, ICommunityComment } from '../types/community.types';
import type { CreateCommentDto } from '../dtos/community.dtos';
import { useAuth } from '../../../context/useAuth';

interface UseCommunityPostDetailsReturn {
  post: ICommunityPost | null;
  comments: ICommunityComment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createComment: (data: CreateCommentDto) => Promise<boolean>;
  likePost: () => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
}

export const useCommunityPostDetails = (postId: string | undefined): UseCommunityPostDetailsReturn => {
  const [post, setPost] = useState<ICommunityPost | null>(null);
  const [comments, setComments] = useState<ICommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDetails = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      
      const [postRes, commentsRes] = await Promise.all([
        getPostById(postId),
        getCommentsForPost(postId)
      ]);

      if (postRes.success) {
        setPost(postRes.data);
      }
      if (commentsRes.success) {
        setComments(commentsRes.data || commentsRes.items || []);
      }
    } catch (err: unknown) {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      const fallbackMessage = err instanceof Error ? err.message : 'Failed to fetch post details';
      setError(apiMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const createComment = async (data: CreateCommentDto) => {
    if (!postId) return false;
    try {
      const res = await createCommentApi(postId, data);
      if (res.success) {
        setComments(prev => [res.data, ...prev]);
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments + 1 }
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to create comment", err);
      return false;
    }
  };

  const likePost = async () => {
    if (!postId || !post || !user) return;
    try {
      const nowLiked = !post.isLiked;
      setPost({
        ...post,
        isLiked: nowLiked,
        _count: {
          ...post._count,
          likes: nowLiked ? post._count.likes + 1 : Math.max(0, post._count.likes - 1)
        }
      });
      await toggleLikePost(postId);
    } catch (err: unknown) {
      console.error("Failed to toggle like", err);
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) return;

    try {
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          const nowLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nowLiked,
            _count: {
              ...c._count,
              likes: nowLiked ? c._count.likes + 1 : Math.max(0, c._count.likes - 1),
            },
          };
        }

        return c;
      }));
      await toggleLikeComment(commentId);
    } catch (err: unknown) {
      console.error("Failed to like comment", err);
    }
  };

  return { post, comments, loading, error, refetch: fetchDetails, createComment, likePost, likeComment };
};
