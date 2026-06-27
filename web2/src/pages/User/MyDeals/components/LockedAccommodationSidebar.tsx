import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatLocalDate } from '../../../../lib/date-utils';
import { getSriLankaTime } from '../../../../lib/timezone';
import { useChat } from '../../../../features/Chat/ChatContext';
import { useLockedDeal } from '../../../../context/locked-deal.context';
import type { IViewAccommodationLockDetail } from '../../../../features/TravelerProfile/types/user-profile.types';
import type { IPropertyDetail, IAccommodationLockResponse } from '../../../../features/Deals/types/deals.types';

interface LockedAccommodationSidebarProps {
  lock: IViewAccommodationLockDetail;
  property: IPropertyDetail;
}

export const LockedAccommodationSidebar: React.FC<LockedAccommodationSidebarProps> = ({ lock, property }) => {
  const navigate = useNavigate();
  const { initiateChat } = useChat();
  const { setLockedAccommodationFromLock } = useLockedDeal();
  const [isChatInitiating, setIsChatInitiating] = useState(false);
  const [now, setNow] = useState<number>(getSriLankaTime().getTime());

  // High-performance timer synchronized with Sri Lankan time for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getSriLankaTime().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { isExpired, timeString } = useMemo(() => {
    if (!lock.expiresAt) return { isExpired: true, timeString: '00:00:00' };
    
    const expiry = new Date(lock.expiresAt).getTime();
    const diffSeconds = Math.max(0, Math.floor((expiry - now) / 1000));
    
    const h = Math.floor(diffSeconds / 3600);
    const m = Math.floor((diffSeconds % 3600) / 60);
    const s = diffSeconds % 60;
    
    const formatted = [
      h.toString().padStart(2, '0'),
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].join(':');

    return {
      isExpired: lock.status === 'expired' || diffSeconds <= 0,
      timeString: formatted
    };
  }, [lock.expiresAt, lock.status, now]);

  const handleChat = async () => {
    setIsChatInitiating(true);
    try {
      await initiateChat({ accommodationLockId: lock.id });
    } finally {
      setIsChatInitiating(false);
    }
  };

  const handleComplete = () => {
    setLockedAccommodationFromLock(
      lock as unknown as IAccommodationLockResponse,
      property.name,
      property.images[0]?.url || null
    );
    navigate('/confirm-booking');
  };

  const nights = useMemo(() => {
    const start = new Date(lock.checkInDate).getTime();
    const end = new Date(lock.checkOutDate).getTime();
    if (isNaN(start) || isNaN(end)) return 0;
    const diffTime = Math.abs(end - start);
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  }, [lock.checkInDate, lock.checkOutDate]);

  const addonsTotal = useMemo(() => {
    return (lock.customAddons || []).reduce((acc, addon) => acc + (addon.price || 0), 0);
  }, [lock.customAddons]);

  const baseTotal = lock.lockedPrice * lock.quantity * nights;
  const grandTotal = baseTotal + addonsTotal;

  // Render Status Badge and Countdown Card
  const renderCountdownBanner = () => {
    if (lock.status === 'converted') {
      return (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center mb-6">
          <div className="text-emerald-700 font-extrabold text-[12px] uppercase tracking-widest mb-1">Stay Booked Successfully!</div>
          <p className="text-[13px] text-slate-500 font-medium">This stay has already been fully purchased and confirmed.</p>
        </div>
      );
    }
    if (isExpired || lock.status === 'expired') {
      return (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center mb-6 animate-pulse">
          <div className="text-rose-600 font-extrabold text-[12px] uppercase tracking-widest mb-1">Lock Expired</div>
          <p className="text-[13px] text-slate-500 font-medium">The room inventory was released back to availability.</p>
        </div>
      );
    }
    if (lock.status === 'cancelled') {
      return (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center mb-6">
          <div className="text-slate-500 font-extrabold text-[12px] uppercase tracking-widest mb-1">Lock Cancelled</div>
          <p className="text-[13px] text-slate-500 font-medium">This reservation lock has been cancelled by traveler request.</p>
        </div>
      );
    }

    // Active lock countdown
    return (
      <div className="bg-linear-to-r from-[#ff7b54] to-[#ff5e62] text-white rounded-2xl p-4 text-center mb-6 shadow-md shadow-[#ff7b54]/10 animate-pulse relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-20">
          <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div className="text-white/80 font-black text-[10px] uppercase tracking-widest leading-none mb-1">Time remaining to complete booking</div>
        <div className="text-3xl font-black tracking-widest font-mono">{timeString}</div>
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-100 shrink-0 mt-12 lg:mt-0">
      <div className="lg:sticky lg:top-40">
        <div className="bg-white rounded-3xl md:rounded-4xl p-5 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100">
          
          <h3 className="text-lg font-black text-[#0e2a47] mb-4 flex items-center justify-between">
            <span>Locked Stay Details</span>
            {lock.status === 'active' && !isExpired && (
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            )}
          </h3>

          {/* Banner Status or Countdown */}
          {renderCountdownBanner()}

          {/* Locked Stay Information */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
            
            {/* Stay Dates grid */}
            <div className="flex border-b border-slate-200">
              <div className="flex-1 p-3 border-r border-slate-200 bg-slate-50/50">
                <span className="block text-[9px] font-black uppercase tracking-widest text-[#0e2a47] mb-0.5">Check-in</span>
                <span className="text-[13px] font-bold text-slate-700">
                  {formatLocalDate(lock.checkInDate)}
                </span>
              </div>
              <div className="flex-1 p-3 bg-slate-50/50">
                <span className="block text-[9px] font-black uppercase tracking-widest text-[#0e2a47] mb-0.5">Checkout</span>
                <span className="text-[13px] font-bold text-slate-700">
                  {formatLocalDate(lock.checkOutDate)}
                </span>
              </div>
            </div>

            {/* Room variant, quantity & nights */}
            <div className="p-4 space-y-3 bg-white">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Room Type</span>
                <span className="text-[#0e2a47] font-black">{lock.unit?.name || 'Selected Room'}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Nights</span>
                <span className="text-[#0e2a47] font-black">{nights} Night{nights !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quantity</span>
                <span className="text-[#0e2a47] font-black">{lock.quantity} Room{lock.quantity !== 1 ? 's' : ''}</span>
              </div>
            </div>

          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-4 mb-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#0e2a47] border-b border-slate-100 pb-2">
              Price Breakdown
            </h4>

            {/* Locked Unit Price x nights x rooms */}
            <div className="flex justify-between items-start text-slate-600 font-medium">
              <div className="flex flex-col">
                <span className="underline text-sm font-semibold">${lock.lockedPrice.toLocaleString()} x {nights} night{nights !== 1 ? 's' : ''}</span>
                {lock.quantity > 1 && (
                  <span className="text-slate-400 text-xs mt-0.5">For {lock.quantity} rooms</span>
                )}
              </div>
              <span className="text-sm font-bold text-slate-800">${baseTotal.toLocaleString()}</span>
            </div>

            {/* Custom Addons pricing section */}
            {lock.customAddons && lock.customAddons.length > 0 && (
              <div className="space-y-2.5 pt-1.5 border-t border-slate-100">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Addons Selected</span>
                {lock.customAddons.map((addon) => (
                  <div key={addon.id} className="flex justify-between items-center text-slate-600 text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0e2a47]">{addon.name}</span>
                      {addon.details && (
                        <span className="text-slate-400 text-[10px] line-clamp-1">{addon.details}</span>
                      )}
                    </div>
                    <span className="font-bold text-emerald-600">+${addon.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-black text-[#0e2a47]">Grand Total</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#2dd4af] tracking-tight">
                  ${grandTotal.toLocaleString()}
                </span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">inclusive of all charges</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {lock.status === 'active' && !isExpired ? (
              <>
                <button
                  onClick={handleComplete}
                  className="w-full py-4 bg-[#2dd4af] hover:bg-[#25b898] text-white font-black rounded-xl transition-all shadow-lg shadow-[#2dd4af]/20 active:scale-[0.98] text-[15px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Complete Booking
                </button>

                <button
                  onClick={handleChat}
                  disabled={isChatInitiating}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-[#0e2a47] font-black rounded-xl transition-all border border-slate-200 text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
                >
                  {isChatInitiating ? (
                    <div className="w-4 h-4 border-2 border-[#2dd4af] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  )}
                  Chat with Merchant
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[14px] uppercase tracking-wider cursor-not-allowed border border-slate-200/50"
              >
                Booking Closed
              </button>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
};
