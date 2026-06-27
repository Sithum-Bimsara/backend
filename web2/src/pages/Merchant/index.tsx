import React from 'react';
import MerchantNavbar from '../../features/MerchantProfile/components/MerchantNavbar';
import StatCards from '../../features/MerchantProfile/components/StatCards';
import RevenueChart from '../../features/MerchantProfile/components/RevenueChart';
import MerchantDeals from './DealManagement/Deals';
import AccommodationManagement from './Accommodation/AccommodationManagement';
import AddPropertyPage from './Accommodation/AddPropertyPage';
import MerchantSettings from './Settings/Settings';
import { ChatPage } from './Chat/ChatPage';
import CreateDealPage from './DealManagement/CreateDealPage';
import EditDealPage from './DealManagement/EditDealPage';
import DealDetailsPage from './DealManagement/DealDetailsPage';
import DealAvailabilityPage from './DealManagement/DealAvailabilityPage';
import DealBookingsPage from './DealManagement/DealBookingsPage';
import AccommodationDetailsPage from './Accommodation/AccommodationDetailsPage';
import AccommodationCalendarPage from './Accommodation/AccommodationCalendarPage';
import AccommodationBookingsPage from './Accommodation/AccommodationBookingsPage';
import AddApartmentPage from './Accommodation/AddApartmentPage';
import { useMerchantAnalytics } from '../../features/DealManagement/hooks/useDealAnalytics';
import { MerchantCardsSkeleton } from '../../features/MerchantProfile/components/MerchantUI';

interface MerchantDashboardProps {
  activePage?: string;
  selectedId?: string;
  tab?: string;
  onNavigate?: (page: string) => void;
  onSwitchMode?: () => void;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  activePage = 'dashboard',
  selectedId,
  tab,
  onNavigate,
  onSwitchMode
}) => {
  const { analytics: data, loading } = useMerchantAnalytics();

  // Map analytics data to StatCards format
  const stats = {
    activeDeals: data?.dealsBreakdown.length || 0,
    activeDealsChange: 0,
    locks: data?.overall.totalLocks || 0,
    locksChange: 0,
    bookings: data?.overall.totalBookings || 0,
    bookingsChange: 0,
    revenue: data?.overall.totalEarnings || 0,
    revenueChange: 0,
  };

  // Map time-series to RevenueChart format
  const revenueChartData = data?.timeSeriesRevenue.map(d => ({
    month: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    value: d.earnings
  })) || [];

  return (
    <div className="min-h-screen bg-(--app-bg)">
      <MerchantNavbar activePage={activePage} onNavigate={onNavigate} onSwitchMode={onSwitchMode} />

      {/* Main Content Area */}
      <div className={`lg:ml-65 flex flex-col ${
        activePage === 'messages' || activePage === 'accommodation-manage'
          ? 'h-screen overflow-hidden pt-14 lg:pt-0'
          : 'pt-14 lg:pt-6 min-h-screen'
      }`}>

        {/* ─── Main View ─── */}
        {activePage === 'accommodation-create' ? (
          <AddPropertyPage />
        ) : activePage === 'accommodation-create-apartment' ? (
          <AddApartmentPage />
        ) : activePage === 'deals-create' ? (
          <CreateDealPage 
            onDealCreated={(id) => onNavigate?.(`deals/${id}/manage/details`)}
            onCancel={() => onNavigate?.('deals')}
          />
        ) : activePage === 'deals-edit' && selectedId ? (
          <EditDealPage 
            dealId={selectedId}
            onDealUpdated={() => onNavigate?.(`deals/${selectedId}/manage/details`)}
            onCancel={() => onNavigate?.(`deals/${selectedId}/manage/details`)}
          />
        ) : activePage === 'deals-manage' && selectedId ? (
          tab === 'availability' ? (
            <DealAvailabilityPage dealId={selectedId} onBack={() => onNavigate?.('deals')} onNavigate={(t) => onNavigate?.(`deals/${selectedId}/manage/${t}`)} />
          ) : tab === 'bookings' ? (
            <DealBookingsPage dealId={selectedId} onBack={() => onNavigate?.('deals')} onNavigate={(t) => onNavigate?.(`deals/${selectedId}/manage/${t}`)} />
          ) : (
            <DealDetailsPage dealId={selectedId} onBack={() => onNavigate?.('deals')} onNavigate={(t) => onNavigate?.(`deals/${selectedId}/manage/${t}`)} />
          )
        ) : activePage === 'deals' ? (
          <MerchantDeals />
        ) : activePage === 'accommodation-manage' && selectedId ? (
          tab === 'calendar' ? (
            <AccommodationCalendarPage propertyId={selectedId} onBack={() => onNavigate?.('accommodation')} onNavigate={(t) => onNavigate?.(`accommodation/${selectedId}/manage/${t}`)} />
          ) : tab === 'bookings' ? (
            <AccommodationBookingsPage propertyId={selectedId} onBack={() => onNavigate?.('accommodation')} onNavigate={(t) => onNavigate?.(`accommodation/${selectedId}/manage/${t}`)} />
          ) : (
            <AccommodationDetailsPage propertyId={selectedId} onBack={() => onNavigate?.('accommodation')} onNavigate={(t) => onNavigate?.(`accommodation/${selectedId}/manage/${t}`)} />
          )
        ) : activePage === 'accommodation' ? (
          <AccommodationManagement />
        ) : activePage === 'messages' ? (
          <div className="flex-1 overflow-hidden">
            <ChatPage />
          </div>
        ) : activePage === 'settings' ? (
          <MerchantSettings />
        ) : (
          <div className="px-4 lg:px-8 py-4 lg:py-8 flex-1 bg-(--app-bg)">

            {loading ? (
              <>
                {/* Stats Cards Skeleton */}
                <div className="mb-5 lg:mb-6">
                  <MerchantCardsSkeleton cards={4} />
                </div>

                {/* Revenue Chart + Info Panel Skeleton */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6 mb-5 lg:mb-6">
                  <div className="xl:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-64 animate-pulse" />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-64 animate-pulse" />
                </div>
              </>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="mb-5 lg:mb-6">
                  <StatCards stats={stats} />
                </div>

                {/* Revenue Chart + Top Deals */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6 mb-5 lg:mb-6">
                  <div className="xl:col-span-2">
                    <RevenueChart data={revenueChartData} />
                  </div>

                  {/* Top Rated Deals Panel */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[14px] font-bold text-slate-800">Top Performing Deals</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                      {data?.dealsBreakdown.slice(0, 4).map((deal, idx) => (
                        <div key={deal.dealId} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-50 text-amber-600' :
                              idx === 1 ? 'bg-slate-50 text-slate-500' :
                                'bg-slate-50 text-slate-400'
                            }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[#0e2a47] truncate">{deal.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 capitalize">{deal.bookingsCount} Slots</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-bold text-emerald-600">${deal.earnings.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!data?.dealsBreakdown || data.dealsBreakdown.length === 0) && (
                        <p className="text-xs text-slate-400 text-center py-8">No deals published yet</p>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate?.('deals')}
                      className="mt-6 w-full py-2.5 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-bold hover:bg-[#0e2a47] hover:text-white transition-all border border-slate-200 hover:border-[#0e2a47] cursor-pointer"
                    >
                      Manage All Deals
                    </button>
                  </div>
                </div>

                {/* Footer Spacer */}
                <div className="h-8 lg:h-12" />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
