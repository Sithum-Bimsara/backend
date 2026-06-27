import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BedType } from "../../../types/accommodation.types";
import { BED_CONFIGS } from "../../../types/accommodation.types";

interface Props {
  maxGuests: number;
  size: number;
  bedConfigurations: Array<{ bedType: BedType; count: number }>;
  excludeInfants: boolean;
  cribsAvailable: boolean;
  onChange: (patch: {
    maxGuests?: number;
    size?: number;
    bedConfigurations?: Array<{ bedType: BedType; count: number }>;
    excludeInfants?: boolean;
    cribsAvailable?: boolean;
  }) => void;
}

function getBedCount(bedConfigurations: Array<{ bedType: BedType; count: number }>, type: BedType): number {
  return bedConfigurations.find(b => b.bedType === type)?.count ?? 0;
}

const BedCounter: React.FC<{
  bedType: BedType;
  count: number;
  onChange: (delta: number) => void;
}> = ({ bedType, count, onChange }) => {
  const config = BED_CONFIGS[bedType];
  return (
    <div className="flex items-center justify-between py-2 md:py-2.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="h-6 w-6 md:h-7 md:w-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#2dd4af]">
          <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16M22 4v16M2 12h20M7 12V8a1 1 0 011-1h8a1 1 0 011 1v4" /></svg>
        </div>
        <div>
          <p className="text-[10px] md:text-xs font-bold text-slate-900 leading-tight">{config.label}</p>
          <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{config.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={count === 0}
          className="h-6 w-6 md:h-7 md:w-7 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#2dd4af] hover:text-[#2dd4af] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <span className="text-sm md:text-base font-bold text-slate-900 w-4 md:w-5 text-center">{count}</span>
        <button
          type="button"
          onClick={() => onChange(1)}
          className="h-6 w-6 md:h-7 md:w-7 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#2dd4af] hover:text-[#2dd4af] transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>
    </div>
  );
};

const ApartmentSleepingConfig: React.FC<Props> = ({ 
  maxGuests, 
  size, 
  bedConfigurations, 
  excludeInfants, 
  cribsAvailable, 
  onChange 
}) => {
  const [showMoreBeds, setShowMoreBeds] = useState(false);

  const handleBedChange = (bedType: BedType, delta: number) => {
    const currentCount = getBedCount(bedConfigurations, bedType);
    const newCount = Math.max(0, currentCount + delta);
    let newBeds = bedConfigurations.filter(b => b.bedType !== bedType);
    if (newCount > 0) newBeds = [...newBeds, { bedType, count: newCount }];
    onChange({ bedConfigurations: newBeds });
  };

  const mainBeds: BedType[] = ["twin", "full", "queen", "king"];
  const extraBeds: BedType[] = ["sofa", "bunk", "futon"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#0e2a47]">Bedrooms & Beds</h2>
        <p className="text-sm text-slate-500 font-medium">Configure the sleeping arrangements and capacity for your apartment.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Occupancy */}
        <div className="p-2 md:p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 md:space-y-3">
          <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Max Occupancy</label>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <button 
                type="button"
                onClick={() => onChange({ maxGuests: Math.max(1, maxGuests - 1) })}
                className="h-5 w-5 md:h-6 md:w-6 rounded-md bg-slate-50 flex items-center justify-center text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span className="w-6 md:w-8 text-center text-sm md:text-base font-bold text-slate-900">{maxGuests}</span>
              <button 
                type="button"
                onClick={() => onChange({ maxGuests: maxGuests + 1 })}
                className="h-5 w-5 md:h-6 md:w-6 rounded-md bg-slate-50 flex items-center justify-center text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">Total guests allowed</p>
          </div>
        </div>

        {/* Apartment Size */}
        <div className="p-2 md:p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 md:space-y-3">
          <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Apartment Size</label>
          <div className="relative">
            <input 
              type="number"
              min="0"
              value={size || ""}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => onChange({ size: Number(e.target.value) })}
              placeholder="e.g. 45"
              className="w-full h-10 md:h-11 pl-3 md:pl-4 pr-10 md:pr-12 rounded-lg border border-slate-200 bg-white text-[10px] md:text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all"
            />
            <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">sqm</span>
          </div>
        </div>
      </div>

      {/* Bed Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available Beds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 border border-slate-200 rounded-xl px-4 py-2 bg-white shadow-sm">
            {mainBeds.map(bedType => (
              <BedCounter
                key={bedType}
                bedType={bedType}
                count={getBedCount(bedConfigurations, bedType)}
                onChange={(delta) => handleBedChange(bedType, delta)}
              />
            ))}

            <AnimatePresence>
              {showMoreBeds && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="col-span-1 md:col-span-2 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {extraBeds.map(bedType => (
                      <BedCounter
                        key={bedType}
                        bedType={bedType}
                        count={getBedCount(bedConfigurations, bedType)}
                        onChange={(delta) => handleBedChange(bedType, delta)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="col-span-1 md:col-span-2 pt-2 pb-2">
              <button 
                type="button"
                onClick={() => setShowMoreBeds(!showMoreBeds)}
                className="text-[9px] md:text-[10px] font-bold text-[#2dd4af] uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all justify-center w-full"
              >
                {showMoreBeds ? (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                )}
                {showMoreBeds ? "Show Fewer Options" : "Show More Bed Types"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2 pt-3 border-t border-slate-100">
        <label className="flex items-center gap-2 md:gap-2 p-2 md:p-3 rounded-lg border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div 
            onClick={() => onChange({ excludeInfants: !excludeInfants })}
            className={`h-4 w-4 md:h-5 md:w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              excludeInfants ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
            }`}
          >
            {excludeInfants && <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-slate-900 block">Exclude infants</span>
            <p className="text-[8px] md:text-[9px] text-slate-500 font-medium uppercase tracking-tight leading-none mt-0.5">Don't count 0-2 year olds</p>
          </div>
        </label>

        <label className="flex items-center gap-2 md:gap-2 p-2 md:p-3 rounded-lg border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div 
            onClick={() => onChange({ cribsAvailable: !cribsAvailable })}
            className={`h-4 w-4 md:h-5 md:w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              cribsAvailable ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
            }`}
          >
            {cribsAvailable && <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-slate-900 block">Cribs Available</span>
            <p className="text-[8px] md:text-[9px] text-slate-500 font-medium uppercase tracking-tight leading-none mt-0.5">Cribs can be provided</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ApartmentSleepingConfig;
