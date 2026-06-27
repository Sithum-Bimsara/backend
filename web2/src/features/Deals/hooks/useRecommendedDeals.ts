import { useState, useEffect, useCallback } from 'react';
import { getRecommendedDeals } from '../api/deals.api';
import type { IDealCard, IPaginatedResponse } from '../types/deals.types';
import type { PaginationParams } from '../types/deals.types';

interface UseRecommendedDealsOptions extends PaginationParams {
  enabled?: boolean;
}

interface UseRecommendedDealsReturn {
  deals: IDealCard[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRecommendedDeals = (options?: UseRecommendedDealsOptions): UseRecommendedDealsReturn => {
  const enabled = options?.enabled ?? true;
  const page = options?.page;
  const limit = options?.limit;
  const [paginatedData, setPaginatedData] = useState<IPaginatedResponse<IDealCard> | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      const maybeError = err as {
        message?: string;
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      return maybeError.response?.data?.message || maybeError.message || 'Failed to fetch recommended deals';
    }

    return 'Failed to fetch recommended deals';
  };

  const fetchDeals = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setPaginatedData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendedDeals({ page, limit });
      setPaginatedData(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals: paginatedData?.data || [],
    total: paginatedData?.total || 0,
    page: paginatedData?.page || 1,
    limit: paginatedData?.limit || 10,
    loading,
    error,
    refetch: fetchDeals,
  };
};
