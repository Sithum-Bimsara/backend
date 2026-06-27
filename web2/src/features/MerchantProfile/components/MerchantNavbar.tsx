import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMerchantProfile } from '../../../features/MerchantProfile/hooks/useMerchantProfile';
import { useLogout } from '../../../features/(auth)/hooks/auth.hooks';
import { useAuth } from '../../../context/useAuth';

interface MerchantNavbarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  onSwitchMode?: () => void;
}

const MerchantNavbar: React.FC<MerchantNavbarProps> = ({ activePage = 'dashboard', onNavigate, onSwitchMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, refreshing } = useMerchantProfile();
  const { logout } = useLogout();
  const { isMerchant, isTraveller } = useAuth();

  const verificationStatus = profile?.verificationStatus || 'pending';
  const isVerified = verificationStatus === 'verified';

  const verificationBadgeClass = isVerified
    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/25'
    : 'bg-amber-500/15 text-amber-200 border-amber-400/25';

  const verificationDotClass = isVerified ? 'bg-emerald-300' : 'bg-amber-300';

  const navItems = [
    {
      key: 'dashboard', label: 'Dashboard', icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      key: 'deals', label: 'Deals', icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    },
    {
      key: 'accommodation', label: 'Accommodations', icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },

    
    {
      key: 'messages', label: 'Messages', icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    },
    {
      key: 'settings', label: 'Settings', icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-65 z-100 flex-col bg-[#0e2a47]">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/8">
          <button type="button" onClick={() => navigate('/')} className="shrink-0 cursor-pointer transition-opacity hover:opacity-90">
            <img src="/images/logo.png" alt="LushWare" className="h-12 w-auto object-contain" />
          </button>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold text-[#2dd4af] uppercase tracking-[0.15em] mt-0.5">Merchant Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-3 px-3">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Menu</span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[13px] font-semibold transition-all duration-200 cursor-pointer border-none ${activePage === item.key
                  ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
            >
              <span className={`transition-colors duration-200 ${activePage === item.key ? 'text-[#2dd4af]' : ''}`}>
                {item.icon}
              </span>
              {item.label}
              {activePage === item.key && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2dd4af]" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Profile */}
        <div className="px-4 py-4 border-t border-white/8 space-y-3">
          {isMerchant && isTraveller && (
            <button onClick={onSwitchMode} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#2dd4af] transition-colors border border-[#2dd4af]/20 hover:border-[#2dd4af]/40 cursor-pointer shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3-4 4 4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
              Switch to User Mode
            </button>
          )}

          {isMerchant && !isTraveller && (
            <button onClick={() => navigate('/register')} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-emerald-300 transition-colors border border-emerald-300/20 hover:border-emerald-300/40 cursor-pointer shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              Become a Traveller
            </button>
          )}

          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group relative">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center text-white text-sm font-bold shadow-md">
              {profile?.businessName?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col leading-tight min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-white truncate">{profile?.businessName || 'Loading...'}</span>
              <span className="text-[10px] text-white/40 truncate">{profile?.user?.name || 'Merchant'}</span>
              {refreshing ? (
                <span className="mt-1 h-5 w-24 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <span className={`mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${verificationBadgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${verificationDotClass}`} />
                  {isVerified ? 'Verified' : 'Pending'}
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors border-none cursor-pointer"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-100 bg-[#0e2a47] px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/images/logo.png" alt="LushWare" className="h-10 w-auto object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-semibold text-[#2dd4af] uppercase tracking-wider mt-0.5">Merchant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors border-none cursor-pointer">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border border-[#0e2a47]" />
          </button>

          {/* Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-[#2dd4af]/10 text-[#2dd4af] hover:bg-[#2dd4af]/20 transition-colors border border-[#2dd4af]/20 cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-99 bg-[#0e2a47]/40 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-15 left-4 right-4 bg-[#0e2a47] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 space-y-3">
              {/* Profile Header in Menu */}
              <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#f97316] to-[#fb923c] flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {profile?.businessName?.charAt(0) || 'M'}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-bold text-white truncate">{profile?.businessName || 'Merchant'}</span>
                  <div className={`mt-0.5 inline-flex w-fit items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.05em] ${verificationBadgeClass}`}>
                    <span className={`w-1 h-1 rounded-full ${verificationDotClass}`} />
                    {isVerified ? 'Verified' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { onNavigate?.(item.key); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border-none ${activePage === item.key
                        ? 'bg-[#2dd4af]/20 text-[#2dd4af]'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className={activePage === item.key ? 'text-[#2dd4af]' : 'text-white/20'}>
                      {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4' })}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Functional Actions */}
              <div className="pt-1.5 space-y-1.5">
                {isMerchant && isTraveller && (
                  <button
                    onClick={() => { onSwitchMode?.(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#2dd4af] text-[#0e2a47] font-bold text-[12px] transition-all cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3-4 4 4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
                    Switch to User Mode
                  </button>
                )}

                <div className="flex gap-1.5">
                  {isMerchant && !isTraveller && (
                    <button
                      onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-emerald-300 font-bold text-[11px] border border-emerald-300/20 cursor-pointer"
                    >
                      Become a Traveller
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold text-[11px] hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MerchantNavbar;
