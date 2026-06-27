import React, { useState, useMemo, useEffect } from 'react';
import BookingCard from '../../../features/Bookings/components/BookingCard';
import { getMyBookings } from '../../../features/Deals/api/deals.api';
import type { BookingStatus } from '../../../features/Deals/types/deals.types';
import type { IBookingResponse } from '../../../features/Deals/types/deals.types';
import Pagination from '../../../components/Pagination/Pagination';
import { UserBookingsListSkeleton } from '../../../components/UserUI';
import PageHeader from '../../../components/PageHeader';

const tabs: { key: BookingStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  {
    key: 'all',
    label: 'All Bookings',
    icon: (
      <svg viewBox="0 0 24 24" className="w-2 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'paid',
    label: 'Confirmed',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    key: 'failed',
    label: 'Failed',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
];

const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');
  const [bookings, setBookings] = useState<IBookingResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await getMyBookings({ page: currentPage, limit: ITEMS_PER_PAGE });
        setBookings(res.data);
        setTotal(res.total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings;
    return bookings.filter((b) => b.paymentStatus === activeTab);
  }, [activeTab, bookings]);

  const counts: Record<BookingStatus | 'all', number> = useMemo(() => ({
    all: total, // Use the total from the 'all' fetch if it's the first load or keep separate counts
    paid: bookings.filter((b) => b.paymentStatus === 'paid').length,
    pending: bookings.filter((b) => b.paymentStatus === 'pending').length,
    failed: bookings.filter((b) => b.paymentStatus === 'failed').length,
  }), [bookings, total]);

  return (
    <div className="min-h-screen bg-(--app-bg) pt-0 animate-in fade-in duration-500">
      <PageHeader
        title="Your"
        highlightedWord="Bookings"
        description="Track upcoming adventures and manage your travel itinerary."
        backgroundImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop"
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center justify-center w-17.5 h-17.5 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20 shadow-lg">
            <span className="text-xl font-bold leading-none">{counts.paid}</span>
            <span className="text-[9px] uppercase tracking-wider text-white/60 mt-0.3">Confirmed</span>
          </div>
          <div className="flex flex-col items-center justify-center w-17.5 h-17.5 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20 shadow-lg">
            <span className="text-xl font-bold leading-none">{counts.pending}</span>
            <span className="text-[9px] uppercase tracking-wider text-white/60 mt-0.3">Pending</span>
          </div>
          <div className="flex flex-col items-center justify-center w-17.5 h-17.5 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20 shadow-lg">
            <span className="text-xl font-bold leading-none">{counts.all}</span>
            <span className="text-[9px] uppercase tracking-wider text-white/60 mt-0.3">Total</span>
          </div>
        </div>
      </PageHeader>

      {/* ─── Tabs Section ─── */}
      <div className="sticky top-15 z-40 bg-(--app-bg)/95 backdrop-blur-md border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto py-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-300 border cursor-pointer ${activeTab === tab.key
                  ? 'bg-[#0e2a47] text-white border-[#0e2a47] shadow-lg shadow-[#0e2a47]/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
                  }`}>
                  {counts[tab.key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content Section ─── */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading && <UserBookingsListSkeleton count={3} />}

        {error && !loading && (
          <div className="bg-white rounded-3xl p-8 border border-red-100 text-center">
            <p className="text-red-500 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0e2a47] mb-2">No bookings found</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet. Start exploring deals to book your next adventure!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {!loading && !error && filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}

            <Pagination
              currentPage={currentPage}
              totalItems={total}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )}

        {/* Summary Footer */}
        {filteredBookings.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl bg-white/60 border border-black/5 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2dd4af]/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] text-slate-500 font-medium">
                    {activeTab === 'all' ? 'Total' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings Value
                  </p>
                  <p className="text-2xl font-black text-[#0e2a47]">
                    ${filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-[13px] text-slate-400">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
