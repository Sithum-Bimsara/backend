import React from 'react';

interface Props {
  activeTab: 'details' | 'calendar' | 'bookings';
  onNavigate: (tab: 'details' | 'calendar' | 'bookings') => void;
}

const TABS: { key: 'details' | 'calendar' | 'bookings'; label: string }[] = [
  { key: 'details',   label: 'Details'   },
  { key: 'calendar',  label: 'Availability' },
  { key: 'bookings',  label: 'Bookings & Locks' },
];

const AccommodationTabs: React.FC<Props> = ({ activeTab, onNavigate }) => {
  return (
    <div className="flex gap-0">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onNavigate(tab.key)}
          className={`px-4 py-2.5 text-xs font-semibold transition-all bg-transparent cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === tab.key
              ? 'text-[#2dd4af] border-[#2dd4af]'
              : 'text-slate-400 hover:text-slate-600 border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AccommodationTabs;
