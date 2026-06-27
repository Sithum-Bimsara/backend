import React from "react";
import { motion } from "framer-motion";
import { PROPERTY_TYPE_OPTIONS, type PropertyType } from "../types/accommodation.types";
import { MerchantStepHeader } from "../../MerchantProfile/components/MerchantUI";

interface Props {
  value: PropertyType;
  onChange: (type: PropertyType) => void;
  isReadOnly?: boolean;
}

const PropertyTypeSelector: React.FC<Props> = ({ value, onChange, isReadOnly }) => {
  return (
    <div className="space-y-6 md:space-y-8">
      <MerchantStepHeader 
        title="Property Type" 
        description="Choose the category that best describes your property. This determines how it will be listed."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {PROPERTY_TYPE_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <motion.button
              key={option.value}
              type="button"
              whileHover={isReadOnly ? {} : { y: -2 }}
              whileTap={isReadOnly ? {} : { scale: 0.98 }}
              onClick={() => { if (!isReadOnly) onChange(option.value); }}
              className={`rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-[#2dd4af] bg-white shadow-sm ring-1 ring-[#2dd4af]/10"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
              } ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900">{option.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                </div>
                <span className={`h-3 w-3 rounded-full transition-colors ${active ? "bg-[#2dd4af]" : "bg-slate-300"}`} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyTypeSelector;
