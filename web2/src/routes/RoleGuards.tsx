import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

import { motion } from 'framer-motion';

export const RouteLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-(--app-bg) flex items-center justify-center overflow-hidden relative">
    {/* Cinematic Ambient Glow */}
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.4, 0.2],
        rotate: [0, 90, 180]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(45,212,175,0.2)_0%,rgba(34,211,238,0.1)_50%,transparent_70%)] blur-[80px]"
    />

    <div className="flex flex-col items-center gap-16 relative z-10">
      <div className="relative flex items-center justify-center">
        {/* Orbiting Elements */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{ width: 160 + i * 30, height: 160 + i * 30 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#2dd4af]/40 blur-[0.5px]"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
          </motion.div>
        ))}

        {/* 3D Floating Logo */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
            rotateY: [-15, 15, -15],
            rotateX: [-5, 5, -5]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ perspective: 1200 }}
          className="relative z-20"
        >
          <div className="absolute inset-0 rounded-full bg-[#2dd4af]/10 blur-3xl scale-150" />
          <img
            src="/images/logo.png"
            alt="LushWare"
            className="h-28 md:h-36 w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
          />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#0e2a47]/60 font-bold text-[14px] uppercase tracking-[0.5em] translate-x-[0.25em]"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-linear-to-r from-[#0e2a47] via-[#2dd4af] to-[#0e2a47] bg-clip-text text-transparent"
            >
              Preparing your escape
            </motion.span>
          </motion.p>

          {/* Modern Waveform Loading Indicator */}
          <div className="flex items-end justify-center gap-1.5 h-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{
                  height: [6, 20, 6],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut"
                }}
                className="w-1 rounded-full bg-linear-to-t from-[#2dd4af] to-cyan-400"
              />
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Subtle corner vignettes */}
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.02)_100%)]" />
  </div>
);

// Blocks admins from all non-admin route groups.
export const NonAdminRouteGuard: React.FC = () => {
  const { loading, user, isAdmin } = useAuth();

  if (!loading && user && isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
};

// Admin-only route group.
export const AdminRouteGuard: React.FC = () => {
  const { loading, user, isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile, resolveRedirect } = useAuth();

  if (loading) return <RouteLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <Navigate
        to={resolveRedirect({ user, isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile })}
        replace
      />
    );
  }

  return <Outlet />;
};

// Merchant dashboard route group.
export const MerchantRouteGuard: React.FC = () => {
  const { loading, user, isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile, resolveRedirect } = useAuth();

  if (loading) return <RouteLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (!isMerchant) {
    return (
      <Navigate
        to={resolveRedirect({ user, isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile })}
        replace
      />
    );
  }

  return <Outlet />;
};

// User-facing pages (traveller pages) are available to travellers and merchants.
// Merchant users can browse user pages, as requested.
export const UserRouteGuard: React.FC = () => {
  const { loading, user, isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile, resolveRedirect } = useAuth();

  if (!loading && user && isAdmin) return <Navigate to="/admin" replace />;

  if (!loading && user) {
    const canAccessUserPages = isTraveller || isMerchant;
    if (!canAccessUserPages) {
      return (
        <Navigate
          to={resolveRedirect({ user, isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile })}
          replace
        />
      );
    }
  }

  return <Outlet />;
};

// Register / onboarding pages should not be accessible by admins.
export const NonAdminAuthSetupGuard: React.FC = () => {
  const { loading, user, isAdmin } = useAuth();

  if (loading) return <RouteLoadingScreen />;
  if (user && isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
};
