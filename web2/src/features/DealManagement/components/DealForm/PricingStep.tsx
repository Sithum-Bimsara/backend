import React from 'react';
import type { CreateDealDto } from '../../dtos/deals.dtos';

interface Props {
  data: CreateDealDto;
  onChange: (data: Partial<CreateDealDto>) => void;
}

const PricingStep: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#0e2a47] mb-0.5">Pricing Details</h3>
        <p className="text-[12px] text-slate-400">Set your pricing and platform commission</p>
      </div>

      {/* Local Only Toggle */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <div>
          <h4 className="text-[13px] font-bold text-[#0e2a47]">Local Resident Only Deal</h4>
          <p className="text-[11px] text-slate-400">Check this if the deal is exclusive to Maldives residents.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const nextValue = !data.isLocalOnly;
            onChange({ 
              isLocalOnly: nextValue,
              currency: nextValue ? 'MVR' : 'USD'
            });
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${data.isLocalOnly ? 'bg-[#2dd4af]' : 'bg-slate-200'}`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${data.isLocalOnly ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Pricing */}
      <div className="bg-linear-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-3">
        <h4 className="text-xs font-bold text-[#0e2a47] mb-2">Pricing</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-0.5">Original Price ({data.currency === 'MVR' ? 'MVR' : '$'})</label>
            <p className="text-[10px] text-slate-400 mb-1.5 leading-tight">Fake high price to show discount</p>
            <input
              type="number"
              value={data.originalPrice || ''}
              onChange={(e) => onChange({ originalPrice: e.target.value ? Number(e.target.value) : 0 })}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all"
            />
            <p className="text-[9px] text-slate-400 mt-1">Positive numbers only (no symbols or letters)</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-0.5">Deal Price ({data.currency === 'MVR' ? 'MVR' : '$'})</label>
            <p className="text-[10px] text-slate-400 mb-1.5 leading-tight">Your actual selling price</p>
            <input
              type="number"
              value={data.dealPrice || ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : 0;
                onChange({
                  dealPrice: val,
                });
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all font-bold"
            />
            <p className="text-[9px] text-slate-400 mt-1">Positive numbers only (no symbols or letters)</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0e2a47] mb-0.5">Displayed Price ({data.currency === 'MVR' ? 'MVR' : '$'})</label>
            <p className="text-[10px] text-[#2dd4af] font-semibold mb-1.5 leading-tight">
              Includes {data.isLocalOnly ? '8%' : '12%'} platform commission
            </p>
            <input
              type="number"
              value={data.dealPrice ? Math.round(data.dealPrice * (data.isLocalOnly ? 1.08 : 1.12)) : ''}
              disabled
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 text-sm text-[#0e2a47] placeholder:text-slate-300 focus:outline-none transition-all font-bold opacity-80 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Validation Messages */}
        {data.originalPrice && data.dealPrice && (
          <div className="mt-3">
            {Math.round(data.dealPrice * (data.isLocalOnly ? 1.08 : 1.12)) < data.originalPrice ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-xs font-semibold text-emerald-700">
                  {Math.round(((data.originalPrice - Math.round(data.dealPrice * (data.isLocalOnly ? 1.08 : 1.12))) / data.originalPrice) * 100)}% discount applied vs Displayed Price
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="text-xs font-semibold text-red-700">
                  Displayed Price ({data.currency === 'MVR' ? 'MVR' : '$'}{Math.round(data.dealPrice * (data.isLocalOnly ? 1.08 : 1.12))}) must be lower than Original Price. Please adjust your Deal Price.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingStep;

