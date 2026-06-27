import React, { useMemo } from 'react';
import { formatLocalDate } from '../../../../lib/date-utils';
import type { IUnitDetail, IBedConfig, IRoomInventory } from '../../../../features/Deals/types/deals.types';
 
interface RoomCardProps {
  unit: IUnitDetail;
  isHotel: boolean;
  selectedRange: { checkIn: string | null; checkOut: string | null };
  onDateClick: (date: string, availableRooms: number) => void;
}
 
export const RoomCard: React.FC<RoomCardProps> = ({ 
  unit, 
  selectedRange, 
}) => {
  const displayPrice = unit.displayedPrice || 0;

  const guestRecommendation = useMemo(() => {
    const maxGuests = unit.maxGuests ?? 0;
    if (maxGuests > 2) return "Perfect for families or groups";
    if (maxGuests === 2) return "Ideal for couples or partners";
    return "Great choice for solo travelers";
  }, [unit.maxGuests]);



  return (
    <div className="bg-white rounded-3xl md:rounded-4xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group duration-500">
      <div className="p-5 md:p-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <h4 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl md:text-3xl font-black text-[#0e2a47] tracking-tight group-hover:text-[#2dd4af] transition-colors">
                  {unit.name}
                </h4>
              </div>

              <p className="text-[#2dd4af] text-[14px] font-bold mb-6 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {guestRecommendation}
              </p>
            </div>

            <div className="flex flex-col md:items-end shrink-0 w-full md:w-auto">
              <p className="text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-widest mb-1">Per night value</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-[42px] font-black text-[#0e2a47] tracking-tighter">${displayPrice.toLocaleString()}</span>
              </div>
              <div className="mt-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-[11px] font-bold flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                No payment required now
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-4 md:py-6 border-y border-slate-50">
            {unit.maxGuests && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Capacity</span>
                <span className="flex items-center gap-2 text-[#0e2a47] font-bold text-[13px] md:text-[15px]">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  {unit.maxGuests} Adults
                </span>
              </div>
            )}
            {unit.size && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Room Size</span>
                <span className="flex items-center gap-2 text-[#0e2a47] font-bold text-[13px] md:text-[15px]">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                  {unit.size} m² Space
                </span>
              </div>
            )}
            {unit.bathrooms && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Bathrooms</span>
                <span className="flex items-center gap-2 text-[#0e2a47] font-bold text-[13px] md:text-[15px]">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 6v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6" /><path d="M1 10h22" /><path d="M8 2v4" /><path d="M16 2v4" /></svg>
                  {unit.bathrooms} {unit.isBathroomPrivate ? 'Private' : 'Shared'}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Bedding</span>
              <div className="flex flex-wrap gap-1">
                {unit.bedConfigs.map((bed: IBedConfig) => (
                  <span key={bed.id} className="text-[12px] md:text-[13px] text-[#0e2a47] font-bold">{bed.count} &times; {bed.bedType}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50/70 rounded-3xl md:rounded-4xl p-5 md:p-8 border border-slate-100 w-full">
            <h5 className="text-[11px] md:text-[12px] font-black text-[#0e2a47] uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2dd4af]"></div>
              Top Room Amenities
            </h5>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-x-10 gap-y-3 md:gap-y-4 mb-6">
              {unit.smokingAllowed !== null && (
                <span className={`text-[12px] md:text-[13px] font-bold flex items-center gap-2.5 ${!unit.smokingAllowed ? 'text-slate-400' : 'text-emerald-600'}`}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {!unit.smokingAllowed ? <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></> : <polyline points="20 6 9 17 4 12" />}
                  </svg>
                  {unit.smokingAllowed ? 'Smoking allowed' : 'Non-smoking room'}
                </span>
              )}
              {unit.excludeInfants !== undefined && (
                <span className="text-[12px] md:text-[13px] font-bold flex items-center gap-2.5 text-emerald-600">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {unit.excludeInfants 
                    ? 'Infants (under 2) stay for free' 
                    : 'Infants (under 2) counted as guests'}
                </span>
              )}
              {unit.cribsAvailable !== null && unit.cribsAvailable && (
                <span className="text-[12px] md:text-[13px] font-bold text-emerald-600 flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  Cribs available (ages 0-3)
                </span>
              )}
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-200/60 space-y-4 md:space-y-6">
              {unit.amenities && unit.amenities.length > 0 && (
                <div>
                  <h6 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Room Amenities</h6>
                  <div className="flex flex-wrap gap-2">
                    {unit.amenities.map((item: string) => (
                      <span key={item} className="text-[10px] md:text-[11px] font-black px-3 md:px-4 py-1 md:py-1.5 bg-white text-slate-500 rounded-lg md:rounded-xl border border-slate-200 uppercase tracking-tighter shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {unit.bathroomItems && unit.bathroomItems.length > 0 && (
                <div>
                  <h6 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bathroom</h6>
                  <div className="flex flex-wrap gap-2">
                    {unit.bathroomItems.map((item: string) => (
                      <span key={item} className="text-[10px] md:text-[11px] font-black px-3 md:px-4 py-1 md:py-1.5 bg-white text-slate-500 rounded-lg md:rounded-xl border border-slate-200 uppercase tracking-tighter shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Improved Availability Section */}
        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h5 className="text-[12px] font-black text-[#0e2a47] uppercase tracking-widest flex items-center gap-3">
              <div className="w-7 h-7 bg-[#2dd4af] text-[#0e2a47] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              Daily Rates & Real-time Availability
            </h5>
          </div>

          <div className="overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 max-w-full">
            <div className="flex flex-nowrap gap-3 md:gap-4 w-full">
              {unit.inventory.map((inv: IRoomInventory) => {
                const isSelectedStart = selectedRange.checkIn === inv.date;
                const isSelectedEnd = selectedRange.checkOut === inv.date;
                const isInRange = selectedRange.checkIn && selectedRange.checkOut &&
                  new Date(inv.date) >= new Date(selectedRange.checkIn) &&
                  new Date(inv.date) < new Date(selectedRange.checkOut);

                const cheapestInventoryPrice = [...unit.inventory].sort((a: IRoomInventory, b: IRoomInventory) => {
                  const getPrice = (i: IRoomInventory) => i.priceOverride || unit.displayedPrice || unit.pricePerNight || 0;
                  return getPrice(a) - getPrice(b);
                })[0];
                const isCheapest = cheapestInventoryPrice?.id === inv.id;

                return (
                  <div
                    key={inv.id}
                    className={`flex flex-col items-center justify-center p-3 md:p-5 rounded-[20px] md:rounded-3xl border-2 transition-all flex-none w-32.5 md:w-52.5 lg:w-[calc(25%-12px)] relative ${isSelectedStart || isInRange
                        ? 'bg-[#0e2a47] border-[#0e2a47] text-white shadow-xl z-10'
                        : isSelectedEnd
                          ? 'bg-white border-[#0e2a47] text-[#0e2a47] shadow-xl z-10'
                          : inv.availableRooms > 0
                            ? isCheapest
                              ? 'bg-emerald-50 border-emerald-500 shadow-md'
                              : 'bg-white border-slate-100'
                            : 'bg-slate-50 border-slate-200 opacity-60 grayscale'
                      }`}>
                    {isSelectedEnd && (
                      <div className="absolute -top-2.5 md:-top-3 px-2 md:px-3 py-1 bg-[#0e2a47] text-white text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">
                        Checkout
                      </div>
                    )}
                    <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1 md:mb-2 ${isSelectedStart || isInRange ? 'text-white/60' : 'text-slate-400'
                      }`}>
                      {formatLocalDate(inv.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className={`text-[16px] md:text-[18px] font-black tracking-tighter mb-1 md:mb-2 ${isSelectedStart || isInRange ? 'text-[#2dd4af]' : isCheapest ? 'text-emerald-700' : 'text-[#0e2a47]'
                      }`}>
                      ${(inv.priceOverride || displayPrice).toLocaleString()}
                    </span>
                    <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-widest border ${isSelectedStart || isInRange
                        ? 'bg-white/10 border-white/20 text-white'
                        : isSelectedEnd
                          ? 'bg-slate-100 border-[#0e2a47] text-[#0e2a47]'
                          : inv.availableRooms === 0
                            ? 'bg-slate-200 text-slate-500 border-transparent'
                            : inv.availableRooms <= 2
                              ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      {isSelectedEnd ? 'Leave' : inv.availableRooms === 0 ? 'Sold Out' : inv.availableRooms <= 2 ? `${inv.availableRooms} Left` : `${inv.availableRooms} Free`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {unit.inventory.length > 4 && (
            <p className="mt-4 text-[11px] text-slate-400 font-medium text-center italic">Scroll to view more dates &rsaquo;</p>
          )}
        </div>
      </div>
    </div>
  );
};
