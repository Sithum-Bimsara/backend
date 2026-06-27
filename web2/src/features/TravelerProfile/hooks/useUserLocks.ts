import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getMyDealLocks, getMyAccommodationLocks } from '../api/user-profile.api';
import type { IViewUserDealLock, IViewUserAccommodationLock } from '../types/user-profile.types';

export const useUserLocks = () => {
  const [activeTab, setActiveTab] = useState<'deals' | 'accommodations'>('deals');
  const ITEMS_PER_PAGE = 10;

  // Deals locks state
  const [dealLocks, setDealLocks] = useState<IViewUserDealLock[]>([]);
  const [dealsTotal, setDealsTotal] = useState(0);
  const [dealsPage, setDealsPage] = useState(1);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState<string | null>(null);

  // Accommodation locks state
  const [accommodationLocks, setAccommodationLocks] = useState<IViewUserAccommodationLock[]>([]);
  const [accommodationsTotal, setAccommodationsTotal] = useState(0);
  const [accommodationsPage, setAccommodationsPage] = useState(1);
  const [accommodationsLoading, setAccommodationsLoading] = useState(false);
  const [accommodationsError, setAccommodationsError] = useState<string | null>(null);

  const fetchDealLocks = useCallback(async (page: number) => {
    setDealsLoading(true);
    setDealsError(null);
    try {
      const res = await getMyDealLocks({ page, limit: ITEMS_PER_PAGE });
      setDealLocks(res.data);
      setDealsTotal(res.total);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) 
        ? err.response?.data?.message 
        : (err instanceof Error ? err.message : null);
      setDealsError(msg || 'Failed to fetch deal locks');
    } finally {
      setDealsLoading(false);
    }
  }, []);

  const fetchAccommodationLocks = useCallback(async (page: number) => {
    setAccommodationsLoading(true);
    setAccommodationsError(null);
    try {
      const res = await getMyAccommodationLocks({ page, limit: ITEMS_PER_PAGE });
      setAccommodationLocks(res.data);
      setAccommodationsTotal(res.total);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) 
        ? err.response?.data?.message 
        : (err instanceof Error ? err.message : null);
      setAccommodationsError(msg || 'Failed to fetch accommodation locks');
    } finally {
      setAccommodationsLoading(false);
    }
  }, []);

  // Sync state with pages and active tab to fetch only on demand
  useEffect(() => {
    if (activeTab === 'deals') {
      fetchDealLocks(dealsPage);
    }
  }, [activeTab, dealsPage, fetchDealLocks]);

  useEffect(() => {
    if (activeTab === 'accommodations') {
      fetchAccommodationLocks(accommodationsPage);
    }
  }, [activeTab, accommodationsPage, fetchAccommodationLocks]);

  const refetchActive = useCallback(() => {
    if (activeTab === 'deals') {
      fetchDealLocks(dealsPage);
    } else {
      fetchAccommodationLocks(accommodationsPage);
    }
  }, [activeTab, dealsPage, accommodationsPage, fetchDealLocks, fetchAccommodationLocks]);

  return {
    activeTab,
    setActiveTab,
    deals: {
      data: dealLocks,
      total: dealsTotal,
      page: dealsPage,
      setPage: setDealsPage,
      loading: dealsLoading,
      error: dealsError,
    },
    accommodations: {
      data: accommodationLocks,
      total: accommodationsTotal,
      page: accommodationsPage,
      setPage: setAccommodationsPage,
      loading: accommodationsLoading,
      error: accommodationsError,
    },
    refetchActive,
    itemsPerPage: ITEMS_PER_PAGE,
  };
};
