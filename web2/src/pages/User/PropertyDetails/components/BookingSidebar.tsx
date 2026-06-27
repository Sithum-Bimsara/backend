import React from 'react';
import PropertyCalendar from './PropertyCalendar';
import { formatLocalDate, getLocalDateStr } from '../../../../lib/date-utils';
import { toast } from 'react-hot-toast';
import type { IPropertyDetail, IUnitDetail, IRoomInventory } from '../../../../features/Deals/types/deals.types';

interface BookingSidebarProps {
  property: IPropertyDetail;
  lowestPrice: number;
  selectedRange: { checkIn: string | null; checkOut: string | null };
  setSelectedRange: (range: { checkIn: string | null; checkOut: string | null }) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  showDateError: boolean;
  setShowDateError: (show: boolean) => void;
  availableDates: string[];
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
  handleBook: (unitId: string, unitName: string, quantity: number) => void;
  isLocking: boolean;
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({
  property,
  lowestPrice,
  selectedRange,
  setSelectedRange,
  isCalendarOpen,
  setIsCalendarOpen,
  showDateError,
  setShowDateError,
  availableDates,
  selectedUnitId,
  setSelectedUnitId,
  handleBook,
  isLocking
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const getUnitPrice = (u?: IUnitDetail) => u?.displayedPrice || 0;

  const maxAvailable = React.useMemo(() => {
    if (!selectedUnitId) return 10;

    const unit = property.units.find((u: IUnitDetail) => u.id === selectedUnitId);
    if (!unit) return 10;

    if (!selectedRange.checkIn || !selectedRange.checkOut) {
      return unit.totalInventory || 10;
    }

    const startStr = selectedRange.checkIn;
    const endStr = selectedRange.checkOut;

    if (!unit.inventory || unit.inventory.length === 0) {
      return 0;
    }

    const activeInventory = unit.inventory.filter((inv: IRoomInventory) => {
      const dateStr = getLocalDateStr(inv.date);
      return dateStr >= startStr && dateStr < endStr;
    });

    if (activeInventory.length === 0) {
      return 0;
    }

    const minRooms = Math.min(...activeInventory.map((inv: IRoomInventory) => inv.availableRooms ?? 0));
    return Math.max(0, minRooms);
  }, [property.units, selectedUnitId, selectedRange.checkIn, selectedRange.checkOut]);

  React.useEffect(() => {
    if (quantity > maxAvailable && maxAvailable > 0) {
      setQuantity(maxAvailable);
    }
  }, [maxAvailable, quantity]);
  
  return (
    <aside className="w-full lg:w-100 shrink-0 mt-12 lg:mt-0">
      <div className="lg:sticky lg:top-40">
        <div className="bg-white rounded-3xl md:rounded-4xl py-2 px-4 md:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-xl font-black text-[#0e2a47] tracking-tight">${lowestPrice.toLocaleString()}</span>
              <span className="text-slate-400 font-bold ml-1">/ night</span>
            </div>
          </div>

          <div className={`relative border ${showDateError ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-400'} rounded-xl mb-4 transition-all duration-300`}>
            <div className="flex border-b border-slate-400">
              <div
                className="flex-1 p-3 border-r border-slate-400 cursor-pointer hover:bg-slate-50 transition-all"
                onClick={() => {
                  setIsCalendarOpen(!isCalendarOpen);
                  setShowDateError(false);
                }}
              >
                <label className={`block text-[10px] font-black uppercase tracking-widest ${showDateError ? 'text-rose-500' : 'text-[#0e2a47]'}`}>Check-in</label>
                <p className="text-[13px] font-medium text-slate-600">{selectedRange.checkIn ? formatLocalDate(selectedRange.checkIn, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Add date'}</p>
              </div>
              <div
                className="flex-1 p-3 cursor-pointer hover:bg-slate-50 transition-all"
                onClick={() => {
                  setIsCalendarOpen(!isCalendarOpen);
                  setShowDateError(false);
                }}
              >
                <label className={`block text-[10px] font-black uppercase tracking-widest ${showDateError ? 'text-rose-500' : 'text-[#0e2a47]'}`}>Checkout</label>
                <p className="text-[13px] font-medium text-slate-600">{selectedRange.checkOut ? formatLocalDate(selectedRange.checkOut, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Add date'}</p>
              </div>
            </div>
            
            {isCalendarOpen && (
              <PropertyCalendar 
                selectedRange={selectedRange}
                onChange={setSelectedRange}
                onClose={() => setIsCalendarOpen(false)}
                availableDates={availableDates}
              />
            )}

            <div className="p-3 bg-white border-t border-slate-400">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0e2a47] mb-1">Select Room Type</label>
                  <select
                    value={selectedUnitId || ''}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full text-[12px] font-bold text-[#0e2a47] bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a room...</option>
                    {property.units.map((u: IUnitDetail) => (
                      <option key={u.id} value={u.id}>{u.name} - ${getUnitPrice(u)}</option>
                    ))}
                  </select>
                </div>
                <div className="pl-4 border-l border-slate-100 flex flex-col items-end">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0e2a47] mb-1">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button 
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        quantity <= 1 
                          ? 'border-slate-100 text-slate-200 cursor-not-allowed' 
                          : 'border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 cursor-pointer'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span className="text-sm font-black text-[#0e2a47] w-4 text-center">{quantity}</span>
                    <button 
                      disabled={quantity >= maxAvailable}
                      onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        quantity >= maxAvailable 
                          ? 'border-slate-100 text-slate-200 cursor-not-allowed' 
                          : 'border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 cursor-pointer'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {selectedRange.checkIn && selectedRange.checkOut && selectedUnitId && (
              <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-400 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Rooms available for stay</span>
                <span className={maxAvailable === 0 ? 'text-rose-500 font-extrabold' : maxAvailable <= 2 ? 'text-amber-500 font-extrabold' : 'text-emerald-500 font-extrabold'}>
                  {maxAvailable === 0 ? 'Sold Out' : `${maxAvailable} Left`}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (selectedUnitId) {
                const unit = property.units.find((u: IUnitDetail) => u.id === selectedUnitId);
                if (unit) handleBook(unit.id, unit.name, quantity);
              } else {
                document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
                toast.error('Please select a room type from the list');
              }
            }}
            disabled={isLocking || (selectedRange.checkIn !== null && selectedRange.checkOut !== null && maxAvailable === 0)}
            className={`w-full py-4 text-white font-black rounded-xl transition-all shadow-lg text-lg uppercase tracking-tight mb-4 ${
              isLocking || (selectedRange.checkIn !== null && selectedRange.checkOut !== null && maxAvailable === 0)
                ? 'bg-slate-300 shadow-none cursor-not-allowed opacity-80'
                : 'bg-linear-to-r from-[#e61e4d] to-[#d70466] hover:opacity-90'
            }`}
          >
            {isLocking ? 'Processing...' : !!(selectedRange.checkIn && selectedRange.checkOut && maxAvailable === 0) ? 'Sold Out' : 'Lock'}
          </button>

          <p className="text-center text-sm text-slate-500 font-medium mb-6">You won't be charged yet</p>

          {selectedRange.checkIn && selectedRange.checkOut && selectedUnitId && (
            <div className="space-y-3">
              {(() => {
                const unit = property.units.find((u: IUnitDetail) => u.id === selectedUnitId);
                const start = new Date(selectedRange.checkIn!);
                const end = new Date(selectedRange.checkOut!);
                const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                const price = getUnitPrice(unit);
                return (
                  <>
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span className="underline">${price.toLocaleString()} x {nights} nights{quantity > 1 ? ` x ${quantity} rooms` : ''}</span>
                      <span>${(price * nights * quantity).toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between text-lg font-black text-[#0e2a47]">
                      <span>Total before taxes</span>
                      <span>${((price * nights * quantity)).toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
