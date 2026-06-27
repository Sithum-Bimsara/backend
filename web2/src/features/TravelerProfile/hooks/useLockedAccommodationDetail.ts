import { useState, useEffect, useCallback } from 'react';
import { getMyAccommodationLockDetail } from '../api/user-profile.api';
import type { ILockedAccommodationDetail } from '../types/user-profile.types';

export const useLockedAccommodationDetail = (lockId?: string) => {
  const [detail, setDetail] = useState<ILockedAccommodationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!lockId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMyAccommodationLockDetail(lockId);
      setDetail(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch lock details');
    } finally {
      setLoading(false);
    }
  }, [lockId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    lock: detail?.lock || null,
    property: detail?.property || null,
    loading,
    error,
    refetch: fetchDetail,
  };
};
