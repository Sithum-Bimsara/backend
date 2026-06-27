import React from 'react';
import type { IAccommodationLock } from '../types/accommodation.types';
import { useChat } from '../../Chat/ChatContext';

interface Props {
  lock: IAccommodationLock;
}

const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const AccommodationLockCard: React.FC<Props> = ({ lock }) => {
  const { initiateChat } = useChat();
  const [isLocalInitiating, setIsLocalInitiating] = React.useState(false);

  const handleChat = async () => {
    setIsLocalInitiating(true);
    try {
      await initiateChat({ accommodationLockId: lock.id });
    } finally {
      setIsLocalInitiating(false);
    }
  };

  const isExpired = lock.status === 'expired' || new Date(lock.expiresAt) <= new Date();
  const isConverted = lock.status === 'converted';

  const statusConfig = isConverted
    ? { label: 'Converted', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' }
    : isExpired
    ? { label: 'Expired', bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' }
    : { label: 'Active', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md p-5 ${isExpired && !isConverted ? 'border-red-100 opacity-80' : 'border-slate-100'}`}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#0e2a47] text-sm">{lock.user.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{lock.user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black text-[#2dd4af]">${lock.grandTotal.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 font-medium">Grand Total</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unit</p>
          <p className="text-xs font-bold text-[#0e2a47] truncate">{lock.unitName}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rooms</p>
          <p className="text-xs font-bold text-[#0e2a47]">{lock.quantity} Room{lock.quantity !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
          <p className="text-xs font-bold text-[#0e2a47]">{formatDate(lock.checkInDate)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Check-out</p>
          <p className="text-xs font-bold text-[#0e2a47]">{formatDate(lock.checkOutDate)}</p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border border-slate-100 rounded-xl p-3 mb-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 font-medium">Base Price</span>
          <span className="font-bold text-[#0e2a47]">${lock.lockedPrice.toFixed(2)}</span>
        </div>
        {lock.addons.map((addon) => (
          <div key={addon.id} className="flex justify-between text-xs">
            <span className="text-slate-400">{addon.name}{addon.details ? ` — ${addon.details}` : ''}</span>
            <span className="font-semibold text-[#0e2a47]">+${addon.price.toFixed(2)}</span>
          </div>
        ))}
        {lock.addons.length > 0 && (
          <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="text-slate-500 font-semibold">Add-ons Total</span>
            <span className="font-bold text-[#0e2a47]">${lock.addonsTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Expires + Chat */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-slate-400">
          {isExpired ? 'Expired' : 'Expires'}: {formatDate(lock.expiresAt)}
        </p>
        {lock.chatRoomId && (
          <button
            onClick={handleChat}
            disabled={isLocalInitiating}
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

export default AccommodationLockCard;
