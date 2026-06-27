import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDealBookings, getDealLocks, getDeal } from '../api/deals.api';
import type { IDealBooking, IDealLock, IDeal } from '../types/deals.types';

import { ErrorHandler } from '../../../utils/error-handler';

export type DealBookingsSubTab = 'locks' | 'bookings';

const PAGE_SIZE = 10;

const getThisWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(today.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
};

export const useDealBookings = (dealId: string) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const weekRange = getThisWeekRange();

  const subTab = (searchParams.get('tab') as DealBookingsSubTab) || 'locks';
  const startDate = searchParams.get('startDate') || weekRange.start;
  const endDate = searchParams.get('endDate') || weekRange.end;
  const locksPage = parseInt(searchParams.get('locksPage') || '1', 10);
  const bookingsPage = parseInt(searchParams.get('bookingsPage') || '1', 10);

  const setSubTab = useCallback((tab: DealBookingsSubTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  }, [setSearchParams]);

  const setStartDate = useCallback((start: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('startDate', start);
      return next;
    });
  }, [setSearchParams]);

  const setEndDate = useCallback((end: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('endDate', end);
      return next;
    });
  }, [setSearchParams]);

  const setLocksPage = useCallback((page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('locksPage', String(page));
      return next;
    });
  }, [setSearchParams]);

  const setBookingsPage = useCallback((page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bookingsPage', String(page));
      return next;
    });
  }, [setSearchParams]);

  const [locks, setLocks] = useState<IDealLock[]>([]);
  const [locksTotal, setLocksTotal] = useState(0);
  const [locksTotalPages, setLocksTotalPages] = useState(1);
  const [locksLoading, setLocksLoading] = useState(false);
  const [bookings, setBookings] = useState<IDealBooking[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [deal, setDeal] = useState<IDeal | null>(null);
  const [dealLoading, setDealLoading] = useState(false);

  const fetchDeal = useCallback(async () => {
    setDealLoading(true);
    try {
      const data = await getDeal(dealId);
      setDeal(data);
    } catch (e: unknown) {
      ErrorHandler.handle(e, { showToast: true, fallbackMessage: 'Failed to fetch deal details' });
    } finally {
      setDealLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    void fetchDeal();
  }, [dealId, fetchDeal]);

  const fetchLocks = useCallback(async (page: number) => {
    setLocksLoading(true);
    try {
      const data = await getDealLocks(dealId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setLocks(data.locks);
      setLocksTotal(data.total);
      setLocksTotalPages(data.totalPages);
    } catch (e: unknown) {
      ErrorHandler.handle(e, { showToast: true, fallbackMessage: 'Failed to fetch locks' });
    } finally {
      setLocksLoading(false);
    }
  }, [dealId, startDate, endDate]);

  const fetchBookings = useCallback(async (page: number) => {
    setBookingsLoading(true);
    try {
      const data = await getDealBookings(dealId, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setBookings(data.bookings);
      setBookingsTotal(data.total);
      setBookingsTotalPages(data.totalPages);
    } catch (e: unknown) {
      ErrorHandler.handle(e, { showToast: true, fallbackMessage: 'Failed to fetch bookings' });
    } finally {
      setBookingsLoading(false);
    }
  }, [dealId, startDate, endDate]);

  useEffect(() => {
    if (subTab === 'locks') fetchLocks(locksPage);
  }, [subTab, locksPage, fetchLocks]);

  useEffect(() => {
    if (subTab === 'bookings') fetchBookings(bookingsPage);
  }, [subTab, bookingsPage, fetchBookings]);

  const handleApplyDates = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('locksPage', '1');
      next.set('bookingsPage', '1');
      return next;
    });
    if (subTab === 'locks') fetchLocks(1);
    else fetchBookings(1);
  };

  const handleClearDates = () => {
    const defaultRange = getThisWeekRange();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('startDate', defaultRange.start);
      next.set('endDate', defaultRange.end);
      next.set('locksPage', '1');
      next.set('bookingsPage', '1');
      return next;
    });
  };

  const isLoading = subTab === 'locks' ? locksLoading : bookingsLoading;

  return {
    subTab,
    setSubTab,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    locks,
    locksTotal,
    locksTotalPages,
    locksPage,
    setLocksPage,
    locksLoading,
    bookings,
    bookingsTotal,
    bookingsTotalPages,
    bookingsPage,
    setBookingsPage,
    bookingsLoading,
    fetchLocks,
    fetchBookings,
    handleApplyDates,
    handleClearDates,
    isLoading,
    deal,
    dealLoading,
    fetchDeal,
  };
};
