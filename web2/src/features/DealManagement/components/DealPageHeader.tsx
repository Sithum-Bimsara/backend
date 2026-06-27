import React from 'react';
import { MerchantActionButton } from '../../MerchantProfile/components/MerchantUI';
import type { IDeal } from '../types/deals.types';

interface Props {
  deal: IDeal;
  onBack: () => void;
  activeTab: 'details' | 'availability' | 'bookings';
  onTabChange: (tab: 'details' | 'availability' | 'bookings') => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const DealPageHeader: React.FC<Props> = ({ deal, onBack, activeTab, onTabChange, onRefresh, isRefreshing }) => {
  const tabs: { key: 'details' | 'availability' | 'bookings'; label: string; mobileLabel: string }[] = [
    { key: 'details',      label: 'Details',            mobileLabel: 'Details'   },
    { key: 'availability', label: 'Availability',       mobileLabel: 'Slots'     },
    { key: 'bookings',     label: 'Bookings & Earnings', mobileLabel: 'Earnings' },
  ];

  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Single-row header chrome */}
        <div className="flex items-center gap-3 py-3">

          {/* Back */}
          <MerchantActionButton onClick={onBack} variant="secondary">
            Back
          </MerchantActionButton>

          {/* Deal title + status */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-800 truncate">{deal.title || 'Untitled Deal'}</h1>
            <span className={`shrink-0 inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              deal.isActive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${deal.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {deal.isActive ? 'Active' : 'Inactive'}
            </span>
            
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`ml-1 p-1.5 rounded-lg text-slate-400 hover:text-[#2dd4af] hover:bg-[#2dd4af]/10 transition-all border-none cursor-pointer bg-transparent disabled:opacity-50 ${isRefreshing ? 'animate-spin' : ''}`}
                title="Refresh data"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            )}
          </div>

          {/* Add Availability CTA (only on availability tab) */}
          {activeTab === 'availability' && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-add-availability'))}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#2dd4af] hover:bg-[#25b191] transition-colors border-none cursor-pointer shadow-sm shadow-[#2dd4af]/20"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Add Availability</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* Tab row */}
        <div className="flex items-center justify-center sm:justify-start gap-0 border-t border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold transition-all border-none cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-[#2dd4af] border-[#2dd4af] bg-transparent'
                  : 'text-slate-400 hover:text-slate-600 border-transparent bg-transparent'
              }`}
            >
              <span className="sm:hidden">{tab.mobileLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealPageHeader;
