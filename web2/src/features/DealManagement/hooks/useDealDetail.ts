import { useState, useCallback, useEffect } from 'react';
import * as dealsApi from '../api/deals.api';
import type { IDeal, IDealVariant } from '../types/deals.types';
import type { UpdateVariantDto, VariantsQueryDto } from '../dtos/deals.dtos';
import { ErrorHandler } from '../../../utils/error-handler';

interface UseDealDetailReturn {
  deal: IDeal | null;
  variants: IDealVariant[];
  loading: boolean;
  variantsLoading: boolean;
  error: string | null;
  actions: {
    refetchDeal: () => Promise<void>;
    fetchVariants: (params?: VariantsQueryDto) => Promise<void>;
    updateVariant: (id: string, data: UpdateVariantDto) => Promise<IDealVariant>;
    cancelVariant: (id: string) => Promise<IDealVariant>;
    restoreVariant: (id: string) => Promise<IDealVariant>;
    cancelSlot: (slotId: string) => Promise<void>;
    restoreSlot: (slotId: string) => Promise<void>;
  };
}

/**
 * USE-CASE: Deal detail screen (DealDetailsPage.tsx).
 * Loads deal + variants, handles all variant/slot mutation actions.
 */
export function useDealDetail(dealId: string | null): UseDealDetailReturn {
  const [deal, setDeal] = useState<IDeal | null>(null);
  const [variants, setVariants] = useState<IDealVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchDeal = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dealsApi.getDeal(dealId);
      setDeal(data);
    } catch (err) {
      setError(ErrorHandler.getErrorMessage(err, 'Failed to load deal'));
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const fetchVariants = useCallback(
    async (params?: VariantsQueryDto) => {
      if (!dealId) return;
      setVariantsLoading(true);
      try {
        const data = await dealsApi.getVariantsByDeal(dealId, params);
        setVariants(data);
      } catch (err) {
        setError(ErrorHandler.getErrorMessage(err, 'Failed to load variants'));
      } finally {
        setVariantsLoading(false);
      }
    },
    [dealId]
  );

  useEffect(() => {
    refetchDeal();
  }, [refetchDeal]);

  const updateVariant = useCallback(
    async (id: string, data: UpdateVariantDto): Promise<IDealVariant> => {
      const updated = await dealsApi.updateVariant(id, data);
      setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
      return updated;
    },
    []
  );

  const cancelVariant = useCallback(async (id: string): Promise<IDealVariant> => {
    const cancelled = await dealsApi.cancelVariant(id);
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? cancelled : v))
    );
    return cancelled;
  }, []);

  const restoreVariant = useCallback(async (id: string): Promise<IDealVariant> => {
    const restored = await dealsApi.restoreVariant(id);
    setVariants((prev) => prev.map((v) => (v.id === id ? restored : v)));
    return restored;
  }, []);

  const cancelSlot = useCallback(
    async (slotId: string) => {
      try {
        await dealsApi.cancelSlot(slotId);
        if (dealId) await fetchVariants();
      } catch (err) {
        ErrorHandler.handle(err);
      }
    },
    [dealId, fetchVariants]
  );

  const restoreSlot = useCallback(
    async (slotId: string) => {
      try {
        await dealsApi.restoreSlot(slotId);
        if (dealId) await fetchVariants();
      } catch (err) {
        ErrorHandler.handle(err);
      }
    },
    [dealId, fetchVariants]
  );

  return {
    deal,
    variants,
    loading,
    variantsLoading,
    error,
    actions: {
      refetchDeal,
      fetchVariants,
      updateVariant,
      cancelVariant,
      restoreVariant,
      cancelSlot,
      restoreSlot,
    },
  };
}
