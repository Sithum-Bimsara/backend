import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLockedDeal } from '../../../context/locked-deal.context';
import { formatLocalDate } from '../../../lib/date-utils';
import { resolveDealImageUrl } from '../../../lib/deal-image';
import type { ILockResponse, IAccommodationLockResponse } from '../../../features/Deals/types/deals.types';

const DealLockedSuccessPage: React.FC = () => {
  const { lockedDeal, handleGoDeal, handleCompleteBooking } = useLockedDeal();

  const [mounted, setMounted] = useState(false);
  const [checkAnimated, setCheckAnimated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!lockedDeal?.lock?.expiresAt) return 0;
    const diff = Math.floor((new Date(lockedDeal.lock.expiresAt as string).getTime() - new Date().getTime()) / 1000);
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 50);
    const t2 = setTimeout(() => setCheckAnimated(true), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const lock = lockedDeal?.lock;
  const dealTitle = lockedDeal?.dealTitle;
  const dealImage = lockedDeal?.dealImage;

  // Full lock window: from when the lock was created to when it expires
  // Used for the progress bar so it accurately shows elapsed vs remaining time
  const lockDurationSeconds = (() => {
    if (lock?.createdAt && lock?.expiresAt) {
      const total = Math.floor(
        (new Date(lock.expiresAt as string).getTime() - new Date(lock.createdAt as string).getTime()) / 1000
      );
      // Fallback for safety if times are somehow reversed or identical
      if (total > 0) return total;
    }
    
    if (!lockedDeal || !lock) return 86400;

    // Fallback logic using dealLockExpireTime (always in days as per latest correction)
    const expireDays = lockedDeal.isAccommodation
      ? (lock as IAccommodationLockResponse).unit?.dealLockExpireTime ?? 1
      : (lock as ILockResponse).deal?.dealLockExpireTime ?? 1;
    return expireDays * 86400; // Days to seconds
  })();

  // Derive human-readable lock duration for display
  const durationDisplay = (() => {
    const hours = Math.round(lockDurationSeconds / 3600);
    const days = Math.round(lockDurationSeconds / 86400);
    
    // If it's exactly a multiple of 24 hours, show days. Otherwise show hours.
    if (hours >= 24 && hours % 24 === 0) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  })();

  useEffect(() => {
    if (!lock?.expiresAt) return;

    const calculateTimeLeft = () => {
      const diff = Math.floor((new Date(lock.expiresAt as string).getTime() - new Date().getTime()) / 1000);
      return diff > 0 ? diff : 0;
    };

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lock?.expiresAt]);

  if (!lockedDeal || !lock) return <Navigate to="/" replace />;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const primaryImage = resolveDealImageUrl(dealImage);

  const currencySymbol = '$';
  const quantity = lock.quantity ?? 1;
  const total = lock.lockedPrice ?? 0;



  const steps = [
    {
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.4 2 2 0 0 1 3.91 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      label: 'Merchant notified',
      desc: 'The operator has been alerted about your lock',
      done: true,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: 'Slots reserved',
      desc: `${quantity} slot${quantity > 1 ? 's' : ''} held exclusively for you`,
      done: true,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      label: 'Complete booking',
      desc: 'Finalise payment within the lock window',
      done: false,
    },
  ];

  return (
    <div
      className={`min-h-dvh bg-linear-to-br from-teal-50 via-orange-50 to-purple-50 flex items-center justify-center p-4 lg:py-6 lg:px-8 transition-opacity duration-500 relative overflow-hidden ${mounted ? 'opacity-100' : 'opacity-0'
        }`}
    >
      {/* Decorative blobs */}
      <div className="fixed -top-25 -right-25 w-100 h-100 rounded-full bg-[radial-gradient(circle,rgba(45,212,175,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed -bottom-15 -left-15 w-75 h-75 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div
        className={`w-full max-w-5xl mx-auto flex flex-col relative z-10 transition-transform duration-700 ease-out h-full lg:h-auto ${mounted ? 'translate-y-0' : 'translate-y-8'
          }`}
      >
        <div className="flex flex-col lg:flex-row gap-5 mb-5 flex-1 lg:flex-none">
          {/* Left Panel: Success Hero & Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-white rounded-3xl shadow-[0_16px_48px_rgba(14,42,71,0.08)] overflow-hidden border border-slate-100 flex flex-col h-full">
              {/* Green gradient header */}
              <div className="bg-linear-to-br from-[#0e9e82] via-[#2dd4af] to-[#4ade80] py-6 lg:py-8 px-5 sm:px-8 flex flex-col items-center justify-center gap-4 relative overflow-hidden shrink-0">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

                {/* Animated check circle */}
                <div
                  className={`w-15 h-15 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center relative z-10 transition-transform duration-500 ease-out ${checkAnimated ? 'scale-100' : 'scale-0'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="#0e9e82"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: 40,
                        strokeDashoffset: checkAnimated ? 0 : 40,
                        transition: 'stroke-dashoffset 0.6s ease 0.2s',
                      }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <h1 className="m-0 text-xl lg:text-2xl font-black text-white tracking-tight drop-shadow-sm font-['Playfair_Display',Georgia,serif]">
                    Deal Locked Successfully!
                  </h1>
                  <p className="mt-1 text-white/90 font-medium text-[11px] lg:text-xs">
                    Your {durationDisplay} window is now active.
                  </p>
                </div>
              </div>

              {/* Deal summary */}
              <div className="p-4 sm:p-5 flex flex-col bg-white shrink-0 flex-1 justify-center">
                <div className="flex gap-4 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden shrink-0 shadow-sm border border-slate-200">
                    <img
                      src={primaryImage}
                      alt={dealTitle || 'Package image'}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = resolveDealImageUrl(null);
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[1rem] font-bold text-[#0e2a47] truncate leading-tight font-['Playfair_Display',Georgia,serif]">
                      {dealTitle || 'Tour Package'}
                    </p>
                    <p className="mt-0.5 mb-0 text-[11px] text-slate-500 font-medium tracking-wide">
                      {lockedDeal.isAccommodation 
                        ? `${(lock as IAccommodationLockResponse).property?.city || 'Location unavailable'} · ${formatLocalDate((lock as IAccommodationLockResponse).checkInDate || '', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : `${(lock as ILockResponse).deal?.location || 'Location unavailable'} · ${formatLocalDate((lock as ILockResponse).variant?.startDatetime || '', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-bold bg-linear-to-br from-teal-50 to-emerald-50 border border-teal-200 text-teal-700 rounded px-1.5 py-0.5">
                        {quantity} {lockedDeal.isAccommodation ? `room${quantity > 1 ? 's' : ''}` : `slot${quantity > 1 ? 's' : ''}`}
                      </span>
                      <span className="text-base font-black text-[#0e2a47] leading-none">
                        {currencySymbol}
                        {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Countdown & Steps */}
          <div className="w-full lg:w-95 flex flex-col gap-4 shrink-0">
            {/* Countdown Card */}
            <div className="bg-white rounded-[1.25rem] shadow-[0_8px_24px_rgba(14,42,71,0.04)] border border-slate-100 p-4 sm:p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-xs font-bold text-[#0e2a47] tracking-tight">
                    Lock expires in
                  </span>
                </div>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-md px-1.5 py-0.5 shadow-sm uppercase tracking-wide">
                  Awaiting Payment
                </span>
              </div>

              {/* Timer digits */}
              <div className="flex items-center justify-center gap-2">
                {[
                  { value: pad(hours), label: 'HRS' },
                  { value: pad(minutes), label: 'MIN' },
                  { value: pad(seconds), label: 'SEC' },
                ].map((unit, i) => (
                  <React.Fragment key={unit.label}>
                    {i > 0 && (
                      <span className="text-xl font-black text-slate-200 leading-none mb-4">
                        :
                      </span>
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12.5 h-12.5 sm:w-14 sm:h-14 bg-linear-to-b from-[#0e2a47] to-[#0c2240] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black text-white tracking-tighter shadow-[0_4px_12px_rgba(14,42,71,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] tabular-nums">
                        {unit.value}
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">
                        {unit.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-5">
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#2dd4af] to-[#4ade80] transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / lockDurationSeconds) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium text-center mt-2.5 mb-0">
                  Complete payment before timer expires to secure booking
                </p>
              </div>
            </div>

            {/* Steps Card */}
            <div className="hidden sm:flex bg-white rounded-[1.25rem] shadow-[0_8px_24px_rgba(14,42,71,0.04)] border border-slate-100 p-4 sm:p-5 flex-1 flex-col justify-center">
              <p className="m-0 pb-3 mb-3 text-xs font-bold text-[#0e2a47] tracking-tight">
                What happens next?
              </p>
              <div className="flex flex-col gap-3.5">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start relative group">
                    {/* Visual connection line between steps */}
                    {idx < steps.length - 1 && (
                      <div className="absolute left-[15.5px] top-8.5 -bottom-3.5 w-[1.5px] bg-slate-100 -z-10 group-hover:bg-teal-50 transition-colors" />
                    )}

                    {/* Icon circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-[1.5px] transition-colors shadow-sm ${step.done
                          ? 'bg-linear-to-br from-teal-50 to-emerald-50 border-teal-200 text-teal-600'
                          : 'bg-white border-slate-200 text-slate-300'
                        }`}
                    >
                      {step.done ? (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="pt-0.5 pb-0.5">
                      <p className="m-0 text-[0.8125rem] font-bold text-[#0e2a47] flex items-center gap-1.5 leading-none">
                        {step.label}
                        {step.done && (
                          <span className="text-[7.5px] font-bold text-teal-600 bg-teal-50 border border-teal-100 rounded px-1 py-px uppercase tracking-wider">
                            Done
                          </span>
                        )}
                      </p>
                      <p className="m-0 mt-0.5 text-[0.6875rem] text-slate-500 font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 lg:px-0 pb-4 lg:pb-0">
          <p className="text-[11px] text-slate-500 font-medium m-0 flex-1 order-2 md:order-1 text-center md:text-left">
            <span className="flex items-center justify-center md:justify-start gap-1.5">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              No charge now · Slots held securely · Cancel anytime
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto order-1 md:order-2">
            <button
              onClick={handleGoDeal}
              className="group h-10.5 px-5 rounded-[0.875rem] border-[1.5px] border-slate-200 bg-white hover:bg-slate-50 text-[#0e2a47] font-bold text-[0.8125rem] flex items-center justify-center gap-2 transition-all w-full sm:w-auto hover:border-slate-300 shadow-sm cursor-pointer"
            >
              <svg
                className="transition-transform group-hover:-translate-x-1"
                viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              View Deal
            </button>
            <button
              onClick={handleCompleteBooking}
              className="h-10.5 px-5 rounded-[0.875rem] border-none bg-linear-to-r from-[#2dd4af] to-[#0db898] hover:from-[#2ac4a2] hover:to-[#0ca88b] text-white font-extrabold text-[0.8125rem] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(45,212,175,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(45,212,175,0.4)] w-full sm:w-auto cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Complete Booking Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealLockedSuccessPage;
