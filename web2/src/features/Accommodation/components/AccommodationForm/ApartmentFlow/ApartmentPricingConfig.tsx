import React from "react";
import type { IUnit } from "../../../types/accommodation.types";

interface Props {
  pricePerNight: number;
  localPrice: number;
  nonLocalPrice: number;
  maxGuests: number;
  occupancyPricing: IUnit["ratePlan"]["occupancyPricing"];
  onChange: (patch: {
    pricePerNight?: number;
    localPrice?: number;
    nonLocalPrice?: number;
    occupancyPricing?: IUnit["ratePlan"]["occupancyPricing"];
  }) => void;
}

const ApartmentPricingConfig: React.FC<Props> = ({ 
  pricePerNight, 
  localPrice, 
  nonLocalPrice, 
  maxGuests, 
  occupancyPricing, 
  onChange 
}) => {
  const updateDiscount = (occupancy: number, discountPercentage: number) => {
    const existing = occupancyPricing.discounts.find(d => d.occupancy === occupancy);
    let newDiscounts = [...occupancyPricing.discounts];
    
    if (existing) {
      newDiscounts = newDiscounts.map(d => d.occupancy === occupancy ? { ...d, discountPercentage } : d);
    } else {
      newDiscounts.push({ occupancy, discountPercentage });
    }
    
    onChange({
      occupancyPricing: { ...occupancyPricing, discounts: newDiscounts }
    });
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-[#0e2a47]">Pricing</h2>
        <p className="text-sm text-slate-500 font-medium">Set your standard rate and occupancy-based discounts.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Standard Rate */}
        <div className="p-5 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard Rate (USD)</label>
          <div className="relative">
            <input 
              type="number"
              min="0"
              value={pricePerNight || ""}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = Number(e.target.value);
                const local = Math.round(val * 1.08);
                const nonLocal = Math.round(val * 1.12);
                onChange({ 
                  pricePerNight: val,
                  localPrice: local,
                  nonLocalPrice: nonLocal
                });
              }}
              className="w-full h-10 md:h-12 pl-4 pr-12 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">USD</span>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400">≈ {Math.round(pricePerNight * 15.42)} MVR</p>
        </div>

        {/* Local Rate */}
        <div className="p-5 md:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3 opacity-80">
          <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Rate (LKR)</label>
          <div className="h-10 md:h-12 flex items-center px-4 rounded-lg border border-slate-200 bg-slate-100 text-xs md:text-sm font-bold text-slate-500">
            {localPrice || 0}
            <span className="ml-auto text-[10px] font-bold text-slate-300">LKR</span>
          </div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Non-Local Rate (USD)</label>
          <div className="h-12 flex items-center px-4 rounded-lg border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500">
            {nonLocalPrice || 0}
            <span className="ml-auto text-[10px] font-bold text-slate-300">USD</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400">≈ {Math.round((nonLocalPrice || 0) * 15.42)} MVR</p>
        </div>
      </div>

      {/* Occupancy Pricing */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-[#0e2a47]">Price per group size</h4>
            <p className="text-xs text-slate-400">Offering lower rates for groups of less than 2 makes your property more attractive to potential guests.</p>
          </div>
          <button 
            type="button"
            onClick={() => onChange({ occupancyPricing: { ...occupancyPricing, enabled: !occupancyPricing.enabled }})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${occupancyPricing.enabled ? 'bg-[#2dd4af]' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${occupancyPricing.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {occupancyPricing.enabled && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-50">
                <tr>
                  <th className="px-6 py-4 font-black text-[#0e2a47] uppercase tracking-[0.15em] text-[9px]">Occupancy</th>
                  <th className="px-6 py-4 font-black text-[#0e2a47] uppercase tracking-[0.15em] text-[9px] text-center">Discount %</th>
                  <th className="px-6 py-4 font-black text-[#0e2a47] uppercase tracking-[0.15em] text-[9px] text-right">Final Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.from({ length: maxGuests }, (_, i) => maxGuests - i).map((occ) => {
                  const isMax = occ === maxGuests;
                  const discountObj = occupancyPricing.discounts.find(d => d.occupancy === occ);
                  const discount = isMax ? 0 : (discountObj?.discountPercentage || 0);
                  const finalPrice = pricePerNight * (1 - discount / 100);

                  return (
                    <tr key={occ} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">{occ} {occ === 1 ? 'Guest' : 'Guests'}</span>
                          {isMax && <span className="text-[8px] font-black bg-[#2dd4af]/10 text-[#2dd4af] px-1.5 py-0.5 rounded-md uppercase tracking-widest">Base</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          {isMax ? (
                            <span className="text-slate-300 font-bold italic">Standard Rate</span>
                          ) : (
                            <div className="relative w-24">
                              <input 
                                type="number" 
                                min="0" max="99"
                                value={discount || ""}
                                onKeyDown={(e) => {
                                  if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => updateDiscount(occ, Number(e.target.value))}
                                className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-[#0e2a47] focus:outline-none focus:border-[#2dd4af]"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-300">%</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-[#0e2a47]">
                        ${finalPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentPricingConfig;
