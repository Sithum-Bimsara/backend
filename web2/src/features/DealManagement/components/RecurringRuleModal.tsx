import React, { useState, useEffect, useCallback } from 'react';
import type { BulkGenerateVariantsDto, RecurringType } from '../dtos/deals.dtos';
import { getLocalDateStr, formatLocalDate, formatLiteralTime } from '../../../lib/date-utils';
import CustomTimePicker from '../../../components/Common/CustomTimePicker';
import { CustomDatePicker } from '../../../components/Common/CustomDatePicker';
import { useDealRecurringVariants } from '../hooks/useDealRecurringVariants';

interface Props {
  dealId: string;
  dealIsActive: boolean;
  isLocalOnly: boolean;
  currency: string;
  onSubmit: (data: BulkGenerateVariantsDto) => Promise<void>;
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RecurringRuleModal: React.FC<Props> = ({ dealId, onSubmit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // ─── Lifecycle & Animation Handlers ───
  useEffect(() => {
    // Initial entrance
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
    // Wait for the longest transition (350ms mobile) before unmounting
    setTimeout(onClose, 350);
  }, [onClose, isAnimating]);

  const {
    form,
    previewDates,
    previewLoading,
    loading,
    error,
    conflictingDates,
    today,
    maxEndDate,
    setForm,
    setError,
    setPreviewDates,
    setConflictingDates,
    toggleDay,
    generateVariants: handleSubmit,
  } = useDealRecurringVariants({
    dealId,
    onSubmit,
    onSuccess: handleClose,
  });

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
          relative bg-white w-full sm:h-auto sm:max-h-[98vh] sm:max-w-lg rounded-t-3xl sm:rounded-3xl 
          shadow-2xl will-change-transform overflow-hidden
          transition-all duration-350 sm:duration-200
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-white z-10">
          <h3 className="text-[15px] font-bold text-[#0e2a47]">Recurring Availability</h3>
          <button 
            onClick={handleClose} 
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border-none cursor-pointer bg-transparent disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </div>
          )}

          {/* Repeat Type Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Repeat Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['once', 'daily', 'weekly', 'interval'] as RecurringType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, repeatType: type, startDate: '', endDate: '' }));
                    setPreviewDates([]);
                    setConflictingDates([]);
                    setError(null);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold capitalize transition-all border cursor-pointer ${
                    form.repeatType === type
                      ? 'bg-[#2dd4af] text-white border-[#2dd4af] shadow-md shadow-[#2dd4af]/10'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week / Interval */}
          {(form.repeatType === 'weekly' || form.repeatType === 'interval') && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                {form.repeatType === 'weekly' ? 'Days of Week' : 'Frequency (Every N days)'}
              </label>
              {form.repeatType === 'weekly' ? (
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-9 h-9 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                        (form.daysOfWeek || []).includes(idx)
                          ? 'bg-[#0e2a47] text-white border-[#0e2a47] shadow-md shadow-[#0e2a47]/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number"
                  value={form.interval || 2}
                  onChange={(e) => setForm((f) => ({ ...f, interval: Math.max(1, Number(e.target.value)) }))}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] focus:outline-none focus:border-[#2dd4af] font-bold"
                />
              )}
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomDatePicker
                label={form.repeatType === 'once' ? 'Date' : 'Start Date'}
                value={form.startDate}
                minDate={today}
                onChange={(val) => setForm((f) => ({ ...f, startDate: val, endDate: f.repeatType === 'once' ? val : f.endDate }))}
                compact
              />
            </div>
            <div className={form.repeatType === 'once' ? 'opacity-40 pointer-events-none' : ''}>
              <CustomDatePicker
                label="End Date"
                value={form.endDate}
                minDate={form.startDate || today}
                maxDate={maxEndDate}
                onChange={(val) => setForm((f) => ({ ...f, endDate: val }))}
                compact
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomTimePicker
                label="Start Time"
                value={form.timeOfDay || '09:00'}
                onChange={(time) => setForm((f) => ({ ...f, timeOfDay: time }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Slots</label>
              <input
                type="number"
                value={form.totalSlots}
                onChange={(e) => setForm((f) => ({ ...f, totalSlots: Math.min(15, Math.max(1, Number(e.target.value))) }))}
                min={1}
                max={15}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[13px] text-[#0e2a47] font-bold focus:outline-none focus:border-[#2dd4af] transition-all"
              />
            </div>
          </div>



          {/* Preview Results (Scrollable) */}
          {(previewDates.length > 0 || previewLoading) && (
            <div className="space-y-2 pt-1 border-t border-slate-50">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preview Dates</span>
                  {previewLoading && (
                    <svg className="animate-spin w-3 h-3 text-[#2dd4af]" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                    </svg>
                  )}
                </div>
                {previewDates.length > 0 && !previewLoading && (
                  <span className="text-[10px] font-black text-[#2dd4af]">{previewDates.length} SLOTS</span>
                )}
              </div>
              
              <div className={`max-h-35 overflow-y-auto pr-1.5 space-y-1.5 custom-scrollbar border border-slate-50 rounded-xl p-1.5 bg-slate-50/30 transition-opacity duration-200 ${previewLoading ? 'opacity-40' : 'opacity-100'}`}>
                {previewDates.map((date) => {
                  const isConflict = conflictingDates.some(cd => getLocalDateStr(cd) === getLocalDateStr(date));
                  return (
                    <div 
                      key={date} 
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                        isConflict ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConflict ? 'bg-red-500 animate-pulse' : 'bg-[#2dd4af]'}`} />
                        <span className="text-[11px] font-bold">
                          {formatLocalDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold opacity-40">{formatLiteralTime(date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || previewLoading || conflictingDates.length > 0 || !form.startDate || (form.repeatType !== 'once' && !form.endDate)}
              className="w-full py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white bg-[#0e2a47] hover:bg-[#1a3a5a] shadow-lg shadow-[#0e2a47]/10 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                </svg>
              ) : 'Generate Availability'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-all"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default RecurringRuleModal;
