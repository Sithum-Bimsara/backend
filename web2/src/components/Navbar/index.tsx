import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isTraveller, isMerchant, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (route === 'discover') return path === '/' || path.startsWith('/packages');
    if (route === 'community') return path === '/community';
    if (route === 'explore') return path === '/explore';
    if (route === 'local-guide') return path.startsWith('/local-guide');
    if (route === 'my-deals') return path === '/my-deals';
    if (route === 'bookings') return path.startsWith('/bookings');
    return false;
  };

  const isProfilePage = path === '/profile';
  const useDarkText = scrolled && !isProfilePage;

  const getNavClass = (route: string) => {
    const active = isActive(route);
    const baseClass = "text-sm font-medium transition-all duration-300 cursor-pointer px-4 py-1.5 rounded-full";
    if (active) {
      return `${baseClass} ${useDarkText ? 'bg-[#2dd4af]/15 text-[#0e2a47] font-semibold' : 'bg-white/20 text-white font-semibold'}`;
    } else {
      return `${baseClass} ${useDarkText ? 'text-[#0e2a47] hover:bg-black/5 hover:text-[#2dd4af]' : 'text-white hover:bg-white/10 hover:text-[#82f7e0]'}`;
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLoggedIn = !!user;
  const showDealsAndBookingsTabs = isLoggedIn && !(isMerchant && !isTraveller);
  const forceScrolled = scrolled || isProfilePage;

  return (
    <>
      {/* ─── Main Navbar (Header) ─── */}
      <nav
        className={`meet-me-maldives-navbar fixed top-0 left-0 right-0 z-[1001] transition-all duration-300 ease-in-out px-6 md:px-20 ${isMobileMenuOpen
          ? 'bg-[#0e2a47] border-b border-white/5 py-1 is-mobile-open'
          : forceScrolled
            ? `${isProfilePage ? 'bg-[#0e2a47]' : 'bg-[#fdf6e9]/95 backdrop-blur-md'} py-1 shadow-sm border-b border-black/5`
            : 'bg-transparent py-1'
          }`}
      >
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group pt-1" onClick={() => handleNavigate('/')}>
            <div className="h-9 lg:h-11 w-auto flex items-center justify-center overflow-visible">
              <img
                src="/images/logo.png"
                alt="LushWare Logo"
                className="h-9 lg:h-12 w-auto object-contain"
              />
            </div>
            <span className={`text-xl lg:text-2xl font-['Playfair_Display',serif] italic font-bold tracking-tight transition-colors duration-300 ${useDarkText ? 'text-[#0e2a47]' : 'text-white'}`}>
              LushWare
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => handleNavigate('/')} className={getNavClass('discover')}>Discover</button>
            <button onClick={() => handleNavigate('/explore')} className={getNavClass('explore')}>Explore</button>
            <button onClick={() => handleNavigate('/local-guide')} className={getNavClass('local-guide')}>Local Guide</button>
            <button onClick={() => handleNavigate('/community')} className={getNavClass('community')}>Community</button>
            {showDealsAndBookingsTabs && <button onClick={() => handleNavigate('/my-deals')} className={getNavClass('my-deals')}>My Deals</button>}
            {showDealsAndBookingsTabs && <button onClick={() => handleNavigate('/bookings')} className={getNavClass('bookings')}>Bookings</button>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">

            {/* ─── Guest: Not Logged In ─── */}
            {(loading || !isLoggedIn) && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNavigate('/login')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${useDarkText
                    ? 'text-[#0e2a47] border-[#0e2a47]/10 hover:bg-black/5'
                    : 'text-white border-white/20 bg-black/10 hover:bg-black/20'
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigate('/register')}
                  className="px-5 py-2 rounded-full text-sm font-bold text-white bg-linear-to-r from-[#2dd4af] to-[#25b898] transition-all duration-300 shadow-lg shadow-[#2dd4af]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#2dd4af]/30"
                >
                  Register
                </button>
              </div>
            )}

            {/* ─── Logged In: Traveller ─── */}
            {!loading && isLoggedIn && isTraveller && !isMerchant && (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => handleNavigate('/register/merchant')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${useDarkText
                    ? 'text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
                    : 'text-white border-indigo-300/30 bg-indigo-500/20 hover:bg-indigo-500/30'
                    }`}
                >
                  Become a Merchant
                </button>

                {/* Chat Icon */}
                <button
                  onClick={() => navigate('/messages')}
                  className={`p-2 rounded-full transition-all duration-300 relative ${useDarkText ? 'bg-white shadow-sm text-slate-600 hover:shadow-md' : 'bg-white/10 text-white hover:bg-white/15'}`}
                  title="Messages"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${useDarkText
                      ? 'bg-white shadow-sm hover:shadow-md border border-slate-100'
                      : 'bg-white/10 hover:bg-white/15'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {getInitials(user.name)}
                    </div>
                    <span className={`text-sm font-medium max-w-32 truncate ${useDarkText ? 'text-[#0e2a47]' : 'text-white'}`}>
                      {user.name || user.email}
                    </span>
                    <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${useDarkText ? 'text-slate-400' : 'text-white/60'}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                          Traveller
                        </span>
                      </div>
                      <button onClick={() => handleNavigate('/profile')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        My Profile
                      </button>
                      <button onClick={() => handleNavigate('/bookings')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        My Bookings
                      </button>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Logged In: Merchant (only or both) ─── */}
            {!loading && isLoggedIn && isMerchant && (
              <div className="hidden md:flex items-center gap-3">
                {!isTraveller && (
                  <button
                    onClick={() => handleNavigate('/register')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${useDarkText
                      ? 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-white border-emerald-300/30 bg-emerald-500/20 hover:bg-emerald-500/30'
                      }`}
                  >
                    Register as Traveller
                  </button>
                )}

                <button
                  onClick={() => handleNavigate('/merchant-dashboard')}
                  className={`p-2 rounded-full transition-all duration-300 ${useDarkText ? 'bg-white shadow-sm text-indigo-600 hover:shadow-md' : 'bg-white/10 text-white hover:bg-white/15'}`}
                  title="Merchant Dashboard"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 3-4 4 4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
                  </svg>
                </button>

                {/* Chat Icon for Merchant */}
                <button
                  onClick={() => navigate('/messages')}
                  className={`p-2 rounded-full transition-all duration-300 relative ${useDarkText ? 'bg-white shadow-sm text-slate-600 hover:shadow-md' : 'bg-white/10 text-white hover:bg-white/15'}`}
                  title="Messages"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${useDarkText
                      ? 'bg-white shadow-sm hover:shadow-md border border-slate-100'
                      : 'bg-white/10 hover:bg-white/15'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {getInitials(user.name)}
                    </div>
                    <span className={`text-sm font-medium max-w-32 truncate ${useDarkText ? 'text-[#0e2a47]' : 'text-white'}`}>
                      {user.name || user.email}
                    </span>
                    <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${useDarkText ? 'text-slate-400' : 'text-white/60'}`} fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="flex gap-1.5 mt-1.5">
                          {isTraveller && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              Traveller
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                            Merchant
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleNavigate('/merchant-dashboard')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        Merchant Dashboard
                      </button>
                      {isTraveller && (
                        <button onClick={() => handleNavigate('/profile')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          My Profile
                        </button>
                      )}
                      {isTraveller && (
                        <button onClick={() => handleNavigate('/bookings')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          My Bookings
                        </button>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 border ${isMobileMenuOpen
                ? 'bg-[#2dd4af]/10 text-[#2dd4af] border-[#2dd4af]/20'
                : scrolled
                  ? 'text-[#0e2a47] border-transparent hover:bg-black/5'
                  : 'text-white border-transparent hover:bg-white/10'}`}
            >
              {isMobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu Overlay ─── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[1000] bg-[#0e2a47]/40 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-15 left-4 right-4 bg-[#0e2a47] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 space-y-3">
              {/* Profile Header in Menu */}
              {!loading && isLoggedIn ? (
                <div 
                  onClick={() => handleNavigate('/profile')}
                  className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all duration-300"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${isMerchant ? 'bg-linear-to-br from-indigo-400 to-violet-500' : 'bg-linear-to-br from-emerald-400 to-teal-500'}`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-white truncate">{user.name || 'User'}</span>
                    <div className="flex gap-1 mt-0.5">
                      {isTraveller && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[7px] font-bold uppercase tracking-wider border border-emerald-500/20">
                          Traveller
                        </span>
                      )}
                      {isMerchant && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[7px] font-bold uppercase tracking-wider border border-indigo-500/20">
                          Merchant
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-white">Welcome!</span>
                    <span className="text-[9px] text-white/40">Sign in to explore deals</span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'discover', label: 'Discover', path: '/', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
                  { id: 'explore', label: 'Explore', path: '/explore', icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
                  { id: 'local-guide', label: 'Local Guide', path: '/local-guide', icon: <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></> },
                  { id: 'community', label: 'Community', path: '/community', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
                  ...(showDealsAndBookingsTabs ? [
                    { id: 'my-deals', label: 'My Deals', path: '/my-deals', icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></> },
                    { id: 'bookings', label: 'Bookings', path: '/bookings', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> }
                  ] : [])
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 cursor-pointer border-none ${isActive(item.id)
                      ? 'bg-[#2dd4af]/20 text-[#2dd4af]'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className={isActive(item.id) ? 'text-[#2dd4af]' : 'text-white/20'}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {item.icon}
                      </svg>
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Actions */}
              <div className="pt-1.5 space-y-1.5">
                {!loading && isLoggedIn ? (
                  <>
                    {isMerchant ? (
                      <button
                        onClick={() => { handleNavigate('/merchant-dashboard'); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#2dd4af] text-[#0e2a47] font-bold text-[11px] transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3-4 4 4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
                        Merchant Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavigate('/register/merchant')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-[#2dd4af] font-bold text-[11px] border border-[#2dd4af]/20 cursor-pointer"
                      >
                        Become a Merchant
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold text-[11px] hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleNavigate('/login')}
                      className="w-full py-2.5 rounded-xl bg-white/5 text-white font-bold text-[11px] hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavigate('/register')}
                      className="w-full py-2.5 rounded-xl bg-[#2dd4af] text-[#0e2a47] font-bold text-[11px] transition-all cursor-pointer shadow-lg shadow-[#2dd4af]/20"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
