import React from 'react';
import type { IReview } from '../Deals/types/reviews.types';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: IReview;
  currentUserId?: string | null;
  onEdit?: (review: IReview) => void;
  isAdmin?: boolean;
  onAdminDelete?: (reviewId: string) => void;
  onAdminBadgeToggle?: (review: IReview) => void;
  isSelected?: boolean;
  onSelect?: (reviewId: string, selected: boolean) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  isAdmin = false,
  onAdminDelete,
  onAdminBadgeToggle,
  isSelected = false,
  onSelect,
}) => {
  const isOwner = currentUserId === review.user.id;
  const isVerified = review.badgeType === 'verified';

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 p-4 flex gap-4 ${isSelected
        ? 'border-[#2dd4af] bg-[#f0fdf9]/30 ring-1 ring-[#2dd4af]/20 shadow-[0_4px_20px_rgb(45,212,175,0.08)]'
        : 'border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
        }`}
    >
      {isAdmin && onSelect && (
        <div className="pt-1 shrink-0">
          <label className="relative flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(review.id, e.target.checked)}
              className="peer sr-only"
            />
            <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${isSelected
              ? 'bg-[#2dd4af] border-[#2dd4af] shadow-sm'
              : 'bg-white border-slate-200 group-hover:border-slate-300'
              }`}>
              <svg
                viewBox="0 0 24 24"
                className={`w-3.5 h-3.5 text-white transition-all duration-200 transform ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </label>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2dd4af] to-[#0e9e82] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {review.user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-[#0e2a47] truncate">
                  {review.user.name}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#f0fdf9] border border-[#2dd4af]/30 text-[#0e9e82] rounded-full text-[9px] font-bold uppercase tracking-wider">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified
                  </span>
                )}
                {review.isEdited && (
                  <span className="text-[9px] text-slate-400 font-medium">· edited</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating value={review.rating} size="sm" />
                <span className="text-[10px] text-slate-400">{formatRelativeTime(review.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-1 md:gap-1.5 shrink-0 ml-10 sm:ml-0">
            {isOwner && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                className="px-2 py-0.5 md:px-2.5 md:py-1 text-[8px] md:text-[10px] font-semibold text-slate-500 hover:text-[#0e2a47] border border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer bg-transparent"
              >
                Edit
              </button>
            )}
            {isAdmin && (
              <>
                {onAdminBadgeToggle && (
                  <button
                    type="button"
                    onClick={() => onAdminBadgeToggle(review)}
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${isVerified
                      ? 'bg-[#f0fdf9] border-[#2dd4af]/30 text-[#0e9e82] hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-[#f0fdf9] hover:border-[#2dd4af]/30 hover:text-[#0e9e82]'
                      }`}
                  >
                    {isVerified ? '✓ Verified' : 'Set Verified'}
                  </button>
                )}
                {onAdminDelete && (
                  <button
                    type="button"
                    onClick={() => onAdminDelete(review.id)}
                    className="px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[9px] font-bold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 rounded-lg transition-all cursor-pointer bg-transparent"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comment */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed break-words">{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
