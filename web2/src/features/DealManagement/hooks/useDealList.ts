import { useState, useCallback, useRef, useEffect } from 'react';
import * as dealsApi from '../api/deals.api';
import { listDealsQuerySchema } from '../dtos/deals.dtos';
import type { ListDealsQueryDto } from '../dtos/deals.dtos';
import type { IDealSlim } from '../types/deals.types';
import { ErrorHandler } from '../../../utils/error-handler';

interface UseDealListReturn {
  deals: IDealSlim[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  limit: number;
  search: string;
  actions: {
    setPage: (page: number) => void;
    setSearch: (value: string) => void;
    refresh: () => Promise<void>;
  };
}

/**
 * USE-CASE: Merchant deal list screen (Deals.tsx).
 * Handles offset-based pagination + search against /deals/mine.
 */
export function useDealList(): UseDealListReturn {
  const [deals, setDeals] = useState<IDealSlim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;
  const [search, setSearchState] = useState('');
  const searchRef = useRef(search);
  searchRef.current = search;

  const fetchDeals = useCallback(async (params: ListDealsQueryDto) => {
    setLoading(true);
    setError(null);
    try {
      const validated = listDealsQuerySchema.parse(params);
      const data = await dealsApi.getMyDeals(validated);
      setDeals(data.items);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      setError(ErrorHandler.getErrorMessage(err, 'Failed to load deals'));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchDeals({ search: searchRef.current || undefined, limit, page });
  }, [fetchDeals, page]);

  useEffect(() => {
    fetchDeals({ search: searchRef.current || undefined, limit, page });
  }, [fetchDeals, page]);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setPageState(1);
      fetchDeals({ search: value || undefined, limit, page: 1 });
    },
    [fetchDeals]
  );

  return {
    deals,
    loading,
    error,
    page,
    total,
    limit,
    search,
    actions: { setPage, setSearch, refresh },
  };
}
