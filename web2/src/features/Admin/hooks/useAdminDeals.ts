import { useCallback, useEffect, useState } from "react";
import {
  getAdminDeals,
  getAdminDealDetail,
  updateDealAdmin as updateDealAdminApi,
  updateVariantPrice as updateVariantPriceApi,
} from "../api/api";
import type {
  AdminDealListItem,
  AdminDealDetail,
  DealListQuery,
} from "../types/admin.types";

const defaultPageSize = 10;

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

export const useAdminDeals = (merchantId: string | undefined, initialQuery?: Omit<DealListQuery, "merchantId">) => {
  const [query, setQuery] = useState<Omit<DealListQuery, "merchantId">>({ page: 1, limit: defaultPageSize, ...initialQuery });
  const [items, setItems] = useState<AdminDealListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    if (!merchantId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDeals(merchantId, query);
      if (res.success) {
        setItems(res.items);
        setTotal(res.items.length);
      }
    } catch (err) {
      setError(parseError(err, "Failed to load deals"));
    } finally {
      setLoading(false);
    }
  }, [merchantId, query]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return { items, total, loading, error, query, setQuery, refetch: fetchDeals };
};

export const useAdminDealDetail = (dealId: string | undefined) => {
  const [data, setData] = useState<AdminDealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchDeal = useCallback(async () => {
    if (!dealId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDealDetail(dealId);
      if (res.success) setData(res.data);
    } catch (err) {
      setError(parseError(err, "Failed to load deal"));
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const saveDeal = async (payload: { displayedPrice?: number; originalPrice?: number; isActive?: boolean }) => {
    if (!dealId) return;
    try {
      setSaving(true);
      setSaveError(null);
      await updateDealAdminApi(dealId, payload);
      await fetchDeal();
    } catch (err) {
      setSaveError(parseError(err, "Failed to save changes"));
    } finally {
      setSaving(false);
    }
  };

  const saveVariantPrice = async (variantId: string, displayedPrice: number) => {
    try {
      setSaving(true);
      setSaveError(null);
      await updateVariantPriceApi(variantId, { displayedPrice });
      await fetchDeal();
    } catch (err) {
      setSaveError(parseError(err, "Failed to update variant price"));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, error, saving, saveError, refetch: fetchDeal, saveDeal, saveVariantPrice };
};
