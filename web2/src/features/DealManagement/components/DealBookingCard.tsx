import React from 'react';
import type { IDealBooking } from '../types/deals.types';
import { useChat } from '../../Chat/ChatContext';

interface Props {
  booking: IDealBooking;
}

const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  paid:      { label: 'Paid',      bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400'  },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',     text: 'text-red-500',     dot: 'bg-red-400'    },
};

export const DealBookingCard: React.FC<Props> = ({ booking }) => {
  const { initiateChat } = useChat();
  const [isLocalInitiating, setIsLocalInitiating] = React.useState(false);

  const handleChat = async () => {
    if (!booking.lockId) return;
    setIsLocalInitiating(true);
    try {
      await initiateChat({ dealLockId: booking.lockId });
    } finally {
      setIsLocalInitiating(false);
    }
  };

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md p-5">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#0e2a47] text-sm">{booking.user.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{booking.user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black text-[#2dd4af]">${booking.grandTotal.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 font-medium">Grand Total</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deal</p>
          <p className="text-xs font-bold text-[#0e2a47] truncate">{booking.dealTitle}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guests</p>
          <p className="text-xs font-bold text-[#0e2a47]">{booking.guests} Guest{booking.guests !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</p>
          <p className="text-xs font-bold text-[#0e2a47]">{formatDate(booking.checkInDate)}</p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border border-slate-100 rounded-xl p-3 mb-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-medium">Base Price</span>
          <span className="font-bold text-[#0e2a47]">${booking.totalPrice.toFixed(2)}</span>
        </div>
        {booking.addons.map((addon) => (
          <div key={addon.id} className="flex justify-between text-xs">
            <span className="text-slate-400">{addon.name}{addon.details ? ` — ${addon.details}` : ''}</span>
            <span className="font-semibold text-[#0e2a47]">+${addon.price.toFixed(2)}</span>
          </div>
        ))}
        {booking.addons.length > 0 && (
          <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="text-slate-500 font-semibold">Add-ons Total</span>
            <span className="font-bold text-[#0e2a47]">${booking.addonsTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Booked on + Chat */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-slate-400">Booked: {formatDate(booking.createdAt)}</p>
        {booking.chatRoomId && (
          <button
            onClick={handleChat}
            disabled={isLocalInitiating || !booking.lockId}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0e2a47] font-bold text-xs transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            {isLocalInitiating ? (
              <div className="w-3.5 h-3.5 border-2 border-[#2dd4af] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            )}
            Chat with Guest
          </button>
        )}
      </div>
    </div>
  );
};

export default DealBookingCard;
