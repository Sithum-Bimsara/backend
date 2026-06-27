import React from 'react';

type ModalCloseButtonProps = {
  onClick: () => void;
  className?: string;
};

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 shadow-sm transition-all duration-300 hover:scale-105 hover:border-slate-200 hover:text-slate-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400/50 cursor-pointer ${className}`}
      aria-label="Close modal"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};
