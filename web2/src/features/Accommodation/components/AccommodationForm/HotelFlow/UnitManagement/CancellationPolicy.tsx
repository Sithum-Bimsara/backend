import { useState } from "react";
import { CANCELLATION_WINDOWS } from "../../../../types/accommodation.types";
import type { IRatePlan, CancellationFeeType } from "../../../../types/accommodation.types";
import CustomSelect from "../../../../../../components/Common/CustomSelect";

interface Props {
  value: Partial<IRatePlan>;
  onChange: (patch: Partial<IRatePlan>) => void;
  dealLockExpireTime?: number;
  onDealLockExpireTimeChange?: (days: number) => void;
  hideInventoryLock?: boolean;
}

const CancellationPolicy: React.FC<Props> = ({ 
  value, 
  onChange, 
  dealLockExpireTime = 1,
  onDealLockExpireTimeChange,
  hideInventoryLock = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const currentWindow = CANCELLATION_WINDOWS.find(w => w.value === (value.cancellationWindow || "6pm_arrival"))?.label || "Before 6 pm on the day of arrival";
  const currentFeeType = value.cancellationFeeType === "full_stay" ? "100% of the total price" : "cost of the first night";

  if (!isEditing) {
    return (
      <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 md:p-4 space-y-2 md:space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-lg font-bold text-slate-900">Cancellation Policy</h3>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setTempValue(value);
                  setIsEditing(true);
                }}
                className="px-3 md:px-5 py-1 md:py-1.5 rounded-lg border border-[#2dd4af] text-[#2dd4af] text-[10px] md:text-xs font-bold hover:bg-[#2dd4af]/5 transition-all"
              >
                Edit
              </button>
            </div>

            <p className="text-slate-500 text-[10px] md:text-sm">
              Applied property-wide across all rooms and units.
            </p>

            <div className="h-px bg-slate-100 w-full" />

            <div className="space-y-3 md:space-y-4 pt-2">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed">
                  Free cancellation {currentWindow.toLowerCase()}. Guests pay {currentFeeType} if cancelled after.
                </p>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed">
                  24-hour accidental booking protection enabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {!hideInventoryLock && (
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 md:p-4 space-y-2 md:space-y-2">
              <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Inventory Lock Duration</h4>

              <div className="space-y-3 md:space-y-4">
                <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed px-1">
                  How long should room slots be held while a guest is completing their booking?
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {[1, 2, 3, 5].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => onDealLockExpireTimeChange?.(days)}
                      className={`py-2 md:py-3 px-3 md:px-4 rounded-xl border-2 text-[10px] md:text-xs font-bold transition-all ${
                        dealLockExpireTime === days 
                          ? "border-[#2dd4af] bg-[#2dd4af]/5 text-slate-900 shadow-sm" 
                          : "border-slate-50 bg-white text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                  <div className="relative col-span-2 md:col-span-1">
                    <input 
                      type="number"
                      min="0"
                      value={dealLockExpireTime}
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => onDealLockExpireTimeChange?.(Number(e.target.value))}
                      className="w-full h-9 md:h-11 px-3 rounded-xl border border-slate-200 bg-white text-[10px] md:text-xs font-bold text-slate-900 focus:border-[#2dd4af] outline-none"
                      placeholder="Custom"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] font-bold text-slate-300 uppercase">Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex-1 space-y-4 md:space-y-6 bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
          <h3 className="text-sm md:text-lg font-bold text-slate-900">Edit Policy</h3>

          <div className="space-y-3 md:space-y-5">
              <CustomSelect
                label="Cancellation Window"
                value={tempValue.cancellationWindow || "6pm_arrival"}
                onChange={(val) => setTempValue(prev => ({ ...prev, cancellationWindow: val }))}
                options={CANCELLATION_WINDOWS.map(window => ({
                  value: window.value,
                  label: window.label
                }))}
              />

            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fee Type (After Window)</label>
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {([
                  { value: "first_night", label: "Cost of first night" },
                  { value: "full_stay", label: "100% of total price" }
                ] as { value: CancellationFeeType; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTempValue(prev => ({ ...prev, cancellationFeeType: opt.value }))}
                    className={`flex items-center gap-3 p-2.5 md:p-3 rounded-xl border transition-all ${
                      (tempValue.cancellationFeeType || "first_night") === opt.value 
                        ? "border-[#2dd4af] bg-[#2dd4af]/5 shadow-sm" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      (tempValue.cancellationFeeType || "first_night") === opt.value ? "border-[#2dd4af] bg-[#2dd4af]" : "border-slate-300"
                    }`}>
                      {(tempValue.cancellationFeeType || "first_night") === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-[10px] md:text-xs font-bold ${(tempValue.cancellationFeeType || "first_night") === opt.value ? "text-slate-900" : "text-slate-500"}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm font-bold text-slate-900">Accidental Booking Protection</span>
                <button 
                  type="button"
                  onClick={() => setTempValue(prev => ({ ...prev, accidentalBookingProtection: !prev.accidentalBookingProtection }))}
                  className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-all ${tempValue.accidentalBookingProtection !== false ? 'bg-[#2dd4af]' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${tempValue.accidentalBookingProtection !== false ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-medium">
                We automatically waive fees for cancellations made within 24 hours of booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button 
          onClick={() => setIsEditing(false)}
          className="flex-1 h-9 md:h-10 rounded-xl border border-slate-200 text-slate-400 text-[10px] md:text-xs font-bold hover:bg-slate-50 transition-all uppercase tracking-widest"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            onChange(tempValue);
            setIsEditing(false);
          }}
          className="flex-1 h-9 md:h-10 rounded-xl bg-[#2dd4af] text-white text-[10px] md:text-xs font-bold shadow-md shadow-[#2dd4af]/20 hover:opacity-90 transition-all uppercase tracking-widest"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default CancellationPolicy;
