import type { ChildPricingDto } from "../../../../dtos/accommodation.dto";
import CustomSelect from "../../../../../../components/Common/CustomSelect";

interface Props {
  childPricing: ChildPricingDto;
  onChange: (patch: Partial<ChildPricingDto>) => void;
  isReadOnly?: boolean;
}

const ChildPricingConfig: React.FC<Props> = ({ childPricing, onChange, isReadOnly = false }) => {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 md:space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Family Pricing</h4>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed px-1">
              Attract more bookings by offering clear rates for children.
            </p>
          </div>
          
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Enable Family Rates</span>
            <button 
              type="button"
              disabled={isReadOnly}
              onClick={() => onChange({ enabled: !childPricing?.enabled })}
              className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-all ${childPricing?.enabled ? 'bg-[#2dd4af]' : 'bg-slate-300'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white shadow-sm transition-transform ${childPricing?.enabled ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        
        {!childPricing?.enabled && (
          <div className="mt-2 p-3 rounded-xl border border-orange-200 bg-orange-50/50">
            <p className="text-[10px] md:text-xs text-orange-700 font-medium leading-relaxed">
               Set clear rates for children to attract more family bookings.
            </p>
          </div>
        )}
      </div>

      {childPricing?.enabled && (
        <div className="space-y-4 md:space-y-6">
          {/* Infants Section */}
          <div className="p-3 md:p-4 rounded-xl border border-slate-200 bg-white space-y-2 md:space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Infants (0-2y)</label>
              <span className="text-[9px] md:text-[10px] font-bold text-[#2dd4af] uppercase tracking-widest">Recommended: Free</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              <CustomSelect
                disabled={isReadOnly}
                value={childPricing?.infantsFree ? "free" : "fixed"}
                onChange={(val) => onChange({ infantsFree: val === "free" })}
                options={[
                  { value: "free", label: "Stay for Free" },
                  { value: "fixed", label: "Fixed Daily Fee" },
                ]}
              />
              
              {!childPricing?.infantsFree && (
                <div className={`flex items-center w-full h-9 md:h-10 px-3 rounded-lg border border-slate-200 bg-white focus-within:border-[#2dd4af] transition-all ${isReadOnly ? 'bg-slate-50' : ''}`}>
                  <span className="text-[10px] md:text-xs font-bold text-[#2dd4af] shrink-0">$</span>
                  <input 
                    type="number" 
                    min="0"
                    disabled={isReadOnly}
                    value={childPricing?.infantFixedPrice || ""}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => onChange({ infantFixedPrice: Number(e.target.value) })}
                    className="w-full h-full ml-1.5 md:ml-2 bg-transparent text-[10px] md:text-xs font-bold text-slate-900 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Children Section */}
          <div className="p-3 md:p-4 rounded-xl border border-slate-200 bg-white space-y-3 md:space-y-4 shadow-sm">
            {childPricing?.childrenAgeFrom !== -1 ? (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Children Rates</label>
                  {!isReadOnly && (
                    <button type="button" onClick={() => onChange({ childrenAgeFrom: -1, childrenAgeTo: -1 })} className="text-[9px] md:text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 p-1 md:p-1.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Ages</span>
                    <div className="w-25">
                      <CustomSelect 
                        size="sm"
                        disabled={isReadOnly} 
                        value={String(childPricing?.childrenAgeFrom)} 
                        onChange={(val) => onChange({ childrenAgeFrom: Number(val) })} 
                        options={[...Array(18)].map((_, i) => ({ value: String(i), label: String(i) }))}
                      />
                    </div>
                    <span className="text-slate-300 font-bold text-[10px]">-</span>
                    <div className="w-25">
                      <CustomSelect 
                        size="sm"
                        disabled={isReadOnly} 
                        value={String(childPricing?.childrenAgeTo)} 
                        onChange={(val) => onChange({ childrenAgeTo: Number(val) })} 
                        options={[...Array(18)].map((_, i) => ({ value: String(i), label: String(i) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 pt-2">
                  <CustomSelect
                    disabled={isReadOnly}
                    value={childPricing?.childrenFree ? "free" : "fixed"}
                    onChange={(val) => onChange({ childrenFree: val === "free" })}
                    options={[
                      { value: "free", label: "Stay for Free" },
                      { value: "fixed", label: "Fixed Daily Fee" },
                    ]}
                  />
                  
                  {!childPricing?.childrenFree && (
                    <div className={`flex items-center w-full h-9 md:h-10 px-3 rounded-lg border border-slate-200 bg-white focus-within:border-[#2dd4af] transition-all ${isReadOnly ? 'bg-slate-50' : ''}`}>
                      <span className="text-[10px] md:text-xs font-bold text-[#2dd4af] shrink-0">$</span>
                      <input 
                        type="number" 
                        min="0"
                        disabled={isReadOnly}
                        value={childPricing?.childFixedPrice || ""}
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => onChange({ childFixedPrice: Number(e.target.value) })}
                        className="w-full h-full ml-1.5 md:ml-2 bg-transparent text-[10px] md:text-xs font-bold text-slate-900 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              !isReadOnly && (
                <button 
                  type="button" 
                  onClick={() => onChange({ childrenAgeFrom: 3, childrenAgeTo: 10, childrenFree: true })} 
                  className="w-full h-10 md:h-12 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] md:text-xs font-bold hover:border-[#2dd4af] hover:text-[#2dd4af] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add Children Rate
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildPricingConfig;
