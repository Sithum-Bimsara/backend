import React from 'react';
import type { ICommunityComment, IUserAuthor } from '../types/community.types';

interface PostCommentsFooterProps {
  postId: string;
  user: IUserAuthor | null;
  newComment: string;
  setNewComment: (val: string) => void;
  handleCommentSubmit: (e: React.FormEvent) => void;
  commentMediaUrls: string[];
  handleCommentMediaSelect: (files: FileList | null) => void;
  removeCommentMedia: (index: number) => void;
  commentMediaLoading: boolean;
  isSubmitting: boolean;
  setShowAuthPrompt: (val: boolean) => void;
  setAuthPromptAction: (val: string) => void;
  replyingToComment: ICommunityComment | null;
  cancelReply: () => void;
}

export const PostCommentsFooter: React.FC<PostCommentsFooterProps> = ({
  postId,
  user,
  newComment,
  setNewComment,
  handleCommentSubmit,
  commentMediaUrls,
  handleCommentMediaSelect,
  removeCommentMedia,
  commentMediaLoading,
  isSubmitting,
  setShowAuthPrompt,
  setAuthPromptAction,
  replyingToComment,
  cancelReply,
}) => {
  return (
    <div className="bg-white border-t border-slate-100 p-5 pb-8 md:pb-5 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-10">
      {user ? (
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          {replyingToComment && (
            <div className="flex items-center justify-between bg-[#2dd4af]/5 border border-[#2dd4af]/10 px-4 py-2 rounded-xl animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4af] animate-pulse" />
                <span className="text-[11px] font-bold text-[#0e2a47]">Replying to {replyingToComment.user.name}</span>
              </div>
              <button
                type="button"
                onClick={cancelReply}
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border-none bg-transparent cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                id={`comment-input-${postId}`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingToComment ? `Reply to ${replyingToComment.user.name.split(' ')[0]}...` : 'Write a reply...'}
                className="w-full min-h-12 max-h-32 p-3.5 pr-12 text-sm text-[#0e2a47] bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-[#2dd4af] focus:ring-4 focus:ring-[#2dd4af]/5 transition-all resize-none font-medium placeholder:text-slate-300"
                rows={1}
                disabled={isSubmitting}
              />
              <label className="absolute right-3.5 bottom-3.5 text-[#2dd4af] cursor-pointer hover:scale-110 transition-transform active:scale-95">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isSubmitting || commentMediaLoading || commentMediaUrls.length >= 4}
                  onChange={(e) => {
                    void handleCommentMediaSelect(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting || commentMediaLoading}
              className="bg-[#2dd4af] text-[#0e2a47] p-3.5 rounded-2xl shadow-lg shadow-[#2dd4af]/20 disabled:opacity-50 transition-all active:scale-90 flex items-center justify-center min-w-13 min-h-13"
            >
              {isSubmitting || commentMediaLoading ? (
                <div className="w-5 h-5 border-3 border-[#0e2a47] border-t-transparent animate-spin rounded-full"></div>
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          {commentMediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-1 animate-in slide-in-from-bottom-3">
              {commentMediaUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-[1.25rem] overflow-hidden border-2 border-white shadow-md group">
                  <img src={url} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeCommentMedia(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center text-xs backdrop-blur-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
              {commentMediaLoading && (
                <div className="w-20 h-20 rounded-[1.25rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <div className="w-5 h-5 border-3 border-[#2dd4af] border-t-transparent animate-spin rounded-full" />
                </div>
              )}
            </div>
          )}
        </form>
      ) : (
        <div className="flex items-center justify-between gap-6 py-2">
          <div className="flex-1">
            <p className="text-sm font-bold text-[#0e2a47]">Sign in to participate</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Join the discussion with fellow travelers.</p>
          </div>
          <button
            onClick={() => {
              setAuthPromptAction('write a reply');
              setShowAuthPrompt(true);
            }}
            className="px-6 py-2.5 bg-[#2dd4af] text-[#0e2a47] rounded-xl text-xs font-bold shadow-lg shadow-[#2dd4af]/10 transition-all hover:bg-[#25b898] active:scale-95"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};
