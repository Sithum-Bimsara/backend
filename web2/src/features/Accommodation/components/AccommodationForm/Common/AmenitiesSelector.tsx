import React from "react";

const AMENITIES = [
  "Air conditioning", "High-speed WiFi", "Full Kitchen", "Washing machine", 
  "Flat-screen TV", "Private Balcony", "Dedicated Workspace", "Free Parking", 
  "Mini Bar", "Bathrobe & Slippers", "Safe Box", "Hairdryer", 
  "Iron & Board", "Coffee Machine", "Blackout Curtains"
].sort();

interface Props {
  value: string[];
  onChange: (amenities: string[]) => void;
}

const AmenitiesSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {AMENITIES.map((amenity) => {
        const active = value.includes(amenity);
        return (
          <button
            key={amenity}
            type="button"
            onClick={() => onChange(active ? value.filter((item) => item !== amenity) : [...value, amenity])}
            className={`flex items-center gap-2 md:gap-3 w-full text-left p-2 md:p-3 rounded-xl border transition-all duration-200 ${
              active 
                ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm" 
                : "border-slate-200 bg-white hover:border-[#2dd4af]/30"
            }`}
          >
            <div className={`h-3.5 w-3.5 md:h-4 md:w-4 rounded border-2 flex items-center justify-center transition-colors ${
              active ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-300"
            }`}>
              {active && (
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className={`text-[10px] md:text-xs font-bold ${active ? "text-slate-900" : "text-slate-500"}`}>
              {amenity}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AmenitiesSelector;
