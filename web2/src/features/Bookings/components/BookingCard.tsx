import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { IBookingResponse } from '../../../features/Deals/types/deals.types';
import { formatLocalDate } from '../../../lib/date-utils';
import { resolveDealImageUrl } from '../../../lib/deal-image';

interface BookingCardProps {
  booking: IBookingResponse;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  paid: {
    label: 'Paid / Upcoming',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

const formatDate = (dateStr: string | null) => formatLocalDate(dateStr, { month: 'short', day: 'numeric', year: 'numeric' }) || 'TBD';

const getDaysUntil = (dateStr: string | null) => {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const status = statusConfig[booking.paymentStatus] || statusConfig.pending;
  const daysUntil = getDaysUntil(booking.variant?.startDatetime || null);
  const navigate = useNavigate();
  const dealDetailId = booking.deal?.id ?? booking.dealId;

  const primaryImage = resolveDealImageUrl(booking.deal?.primaryImageUrl);

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 w-full group">
      {/* Image Section */}
      <div className="w-full md:w-60 h-40 md:h-auto shrink-0 relative overflow-hidden">
        <img
          src={primaryImage}
          alt={booking.deal?.title || 'Booking'}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(event) => {
            event.currentTarget.src = resolveDealImageUrl(null);
          }}
        />
        {/* Status Badge on Image */}
        <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.text} ${status.border} border backdrop-blur-sm`}>
          {status.icon}
          {status.label}
        </div>

        {/* Duration overlay */}
        {booking.deal?.durationDays && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {booking.deal.durationDays} Days
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row flex-1 p-4 md:p-5 gap-4 md:gap-5">
        {/* Details */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg md:text-xl font-extrabold text-[#0e2a47] leading-tight mb-1 group-hover:text-[#2dd4af] transition-colors duration-300">
            {booking.deal?.title || 'Unknown Deal'}
          </h3>

          <p className="text-[12px] text-slate-500 font-medium mb-1 flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {booking.deal?.location || 'Unknown Location'}
          </p>

          {/* Date & Guests Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 mt-1.5">
            <span className="text-[12px] text-slate-600 flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDate(booking.variant?.startDatetime || null)} 
              {booking.variant?.endDatetime ? ` — ${formatDate(booking.variant.endDatetime)}` : ''}
            </span>
            <span className="text-[12px] text-slate-600 flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {booking.quantity} Slot{booking.quantity !== 1 ? 's' : ''}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Ref: BYD-{booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
             {booking.deal?.category && (
               <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 text-[10px] font-bold flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                 {booking.deal.category}
               </span>
             )}
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 min-w-37.5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-3 md:mt-0">
          <div className="text-left md:text-right flex-1 md:flex-none">
            <div className="text-[24px] font-black text-[#2dd4af] leading-none mb-1">
              ${booking.totalPrice?.toLocaleString() || 0}
            </div>
            
            {/* Countdown for upcoming */}
            {booking.paymentStatus === 'paid' && daysUntil > 0 && (
              <div className="text-[12px] font-bold text-[#ff7b54] flex items-center justify-start md:justify-end gap-1 mt-1.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5 mt-0 md:mt-4 w-auto md:w-full">
            <button
              className="px-4 md:px-0 py-2 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] font-bold rounded-lg transition-all shadow-lg shadow-[#2dd4af]/20 active:scale-[0.98] text-[13px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                if (!dealDetailId) return;
                navigate(`/deals/${dealDetailId}`);
              }}
              disabled={!dealDetailId}
            >
              View Deal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
