import React, { useState, useEffect } from 'react';

interface CommunitySearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({ onSearch, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 text-[#8b919d] group-focus-within:text-[#2dd4af] transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search discussions, topics, or tips..."
          className="block w-full pl-12 pr-4 py-4 bg-white border border-black/5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-[#0e2a47] placeholder:text-[#8b919d] focus:outline-none focus:ring-2 focus:ring-[#2dd4af]/20 focus:border-[#2dd4af] transition-all duration-300 text-sm md:text-base font-medium"
        />
        {value && (
          <button
            onClick={() => setValue('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8b919d] hover:text-[#ff4c4c] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
