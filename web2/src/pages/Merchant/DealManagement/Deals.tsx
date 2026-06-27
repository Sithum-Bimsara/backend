import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealList } from '../../../features/DealManagement/hooks/useDealList';
import { resolveDealImageUrl } from '../../../lib/deal-image';
import { MerchantActionButton, MerchantDealsSkeleton } from '../../../features/MerchantProfile/components/MerchantUI';
import Pagination from '../../../components/Pagination/Pagination';

const MerchantDeals: React.FC = () => {
  const navigate = useNavigate();
  const { deals, loading, error, page, total, limit, actions } = useDealList();

  const getBasePath = () => {
    return '/merchant-dashboard';
  };

  const handleNavigateToManage = (id: string, page: 'details' | 'availability' | 'bookings') => {
    navigate(`${getBasePath()}/deals/${id}/manage/${page}`);
  };

  // ─── Deals List View ───
  return (
    <div className="px-4 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0e2a47]">My Deals</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} deal{total !== 1 ? 's' : ''}</p>
        </div>
        <MerchantActionButton
          onClick={() => navigate(`${getBasePath()}/deals/create`)}
          variant="primary"
        >
          New Deal
        </MerchantActionButton>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <MerchantDealsSkeleton cards={8} />
      ) : deals.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#2dd4af]/10 text-[#2dd4af] flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#0e2a47] mb-1">No Deals Yet</h3>
          <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Create your first deal to start selling travel experiences</p>
          <MerchantActionButton
            onClick={() => navigate(`${getBasePath()}/deals/create`)}
            variant="primary"
          >
            Create Your First Deal
          </MerchantActionButton>
        </div>
      ) : (
        <>
          {/* Deals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {deals.map((deal) => {
            // const activeVariants = deal.variants?.length || 0;
            // const totalBookings = deal._count?.bookings ?? 0;

            return (
              <div
                key={deal.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all w-full"
              >
                {/* Image Section */}
                <div 
                  onClick={() => handleNavigateToManage(deal.id, 'details')}
                  className="relative h-40 overflow-hidden bg-linear-to-br from-slate-100 to-slate-50 cursor-pointer"
                >
                  <img
                    src={resolveDealImageUrl(deal.primaryImageUrl)}
                    alt={deal.title || 'Deal image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = resolveDealImageUrl(null);
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${deal.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${deal.isActive ? 'bg-white' : 'bg-white/50'}`} />
                      {deal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 
                    onClick={() => handleNavigateToManage(deal.id, 'details')}
                    className="font-bold text-[#0e2a47] text-[15px] leading-tight mb-1 hover:text-[#2dd4af] transition-colors cursor-pointer truncate"
                  >
                    {deal.title || 'Untitled Deal'}
                  </h3>
                  {deal.location && (
                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {deal.location}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[17px] font-bold text-[#2dd4af]">
                      ${deal.displayedPrice?.toFixed(0) || '—'}
                    </span>
                    {/* <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        {activeVariants}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        {totalBookings}
                      </span>
                    </div> */}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => handleNavigateToManage(deal.id, 'details')}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 hover:bg-[#0e2a47] hover:text-white transition-all text-slate-500 border-none cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Details</span>
                    </button>
                    <button
                      onClick={() => handleNavigateToManage(deal.id, 'availability')}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 hover:bg-[#0e2a47] hover:text-white transition-all text-slate-500 border-none cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Calendar</span>
                    </button>
                    <button
                      onClick={() => handleNavigateToManage(deal.id, 'bookings')}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl bg-slate-50 hover:bg-[#0e2a47] hover:text-white transition-all text-slate-500 border-none cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Bookings</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={actions.setPage}
          loading={loading}
        />
      </>
    )}
    </div>
  );
};

export default MerchantDeals;
