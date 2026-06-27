import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MarineLifeZoneDto } from "../../../dtos/accommodation.dto";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  value: MarineLifeZoneDto[];
  onChange: (value: MarineLifeZoneDto[]) => void;
}

interface MarineZone {
  id: string;
  label: string;
  description: string;
}

const ZONES: MarineZone[] = [
  {
    id: "House Reef",
    label: "House Reef",
    description: "Direct access to vibrant corals and colorful fish right from the island.",
  },
  {
    id: "Turtle Spot",
    label: "Turtle Spot",
    description: "Known area for observing sea turtles in their natural habitat.",
  },
  {
    id: "Dolphin Zone",
    label: "Dolphin Zone",
    description: "Prime location for dolphin sightings and boat excursions.",
  },
  {
    id: "Sandbank",
    label: "Sandbank",
    description: "Pristine white sandbars surrounded by crystal clear turquoise waters.",
  },
  {
    id: "Manta Point",
    label: "Manta Point",
    description: "Famous cleaning stations for majestic Manta Rays.",
  },
  {
    id: "Shark Point",
    label: "Shark Point",
    description: "Safe areas to spot baby reef sharks or whale sharks seasonally.",
  }
];

const MarineLifeSelector: React.FC<Props> = ({ value, onChange }) => {
  const toggleZone = (zoneId: string) => {
    const currentZones = value || [];
    const isSelected = currentZones.some(v => v.zone === zoneId);
    
    if (isSelected) {
      onChange(currentZones.filter(v => v.zone !== zoneId));
    } else {
      onChange([...currentZones, { zone: zoneId, description: "" }]);
    }
  };

  const updateDescription = (zoneId: string, description: string) => {
    onChange(value.map(v => v.zone === zoneId ? { ...v, description } : v));
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Marine Life Zones" 
        description="Highlight the incredible underwater experiences available near your property. Guests traveling to the Maldives often prioritize proximity to specific marine experiences."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {ZONES.map((zone) => {
          const isSelected = value.some(v => v.zone === zone.id);
          const current = value.find(v => v.zone === zone.id);
          
          return (
            <div key={zone.id} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleZone(zone.id)}
                className={`w-full flex items-center gap-3 p-3 md:p-4 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm" 
                    : "border-slate-100 bg-white hover:border-[#2dd4af]/30"
                }`}
              >
                <div className={`h-5 w-5 md:h-6 md:w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
                }`}>
                  {isSelected && (
                    <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs md:text-sm font-bold ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                    {zone.label}
                  </span>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-medium leading-tight">
                    {zone.description}
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="px-1"
                  >
                    <input
                      type="text"
                      placeholder="Add brief details (e.g. '10 min boat ride')..."
                      value={current?.description || ""}
                      onChange={(e) => updateDescription(zone.id, e.target.value)}
                      className="w-full h-10 md:h-12 px-4 rounded-lg border border-slate-200 bg-white text-[10px] md:text-xs font-medium text-slate-600 focus:outline-none focus:border-[#2dd4af] transition-all shadow-inner"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-4 md:p-6 rounded-xl bg-amber-50 border border-amber-100 flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="space-y-1">
          <h5 className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-widest">Why highlight these?</h5>
          <p className="text-[10px] md:text-[11px] text-amber-600/80 font-medium leading-relaxed">
            Highlighting these zones increases your visibility for specific guest searches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarineLifeSelector;
