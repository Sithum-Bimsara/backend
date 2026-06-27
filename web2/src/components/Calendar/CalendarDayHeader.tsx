import React from 'react';

interface CalendarDayHeaderProps {
  date: Date;
  isToday: boolean;
  className?: string;
}

const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({
  date,
  isToday,
  className = ""
}) => {
  return (
    <div className={`py-2.5 text-center border-b border-slate-100 ${isToday ? 'bg-[#2dd4af]/5' : 'bg-slate-50/50'} ${className}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {date.toLocaleDateString('default', { weekday: 'short' })}
      </p>
      <p
        className={`text-sm font-bold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-colors ${
          isToday ? 'bg-[#2dd4af] text-white' : 'text-slate-700'
        }`}
      >
        {date.getDate()}
      </p>
    </div>
  );
};

export default CalendarDayHeader;
