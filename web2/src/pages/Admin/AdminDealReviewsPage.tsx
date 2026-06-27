import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminPageShell, AdminCard, Badge, AdminConfirmModal, AdminActionButton } from '../../features/Admin/components/AdminUI';
import { getAdminDealReviews, adminDeleteReview, adminUpdateBadge, adminBulkUpdateBadge, adminBulkDelete } from '../../features/Deals/api/reviews.api';
import type { IReview, IReviewSummary, ReviewBadgeType } from '../../features/Deals/types/reviews.types';
import ReviewCard from '../../features/Review/ReviewCard';
import StarRating from '../../features/Review/StarRating';

// ─── Skeleton ───

const ReviewsSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-32 rounded bg-slate-100" />
            <div className="h-2 w-20 rounded bg-slate-50" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-slate-50" />
          <div className="h-3 w-2/3 rounded bg-slate-50" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main page ───

const AdminDealReviewsPage: React.FC = () => {
  const { merchantId, dealId } = useParams<{ merchantId: string; dealId: string }>();
  const [searchParams] = useSearchParams();
  const merchantName = searchParams.get('merchantName') || 'Merchant';
  const navigate = useNavigate();

  // Reviews state
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [summary, setSummary] = useState<IReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [badgeFilter, setBadgeFilter] = useState<ReviewBadgeType | ''>('');

  // Action states
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; userName: string } | null>(null);
  const [confirmBadge, setConfirmBadge] = useState<{ review: IReview; newBadge: ReviewBadgeType } | null>(null);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkBadge, setConfirmBulkBadge] = useState<ReviewBadgeType | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const loadReviews = useCallback(async (dId: string, p: number, badge: ReviewBadgeType | '') => {
    if (p === 1) setLoading(true);
    try {
      const params = { page: p, limit: 10, ...(badge ? { badgeType: badge } : {}) };
      const res = await getAdminDealReviews(dId, params);
      setReviews(p === 1 ? res.data : (prev) => [...prev, ...res.data]);
      setSummary(res.summary);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dealId) {
      loadReviews(dealId, 1, badgeFilter);
    }
  }, [dealId, badgeFilter, loadReviews]);

  const handleFilterChange = (badge: ReviewBadgeType | '') => {
    setBadgeFilter(badge);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!dealId) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(dealId, nextPage, badgeFilter);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await adminDeleteReview(confirmDelete.id);
      setReviews((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      setTotal((t) => t - 1);
      setSummary((prev) => prev ? { ...prev, totalReviews: prev.totalReviews - 1 } : prev);
      setConfirmDelete(null);
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleBadgeToggle = async () => {
    if (!confirmBadge) return;
    try {
      const res = await adminUpdateBadge(confirmBadge.review.id, { badgeType: confirmBadge.newBadge });
      setReviews((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
      setSummary((prev) => {
        if (!prev) return prev;
        const verifiedDelta = confirmBadge.newBadge === 'verified' ? 1 : -1;
        return { ...prev, verifiedReviews: prev.verifiedReviews + verifiedDelta };
      });
      setConfirmBadge(null);
    } catch (err) {
      alert('Failed to update badge');
    }
  };

  // ─── Bulk Handlers ───

  const handleSelectToggle = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = reviews.length > 0 && selectedIds.size === reviews.length;

  const handleBulkBadgeToggle = async () => {
    if (!confirmBulkBadge || selectedIds.size === 0) return;
    try {
      const reviewIds = Array.from(selectedIds);
      await adminBulkUpdateBadge({ reviewIds, badgeType: confirmBulkBadge });

      // Update local state
      setReviews((prev) => prev.map((r) =>
        selectedIds.has(r.id) ? { ...r, badgeType: confirmBulkBadge } : r
      ));

      // Reload everything to ensure summary is correct (easiest way for bulk)
      if (dealId) loadReviews(dealId, 1, badgeFilter);

      setSelectedIds(new Set());
      setConfirmBulkBadge(null);
    } catch (err) {
      alert('Failed to perform bulk badge update');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirmBulkDelete || selectedIds.size === 0) return;
    try {
      const reviewIds = Array.from(selectedIds);
      await adminBulkDelete({ reviewIds });

      // Refresh
      if (dealId) loadReviews(dealId, 1, badgeFilter);

      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
    } catch (err) {
      alert('Failed to perform bulk delete');
    }
  };

  return (
    <AdminPageShell
      title="Manage Reviews"
      subtitle={`Viewing reviews for ${merchantName}'s deal`}
      actions={
        <AdminActionButton
          onClick={() => navigate(`/admin/merchants/${merchantId}/deals?merchantName=${encodeURIComponent(merchantName)}`)}
          variant="secondary"
          className="px-5"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Deals
        </AdminActionButton>
      }
    >
      <div className="space-y-6">
        <AdminCard className="overflow-hidden">
          {/* Header & Stats */}
          <div className="bg-slate-50/50 p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Deal Performance</div>
                {summary ? (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <StarRating value={summary.averageRating} size="md" />
                      <span className="text-xl font-bold text-slate-900">{summary.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex gap-2">
                      <Badge tone="indigo">{summary.totalReviews} total</Badge>
                      <Badge tone="green">{summary.verifiedReviews} verified</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg" />
                )}
              </div>

              {/* Filters & Bulk Header */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {reviews.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-600">Select All</span>
                  </label>
                )}
                <div className="flex items-center gap-2">
                  {(['', 'normal', 'verified'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFilterChange(f)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${badgeFilter === f
                          ? 'bg-[#0e2a47] text-white border-transparent shadow-lg shadow-black/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {f === '' ? 'All Reviews' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="p-6">
            {loading ? (
              <ReviewsSkeleton />
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <p className="text-slate-900 font-bold">No reviews found</p>
                <p className="text-slate-500 text-sm mt-1">This deal hasn't received any reviews matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isAdmin
                    isSelected={selectedIds.has(review.id)}
                    onSelect={handleSelectToggle}
                    onAdminDelete={(id) => setConfirmDelete({ id, userName: review.user.name })}
                    onAdminBadgeToggle={(r) => setConfirmBadge({
                      review: r,
                      newBadge: r.badgeType === 'verified' ? 'normal' : 'verified'
                    })}
                  />
                ))}

                {reviews.length < total && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                    >
                      Load {total - reviews.length} more reviews
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </AdminCard>
      </div>

      <AdminConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Review"
        message={confirmDelete ? `Are you sure you want to delete the review by ${confirmDelete.userName}? This action cannot be undone.` : ''}
        confirmLabel="Delete Review"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <AdminConfirmModal
        isOpen={!!confirmBadge}
        title={confirmBadge?.newBadge === 'verified' ? "Verify Review" : "Remove Verification"}
        message={confirmBadge
          ? `Are you sure you want to change the status of ${confirmBadge.review.user.name}'s review to ${confirmBadge.newBadge}?`
          : ''}
        confirmLabel={confirmBadge?.newBadge === 'verified' ? "Set Verified" : "Set Normal"}
        tone="indigo"
        onConfirm={handleBadgeToggle}
        onCancel={() => setConfirmBadge(null)}
      />

      <AdminConfirmModal
        isOpen={!!confirmBulkBadge}
        title={confirmBulkBadge === 'verified' ? "Bulk Verify" : "Bulk Unverify"}
        message={`Are you sure you want to set ${selectedIds.size} selected reviews to ${confirmBulkBadge}?`}
        confirmLabel={confirmBulkBadge === 'verified' ? "Bulk Verify" : "Bulk Unverify"}
        tone="indigo"
        onConfirm={handleBulkBadgeToggle}
        onCancel={() => setConfirmBulkBadge(null)}
      />

      <AdminConfirmModal
        isOpen={confirmBulkDelete}
        title="Bulk Delete"
        message={`Are you sure you want to permanently delete ${selectedIds.size} selected reviews? This action cannot be undone.`}
        confirmLabel="Bulk Delete"
        tone="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[calc(100%-1rem)] xs:w-[calc(100%-2rem)] md:w-auto">
          <div className="bg-[#0e2a47] text-white px-3 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-between md:justify-start gap-2 md:gap-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 md:gap-3 pr-2 md:pr-6 border-r border-white/10 shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#2dd4af] flex items-center justify-center text-[9px] md:text-[10px] font-bold">
                {selectedIds.size}
              </div>
              <span className="text-[10px] md:text-sm font-bold tracking-tight hidden xs:block">Selected</span>
            </div>

            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setConfirmBulkBadge('verified')}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap"
                title="Verify All"
              >
                <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="hidden sm:inline">Verify All</span>
              </button>
              <button
                onClick={() => setConfirmBulkBadge('normal')}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap"
                title="Unverify"
              >
                <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Unverify</span>
              </button>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg md:rounded-xl text-[9px] md:text-xs font-bold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap"
                title="Delete"
              >
                <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1 md:p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white shrink-0"
              title="Clear selection"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminDealReviewsPage;
