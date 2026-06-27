import React from "react";
import type { IUnit, IOccupancyPricing } from "../../../../types/accommodation.types";

interface Props {
  unit: IUnit & {
    occupancyPricing: IOccupancyPricing;
  };
  onChange: (patch: Partial<IUnit> & { occupancyPricing?: IOccupancyPricing }) => void;
  isReadOnly?: boolean;
}

const UnitPricingConfig: React.FC<Props> = ({ unit, onChange, isReadOnly = false }) => {

  const renderOccupancyPricing = () => {
    const maxOccupancy = unit.maxGuests || 1;
    if (maxOccupancy <= 1) return null;

    return (
      <div className="pt-2 md:pt-1 border-t border-slate-100 space-y-1 md:space-y-2">
        <div className="p-2 md:p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 md:space-y-2">
          <div className="space-y-1">
            <h4 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Price per group size</h4>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed px-1">
              Offering lower rates for groups of less than {maxOccupancy} makes your property more attractive to potential guests.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => {
                if (isReadOnly) return;
                onChange({
                  occupancyPricing: {
                    ...unit.occupancyPricing,
                    enabled: !unit.occupancyPricing.enabled
                  }
                });
              }}
              className={`relative inline-flex h-5 w-9 md:h-6 md:w-11 items-center rounded-full transition-colors focus:outline-none ${unit.occupancyPricing.enabled ? 'bg-[#2dd4af]' : 'bg-slate-200'} ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span className={`inline-block h-3 w-3 md:h-4 md:w-4 transform rounded-full bg-white transition-transform ${unit.occupancyPricing.enabled ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-widest">Enable Discounts</span>
          </div>
        </div>

        {unit.occupancyPricing.enabled && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] md:text-xs">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-400 uppercase tracking-widest">Occupancy</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-400 uppercase tracking-widest text-center">Discount</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 font-bold text-slate-400 uppercase tracking-widest text-right">Guests Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {Array.from({ length: maxOccupancy }, (_, i) => maxOccupancy - i).map((occ) => {
                    const isMax = occ === maxOccupancy;
                    const discountObj = unit.occupancyPricing.discounts.find(d => d.occupancy === occ);
                    const discount = isMax ? 0 : (discountObj?.discountPercentage || 0);
                    const finalPrice = unit.pricePerNight * (1 - discount / 100);

                    return (
                      <tr key={occ} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            <span className="text-xs md:text-sm font-bold">× {occ}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                          {isMax ? (
                            <span className="text-slate-300 font-bold">0%</span>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 md:px-3 py-1 focus-within:border-[#2dd4af] focus-within:bg-white transition-all">
                              <input
                                type="number"
                                min="0"
                                value={discount || ""}
                                disabled={isReadOnly}
                                onKeyDown={(e) => {
                                  if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                  const nextDiscounts = [...unit.occupancyPricing.discounts];
                                  const idx = nextDiscounts.findIndex(d => d.occupancy === occ);
                                  if (idx > -1) nextDiscounts[idx] = { occupancy: occ, discountPercentage: val };
                                  else nextDiscounts.push({ occupancy: occ, discountPercentage: val });
                                  onChange({ occupancyPricing: { ...unit.occupancyPricing, discounts: nextDiscounts } });
                                }}
                                className={`w-6 md:w-8 text-center font-bold text-slate-900 focus:outline-none bg-transparent text-[10px] md:text-xs ${isReadOnly ? 'cursor-not-allowed' : ''}`}
                              />
                              <span className="text-[10px] font-bold text-slate-400">%</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#2dd4af]">${finalPrice.toFixed(0)}</span>
                            <span className="text-[8px] md:text-[9px] font-bold text-slate-300">PER NIGHT</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {isReadOnly && (
        <div className="p-3 md:p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 15v2m0-6V9m4-2a2 2 0 112 2h-1M6 7a2 2 0 11-2 2h1m13 1H7m10 6H7" /></svg>
          </div>
          <p className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-widest leading-relaxed">Pricing is locked while room is verified.</p>
        </div>
      )}

      <div className="p-2 md:p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 md:space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Base Price / Night</label>
          <span className="text-[10px] md:text-xs font-bold text-[#2dd4af] uppercase tracking-widest">USD</span>
        </div>

        <div className="relative">
          <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-lg md:text-xl font-bold text-[#2dd4af]">$</div>
          <input
            type="number"
            min="0"
            value={unit.pricePerNight || ""}
            disabled={isReadOnly}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const basePrice = Number(e.target.value);
              const localPrice = Math.round(basePrice * 1.08);
              const nonLocalPrice = Math.round(basePrice * 1.12);
              onChange({
                pricePerNight: basePrice,
                localPrice,
                nonLocalPrice
              });
            }}
            className={`w-full h-12 md:h-16 pl-10 md:pl-12 pr-6 md:pr-8 rounded-xl border border-slate-200 bg-white text-base md:text-xl font-bold text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all ${isReadOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
            placeholder="0.00"
          />
          <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">
            ≈ {Math.round(unit.pricePerNight * 15.42)} MVR
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 md:space-y-2">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Rate</span>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-slate-900">${unit.localPrice || 0}</span>
              <span className="text-[8px] md:text-[9px] font-bold text-slate-300 tracking-tighter">≈ {Math.round((unit.localPrice || 0) * 15.42)} MVR</span>
            </div>
          </div>
          <div className="p-3 md:p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 md:space-y-2">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intl Rate</span>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-slate-900">${unit.nonLocalPrice || 0}</span>
              <span className="text-[8px] md:text-[9px] font-bold text-slate-300 tracking-tighter">≈ {Math.round((unit.nonLocalPrice || 0) * 15.42)} MVR</span>
            </div>
          </div>
        </div>
      </div>

      {renderOccupancyPricing()}
    </div>
  );
};

export default UnitPricingConfig;
