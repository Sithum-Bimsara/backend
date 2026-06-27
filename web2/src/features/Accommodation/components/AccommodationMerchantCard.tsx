import React from 'react';
import type { IAccommodationSummaryView } from '../types/accommodation.types';

interface AccommodationMerchantCardProps {
  property: IAccommodationSummaryView;
  onManage: (id: string, page: 'details' | 'calendar' | 'bookings') => void;
}

const AccommodationMerchantCard: React.FC<AccommodationMerchantCardProps> = ({ property, onManage }) => {
  const displayImageUrl = property.images?.[0]?.url || '/placeholder-property.jpg';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all w-full">
      {/* Image Section */}
      <div 
        onClick={() => onManage(property.id, 'details')}
        className="relative h-40 overflow-hidden bg-linear-to-br from-slate-100 to-slate-50 cursor-pointer"
      >
        <img
          src={displayImageUrl}
          alt={property.name || 'Property image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(event) => {
            event.currentTarget.src = '/placeholder-property.jpg';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${property.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${property.isActive ? 'bg-white' : 'bg-white/50'}`} />
            {property.isActive ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 
          onClick={() => onManage(property.id, 'details')}
          className="font-bold text-[#0e2a47] text-[15px] leading-tight mb-1 hover:text-[#2dd4af] transition-colors cursor-pointer truncate"
        >
          {property.name || 'Untitled Property'}
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          {(property.city || property.island) && (
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate max-w-[60%]">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {property.city}{property.city && property.island ? ', ' : ''}{property.island}
            </p>
          )}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold ml-auto">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            <span>{property.isActive ? 'Active' : 'Draft'}</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-50">
          <button
            onClick={() => onManage(property.id, 'details')}
            className="flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 hover:bg-[#0e2a47] hover:text-white transition-all text-slate-500 border-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">Details</span>
          </button>
          <button
            onClick={() => onManage(property.id, 'calendar')}
            className="flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 hover:bg-[#0e2a47] hover:text-white transition-all text-slate-500 border-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">Calendar</span>
          </button>
          <button
            onClick={() => onManage(property.id, 'bookings')}
            className="flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 hover:bg-[#0e2a47] hover:text-white transition-all text-slate-500 border-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            <span className="text-[9px] font-bold uppercase tracking-wider">Bookings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccommodationMerchantCard;
