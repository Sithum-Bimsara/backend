import React from "react";
import type { ChildPricingDto } from "../../../dtos/accommodation.dto";
import CustomSelect from "../../../../../components/Common/CustomSelect";

interface Props {
  childPricing: ChildPricingDto;
  onChange: (patch: Partial<ChildPricingDto>) => void;
}

const ApartmentChildPricingConfig: React.FC<Props> = ({ childPricing, onChange }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#0e2a47]">Child Pricing</h2>
        <p className="text-sm text-slate-500 font-medium">Specify your rates and policies for children and infants.</p>
      </div>
      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Child Pricing Policy</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Specify if you charge extra for children and infants. Offering free stays for infants often increases booking rates from families.
            </p>
          </div>
          
          <div className="flex items-center gap-3 pt-1 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Enable child pricing</span>
            <button 
              type="button"
              onClick={() => onChange({ enabled: !childPricing.enabled })}
              className={`relative inline-flex h-6 w-11 md:h-7 md:w-12 items-center rounded-full transition-all ${childPricing.enabled ? 'bg-[#2dd4af]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white shadow-md transition-transform ${childPricing.enabled ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {childPricing.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Infants Section */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Infants (0-2 years)</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 rounded-xl">
                {["Free", "Fixed Rate"].map((label) => {
                  const isFree = label === "Free";
                  const isSelected = childPricing.infantsFree === isFree;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => onChange({ infantsFree: isFree })}
                      className={`py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all ${
                        isSelected ? "bg-[#2dd4af] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              
              {!childPricing.infantsFree && (
                <div className="flex items-center w-full h-9 px-3 rounded-lg border border-slate-200 bg-white focus-within:border-[#2dd4af] transition-all">
                  <input 
                    type="number"
                    min="0"
                    value={childPricing.infantFixedPrice || ""}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => onChange({ infantFixedPrice: Number(e.target.value) })}
                    placeholder="Fixed price"
                    className="w-full h-full bg-transparent text-[10px] md:text-xs font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-300 shrink-0 ml-2">USD</span>
                </div>
              )}
            </div>
          </div>

          {/* Children Section */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Children</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-50 p-1 md:p-1.5 rounded-xl">
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ages</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-25">
                    <CustomSelect 
                      size="sm"
                      value={String(childPricing.childrenAgeFrom)} 
                      onChange={(val) => onChange({ childrenAgeFrom: Number(val) })} 
                      options={[...Array(18)].map((_, i) => ({ value: String(i), label: String(i) }))}
                    />
                  </div>
                  <span className="text-slate-300 font-bold text-[10px]">to</span>
                  <div className="w-25">
                    <CustomSelect 
                      size="sm"
                      value={String(childPricing.childrenAgeTo)} 
                      onChange={(val) => onChange({ childrenAgeTo: Number(val) })} 
                      options={[...Array(18)].map((_, i) => ({ value: String(i), label: String(i) }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 rounded-xl">
                  {["Free", "Fixed Rate"].map((label) => {
                    const isFree = label === "Free";
                    const isSelected = childPricing.childrenFree === isFree;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => onChange({ childrenFree: isFree })}
                        className={`py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all ${
                          isSelected ? "bg-[#2dd4af] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                
                {!childPricing.childrenFree && (
                  <div className="flex items-center w-full h-9 px-3 rounded-lg border border-slate-200 bg-white focus-within:border-[#2dd4af] transition-all">
                    <input 
                      type="number"
                      min="0"
                      value={childPricing.childFixedPrice || ""}
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => onChange({ childFixedPrice: Number(e.target.value) })}
                      placeholder="Fixed price"
                      className="w-full h-full bg-transparent text-[10px] md:text-xs font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-300 shrink-0 ml-2">USD</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentChildPricingConfig;
