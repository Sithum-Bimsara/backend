import { useState, useEffect, useCallback } from 'react';
import { getPublicDeal } from '../api/deals.api';
import type { IDealDetail } from '../types/deals.types';

interface UsePublicDealReturn {
  deal: IDealDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePublicDeal = (
  id: string | undefined,
  options?: { source?: string }
): UsePublicDealReturn => {
  const [deal, setDeal] = useState<IDealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const source = options?.source;

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

      return maybeError.response?.data?.message || maybeError.message || 'Failed to fetch deal';
    }

    return 'Failed to fetch deal';
  };

  const fetchDeal = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicDeal(id, { source });
      setDeal(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, source]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  return { deal, loading, error, refetch: fetchDeal };
};
