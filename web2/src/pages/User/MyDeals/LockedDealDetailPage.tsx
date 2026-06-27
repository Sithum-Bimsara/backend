import React, { useState } from 'react';
import { useNavigate, useParams, Navigate, useSearchParams } from 'react-router-dom';
import type { IDealVariantDetail, IDealCard } from '../../../features/Deals/types/deals.types';
import ConfirmLockingModal from '../../../features/Deals/components/ConfirmLockingModal';
import { usePublicDeal } from '../../../features/Deals/hooks/usePublicDeal';
import { formatLocalDate, formatLocalTime } from '../../../lib/date-utils';
import { resolveDealGallery, resolveDealImageUrl } from '../../../lib/deal-image';
import { useAuth } from '../../../context/useAuth';
import PhoneVerificationModal from '../../../features/(auth)/components/PhoneVerificationModal';
import ReviewsSection from '../../../features/Review/ReviewsSection';
import SEO from '../../../components/SEO';
import { UserDealDetailSkeleton } from '../../../components/UserUI';

const LockedDealDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || undefined;
  const { deal, loading, error } = usePublicDeal(id, { source });

  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<'overview' | 'dates' | 'inclusions' | 'details'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const [preselectedVariantId, setPreselectedVariantId] = useState<string | null>(null);

  if (loading) {
    return <UserDealDetailSkeleton />;
  }

  if (error || !deal) {
    return <Navigate to="/my-deals" replace />;
  }

  // Images from deal (up to 4)
  const images = resolveDealGallery([
    deal.primaryImageUrl,
    deal.secondImageUrl,
    deal.thirdImageUrl,
    deal.fourthImageUrl,
  ], 4);

  // Price info
  const lowestPrice = deal.variants.length > 0
    ? Math.min(...deal.variants.map(v => v.displayedPrice ?? v.dealPrice ?? Infinity))
    : deal.displayedPrice ?? deal.dealPrice ?? 0;
  const highestOriginal = deal.variants.length > 0
    ? Math.max(...deal.variants.map(v => v.originalPrice ?? 0))
    : deal.originalPrice ?? 0;
  const discountAmount = highestOriginal > lowestPrice ? Math.round(highestOriginal - lowestPrice) : 0;
  const discountPercent = highestOriginal > 0 ? Math.round((discountAmount / highestOriginal) * 100) : 0;

  // Duration text
  const durationText =
    deal.durationDays && deal.durationDays > 0
      ? `${deal.durationDays} Day${deal.durationDays > 1 ? 's' : ''}`
      : null;

  const formatDate = (dateStr: string | null) => formatLocalDate(dateStr, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }) || 'TBD';

  const formatTime = (dateStr: string | null) => formatLocalTime(dateStr) || 'TBD';

  const handleLockVariant = (variantId: string) => {
    setPreselectedVariantId(variantId);

    if (!user?.phoneVerified) {
      setIsPhoneModalOpen(true);
      return;
    }

    setIsModalOpen(true);
  };

  // Build modal-compatible deal card object
  const dealCardForModal = {
    ...deal,
    merchant: {
      id: deal.merchant.id,
      businessName: deal.merchant.businessName,
      logoUrl: deal.merchant.logoUrl,
    },
    _count: deal.variants[0]?._count ? { bookings: 0 } : undefined,
  } as unknown as IDealCard;

  // Variants for the modal — filter to only those with available slots
  const lockableVariants = deal.variants.filter(v => (v.availableSlots ?? 0) > 0);
  const modalVariants = preselectedVariantId
    ? [
      ...lockableVariants.filter(v => v.id === preselectedVariantId),
      ...lockableVariants.filter(v => v.id !== preselectedVariantId),
    ]
    : lockableVariants;

  // Build SEO data from deal
  const seoTitle = `${deal.title} — ${deal.location}, Maldives`;
  const seoDescription = deal.description
    ? `${deal.description.slice(0, 150).trim()}… Lock this deal from $${lowestPrice.toLocaleString()} with LushWare.`
    : `Book ${deal.title} in ${deal.location}, Maldives. ${deal.durationDays} day${deal.durationDays !== 1 ? 's' : ''} starting from $${lowestPrice.toLocaleString()}.`;

  const dealJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    description: deal.description || seoDescription,
    image: deal.primaryImageUrl || undefined,
    brand: {
      '@type': 'Brand',
      name: deal.merchant.businessName,
    },
    offers: {
      '@type': 'Offer',
      url: `https://lushware.com/deals/${deal.id}`,
      priceCurrency: deal.currency || 'USD',
      price: String(lowestPrice),
      availability:
        deal.variants.some((v) => (v.availableSlots ?? 0) > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      seller: {
        '@type': 'Organization',
        name: deal.merchant.businessName,
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lushware.com/' },
      { '@type': 'ListItem', position: 2, name: 'Deals', item: 'https://lushware.com/explore' },
      { '@type': 'ListItem', position: 3, name: deal.title, item: `https://lushware.com/deals/${deal.id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-(--app-bg) pt-0 animate-in fade-in duration-500">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${deal.title}, ${deal.location} Maldives deals, ${deal.category} Maldives, Maldives travel deals`}
        image={deal.primaryImageUrl}
        url={`/deals/${deal.id}`}
        jsonLd={[dealJsonLd, breadcrumbJsonLd]}
        preloadImages={[
          ...images,
          ...(deal.merchant.logoUrl ? [deal.merchant.logoUrl] : []),
          '/images/default-deal.svg',
        ]}
      />

      {/* ─── Hero: 4-Image Grid ─── */}
      <div className="relative h-[40vh] md:h-[55vh] min-h-60 md:min-h-95 max-h-130 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-0.5">
          {images.slice(0, 4).map((url, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={url}
                alt={`${deal.title || 'Deal'} — photo ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = resolveDealImageUrl(null);
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0e2a47]/90 via-[#0e2a47]/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0e2a47]/50 to-transparent pointer-events-none" />

        {/* Back Button */}
        <div className="absolute top-24 md:top-32 left-0 right-0 z-20 px-4 md:pl-31">
          <div className="">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full border border-white/20 transition-all text-[13px] font-semibold shadow-lg cursor-pointer w-fit"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Bottom Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 md:pl-31 pb-4 md:pb-15">
          <div className="">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-[#2dd4af] text-[12px] font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {deal.location || 'Location TBD'}
                  {durationText && <> &mdash; {durationText}</>}
                </p>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[1.8rem] md:text-[2.4rem] font-light text-white leading-tight mb-1 tracking-wide">
                  {deal.title || 'Untitled Deal'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-white/70 text-[13px] -mt-1">
                  {deal.category && (
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {deal.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    {deal.merchant.businessName}
                  </span>

                  {deal.isLocalOnly && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#2dd4af] text-[#0e2a47] rounded-full text-[10px] font-black uppercase tracking-tighter">
                      🇲🇻 Local Only
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section Tabs ─── */}
      <div className="sticky top-15 z-40 bg-(--app-bg)/95 backdrop-blur-md border-b border-black/5 px-4 md:pl-31">
        <div className="">
          <div className="flex items-center gap-8 overflow-x-auto py-3 scrollbar-hide">
            {([
              {
                key: 'overview', label: 'Overview', icon: (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )
              },
              {
                key: 'dates', label: `Available Dates (${deal.variants.length})`, icon: (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )
              },
              {
                key: 'inclusions', label: "What's Included", icon: (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )
              },
              {
                key: 'details', label: 'Package Info', icon: (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                )
              },
            ] as { key: typeof activeSection; label: string; icon: React.ReactNode }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-300 border cursor-pointer ${activeSection === tab.key
                  ? 'bg-[#0e2a47] text-white border-[#0e2a47] shadow-lg shadow-[#0e2a47]/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="px-4 md:pl-31 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ─── Left: Main Content ─── */}
          <div className="flex-1">

            {/* ─── OVERVIEW section ─── */}
            {activeSection === 'overview' && (
              <div className="flex flex-col gap-5">
                {/* Description */}
                {deal.description && (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6">
                    <h3 className="text-[13px] font-bold text-[#0e2a47] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      About This Deal
                    </h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed">{deal.description}</p>
                  </div>
                )}

                {/* Itinerary */}
                {deal.itineraries.length > 0 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[13px] font-bold text-[#0e2a47] uppercase tracking-widest flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                      Itinerary
                    </h3>
                    {deal.itineraries.map((day) => (
                      <div key={day.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#0e2a47] to-[#1a3f68] text-white flex items-center justify-center font-black text-[14px] shadow-lg shadow-[#0e2a47]/15">
                            {day.dayNumber ?? '?'}
                          </div>
                          {deal.itineraries.indexOf(day) < deal.itineraries.length - 1 && (
                            <div className="w-0.5 flex-1 mt-2 bg-linear-to-b from-[#0e2a47]/20 to-transparent min-h-6" />
                          )}
                        </div>
                        <div className="flex-1 bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 p-5 mb-1">
                          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-lg font-extrabold text-[#0e2a47] mb-1.5 group-hover:text-[#2dd4af] transition-colors duration-300">
                            Day {day.dayNumber}: {day.title || 'Activity'}
                          </h3>
                          {day.description && (
                            <ul className="mt-3 space-y-2">
                              {day.description.split('\n').filter(p => p.trim()).map((point, pIdx) => (
                                <li key={pIdx} className="text-[13px] text-slate-500 leading-relaxed flex items-start gap-2.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4af] shrink-0 mt-1.5 shadow-[0_0_8px_rgba(45,212,175,0.4)]" />
                                  <span>{point.replace(/^[•\-\*]\s*/, '').trim()}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No itinerary fallback */}
                {deal.itineraries.length === 0 && !deal.description && (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-8 text-center">
                    <p className="text-slate-400 text-[14px]">No overview details available yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── DATES section ─── */}
            {activeSection === 'dates' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[13px] font-bold text-[#0e2a47] uppercase tracking-widest flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Available Dates ({deal.variants.length})
                </h3>

                {deal.variants.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-8 text-center">
                    <p className="text-slate-400 text-[14px]">No upcoming dates available.</p>
                  </div>
                ) : (
                  deal.variants.map((variant) => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      onLock={handleLockVariant}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))
                )}
              </div>
            )}

            {/* ─── INCLUSIONS section ─── */}
            {activeSection === 'inclusions' && (
              <div className="flex flex-col gap-6">
                {/* Inclusions */}
                {deal.inclusions.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 overflow-hidden p-6">
                    <h3 className="text-[13px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Included
                    </h3>
                    <div className="flex flex-col gap-3">
                      {deal.inclusions.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="text-[13px] text-slate-700 leading-relaxed">{item.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exclusions */}
                {deal.exclusions.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 overflow-hidden p-6">
                    <h3 className="text-[13px] font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Not Included / Add-ons
                    </h3>
                    <div className="flex flex-col gap-3">
                      {deal.exclusions.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </div>
                            <span className="text-[13px] text-slate-700 leading-relaxed">{item.description}</span>
                          </div>
                          {item.additionalPrice && item.additionalPrice > 0 && (
                            <span className="text-[12px] font-bold text-blue-600 shrink-0">+${item.additionalPrice}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deal.inclusions.length === 0 && deal.exclusions.length === 0 && (
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-8 text-center">
                    <p className="text-slate-400 text-[14px]">No inclusion/exclusion details available.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── DETAILS section ─── */}
            {activeSection === 'details' && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Destination', value: deal.location || 'TBD', icon: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /> },
                    { label: 'Duration', value: durationText || 'TBD', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
                    { label: 'Category', value: deal.category || 'General', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></> },
                    { label: 'Lock Time', value: `${deal.dealLockExpireTime ?? 60} minutes`, icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#2dd4af]/10 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {item.icon}
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-[14px] font-bold text-[#0e2a47] leading-snug">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merchant info */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6">
                  <h3 className="text-[13px] font-bold text-[#0e2a47] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    About the Operator
                  </h3>
                  <div className="flex items-start gap-4">
                    {deal.merchant.logoUrl ? (
                      <img src={deal.merchant.logoUrl} alt={deal.merchant.businessName} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#0e2a47] flex items-center justify-center text-white font-black text-[14px] shrink-0">
                        {deal.merchant.businessName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-[15px] font-bold text-[#0e2a47] mb-1">{deal.merchant.businessName}</p>
                      {deal.merchant.businessDescription && (
                        <p className="text-[12px] text-slate-500 leading-relaxed mb-2">{deal.merchant.businessDescription}</p>
                      )}
                      {(deal.merchant.city || deal.merchant.country) && (
                        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          {[deal.merchant.city, deal.merchant.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Terms & Cancellation Policy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6">
                    <h3 className="text-[13px] font-bold text-[#0e2a47] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      Booking Terms
                    </h3>
                    <ul className="text-[12px] text-slate-600 space-y-2 list-disc pl-4">
                      <li>Full payment is required at the time of booking.</li>
                      <li>Prices include applicable taxes and service charges.</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6 border-l-4 border-l-[#ff7b54]">
                    <h3 className="text-[13px] font-bold text-[#ff7b54] uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Cancellation Policy
                    </h3>
                    <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                      Full refund for cancellations made <span className="font-bold text-[#0e2a47]">30+ days</span> before arrival. No-shows are charged in full.
                    </p>
                  </div>
                </div>

                {/* Pricing breakdown */}
                <div className="bg-linear-to-br from-[#0e2a47] to-[#16406b] rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#2dd4af] opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-[12px] text-white/60 uppercase tracking-widest font-semibold mb-1">Original Price</p>
                      {highestOriginal > 0 && (
                        <p className="text-[1.2rem] font-bold text-white/50 line-through">${highestOriginal.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-white/60 uppercase tracking-widest font-semibold mb-1">From</p>
                      <p className="text-[2rem] font-black text-[#2dd4af] leading-none">${lowestPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 relative z-10">
                      <div className="px-3 py-1 bg-[#ff7b54] rounded-full text-white text-[12px] font-bold">You save ${discountAmount.toLocaleString()}</div>
                      <span className="text-white/50 text-[12px]">({discountPercent}% off)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="w-full lg:w-75 shrink-0 order-first lg:order-last">
            <div className="lg:sticky lg:top-30 flex flex-col gap-4">
              <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-black/5 p-6">
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Starting From</p>
                <div className="flex items-end gap-2 mb-1">
                  <div className="text-[2.2rem] font-black text-[#2dd4af] leading-none">${lowestPrice.toLocaleString()}</div>
                  {highestOriginal > lowestPrice && (
                    <div className="text-[14px] font-bold text-slate-400 line-through mb-1">${highestOriginal.toLocaleString()}</div>
                  )}
                </div>
                <p className="text-[12px] text-slate-500 mb-4">per person</p>

                {/* Quick Variant Preview */}
                {deal.variants.slice(0, 3).map(v => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-[12px] font-semibold text-[#0e2a47]">{formatDate(v.startDatetime)}</p>
                      <p className="text-[10px] text-slate-400">{v.availableSlots ?? 0} of {v.totalSlots ?? 0} slots</p>
                    </div>
                    <p className="text-[12px] font-bold text-[#0e2a47]">${(v.displayedPrice ?? v.dealPrice ?? 0).toLocaleString()}</p>
                  </div>
                ))}
                {deal.variants.length > 3 && (
                  <button
                    onClick={() => setActiveSection('dates')}
                    className="text-[11px] font-semibold text-[#2dd4af] mt-2 cursor-pointer hover:underline"
                  >
                    View all {deal.variants.length} dates →
                  </button>
                )}

                <div className="flex flex-col gap-2.5 mt-5">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={lockableVariants.length === 0}
                    className="w-full py-3 bg-[#2dd4af] hover:bg-[#25b898] disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-bold rounded-2xl transition-all shadow-lg shadow-[#2dd4af]/20 active:scale-[0.98] text-[14px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    {lockableVariants.length > 0 ? 'Lock This Deal' : 'No Slots Available'}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center mt-2 font-medium bg-slate-50 py-2 rounded-xl border border-slate-100">
                    <span className="text-[#2dd4af] mr-1">●</span>
                    Lock this deal to start a chat with the merchant
                  </p>

                  {!user?.phoneVerified && lockableVariants.length > 0 && (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="text-[11px] font-bold text-amber-600">Verify phone to unlock</span>
                    </div>
                  )}
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full py-2.5 bg-transparent hover:bg-slate-50 text-slate-600 font-semibold rounded-2xl transition-all border border-slate-200 text-[13px] cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Reviews Section ─── */}
      <div className="px-4 md:pl-31 pb-12">
        {deal.reviewsPreview && (
          <ReviewsSection
            id={deal.id}
            type="deal"
            initialPreview={deal.reviewsPreview}
            currentUserId={user?.id ?? null}
            userReview={deal.userReview}
          />
        )}
      </div>

      {/* Confirm Locking Modal */}
      <ConfirmLockingModal
        deal={dealCardForModal}
        variants={modalVariants}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPreselectedVariantId(null);
        }}
      />

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        isMaldivesOnly={deal.isLocalOnly}
        onSuccess={() => {
          setIsPhoneModalOpen(false);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};

// ─── Variant Row Component ───

interface VariantRowProps {
  variant: IDealVariantDetail;
  onLock: (variantId: string) => void;
  formatDate: (dateStr: string | null) => string;
  formatTime: (dateStr: string | null) => string;
}

const VariantRow: React.FC<VariantRowProps> = ({ variant, onLock, formatDate, formatTime }) => {
  const price = variant.displayedPrice ?? variant.dealPrice ?? 0;
  const slotsLeft = variant.availableSlots ?? 0;
  const totalSlots = variant.totalSlots ?? 0;
  const bookedCount = variant._count?.bookings ?? 0;
  const isSoldOut = slotsLeft === 0;
  const isLowStock = slotsLeft > 0 && slotsLeft <= 3;

  const slotsPercent = totalSlots > 0 ? Math.round(((totalSlots - slotsLeft) / totalSlots) * 100) : 0;

  return (
    <div className={`bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${isSoldOut ? 'border-slate-200 opacity-60' : 'border-black/5'}`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Date Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#0e2a47] to-[#1a3f68] text-white flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#0e2a47]">{formatDate(variant.startDatetime)}</p>
              <p className="text-[12px] text-slate-500">
                {formatTime(variant.startDatetime)}
                {variant.endDatetime && ` — ${formatTime(variant.endDatetime)}`}
                {variant.title && ` · ${variant.title}`}
              </p>
            </div>
          </div>

          {/* Slots progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isLowStock ? 'bg-[#ff7b54]' : 'bg-[#2dd4af]'}`}
                style={{ width: `${slotsPercent}%` }}
              />
            </div>
            <span className={`text-[11px] font-bold ${isLowStock ? 'text-[#ff7b54]' : isSoldOut ? 'text-slate-400' : 'text-slate-500'}`}>
              {slotsLeft}/{totalSlots} available
            </span>
          </div>

          {bookedCount > 0 && (
            <p className="text-[10px] text-slate-400 mt-1">{bookedCount} booking{bookedCount !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <div className="text-right">
            <p className="text-[20px] font-black text-[#0e2a47] leading-none">${price.toLocaleString()}</p>
            {variant.originalPrice && variant.originalPrice > price && (
              <p className="text-[11px] text-slate-400 line-through">${variant.originalPrice.toLocaleString()}</p>
            )}
            <p className="text-[10px] text-slate-400">per person</p>
          </div>
          <button
            onClick={() => onLock(variant.id)}
            disabled={isSoldOut}
            className={`px-5 py-2 rounded-xl font-bold text-[12px] transition-all active:scale-[0.98] cursor-pointer ${isSoldOut
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#2dd4af] hover:bg-[#25b898] text-white shadow-lg shadow-[#2dd4af]/20'
              }`}
          >
            {isSoldOut ? 'Sold Out' : 'Lock Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockedDealDetailPage;
