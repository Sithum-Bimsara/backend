import React, { useState, useEffect, useCallback } from 'react';
import type { IReview, CreateReviewRequest, UpdateReviewRequest } from '../Deals/types/reviews.types';

interface ReviewModalProps {
  mode: 'create' | 'edit';
  existingReview?: IReview;
  onSubmit: (data: CreateReviewRequest | UpdateReviewRequest) => Promise<void>;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ mode, existingReview, onSubmit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 0);
  const [comment, setComment] = useState<string>(existingReview?.comment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track hover state for interactive stars
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isAnimating || loading) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(onClose, 350);
  }, [onClose, isAnimating, loading]);

  const displayRating = hoverRating || rating;

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    if (comment.trim().length < 3) {
      setError('Comment must be at least 3 characters');
      return;
    }
    if (comment.trim().length > 2000) {
      setError('Comment must be at most 2000 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await onSubmit({ rating, comment: comment.trim() } as CreateReviewRequest);
      } else {
        const payload: UpdateReviewRequest = {};
        if (rating !== existingReview?.rating) payload.rating = rating;
        if (comment.trim() !== existingReview?.comment) payload.comment = comment.trim();
        await onSubmit(payload);
      }
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={loading ? undefined : handleClose}
      />

      {/* Modal panel */}
      <div
        className={`
          relative bg-white w-full sm:h-auto sm:max-w-md rounded-t-3xl sm:rounded-3xl
          shadow-2xl will-change-transform overflow-hidden
          transition-all duration-350 sm:duration-200
          ${isVisible
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-full opacity-0 sm:scale-95'
          }
          ease-[cubic-bezier(0.22,1,0.36,1)] sm:ease-out
        `}
      >
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center py-2 sticky top-0 bg-white z-20">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0e2a47]">
              {mode === 'create' ? 'Write a Review' : 'Edit Your Review'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Share your experience with other travellers</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border-none cursor-pointer bg-transparent disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-3">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="bg-transparent border-none cursor-pointer p-0.5 transition-transform hover:scale-125"
                  aria-label={`Rate ${star} star`}
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 transition-colors" fill={displayRating >= star ? '#f59e0b' : 'none'} stroke={displayRating >= star ? '#f59e0b' : '#cbd5e1'} strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
              {displayRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-amber-600">
                  {ratingLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Your Review
              <span className="ml-1 text-slate-400 font-normal">({comment.length}/2000)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other travellers what you loved (or didn't) about this deal…"
              rows={4}
              maxLength={2000}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder-slate-300 focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all resize-none disabled:opacity-50"
            />
            <p className="text-[10px] text-slate-400 mt-1">Minimum 3 characters</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all border-none cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2dd4af] hover:bg-[#25b898] shadow-md shadow-[#2dd4af]/20 transition-all border-none cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
              )}
              {mode === 'create' ? 'Submit Review' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
