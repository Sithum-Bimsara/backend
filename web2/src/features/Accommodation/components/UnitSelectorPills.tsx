import React from 'react';
import type { IUnitView } from '../types/accommodation.types';

interface UnitSelectorPillsProps {
  units: IUnitView[];
  selectedUnitId: string | null;
  onUnitChange: (unitId: string) => void;
  isHotel: boolean;
  className?: string;
}

const UnitSelectorPills: React.FC<UnitSelectorPillsProps> = ({
  units,
  selectedUnitId,
  onUnitChange,
  isHotel,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide max-w-full md:max-w-[60%] ${className}`}>
      {units?.map((unit) => (
        <button
          key={unit.id}
          onClick={() => onUnitChange(unit.id)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${
            selectedUnitId === unit.id
              ? 'bg-[#0e2a47] text-white border-[#0e2a47] shadow-sm'
              : 'bg-white text-slate-400 border-slate-200 hover:border-[#2dd4af] hover:text-[#0e2a47]'
          }`}
        >
          {unit.name}
          {isHotel && selectedUnitId === unit.id && (
            <span className="ml-1.5 opacity-60 font-medium">({unit.totalInventory})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default UnitSelectorPills;
