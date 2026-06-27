import React, { createContext, useEffect, useState, useCallback, useRef } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../features/(auth)/api/auth.api";
import type { IUser, IGetMeResponse } from "../features/(auth)/types/auth.types";

//////////////////////////////////////////////////////
// AUTH STATE
//////////////////////////////////////////////////////

type AuthState = {
  user: IUser | null;
  isTraveller: boolean;
  isMerchant: boolean;
  isAdmin: boolean;
  hasPreferences: boolean;
  hasMerchantProfile: boolean;
};

type AuthContextType = AuthState & {
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  resolveRedirect: (state: AuthState) => string;
};

const defaultState: AuthState = {
  user: null,
  isTraveller: false,
  isMerchant: false,
  isAdmin: false,
  hasPreferences: false,
  hasMerchantProfile: false,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultState,
  loading: true,
  fetchUser: async () => {},
  logout: async () => {},
  resolveRedirect: () => "/",
});

//////////////////////////////////////////////////////
// REDIRECT RESOLVER — Centralized redirect logic
//////////////////////////////////////////////////////

const resolveRedirect = (state: AuthState): string => {
  const { isAdmin, isTraveller, isMerchant, hasPreferences, hasMerchantProfile } = state;

  // Admin always goes to admin page
  if (isAdmin) return "/admin";

  // Both roles
  if (isTraveller && isMerchant) {
    if (!hasPreferences) return "/onboarding/user";
    if (!hasMerchantProfile) return "/onboarding/merchant";
    return "/merchant-dashboard";
  }

  // Traveller only
  if (isTraveller) {
    if (!hasPreferences) return "/onboarding/user";
    return "/";
  }

  // Merchant only
  if (isMerchant) {
    if (!hasMerchantProfile) return "/onboarding/merchant";
    return "/merchant-dashboard";
  }

  return "/";
};

//////////////////////////////////////////////////////
// AUTH PROVIDER
//////////////////////////////////////////////////////

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultState);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<IGetMeResponse>("/auth/me");
      const data = res.data;

      setAuthState({
        user: data.user,
        isTraveller: data.isTraveller,
        isMerchant: data.isMerchant,
        isAdmin: data.isAdmin,
        hasPreferences: data.hasPreferences,
        hasMerchantProfile: data.hasMerchantProfile,
      });
    } catch {
      setAuthState(defaultState);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Clear local state first to prevent the auth listener from making a redundant backend call
    setAuthState(defaultState);
    await logoutUser();
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (loading || !authState.user) return;

    // Auth callback page manages its own redirect flow.
    // Skipping global sync here prevents transient redirects (e.g. dashboard flash)
    // while role-add/login requests are still in progress.
    if (location.pathname.startsWith("/auth/callback")) return;

    const isMerchantRegistrationRoute = location.pathname.startsWith("/register/merchant");
    const isTravellerRegistrationRoute = location.pathname === "/register";

    // Allow cross-registration flows:
    // traveller -> merchant via /register/merchant
    // merchant -> traveller via /register
    const isAllowedCrossRegistrationRoute =
      (isMerchantRegistrationRoute && authState.isTraveller && !authState.isMerchant) ||
      (isTravellerRegistrationRoute && authState.isMerchant && !authState.isTraveller);

    if (isAllowedCrossRegistrationRoute) return;

    const shouldSyncRoute =
      location.pathname.startsWith("/login") ||
      location.pathname.startsWith("/register") ||
      (authState.isAdmin && !location.pathname.startsWith("/admin")) ||
      (authState.isTraveller && !authState.hasPreferences) ||
      (authState.isMerchant && !authState.hasMerchantProfile);

    if (!shouldSyncRoute) return;

    const nextRoute = resolveRedirect(authState);
    if (location.pathname !== nextRoute) {
      navigate(nextRoute, { replace: true });
    }
  }, [authState, loading, location.pathname, navigate]);

  // Use a ref to access the latest user state inside the auth listener without triggering re-subscriptions
  const userRef = useRef(authState.user);
  useEffect(() => {
    userRef.current = authState.user;
  }, [authState.user]);

  // Track the last token to prevent redundant backend calls on window focus
  const lastTokenRef = useRef<string | null>(null);

  // Listen for Supabase session changes (token refresh)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
          const token = session?.access_token;
          // Only call backend if the token actually changed (prevents window focus spam)
          if (token && token !== lastTokenRef.current) {
            lastTokenRef.current = token;
            try {
              await api.post("/auth/refresh", { token });
              await fetchUser();
            } catch {
              // If it fails, reset so it can try again later
              lastTokenRef.current = null;
            }
          }
        }

        if (event === "SIGNED_OUT") {
          lastTokenRef.current = null;
          // Only call backend logout if we still have a user in state.
          // This prevents a redundant call (and new CSRF token generation) 
          // when a manual logout has already initiated the cleanup.
          if (userRef.current) {
            await api.post("/auth/logout").catch(() => {});
            setAuthState(defaultState);
          }
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loading,
        fetchUser,
        logout,
        resolveRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
