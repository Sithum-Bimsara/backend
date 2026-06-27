import React from "react";

interface Props {
  isPrivate: boolean;
  bathroomCount: number;
  items: string[];
  onChange: (patch: { isPrivate?: boolean; bathroomCount?: number; items?: string[] }) => void;
}

const BATHROOM_ITEMS = [
  "Toilet paper", "Shower", "Toilet", "Hairdryer", "Bathtub", 
  "Free toiletries", "Bidet", "Slippers", "Bathrobe", "Spa tub"
];

const ApartmentBathroomConfig: React.FC<Props> = ({ isPrivate, bathroomCount, items = [], onChange }) => {
  const toggleItem = (item: string) => {
    if (items.includes(item)) {
      onChange({ items: items.filter((i) => i !== item) });
    } else {
      onChange({ items: [...items, item] });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#0e2a47]">Bathrooms</h2>
        <p className="text-sm text-slate-500 font-medium">Detail the bathroom facilities available to your guests.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bathroom Count */}
        <div className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 md:space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bathroom Count</label>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-4 bg-white rounded-xl p-1.5 md:p-2 shadow-sm border border-slate-200">
              <button 
                type="button"
                onClick={() => onChange({ bathroomCount: Math.max(1, bathroomCount - 1) })}
                className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span className="w-8 md:w-10 text-center text-lg md:text-xl font-bold text-slate-900">{bathroomCount}</span>
              <button 
                type="button"
                onClick={() => onChange({ bathroomCount: bathroomCount + 1 })}
                className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Total bathrooms in unit</p>
          </div>
        </div>

        {/* Privacy */}
        <div className="p-4 md:p-5 rounded-xl border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div className="flex items-center gap-3 md:gap-4">
            <div 
              onClick={() => onChange({ isPrivate: !isPrivate })}
              className={`h-6 w-6 md:h-7 md:w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                isPrivate ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
              }`}
            >
              {isPrivate && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <div>
              <span className="text-xs md:text-sm font-bold text-slate-900">Private Bathroom</span>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-medium uppercase tracking-tight">Guests don't share this bathroom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What's in the bathroom?</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BATHROOM_ITEMS.map((item) => {
            const isSelected = items.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleItem(item)}
                className={`flex flex-col gap-2 p-4 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "border-[#2dd4af] bg-white shadow-md shadow-[#2dd4af]/5"
                    : "border-slate-200 bg-white hover:border-[#2dd4af]/30 shadow-sm"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                    isSelected ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-[11px] font-bold tracking-tight ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApartmentBathroomConfig;
