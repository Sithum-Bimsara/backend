import React from "react";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface FacilityCategory {
  title: string;
  items: string[];
}

const FACILITY_GROUPS: FacilityCategory[] = [
  {
    title: "Most Popular",
    items: ["Free WiFi", "Swimming pool", "Beach", "Air conditioning", "Non-smoking rooms", "Airport shuttle"]
  },
  {
    title: "Food & Drink",
    items: ["Restaurant", "Room service", "Bar"]
  },
  {
    title: "Wellness",
    items: ["Sauna", "Fitness centre", "Spa and wellness centre", "Hot tub/Jacuzzi"]
  },
  {
    title: "General",
    items: [
      "24-hour front desk", "Garden", "Terrace", "Family rooms", 
      "Water park", "Electric vehicle charging station",
      "Elevator", "Heating", "Pet Friendly"
    ]
  }
];

interface Props {
  value: string[];
  onChange: (facilities: string[]) => void;
}

const FacilitiesSelector: React.FC<Props> = ({ value, onChange }) => {
  const toggleFacility = (facility: string) => {
    const active = value.includes(facility);
    onChange(active ? value.filter((item) => item !== facility) : [...value, facility]);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Facilities" 
        description="Select the specific facilities available within your property. This helps guests know what to expect during their stay."
      />
      {FACILITY_GROUPS.map((group) => (
        <div key={group.title} className="space-y-4">
          <div className="flex items-center gap-4">
            <h4 className="text-[10px] font-black text-[#0e2a47] uppercase tracking-[0.2em] whitespace-nowrap">
              {group.title}
            </h4>
            <div className="h-px w-full bg-slate-100" />
          </div>
          
          <div className="flex flex-wrap gap-1.5 md:gap-2.5">
            {group.items.map((facility) => {
              const active = value.includes(facility);
              return (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl text-[10px] md:text-xs font-semibold transition-all duration-300 border ${
                    active 
                      ? "border-[#2dd4af] bg-[#2dd4af] text-white shadow-md shadow-[#2dd4af]/20 scale-[1.02]" 
                      : "border-slate-200 bg-white text-slate-500 hover:border-[#2dd4af]/30 hover:text-[#0e2a47]"
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilitiesSelector;
