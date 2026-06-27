import React, { useState, useMemo, useEffect, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublicProperty } from '../../../features/Deals/hooks/usePublicProperty';
import { resolveDealGallery } from '../../../lib/deal-image';
import SEO from '../../../components/SEO';
import { UserDealDetailSkeleton } from '../../../components/UserUI';
import ReviewsSection from '../../../features/Review/ReviewsSection';
import RoleRequirementModal from '../../../components/RestrictModels/RoleRequirementModal';
import AuthRequiredModal from '../../../components/RestrictModels/AuthRequiredModal';
import SuspendedAccountModal from '../../../components/RestrictModels/SuspendedAccountModal';
import LockLimitExceededModal from '../../../components/RestrictModels/LockLimitExceededModal';
import PhoneVerificationModal from '../../../features/(auth)/components/PhoneVerificationModal';
import SelfLockRestrictedModal from '../../../components/RestrictModels/SelfLockRestrictedModal';
import PropertyImageGallery from './components/PropertyImageGallery';
import RoomsSection from './components/RoomsSection';
import { BookingSidebar } from './components/BookingSidebar';
import AmenitiesSection from './components/AmenitiesSection';
import NearbySection from './components/NearbySection';
import MarineLifeSection from './components/MarineLifeSection';
import PoliciesSection from './components/PoliciesSection';
import { usePropertyDetailsLockFlow } from '../../../features/Deals/hooks/usePropertyDetailsLockFlow';
import { AuthContext } from '../../../context/auth.context';


const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { property, loading, error } = usePublicProperty(id);
  const { user } = useContext(AuthContext);
  // isAmenitiesModalOpen state is now managed inside <AmenitiesSection>
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    if (!property) return [];
    if (selectedUnitId) {
      const unit = property.units.find(u => u.id === selectedUnitId);
      return unit?.inventory.filter(i => i.availableRooms > 0).map(i => format(new Date(i.date), 'yyyy-MM-dd')) || [];
    }
    // If no unit selected, show dates available in ANY unit
    const allDates = new Set<string>();
    property.units.forEach(u => {
      u.inventory.forEach(i => {
        if (i.availableRooms > 0) {
          allDates.add(format(new Date(i.date), 'yyyy-MM-dd'));
        }
      });
    });
    return Array.from(allDates);
  }, [property, selectedUnitId]);

  const [activeSection, setActiveSection] = useState('overview');
  const [showStickyNav, setShowStickyNav] = useState(false);

  const {
    selectedRange,
    setSelectedRange,
    handleBook,
    isLocking,
    errorCode,
    errorStatus,
    isPhoneModalOpen,
    setIsPhoneModalOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    showDateError,
    setShowDateError,
    resetLockError,
  } = usePropertyDetailsLockFlow(property);

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

      // Show sticky nav when the top of the amenities section scrolls past the main header (~72px)
      const amenitiesEl = document.getElementById('amenities');
      const amenitiesThreshold = amenitiesEl ? amenitiesEl.offsetTop - 80 : 600;
      setShowStickyNav(scrollPos > amenitiesThreshold);

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

  const lowestPrice = useMemo(() => {
    if (!property || !property.units.length) return 0;
    return Math.min(...property.units.map(u => u.displayedPrice || Infinity));
  }, [property]);

  if (loading) return <UserDealDetailSkeleton />;
  if (error || !property) return <Navigate to="/" replace />;

  const images = resolveDealGallery(property.images.map(img => img.url), 4);
  const isHotel = property.type === 'hotel';

  return (
    <div className="min-h-screen bg-[#fcf9f4] property-details-page" style={{ fontFamily: "'Inter', sans-serif" }}>
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
        url={`/accommodations/${property.id}`}
      />
      <div className="border-b border-slate-100 relative">

        <div className="max-w-384 mx-auto px-4 md:px-12 lg:px-20 pt-24 pb-6">
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

      <div className="max-w-384 mx-auto px-4 md:px-12 lg:px-20 pt-6 flex flex-wrap items-center text-sm font-bold text-[#0e2a47] gap-3">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          {property.reviewsPreview?.summary?.averageRating || 'New'} ·
          <span className="underline decoration-slate-400 underline-offset-4 ml-1">{property.reviewsPreview?.summary?.totalReviews || 0} reviews</span>
        </div>
        ·
        <div className="flex items-center gap-1 underline decoration-[#0e2a47] underline-offset-4">
          {property.city}, {property.island} {property.zipCode && `(${property.zipCode})`}
        </div>
        {isHotel && property.starRating && property.starRating !== 'N/A' && (
          <>
            ·
            <div className="flex items-center gap-0.5 text-amber-500" title={property.starRating}>
              {Array.from({ length: parseInt(property.starRating) || 0 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky Sub-Navigation - Adjusted top to be under main header */}
      <div className={`sticky top-18 z-60 bg-white border-b border-slate-100 transition-all duration-300 ${showStickyNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-384 mx-auto px-4 md:px-20 h-16 flex items-center justify-between">
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

      <div className="max-w-384 mx-auto px-4 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0 space-y-16">

            <section id="overview" className="scroll-mt-40">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-black text-[#0e2a47] flex items-center gap-3">
                  About this stay
                </h2>
              </div>
              <div className="bg-white rounded-3xl md:rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-sm prose prose-slate max-w-none space-y-6">
                <p className="text-slate-600 leading-relaxed text-sm md:text-base lg:text-base whitespace-pre-line font-normal opacity-90">
                  {property.description}
                </p>

                {/* Premium Metadata Info Row */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                  {/* Property Type */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Property Type</span>
                    <span className="text-[#0e2a47] font-bold capitalize mt-0.5">{property.type}</span>
                  </div>

                  {/* Star Rating (Hotel only) */}
                  {isHotel && property.starRating && property.starRating !== 'N/A' && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</span>
                      <span className="text-[#0e2a47] font-bold mt-0.5 flex items-center gap-1">
                        <span className="text-amber-500 flex items-center">
                          {Array.from({ length: parseInt(property.starRating) || 0 }).map((_, i) => (
                            <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{property.starRating}</span>
                      </span>
                    </div>
                  )}

                  {/* Zip Code */}
                  {property.zipCode && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Zip Code</span>
                      <span className="text-[#0e2a47] font-bold mt-0.5">{property.zipCode}</span>
                    </div>
                  )}

                  {/* Languages Spoken */}
                  {property.languages && property.languages.length > 0 && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Languages Spoken</span>
                      <span className="text-[#0e2a47] font-bold mt-0.5 flex flex-wrap gap-1.5">
                        {property.languages.map((lang: string, i: number) => (
                          <span key={i} className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-100">
                            {lang}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Grouped property-info sections (amenities, nearby, marine life) ── */}
            <div className="flex flex-col gap-16">

              {/* Amenities: property facilities + services grid + show-all modal */}
              <AmenitiesSection
                propertyFacilities={property.propertyFacilities || []}
                services={property.services || {}}
              />

              {/* Nearby points of interest — hidden automatically when empty */}
              <NearbySection points={property.nearbyPointsOfInterest || []} />

              {/* Marine-life zones — hidden automatically when empty */}
              <MarineLifeSection zones={property.marineLifeZones || []} />

            </div>

            {/* Rooms: available room types/units compared in a premium responsive table */}
            <RoomsSection
              units={property.units || []}
              isHotel={isHotel}
              selectedUnitId={selectedUnitId}
              selectedRange={selectedRange}
            />

            {/* Policies: check-in/out schedule + house rules */}
            <PoliciesSection
              checkInFrom={property.checkInFrom}
              checkInTo={property.checkInTo}
              checkOutFrom={property.checkOutFrom}
              checkOutTo={property.checkOutTo}
              smokingAllowed={property.smokingAllowed}
              childrenAllowed={property.childrenAllowed}
              partiesAllowed={property.partiesAllowed}
            />

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

          <BookingSidebar
            property={property}
            lowestPrice={lowestPrice}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            showDateError={showDateError}
            setShowDateError={setShowDateError}
            availableDates={availableDates}
            selectedUnitId={selectedUnitId}
            setSelectedUnitId={setSelectedUnitId}
            handleBook={handleBook}
            isLocking={isLocking}
          />
        </div>
      </div>



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

      {/* Amenities modal is now self-contained inside <AmenitiesSection> */}
    </div>
  );
};

export default PropertyDetailsPage;
