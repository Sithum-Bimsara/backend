import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BedType } from "../../../../types/accommodation.types";
import { BED_CONFIGS } from "../../../../types/accommodation.types";
import type { IUnit } from "../../../../types/accommodation.types";

interface Props {
  unit: IUnit;
  onChange: (patch: Partial<IUnit>) => void;
  isSingleRoom?: boolean;
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

const AccommodationSleepingConfig: React.FC<Props> = ({ unit, onChange }) => {
  const [showMoreBeds, setShowMoreBeds] = useState(false);
  const bedConfigurations = React.useMemo(() => unit.bedConfigurations || [], [unit.bedConfigurations]);

  React.useEffect(() => {
    const totalCapacity = bedConfigurations.reduce((acc, bed) => {
      const capacity = BED_CONFIGS[bed.bedType]?.capacity || 0;
      return acc + (capacity * bed.count);
    }, 0);

    if (unit.maxGuests === 0 && totalCapacity > 0) {
      onChange({ maxGuests: totalCapacity });
    }
  }, [bedConfigurations, unit.maxGuests, onChange]);

  const handleBedChange = (bedType: BedType, delta: number) => {
    const currentCount = getBedCount(bedConfigurations, bedType);
    const newCount = Math.max(0, currentCount + delta);
    let newBeds = bedConfigurations.filter(b => b.bedType !== bedType);
    if (newCount > 0) newBeds = [...newBeds, { bedType, count: newCount }];
    onChange({ bedConfigurations: newBeds });
  };

  const renderOccupancy = () => (
    <div className="space-y-2 md:space-y-3 pb-4 md:pb-5 border-b border-slate-100">
      <div className="p-2 md:p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 md:space-y-3">
        <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max Occupancy</label>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button 
              type="button"
              onClick={() => onChange({ maxGuests: Math.max(1, unit.maxGuests - 1) })}
              className="h-5 w-5 md:h-6 md:w-6 rounded-md bg-slate-50 flex items-center justify-center text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="w-6 md:w-8 text-center text-sm md:text-base font-bold text-slate-900">{unit.maxGuests}</span>
            <button 
              type="button"
              onClick={() => onChange({ maxGuests: (unit.maxGuests || 0) + 1 })}
              className="h-5 w-5 md:h-6 md:w-6 rounded-md bg-slate-50 flex items-center justify-center text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-medium">Total guests allowed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
        <label className="flex items-center gap-2 md:gap-2 p-2 md:p-3 rounded-lg border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div 
            onClick={() => onChange({ excludeInfants: !unit.excludeInfants })}
            className={`h-4 w-4 md:h-5 md:w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              unit.excludeInfants ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
            }`}
          >
            {unit.excludeInfants && <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-slate-900 block">Exclude infants</span>
            <p className="text-[8px] md:text-[9px] text-slate-500 font-medium uppercase tracking-tight leading-none mt-0.5">Don't count 0-2 year olds</p>
          </div>
        </label>

        <label className="flex items-center gap-2 md:gap-2 p-2 md:p-3 rounded-lg border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div 
            onClick={() => onChange({ cribsAvailable: !unit.cribsAvailable })}
            className={`h-4 w-4 md:h-5 md:w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              unit.cribsAvailable ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
            }`}
          >
            {unit.cribsAvailable && <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <div>
            <span className="text-[10px] md:text-xs font-bold text-slate-900 block">Cribs Available</span>
            <p className="text-[8px] md:text-[9px] text-slate-500 font-medium uppercase tracking-tight leading-none mt-0.5">Cribs can be provided</p>
          </div>
        </label>
      </div>
    </div>
  );

  const mainBeds: BedType[] = ["twin", "full", "queen", "king"];
  const extraBeds: BedType[] = ["sofa", "bunk", "futon"];

  return (
    <div className="space-y-1 md:space-y-2">
      {renderOccupancy()}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Available Beds</label>
        <div className="space-y-0 border border-slate-200 rounded-xl px-3 md:px-4 bg-white shadow-sm overflow-hidden">
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
                className="overflow-hidden"
              >
                {extraBeds.map(bedType => (
                  <BedCounter
                    key={bedType}
                    bedType={bedType}
                    count={getBedCount(bedConfigurations, bedType)}
                    onChange={(delta) => handleBedChange(bedType, delta)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="py-2 md:py-3 border-t border-slate-50">
            <button 
              type="button"
              onClick={() => setShowMoreBeds(!showMoreBeds)}
              className="text-[9px] md:text-[10px] font-bold text-slate-400 hover:text-[#2dd4af] flex items-center gap-1.5 transition-all uppercase tracking-widest w-full justify-center"
            >
              {showMoreBeds ? (
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
              )}
              {showMoreBeds ? "Show fewer options" : "Show more bed options"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationSleepingConfig;
