import { useCallback, useEffect, useState } from "react";
import {
  getDealRequests,
  markDealRequestContacted as markDealRequestContactedApi,
  markDealRequestClosed as markDealRequestClosedApi,
} from "../api/api";
import type {
  AdminDealRequestItem,
  DealRequestListQuery,
} from "../types/admin.types";

const defaultPageSize = 10;

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

export const useDealRequests = (initialQuery?: DealRequestListQuery) => {
  const [query, setQuery] = useState<DealRequestListQuery>({ page: 1, limit: defaultPageSize, ...initialQuery });
  const [items, setItems] = useState<AdminDealRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDealRequests(query);
      if (res.success) {
        setItems(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      setError(parseError(err, "Failed to load deal requests"));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchDealRequests();
  }, [fetchDealRequests]);

  const markContacted = async (id: string) => {
    try {
      const res = await markDealRequestContactedApi(id);
      if (res.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, status: "contacted" } : item
          )
        );
      } else {
        await fetchDealRequests();
      }
    } catch (err) {
      console.error("Failed to mark deal request contacted", err);
      await fetchDealRequests();
    }
  };

  const markClosed = async (id: string) => {
    try {
      const res = await markDealRequestClosedApi(id);
      if (res.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, status: "closed" } : item
          )
        );
      } else {
        await fetchDealRequests();
      }
    } catch (err) {
      console.error("Failed to mark deal request closed", err);
      await fetchDealRequests();
    }
  };

  return { items, total, loading, error, query, setQuery, refetch: fetchDealRequests, markContacted, markClosed };
};
