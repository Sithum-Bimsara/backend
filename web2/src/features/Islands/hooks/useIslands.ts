import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api/island.api';
import type { IIslandMin, IIslandFull, IPaginatedIslandResponse } from '../types/island.types';

export const useIslands = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search state bound to URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  const search = searchParams.get('search') || '';

  const [paginatedData, setPaginatedData] = useState<IPaginatedIslandResponse>({
    items: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const [suitableIslands, setSuitableIslands] = useState<IIslandMin[]>([]);
  const [compareList, setCompareList] = useState<IIslandFull[]>([]);

  // Fetch paginated islands
  const fetchIslands = useCallback(async (customPage?: number, customSearch?: string) => {
    setLoading(true);
    setError(null);
    try {
      const p = customPage !== undefined ? customPage : page;
      const s = customSearch !== undefined ? customSearch : search;
      const data = await api.getIslands({ page: p, limit, search: s || undefined });
      setPaginatedData(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch islands');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  // Update page in URL
  const setPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Update search in URL
  const setSearch = useCallback((newSearch: string) => {
    const params = new URLSearchParams(searchParams);
    if (newSearch) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to page 1 on new search
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Fetch suitable matching islands based on selected questionnaire items
  const fetchSuitableIslands = useCallback(async (categories: string[], activities: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSuitableIslands({ categories, activities });
      setSuitableIslands(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch matching islands');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch comparison list by IDs
  const fetchCompareIslands = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setCompareList([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCompareIslands(ids);
      setCompareList(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch comparison details');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    page,
    limit,
    search,
    paginatedData,
    suitableIslands,
    compareList,
    fetchIslands,
    setPage,
    setSearch,
    fetchSuitableIslands,
    fetchCompareIslands,
  };
};
