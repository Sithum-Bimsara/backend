import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IDealCard, IDealLockInfo, IDealVariantPublic } from '../types/deals.types';
import ConfirmLockingModal from './ConfirmLockingModal';
import { getDealVariants } from '../api/deals.api';
import { resolveDealImageUrl } from '../../../lib/deal-image';
import StarRating from '../../Review/StarRating';

interface DealCardProps {
  deal: IDealCard;
  showAiMatch?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, showAiMatch = false }) => {
  const navigate = useNavigate();
  const score = deal.aiScore;

  // ─── State for on-demand variant fetch ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingVariants, setIsFetchingVariants] = useState(false);
  const [lockInfo, setLockInfo] = useState<IDealLockInfo | null>(null);

  const primaryImage = resolveDealImageUrl(deal.primaryImageUrl);

  // ─── Summary data ───
  // The backend now guarantees the deal only appears if it has future active variants
  const hasDates = true;

  const displayPrice = deal.displayedPrice ?? 0;
  const originalPrice = deal.originalPrice;
  const discountAmount = originalPrice && originalPrice > displayPrice ? Math.round(originalPrice - displayPrice) : 0;
  const discountPercent = originalPrice && originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  // ─── Lock Deal: fetch variants on click, then open modal ───
  const handleLockDealClick = async () => {
    if (!hasDates) return;

    // If already fetched, re-open directly
    if (lockInfo) {
      setIsModalOpen(true);
      return;
    }

    setIsFetchingVariants(true);
    try {
      const data = await getDealVariants(deal.id);
      setLockInfo(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('[DealCard] Failed to fetch variants:', err);
    } finally {
      setIsFetchingVariants(false);
    }
  };

  const variants: IDealVariantPublic[] = lockInfo?.variants ?? [];
  const dealLockExpireDays = lockInfo?.dealLockExpireTime ?? deal.dealLockExpireTime ?? 1;

  return (
    <div className="group bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-black/5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 w-full max-w-110">
      {/* Image Section */}
      <div className="relative h-42.5 overflow-hidden">
        <img
          src={primaryImage}
          alt={deal.title || 'Deal'}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = resolveDealImageUrl(null);
          }}
        />

        {/* Category Badge */}
        {deal.category && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e2a47] backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-wider uppercase">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#2dd4af]" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {deal.category}
            </div>
          </div>
        )}

        {showAiMatch && typeof score === 'number' && (
          <div className="absolute top-16 left-4">
            <div className="px-2.5 py-1 bg-[#2dd4af] text-[#0e2a47] rounded-full text-[10px] font-bold tracking-wide shadow-lg shadow-[#2dd4af]/30">
              AI Match: {Math.max(0, Math.min(100, Math.round(score)))}%
            </div>
          </div>
        )}

        {/* Local Only Badge */}
        {deal.isLocalOnly && (
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#2dd4af] text-[#0e2a47] rounded-full text-[10px] font-black uppercase tracking-tight shadow-lg">
              🇲🇻 Local Only
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 pb-5">
        <div className="flex items-center gap-3 text-slate-500 text-[10px] font-medium mb-2">
          {deal.location && (
            <div className="flex items-center gap-1 text-[#2dd4af]">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {deal.location}
            </div>
          )}
          {hasDates && (
            <div className={`flex items-center gap-1 ${deal.isAccommodation ? 'text-[#2dd4af]' : 'text-[#ff7b54]'}`}>
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {deal.isAccommodation ? 'Available now' : 'Dates available'}
            </div>
          )}
        </div>

        <h3 className="text-[18px] font-['Playfair_Display',serif] font-bold text-[#0e2a47] leading-[1.2] mb-1 group-hover:text-[#2dd4af] transition-colors duration-300">
          {deal.title || 'Untitled Deal'}
        </h3>
        <p className="text-[11px] text-slate-400 font-medium mb-2 capitalize">
          by {deal.merchant.businessName}
        </p>

        {/* Rating */}
        {deal.totalReviews && deal.totalReviews > 0 ? (
          <div className="flex items-center gap-1.5 mb-3">
            <StarRating value={deal.averageRating || 5} size="sm" />
            <span className="text-[11px] font-bold text-amber-600">{(deal.averageRating || 5).toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">({deal.totalReviews})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mb-3">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px] font-bold text-slate-500">New</span>
          </div>
        )}

        {/* Description snippet */}
        <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">
          {deal.description || 'No description available'}
        </p>

        {/* Pricing Section */}
        <div className="bg-[#f2fbf9] rounded-[14px] p-3 border border-[#2dd4af]/10 mb-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400 text-[11px] font-semibold">From</span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-end pt-0.5">
                <span className="text-[22px] font-black text-[#0e2a47] leading-none mt-1">
                  ${displayPrice.toLocaleString()}
                </span>
                {originalPrice && originalPrice > displayPrice && (
                  <span className="text-slate-400 text-[11px] line-through mt-0.5">
                    ${originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex flex-col items-start justify-center mt-0.5">
                  <span className="text-[#2dd4af] text-[12px] font-bold">-${discountAmount}</span>
                  <span className="text-[#2dd4af] text-[10px] font-bold opacity-80">{discountPercent}% off</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lock Expiry hint */}
        {deal.dealLockExpireTime && !deal.isAccommodation && (
          <div className="flex gap-2.5 p-2.5 bg-[#fff9eb] border border-[#ffecbc] rounded-[14px] mb-4">
            <div className="mt-0.5 shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#ffb800]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-[10px] leading-snug text-slate-600 font-medium">
              Lock for {deal.dealLockExpireTime} {deal.dealLockExpireTime === 1 ? 'day' : 'days'} to reserve your spot. No payment required until you confirm.
            </p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center gap-2.5">
          {!deal.isAccommodation ? (
            <>
              <button
                id={`lock-deal-btn-${deal.id}`}
                onClick={handleLockDealClick}
                disabled={isFetchingVariants}
                className="flex-1 bg-[#2dd4af] hover:bg-[#1fb899] disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-bold h-10 rounded-xl shadow-lg shadow-[#2dd4af]/20 hover:shadow-[#2dd4af]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 text-[12px] leading-none cursor-pointer"
              >
                {isFetchingVariants ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 shrink-0 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M21 12a9 9 0 1 1-9-9" />
                    </svg>
                    <span>Loading…</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span className="truncate">Lock Deal</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(`/deals/${deal.id}?source=search`)}
                className="flex items-center justify-center gap-1 h-10 px-4 rounded-xl border-2 border-slate-200 hover:border-[#0e2a47] text-[12px] font-bold text-slate-500 hover:text-[#0e2a47] transition-all active:scale-[0.98] cursor-pointer shrink-0 group/view"
              >
                View
                <svg viewBox="0 0 24 24" className="w-3 h-3 transition-transform group-hover/view:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate(`/accommodations/${deal.id}`);
              }}
              className="flex-1 bg-[#0e2a47] hover:bg-[#1a3d5e] text-white font-bold h-10 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 text-[12px] leading-none cursor-pointer"
            >
              <span>View Availability</span>
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Confirm Locking Modal — only rendered after variants are fetched */}
      {lockInfo && (
        <ConfirmLockingModal
          deal={deal}
          variants={variants}
          dealLockExpireDays={dealLockExpireDays}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DealCard;
