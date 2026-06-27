import React, { useState } from "react";
import type { ICommunityComment } from "../../Community/types/community.types";
import { Badge, AdminActionButton } from "./AdminUI";

interface ModerationCommentNodeProps {
  comment: ICommunityComment;
  onDeleteComment: (comment: ICommunityComment) => void;
  deletedCommentIds: string[];
  loadCommentReplies: (commentId: string) => Promise<ICommunityComment[]>;
  nestingLevel?: number;
}

export const ModerationCommentNode: React.FC<ModerationCommentNodeProps> = ({
  comment,
  onDeleteComment,
  deletedCommentIds,
  loadCommentReplies,
  nestingLevel = 0,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ICommunityComment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await loadCommentReplies(comment.id);
      setReplies(data);
      setShowReplies(true);
    } catch (err) {
      console.error("Failed to load replies", err);
    } finally {
      setLoading(false);
    }
  };

  if (deletedCommentIds.includes(comment.id)) {
    return null;
  }

  return (
    <div className={`flex flex-col ${nestingLevel > 0 ? 'mt-3 pl-4 border-l border-slate-100' : ''}`}>
      <div className="border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-3 bg-white hover:border-indigo-100 transition-colors shadow-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-xs md:text-sm">{comment.user.name}</span>
            {nestingLevel > 0 && (
              <Badge tone="indigo">Level {nestingLevel}</Badge>
            )}
          </div>
          <div className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed wrap-break-word">{comment.content}</div>
          {(comment._count?.reports ?? 0) > 0 && (
            <div className="mt-2"><Badge tone="red">Reports: {comment._count.reports}</Badge></div>
          )}
          
          {/* Inspect Replies Toggle */}
          {((comment._count?.replies ?? 0) > 0 || replies.length > 0) && (
            <div className="mt-2 flex items-center">
              <button
                type="button"
                onClick={handleToggleReplies}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showReplies ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {showReplies ? 'Hide replies' : `View ${comment._count.replies || replies.length} ${comment._count.replies === 1 ? 'reply' : 'replies'}`}
                {loading && <div className="w-2.5 h-2.5 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full ml-1" />}
              </button>
            </div>
          )}
        </div>
        <AdminActionButton onClick={() => onDeleteComment(comment)} variant="danger" showArrow={false}>
          Delete
        </AdminActionButton>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map(reply => (
            <ModerationCommentNode
              key={reply.id}
              comment={reply}
              onDeleteComment={onDeleteComment}
              deletedCommentIds={deletedCommentIds}
              loadCommentReplies={loadCommentReplies}
              nestingLevel={nestingLevel + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
