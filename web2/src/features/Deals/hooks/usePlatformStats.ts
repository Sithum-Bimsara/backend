import { useState, useEffect } from 'react';
import { getPlatformStats } from '../api/deals.api';
import type { IPlatformStats } from '../types/deals.types';

export const usePlatformStats = () => {
  const [stats, setStats] = useState<IPlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getPlatformStats();
        setStats(data);
        setError(null);
      } catch (err: unknown) {
        console.error('Failed to fetch platform stats:', err);
        setError((err as Error).message || 'Failed to fetch platform stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
