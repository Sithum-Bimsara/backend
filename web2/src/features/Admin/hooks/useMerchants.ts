import { useCallback, useEffect, useState } from "react";
import {
  getMerchants,
  verifyMerchant as verifyMerchantApi,
  unverifyMerchant as unverifyMerchantApi,
  getMerchantDetails,
  updateDealAdmin as updateDealAdminApi,
} from "../api/api";
import type {
  AdminMerchantListItem,
  MerchantDetailsResponse,
  MerchantListQuery,
} from "../types/admin.types";

const defaultPageSize = 10;

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

export const useMerchants = (initialQuery?: MerchantListQuery) => {
  const [query, setQuery] = useState<MerchantListQuery>({ page: 1, limit: defaultPageSize, ...initialQuery });
  const [items, setItems] = useState<AdminMerchantListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMerchants(query);
      if (res.success) {
        setItems(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      setError(parseError(err, "Failed to load merchants"));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const verifyMerchant = async (id: string) => {
    try {
      const res = await verifyMerchantApi(id);
      if (res.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, verificationStatus: "verified" } : item
          )
        );
      } else {
        await fetchMerchants();
      }
    } catch (err) {
      console.error("Failed to verify merchant", err);
      await fetchMerchants();
    }
  };

  const unverifyMerchant = async (id: string) => {
    try {
      const res = await unverifyMerchantApi(id);
      if (res.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, verificationStatus: "pending" } : item
          )
        );
      } else {
        await fetchMerchants();
      }
    } catch (err) {
      console.error("Failed to unverify merchant", err);
      await fetchMerchants();
    }
  };

  return { items, total, loading, error, query, setQuery, refetch: fetchMerchants, verifyMerchant, unverifyMerchant };
};

export const useMerchantDetails = (id: string | undefined, initialQuery?: { startDate?: string; endDate?: string }) => {
  const [query, setQuery] = useState(initialQuery || {});
  const [data, setData] = useState<MerchantDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchantDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getMerchantDetails(id, query);
      if (res.success) setData(res.data);
    } catch (err) {
      setError(parseError(err, "Failed to load merchant details"));
    } finally {
      setLoading(false);
    }
  }, [id, query]);

  useEffect(() => {
    fetchMerchantDetails();
  }, [fetchMerchantDetails]);

  const setDisplayPrice = async (dealId: string, displayedPrice: number) => {
    await updateDealAdminApi(dealId, { displayedPrice });
    await fetchMerchantDetails();
  };

  return { data, loading, error, query, setQuery, refetch: fetchMerchantDetails, setDisplayPrice };
};
