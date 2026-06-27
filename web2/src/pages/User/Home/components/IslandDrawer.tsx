import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Island } from '../../../../constants/islands';
import type { IDealCard } from '../../../../features/Deals/types/deals.types';
import { ListingCardItem } from './ListingCardItem';

interface IslandDrawerProps {
  selectedIsland: Island | null;
  onClose: () => void;
  activeTab: 'packages' | 'stays';
  setActiveTab: (tab: 'packages' | 'stays') => void;
  deals: IDealCard[];
  accommodations: IDealCard[];
  loadingData: boolean;
  errorData: string | null;
  currentList: IDealCard[];
  hasMoreDeals: boolean;
  hasMoreAccommodations: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onCardClick: (id: string, type: 'packages' | 'stays') => void;
}

export const IslandDrawer: React.FC<IslandDrawerProps> = ({
  selectedIsland,
  onClose,
  activeTab,
  setActiveTab,
  deals,
  accommodations,
  loadingData,
  errorData,
  currentList,
  hasMoreDeals,
  hasMoreAccommodations,
  loadingMore,
  onLoadMore,
  onCardClick,
}) => {
  return (
    <AnimatePresence>
      {selectedIsland && (
        <div className="fixed inset-x-0 bottom-0 top-14 lg:top-16 z-100 flex justify-end">
          {/* Backdrop Blur with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0e2a47]/40 backdrop-blur-sm"
          />

          {/* Slider container with smooth right slide */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-lg md:max-w-xl h-full bg-white shadow-[0_0_55px_rgba(14,42,71,0.18)] flex flex-col z-10"
          >
            {/* Cover Banner Header */}
            <div className="relative h-60 md:h-64 shrink-0">
              <img
                src={selectedIsland.image || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop'}
                alt={selectedIsland.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-white via-black/40 to-black/15" />

              {/* Glassmorphic Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 left-5 w-10 h-10 bg-black/25 hover:bg-black/45 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all cursor-pointer z-20 outline-none"
                aria-label="Close details"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Floating Vibe Tag */}
              {selectedIsland.vibe && (
                <div className="absolute top-5 right-5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/25 rounded-full z-20">
                  <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">
                    {selectedIsland.vibe}
                  </span>
                </div>
              )}

              {/* Island Details overlay */}
              <div className="absolute bottom-5 inset-x-6 z-20 flex flex-col justify-end">
                <span className="text-[10px] font-extrabold tracking-widest text-[#2dd4af] uppercase mb-1 drop-shadow-sm">
                  {selectedIsland.atoll}
                </span>
                <h3 className="text-3xl font-extrabold text-white font-['Playfair_Display',serif] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  {selectedIsland.name}
                </h3>
              </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col scrollbar-hide">
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 text-left">
                {selectedIsland.description}
              </p>

              {/* Glassmorphic Tab bar */}
              <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-[18px] mb-6 shrink-0">
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border-none outline-none ${
                    activeTab === 'packages'
                      ? 'bg-[#0e2a47] text-white shadow-md'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tour Deals ({deals.length})
                </button>
                <button
                  onClick={() => setActiveTab('stays')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border-none outline-none ${
                    activeTab === 'stays'
                      ? 'bg-[#0e2a47] text-white shadow-md'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Hotel Stays ({accommodations.length})
                </button>
              </div>

              {/* Listings Display */}
              <div className="flex-1">
                {loadingData ? (
                  // Skeletal List loaders
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse">
                        <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0" />
                        <div className="flex-1 py-1 space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-5/6" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : errorData ? (
                  // Error block
                  <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl text-center">
                    <p className="text-red-500 text-xs font-bold">Failed to load listings</p>
                    <p className="text-[10px] text-red-400 mt-1">{errorData}</p>
                  </div>
                ) : currentList.length === 0 ? (
                  // Empty state block
                  <div className="text-center py-14 px-6 border-2 border-dashed border-slate-100 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
                      </svg>
                    </div>
                    <p className="text-[#0e2a47] font-extrabold text-sm">
                      No active {activeTab === 'packages' ? 'packages' : 'hotel stays'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto">
                      There are currently no active merchant listings on this island. Tap the other tab or check back later!
                    </p>
                  </div>
                ) : (
                  // Listing Cards Grid
                  <div className="space-y-4">
                    {currentList.map((item) => (
                      <ListingCardItem
                        key={item.id}
                        item={item}
                        onClick={() => onCardClick(item.id, activeTab)}
                      />
                    ))}
                    
                    {((activeTab === 'packages' && hasMoreDeals) || (activeTab === 'stays' && hasMoreAccommodations)) && (
                      <div className="pt-4 pb-2 flex justify-center">
                        <button
                          onClick={onLoadMore}
                          disabled={loadingMore}
                          className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0e2a47] hover:bg-[#2dd4af] hover:text-[#0e2a47] disabled:opacity-50 transition-all duration-300 shadow-md flex items-center gap-2 border-none cursor-pointer"
                        >
                          {loadingMore ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Loading Escapes...
                            </>
                          ) : (
                            'Load More Escapes'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
