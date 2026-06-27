import React from 'react';
import { SORT_OPTIONS, type ExploreSortOption } from './explore.constants';

interface ExploreFilterTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ExploreFiltersProps {
  activeTab: string;
  tabs: ExploreFilterTab[];
  searchQuery: string;
  sortBy: ExploreSortOption;
  showSortMenu: boolean;
  onSearchQueryChange: (value: string) => void;
  onTabChange: (value: string) => void;
  onSortChange: (value: ExploreSortOption) => void;
  onToggleSortMenu: () => void;
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  activeTab,
  tabs,
  searchQuery,
  sortBy,
  showSortMenu,
  onSearchQueryChange,
  onTabChange,
  onSortChange,
  onToggleSortMenu,
}) => {
  return (
    <div className="bg-white rounded-4xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-4 md:p-5 mb-8">
      <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-4">
        <div className="flex-1 relative">
          <svg viewBox="0 0 24 24" className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search deals, locations, activities..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-full pl-12 pr-5 py-3.5 bg-white rounded-2xl border border-black/5 text-[14px] text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#2dd4af]/30 transition-all shadow-xl shadow-black/5"
          />
        </div>

        <div className="relative lg:w-64">
          <button
            onClick={onToggleSortMenu}
            className="w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-white rounded-2xl border border-black/5 text-[13px] font-semibold text-slate-600 hover:border-[#2dd4af]/40 transition-all whitespace-nowrap cursor-pointer shadow-xl shadow-black/5"
          >
            {sortBy}
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-black/5 z-40 min-w-full overflow-hidden">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onSortChange(option)}
                  className={`w-full text-left px-5 py-3.5 text-[13px] font-medium hover:bg-[#f2fbf9] transition-colors cursor-pointer ${sortBy === option ? 'text-[#2dd4af] font-bold' : 'text-slate-600'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer border ${activeTab === tab.id
              ? 'bg-[#0e2a47] text-white shadow-xl shadow-[#0e2a47]/20 border-transparent pointer-events-none'
              : 'bg-white text-slate-500 border-black/5 hover:border-[#2dd4af]/50 hover:text-[#0e2a47] shadow-sm'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-[#2dd4af]' : 'text-slate-400 group-hover:text-[#2dd4af]'}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExploreFilters;
