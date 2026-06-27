import React from 'react';
import { MerchantActionButton } from '../../../features/MerchantProfile/components/MerchantUI';
import AccommodationTabs from '../../../components/MerchantTabs/MerchantTabs';
import AccommodationLockCard from '../../../features/Accommodation/components/AccommodationLockCard';
import AccommodationBookingCard from '../../../features/Accommodation/components/AccommodationBookingCard';
import { useAccommodationBookings } from '../../../features/Accommodation/hooks/useAccommodationBookings';
import Pagination from '../../../components/Pagination/Pagination';
import CardSkeleton from '../../../components/Common/CardSkeleton';
import EmptyState from '../../../components/Common/EmptyState';

interface Props {
  propertyId: string;
  onBack: () => void;
  onNavigate: (tab: 'details' | 'calendar' | 'bookings') => void;
}

type SubTab = 'locks' | 'bookings';

// ─── Main Page ────────────────────────────────────────────────────────────────
const AccommodationBookingsPage: React.FC<Props> = ({ propertyId, onBack, onNavigate }) => {
  const {
    subTab,
    setSubTab,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    locks,
    locksTotal,
    locksPage,
    setLocksPage,
    locksLoading,
    bookings,
    bookingsTotal,
    bookingsPage,
    setBookingsPage,
    bookingsLoading,
    fetchLocks,
    fetchBookings,
    handleApplyDates,
    handleClearDates,
    isLoading,
    property,
    propertyLoading,
  } = useAccommodationBookings(propertyId);

  if (propertyLoading && !property) {
    return (
      <div className="flex flex-col bg-(--app-bg) flex-1 min-h-0">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-3">
              <MerchantActionButton onClick={onBack} variant="secondary">Back</MerchantActionButton>
              <div className="h-5 bg-slate-200 rounded w-48 animate-pulse ml-2"></div>
            </div>
            <div className="border-t border-slate-50">
              <AccommodationTabs activeTab="bookings" onNavigate={onNavigate} />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 min-h-0 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-32 bg-slate-200 rounded w-full"></div>
            <div className="h-32 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-(--app-bg) flex-1 min-h-0">
      {/* ── Sticky Navigation & Filter Header ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm shrink-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Row: Back, Title, Refresh */}
          <div className="flex items-center gap-3 py-3">
            <MerchantActionButton onClick={onBack} variant="secondary">Back</MerchantActionButton>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-sm font-bold text-slate-800 truncate">
                {property?.name || 'Property'}
              </h1>
              {property && (
                <span className={`shrink-0 inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${property.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${property.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {property.isActive ? 'Active' : 'Draft'}
                </span>
              )}
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                {subTab === 'locks' ? locksTotal : bookingsTotal} total
              </span>
              {/* Refresh */}
              <button
                onClick={() => subTab === 'locks' ? fetchLocks(locksPage) : fetchBookings(bookingsPage)}
                disabled={isLoading}
                className={`ml-1 p-1.5 rounded-lg text-slate-400 hover:text-[#2dd4af] hover:bg-[#2dd4af]/10 transition-all border-none cursor-pointer bg-transparent disabled:opacity-50 ${isLoading ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="border-t border-slate-50">
            <AccommodationTabs activeTab="bookings" onNavigate={onNavigate} />
          </div>

          {/* Sub-tabs + Date Filter Bar (Consolidated into Sticky) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-t border-slate-50 overflow-hidden">
            {/* Sub-tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit shrink-0">
              {(['locks', 'bookings'] as SubTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setSubTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none capitalize ${subTab === t ? 'bg-white text-[#0e2a47] shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
                    }`}
                >
                  {t === 'locks' ? 'Locks' : 'Bookings'}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 ml-auto flex-nowrap overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="text-xs border-none outline-none bg-transparent text-slate-600 w-24 sm:w-28"
                  placeholder="Start"
                />
                <span className="text-slate-300 text-xs">—</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="text-xs border-none outline-none bg-transparent text-slate-600 w-24 sm:w-28"
                  placeholder="End"
                />
              </div>
              <button
                onClick={handleApplyDates}
                disabled={!startDate && !endDate}
                className="px-3 py-2 rounded-xl bg-[#2dd4af] text-white text-xs font-bold hover:bg-[#25b191] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shrink-0"
              >
                Apply
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearDates}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer border-none shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 min-h-0 overflow-y-auto">

        {/* ── Cards List ── */}
        {subTab === 'locks' && (
          <>
            {locksLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
            ) : locks.length === 0 ? (
              <EmptyState type="locks" />
            ) : (
              <div className="space-y-4">
                {locks.map(lock => <AccommodationLockCard key={lock.id} lock={lock} />)}
              </div>
            )}
            <Pagination
              currentPage={locksPage}
              totalItems={locksTotal}
              itemsPerPage={10}
              onPageChange={(p) => {
                setLocksPage(p);
                fetchLocks(p);
              }}
              loading={locksLoading}
            />
          </>
        )}

        {subTab === 'bookings' && (
          <>
            {bookingsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
            ) : bookings.length === 0 ? (
              <EmptyState type="bookings" />
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => <AccommodationBookingCard key={booking.id} booking={booking} />)}
              </div>
            )}
            <Pagination
              currentPage={bookingsPage}
              totalItems={bookingsTotal}
              itemsPerPage={10}
              onPageChange={(p) => {
                setBookingsPage(p);
                fetchBookings(p);
              }}
              loading={bookingsLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AccommodationBookingsPage;
