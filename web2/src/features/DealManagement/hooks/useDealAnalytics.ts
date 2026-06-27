import { useState, useEffect, useCallback, useMemo } from 'react';
import * as dealsApi from '../api/deals.api';
import type { DateRangeQueryDto } from '../dtos/deals.dtos';
import type { IDealAnalytics } from '../types/deals.types';
import { ErrorHandler } from '../../../utils/error-handler';
import { getMerchantOverallAnalytics } from '../../MerchantProfile/api/merchant-profile.api';
import type { IMerchantOverallAnalytics } from '../../MerchantProfile/types/merchant-profile.types';

// ─── Per-deal analytics ───

interface UseDealAnalyticsReturn {
  analytics: IDealAnalytics | null;
  loading: boolean;
  error: string | null;
  actions: {
    refetch: (params?: DateRangeQueryDto) => Promise<void>;
  };
}

/**
 * USE-CASE: Analytics panel for a single deal (DealDetailsPage analytics tab).
 */
export function useDealAnalytics(dealId: string | null): UseDealAnalyticsReturn {
  const [analytics, setAnalytics] = useState<IDealAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (params?: DateRangeQueryDto) => {
      if (!dealId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await dealsApi.getDealAnalytics(dealId, params);
        setAnalytics(data);
      } catch (err: unknown) {
        setError(ErrorHandler.getErrorMessage(err, 'Failed to load analytics'));
      } finally {
        setLoading(false);
      }
    },
    [dealId]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const actions = useMemo(() => ({ refetch }), [refetch]);

  return { analytics, loading, error, actions };
}

// ─── Overall merchant analytics ───

interface UseMerchantAnalyticsReturn {
  analytics: IMerchantOverallAnalytics | null;
  loading: boolean;
  error: string | null;
  actions: {
    refetch: () => Promise<void>;
  };
}

/**
 * USE-CASE: Overall analytics dashboard for the merchant (Deals.tsx / dashboard).
 */
export function useMerchantAnalytics(): UseMerchantAnalyticsReturn {
  const [analytics, setAnalytics] = useState<IMerchantOverallAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMerchantOverallAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      setError(ErrorHandler.getErrorMessage(err, 'Failed to load merchant analytics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const actions = useMemo(() => ({ refetch }), [refetch]);

  return { analytics, loading, error, actions };
}
