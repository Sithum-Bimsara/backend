import React from 'react';
import type { CreateDealDto } from '../../dtos/deals.dtos';
import { CATEGORIES } from '../../../Deals/constants/deal-taxonomy';
import CustomSelect from '../../../../components/Common/CustomSelect';
import IslandSelect from '../../../../components/IslandSelect';

interface Props {
  data: CreateDealDto;
  onChange: (data: Partial<CreateDealDto>) => void;
}

const BasicInfoStep: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#0e2a47] mb-0.5">Basic Information</h3>
        <p className="text-[12px] text-slate-400">Describe your deal to attract travellers</p>
      </div>



      {/* Title */}
      <div>
        <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Deal Title *</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => {
            const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            onChange({ title: clean });
          }}
          onKeyDown={(e) => {
            const isLetterOrSpace = /^[a-zA-Z\s]$/.test(e.key);
            const isNavigation = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
            ].includes(e.key) || e.ctrlKey || e.metaKey;
            
            if (!isLetterOrSpace && !isNavigation) {
              e.preventDefault();
            }
          }}
          placeholder="e.g. Maldives Dive Adventure Package"
          className="w-full h-10 md:h-12 px-4 md:px-5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm text-[#0e2a47] font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
        />
        <p className="text-[10px] text-slate-400 mt-1 ml-1">Letters and spaces only (no numbers or symbols allowed)</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Description *</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the experience in detail..."
          rows={2}
          className="w-full px-4 md:px-5 py-3 rounded-xl border border-slate-200 bg-white text-xs md:text-sm text-[#0e2a47] font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] focus:ring-4 focus:ring-[#2dd4af]/5 transition-all resize-none"
        />
      </div>

      {/* Location + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <IslandSelect
            label="Island *"
            placeholder="Select Island"
            searchable={true}
            value={data.location || null}
            onChange={(value) => onChange({ location: value })}
          />
        </div>
        <div>
          <CustomSelect
            label="Category *"
            options={CATEGORIES}
            value={data.category || null}
            onChange={(value) => onChange({ category: value })}
            placeholder="Select category"
            searchable={true}
          />
        </div>
      </div>

      {/* Duration & Lock Expiry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="mb-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Duration *</label>
            <p className="text-[11px] text-slate-400">Number of days for this package.</p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.durationDays || ''}
            onChange={(e) => {
              const sanitizedValue = e.target.value.replace(/\D/g, '');
              const days = sanitizedValue ? Number(sanitizedValue) : 0;
              let newItineraries = data.itineraries || [];
              if (days && days > 0) {
                if (newItineraries.length < days) {
                  const itemsToAdd = days - newItineraries.length;
                  for (let i = 0; i < itemsToAdd; i++) {
                    newItineraries.push({ dayNumber: newItineraries.length + 1, title: '', description: '' });
                  }
                } else if (newItineraries.length > days) {
                  newItineraries = newItineraries.slice(0, days);
                }
              } else {
                newItineraries = [];
              }
              onChange({ durationType: 'days', durationDays: days, itineraries: newItineraries });
            }}
            onFocus={(e) => e.target.select()}
            placeholder="e.g. 3"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder:text-slate-400 focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all font-bold"
          />
        </div>
        <div>
          <div className="mb-1">
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Lock Expiry (Days) *</label>
            <p className="text-[11px] text-slate-400">How long traveller can keep it locked.</p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.dealLockExpireTime || ''}
            onChange={(e) => {
              const sanitizedValue = e.target.value.replace(/\D/g, '');
              const val = sanitizedValue ? Number(sanitizedValue) : 0;
              onChange({ dealLockExpireTime: val });
            }}
            onFocus={(e) => e.target.select()}
            placeholder="e.g. 1"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder:text-slate-400 focus:outline-none focus:border-[#2dd4af] focus:ring-2 focus:ring-[#2dd4af]/10 transition-all font-bold"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
