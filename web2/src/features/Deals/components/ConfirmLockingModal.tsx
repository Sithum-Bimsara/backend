import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { IDealCard, IDealVariantPublic } from '../types/deals.types';
import { useLockDeal } from '../hooks/useLockDeal';
import { useLockedDeal } from '../../../context/locked-deal.context';
import { formatLocalDate, formatLocalTime } from '../../../lib/date-utils';
import RoleRequirementModal from '../../../components/RestrictModels/RoleRequirementModal';
import AuthRequiredModal from '../../../components/RestrictModels/AuthRequiredModal';
import SuspendedAccountModal from '../../../components/RestrictModels/SuspendedAccountModal';
import LockLimitExceededModal from '../../../components/RestrictModels/LockLimitExceededModal';
import PhoneVerificationModal from '../../(auth)/components/PhoneVerificationModal';
import LocalDealRestrictedModal from '../../../components/RestrictModels/LocalDealRestrictedModal';
import SelfLockRestrictedModal from '../../../components/RestrictModels/SelfLockRestrictedModal';

interface ConfirmLockingModalProps {
  deal: IDealCard;
  variants: IDealVariantPublic[];
  /** Lock expiry in days — passed explicitly from the on-demand fetch. Falls back to deal.dealLockExpireTime ?? 1 */
  dealLockExpireDays?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmLockingModal: React.FC<ConfirmLockingModalProps> = ({
  deal,
  variants,
  dealLockExpireDays: dealLockExpireDaysProp,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { setLockedDealFromLock } = useLockedDeal();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const activeVariantId = selectedVariantId || (variants.length > 0 ? variants[0].id : '');
  const [quantity, setQuantity] = useState(1);
  const [visible, setVisible] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const selectedVariant = variants.find((v) => v.id === activeVariantId);
  const { loading: isLocking, error: lockError, errorCode, errorStatus, executeLock, reset: resetLockError } = useLockDeal();

  // Animate-in on open
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setQuantity(1);
        setSelectedVariantId('');
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (errorCode === 'PHONE_VERIFICATION_REQUIRED') {
      const t = setTimeout(() => setIsPhoneModalOpen(true), 0);
      return () => clearTimeout(t);
    }
  }, [errorCode]);

  if (!isOpen) return null;

  const pricePerSlot = selectedVariant?.displayedPrice ?? selectedVariant?.dealPrice ?? deal.displayedPrice ?? deal.dealPrice ?? 0;
  const subtotal = pricePerSlot * quantity;
  const maxQuantity = selectedVariant?.availableSlots ?? 1;
  const lockExpireDays = dealLockExpireDaysProp ?? deal.dealLockExpireTime ?? 1;

  const handleLock = async () => {
    if (!activeVariantId) return;
    const result = await executeLock(activeVariantId, quantity);
    if (result) {
      setLockedDealFromLock(result, deal.title, deal.primaryImageUrl);
      onClose();
      navigate('/deal-locked-success');
    }
  };

  const formatDate = (dateStr: string | null) => formatLocalDate(dateStr, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) || 'TBD';

  const formatTime = (dateStr: string | null) => formatLocalTime(dateStr);

  const modalContent = (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-1000 bg-[#0e2a47]/55 backdrop-blur-md transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'
          }`}
      />

      {/* ── Dialog ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clm-title"
        className="fixed inset-0 z-1001 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={`w-full max-w-110 max-h-[90vh] flex flex-col bg-white rounded-[1.25rem] shadow-[0_32px_80px_rgba(14,42,71,0.18)] overflow-hidden pointer-events-auto transition-all duration-350 ease-[cubic-bezier(.34,1.56,.64,1)] ${visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-5 opacity-0'
            }`}
        >
          {/* ── Header bar ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f4f8] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2dd4af] to-[#0e9e82] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span id="clm-title" className="text-[1.0625rem] font-bold text-[#0e2a47] tracking-tight">
                Lock Deal
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="w-7 h-7 rounded-full border border-[#e2e8f0] bg-transparent flex items-center justify-center cursor-pointer text-[#94a3b8] transition-all hover:bg-[#f8fafc] hover:text-[#0e2a47]"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-5 py-4 overflow-y-auto clm-hide-scrollbar">
            {/* Variant Selector */}
            <div className="mb-4">
              <label className="block text-[0.8125rem] font-bold text-[#0e2a47] mb-2 tracking-tight">
                Select Trip Start Date
              </label>
              <div className="clm-variants-scrollbar flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1.5 -mr-1.5">
                {variants.map((v) => {
                  const isSelected = v.id === activeVariantId;
                  const variantPrice = v.displayedPrice ?? v.dealPrice ?? 0;
                  const slotsLeft = v.availableSlots ?? 0;

                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-[0.625rem] cursor-pointer transition-all w-full text-left ${isSelected
                        ? 'bg-[#f0fdf9] border-2 border-[#2dd4af]'
                        : 'bg-white border-[1.5px] border-[#e2e8f0] hover:border-slate-300'
                        }`}
                    >
                      <div>
                        <p className="text-[0.8125rem] font-semibold text-[#0e2a47]">
                          {formatDate(v.startDatetime)}
                        </p>
                        <p className="text-[0.75rem] text-[#64748b]">
                          {formatTime(v.startDatetime)}
                          {v.title && ` · ${v.title}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.875rem] font-bold text-[#0e2a47]">
                          ${variantPrice.toLocaleString()}
                        </p>
                        <p className={`text-[0.6875rem] font-semibold ${slotsLeft <= 3 ? 'text-[#ff7b54]' : 'text-[#64748b]'}`}>
                          {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="mb-4">
              <label className="block text-[0.8125rem] font-bold text-[#0e2a47] mb-2 tracking-tight">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all shrink-0 ${quantity <= 1
                    ? 'border-[#e2e8f0] bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed'
                    : 'border-[#2dd4af] bg-[#f0fdf9] text-[#0e9e82] hover:bg-[#e6fdf5] cursor-pointer'
                    }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                <div className="flex-1 text-center text-[1.25rem] font-extrabold text-[#0e2a47] tracking-tighter">
                  {quantity}
                </div>

                <button
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  aria-label="Increase quantity"
                  className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center transition-all shrink-0 ${quantity >= maxQuantity
                    ? 'border-[#e2e8f0] bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed'
                    : 'border-[#2dd4af] bg-[#f0fdf9] text-[#0e9e82] hover:bg-[#e6fdf5] cursor-pointer'
                    }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              {maxQuantity <= 5 && (
                <p className="mt-1.5 text-[0.6875rem] font-semibold text-[#ff7b54]">
                  Only {maxQuantity} slot{maxQuantity !== 1 ? 's' : ''} available
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="bg-[#f8fafc] rounded-xl px-3.5 py-2.5 mb-4 border border-[#f0f4f8]">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[0.8125rem] text-[#64748b] font-medium">Unit Price</span>
                <span className="text-[0.8125rem] text-[#0e2a47] font-semibold">
                  ${pricePerSlot.toLocaleString()} × {quantity}
                </span>
              </div>
              <div className="h-px bg-[#e2e8f0] my-2" />
              <div className="flex justify-between items-center">
                <span className="text-[0.9375rem] text-[#0e2a47] font-bold">Total</span>
                <span className="text-[1.125rem] text-[#0e2a47] font-extrabold tracking-tighter">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Lock info */}
            <div className="flex gap-2.5 px-3.5 py-2.5 bg-linear-to-br from-[#f0fdf9] to-[#e6fdf5] border border-[#2dd4af]/25 rounded-xl mb-4">
              <div className="shrink-0 mt-px">
                <div className="w-7 h-7 rounded-full bg-[#2dd4af]/15 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#0e9e82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-bold text-[#0e2a47] mb-1">
                  Deal Lock · {lockExpireDays} {lockExpireDays === 1 ? 'Day' : 'Days'}
                </p>
                <p className="text-[0.75rem] text-[#475569] leading-relaxed">
                  Your slots will be reserved for {lockExpireDays} {lockExpireDays === 1 ? 'day' : 'days'}.
                </p>
              </div>
            </div>

            {/* Error message */}
            {lockError && errorCode !== 'NOT_TRAVELLER' && errorCode !== 'PHONE_VERIFICATION_REQUIRED' && errorCode !== 'LOCAL_DEAL_RESTRICTED' && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl mb-4">
                <p className="text-[0.8125rem] text-red-600 font-semibold">{lockError}</p>
                {errorCode === 'DEAL_EXPIRED' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 w-full p-2 bg-red-100 border border-red-200 rounded-[0.625rem] text-red-600 text-[0.75rem] font-bold transition-all hover:bg-red-200"
                  >
                    Refresh Page
                  </button>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleLock}
              disabled={isLocking || !activeVariantId}
              className={`w-full h-11 rounded-xl border-none flex items-center justify-center gap-2.5 text-[0.9375rem] transition-all duration-200 transform active:scale-[0.98] ${isLocking || !activeVariantId
                ? 'bg-[#94d4c6] text-white/80 cursor-not-allowed'
                : 'bg-linear-to-br from-[#2dd4af] to-[#0db898] text-white shadow-[0_8px_24px_rgba(45,212,175,0.35)] hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(45,212,175,0.45)]'
                }`}
            >
              {isLocking ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4.5 h-4.5 animate-spin"
                    fill="none"
                    stroke="#0e2a47"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9" />
                  </svg>
                  Locking…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Lock Deal · ${subtotal.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .clm-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .clm-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .clm-variants-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .clm-variants-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .clm-variants-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .clm-variants-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  );

  return (
    <>
      {errorCode !== 'NOT_TRAVELLER' &&
        errorCode !== 'SUSPENDED_ACCOUNT' &&
        errorCode !== 'DAILY_LOCK_LIMIT_EXCEEDED' &&
        errorCode !== 'PHONE_VERIFICATION_REQUIRED' &&
        errorCode !== 'LOCAL_DEAL_RESTRICTED' &&
        errorCode !== 'SELF_LOCK_RESTRICTED' &&
        errorStatus !== 401 &&
        errorStatus !== 403 &&
        createPortal(modalContent, document.body)}
      <AuthRequiredModal
        isOpen={errorStatus === 401}
        onClose={() => {
          resetLockError();
        }}
        actionName="lock or book deals"
      />
      <RoleRequirementModal
        isOpen={errorCode === 'NOT_TRAVELLER'}
        onClose={() => {
          resetLockError();
        }}
        actionName="lock or book deals"
      />
      <SuspendedAccountModal
        isOpen={errorCode === 'SUSPENDED_ACCOUNT' || (errorStatus === 403 && !errorCode)}
        onClose={() => {
          resetLockError();
        }}
        actionName="lock or book deals"
      />
      <LockLimitExceededModal
        isOpen={errorCode === 'DAILY_LOCK_LIMIT_EXCEEDED'}
        onClose={() => {
          resetLockError();
        }}
      />
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        isMaldivesOnly={deal.isLocalOnly}
        onClose={() => {
          setIsPhoneModalOpen(false);
          resetLockError();
        }}
        onSuccess={async () => {
          setIsPhoneModalOpen(false);
          resetLockError();
        }}
      />
      <LocalDealRestrictedModal
        isOpen={errorCode === 'LOCAL_DEAL_RESTRICTED'}
        onClose={() => {
          resetLockError();
        }}
      />
      <SelfLockRestrictedModal
        isOpen={errorCode === 'SELF_LOCK_RESTRICTED'}
        onClose={() => {
          resetLockError();
        }}
      />
    </>
  );
};

export default ConfirmLockingModal;
