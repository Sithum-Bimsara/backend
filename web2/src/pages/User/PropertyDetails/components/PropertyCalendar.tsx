import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, isBefore, startOfToday, parseISO } from 'date-fns';

interface PropertyCalendarProps {
  selectedRange: { checkIn: string | null; checkOut: string | null };
  onChange: (range: { checkIn: string | null; checkOut: string | null }) => void;
  onClose: () => void;
  minDate?: Date;
  availableDates?: string[];
}

const PropertyCalendar: React.FC<PropertyCalendarProps> = ({
  selectedRange,
  onChange,
  onClose,
  minDate = startOfToday(),
  availableDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef  = useRef<HTMLDivElement>(null);
  const nextMonth  = addMonths(currentMonth, 1);

  // Close desktop dropdown on outside click.
  // Guard with offsetParent check: when the element is display:none (mobile),
  // offsetParent is null and we skip the handler entirely.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        desktopRef.current &&
        desktopRef.current.offsetParent !== null && // only fires when visible
        !desktopRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!selectedRange.checkIn || (selectedRange.checkIn && selectedRange.checkOut)) {
      onChange({ checkIn: dateStr, checkOut: null });
    } else {
      if (isBefore(date, parseISO(selectedRange.checkIn))) {
        onChange({ checkIn: dateStr, checkOut: null });
      } else if (isSameDay(date, parseISO(selectedRange.checkIn))) {
        onChange({ checkIn: null, checkOut: null });
      } else {
        onChange({ checkIn: selectedRange.checkIn, checkOut: dateStr });
      }
    }
  };

  /* ─────────────────────────────────────────
     Shared day-grid renderer
     compact=true  → tiny cells for mobile
  ───────────────────────────────────────── */
  const renderMonth = (month: Date, compact = false) => {
    const start    = startOfMonth(month);
    const end      = endOfMonth(month);
    const days     = eachDayOfInterval({ start, end });
    const empties  = Array(start.getDay()).fill(null);

    const headerCls = compact
      ? 'text-center font-black text-[#0e2a47] mb-1.5 text-[10px] uppercase tracking-widest'
      : 'text-center font-black text-[#0e2a47] mb-2 text-sm uppercase tracking-widest';

    const dayLabelCls = compact
      ? 'text-center text-[7px] font-black text-slate-400 uppercase'
      : 'text-center text-[8px] font-black text-slate-400 uppercase';

    const cellCls = (isDisabled: boolean, isStart: boolean, isEnd: boolean, inRange: boolean) => {
      const base = compact
        ? 'h-7 w-full flex items-center justify-center rounded text-[11px] font-bold transition-all relative'
        : 'h-8 w-full flex items-center justify-center rounded-lg text-[13px] font-bold transition-all relative';
      const state = isDisabled
        ? 'text-slate-200 cursor-not-allowed opacity-40'
        : isStart || isEnd
          ? 'bg-[#0e2a47] text-white shadow-md z-10'
          : inRange
            ? 'bg-slate-50 text-[#0e2a47]'
            : 'text-[#0e2a47] hover:bg-slate-100';
      return `${base} ${state}`;
    };

    return (
      <div className="flex-1 min-w-0">
        <h4 className={headerCls}>{format(month, 'MMMM yyyy')}</h4>
        <div className={`grid grid-cols-7 ${compact ? 'gap-0.5 mb-1' : 'gap-1 mb-2'}`}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className={dayLabelCls}>{d}</div>
          ))}
        </div>
        <div className={`grid grid-cols-7 ${compact ? 'gap-0.5' : 'gap-1'}`}>
          {empties.map((_, i) => <div key={`e-${i}`} />)}
          {days.map(day => {
            const dateStr      = format(day, 'yyyy-MM-dd');
            const isStart      = selectedRange.checkIn  === dateStr;
            const isEnd        = selectedRange.checkOut === dateStr;
            const inRange      = !!(selectedRange.checkIn && selectedRange.checkOut &&
              isWithinInterval(day, { start: parseISO(selectedRange.checkIn), end: parseISO(selectedRange.checkOut) }));
            const isAvailable  = !availableDates || availableDates.includes(dateStr);
            const isDisabled   = isBefore(day, minDate) || !isAvailable;

            return (
              <button
                key={dateStr}
                onClick={() => !isDisabled && handleDateClick(day)}
                disabled={isDisabled}
                className={cellCls(isDisabled, isStart, isEnd, inRange)}
              >
                {format(day, 'd')}
                {isStart && <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-[#2dd4af] rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─── Nav buttons (shared) ─── */
  const Nav = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex gap-1">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className={`${compact ? 'p-1' : 'p-2'} hover:bg-slate-50 rounded-lg border border-slate-100 transition-all text-[#0e2a47]`}
      >
        <svg viewBox="0 0 24 24" className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className={`${compact ? 'p-1' : 'p-2'} hover:bg-slate-50 rounded-lg border border-slate-100 transition-all text-[#0e2a47]`}
      >
        <svg viewBox="0 0 24 24" className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );

  return (
    <>
      {/* ── Desktop: absolute dropdown (md+) ── */}
      <div
        ref={desktopRef}
        className="hidden md:block absolute top-[50px] right-0 bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-100 p-6 z-[100] w-[600px] animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-black text-[#0e2a47]">Select Dates</h3>
            <p className="text-[12px] text-slate-400 font-medium">Add dates for exact pricing</p>
          </div>
          <Nav />
        </div>
        <div className="flex gap-8">
          {renderMonth(currentMonth)}
          {renderMonth(nextMonth)}
        </div>
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <button onClick={() => onChange({ checkIn: null, checkOut: null })} className="text-xs font-black text-[#0e2a47] underline underline-offset-4 hover:text-slate-600 transition-colors">
            Clear dates
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-[#0e2a47] text-white font-black rounded-lg hover:bg-slate-800 transition-all text-[11px] uppercase tracking-widest">
            Apply
          </button>
        </div>
      </div>

      {/* ── Mobile: compact bottom-sheet (below md) ── */}
      <div className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Sheet — deliberately compact */}
        <div
          ref={mobileRef}
          className="relative bg-white rounded-t-2xl px-4 pt-3 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-full duration-250"
        >
          {/* Drag handle */}
          <div className="w-8 h-0.5 bg-slate-200 rounded-full mx-auto mb-3" />

          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] font-black text-[#0e2a47] uppercase tracking-widest leading-none">Select Dates</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Add dates for exact pricing</p>
            </div>
            <Nav compact />
          </div>

          {/* Single month grid */}
          {renderMonth(currentMonth, true)}

          {/* Footer */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onChange({ checkIn: null, checkOut: null })}
              className="text-[10px] font-black text-[#0e2a47] underline underline-offset-2 hover:text-slate-600 transition-colors"
            >
              Clear dates
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0e2a47] text-white font-black rounded-lg hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyCalendar;
