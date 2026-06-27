import React from 'react';

const AvailabilityLegend: React.FC = () => {
  const legendItems = [
    { color: 'bg-emerald-500', label: 'Booked' },
    { color: 'bg-amber-400', label: 'Locked' },
    { color: 'bg-slate-200', label: 'Available' },
    { color: 'bg-red-300', label: 'Blocked' },
  ];

  return (
    <div className="flex items-center gap-2.5 sm:gap-5 px-4 py-2 bg-slate-50/80 border-b border-slate-100 whitespace-nowrap overflow-hidden">
      {legendItems.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm ${color} shrink-0`} />
          <span className="text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-tight sm:tracking-normal">
            {label}
          </span>
        </div>
      ))}
      <p className="text-[9px] text-slate-400 ml-auto italic hidden sm:block">
        * Click a slot to manage.
      </p>
    </div>
  );
};

export default AvailabilityLegend;
