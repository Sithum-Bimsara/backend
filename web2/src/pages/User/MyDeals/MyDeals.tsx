import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockedDealCard from '../../../features/Deals/components/LockedDealCard';
import type { IUserLock, ILockResponse, IAccommodationLockResponse } from '../../../features/Deals/types/deals.types';
import { useLockedDeal } from '../../../context/locked-deal.context';
import Pagination from '../../../components/Pagination/Pagination';
import { UserLockedDealsListSkeleton } from '../../../components/UserUI';
import PageHeader from '../../../components/PageHeader';
import { useUserLocks } from '../../../features/TravelerProfile/hooks/useUserLocks';
import type { IViewUserDealLock, IViewUserAccommodationLock } from '../../../features/TravelerProfile/types/user-profile.types';

import { getSriLankaTime } from '../../../lib/timezone';

const MyDealsPage: React.FC = () => {
  const { activeTab, setActiveTab, deals, accommodations, itemsPerPage } = useUserLocks();

  // High-performance timer state synchronized with Sri Lankan time
  const [now, setNow] = useState<number>(getSriLankaTime().getTime());

  const { setLockedDealFromLock, setLockedAccommodationFromLock } = useLockedDeal();
  const navigate = useNavigate();

  // Centralized high-performance timer for all cards
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getSriLankaTime().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCompleteBooking = (lock: IViewUserDealLock | IViewUserAccommodationLock) => {
    if (lock.type === 'accommodation') {
      setLockedAccommodationFromLock(lock as unknown as IAccommodationLockResponse, lock.title || null, lock.imageUrl || null);
      navigate('/confirm-booking');
      return;
    }
    setLockedDealFromLock(lock as unknown as ILockResponse, lock.title || null, lock.imageUrl || null);
    navigate('/booking-add-ons');
  };

  const currentData = activeTab === 'deals' ? deals : accommodations;

  return (
    <div className="min-h-screen bg-(--app-bg) pt-0 animate-in fade-in duration-500">
      <PageHeader
        title="Your Locked"
        highlightedWord="Deals"
        description="Complete your bookings before they expire."
        backgroundImage="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000&auto=format&fit=crop"
      />

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('deals')}
            className={`pb-4 text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'deals' ? 'text-[#0db898]' : 'text-slate-400 hover:text-[#0e2a47]'
            }`}
          >
            Locked Deals ({deals.total})
            {activeTab === 'deals' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0db898] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('accommodations')}
            className={`pb-4 text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'accommodations' ? 'text-[#0db898]' : 'text-slate-400 hover:text-[#0e2a47]'
            }`}
          >
            Locked Stays ({accommodations.total})
            {activeTab === 'accommodations' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0db898] rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300" />
            )}
          </button>
        </div>

        {currentData.loading && <UserLockedDealsListSkeleton count={3} />}

        {currentData.error && !currentData.loading && (
          <div className="bg-white rounded-3xl p-8 border border-red-100 text-center">
            <p className="text-red-500 font-semibold">{currentData.error}</p>
          </div>
        )}

        {!currentData.loading && !currentData.error && currentData.data.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-black/5 text-center shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <p className="text-slate-500">
              You haven't locked any {activeTab === 'deals' ? 'deals' : 'stays'} yet.
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-6 py-2.5 bg-[#2dd4af] text-white rounded-xl font-bold hover:bg-[#25b898] transition-colors cursor-pointer"
            >
              Browse {activeTab === 'deals' ? 'Deals' : 'Properties'}
            </button>
          </div>
        )}

        {!currentData.loading && !currentData.error && currentData.data.length > 0 && (
          <div className="flex flex-col gap-6">
            {currentData.data.map((lock) => (
              <LockedDealCard
                key={lock.id}
                lock={lock as unknown as IUserLock}
                now={now}
                onComplete={() => handleCompleteBooking(lock)}
              />
            ))}

            <Pagination
              currentPage={currentData.page}
              totalItems={currentData.total}
              itemsPerPage={itemsPerPage}
              onPageChange={currentData.setPage}
              loading={currentData.loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDealsPage;
