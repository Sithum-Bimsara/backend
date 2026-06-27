import React, { useState } from 'react';
import type { IDealVariant, IBookingSummary, ILockSummary } from '../types/deals.types';
import type { SlotData } from './DealCalendarDayColumn';

interface Props {
  selectedSlot: {
    variant: IDealVariant;
    slot: SlotData;
    index: number;
  } | null;
  onClose: () => void;
  onCancelVariant: (variantId: string) => Promise<void>;
  onRestoreVariant: (variantId: string) => Promise<void>;
  onCancelSlot: (slotId: string) => Promise<void>;
  onRestoreSlot: (slotId: string) => Promise<void>;
}

const DealSlotDetailModal: React.FC<Props> = ({
  selectedSlot,
  onClose,
  onCancelVariant,
  onRestoreVariant,
  onCancelSlot,
  onRestoreSlot,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedSlot) return null;

  const canCancelSelectedSlot = Boolean(selectedSlot.slot.id) && !isProcessing;
  const isLegacySlot = !selectedSlot.slot.id;

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try {
      await action();
      onClose();
    } catch {
      // The parent will handle notification
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0e2a47]/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slot #{selectedSlot.index + 1}</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
              selectedSlot.slot.type === 'available' ? 'bg-emerald-50 text-emerald-600' :
              selectedSlot.slot.type === 'cancelled' ? 'bg-red-50 text-red-500' :
              selectedSlot.slot.type === 'locked' ? 'bg-amber-50 text-amber-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                selectedSlot.slot.type === 'available' ? 'bg-emerald-500' :
                selectedSlot.slot.type === 'cancelled' ? 'bg-red-400' :
                selectedSlot.slot.type === 'locked' ? 'bg-amber-500' :
                'bg-blue-500'
              }`} />
              {selectedSlot.slot.status.charAt(0).toUpperCase() + selectedSlot.slot.status.slice(1)}
            </span>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors border-none cursor-pointer bg-transparent">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-6">
          
          {/* Booked State */}
          {selectedSlot.slot.type === 'booked' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {(selectedSlot.slot.data as IBookingSummary).user?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{(selectedSlot.slot.data as IBookingSummary).user?.name}</p>
                  <p className="text-xs text-slate-400">{(selectedSlot.slot.data as IBookingSummary).user?.email}</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-500 uppercase">Booked Slots</span>
                <span className="text-lg font-black text-slate-800">
                  {(selectedSlot.slot.data as IBookingSummary)._count?.slots || (selectedSlot.slot.data as IBookingSummary).quantity || 1}
                </span>
              </div>
            </div>
          )}

          {/* Locked State */}
          {selectedSlot.slot.type === 'locked' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                  {(selectedSlot.slot.data as ILockSummary).user?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{(selectedSlot.slot.data as ILockSummary).user?.name}</p>
                  <p className="text-xs text-slate-400">Holding during checkout</p>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs font-bold text-amber-500 uppercase mb-1">Status</p>
                <p className="text-sm font-bold text-slate-800">Temporary Hold</p>
                <p className="text-xs text-slate-400 mt-1">This slot is locked while the customer completes checkout.</p>
              </div>
            </div>
          )}

          {/* Available State */}
          {selectedSlot.slot.type === 'available' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-400 mb-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Available for Booking</h4>
                <p className="text-xs text-slate-400 max-w-xs">This slot is live. You can cancel it individually or cancel the entire day's variant.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  disabled={!canCancelSelectedSlot}
                  onClick={() => {
                    if (selectedSlot.slot.id) {
                      handleAction(() => onCancelSlot(selectedSlot.slot.id!));
                    } else {
                      alert('This legacy slot cannot be cancelled directly. Please refresh the page.');
                    }
                  }}
                  className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-none ${
                    !canCancelSelectedSlot
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer shadow-lg shadow-slate-200'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Cancel This Slot'}
                </button>
                {isLegacySlot && (
                  <p className="px-1 text-[11px] leading-5 text-slate-400 text-center">
                    This slot was generated without a backend slot id, so it cannot be cancelled individually.
                    Use <span className="font-bold text-slate-600">Cancel Entire Day</span> instead.
                  </p>
                )}
                <button
                  disabled={isProcessing}
                  onClick={() => handleAction(() => onCancelVariant(selectedSlot.variant.id))}
                  className="w-full py-4 rounded-2xl bg-red-50 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors border border-red-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel Entire Day
                </button>
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {selectedSlot.slot.type === 'cancelled' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-300 mb-3">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><polyline points="12 2 12 12" /></svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Cancelled Slot</h4>
                <p className="text-xs text-slate-400 max-w-xs">This slot was manually cancelled. Restore it to make it bookable again.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  disabled={isProcessing || !selectedSlot.slot.id}
                  onClick={() => {
                    if (selectedSlot.slot.id) {
                      handleAction(() => onRestoreSlot(selectedSlot.slot.id!));
                    } else {
                      alert('This legacy slot cannot be restored directly. Please refresh the page.');
                    }
                  }}
                  className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-none ${
                    (isProcessing || !selectedSlot.slot.id)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-[#2dd4af] text-white hover:bg-[#25b191] cursor-pointer shadow-lg shadow-[#2dd4af]/20'
                  }`}
                >
                  {isProcessing ? 'Restoring...' : 'Restore This Slot'}
                </button>
                {selectedSlot.variant.status === 'cancelled' && (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(() => onRestoreVariant(selectedSlot.variant.id))}
                    className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors border border-emerald-100 cursor-pointer disabled:opacity-50"
                  >
                    Restore Entire Day
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Universal Close Button for bottom spacing in all states */}
          {selectedSlot.slot.type !== 'available' && selectedSlot.slot.type !== 'cancelled' && (
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer border-none"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealSlotDetailModal;
