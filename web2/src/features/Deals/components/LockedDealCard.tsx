import React, { useState, useMemo } from 'react';
import type { IUserLock } from '../types/deals.types';
import { formatLocalDate } from '../../../lib/date-utils';
import { resolveDealImageUrl } from '../../../lib/deal-image';
import { useChat } from '../../Chat/ChatContext';
import { useNavigate } from 'react-router-dom';

interface LockedDealCardProps {
  lock: IUserLock;
  now: number;
  onComplete: () => void;
}

const LockedDealCard: React.FC<LockedDealCardProps> = React.memo(({ lock, now, onComplete }) => {
  const { initiateChat } = useChat();
  const navigate = useNavigate();
  const [isLocalInitiating, setIsLocalInitiating] = useState(false);

  const handleChat = async () => {
    const params = lock.type === 'accommodation'
      ? { accommodationLockId: lock.id }
      : { dealLockId: lock.id };
    setIsLocalInitiating(true);
    try {
      await initiateChat(params);
    } finally {
      setIsLocalInitiating(false);
    }
  };

  // Derived countdown state
  const { isExpired, timeString } = useMemo(() => {
    if (!lock.expiresAt) return { isExpired: true, timeString: '00:00:00' };
    
    const expiry = new Date(lock.expiresAt as string).getTime();
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

  const primaryImage = useMemo(() => resolveDealImageUrl(lock.imageUrl), [lock.imageUrl]);

  return (
    <div className={`flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border transition-all duration-300 w-full group ${isExpired ? 'border-red-100 opacity-70' : 'border-black/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}`}>
      
      {/* Image - Desktop */}
      <div className="w-full md:w-60 h-40 md:h-auto shrink-0 relative overflow-hidden hidden md:block">
        <img 
          src={primaryImage} 
          alt={lock.title || 'Deal'} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          onError={(event) => {
            if (event.currentTarget.src !== resolveDealImageUrl(null)) {
              event.currentTarget.src = resolveDealImageUrl(null);
            }
          }}
        />
        {isExpired && (
          <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
            <span className="px-3 py-1 bg-red-500 text-white font-bold text-[12px] rounded-lg rotate-12">EXPIRED</span>
          </div>
        )}
      </div>

      {/* Image - Mobile */}
      <div className="w-full h-40 md:hidden relative">
          <img 
            src={primaryImage} 
            alt={lock.title || 'Deal'} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            onError={(event) => {
              if (event.currentTarget.src !== resolveDealImageUrl(null)) {
                event.currentTarget.src = resolveDealImageUrl(null);
              }
            }}
          />
           {isExpired && (
            <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
              <span className="px-3 py-1 bg-red-500 text-white font-bold text-[12px] rounded-lg rotate-12">EXPIRED</span>
            </div>
          )}
      </div>
      
      {/* Content */}
      <div className="flex flex-col md:flex-row flex-1 p-4 md:p-5 gap-4 md:gap-5">
        <div className="flex-1 flex flex-col justify-center">
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg md:text-xl font-extrabold text-[#0e2a47] leading-tight mb-1 group-hover:text-[#2dd4af] transition-colors duration-300">
            {lock.title || 'Unknown Deal'}
          </h3>
          <p className="text-[12px] text-slate-500 font-medium mb-1 flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {lock.location || 'Unknown Location'}
          </p>
          
          <div className="text-[12px] text-slate-600 mb-3 mt-1.5 line-clamp-2">
            {lock.type === 'accommodation' ? (
              <div className="flex flex-col">
                <span className="font-semibold text-[#0e2a47]">{lock.unitName}</span>
                <span>
                  {formatLocalDate(lock.checkInDate || '')} to {formatLocalDate(lock.checkOutDate || '')}
                </span>
              </div>
            ) : (
              <span>Date: {formatLocalDate(lock.variantDate || '')}</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-auto">
             <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 text-[10px] font-bold">
               {lock.type === 'accommodation' ? `${lock.quantity} Room${lock.quantity !== 1 ? 's' : ''}` : `${lock.quantity} Slot${lock.quantity !== 1 ? 's' : ''}`} Locked
             </span>
             {lock.status === 'converted' && (
               <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-[10px] font-bold">
                 Booked
               </span>
             )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 min-w-0 sm:min-w-37.5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-3 md:mt-0">
          <div className="text-left md:text-right flex-1 md:flex-none">
             <div className="text-[24px] font-black text-[#2dd4af] leading-none mb-1">
               ${(lock.price || 0).toFixed(1)}
             </div>
             
             {lock.status === 'active' && !isExpired && (
                <div className="text-[12px] font-bold text-[#ff7b54] flex items-center justify-start md:justify-end gap-1 mt-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {timeString}
                </div>
             )}
          </div>
          <div className="flex flex-col gap-1.5 mt-0 md:mt-4 w-full">
            {lock.status === 'active' && !isExpired && (
                <>
                  <button 
                    onClick={() => {
                      if (lock.type === 'accommodation' && lock.id) {
                        navigate(`/my-deals/accommodation/${lock.id}/details`);
                      } else if (lock.dealId) {
                        navigate(`/my-deals/${lock.dealId}/details`);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all text-[12px] cursor-pointer whitespace-nowrap"
                  >
                    View Details
                  </button>

                  <button 
                    onClick={handleChat}
                    disabled={isLocalInitiating}
                    className="w-full px-3 py-2 bg-white hover:bg-slate-50 text-[#0e2a47] font-bold rounded-xl transition-all border border-slate-200 text-[12px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 whitespace-nowrap"
                  >
                    {isLocalInitiating ? (
                      <div className="w-3.5 h-3.5 border-2 border-[#2dd4af] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    )}
                    Chat with Merchant
                  </button>

                  <button 
                    onClick={onComplete} 
                    className="w-full px-3 py-2 bg-[#2dd4af] hover:bg-[#25b898] text-[#ffffff] font-bold rounded-xl transition-all shadow-lg shadow-[#2dd4af]/20 active:scale-[0.98] text-[12px] cursor-pointer whitespace-nowrap"
                  >
                    Complete
                  </button>
                </>
            )}
            {isExpired && lock.status !== 'converted' && (
                 <button 
                 disabled
                 className="px-4 md:px-0 py-2 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed text-[13px]"
               >
                 Expired
               </button>
            )}
             {lock.status === 'converted' && (
                 <button 
                 disabled
                 className="px-4 md:px-0 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg cursor-default text-[13px]"
               >
                 Booked
               </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
});

export default LockedDealCard;
