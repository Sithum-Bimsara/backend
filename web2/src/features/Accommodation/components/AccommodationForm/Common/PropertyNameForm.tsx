import React from "react";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  name: string;
  description: string;
  onChange: (patch: { name?: string; description?: string }) => void;
  disabled?: boolean;
}

const PropertyNameForm: React.FC<Props> = ({ name, description, onChange, disabled }) => {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader 
        title="Property Details" 
        description="Enter the name and description of your property. This is what guests will see first when searching."
      />
      <div className="space-y-1.5 md:space-y-2">
        <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Property Name *</label>
        <input
          disabled={disabled}
          type="text"
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="e.g. Grand Beach Resort"
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Property Description *</label>
        <textarea
          disabled={disabled}
          rows={4}
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full p-4 md:p-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2dd4af] transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="Describe your property to potential guests..."
        />
      </div>
    </div>
  );
};

export default PropertyNameForm;
