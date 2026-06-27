import React from 'react';

interface CalendarHeaderProps {
  startDate: Date;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  startDate,
  onPrevPeriod,
  onNextPeriod,
  onToday,
}) => {
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Weekly View</p>
        <h2 className="text-xs sm:text-sm font-bold text-[#0e2a47] truncate">
          <span className="sm:hidden">
            {startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
            <span className="text-slate-300 mx-1">—</span>
            {endDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="hidden sm:inline">
            {startDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
            <span className="text-slate-300 mx-2">—</span>
            {endDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </h2>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrevPeriod}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-none cursor-pointer bg-transparent"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={onToday}
          className="px-3 h-8 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer bg-white"
        >
          Today
        </button>
        <button
          onClick={onNextPeriod}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border-none cursor-pointer bg-transparent"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
