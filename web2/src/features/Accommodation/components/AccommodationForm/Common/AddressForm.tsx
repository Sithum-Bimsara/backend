import React from "react";
import type { IAccommodation } from "../../../types/accommodation.types";
import IslandSelect from "../../../../../components/IslandSelect";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  value: Partial<IAccommodation>;
  onChange: (patch: Partial<IAccommodation>) => void;
  disabled?: boolean;
}

const AddressForm: React.FC<Props> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Location" 
        description="Tell us where your property is located. This helps guests find your property easily on the map."
      />
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Address *</label>
          <input
            disabled={disabled}
            type="text"
            value={value.address ?? ""}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Property street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">City *</label>
            <input
              disabled={disabled}
              type="text"
              value={value.city ?? ""}
              onChange={(e) => onChange({ city: e.target.value })}
              className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="City name"
            />
          </div>

          <IslandSelect
            disabled={disabled}
            label="Island *"
            placeholder="Select Island"
            searchable={true}
            value={value.island ?? ""}
            onChange={(island) => onChange({ island })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Zip Code *</label>
            <input
              disabled={disabled}
              type="text"
              value={value.zipCode ?? ""}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="Zip code"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
