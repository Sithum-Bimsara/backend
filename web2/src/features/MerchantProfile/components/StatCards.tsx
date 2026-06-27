import React from 'react';
import type { IMerchantStats } from '../../Bookings/types/merchant.types';

interface StatCardsProps {
  stats: IMerchantStats;
}

const statConfigs = [
  {
    key: 'activeDeals' as const,
    label: 'Active Deals',
    changeKey: 'activeDealsChange' as const,
    color: '#2dd4af',
    bgColor: 'rgba(45, 212, 175, 0.08)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    key: 'locks' as const,
    label: 'Locked Slots',
    changeKey: 'locksChange' as const,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    key: 'bookings' as const,
    label: 'Booked Slots',
    changeKey: 'bookingsChange' as const,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: 'revenue' as const,
    label: 'Revenue',
    changeKey: 'revenueChange' as const,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      {statConfigs.map((config) => {
        const value = stats[config.key];
        const change = stats[config.changeKey];
        const isPositive = change >= 0;

        return (
          <div
            key={config.key}
            className="flex flex-col justify-between bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50"
                style={{ backgroundColor: config.bgColor, color: config.color }}
              >
                {config.icon}
              </div>
              
              <div className="flex flex-col items-end">
                <span
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-700 bg-red-50'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={`w-3 h-3 ${!isPositive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  {isPositive ? '+' : ''}{change}%
                </span>
                <span className="text-[10px] text-slate-400 mt-1">vs last month</span>
              </div>
            </div>

            <div>
              <div className="text-[13px] font-medium text-slate-500 mb-1">
                {config.label}
              </div>
              <div className="text-2xl font-semibold text-slate-800 tracking-tight">
                {config.key === 'revenue' ? `$${value.toLocaleString()}` : value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
