import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NearbyPOIDto } from "../../../dtos/accommodation.dto";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  value: NearbyPOIDto[];
  onChange: (value: NearbyPOIDto[]) => void;
}

const NearbyPOIForm: React.FC<Props> = ({ value, onChange }) => {
  const addPOI = () => {
    onChange([...value, { name: "", distanceText: "" }]);
  };


  const updatePOI = (index: number, patch: Partial<NearbyPOIDto>) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...patch };
    onChange(newValue);
  };

  const suggestions = [
    "Bikini beach",
    "Public ferry jetty",
    "Local food market",
    "House reef entry",
    "Watersports center",
    "Hospital / Clinic"
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Nearby Locations" 
        description="Add nearby landmarks, beaches, and transport links to help guests navigate and understand your property's surroundings."
      />

      <div className="space-y-4 md:space-y-8">
        <AnimatePresence mode="popLayout">
          {(value || []).map((poi, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 md:space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-[#2dd4af] text-white flex items-center justify-center shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21l-8-9h16l-8 9z" /></svg>
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-slate-900">Point of Interest #{index + 1}</h3>
                </div>
                <button
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="text-[10px] md:text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Location / Landmark</label>
                  <input
                    type="text"
                    value={poi.name}
                    onChange={(e) => updatePOI(index, { name: e.target.value })}
                    placeholder="e.g. Bikini Beach"
                    className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Distance / Time</label>
                  <input
                    type="text"
                    value={poi.distanceText}
                    onChange={(e) => updatePOI(index, { distanceText: e.target.value })}
                    placeholder="e.g. 5 min walk"
                    className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(!value || value.length === 0) && (
          <div className="py-12 text-center rounded-4xl border-2 border-dashed border-slate-100 bg-slate-50/30">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-400">No landmarks added yet</p>
            <p className="text-xs text-slate-300 mt-1">Start by adding nearby spots for your guests</p>
          </div>
        )}

        <button
          onClick={addPOI}
          className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#2dd4af] hover:text-[#2dd4af] hover:bg-[#2dd4af]/5 font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Nearby Location
        </button>
      </div>

      <div className="pt-6 border-t border-slate-50 space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Common Suggestions</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => onChange([...value, { name: s, distanceText: "5 min walk" }])}
              className="px-4 py-2 rounded-xl bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider hover:bg-[#2dd4af]/10 hover:text-[#2dd4af] transition-all border border-slate-100"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyPOIForm;
