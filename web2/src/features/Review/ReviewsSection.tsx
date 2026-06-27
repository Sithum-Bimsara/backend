import React, { useState, useCallback } from 'react';
import type { IReview, IReviewsPreview, CreateReviewRequest, UpdateReviewRequest } from '../Deals/types/reviews.types';
import {
  getDealReviews,
  createReview,
  updateReview,
  getPropertyReviews,
  createAccommodationReview,
  updateAccommodationReview
} from '../Deals/api/reviews.api';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';
import StarRating from './StarRating';

interface ReviewsSectionProps {
  id: string;
  type: 'deal' | 'accommodation';
  initialPreview: IReviewsPreview;
  currentUserId?: string | null;
  /** The user's existing review if they already left one */
  userReview?: IReview | null;
}

const REVIEWS_PER_PAGE = 10;

// ─── Star distribution bar ──────────────────────────────────────────────────

const DistributionBar: React.FC<{ star: number; count: number; total: number }> = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-slate-500 font-semibold shrink-0">{star}</span>
      <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-slate-400 text-right shrink-0">{count}</span>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  id,
  type,
  initialPreview,
  currentUserId,
  userReview: initialUserReview,
}) => {
  const [reviews, setReviews] = useState<IReview[]>(initialPreview.reviews);
  const [summary, setSummary] = useState(initialPreview.summary);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialPreview.summary.totalReviews);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(initialPreview.reviews.length >= initialPreview.summary.totalReviews);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<IReview | null>(null);
  const [userReview, setUserReview] = useState<IReview | null>(initialUserReview ?? null);

  React.useEffect(() => {
    if (initialUserReview !== undefined) {
      setUserReview(initialUserReview);
    }
  }, [initialUserReview]);

  const hasReviewed = userReview !== null;

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = type === 'deal'
        ? await getDealReviews(id, { page: nextPage, limit: REVIEWS_PER_PAGE })
        : await getPropertyReviews(id, { page: nextPage, limit: REVIEWS_PER_PAGE });

      setReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        return [...prev, ...res.data.filter((r) => !existingIds.has(r.id))];
      });
      setSummary(res.summary);
      setTotal(res.total);
      setPage(nextPage);
      if (reviews.length + res.data.length >= res.total) setAllLoaded(true);
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [id, type, page, reviews.length]);

  const handleSubmitCreate = async (data: CreateReviewRequest | UpdateReviewRequest) => {
    const res = type === 'deal'
      ? await createReview(id, data as CreateReviewRequest)
      : await createAccommodationReview(id, data as CreateReviewRequest);

    const { review: newReview, summary: updatedSummary } = res.data;
    setReviews((prev) => [newReview, ...prev]);
    setUserReview(newReview);
    setSummary(updatedSummary);
    setTotal(updatedSummary.totalReviews);
  };

  const handleSubmitEdit = async (data: CreateReviewRequest | UpdateReviewRequest) => {
    if (!editingReview) return;
    const res = type === 'deal'
      ? await updateReview(editingReview.id, data as UpdateReviewRequest)
      : await updateAccommodationReview(editingReview.id, data as UpdateReviewRequest);

    const { review: updated, summary: updatedSummary } = res.data;
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (userReview?.id === updated.id) setUserReview(updated);
    setSummary(updatedSummary);
  };

  const handleOpenEdit = (review: IReview) => {
    setEditingReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReview(null);
  };

  return (
    <section className="mt-16" id="reviews-section">
      <h2 className="text-xl md:text-2xl font-black text-[#0e2a47] mb-6 md:mb-8 flex items-center gap-3">
        Guest Experience
      </h2>

      {/* ─── Summary header ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Big average score */}
          <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 md:pr-12 md:min-w-[160px]">
            <span className="text-5xl md:text-6xl font-black text-[#0e2a47] tracking-tighter">
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '—'}
            </span>
            <div className="mt-2">
              <StarRating value={summary.averageRating} size="md" />
            </div>
            <span className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
              {summary.totalReviews} {summary.totalReviews === 1 ? 'Review' : 'Reviews'}
            </span>
            {summary.verifiedReviews > 0 && (
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                {summary.verifiedReviews} Verified
              </span>
            )}
          </div>

          {/* Star distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <DistributionBar
                key={star}
                star={star}
                count={summary.starDistribution[star as keyof typeof summary.starDistribution]}
                total={summary.totalReviews}
              />
            ))}
          </div>
        </div>

        {/* Write review CTA */}
        {currentUserId && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            {hasReviewed ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  You've reviewed this deal
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(userReview!)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0e2a47] border border-slate-200 hover:border-[#2dd4af] hover:text-[#2dd4af] rounded-lg transition-all cursor-pointer bg-transparent"
                >
                  Edit my review
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="write-review-btn"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2dd4af] hover:bg-[#25b898] text-white text-sm font-bold rounded-xl shadow-md shadow-[#2dd4af]/20 transition-all border-none cursor-pointer"
              >
                Write a Review
              </button>
            )}
          </div>
        )}
        {!currentUserId && (
          <p className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
            <a href="/login" className="text-[#2dd4af] font-semibold hover:underline">Sign in</a> to leave a review.
          </p>
        )}
      </div>

      {/* ─── Review list ─────────────────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-2xl mb-2">⭐</div>
          <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleOpenEdit}
            />
          ))}

          {/* Load more */}
          {!allLoaded && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer bg-white disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
                    Loading…
                  </>
                ) : (
                  `Load more reviews (${total - reviews.length} remaining)`
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Review Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <ReviewModal
          mode={editingReview ? 'edit' : 'create'}
          existingReview={editingReview ?? undefined}
          onSubmit={editingReview ? handleSubmitEdit : handleSubmitCreate}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default ReviewsSection;
