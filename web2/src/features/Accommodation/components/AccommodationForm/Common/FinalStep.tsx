import React from "react";

interface Props {
  agreementAccepted: boolean;
  activateListing: boolean;
  onChange: (patch: { agreementAccepted?: boolean; activateListing?: boolean }) => void;
}

const FinalStep: React.FC<Props> = ({ agreementAccepted, activateListing, onChange }) => {
  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-[10px] md:text-sm text-slate-600">
        Review your property, confirm the legal agreement, and decide whether to activate the listing now or later.
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        <label className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div 
            onClick={() => onChange({ agreementAccepted: !agreementAccepted })}
            className={`h-6 w-6 md:h-7 md:w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              agreementAccepted ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
            }`}
          >
            {agreementAccepted && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span className="text-xs md:text-sm font-bold text-slate-900">I accept the merchant agreement</span>
        </label>

        <label className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl border border-slate-200 bg-white hover:border-[#2dd4af]/30 cursor-pointer transition-all group">
          <div 
            onClick={() => onChange({ activateListing: !activateListing })}
            className={`h-6 w-6 md:h-7 md:w-7 rounded-lg border-2 flex items-center justify-center transition-all ${
              activateListing ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-200 bg-white"
            }`}
          >
            {activateListing && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
          <span className="text-xs md:text-sm font-bold text-slate-900">Activate listing immediately</span>
        </label>
      </div>
    </div>);
};

export default FinalStep;
