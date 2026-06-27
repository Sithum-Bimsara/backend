import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getPublicDeal } from '../../../features/Deals/api/deals.api';
import type { IExclusion } from '../../../features/Deals/types/deals.types';
import { useLockedDeal } from '../../../context/locked-deal.context';
import { resolveDealImageUrl } from '../../../lib/deal-image';

const BookingAddOnsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lockedDeal, bookingAddOns, setBookingAddOns } = useLockedDeal();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exclusions, setExclusions] = useState<IExclusion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const lock = lockedDeal?.lock;
  const dealTitle = lockedDeal?.dealTitle;
  const dealImage = lockedDeal?.dealImage;
  const basePrice = lock?.lockedPrice ?? 0;

  useEffect(() => {
    let mounted = true;

    const fetchDeal = async () => {
      const dealId = lock && 'dealId' in lock ? lock.dealId : undefined;
      if (!dealId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const deal = await getPublicDeal(dealId, { trackView: false });
        if (!mounted) return;

        const pricedExclusions = (deal.exclusions || []).filter(
          (item) => (item.additionalPrice ?? 0) > 0
        );
        setExclusions(pricedExclusions);

        const validExisting = bookingAddOns.selectedExclusions
          .map((item) => item.id)
          .filter((id) => pricedExclusions.some((exc) => exc.id === id));

        setSelectedIds(validExisting);
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load exclusions');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDeal();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lock && 'dealId' in lock ? lock.dealId : undefined]);

  const selectedExclusions = useMemo(
    () =>
      exclusions
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => ({
          id: item.id,
          description: item.description || 'Additional service',
          additionalPrice: item.additionalPrice ?? 0,
        })),
    [exclusions, selectedIds]
  );

  const addOnTotal = useMemo(
    () => selectedExclusions.reduce((sum, item) => sum + item.additionalPrice, 0),
    [selectedExclusions]
  );

  const finalTotal = basePrice + addOnTotal;

  const toggleExclusion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    setBookingAddOns({
      selectedExclusions,
      addOnTotal,
    });
    navigate('/confirm-booking');
  };

  const currencySymbol = '$';
  const primaryImage = resolveDealImageUrl(dealImage);

  if (!lockedDeal || !lock) return <Navigate to="/" replace />;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f0fdfa, #fff7ed, #faf5ff)',
        padding: '1rem',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,175,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1080px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              border: '1.5px solid #e2e8f0', background: '#ffffff',
              cursor: 'pointer', color: '#475569',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0e2a47', letterSpacing: '-0.03em', fontFamily: "'Playfair_Display', Georgia, serif" }}>
              Booking Add-Ons
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Select optional exclusions and review updated totals before payment
            </p>
          </div>

          <div style={{ marginLeft: 'auto', flexShrink: 0 }} className="hidden md:flex items-center gap-2">
            {['Deal Locked', 'Add-Ons', 'Confirm Booking', 'Confirmed'].map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && <div style={{ width: 22, height: 2, background: i <= 1 ? '#2dd4af' : '#e2e8f0', borderRadius: 2 }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < 1 ? '#0e9e82' : i === 1 ? '#2dd4af' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i < 1 ? (
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: i === 1 ? '#0e2a47' : '#94a3b8' }}>{i + 1}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: i === 1 ? 700 : 500, color: i === 1 ? '#0e2a47' : '#94a3b8', whiteSpace: 'nowrap' }}>{step}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ gap: '1rem', alignItems: 'start' }} className="booking-addons-grid">
          <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', padding: '1.25rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0e2a47' }}>{dealTitle || 'Selected Deal'}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Optional exclusions with extra cost</p>
            </div>

            {!loading && error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '1rem', padding: '0.85rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="animate-pulse">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: '#e2e8f0' }} />
                      <div style={{ width: 190, height: 12, borderRadius: 6, background: '#e2e8f0' }} />
                    </div>
                    <div style={{ width: 70, height: 12, borderRadius: 6, background: '#e2e8f0' }} />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && exclusions.length === 0 && (
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '1rem', padding: '1rem', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                No priced exclusions available for this deal. Continue to booking.
              </div>
            )}

            {!loading && !error && exclusions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {exclusions.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  const price = item.additionalPrice ?? 0;

                  return (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderRadius: '1rem', border: `1.5px solid ${checked ? '#2dd4af' : '#e2e8f0'}`,
                        padding: '0.85rem 1rem', background: checked ? 'linear-gradient(135deg, #f0fdf9, #e6fdf5)' : '#fff',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExclusion(item.id)}
                          style={{ width: 16, height: 16, accentColor: '#2dd4af' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: '#0e2a47', fontWeight: 600 }}>
                          {item.description || 'Additional service'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: checked ? '#0e9e82' : '#0e2a47', fontWeight: 800 }}>
                        + {currencySymbol}{price.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: 130 }}>
                <img
                  src={primaryImage}
                  alt={dealTitle || 'Deal image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(event) => {
                    event.currentTarget.src = resolveDealImageUrl(null);
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(14,42,71,0.85) 100%)' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem' }}>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: "'Playfair_Display', Georgia, serif" }}>
                    {dealTitle}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Customize Before Payment
                  </p>
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', fontWeight: 800, color: '#0e2a47', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Price Summary
                </p>

                {loading ? (
                  <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: 110, height: 10, borderRadius: 5, background: '#e2e8f0' }} />
                        <div style={{ width: 70, height: 10, borderRadius: 5, background: '#e2e8f0' }} />
                      </div>
                    ))}
                    <div style={{ height: 1, background: '#e2e8f0', marginTop: '0.35rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ width: 80, height: 12, borderRadius: 6, background: '#e2e8f0' }} />
                      <div style={{ width: 92, height: 18, borderRadius: 6, background: '#e2e8f0' }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Base locked total</span>
                      <span style={{ fontSize: '0.875rem', color: '#0e2a47', fontWeight: 600 }}>{currencySymbol}{basePrice.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Selected add-ons</span>
                      <span style={{ fontSize: '0.875rem', color: '#0e2a47', fontWeight: 700 }}>+ {currencySymbol}{addOnTotal.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 1, background: '#f1f5f9', margin: '0.75rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0e2a47' }}>Final total</span>
                      <span style={{ fontSize: '1.375rem', fontWeight: 900, color: '#0e2a47', letterSpacing: '-0.04em' }}>
                        {currencySymbol}{finalTotal.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={loading}
              style={{
                width: '100%', height: 48, borderRadius: '1.25rem', border: 'none',
                background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #2dd4af 0%, #0db898 100%)',
                color: loading ? '#94a3b8' : '#0e2a47',
                fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.02em',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(45,212,175,0.35)',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
              }}
            >
              Continue to Confirm Booking
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .booking-addons-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          align-items: start;
        }
        @media (min-width: 769px) {
          .booking-addons-grid {
            grid-template-columns: 1fr 420px;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingAddOnsPage;
