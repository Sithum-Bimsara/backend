import React from "react";
import { CANCELLATION_WINDOWS } from "../../../types/accommodation.types";

interface Props {
  cancellationWindow: string;
  cancellationFeeType: "first_night" | "full_stay";
  accidentalBookingProtection: boolean;
  onChange: (patch: { 
    cancellationWindow?: string; 
    cancellationFeeType?: "first_night" | "full_stay";
    accidentalBookingProtection?: boolean;
  }) => void;
}

const ApartmentCancellationPolicy: React.FC<Props> = ({ 
  cancellationWindow, 
  cancellationFeeType, 
  accidentalBookingProtection, 
  onChange 
}) => {
  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#0e2a47]">Cancellation Policy</h2>
        <p className="text-sm text-slate-500 font-medium">Define your property's cancellation rules and fees.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Window Selection */}
        <div className="space-y-3 md:space-y-4">
          <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cancellation Window</label>
          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {CANCELLATION_WINDOWS.map((window) => {
              const isSelected = cancellationWindow === window.value;
              return (
                <button
                  key={window.value}
                  type="button"
                  onClick={() => onChange({ cancellationWindow: window.value })}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${
                    isSelected ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm" : "border-slate-200 bg-white hover:border-[#2dd4af]/30"
                  }`}
                >
                  <span className={`text-xs md:text-sm font-bold ${isSelected ? "text-slate-900" : "text-slate-500"}`}>{window.label}</span>
                  {isSelected && (
                    <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-[#2dd4af] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Fee Type */}
          <div className="space-y-3 md:space-y-4">
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fee Type (After Window)</label>
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {([
                { id: "first_night", label: "First Night", desc: "Pay for one night if late" },
                { id: "full_stay", label: "Full Stay", desc: "Pay total amount if late" },
              ] as { id: "first_night" | "full_stay"; label: string; desc: string }[]).map((opt) => {
                const isSelected = cancellationFeeType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ cancellationFeeType: opt.id })}
                    className={`flex flex-col gap-0.5 p-3 md:p-4 rounded-xl border transition-all text-left ${
                      isSelected ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm" : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className={`text-xs md:text-sm font-bold ${isSelected ? "text-slate-900" : "text-slate-500"}`}>{opt.label}</span>
                    <span className="text-[9px] md:text-[10px] text-slate-400 font-medium uppercase tracking-tight">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accidental Protection */}
          <div className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 md:space-y-4">
            <div className="flex items-start gap-3 md:gap-4">
              <div 
                onClick={() => onChange({ accidentalBookingProtection: !accidentalBookingProtection })}
                className={`mt-0.5 h-5 w-5 md:h-6 md:w-6 shrink-0 rounded border flex items-center justify-center transition-all cursor-pointer ${
                  accidentalBookingProtection ? "bg-[#2dd4af] border-[#2dd4af]" : "border-slate-300 bg-white"
                }`}
              >
                {accidentalBookingProtection && <svg viewBox="0 0 24 24" className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div className="space-y-1">
                <span className="text-xs md:text-sm font-bold text-slate-900">Accidental booking protection</span>
                <p className="text-[9px] md:text-[10px] text-slate-500 leading-relaxed font-medium">
                  We automatically waive fees for cancellations within 24 hours of booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCancellationPolicy;
