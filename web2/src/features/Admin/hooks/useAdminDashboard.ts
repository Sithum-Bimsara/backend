import { useCallback, useEffect, useState } from "react";
import { getAdminDashboard } from "../api/api";
import type { AdminDashboardResponse } from "../types/admin.types";

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

export const useAdminDashboard = (initialQuery?: { startDate?: string; endDate?: string }) => {
  const [query, setQuery] = useState(initialQuery || {});
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDashboard(query);
      if (res.success) setData(res.data);
    } catch (err) {
      setError(parseError(err, "Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, query, setQuery, refetch: fetchDashboard };
};
