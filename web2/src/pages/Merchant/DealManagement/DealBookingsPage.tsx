import React from 'react';
import DealPageHeader from '../../../features/DealManagement/components/DealPageHeader';
import DealLockCard from '../../../features/DealManagement/components/DealLockCard';
import DealBookingCard from '../../../features/DealManagement/components/DealBookingCard';
import { useDealBookings, type DealBookingsSubTab } from '../../../features/DealManagement/hooks/useDealBookings';
import Pagination from '../../../components/Pagination/Pagination';
import CardSkeleton from '../../../components/Common/CardSkeleton';
import EmptyState from '../../../components/Common/EmptyState';

interface Props {
  dealId: string;
  onBack: () => void;
  onNavigate: (tab: 'details' | 'availability' | 'bookings') => void;
}

const DealBookingsPage: React.FC<Props> = ({ dealId, onBack, onNavigate }) => {
  const {
    subTab,
    setSubTab,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    locks,
    locksTotal,
    locksTotalPages,
    locksPage,
    setLocksPage,
    locksLoading,
    bookings,
    bookingsTotal,
    bookingsTotalPages,
    bookingsPage,
    setBookingsPage,
    bookingsLoading,
    fetchLocks,
    fetchBookings,
    handleApplyDates,
    handleClearDates,
    isLoading,
    deal,
    dealLoading,
  } = useDealBookings(dealId);

  const handleRefresh = () => {
    if (subTab === 'locks') fetchLocks(locksPage);
    else fetchBookings(bookingsPage);
  };

  if (dealLoading && !deal) {
    return (
      <div className="flex flex-col bg-(--app-bg) min-h-screen">
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

  if (!deal) {
    return <div className="p-8 text-center text-slate-400">Deal not found</div>;
  }

  return (
    <div className="flex flex-col bg-(--app-bg) min-h-screen">
      {/* Sticky Navigation & Title Header */}
      <DealPageHeader
        deal={deal}
        onBack={onBack}
        activeTab="bookings"
        onTabChange={onNavigate}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Consolidated Sub-tabs & Date Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          {/* Sub-tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit shrink-0">
            {(['locks', 'bookings'] as DealBookingsSubTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none capitalize ${
                  subTab === t
                    ? 'bg-white text-[#0e2a47] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                {t === 'locks' ? 'Locks' : 'Bookings'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 font-semibold text-[10px] bg-slate-50 text-slate-500 rounded-full px-3 py-1 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4af]" />
            {subTab === 'locks' ? locksTotal : bookingsTotal} total entries
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 sm:ml-auto flex-nowrap overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs border-none outline-none bg-transparent text-slate-600 w-24 sm:w-28"
                placeholder="Start"
              />
              <span className="text-slate-300 text-xs">—</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
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

        {/* ── Cards List ── */}
        {subTab === 'locks' && (
          <div className="space-y-6">
            {locksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : locks.length === 0 ? (
              <EmptyState type="locks" />
            ) : (
              <div className="space-y-4">
                {locks.map((lock) => (
                  <DealLockCard key={lock.id} lock={lock} />
                ))}
              </div>
            )}
            {locksTotalPages > 1 && (
              <Pagination
                currentPage={locksPage}
                totalItems={locksTotal}
                itemsPerPage={10}
                onPageChange={(p) => {
                  setLocksPage(p);
                  void fetchLocks(p);
                }}
                loading={locksLoading}
              />
            )}
          </div>
        )}

        {subTab === 'bookings' && (
          <div className="space-y-6">
            {bookingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState type="bookings" />
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <DealBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
            {bookingsTotalPages > 1 && (
              <Pagination
                currentPage={bookingsPage}
                totalItems={bookingsTotal}
                itemsPerPage={10}
                onPageChange={(p) => {
                  setBookingsPage(p);
                  void fetchBookings(p);
                }}
                loading={bookingsLoading}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DealBookingsPage;
