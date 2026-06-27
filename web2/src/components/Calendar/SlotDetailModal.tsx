import React from 'react';
import type { IRoomInventory } from '../../features/Accommodation/types/accommodation.types';

interface SlotDetailModalProps {
  selectedSlot: {
    inventory: IRoomInventory;
    slot: NonNullable<IRoomInventory['slots']>[0];
    index: number;
  } | null;
  onClose: () => void;
  onBlockSlot: (slotId: string) => void;
  onRestoreSlot: (slotId: string) => void;
  slotProcessing: boolean;
  initiateChat: (params: { accommodationLockId: string }) => void;
  isInitiatingChat: boolean;
  selectedUnitRate: number | string;
}

const SlotDetailModal: React.FC<SlotDetailModalProps> = ({
  selectedSlot,
  onClose,
  onBlockSlot,
  onRestoreSlot,
  slotProcessing,
  initiateChat,
  isInitiatingChat,
  selectedUnitRate,
}) => {
  if (!selectedSlot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0e2a47]/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slot #{selectedSlot.index + 1}</p>
            <h3 className="text-xl font-bold text-[#0e2a47]">Room #{selectedSlot.slot?.roomNumber || 'N/A'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors border-none cursor-pointer bg-transparent">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${selectedSlot.slot?.status === 'booked' || selectedSlot.slot?.bookings?.length ? 'bg-emerald-500' :
              selectedSlot.slot?.status === 'locked' || selectedSlot.slot?.locks?.length ? 'bg-amber-400' :
                selectedSlot.slot?.status === 'blocked' || selectedSlot.inventory?.status === 'blocked' ? 'bg-red-300' : 'bg-slate-100'
              }`} />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              {selectedSlot.slot?.status === 'booked' || selectedSlot.slot?.bookings?.length ? 'Confirmed Booking' :
                selectedSlot.slot?.status === 'locked' || selectedSlot.slot?.locks?.length ? 'Temporary Lock' :
                  selectedSlot.slot?.status === 'blocked' || selectedSlot.inventory?.status === 'blocked' ? 'Manually Blocked' : 'Available'}
            </span>
          </div>

          {/* Booking Info */}
          {selectedSlot.slot?.bookings?.map((b: any) => (
            <div key={b.id} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Guest Details</p>
              <p className="font-bold text-[#0e2a47]">{b.user?.name || 'Guest'}</p>
              <p className="text-sm text-slate-500">{b.user?.email || 'No email'}</p>
            </div>
          ))}

          {/* Lock Info */}
          {selectedSlot.slot?.locks?.map((l: any) => (
            <div key={l.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-bold text-amber-600 uppercase mb-1">Lock Details</p>
              <p className="font-bold text-[#0e2a47] mb-3">{l.user?.name || 'User'}</p>

              <button
                onClick={() => initiateChat({ accommodationLockId: l.id })}
                disabled={isInitiatingChat}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0e2a47] font-bold text-xs transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isInitiatingChat ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#2dd4af] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                )}
                Chat with Guest
              </button>
            </div>
          ))}

          {/* Price Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-400 uppercase">Rate for this date</span>
            <span className="text-lg font-black text-[#0e2a47]">
              ${selectedSlot.inventory?.priceOverride || selectedUnitRate || '—'}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            {selectedSlot.slot?.status === 'available' && (
              <button
                onClick={() => onBlockSlot(selectedSlot.slot?.id || '')}
                disabled={slotProcessing}
                className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer border border-red-100"
              >
                {slotProcessing ? 'Processing...' : 'Block for Maintenance'}
              </button>
            )}
            {selectedSlot.slot?.status === 'blocked' && (
              <button
                onClick={() => onRestoreSlot(selectedSlot.slot?.id || '')}
                disabled={slotProcessing}
                className="w-full py-4 rounded-2xl bg-[#2dd4af] text-white font-bold text-sm hover:bg-[#25b191] transition-colors disabled:opacity-50 cursor-pointer border-none"
              >
                {slotProcessing ? 'Processing...' : 'Restore to Available'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer border-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotDetailModal;
