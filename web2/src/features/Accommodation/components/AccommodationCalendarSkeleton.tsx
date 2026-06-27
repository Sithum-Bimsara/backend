import React from 'react';

export const AccommodationCalendarSkeleton: React.FC = () => {
  // 7 days of the week
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  // Uniform mock slot configurations matching the clean grey layout in the second image
  const mockColumns = [
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] },
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] },
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] },
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] },
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] },
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] },
    { slots: ['bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100', 'bg-slate-100'] }
  ];

  return (
    <div className="px-4 lg:px-8 py-6 relative flex-1 min-h-0 flex flex-col animate-pulse">
      
      
      {/* Calendar Card Container */}
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        
        {/* Mock Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-3 border-b border-slate-100 gap-3 bg-white shrink-0">
          <div className="space-y-1">
            <div className="h-2 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-44"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
            <div className="w-16 h-8 bg-slate-100 rounded-lg"></div>
            <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>   
          </div>
        </div>

        {/* Mock Availability Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-200" />
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-200" />
            <div className="h-3 bg-slate-200 rounded w-12"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-200" />
            <div className="h-3 bg-slate-200 rounded w-16"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-200" />
            <div className="h-3 bg-slate-200 rounded w-14"></div>
          </div>
        </div>

        {/* Mock Grid Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-7 grid-rows-[auto_1fr] h-full min-w-140 sm:min-w-0">
            
            {/* Headers row */}
            {days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center py-2.5 border-r border-b border-slate-100 last:border-r-0 bg-slate-50/30">
                <span className="text-[10px] font-bold text-slate-300 tracking-wider mb-1">{day}</span>
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center"></div>
              </div>
            ))}

            {/* Slots columns row */}
            {mockColumns.map((col, idx) => (
              <div key={idx} className="flex flex-col p-2 border-r border-b border-slate-100 last:border-r-0 gap-2 h-full min-h-0 bg-white">
                <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                  {col.slots.map((bgColor, sIdx) => (
                    <div
                      key={sIdx}
                      className={`w-full min-h-10 flex-1 rounded-lg border border-slate-200/20 ${bgColor}`}
                    />
                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};
