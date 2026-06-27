import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccommodationProperties } from '../../../features/Accommodation/hooks/useAccommodationProperties';
import AccommodationMerchantCard from '../../../features/Accommodation/components/AccommodationMerchantCard';
import { MerchantActionButton, MerchantDealsSkeleton } from '../../../features/MerchantProfile/components/MerchantUI';
import Pagination from '../../../components/Pagination/Pagination';
import { useEffect } from 'react';

const AccommodationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get page from URL or default to 1
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const {
    properties,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage
  } = useAccommodationProperties({ page: urlPage, limit: 8 });

  // Sync internal hook page with URL if it changes (e.g. browser back/forward)
  useEffect(() => {
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [urlPage, page, setPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    setPage(newPage);
  };

  const getBasePath = () => {
    return '/merchant-dashboard';
  };

  const handleNavigateToManage = (id: string, page: 'details' | 'calendar' | 'bookings') => {
    navigate(`${getBasePath()}/accommodation/${id}/manage/${page}`);
  };

  // ─── Accommodations List View ───
  return (
    <div className="px-4 lg:px-8 py-6 flex-1 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#0e2a47]">My Accommodations</h1>
            <p className="text-sm text-slate-400 mt-0.5">{total} propert{total !== 1 ? 'ies' : 'y'}</p>
          </div>
          <MerchantActionButton
            onClick={() => navigate(`${getBasePath()}/accommodation/create`)}
            variant="primary"
          >
            Add Property
          </MerchantActionButton>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <MerchantDealsSkeleton cards={6} />
        ) : (properties?.length || 0) === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#2dd4af]/10 text-[#2dd4af] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0e2a47] mb-1">No Properties Yet</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Create your first accommodation listing to start hosting travelers</p>
            <MerchantActionButton
              onClick={() => navigate(`${getBasePath()}/accommodation/create`)}
              variant="primary"
            >
              List Your Property
            </MerchantActionButton>
          </div>
        ) : (
          <>
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties?.map((property) => (
                <AccommodationMerchantCard
                  key={property.id}
                  property={property}
                  onManage={handleNavigateToManage}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 pb-4">
          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={8}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default AccommodationManagement;
