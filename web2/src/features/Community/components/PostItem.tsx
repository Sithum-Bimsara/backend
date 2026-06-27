import React, { useState, useEffect, useRef } from 'react';
import type { ICommunityPost, ICommunityComment, IUserAuthor } from '../types/community.types';
import { getCommentsForPost, createComment as createCommentApi, toggleLikeComment, deleteComment as deleteCommentApi, updatePost as updatePostApi, updateComment as updateCommentApi, reportPost as reportPostApi, reportComment as reportCommentApi } from '../api/community.api';
import { useAuth } from '../../../context/useAuth';
import { formatLocalDate } from '../../../lib/date-utils';
import { uploadCommunityImageToStorage } from '../utils/community-image-upload';
import { PostMediaGallery } from './PostMediaGallery';
import { UserConfirmModal } from '../../../components/UserUI';
import { AuthPromptModal } from './AuthPromptModal';
import { UnauthorizedActionModal } from './UnauthorizedActionModal';
import { createPortal } from 'react-dom';
import { PostCommentsFooter } from './PostCommentsFooter';
import { PostCommentsHeader } from './PostCommentsHeader';
import { PostCommentsList } from './PostCommentsList';

// Simple timeAgo formatter
const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `Just now`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return formatLocalDate(dateStr);
};



interface PostItemProps {
  post: ICommunityPost;
  onToggleLike: (id: string) => void;
  onDeletePost?: (id: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post: initialPost, onToggleLike, onDeletePost }) => {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<ICommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentMediaUrls, setCommentMediaUrls] = useState<string[]>([]);
  const [commentMediaLoading, setCommentMediaLoading] = useState(false);
  const [, setCommentMediaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState<ICommunityComment | null>(null);
  const [latestReply, setLatestReply] = useState<{ parentId: string; reply: ICommunityComment } | null>(null);
  const [latestUpdatedComment, setLatestUpdatedComment] = useState<ICommunityComment | null>(null);
  const [latestLikedComment, setLatestLikedComment] = useState<{ id: string; liked: boolean; count: number } | null>(null);
  const [latestReportedComment, setLatestReportedComment] = useState<{ id: string; count: number } | null>(null);
  const [latestDeletedCommentId, setLatestDeletedCommentId] = useState<string | null>(null);
  
  // Edit modal states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostMedia, setEditPostMedia] = useState<string[]>([]);
  const [editPostLoading, setEditPostLoading] = useState(false);
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editCommentMediaUrls, setEditCommentMediaUrls] = useState<string[]>([]);
  const [editCommentMediaLoading, setEditCommentMediaLoading] = useState(false);
  const [editCommentLoading, setEditCommentLoading] = useState(false);
  
  const [deletePrompt, setDeletePrompt] = useState<{
    type: 'post' | 'comment';
    id: string;
    title: string;
    message: string;
  } | null>(null);
  const [deletePromptBusy, setDeletePromptBusy] = useState(false);
  const [reportPrompt, setReportPrompt] = useState<{
    type: 'post' | 'comment';
    id: string;
    title: string;
    message: string;
  } | null>(null);
  const [reportPromptBusy, setReportPromptBusy] = useState(false);

  // Auth Modal States
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState('');
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [unauthorizedAction, setUnauthorizedAction] = useState<'edit' | 'delete'>('edit');
  const [unauthorizedType, setUnauthorizedType] = useState<'post' | 'comment'>('post');

  // Sync prop changes (like toggling likes from parent) to local state, 
  // but be careful not to overwrite the local comments count if it updated.
  // Using the "update state during render" pattern instead of an effect to avoid cascading renders.
  const [prevInitialPost, setPrevInitialPost] = useState(initialPost);
  if (initialPost !== prevInitialPost) {
    setPrevInitialPost(initialPost);
    setPost((prev: ICommunityPost) => ({
      ...initialPost,
      isReported: prev.isReported ? prev.isReported : initialPost.isReported,
      _count: {
        ...initialPost._count,
        comments: prev._count.comments > initialPost._count.comments ? prev._count.comments : initialPost._count.comments
      }
    }));
  }

  const loadComments = async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoadingComments(true);
      setComments([]); // Clear existing on initial load
    }

    try {
      const skip = isLoadMore ? comments.length : 0;
      const take = 10;
      const res = await getCommentsForPost(post.id, { skip, take });
      
      if (res.success) {
        const fetchedData = res.data || res.items || [];
        if (isLoadMore) {
          setComments((prev) => [...prev, ...fetchedData]);
        } else {
          setComments(fetchedData);
        }
        // If we got fewer than 'take', there's no more to load
        setHasMoreComments(fetchedData.length === take);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
      setIsLoadingMore(false);
    }
  };

  const handleExpand = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      await loadComments();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      setAuthPromptAction('create a reply in this discussion');
      setShowAuthPrompt(true);
      return;
    }
    
    if (!newComment.trim() || commentMediaLoading) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        content: newComment,
        mediaUrls: commentMediaUrls.length > 0 ? commentMediaUrls : undefined,
        parentId: replyingToComment?.id || undefined,
      };
      
      const res = await createCommentApi(post.id, payload);
      
      if (res.success) {
        if (replyingToComment) {
          // It's a reply, send a signal to the specific CommentItem to add it
          setLatestReply({ parentId: replyingToComment.id, reply: res.data });
        } else {
          // It's a top-level comment, add to main list
          setComments((prev: ICommunityComment[]) => [res.data, ...prev]);
        }
        
        setNewComment('');
        setCommentMediaUrls([]);
        setCommentMediaError(null);
        setReplyingToComment(null);
        setPost((prev: ICommunityPost) => ({
          ...prev,
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1
          }
        }));
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleCommentMediaSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files).slice(0, 4 - commentMediaUrls.length);
    if (selectedFiles.length === 0) return;

    setCommentMediaLoading(true);
    setCommentMediaError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await uploadCommunityImageToStorage(file, 'community-comment');
        uploadedUrls.push(url);
      }

      setCommentMediaUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      setCommentMediaError(error instanceof Error ? error.message : 'Failed to upload image.');
    } finally {
      setCommentMediaLoading(false);
    }
  };

  const removeCommentMedia = (index: number) => {
    setCommentMediaUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      setAuthPromptAction('like this reply');
      setShowAuthPrompt(true);
      return;
    }

    try {
      setComments((prev: ICommunityComment[]) =>
        prev.map((c: ICommunityComment) => {
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
        })
      );
      const res = await toggleLikeComment(commentId);
      if (res.success) {
        setLatestLikedComment({ 
          id: commentId, 
          liked: res.data.liked, 
          count: res.data.likeCount 
        });
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    // Check if user is logged in
    if (!user) {
      setAuthPromptAction('delete this post');
      setShowAuthPrompt(true);
      return;
    }

    // Check if user is the creator
    if (user.id !== post.userId) {
      setUnauthorizedAction('delete');
      setUnauthorizedType('post');
      setShowUnauthorizedModal(true);
      return;
    }

    setDeletePrompt({
      type: 'post',
      id: post.id,
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This will also remove related comments and media.',
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    // Check if user is logged in
    if (!user) {
      setAuthPromptAction('delete this reply');
      setShowAuthPrompt(true);
      return;
    }

    // Find the comment to check ownership
    const comment = comments.find(c => c.id === commentId);
    if (comment && user.id !== comment.userId) {
      setUnauthorizedAction('delete');
      setUnauthorizedType('comment');
      setShowUnauthorizedModal(true);
      return;
    }

    setDeletePrompt({
      type: 'comment',
      id: commentId,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this reply?',
    });
  };

  const handleReplyToComment = (comment: ICommunityComment) => {
    if (!user) {
      setAuthPromptAction('reply to this comment');
      setShowAuthPrompt(true);
      return;
    }
    setReplyingToComment(comment);
    // Focus the input
    const input = document.getElementById(`comment-input-${post.id}`) as HTMLTextAreaElement;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cancelReply = () => {
    setReplyingToComment(null);
  };

  const confirmDelete = async () => {
    if (!deletePrompt) return;

    setDeletePromptBusy(true);
    try {
      if (deletePrompt.type === 'post') {
        if (onDeletePost) {
          await onDeletePost(deletePrompt.id);
        }
      } else {
        const res = await deleteCommentApi(deletePrompt.id);
        if (res.success) {
          setComments((prev: ICommunityComment[]) => prev.filter((c: ICommunityComment) => c.id !== deletePrompt.id));
          setLatestDeletedCommentId(deletePrompt.id);
          setPost((prev: ICommunityPost) => ({
            ...prev,
            _count: {
              ...prev._count,
              comments: Math.max(0, prev._count.comments - 1)
            }
          }));
        }
      }
    } catch (err: unknown) {
      // Handle 403 Unauthorized when user is not the creator
      const error = err as { response?: { status: number } };
      if (error.response?.status === 403) {
        setUnauthorizedAction('delete');
        setUnauthorizedType(deletePrompt.type);
        setShowUnauthorizedModal(true);
      } else {
        console.error(`Failed to delete ${deletePrompt.type}`, err);
      }
    } finally {
      setDeletePromptBusy(false);
      setDeletePrompt(null);
    }
  };

  const handleReportPost = () => {
    if (!user) {
      setAuthPromptAction('report this post');
      setShowAuthPrompt(true);
      return;
    }

    if (post.isReported) {
      return;
    }

    setReportPrompt({
      type: 'post',
      id: post.id,
      title: 'Report Post',
      message: 'Report this post for admin review? This helps keep the community safe.',
    });
  };

  const handleReportComment = (commentId: string) => {
    if (!user) {
      setAuthPromptAction('report this reply');
      setShowAuthPrompt(true);
      return;
    }

    const targetComment = comments.find((comment) => comment.id === commentId);
    if (targetComment?.isReported) {
      return;
    }

    setReportPrompt({
      type: 'comment',
      id: commentId,
      title: 'Report Comment',
      message: 'Report this comment for admin review? This helps keep the community safe.',
    });
  };

  const confirmReport = async () => {
    if (!reportPrompt) return;

    setReportPromptBusy(true);
    try {
      if (reportPrompt.type === 'post') {
        const res = await reportPostApi(reportPrompt.id);
        if (res.success) {
          setPost((prev) => ({
            ...prev,
            isReported: true,
            _count: {
              ...prev._count,
              reports: res.data.reportCount,
            },
          }));
        }
      } else {
        const res = await reportCommentApi(reportPrompt.id);
        if (res.success) {
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id !== reportPrompt.id) return comment;
              return {
                ...comment,
                isReported: true,
                _count: {
                  ...comment._count,
                  reports: res.data.reportCount,
                },
              };
            })
          );
          setLatestReportedComment({ id: reportPrompt.id, count: res.data.reportCount });
        }
      }
    } catch (err: unknown) {
      console.error('Failed to report content', err);
    } finally {
      setReportPromptBusy(false);
      setReportPrompt(null);
    }
  };

  const startEditPost = () => {
    // Check if user is logged in
    if (!user) {
      setAuthPromptAction('edit this post');
      setShowAuthPrompt(true);
      return;
    }

    // Check if user is the creator
    if (user.id !== post.userId) {
      setUnauthorizedAction('edit');
      setUnauthorizedType('post');
      setShowUnauthorizedModal(true);
      return;
    }

    setEditPostContent(post.content);
    setEditPostMedia(post.media?.map((m) => m.url) || []);
    setEditingPostId(post.id);
  };

  const handleSaveEditPost = async () => {
    if (!editPostContent.trim()) return;
    setEditPostLoading(true);
    try {
      const res = await updatePostApi(post.id, {
        content: editPostContent,
        mediaUrls: editPostMedia.length > 0 ? editPostMedia : []
      });
      if (res.success) {
        setPost(res.data);
        setEditingPostId(null);
      }
    } catch (err: unknown) {
      // Handle 403 Unauthorized when user is not the creator
      const error = err as { response?: { status: number } };
      if (error.response?.status === 403) {
        setUnauthorizedAction('edit');
        setUnauthorizedType('post');
        setShowUnauthorizedModal(true);
      } else {
        console.error("Failed to update post", err);
      }
    }
    setEditPostLoading(false);
  };

  const handleCancelEditPost = () => {
    setEditingPostId(null);
    setEditPostContent('');
    setEditPostMedia([]);
  };

  const addMediaToEditPost = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files).slice(0, 6 - editPostMedia.length);
    setEditPostLoading(true);
    try {
      for (const file of selectedFiles) {
        const url = await uploadCommunityImageToStorage(file, 'community-post');
        setEditPostMedia((prev) => [...prev, url]);
      }
    } catch (error) {
      console.error("Failed to upload image", error);
    }
    setEditPostLoading(false);
  };

  const removeEditPostMedia = (index: number) => {
    setEditPostMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const startEditComment = (comment: ICommunityComment) => {
    // Check if user is logged in
    if (!user) {
      setAuthPromptAction('edit this reply');
      setShowAuthPrompt(true);
      return;
    }

    // Check if user is the creator
    if (user.id !== comment.userId) {
      setUnauthorizedAction('edit');
      setUnauthorizedType('comment');
      setShowUnauthorizedModal(true);
      return;
    }

    setEditCommentContent(comment.content);
    setEditCommentMediaUrls(comment.media?.map((m) => m.url) || []);
    setEditingCommentId(comment.id);
  };

  const handleEditCommentMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEditCommentMediaLoading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadCommunityImageToStorage(files[i], 'community-comment');
        urls.push(url);
      }
      setEditCommentMediaUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Failed to upload images", err);
    } finally {
      setEditCommentMediaLoading(false);
    }
  };

  const handleSaveEditComment = async () => {
    if (!editCommentContent.trim() || !editingCommentId) return;
    setEditCommentLoading(true);
    try {
      const res = await updateCommentApi(editingCommentId, {
        content: editCommentContent,
        mediaUrls: editCommentMediaUrls
      });
      if (res.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === editingCommentId ? res.data : c))
        );
        setLatestUpdatedComment(res.data);
        setEditingCommentId(null);
      }
    } catch (err: unknown) {
      // Handle 403 Unauthorized when user is not the creator
      const error = err as { response?: { status: number } };
      if (error.response?.status === 403) {
        setUnauthorizedAction('edit');
        setUnauthorizedType('comment');
        setShowUnauthorizedModal(true);
      } else {
        console.error("Failed to update comment", err);
      }
    }
    setEditCommentLoading(false);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
    setEditCommentMediaUrls([]);
  };

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 overflow-hidden w-full group transition-all duration-300">
      {createPortal(
        <UserConfirmModal
          isOpen={!!deletePrompt}
          title={deletePrompt?.title || ''}
          message={deletePrompt?.message || ''}
          confirmLabel={deletePrompt?.type === 'post' ? 'Delete Post' : 'Delete Comment'}
          cancelLabel="Cancel"
          busy={deletePromptBusy}
          tone="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            if (!deletePromptBusy) setDeletePrompt(null);
          }}
        />,
        document.body
      )}
      {createPortal(
        <UserConfirmModal
          isOpen={!!reportPrompt}
          title={reportPrompt?.title || ''}
          message={reportPrompt?.message || ''}
          confirmLabel="Report"
          cancelLabel="Cancel"
          busy={reportPromptBusy}
          tone="danger"
          onConfirm={confirmReport}
          onCancel={() => {
            if (!reportPromptBusy) setReportPrompt(null);
          }}
        />,
        document.body
      )}
      <div className="p-5 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            {post.topic && (
              <h3 
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }} 
                className="text-xl md:text-2xl font-bold text-[#0e2a47] mb-2 leading-tight hover:text-[#2dd4af] transition-colors duration-300 cursor-pointer"
                onClick={handleExpand}
              >
                {post.topic}
              </h3>
            )}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#ffd9d9] to-[#ffb3b3] flex items-center justify-center text-[#ff4c4c] font-bold text-[10px] shrink-0 uppercase">
                {post.user.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-[12px] font-bold text-slate-500 truncate">
                  {post.user.name}
                </span>
                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  • {formatTimeAgo(post.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            {user?.id === post.userId && (
              <>
                <button 
                  onClick={startEditPost}
                  className="text-[#8b919d] hover:text-[#2dd4af] transition-colors p-1.5 rounded-full hover:bg-[#2dd4af]/5"
                  title="Edit post"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button 
                  onClick={handleDeletePost}
                  className="text-[#8b919d] hover:text-[#ff4c4c] transition-colors p-1.5 rounded-full hover:bg-[#ff4c4c]/5"
                  title="Delete post"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div onClick={handleExpand} className="cursor-pointer">


          <p className="text-[12px] md:text-[13px] text-slate-600 mb-4 mt-1.5 whitespace-pre-line leading-relaxed hover:text-[#0e2a47] transition-colors">
            {post.content}
          </p>

          <PostMediaGallery media={post.media} />
        </div>

        {/* Edit Post Modal */}
        {editingPostId === post.id && (
          <div className="bg-[#f9f7f2] border-t border-[#e2dfd7] p-4 md:p-5 animate-in slide-in-from-top-2 fade-in duration-200">
            <h3 className="text-[#0e2a47] font-bold mb-3 text-sm">Edit Post</h3>
            <textarea
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="w-full h-24 p-3 text-[#0e2a47] bg-white rounded-xl border border-[#e2dfd7] focus:outline-none focus:ring-2 focus:ring-[#2dd4af]/50 focus:border-[#2dd4af] resize-none text-sm placeholder:text-[#8b919d] mb-3"
              placeholder="Edit your post..."
            />

            {editPostMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {editPostMedia.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={url} alt={`Edit post media ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeEditPostMedia(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                      disabled={editPostLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editPostMedia.length < 6 && (
              <label className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0e2a47] bg-[#f0fdf9] border border-[#2dd4af]/20 cursor-pointer hover:bg-[#e4fbf5] transition-all mb-3">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Add images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  disabled={editPostLoading}
                  onChange={(e) => void addMediaToEditPost(e.target.files)}
                />
              </label>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEditPost}
                disabled={editPostLoading}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-[#0e2a47] rounded-lg font-bold text-[12px] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditPost}
                disabled={!editPostContent.trim() || editPostLoading}
                className="px-4 py-1.5 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-lg font-bold text-[12px] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editPostLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 pt-4 border-t border-slate-100 mt-auto">
          <button 
            onClick={() => {
              if (!user) {
                setAuthPromptAction('like this post');
                setShowAuthPrompt(true);
                return;
              }
              onToggleLike(post.id);
            }}
            className={`flex items-center gap-2 cursor-pointer transition-colors group/btn ${post.isLiked ? 'text-[#ff4c4c]' : 'text-[#8b919d] hover:text-[#ff4c4c]'}`}
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`w-5 h-5 group-hover/btn:fill-[#ff4c4c]/10 transition-colors ${post.isLiked ? 'fill-[#ff4c4c]' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="text-sm font-semibold">{post._count?.likes > 0 ? post._count.likes : 'Like'}</span>
          </button>

          <button 
            onClick={handleExpand}
            className={`flex items-center gap-2 cursor-pointer transition-colors group/btn ${isExpanded ? 'text-[#2dd4af]' : 'text-[#8b919d] hover:text-[#2dd4af]'}`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover/btn:fill-[#2dd4af]/10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="text-sm font-semibold">{post._count?.comments > 0 ? post._count.comments : 'Comment'}</span>
          </button>

          <button
            onClick={handleReportPost}
            disabled={post.isReported || reportPromptBusy}
            className="text-[#8b919d] hover:text-rose-600 transition-colors p-1 disabled:cursor-not-allowed disabled:opacity-60"
            title={post.isReported ? 'Reported' : 'Report post'}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h10l-2 4 2 4H4z"></path>
              <path d="M4 4v16"></path>
            </svg>
            <span className="sr-only">{post.isReported ? 'Reported' : 'Report post'}</span>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <PostCommentsModal 
        isOpen={isExpanded} 
        onClose={() => setIsExpanded(false)}
        post={post}
        user={user}
        comments={comments}
        loadingComments={loadingComments}
        newComment={newComment}
        setNewComment={setNewComment}
        handleCommentSubmit={handleCommentSubmit}
        commentMediaUrls={commentMediaUrls}
        handleCommentMediaSelect={handleCommentMediaSelect}
        removeCommentMedia={removeCommentMedia}
        commentMediaLoading={commentMediaLoading}
        isSubmitting={isSubmitting}
        likeComment={likeComment}
        handleReportComment={handleReportComment}
        startEditComment={startEditComment}
        handleDeleteComment={handleDeleteComment}
        editingCommentId={editingCommentId}
        editCommentContent={editCommentContent}
        setEditCommentContent={setEditCommentContent}
        editCommentMediaUrls={editCommentMediaUrls}
        setEditCommentMediaUrls={setEditCommentMediaUrls}
        handleSaveEditComment={handleSaveEditComment}
        handleCancelEditComment={handleCancelEditComment}
        editCommentLoading={editCommentLoading}
        editCommentMediaLoading={editCommentMediaLoading}
        handleEditCommentMediaUpload={handleEditCommentMediaUpload}
        setShowAuthPrompt={setShowAuthPrompt}
        setAuthPromptAction={setAuthPromptAction}
        replyingToComment={replyingToComment}
        handleReplyToComment={handleReplyToComment}
        cancelReply={cancelReply}
        latestReply={latestReply}
        latestUpdatedComment={latestUpdatedComment}
        latestLikedComment={latestLikedComment}
        latestReportedComment={latestReportedComment}
        latestDeletedCommentId={latestDeletedCommentId}
        hasMoreComments={hasMoreComments}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => loadComments(true)}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign In to Participate"
        message="Join our community to share your experiences, create posts, and engage in discussions with fellow travelers and merchants."
        action={authPromptAction}
      />

      {/* Unauthorized Action Modal */}
      <UnauthorizedActionModal
        isOpen={showUnauthorizedModal}
        onClose={() => setShowUnauthorizedModal(false)}
        action={unauthorizedAction}
        type={unauthorizedType}
      />
    </div>
  );
};

// ─── Comments Modal Component ───────────────────────────────────────────────

interface PostCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ICommunityPost;
  user: IUserAuthor | null;
  comments: ICommunityComment[];
  loadingComments: boolean;
  newComment: string;
  setNewComment: (val: string) => void;
  handleCommentSubmit: (e: React.FormEvent) => void;
  commentMediaUrls: string[];
  handleCommentMediaSelect: (files: FileList | null) => void;
  removeCommentMedia: (index: number) => void;
  commentMediaLoading: boolean;
  isSubmitting: boolean;
  likeComment: (id: string) => void;
  handleReportComment: (id: string) => void;
  startEditComment: (c: ICommunityComment) => void;
  handleDeleteComment: (id: string) => void;
  editingCommentId: string | null;
  editCommentContent: string;
  setEditCommentContent: (val: string) => void;
  editCommentMediaUrls: string[];
  setEditCommentMediaUrls: React.Dispatch<React.SetStateAction<string[]>>;
  handleSaveEditComment: () => void;
  handleCancelEditComment: () => void;
  editCommentLoading: boolean;
  editCommentMediaLoading: boolean;
  handleEditCommentMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setShowAuthPrompt: (val: boolean) => void;
  setAuthPromptAction: (val: string) => void;
  replyingToComment: ICommunityComment | null;
  handleReplyToComment: (c: ICommunityComment) => void;
  cancelReply: () => void;
  latestReply: { parentId: string; reply: ICommunityComment } | null;
  latestUpdatedComment: ICommunityComment | null;
  latestLikedComment: { id: string; liked: boolean; count: number } | null;
  latestReportedComment: { id: string; count: number } | null;
  latestDeletedCommentId: string | null;
  hasMoreComments: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  isOpen,
  onClose,
  post,
  user,
  comments,
  loadingComments,
  newComment,
  setNewComment,
  handleCommentSubmit,
  commentMediaUrls,
  handleCommentMediaSelect,
  removeCommentMedia,
  commentMediaLoading,
  isSubmitting,
  likeComment,
  handleReportComment,
  startEditComment,
  handleDeleteComment,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  editCommentMediaUrls,
  setEditCommentMediaUrls,
  handleSaveEditComment,
  handleCancelEditComment,
  editCommentLoading,
  editCommentMediaLoading,
  handleEditCommentMediaUpload,
  setShowAuthPrompt,
  setAuthPromptAction,
  replyingToComment,
  handleReplyToComment,
  cancelReply,
  latestReply,
  latestUpdatedComment,
  latestLikedComment,
  latestReportedComment,
  latestDeletedCommentId,
  hasMoreComments,
  isLoadingMore,
  onLoadMore
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const commentsListRef = useRef<HTMLDivElement>(null);
  const isPaginationAction = useRef(false);

  const prevCommentsLengthRef = useRef(comments.length);

  // Scroll to top only when a NEW top-level comment is added (not on initial load or pagination)
  useEffect(() => {
    const prev = prevCommentsLengthRef.current;
    prevCommentsLengthRef.current = comments.length;

    // Only scroll if a comment was added (not on first render or load-more)
    if (comments.length > prev && !isPaginationAction.current && commentsListRef.current) {
      commentsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (isPaginationAction.current) {
      isPaginationAction.current = false;
    }
  }, [comments.length]);

  // Derived state to avoid cascading renders
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-active');
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        document.body.classList.remove('modal-active');
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(onClose, 350);
  };

  if (!isOpen && !isAnimating) return null;

  return createPortal(
    <div className="fixed inset-0 z-3000 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={handleClose} 
      />

      {/* Modal Content */}
      <div 
        className={`
          relative bg-[#fdf6e9] w-full h-auto max-h-[92dvh] sm:h-[85vh] sm:max-w-2xl rounded-t-[2.5rem] sm:rounded-4xl 
          shadow-2xl shadow-black/20 overflow-hidden flex flex-col
          transition-all duration-400 sm:duration-300
          ${isVisible 
            ? 'translate-y-0 opacity-100 sm:scale-100' 
            : 'translate-y-full opacity-0 sm:scale-[0.98]'
          }
          ease-[cubic-bezier(0.22,1,0.36,1)]
        `}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center py-2.5 sticky top-0 bg-[#fdf6e9] z-20">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        <PostCommentsHeader commentsCount={post._count.comments} onClose={handleClose} />

        <PostCommentsList
          commentsListRef={commentsListRef}
          loadingComments={loadingComments}
          comments={comments}
          user={user}
          editingCommentId={editingCommentId}
          editCommentContent={editCommentContent}
          setEditCommentContent={setEditCommentContent}
          handleSaveEditComment={handleSaveEditComment}
          handleCancelEditComment={handleCancelEditComment}
          startEditComment={startEditComment}
          handleDeleteComment={handleDeleteComment}
          handleReportComment={handleReportComment}
          handleReplyToComment={handleReplyToComment}
          likeComment={likeComment}
          postId={post.id}
          latestReply={latestReply}
          latestUpdatedComment={latestUpdatedComment}
          latestLikedComment={latestLikedComment}
          latestReportedComment={latestReportedComment}
          latestDeletedCommentId={latestDeletedCommentId}
          editCommentLoading={editCommentLoading}
          editCommentMediaUrls={editCommentMediaUrls}
          setEditCommentMediaUrls={setEditCommentMediaUrls}
          editCommentMediaLoading={editCommentMediaLoading}
          handleEditCommentMediaUpload={handleEditCommentMediaUpload}
          hasMoreComments={hasMoreComments}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => {
            isPaginationAction.current = true;
            onLoadMore();
          }}
        />

        <PostCommentsFooter
          postId={post.id}
          user={user}
          newComment={newComment}
          setNewComment={setNewComment}
          handleCommentSubmit={handleCommentSubmit}
          commentMediaUrls={commentMediaUrls}
          handleCommentMediaSelect={handleCommentMediaSelect}
          removeCommentMedia={removeCommentMedia}
          commentMediaLoading={commentMediaLoading}
          isSubmitting={isSubmitting}
          setShowAuthPrompt={setShowAuthPrompt}
          setAuthPromptAction={setAuthPromptAction}
          replyingToComment={replyingToComment}
          cancelReply={cancelReply}
        />
      </div>
    </div>,
    document.body
  );
};

export default PostItem;
