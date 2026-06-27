import React from 'react';

interface AddAvailabilityButtonProps {
  onClick: () => void;
  className?: string;
}

const AddAvailabilityButton: React.FC<AddAvailabilityButtonProps> = ({
  onClick,
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all border-none shadow-sm shadow-[#2dd4af]/20 bg-[#2dd4af] hover:bg-[#25b191] cursor-pointer ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span className="hidden sm:inline">Add Availability</span>
      <span className="sm:hidden">Add</span>
    </button>
  );
};

export default AddAvailabilityButton;
