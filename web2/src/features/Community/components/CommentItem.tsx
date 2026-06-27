import React, { useState, useEffect } from 'react';
import type { ICommunityComment, IUserAuthor } from '../types/community.types';
import { getCommentReplies } from '../api/community.api';
import { PostMediaGallery } from './PostMediaGallery';
import { formatLocalDate } from '../../../lib/date-utils';

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

export interface CommentItemProps {
  comment: ICommunityComment;
  user: IUserAuthor | null;
  editingCommentId: string | null;
  editCommentContent: string;
  setEditCommentContent: (val: string) => void;
  handleSaveEditComment: () => void;
  handleCancelEditComment: () => void;
  startEditComment: (comment: ICommunityComment) => void;
  handleDeleteComment: (id: string) => void;
  handleReportComment: (id: string) => void;
  handleReplyToComment: (comment: ICommunityComment) => void;
  likeComment: (id: string) => void;
  postId: string;
  nestingLevel?: number;
  latestReply?: { parentId: string; reply: ICommunityComment } | null;
  latestUpdatedComment?: ICommunityComment | null;
  latestLikedComment?: { id: string; liked: boolean; count: number } | null;
  latestReportedComment?: { id: string; count: number } | null;
  latestDeletedCommentId: string | null;
  editCommentLoading?: boolean;
  editCommentMediaUrls: string[];
  setEditCommentMediaUrls: React.Dispatch<React.SetStateAction<string[]>>;
  editCommentMediaLoading: boolean;
  handleEditCommentMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  user,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  handleSaveEditComment,
  handleCancelEditComment,
  startEditComment,
  handleDeleteComment,
  handleReportComment,
  handleReplyToComment,
  likeComment,
  postId,
  nestingLevel = 0,
  latestReply,
  latestUpdatedComment,
  latestLikedComment,
  latestReportedComment,
  latestDeletedCommentId,
  editCommentLoading = false,
  editCommentMediaUrls,
  setEditCommentMediaUrls,
  editCommentMediaLoading,
  handleEditCommentMediaUpload
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ICommunityComment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
  const [localComment, setLocalComment] = useState<ICommunityComment>(comment);
  const [prevComment, setPrevComment] = useState<ICommunityComment>(comment);

  // Derived state sync (replaces useEffect for better performance)
  if (comment !== prevComment) {
    setPrevComment(comment);
    setLocalComment(comment);
  }

  // Watch for new replies being added to this specific comment
  useEffect(() => {
    if (latestReply && latestReply.parentId === comment.id) {
      setReplies((prev) => {
        // Prevent duplicates
        if (prev.some(r => r.id === latestReply.reply.id)) return prev;
        return [...prev, latestReply.reply];
      });
      setShowReplies(true);

      // Scroll the new reply into view after it renders
      setTimeout(() => {
        const replyElement = document.getElementById(`comment-${latestReply.reply.id}`);
        if (replyElement) {
          replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight effect
          replyElement.classList.add('bg-[#2dd4af]/10');
          setTimeout(() => {
            replyElement.classList.remove('bg-[#2dd4af]/10');
          }, 2000);
        }
      }, 100);
    }
  }, [latestReply, comment.id]);

  // Watch for updates to this specific comment or its replies
  useEffect(() => {
    if (latestUpdatedComment) {
      if (latestUpdatedComment.id === localComment.id) {
        setLocalComment(latestUpdatedComment);
      }
      if (nestingLevel === 0) {
        setReplies((prev) =>
          prev.map((r) => (r.id === latestUpdatedComment.id ? latestUpdatedComment : r))
        );
      }
    }
  }, [latestUpdatedComment, localComment.id, nestingLevel]);

  // Watch for Likes in this thread
  useEffect(() => {
    if (latestLikedComment) {
      if (latestLikedComment.id === localComment.id) {
        setLocalComment(prev => ({
          ...prev,
          isLiked: latestLikedComment.liked,
          _count: { ...prev._count, likes: latestLikedComment.count }
        }));
      }
      if (nestingLevel === 0) {
        setReplies((prev) =>
          prev.map((r) => {
            if (r.id !== latestLikedComment.id) return r;
            return {
              ...r,
              isLiked: latestLikedComment.liked,
              _count: { ...r._count, likes: latestLikedComment.count }
            };
          })
        );
      }
    }
  }, [latestLikedComment, localComment.id, nestingLevel]);

  // Watch for Reports in this thread
  useEffect(() => {
    if (latestReportedComment) {
      if (latestReportedComment.id === localComment.id) {
        setLocalComment(prev => ({
          ...prev,
          isReported: true,
          _count: { ...prev._count, reports: latestReportedComment.count }
        }));
      }
      if (nestingLevel === 0) {
        setReplies((prev) =>
          prev.map((r) => {
            if (r.id !== latestReportedComment.id) return r;
            return {
              ...r,
              isReported: true,
              _count: { ...r._count, reports: latestReportedComment.count }
            };
          })
        );
      }
    }
  }, [latestReportedComment, localComment.id, nestingLevel]);

  // Watch for Deletions in this thread
  useEffect(() => {
    if (latestDeletedCommentId && nestingLevel === 0) {
      setReplies((prev) => prev.filter((r) => r.id !== latestDeletedCommentId));
    }
  }, [latestDeletedCommentId, nestingLevel]);

  const fetchReplies = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMoreReplies(true);
    } else {
      if (showReplies) {
        setShowReplies(false);
        return;
      }
      setLoadingReplies(true);
    }

    try {
      const skip = isLoadMore ? replies.length : 0;
      const take = 5;
      const res = await getCommentReplies(localComment.id, { skip, take });
      if (res.success) {
        const fetchedData = res.data || res.items || [];
        if (isLoadMore) {
          setReplies((prev) => [...prev, ...fetchedData]);
          setHasMoreReplies(replies.length + fetchedData.length < res.total);
        } else {
          setReplies(fetchedData);
          setShowReplies(true);
          setHasMoreReplies(fetchedData.length < res.total);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReplies(false);
      setLoadingMoreReplies(false);
    }
  };

  return (
    <div id={`comment-${localComment.id}`} className={`flex flex-col transition-colors duration-1000 rounded-2xl p-1`}>
      {editingCommentId === localComment.id ? (
        <div className="bg-white rounded-3xl border border-[#2dd4af]/30 p-5 shadow-lg animate-in fade-in slide-in-from-top-2 ml-12">
          <h4 className="text-[#0e2a47] font-bold mb-3 text-[11px] uppercase tracking-wider">Editing your reply</h4>
          <textarea
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm text-[#0e2a47] focus:ring-2 focus:ring-[#2dd4af]/20 min-h-25 resize-none"
            placeholder="Edit your comment..."
            autoFocus
          />

          {/* Edit Media Gallery */}
          {editCommentMediaUrls.length > 0 && (
            <div className="mt-3">
              <PostMediaGallery 
                media={editCommentMediaUrls.map(url => ({ id: url, url }))} 
                onRemove={(url) => setEditCommentMediaUrls(prev => prev.filter(u => u !== url))}
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <label className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-[#2dd4af]/10 hover:text-[#2dd4af] transition-all cursor-pointer group">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleEditCommentMediaUpload}
                  disabled={editCommentMediaLoading || editCommentLoading}
                />
                {editCommentMediaLoading ? (
                  <div className="w-4 h-4 border-2 border-[#2dd4af] border-t-transparent animate-spin rounded-full" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleCancelEditComment} 
                disabled={editCommentLoading || editCommentMediaLoading} 
                className="px-4 py-2 text-sm font-bold text-slate-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEditComment} 
                disabled={editCommentLoading || editCommentMediaLoading || !editCommentContent.trim()}
                className="px-6 py-2 bg-[#2dd4af] text-[#0e2a47] rounded-xl text-sm font-bold shadow-lg shadow-[#2dd4af]/20 min-w-30 flex items-center justify-center"
              >
                {editCommentLoading ? (
                  <div className="w-4 h-4 border-2 border-[#0e2a47] border-t-transparent animate-spin rounded-full"></div>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex ${nestingLevel > 1 ? 'gap-2 md:gap-4' : 'gap-3 md:gap-4'} group`}>
          <div className={`
            ${nestingLevel === 0 ? 'w-9 h-9 text-sm' : nestingLevel === 1 ? 'w-7 h-7 text-[10px]' : 'w-5 h-5 text-[8px]'} 
            rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-[#0e2a47] font-bold shrink-0 uppercase overflow-hidden
          `}>
            {localComment.user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`bg-white ${nestingLevel > 1 ? 'px-2.5 py-2' : 'px-3 py-2.5'} md:px-5 md:py-4 rounded-[1.25rem] rounded-tl-none shadow-sm border border-black/5 ${nestingLevel > 0 ? 'bg-white/60' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-[#0e2a47] ${nestingLevel > 0 ? 'text-[10px] md:text-[12px]' : 'text-[12px] md:text-[14px]'}`}>{localComment.user.name}</span>
                <span className="text-[8px] md:text-[10px] text-slate-400 font-medium shrink-0 ml-2">{formatTimeAgo(localComment.createdAt)}</span>
              </div>
              <p className={`${nestingLevel > 0 ? 'text-[11px] md:text-[13px]' : 'text-[12px] md:text-[14px]'} text-slate-600 whitespace-pre-line leading-relaxed wrap-break-word`}>
                {localComment.content}
              </p>
              <div className="mt-2">
                <PostMediaGallery media={localComment.media} />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-5 gap-y-1 mt-1.5 px-0.5">
              <button 
                onClick={() => likeComment(localComment.id)}
                className={`text-[8px] md:text-xs font-bold transition-all active:scale-90 flex items-center gap-0.5 ${
                  localComment.isLiked 
                  ? 'text-[#ff4c4c]' 
                  : 'text-slate-400 hover:text-[#ff4c4c]'
                }`}
              >
                <svg viewBox="0 0 24 24" className={`w-2 h-2 ${localComment.isLiked ? 'fill-[#ff4c4c]' : ''}`} fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {localComment.isLiked ? 'Liked' : 'Like'}
                {localComment._count.likes > 0 && <span className="opacity-70">({localComment._count.likes})</span>}
              </button>
              
              <button 
                onClick={() => handleReplyToComment(localComment)}
                className="text-[8px] md:text-xs font-bold text-slate-400 hover:text-[#2dd4af] transition-colors flex items-center gap-0.5"
              >
                <svg viewBox="0 0 24 24" className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Reply
              </button>

              <button 
                onClick={() => handleReportComment(localComment.id)} 
                className={`text-[8px] md:text-xs font-bold transition-colors flex items-center gap-0.5 ${
                  localComment.isReported 
                  ? 'text-rose-500' 
                  : 'text-slate-400 hover:text-rose-500'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth="4">
                  <path d="M4 4h10l-2 4 2 4H4z"></path><path d="M4 4v16"></path>
                </svg>
                {localComment.isReported ? 'Reported' : 'Report'}
              </button>
              
              {user?.id === localComment.userId && (
                <div className="flex items-center gap-2 border-l border-slate-100 pl-2 ml-0.5">
                  <button onClick={() => startEditComment(localComment)} className="text-[8px] md:text-xs font-bold text-slate-400 hover:text-[#2dd4af] transition-colors">Edit</button>
                  <button onClick={() => handleDeleteComment(localComment.id)} className="text-[8px] md:text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">Delete</button>
                </div>
              )}
            </div>

            {/* View Replies Toggle */}
            {localComment._count.replies > 0 && (
              <div className="mt-2">
                <button 
                  onClick={() => fetchReplies()}
                  className="flex items-center gap-1.5 text-[9px] font-bold text-[#2dd4af] hover:text-[#25b898] transition-colors group/btn"
                >
                  <div className={`w-4 h-px bg-[#2dd4af]/20 group-hover/btn:bg-[#2dd4af]/40 transition-colors`} />
                  {showReplies ? 'Hide' : `View ${localComment._count.replies} ${localComment._count.replies === 1 ? 'reply' : 'replies'}`}
                  {loadingReplies && <div className="w-2.5 h-2.5 border-2 border-[#2dd4af] border-t-transparent animate-spin rounded-full" />}
                </button>
              </div>
            )}

            {/* Replies List - Indentation limit applied here */}
            {showReplies && replies.length > 0 && (
              <div className={`mt-3 flex flex-col gap-3 border-l border-slate-100 ${nestingLevel < 2 ? 'ml-1 pl-3 md:ml-4 md:pl-6' : 'ml-0 pl-2'}`}>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
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
                    postId={postId}
                    nestingLevel={nestingLevel + 1}
                    editCommentLoading={editCommentLoading}
                    latestReply={latestReply}
                    latestUpdatedComment={latestUpdatedComment}
                    latestLikedComment={latestLikedComment}
                    latestReportedComment={latestReportedComment}
                    latestDeletedCommentId={latestDeletedCommentId}
                    editCommentMediaUrls={editCommentMediaUrls}
                    setEditCommentMediaUrls={setEditCommentMediaUrls}
                    editCommentMediaLoading={editCommentMediaLoading}
                    handleEditCommentMediaUpload={handleEditCommentMediaUpload}
                  />
                ))}

                {hasMoreReplies && (
                  <button
                    onClick={() => fetchReplies(true)}
                    disabled={loadingMoreReplies}
                    className="self-start ml-1 mt-0.5 flex items-center gap-1 py-1 px-2 rounded-lg text-[8px] font-bold text-[#2dd4af] hover:bg-[#2dd4af]/5 transition-colors disabled:opacity-50"
                  >
                    {loadingMoreReplies ? (
                      <div className="w-2.5 h-2.5 border-2 border-[#2dd4af] border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth="4">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {loadingMoreReplies ? 'Loading...' : 'Load More'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
