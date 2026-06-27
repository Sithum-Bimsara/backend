import { useState, useEffect, useCallback } from 'react';
import { getPublicDeals, getAccommodationDeals, searchPublicDeals } from '../api/deals.api';
import type { IDealCard, IPaginatedResponse } from '../types/deals.types';
import type { GetPublicDealsParamsDto } from '../dtos/deals.dto';

interface UsePublicDealsOptions extends GetPublicDealsParamsDto {
  enabled?: boolean;
  source?: 'deals' | 'accommodations' | 'search';
}

interface UsePublicDealsReturn {
  deals: IDealCard[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePublicDeals = (options?: UsePublicDealsOptions): UsePublicDealsReturn => {
  const source = options?.source ?? 'search';
  const enabled = options?.enabled ?? true;
  const page = options?.page;
  const limit = options?.limit;
  const location = options?.location;
  const category = options?.category;
  const search = options?.search;
  const isLocalOnly = options?.isLocalOnly;
  const island = options?.island;
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

      return maybeError.response?.data?.message || maybeError.message || 'Failed to fetch deals';
    }

    return 'Failed to fetch deals';
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
      
      let data: IPaginatedResponse<IDealCard>;
      
      if (source === 'accommodations') {
        data = await getAccommodationDeals({ page, limit, island });
      } else if (source === 'search') {
        data = await searchPublicDeals({
          page,
          limit,
          location,
          category,
          search,
          isLocalOnly,
          island,
        });
      } else {
        data = await getPublicDeals({
          page,
          limit,
          location,
          category,
          search,
          isLocalOnly,
          island,
        });
      }
      
      setPaginatedData(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    source,
    page,
    limit,
    location,
    category,
    search,
    isLocalOnly,
    island,
  ]);

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
    refetch: fetchDeals 
  };
};
