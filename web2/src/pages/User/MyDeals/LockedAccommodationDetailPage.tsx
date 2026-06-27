import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useLockedAccommodationDetail } from '../../../features/TravelerProfile/hooks/useLockedAccommodationDetail';
import { useLockedDeal } from '../../../context/locked-deal.context';
import { AuthContext } from '../../../context/auth.context';
import { resolveDealGallery } from '../../../lib/deal-image';
import SEO from '../../../components/SEO';
import type { IUnitDetail, IAccommodationLockResponse } from '../../../features/Deals/types/deals.types';
import { UserDealDetailSkeleton } from '../../../components/UserUI';
import ReviewsSection from '../../../features/Review/ReviewsSection';
import RoleRequirementModal from '../../../components/RestrictModels/RoleRequirementModal';
import AuthRequiredModal from '../../../components/RestrictModels/AuthRequiredModal';
import SuspendedAccountModal from '../../../components/RestrictModels/SuspendedAccountModal';
import LockLimitExceededModal from '../../../components/RestrictModels/LockLimitExceededModal';
import PhoneVerificationModal from '../../../features/(auth)/components/PhoneVerificationModal';
import SelfLockRestrictedModal from '../../../components/RestrictModels/SelfLockRestrictedModal';
import PropertyImageGallery from '../PropertyDetails/components/PropertyImageGallery';
import { AmenityIcon } from '../PropertyDetails/components/AmenityIcon';
import { RoomCard } from '../PropertyDetails/components/RoomCard';
import { LockedAccommodationSidebar } from './components/LockedAccommodationSidebar';
import { humanizeRule } from '../PropertyDetails/components/utils';


const LockedAccommodationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { lock, property, loading, error } = useLockedAccommodationDetail(id);
  const { user } = useContext(AuthContext);
  const { setLockedAccommodationFromLock } = useLockedDeal();

  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [selectedRange, setSelectedRange] = useState<{ checkIn: string | null; checkOut: string | null }>({
    checkIn: null,
    checkOut: null
  });
  const [activeSection, setActiveSection] = useState('overview');
  const [showStickyNav, setShowStickyNav] = useState(false);

  // Auto-select cheapest room on load
  useEffect(() => {
    if (property && property.units?.length > 0 && !selectedUnitId) {
      const cheapest = [...property.units].sort((a, b) => (a.displayedPrice || 0) - (b.displayedPrice || 0))[0];
      setSelectedUnitId(cheapest.id);
    }
  }, [property?.units, user?.country]);

  // Scroll spy and sticky nav logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setShowStickyNav(scrollPos > 600);

      const sections = ['photos', 'overview', 'amenities', 'nearby', 'marineLife', 'rooms', 'policies', 'reviews'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offset = element.offsetTop - 160;
          const height = element.offsetHeight;
          if (scrollPos >= offset && scrollPos < offset + height) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Synchronize calendar and room selections with the loaded lock record
  useEffect(() => {
    if (lock) {
      setSelectedRange({
        checkIn: lock.checkInDate,
        checkOut: lock.checkOutDate
      });
      setSelectedUnitId(lock.unitId);
    }
  }, [lock]);

  const resetLockError = () => {
    setErrorCode(null);
    setErrorStatus(null);
  };

  const lowestPrice = useMemo(() => {
    if (!property || !property.units.length) return 0;
    return Math.min(...property.units.map(u => u.displayedPrice || Infinity));
  }, [property]);

  if (loading) return <UserDealDetailSkeleton />;
  if (error || !property) return <Navigate to="/my-deals" replace />;

  const images = resolveDealGallery(property.images.map(img => img.url), 4);
  const isHotel = property.type === 'hotel';

  return (
    <div className="min-h-screen bg-[#fcf9f4] property-details-page pb-32 md:pb-0">
      {/* Global CSS Override for Navbar - Specific to this page */}
      <style>{`
        nav.meet-me-maldives-navbar:not(.is-mobile-open) {
          background: ${window.scrollY < 100 ? 'transparent' : 'white'} !important;
          border-bottom: ${window.scrollY < 100 ? 'none' : '1px solid #f1f5f9'} !important;
          transition: all 0.3s ease-in-out !important;
          box-shadow: ${window.scrollY < 100 ? 'none' : '0 1px 2px 0 rgb(0 0 0 / 0.05)'} !important;
        }
        nav.meet-me-maldives-navbar:not(.is-mobile-open) a, 
        nav.meet-me-maldives-navbar:not(.is-mobile-open) button, 
        nav.meet-me-maldives-navbar:not(.is-mobile-open) span, 
        nav.meet-me-maldives-navbar:not(.is-mobile-open) p, 
        nav.meet-me-maldives-navbar:not(.is-mobile-open) .logo-text {
          color: #0e2a47 !important;
        }
        nav.meet-me-maldives-navbar:not(.is-mobile-open) svg {
          stroke: #0e2a47 !important;
        }
        nav.meet-me-maldives-navbar:not(.is-mobile-open) img {
          filter: none !important;
        }
        nav.meet-me-maldives-navbar:not(.is-mobile-open) [class*="profile"], 
        nav.meet-me-maldives-navbar:not(.is-mobile-open) [class*="user"] {
          color: #0e2a47 !important;
        }
      `}</style>

      <SEO
        title={`${property.name} — ${property.city}, Maldives`}
        description={property.description || ''}
        image={images[0]}
        url={`/my-deals/accommodation/${property.id}/details`}
      />
      <div className="border-b border-slate-100 relative">

        <div className="max-w-[1536px] mx-auto px-4 md:px-12 lg:px-20 pt-24 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="text-2xl md:text-3xl lg:text-4xl font-black text-[#0e2a47] leading-tight">
                {property.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <PropertyImageGallery images={images} />

      <div className="max-w-[1536px] mx-auto px-4 md:px-12 lg:px-20 pt-6 flex flex-wrap items-center text-sm font-bold text-[#0e2a47] gap-3">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          {property.reviewsPreview?.summary?.averageRating || 'New'} ·
          <span className="underline decoration-slate-400 underline-offset-4 ml-1">{property.reviewsPreview?.summary?.totalReviews || 0} reviews</span>
        </div>
        <div className="flex items-center gap-1 underline decoration-[#0e2a47] underline-offset-4">
          {property.city}, {property.island}
        </div>
      </div>

      {/* Sticky Sub-Navigation - Adjusted top to be under main header */}
      <div className={`sticky top-[72px] z-[60] bg-white border-b border-slate-100 transition-all duration-300 ${showStickyNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-[1536px] mx-auto px-4 md:px-20 h-16 flex items-center justify-between">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'photos', label: 'Photos' },
              { id: 'amenities', label: 'Amenities' },
              { id: 'nearby', label: 'Nearby', show: property.nearbyPointsOfInterest && property.nearbyPointsOfInterest.length > 0 },
              { id: 'marineLife', label: 'Marine Life', show: property.marineLifeZones && property.marineLifeZones.length > 0 },
              { id: 'rooms', label: 'Rooms' },
              { id: 'policies', label: 'Policies' },
              { id: 'reviews', label: 'Reviews' }
            ].filter(nav => nav.show !== false).map((nav) => (
              <button
                key={nav.label}
                onClick={() => {
                  if (nav.label === 'Photos') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    document.getElementById(nav.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`text-[13px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all pb-5 mt-5 ${activeSection === nav.id ? 'border-[#0e2a47] text-[#0e2a47]' : 'border-transparent text-slate-400 hover:text-[#0e2a47]'
                  }`}
              >
                {nav.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Starting from</p>
              <p className="text-lg font-black text-[#0e2a47] leading-tight">${lowestPrice.toLocaleString()}</p>
            </div>
            <button
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2 bg-[#0e2a47] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1a3d5e] transition-all"
            >
              Reserve
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1536px] mx-auto px-4 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0 space-y-16">

            <section id="overview" className="scroll-mt-40">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-black text-[#0e2a47] flex items-center gap-3">
                  About this stay
                </h2>
              </div>
              <div className="bg-white rounded-[24px] md:rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-sm prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed text-sm md:text-base lg:text-base whitespace-pre-line font-normal opacity-90">
                  {property.description}
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-16">


              {/* Unified Amenities Section */}
              <section id="amenities" className="scroll-mt-40">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-[#0e2a47] mb-2">What this place offers</h3>
                  <p className="text-slate-400 font-medium">Comprehensive amenities and services designed for your absolute comfort</p>
                </div>

                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 md:gap-y-8 gap-x-8 md:gap-x-12">
                    {/* Property Facilities */}
                    {property.propertyFacilities && property.propertyFacilities.map((facility: string) => (
                      <div key={facility} className="flex items-center gap-4 text-slate-700 group cursor-default">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2dd4af]/10 group-hover:text-[#2dd4af] transition-all shrink-0">
                          <AmenityIcon name={facility} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] md:text-[17px] font-bold leading-tight text-[#0e2a47]">{facility}</span>
                          <span className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Facility</span>
                        </div>
                      </div>
                    ))}

                    {/* Property Services (Integrated from Exclusive Experiences) */}
                    {(Object.entries(property.services || {}) as [string, string | boolean | null | undefined][]).map(([key, val]) => val && val !== 'no' && val !== 'no parking' && (
                      <div key={key} className="flex items-center gap-4 text-slate-700 group cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2dd4af]/10 group-hover:text-[#2dd4af] transition-all shrink-0">
                          <AmenityIcon name={key} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[17px] font-bold leading-tight text-[#0e2a47] capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-[11px] text-[#2dd4af] font-black uppercase tracking-widest mt-0.5">
                            {val === 'yes' ? 'Available' : val}
                          </span>
                        </div>
                      </div>
                    ))}

                    {!property.propertyFacilities?.length && !Object.entries(property.services || {}).some(([_, v]) => v && v !== 'no') && (
                      <p className="text-slate-400 text-sm italic">Contact property for full facility list</p>
                    )}
                  </div>

                  {property.propertyFacilities && property.propertyFacilities.length > 12 && (
                    <button
                      onClick={() => setIsAmenitiesModalOpen(true)}
                      className="mt-12 px-8 py-3 bg-white border border-[#0e2a47] hover:bg-slate-50 text-[#0e2a47] font-black rounded-xl transition-all text-sm uppercase tracking-widest active:scale-95"
                    >
                      Show all {property.propertyFacilities.length} amenities
                    </button>
                  )}
                </div>
              </section>

              {/* Nearby Points of Interest */}
              {property.nearbyPointsOfInterest && property.nearbyPointsOfInterest.length > 0 && (
                <section id="nearby" className="scroll-mt-40">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-[#0e2a47] mb-2">Nearby Points of Interest</h3>
                    <p className="text-slate-400 font-medium">Explore the best attractions and landmarks around this property</p>
                  </div>
                  <div className="bg-white rounded-[24px] md:rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.nearbyPointsOfInterest.map((poi: { name: string; distanceText: string }, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#2dd4af]/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0e2a47] shadow-sm">
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            </div>
                            <span className="text-[#0e2a47] font-bold">{poi.name}</span>
                          </div>
                          <span className="text-slate-500 font-bold text-xs bg-white px-3 py-1 rounded-full border border-slate-100">{poi.distanceText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Marine Life Zones */}
              {property.marineLifeZones && property.marineLifeZones.length > 0 && (
                <section id="marineLife" className="scroll-mt-40">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-[#0e2a47] mb-2">Marine Life & Zones</h3>
                    <p className="text-slate-400 font-medium">Discover the underwater wonders and protected zones nearby</p>
                  </div>
                  <div className="bg-white rounded-[24px] md:rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {property.marineLifeZones.map((zone: { zone: string; description?: string }, idx: number) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#2dd4af]/30 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2dd4af] shadow-sm">
                              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                            </div>
                            <h4 className="text-[#0e2a47] font-black text-lg">{zone.zone}</h4>
                          </div>
                          {zone.description && (
                            <p className="text-slate-600 font-medium text-[15px] leading-relaxed">{zone.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            <section id="rooms" className="scroll-mt-40">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-[#0e2a47]">Available Room Options</h3>
                    <p className="text-slate-400 text-sm font-medium">Select a room type to start your booking</p>
                  </div>
                </div>

                {property.units.length > 0 ? (
                  property.units.map((unit: IUnitDetail) => (
                    <RoomCard
                      key={unit.id}
                      unit={unit}
                      isHotel={isHotel}
                      selectedRange={selectedRange}
                      onDateClick={() => {}}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-[32px] p-12 border-2 border-dashed border-slate-200 text-center">
                    <h4 className="text-lg font-bold text-slate-600">No rooms available</h4>
                  </div>
                )}
              </div>
            </section>

            <section id="policies" className="scroll-mt-40">
              <div className="mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-black text-[#0e2a47] mb-2">Stay Policies</h3>
                <p className="text-slate-400 text-sm md:font-medium">Important information for your stay</p>
              </div>
              <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-10 border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div>
                    <h4 className="text-[12px] md:text-[14px] font-black text-[#0e2a47] uppercase tracking-widest mb-4 md:mb-6">Schedule</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-tighter">Check-in</span>
                          <span className="text-[#0e2a47] font-black text-base md:text-lg">{property.checkInFrom || '14:00'} - {property.checkInTo || 'Midnight'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-tighter">Check-out</span>
                          <span className="text-[#0e2a47] font-black text-base md:text-lg">{property.checkOutFrom || '08:00'} - {property.checkOutTo || '12:00'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[12px] md:text-[14px] font-black text-[#0e2a47] uppercase tracking-widest mb-4 md:mb-6">House Rules</h4>
                    <div className="space-y-2 md:space-y-3">
                      {[
                        { label: 'Smoking', value: property.smokingAllowed },
                        { label: 'Children', value: property.childrenAllowed },
                        { label: 'Parties', value: property.partiesAllowed },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-4 p-3 md:p-4 hover:bg-slate-50 transition-colors rounded-2xl">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${value ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                          <span className="text-slate-600 text-[14px] md:text-[15px] font-medium">{humanizeRule(label, value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="reviews" className="scroll-mt-40 mb-10">
              <ReviewsSection
                id={property.id}
                type="accommodation"
                initialPreview={property.reviewsPreview}
                currentUserId={user?.id}
                userReview={property.userReview}
              />
            </section>
          </div>

          {lock && (
            <LockedAccommodationSidebar
              lock={lock}
              property={property}
            />
          )}
        </div>
      </div>

      {lock && lock.status === 'active' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-[100] flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-500">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#2dd4af] tracking-tight">
                ${(lock.lockedPrice * lock.quantity * Math.max(1, Math.round(Math.abs(new Date(lock.checkOutDate).getTime() - new Date(lock.checkInDate).getTime()) / (1000 * 60 * 60 * 24))) + (lock.customAddons || []).reduce((acc, a) => acc + (a.price || 0), 0)).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Total</span>
            </div>
            <div className="text-[11px] font-bold text-[#ff7b54] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Locked Stay
            </div>
          </div>
          <button
            onClick={() => {
              setLockedAccommodationFromLock(
                lock as unknown as IAccommodationLockResponse,
                property.name,
                property.images[0]?.url || null
              );
              navigate('/confirm-booking');
            }}
            className="flex-1 max-w-[200px] py-3.5 bg-[#2dd4af] text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-[13px] uppercase tracking-widest text-center"
          >
            Complete
          </button>
        </div>
      )}

      {/* Standardized Error Modals */}
      <AuthRequiredModal
        isOpen={errorStatus === 401}
        onClose={resetLockError}
        actionName="book accommodations"
      />
      <RoleRequirementModal
        isOpen={errorCode === 'NOT_TRAVELLER'}
        onClose={resetLockError}
        actionName="book accommodations"
      />
      <SuspendedAccountModal
        isOpen={errorCode === 'SUSPENDED_ACCOUNT' || (errorStatus === 403 && !errorCode)}
        onClose={resetLockError}
        actionName="book accommodations"
      />
      <LockLimitExceededModal
        isOpen={errorCode === 'DAILY_LOCK_LIMIT_EXCEEDED'}
        onClose={resetLockError}
      />
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        isMaldivesOnly={false}
        onClose={() => {
          setIsPhoneModalOpen(false);
          resetLockError();
        }}
        onSuccess={async () => {
          setIsPhoneModalOpen(false);
          resetLockError();
          // Optionally re-trigger handleBook here
        }}
      />
      <SelfLockRestrictedModal
        isOpen={errorCode === 'SELF_LOCK_RESTRICTED'}
        onClose={resetLockError}
      />

      {/* Amenities Modal */}
      {isAmenitiesModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAmenitiesModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between z-10">
              <h3 className="text-xl font-black text-[#0e2a47]">What this place offers</h3>
              <button
                onClick={() => setIsAmenitiesModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-hide">
              <div className="grid grid-cols-1 gap-8">
                {property.propertyFacilities.map((facility: string) => (
                  <div key={facility} className="flex items-center gap-6 border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#2dd4af]">
                      <AmenityIcon name={facility} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#0e2a47]">{facility}</p>
                      <p className="text-sm text-slate-400 font-medium">Verified property facility</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockedAccommodationDetailPage;
