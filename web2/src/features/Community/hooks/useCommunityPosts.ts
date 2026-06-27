import { useState, useEffect, useCallback } from 'react';
import { getPosts, createPost as createPostApi, toggleLikePost as toggleLikePostApi, deletePost as deletePostApi } from '../api/community.api';
import type { ICommunityPost } from '../types/community.types';
import type { CreatePostDto } from '../dtos/community.dtos';
import { useAuth } from '../../../context/useAuth';

interface UseCommunityPostsReturn {
  posts: ICommunityPost[];
  total: number;
  itemsPerPage: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  refetch: () => void;
  loadMore: () => void;
  createPost: (data: CreatePostDto) => Promise<boolean>;
  toggleLike: (id: string) => Promise<void>;
  deletePost: (id: string) => Promise<boolean>;
}

export const useCommunityPosts = (
  currentPageOrItemsPerPage = 1, 
  itemsPerPageOrSearchQuery: number | string = 5, 
  searchQueryOrTopic?: string, 
  topicOrMode?: string,
  modeArg: 'pagination' | 'infinite' = 'pagination'
): UseCommunityPostsReturn => {
  const { user } = useAuth();

  // Resolve signatures for backward compatibility
  // Signature A (standard pagination): useCommunityPosts(currentPage, itemsPerPage, searchQuery, topic)
  // Signature B (infinite scroll): useCommunityPosts(itemsPerPage, searchQuery, topic, modeArg)
  let itemsPerPage = 5;
  let searchQuery: string | undefined = undefined;
  let topic: string | undefined = undefined;
  let mode: 'pagination' | 'infinite' = 'pagination';
  let externalPage = 1;

  if (typeof topicOrMode === 'string' && (topicOrMode === 'pagination' || topicOrMode === 'infinite')) {
    // Signature B used
    itemsPerPage = typeof currentPageOrItemsPerPage === 'number' ? currentPageOrItemsPerPage : 5;
    searchQuery = typeof itemsPerPageOrSearchQuery === 'string' ? itemsPerPageOrSearchQuery : undefined;
    topic = searchQueryOrTopic;
    mode = topicOrMode as 'pagination' | 'infinite';
  } else if (modeArg === 'infinite') {
    // Alternate Signature B
    itemsPerPage = typeof currentPageOrItemsPerPage === 'number' ? currentPageOrItemsPerPage : 5;
    searchQuery = typeof itemsPerPageOrSearchQuery === 'string' ? itemsPerPageOrSearchQuery : undefined;
    topic = searchQueryOrTopic;
    mode = 'infinite';
  } else {
    // Signature A used
    externalPage = typeof currentPageOrItemsPerPage === 'number' ? currentPageOrItemsPerPage : 1;
    itemsPerPage = typeof itemsPerPageOrSearchQuery === 'number' ? itemsPerPageOrSearchQuery : 5;
    searchQuery = searchQueryOrTopic;
    topic = topicOrMode;
    mode = 'pagination';
  }

  const [posts, setPosts] = useState<ICommunityPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalPage, setInternalPage] = useState(1);

  // Reset internal page if filters change in infinite mode
  useEffect(() => {
    if (mode === 'infinite') {
      setInternalPage(1);
    }
  }, [searchQuery, topic, mode]);

  const activePage = mode === 'infinite' ? internalPage : externalPage;

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const res = await getPosts({
        skip: (activePage - 1) * itemsPerPage,
        take: itemsPerPage,
        search: searchQuery,
        topic: topic,
      });

      if (res.success) {
        const fetchedPosts = res.items || res.data || [];
        if (mode === 'infinite') {
          setPosts(prev => activePage === 1 ? fetchedPosts : [...prev, ...fetchedPosts]);
        } else {
          setPosts(fetchedPosts);
        }
        setTotal(res.total || 0);
      }
    } catch (err: unknown) {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      const fallbackMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(apiMessage || fallbackMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activePage, itemsPerPage, searchQuery, topic, mode]);

  // Execute fetch when activePage or parameters change
  useEffect(() => {
    const isLoadMore = mode === 'infinite' && activePage > 1;
    fetchPosts(isLoadMore);
  }, [fetchPosts, activePage, mode]);

  const loadMore = useCallback(() => {
    if (mode === 'infinite' && !loading && !loadingMore && posts.length < total) {
      setInternalPage(prev => prev + 1);
    }
  }, [mode, loading, loadingMore, posts.length, total]);

  const createPost = async (data: CreatePostDto) => {
    try {
      const res = await createPostApi(data);
      if (res.success) {
        if (mode === 'infinite') {
          setInternalPage(1);
        }
        await fetchPosts();
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error("Failed to create post", err);
      return false;
    }
  };

  const toggleLike = async (id: string) => {
    if (!user) {
      return;
    }

    try {
      // Optimistic update — use the isLiked boolean directly
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          const nowLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nowLiked,
            _count: {
              ...p._count,
              likes: nowLiked ? p._count.likes + 1 : Math.max(0, p._count.likes - 1)
            }
          };
        }
        return p;
      }));

      await toggleLikePostApi(id);
    } catch (err: unknown) {
      console.error("Failed to toggle like", err);
      // Revert optimistic update on failure
      setPosts(prev => prev.map(p => {
        if (p.id === id) {
          const reverted = !p.isLiked;
          return {
            ...p,
            isLiked: reverted,
            _count: {
              ...p._count,
              likes: reverted ? p._count.likes + 1 : Math.max(0, p._count.likes - 1)
            }
          };
        }
        return p;
      }));
    }
  };

  const deletePost = async (id: string) => {
    try {
      const res = await deletePostApi(id);
      if (res.success) {
        if (mode === 'infinite') {
          setInternalPage(1);
        }
        await fetchPosts();
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error("Failed to delete post", err);
      return false;
    }
  };

  return {
    posts,
    total,
    itemsPerPage,
    loading,
    loadingMore,
    error,
    hasMore: posts.length < total,
    page: activePage,
    refetch: () => fetchPosts(false),
    loadMore,
    createPost,
    toggleLike,
    deletePost,
  };
};
