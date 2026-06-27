import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { IDealVariant } from '../types/deals.types';
import type { UpdateVariantDto } from '../dtos/deals.dtos';
import { formatLocalDate } from '../../../lib/date-utils';

interface Props {
  variant: IDealVariant;
  dealIsActive: boolean;
  isLocalOnly: boolean;
  currency: string;
  onSubmit: (id: string, data: UpdateVariantDto) => Promise<void>;
  onClose: () => void;
}

const EditVariantModal: React.FC<Props> = ({ variant, onSubmit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // ─── Lifecycle & Animation Handlers ───
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(onClose, 350);
  }, [onClose, isAnimating]);
  const [form, setForm] = useState<UpdateVariantDto>({
    totalSlots: variant.totalSlots ?? 0,
    availableSlots: variant.availableSlots ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const occupiedSlots = variant.slots 
    ? variant.slots.filter((s) => s.status === 'booked' || s.status === 'locked').length 
    : 0;
  
  const cancelledSlots = variant.slots 
    ? variant.slots.filter((s) => s.status === 'cancelled').length 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.totalSlots === undefined || form.totalSlots < 1 || form.totalSlots > 15) {
      setError('Slots per variant must be between 1 and 15');
      return;
    }
    if (form.totalSlots < occupiedSlots) {
      setError(`Cannot reduce below ${occupiedSlots} booked/locked slots`);
      return;
    }


    setError(null);
    setLoading(true);
    try {
      const payload: UpdateVariantDto = { ...form };
      if (payload.totalSlots !== undefined) {
        payload.availableSlots = Math.max(0, payload.totalSlots - occupiedSlots - Math.min(cancelledSlots, payload.totalSlots - occupiedSlots));
      }
      await onSubmit(variant.id, payload);
      handleClose();
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const isPriceLocked = false; // Pricing no longer managed here
  const lockReason = null;

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={loading ? undefined : handleClose} 
      />

      {/* Modal Content */}
      <div 
        className={`
          relative bg-white w-full sm:h-auto sm:max-h-[98vh] sm:max-w-md rounded-t-3xl sm:rounded-3xl 
          shadow-2xl will-change-transform overflow-hidden
          transition-all duration-[350ms] sm:duration-200
          ${isVisible 
            ? 'translate-y-0 opacity-100 sm:scale-100' 
            : 'translate-y-full opacity-0 sm:scale-95'
          }
          ease-[cubic-bezier(0.22,1,0.36,1)] sm:ease-out
        `}
        style={{ transform: !isVisible && !window.matchMedia('(min-width: 640px)').matches ? 'translate3d(0, 100%, 0)' : undefined }}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center py-2 sticky top-0 bg-white z-20">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-base font-bold text-[#0e2a47]">Edit Variant</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatLocalDate(variant.startDatetime, { weekday: 'short', month: 'short', day: 'numeric' }) || 'No date'}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border-none cursor-pointer bg-transparent disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] sm:max-h-none overflow-y-auto custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          {/* Status info */}
          <div className="space-y-2">
            {isPriceLocked && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold leading-tight uppercase tracking-wider">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                {lockReason}
              </div>
            )}
            {cancelledSlots > 0 && !isPriceLocked && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-medium leading-tight">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                {cancelledSlots} slot(s) are currently cancelled.
              </div>
            )}
          </div>



          {/* Slots */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Slots</label>
            <input
              type="number"
              value={form.totalSlots}
              onChange={(e) => setForm((f) => ({ ...f, totalSlots: Math.min(15, Math.max(1, Number(e.target.value))) }))}
              min={1}
              max={15}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all font-bold disabled:bg-slate-50 disabled:opacity-50"
            />
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Min: 1 · Max: 15 · Occupied slots cannot be removed.
            </p>
          </div>



          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all border-none cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2dd4af] hover:bg-[#25b898] shadow-md shadow-[#2dd4af]/20 transition-all border-none cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantModal;
