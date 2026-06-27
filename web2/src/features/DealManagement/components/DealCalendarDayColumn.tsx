import React from 'react';
import type { IDealVariant, IBookingSummary, ILockSummary } from '../types/deals.types';

export interface SlotData {
  id?: string;
  type: 'booked' | 'locked' | 'available' | 'cancelled';
  status: string;
  data?: IBookingSummary | ILockSummary;
}

interface Props {
  isToday: boolean;
  isPast: boolean;
  isLoading: boolean;
  variants: IDealVariant[];
  onVariantClick: (variant: IDealVariant) => void;
  onSelectSlot: (variant: IDealVariant, slot: SlotData, index: number) => void;
}

const getSlotUserLabel = (slot: SlotData): string | null => {
  if (slot.type === 'booked') {
    const booking = slot.data as IBookingSummary | undefined;
    return booking?.user?.name ? `Booked by ${booking.user.name}` : 'Booked';
  }

  if (slot.type === 'locked') {
    const lock = slot.data as ILockSummary | undefined;
    return lock?.user?.name ? `Locked by ${lock.user.name}` : 'Locked';
  }

  return null;
};

const getSlotUserName = (slot: SlotData): string | null => {
  if (slot.type === 'booked') return (slot.data as IBookingSummary)?.user?.name || null;
  if (slot.type === 'locked') return (slot.data as ILockSummary)?.user?.name || null;
  return null;
};

const DealCalendarDayColumn: React.FC<Props> = ({
  isToday,
  isPast,
  isLoading,
  variants,
  onVariantClick,
  onSelectSlot,
}) => {
  const getSlotsForVariant = (v: IDealVariant): SlotData[] => {
    if (v.slots && v.slots.length > 0) {
      return v.slots.map(s => {
        let type: SlotData['type'] = 'available';
        let data: IBookingSummary | ILockSummary | undefined;

        if (s.status === 'booked') {
          type = 'booked';
          data = s.bookings?.[0];
        } else if (s.status === 'locked') {
          type = 'locked';
          data = s.locks?.[0];
        } else if (s.status === 'cancelled') {
          type = 'cancelled';
        }

        if (v.status === 'cancelled') type = 'cancelled';

        return { id: s.id, type, status: s.status, data };
      });
    }

    const total = v.totalSlots || 0;
    const slots: SlotData[] = [];

    if (v.status === 'cancelled') {
      return new Array(total).fill({ type: 'cancelled', status: 'cancelled' });
    }

    v.bookings?.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'pending').forEach(b => {
      const qty = b.quantity || 0;
      for (let i = 0; i < qty; i++) {
        if (slots.length < total) slots.push({ type: 'booked', status: 'booked', data: b });
      }
    });

    v.locks?.forEach(l => {
      const qty = l.quantity || 0;
      for (let i = 0; i < qty; i++) {
        if (slots.length < total) slots.push({ type: 'locked', status: 'locked', data: l });
      }
    });

    while (slots.length < total) {
      slots.push({ type: 'available', status: 'available' });
    }

    return slots;
  };

  return (
    <div
      className={`flex flex-col p-2 border-r border-b border-slate-100 last:border-r-0 gap-2 min-h-[40vh] ${
        isToday ? 'bg-[#2dd4af]/2' : isPast ? 'bg-slate-50/30' : 'bg-white'
      }`}
    >
      {isLoading ? (
        <div className="space-y-2 animate-pulse mt-1">
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
      ) : variants.length === 0 ? (
        <div className="flex-1 flex items-center justify-center opacity-25">
          <div className="w-4 h-4 rounded-full bg-slate-200" />
        </div>
      ) : (
        variants.map((v) => {
          const variantSlots = getSlotsForVariant(v);
          const isCancelled = v.status === 'cancelled';

          return (
            <div
              key={v.id}
              className={`rounded-xl border overflow-hidden flex flex-col flex-1 ${
                isCancelled
                  ? 'border-red-100 bg-red-50/50 opacity-70'
                  : 'border-slate-100 bg-white shadow-sm'
              }`}
            >
              {/* Variant Card Header */}
              <button
                disabled={isPast}
                onClick={() => {
                  if (isPast) return;
                  onVariantClick(v);
                }}
                className={`w-full text-left px-2.5 pt-2 pb-1.5 hover:bg-slate-50 transition-colors border-none bg-transparent ${isPast ? 'cursor-not-allowed pointer-events-none opacity-50' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-end mb-0.5">
                  <span className={`text-[10px] font-bold ${isCancelled ? 'text-red-400' : 'text-[#2dd4af]'}`}>
                    ${v.displayedPrice}
                  </span>
                </div>
              </button>

              {/* Slot strips — vertical fill (each slot is a stacked horizontal band) */}
              <div className="flex flex-col flex-1 min-h-0 gap-px px-2 pb-2">
                {variantSlots.map((slot, sIdx) => (
                  <button
                    key={sIdx}
                    disabled={isPast}
                    onClick={() => {
                      if (isPast) return;
                      onSelectSlot(v, slot, sIdx);
                    }}
                    title={getSlotUserLabel(slot) || slot.type}
                    className={`relative flex-1 w-full rounded-sm border-none overflow-hidden min-h-3 ${
                      slot.type === 'booked'
                        ? 'bg-emerald-500'
                        : slot.type === 'locked'
                        ? 'bg-amber-400'
                        : slot.type === 'cancelled'
                        ? 'bg-red-300'
                        : 'bg-slate-200'
                    } ${isPast ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer transition-opacity hover:opacity-80'}`}
                  >
                    {/* Stylish crossly name overlay for booked/locked */}
                    {(slot.type === 'booked' || slot.type === 'locked') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 select-none overflow-hidden px-0.5">
                        {/* Desktop: Full Name */}
                        <span className="hidden sm:inline text-[9px] font-black text-black uppercase tracking-tighter whitespace-nowrap -rotate-12 scale-110">
                          {getSlotUserName(slot) || (slot.type === 'booked' ? 'Booked' : 'Locked')}
                        </span>
                        {/* Mobile: First Name or Short Code */}
                        <span className="sm:hidden text-[7px] font-black text-black uppercase tracking-tighter whitespace-nowrap -rotate-12 scale-110">
                          {getSlotUserName(slot)?.split(' ')[0] || (slot.type === 'booked' ? 'BKD' : 'LCK')}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DealCalendarDayColumn;
