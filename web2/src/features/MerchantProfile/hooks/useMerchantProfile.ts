import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../api/merchant-profile.api";
import type { IMerchantProfile } from "../types/merchant-profile.types";
import type { UpdateMerchantProfileDto } from "../schemas/merchant-profile.schema";
import { ErrorHandler } from "../../../utils/error-handler";

const PROFILE_CACHE_KEY = "merchant_profile_cache_v2";

const readCachedProfile = (): IMerchantProfile | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IMerchantProfile;
  } catch {
    return null;
  }
};

const writeCachedProfile = (profile: IMerchantProfile) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore cache write failures.
  }
};

export const useMerchantProfile = () => {
  const [profile, setProfile] = useState<IMerchantProfile | null>(() => readCachedProfile());
  const hasInitialProfileRef = useRef(Boolean(readCachedProfile()));
  const [loading, setLoading] = useState(!hasInitialProfileRef.current);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setRefreshing(true);
    setLoading((prev) => prev && !hasInitialProfileRef.current);
    setError(null);
    try {
      const p = await api.getMyProfile();
      setProfile(p);
      writeCachedProfile(p);
    } catch (err: unknown) {
      setError(ErrorHandler.getErrorMessage(err, "Failed to fetch profile"));
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const updateProfile = async (data: UpdateMerchantProfileDto) => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.updateProfile(data);
      setProfile(p);
      writeCachedProfile(p);
      return p;
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, "Failed to update profile");
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refreshing, error, refetch: fetchProfile, updateProfile };
};
