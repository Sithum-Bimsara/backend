import React from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
  className?: string;
  title?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isLoading,
  className = "",
  title = "Refresh data"
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`ml-1 p-1.5 rounded-lg text-slate-400 hover:text-[#2dd4af] hover:bg-[#2dd4af]/10 transition-all border-none cursor-pointer bg-transparent disabled:opacity-50 ${isLoading ? 'animate-spin' : ''} ${className}`}
      title={title}
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
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
        <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </button>
  );
};

export default RefreshButton;
