import React from 'react';
import { CommentItem } from './CommentItem';
import type { ICommunityComment, IUserAuthor } from '../types/community.types';

interface PostCommentsListProps {
  commentsListRef: React.RefObject<HTMLDivElement | null>;
  loadingComments: boolean;
  comments: ICommunityComment[];
  user: IUserAuthor | null;
  editingCommentId: string | null;
  editCommentContent: string;
  setEditCommentContent: (val: string) => void;
  handleSaveEditComment: () => void;
  handleCancelEditComment: () => void;
  startEditComment: (c: ICommunityComment) => void;
  handleDeleteComment: (id: string) => void;
  handleReportComment: (id: string) => void;
  handleReplyToComment: (c: ICommunityComment) => void;
  likeComment: (id: string) => void;
  postId: string;
  latestReply: { parentId: string; reply: ICommunityComment } | null;
  latestUpdatedComment: ICommunityComment | null;
  latestLikedComment: { id: string; liked: boolean; count: number } | null;
  latestReportedComment: { id: string; count: number } | null;
  latestDeletedCommentId: string | null;
  editCommentLoading: boolean;
  editCommentMediaUrls: string[];
  setEditCommentMediaUrls: React.Dispatch<React.SetStateAction<string[]>>;
  editCommentMediaLoading: boolean;
  handleEditCommentMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  hasMoreComments: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export const PostCommentsList: React.FC<PostCommentsListProps> = ({
  commentsListRef,
  loadingComments,
  comments,
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
  latestReply,
  latestUpdatedComment,
  latestLikedComment,
  latestReportedComment,
  latestDeletedCommentId,
  editCommentLoading,
  editCommentMediaUrls,
  setEditCommentMediaUrls,
  editCommentMediaLoading,
  handleEditCommentMediaUpload,
  hasMoreComments,
  isLoadingMore,
  onLoadMore,
}) => {
  return (
    <div
      ref={commentsListRef}
      className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 custom-scrollbar bg-[#fdf6e9]/40"
    >
      {loadingComments ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-[#2dd4af] border-t-transparent animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Conversation...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-black/5">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <p className="text-[#0e2a47] font-bold text-base">No replies yet</p>
          <p className="text-slate-400 text-sm mt-1 max-w-50 mx-auto">Be the first to share your thoughts and join the discussion!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
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
            />
          ))}

          {hasMoreComments && (
            <div className="flex justify-center pt-2 pb-6">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-[#0e2a47] shadow-sm hover:shadow-md hover:border-[#2dd4af]/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#2dd4af] border-t-transparent animate-spin rounded-full" />
                    <span>Fetching more...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                    </svg>
                    <span>Load More Comments</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
