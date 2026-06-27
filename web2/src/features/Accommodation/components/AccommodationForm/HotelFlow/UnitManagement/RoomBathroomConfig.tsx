import React from "react";

interface Props {
  isPrivate: boolean;
  items: string[];
  onChange: (patch: { isPrivate?: boolean; items?: string[] }) => void;
}

const BATHROOM_ITEMS = [
  "Toilet paper", "Shower", "Toilet", "Hairdryer", "Bathtub", 
  "Free toiletries", "Bidet", "Slippers", "Bathrobe", "Spa tub"
];

const RoomBathroomConfig: React.FC<Props> = ({ isPrivate, items, onChange }) => {
  const toggleItem = (item: string) => {
    if (items.includes(item)) {
      onChange({ items: items.filter((i) => i !== item) });
    } else {
      onChange({ items: [...items, item] });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-3 md:space-y-4">
        <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Bathroom Privacy</label>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[
            { id: true, label: "Private", desc: "Just for this room" },
            { id: false, label: "Shared", desc: "Shared with others" },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange({ isPrivate: opt.id })}
              className={`p-4 md:p-5 rounded-xl border text-left transition-all ${
                isPrivate === opt.id
                  ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm"
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
            >
              <div className={`text-xs md:text-sm font-bold ${isPrivate === opt.id ? "text-slate-900" : "text-slate-500"}`}>{opt.label}</div>
              <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Bathroom Amenities</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
          {BATHROOM_ITEMS.map((item) => {
            const isSelected = items.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleItem(item)}
                className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm"
                    : "border-slate-50 bg-white hover:border-[#2dd4af]/20"
                }`}
              >
                <div
                  className={`h-3.5 w-3.5 md:h-4 md:w-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] md:text-xs font-bold ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
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

export default RoomBathroomConfig;
