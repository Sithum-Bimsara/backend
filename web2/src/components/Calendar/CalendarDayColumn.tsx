import React from 'react';
import type { IRoomInventory, IRoomInventorySlot } from '../../features/Accommodation/types/accommodation.types';
import InventoryLoadingSkeleton from '../../features/Accommodation/components/InventoryLoadingSkeleton';

interface CalendarDayColumnProps {
  isToday: boolean;
  isPast: boolean;
  inventoryLoading: boolean;
  dayInventory: IRoomInventory | null | undefined;
  onSelectSlot: (inventory: IRoomInventory, slot: IRoomInventorySlot, index: number) => void;
}

const CalendarDayColumn: React.FC<CalendarDayColumnProps> = ({
  isToday,
  isPast,
  inventoryLoading,
  dayInventory,
  onSelectSlot,
}) => {
  return (
    <div className={`flex flex-col p-2 border-r border-b border-slate-100 last:border-r-0 gap-2 h-full min-h-0 ${isToday ? 'bg-[#2dd4af]/2' : isPast ? 'bg-slate-50/30' : 'bg-white'}`}>
      <div className="flex-1 flex flex-col gap-1.5 min-h-0">
        {inventoryLoading ? (
          <InventoryLoadingSkeleton rows={5} />
        ) : !dayInventory ? (
          <div className="flex-1 flex items-center justify-center opacity-20">
            <div className="w-1 h-12 bg-slate-200 rounded-full" />
          </div>
        ) : (
          dayInventory.slots?.map((slot: IRoomInventorySlot, sIdx: number) => {
            const isBooked = slot.status === 'booked' || (slot.bookings && slot.bookings.length > 0);
            const isLocked = slot.status === 'locked' || (slot.locks && slot.locks.length > 0);
            const isBlocked = slot.status === 'blocked' || dayInventory.status === 'blocked';

            let bgColor = 'bg-slate-200';
            let label = '';
            if (isBooked) {
              bgColor = 'bg-emerald-500';
              label = slot.bookings?.[0]?.user?.name || 'Booked';
            } else if (isLocked) {
              bgColor = 'bg-amber-400';
              label = slot.locks?.[0]?.user?.name || 'Locked';
            } else if (isBlocked) {
              bgColor = 'bg-red-300';
            }

            return (
              <button
                key={slot?.id || sIdx}
                disabled={isPast}
                onClick={() => {
                  if (isPast) return;
                  onSelectSlot(dayInventory, slot, sIdx);
                }}
                className={`w-full min-h-10 flex-1 rounded-lg border-none cursor-pointer transition-all hover:opacity-80 relative overflow-hidden ${bgColor} ${isPast ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
              >
                {(isBooked || isLocked) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <span className="text-[8px] font-black text-black uppercase tracking-tighter -rotate-12 whitespace-nowrap">
                      {label?.split?.(' ')?.[0] || ''}
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CalendarDayColumn;
