import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/useAuth';
import { useUserProfile } from '../../TravelerProfile/hooks/useUserProfile';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isMaldivesOnly?: boolean;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ isOpen, onClose, onSuccess, isMaldivesOnly }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const { fetchUser } = useAuth();
  const { verifyPhone } = useUserProfile();

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setError(null);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure phone includes +960 for Maldives-only deals
      let finalPhone = phone;
      if (isMaldivesOnly && !phone.startsWith('+960')) {
          finalPhone = `+960${phone.trim()}`;
      }

      // Basic validation
      if (isMaldivesOnly && finalPhone.replace(/\D/g, '').length < 10) {
        throw new Error('Please enter a valid 7-digit Maldives phone number.');
      }

      // 1. Update user phone in Supabase (this sends OTP)
      const { error: supabaseError } = await supabase.auth.updateUser({ phone: finalPhone });
      
      if (supabaseError) throw supabaseError;

      setStep('otp');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to send OTP. Please check the number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 2. Verify OTP with Supabase
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: isMaldivesOnly && !phone.startsWith('+960') ? `+960${phone.trim()}` : phone,
        token: otp,
        type: 'phone_change',
      });

      if (verifyError) throw verifyError;

      // 3. Sync with backend
      const finalPhone = isMaldivesOnly && !phone.startsWith('+960') ? `+960${phone.trim()}` : phone;
      await verifyPhone(finalPhone);

      // 4. Refresh session and user data
      await supabase.auth.refreshSession();
      await fetchUser();

      onSuccess();
      onClose();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
    >
      <div
        className={`bg-white rounded-[2.5rem] p-8 shadow-2xl relative w-full max-w-md transform transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="mb-6">
          {isMaldivesOnly && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="text-xs">🇲🇻</span> Local Resident Rate
            </div>
          )}
          
          <div className={`w-16 h-16 ${isMaldivesOnly ? 'bg-[#0e2a47]/5' : 'bg-[#2dd4af]/10'} rounded-2xl flex items-center justify-center mb-4`}>
            {isMaldivesOnly ? (
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#0e2a47]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-[#0e2a47] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {isMaldivesOnly ? 'Resident Verification' : 'Verify your phone'}
          </h2>
          
          <p className="text-slate-500 text-sm leading-relaxed">
            {step === 'phone' 
              ? (isMaldivesOnly 
                  ? 'This exclusive rate is reserved for Maldivian residents. Please verify your local (+960) phone number to proceed with this booking.' 
                  : 'We need to verify your phone number before you can lock this deal and secure your booking.') 
              : `Enter the 6-digit confirmation code we just sent to your mobile device at ${phone}`}
          </p>
          
          {isMaldivesOnly && step === 'phone' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 italic">
              * Note: Only local numbers starting with +960 are eligible for this deal.
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 text-red-600 text-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Phone Number (with country code)
              </label>
              <div className="relative group">
                {isMaldivesOnly && (
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <span className="text-lg">🇲🇻</span>
                    <span className="text-[#0e2a47] font-bold">+960</span>
                    <div className="w-[1px] h-4 bg-slate-300 ml-1" />
                  </div>
                )}
                <input 
                  type="tel"
                  placeholder={isMaldivesOnly ? "777 1234" : "+960 7771234"}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    // For maldives only, restrict to numbers and spaces after prefix (which is handled separately)
                    if (isMaldivesOnly) {
                      const digitsOnly = val.replace(/\D/g, '');
                      setPhone(digitsOnly.slice(0, 7)); // Local Maldives numbers are 7 digits
                    } else {
                      setPhone(val);
                    }
                  }}
                  required
                  className={`w-full py-4 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2dd4af]/30 transition-all font-medium text-[#0e2a47] ${
                    isMaldivesOnly ? 'pl-24 pr-5' : 'px-5'
                  }`}
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0e2a47] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a3d5e] transition-all disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
              {!loading && (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Enter 6-digit Code
              </label>
              <input 
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2dd4af]/30 transition-all font-mono text-center text-2xl tracking-[0.5em] text-[#0e2a47]"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2dd4af] text-[#0e2a47] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#25b898] transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Complete Verification'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PhoneVerificationModal;
