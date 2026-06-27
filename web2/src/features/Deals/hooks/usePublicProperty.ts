import { useState, useEffect, useCallback } from 'react';
import { getPublicProperty } from '../api/deals.api';
import type { IPropertyDetail } from '../types/deals.types';

export const usePublicProperty = (id?: string) => {
  const [property, setProperty] = useState<IPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicProperty(id);
      setProperty(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { property, loading, error, refetch: fetchProperty };
};
