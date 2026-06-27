import { useEffect, useState, useCallback } from 'react';
import { getMyProperties } from '../api/accommodation.api';
import type { IAccommodationSummaryView } from '../types/accommodation.types';
import { ErrorHandler } from '../../../utils/error-handler';

export const useAccommodationProperties = (params?: { page?: number; limit?: number }) => {
  const limit = params?.limit || 8;
  const [properties, setProperties] = useState<IAccommodationSummaryView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProperties = useCallback(async (targetPage?: number) => {
    const activePage = targetPage ?? page;
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProperties({ page: activePage, limit });
      setProperties(data.properties || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, 'Failed to fetch properties');
      setError(msg);
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: msg });
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchProperties(page);
  }, [page, fetchProperties]);

  return { properties, loading, error, fetchProperties, page, totalPages, total, setPage };
};
