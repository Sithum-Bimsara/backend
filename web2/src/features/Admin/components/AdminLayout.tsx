import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Islands Guide",
    path: "/admin/islands",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    label: "Merchants",
    path: "/admin/merchants",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Deal Requests",
    path: "/admin/deal-requests",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Moderation",
    path: "/admin/moderation",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "Messages",
    path: "/admin/messages",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
];

const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isActive = (path: string) => (path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-65 z-100 flex-col bg-[#0e2a47]">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/8">
          <button type="button" onClick={() => navigate("/")} className="shrink-0 cursor-pointer transition-opacity hover:opacity-90">
            <img src="/images/logo.png" alt="LushWare" className="h-16 w-auto object-contain" />
          </button>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-[0.15em] mt-0.5">Admin Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-3 px-3">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Menu</span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[13px] font-semibold transition-all duration-200 cursor-pointer border-none ${isActive(item.path)
                ? "bg-white/10 text-white shadow-lg shadow-black/10"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
            >
              <span className={`transition-colors duration-200 ${isActive(item.path) ? "text-indigo-400" : ""}`}>
                {item.icon}
              </span>
              {item.label}
              {isActive(item.path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Profile */}
        <div className="px-4 py-4 border-t border-white/8 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group relative">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col leading-tight min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-white truncate">{user?.name || "Admin"}</span>
              <span className="text-[10px] text-white/40 truncate">{user?.email || "admin@platform.com"}</span>
            </div>
            <button
              onClick={logout}
              className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors border-none cursor-pointer"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-100 bg-[#0e2a47] px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-white/8 text-white/70 hover:bg-white/15 transition-colors border-none cursor-pointer"
            title="Logout"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20 cursor-pointer outline-none"
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
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-bold text-white truncate">{user?.name || "Admin"}</span>
                  <span className="text-[10px] text-white/40 truncate">{user?.email || "admin@platform.com"}</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="grid grid-cols-2 gap-1.5">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border-none ${isActive(item.path)
                      ? "bg-indigo-500/20 text-white shadow-inner"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <span className={isActive(item.path) ? "text-indigo-400" : "text-white/20"}>
                      {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-1.5">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-bold text-[11px] hover:bg-red-500/20 transition-all cursor-pointer border-none"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 lg:ml-65 ${isActive("/admin/messages") ? "h-[100dvh] flex flex-col overflow-hidden" : ""}`}>
        <main className={isActive("/admin/messages") ? "flex-1 pt-15 lg:pt-0 flex flex-col overflow-hidden relative" : "pt-16 lg:pt-0 p-4 md:p-6 lg:p-8"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
