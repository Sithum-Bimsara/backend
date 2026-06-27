import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { createBooking, createAccommodationBooking } from '../../../features/Deals/api/deals.api';
import { useLockedDeal } from '../../../context/locked-deal.context';
import type { ILockResponse, IAccommodationLockResponse } from '../../../features/Deals/types/deals.types';
import { formatLocalDate } from '../../../lib/date-utils';
import { resolveDealImageUrl } from '../../../lib/deal-image';
import RoleRequirementModal from '../../../components/RestrictModels/RoleRequirementModal';
import AuthRequiredModal from '../../../components/RestrictModels/AuthRequiredModal';
import SuspendedAccountModal from '../../../components/RestrictModels/SuspendedAccountModal';
import SelfLockRestrictedModal from '../../../components/RestrictModels/SelfLockRestrictedModal';

const RESERVATION_FEE_PERCENT = 0.1; // 10%

const ConfirmBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { lockedDeal, bookingAddOns, handlePaymentSuccess } = useLockedDeal();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | 'wallet'>('card');
  const [guests, setGuests] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Default to USD for now since the backend schema doesn't have currency
  const currencySymbol = '$';

  if (!lockedDeal) return <Navigate to="/" replace />;

  const { lock, dealTitle, dealImage, isAccommodation } = lockedDeal;

  const quantity = (lock as any).quantity ?? 1;
  const baseTotal = (lock as any).lockedPrice ?? (lock as any).price ?? 0;
  const customAddons = (lock as any).customAddons || [];
  const merchantAddonTotal = customAddons.reduce((sum: number, addon: any) => sum + (addon.price || 0), 0);
  const addOnTotal = (bookingAddOns.addOnTotal ?? 0) + merchantAddonTotal;
  const subtotal = baseTotal + addOnTotal;
  const reservationFee = Math.round(subtotal * RESERVATION_FEE_PERCENT * 100) / 100;

  const primaryImage = resolveDealImageUrl(dealImage);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async () => {
    if (!agreed) return;
    setIsProcessing(true);
    setError(null);
    setErrorCode(null);
    setErrorStatus(null);

    try {
      if (isAccommodation) {
        await createAccommodationBooking({
          lockId: lock.id,
          guests
        });
      } else {
        // Create the booking via the API using the lockId and setting status to paid (fake successful payment)
        await createBooking({
          lockId: lock.id,
          paymentStatus: 'paid',
          selectedExclusionIds: bookingAddOns.selectedExclusions.map((item) => item.id),
        });
      }

      // Simulate payment processing delay for UX
      await new Promise((r) => setTimeout(r, 1500));

      handlePaymentSuccess();
    } catch (err: unknown) {
      let msg = 'Payment processing failed. Please try again.';
      let code: string | null = null;
      let status: number | null = null;

      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { data?: { message?: string; code?: string }; status?: number } }).response;
        const responseData = response?.data;
        msg = responseData?.message || msg;
        code = responseData?.code || null;
        status = response?.status || null;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
      setErrorCode(code);
      setErrorStatus(status);
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card' as const,
      label: 'Credit / Debit Card',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      id: 'bank' as const,
      label: 'Bank Transfer',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: 'wallet' as const,
      label: 'Digital Wallet',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12V22H4V12" />
          <path d="M22 7H2v5h20V7z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      ),
    },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '42px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    padding: '0 1rem',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#0e2a47',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const progressSteps = isAccommodation
    ? ['Room Selected', 'Confirm Booking', 'Confirmed']
    : ['Deal Locked', 'Add-Ons', 'Confirm Booking', 'Confirmed'];
  const activeStepIndex = isAccommodation ? 1 : 2;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f0fdfa, #fff7ed, #faf5ff)',
        padding: '1rem',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,175,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1080px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* ── Header ── */}
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
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0e2a47', letterSpacing: '-0.03em', fontFamily: "'Playfair_Display', Georgia, serif" }}>
              Confirm Booking
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Review your order and complete payment to finalise your reservation
            </p>
          </div>

          {/* Progress steps */}
          <div style={{ marginLeft: 'auto', flexShrink: 0 }} className="hidden md:flex items-center gap-2">
            {progressSteps.map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && <div style={{ width: 22, height: 2, background: i <= activeStepIndex ? '#2dd4af' : '#e2e8f0', borderRadius: 2 }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i < activeStepIndex ? '#0e9e82' : i === activeStepIndex ? '#2dd4af' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {i < activeStepIndex ? (
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: i === activeStepIndex ? '#0e2a47' : '#94a3b8' }}>{i + 1}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: i === activeStepIndex ? 700 : 500, color: i === activeStepIndex ? '#0e2a47' : '#94a3b8', whiteSpace: 'nowrap' }}>{step}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div
          className="confirm-booking-grid"
          style={{
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {/* ──── LEFT: Payment Form ──── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Error Message - hide if NOT_TRAVELLER or 401 (modals will show instead) */}
            {error && errorCode !== 'NOT_TRAVELLER' && errorCode !== 'SELF_BOOKING_RESTRICTED' && errorCode !== 'SUSPENDED_ACCOUNT' && errorStatus !== 401 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ color: '#b91c1c', fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #f0fdf9, #e6fdf5)', border: '1px solid rgba(45,212,175,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0e9e82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0e2a47', letterSpacing: '-0.02em' }}>Payment Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '0.75rem' }}>
                {paymentMethods.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  const isHovered = hoveredMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      onMouseEnter={() => setHoveredMethod(m.id)}
                      onMouseLeave={() => setHoveredMethod(null)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '1rem',
                        border: `2px solid ${isSelected ? '#2dd4af' : '#e2e8f0'}`,
                        background: isSelected ? 'linear-gradient(135deg, #f0fdf9, #e6fdf5)' : isHovered ? '#fafbfc' : '#f8fafc',
                        cursor: 'pointer',
                        color: isSelected ? '#0e9e82' : '#64748b',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 16px rgba(45,212,175,0.15)' : 'none',
                      }}
                    >
                      {m.icon}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Details Form */}
            {selectedMethod === 'card' && (
              <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #f0fdf9, #e6fdf5)', border: '1px solid rgba(45,212,175,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0e9e82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0e2a47', letterSpacing: '-0.02em' }}>Card Details</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {['VISA', 'MC', 'AMEX'].map((brand) => (
                      <div key={brand} style={{ height: 24, padding: '0 0.4rem', borderRadius: '0.375rem', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#475569', letterSpacing: '0.05em' }}>{brand}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isAccommodation && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Number of Guests</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                        style={{ width: 36, height: 36, borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0e2a47', minWidth: '24px', textAlign: 'center' }}>{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(prev => Math.min(20, prev + 1))}
                        style={{ width: 36, height: 36, borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Card Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Card Number</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        style={{ ...inputStyle, paddingLeft: '2.75rem', letterSpacing: cardNumber ? '0.1em' : 'normal' }}
                        onFocus={(e) => { e.target.style.borderColor = '#2dd4af'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,175,0.12)'; e.target.style.background = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                      />
                      <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name as it appears on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#2dd4af'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,175,0.12)'; e.target.style.background = '#fff'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = '#2dd4af'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,175,0.12)'; e.target.style.background = '#fff'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>CVV / CVC</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          maxLength={4}
                          style={{ ...inputStyle, paddingRight: '2.75rem' }}
                          onFocus={(e) => { e.target.style.borderColor = '#2dd4af'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,175,0.12)'; e.target.style.background = '#fff'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                        />
                        <div style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security badges */}
                <div style={{ marginTop: '1rem', padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '0.875rem', border: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0e9e82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                    Your payment is protected by <strong style={{ color: '#0e2a47' }}>256-bit SSL encryption</strong>. We never store your card details.
                  </p>
                </div>
              </div>
            )}

            {/* Bank Transfer */}
            {selectedMethod === 'bank' && (
              <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #f0fdf9, #e6fdf5)', border: '1px solid rgba(45,212,175,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0e9e82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0e2a47', letterSpacing: '-0.02em' }}>Bank Transfer Details</span>
                </div>
                {[
                  { label: 'Account Name', value: 'LushWare Travels Pty Ltd' },
                  { label: 'BSB', value: '123-456' },
                  { label: 'Account Number', value: '98765432' },
                  { label: 'Reference', value: `BYD-${(isAccommodation ? (lock as IAccommodationLockResponse).propertyId : (lock as ILockResponse).dealId)?.slice(0, 8).toUpperCase()}` },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: '#f8fafc', borderRadius: '0.875rem', border: '1px solid #f0f4f8', marginBottom: '0.625rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: '0.875rem', color: '#0e2a47', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: '0.75rem', padding: '0.875rem 1rem', background: '#fef9ec', borderRadius: '0.875rem', border: '1px solid #fde68a', display: 'flex', gap: '0.625rem' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '0.1rem' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400e', fontWeight: 500, lineHeight: 1.5 }}>
                    Please use your booking reference as the transfer description. Payment must be received within 24 hours to hold your slot.
                  </p>
                </div>
              </div>
            )}

            {/* Digital Wallet */}
            {selectedMethod === 'wallet' && (
              <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #f0fdf9, #e6fdf5)', border: '1px solid rgba(45,212,175,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#0e9e82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12V22H4V12" />
                      <path d="M22 7H2v5h20V7z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0e2a47', letterSpacing: '-0.02em' }}>Digital Wallet</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  {[
                    { name: 'Apple Pay', color: '#000' },
                    { name: 'Google Pay', color: '#1a73e8' },
                    { name: 'PayPal', color: '#003087' },
                    { name: 'Stripe', color: '#635bff' },
                  ].map((wallet) => (
                    <button
                      key={wallet.name}
                      style={{
                        padding: '1rem', borderRadius: '1rem', border: '1.5px solid #e2e8f0',
                        background: '#f8fafc', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: '0.875rem', fontWeight: 700, color: wallet.color,
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2dd4af'; e.currentTarget.style.background = '#f0fdf9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                    >
                      {wallet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Terms checkbox */}
            <label
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <div
                onClick={() => setAgreed(!agreed)}
                style={{
                  width: 20, height: 20, borderRadius: '0.375rem', flexShrink: 0, marginTop: '0.1rem',
                  border: `2px solid ${agreed ? '#2dd4af' : '#cbd5e1'}`,
                  background: agreed ? '#2dd4af' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {agreed && (
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#0e2a47" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569', fontWeight: 500, lineHeight: 1.6 }}>
                I agree to the{' '}
                <Link to="/terms" target="_blank" style={{ color: '#0e9e82', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Terms & Conditions</Link>
                {' '}and{' '}
                <Link to="/terms" target="_blank" style={{ color: '#0e9e82', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Cancellation Policy</Link>.
                I understand that this confirms my booking.
              </p>
            </label>
          </div>

          {/* ──── RIGHT: Booking Summary ──── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
            {/* Summary Card */}
            <div style={{ background: '#ffffff', borderRadius: '1.75rem', boxShadow: '0 8px 32px rgba(14,42,71,0.07)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              {/* Package image header */}
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
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontFamily: "'Playfair_Display', Georgia, serif" }}>
                    {dealTitle}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {isAccommodation ? ((lock as IAccommodationLockResponse).property?.city || (lock as any).location) : (lock as ILockResponse).deal?.location}
                  </p>
                </div>
              </div>

              {/* Summary rows */}
              <div style={{ padding: '1.25rem' }}>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', fontWeight: 800, color: '#0e2a47', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Booking Summary</p>

                {[
                  {
                    label: isAccommodation ? 'Stay Dates' : 'Deal Date',
                    value: isAccommodation
                      ? (() => {
                        const start = new Date((lock as IAccommodationLockResponse).checkInDate);
                        const end = new Date((lock as IAccommodationLockResponse).checkOutDate);
                        const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                        return (
                          <div className="flex flex-col items-end">
                            <span>{formatLocalDate(start, { month: 'short', day: 'numeric' })} - {formatLocalDate(end, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{nights} Night{nights > 1 ? 's' : ''} Stay</span>
                          </div>
                        );
                      })()
                      : formatLocalDate((lock as ILockResponse).variant?.startDatetime || '', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'
                  },
                  {
                    label: isAccommodation ? 'Accommodation' : 'Quantity',
                    value: isAccommodation
                      ? ((lock as IAccommodationLockResponse).unit?.name || (lock as any).unitName)
                      : `${quantity} slot${quantity > 1 ? 's' : ''}`
                  },
                  { label: 'Base Total', value: `${currencySymbol}${baseTotal.toLocaleString()}` },
                  !isAccommodation && bookingAddOns.addOnTotal > 0 && { label: 'Platform Add-Ons', value: `${currencySymbol}${bookingAddOns.addOnTotal.toLocaleString()}` },
                  merchantAddonTotal > 0 && { label: 'Custom Extras (from Merchant)', value: `${currencySymbol}${merchantAddonTotal.toLocaleString()}` },
                  { label: 'Final Total', value: `${currencySymbol}${subtotal.toLocaleString()}` },
                  { label: 'Amount Due (10%)', value: `${currencySymbol}${reservationFee.toLocaleString()}`, highlight: true },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: '0.875rem', color: row.highlight ? '#0e9e82' : '#0e2a47', fontWeight: row.highlight ? 800 : 600 }}>{row.value}</span>
                  </div>
                ))}

                {bookingAddOns.selectedExclusions.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Selected Add-Ons</p>
                    {bookingAddOns.selectedExclusions.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.description}</span>
                        <span style={{ fontSize: '0.75rem', color: '#0e2a47', fontWeight: 700 }}>+{currencySymbol}{item.additionalPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {customAddons.length > 0 && (
                  <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f0fdfa', borderRadius: '1rem', border: '1px solid #ccfbf1' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#0e9e82', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      Merchant Custom Extras
                    </p>
                    {customAddons.map((addon: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#134e4a', fontWeight: 500 }}>{addon.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#0e2a47', fontWeight: 700 }}>+{currencySymbol}{addon.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ height: 1, background: '#f1f5f9', margin: '0.75rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0e2a47' }}>Total Due Now</span>
                  <span style={{ fontSize: '1.375rem', fontWeight: 900, color: '#0e2a47', letterSpacing: '-0.04em' }}>
                    {currencySymbol}{reservationFee.toLocaleString()}
                  </span>
                </div>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500, textAlign: 'right' }}>
                  Remaining {currencySymbol}${(subtotal - reservationFee).toLocaleString()} paid at check-in
                </p>

                {/* Lock ID */}
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.875rem', border: '1px solid #f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Lock ID</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0e2a47', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    BYD-{(isAccommodation ? (lock as IAccommodationLockResponse).propertyId : (lock as ILockResponse).dealId)?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={!agreed || isProcessing}
              style={{
                width: '100%', height: 48, borderRadius: '1.25rem', border: 'none',
                background: !agreed ? '#e2e8f0' : isProcessing ? 'linear-gradient(135deg, #2dd4af, #0db898)' : 'linear-gradient(135deg, #2dd4af 0%, #0db898 100%)',
                color: !agreed ? '#94a3b8' : '#0e2a47',
                fontWeight: 900, fontSize: '1rem',
                letterSpacing: '-0.02em', cursor: !agreed || isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                boxShadow: agreed ? '0 8px 28px rgba(45,212,175,0.35)' : 'none',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (agreed && !isProcessing) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(45,212,175,0.45)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = agreed ? '0 8px 28px rgba(45,212,175,0.35)' : 'none'; }}
            >
              {isProcessing ? (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(14,42,71,0.2)', borderTopColor: '#0e2a47', animation: 'spin 0.8s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Pay {currencySymbol}{reservationFee.toLocaleString()} Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .confirm-booking-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 769px) {
          .confirm-booking-grid {
            grid-template-columns: 1fr 420px;
          }
        }
      `}</style>

      <AuthRequiredModal
        isOpen={errorStatus === 401}
        onClose={() => {
          setErrorStatus(null);
        }}
        actionName="book deals"
      />
      <RoleRequirementModal
        isOpen={errorCode === 'NOT_TRAVELLER'}
        onClose={() => {
          setErrorCode(null);
        }}
        actionName="lock or book deals"
      />
      <SuspendedAccountModal
        isOpen={errorCode === 'SUSPENDED_ACCOUNT' || (errorStatus === 403 && !errorCode)}
        onClose={() => {
          setErrorCode(null);
          setErrorStatus(null);
        }}
        actionName="book deals"
      />
      <SelfLockRestrictedModal
        isOpen={errorCode === 'SELF_BOOKING_RESTRICTED'}
        onClose={() => {
          setErrorCode(null);
        }}
      />
    </div>
  );
};

export default ConfirmBookingPage;
