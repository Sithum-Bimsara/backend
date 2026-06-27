import React from "react";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const AMENITY_GROUPS = [
  {
    title: "General amenities",
    items: ["Air conditioning", "Heating", "Wardrobe or closet", "Towels", "Linens", "Flat-screen TV"],
  },
  {
    title: "Outdoors and views",
    items: ["Balcony", "Terrace", "View"],
  },
  {
    title: "Food and drink",
    items: ["Tea/Coffee maker", "Refrigerator", "Electric kettle", "Kitchenware", "Dining table", "Dining area"],
  },
];

const RoomAmenitiesSelector: React.FC<Props> = ({ value, onChange }) => {
  const toggleAmenity = (item: string) => {
    if (value.includes(item)) {
      onChange(value.filter((i) => i !== item));
    } else {
      onChange([...value, item]);
    }
  };

  return (
    <div className="space-y-3 md:space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
      {AMENITY_GROUPS.map((group) => (
        <div key={group.title} className="space-y-3 md:space-y-4">
          <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
            {group.title}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-1">
            {group.items.map((item) => {
              const isSelected = value.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAmenity(item)}
                  className={`flex items-center gap-2 md:gap-2 p-1.5 md:p-2 rounded-xl border text-left transition-all ${
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
      ))}
    </div>
  );
};

export default RoomAmenitiesSelector;
