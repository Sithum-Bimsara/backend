import React from 'react';
import { motion } from 'framer-motion';
import type { IDealCard } from '../../../../features/Deals/types/deals.types';
import { resolveDealImageUrl } from '../../../../lib/deal-image';

interface ListingCardItemProps {
  item: IDealCard;
  onClick: () => void;
}

export const ListingCardItem: React.FC<ListingCardItemProps> = ({ item, onClick }) => {
  const imgUrl = resolveDealImageUrl(item.primaryImageUrl);
  const displayed = item.displayedPrice ?? 0;
  const original = item.originalPrice;
  const currency = item.isLocalOnly ? 'MVR' : '$';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-[0_8px_20px_rgba(14,42,71,0.04)] transition-all cursor-pointer group text-left"
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
        <img
          src={imgUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          alt={item.title || 'Deal Thumbnail'}
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <h4 className="text-sm font-black text-[#0e2a47] line-clamp-1 group-hover:text-[#2dd4af] transition-colors duration-200">
            {item.title}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
            by {item.merchant.businessName}
          </p>
          <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">
            {item.description || 'Discover luxury details and pristine escapes in this premium package.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/70 shrink-0">
          {/* Gold Star Rating */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-400 fill-amber-400" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{item.averageRating ? item.averageRating.toFixed(1) : '5.0'}</span>
            {item.totalReviews && item.totalReviews > 0 ? (
              <span className="text-[10px] text-slate-400 font-normal">({item.totalReviews})</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal">(New)</span>
            )}
          </div>

          {/* Price block */}
          <div className="text-right">
            {original && original > displayed && (
              <span className="text-[10px] text-slate-400 line-through mr-1.5 font-semibold">
                {currency}{original.toLocaleString()}
              </span>
            )}
            <span className="text-[13px] font-extrabold text-[#2dd4af]">
              {currency}{displayed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
