import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import * as dealsApi from '../api/deals.api';
import {
  bulkGenerateVariantsSchema,
} from '../dtos/deals.dtos';
import type { BulkGenerateVariantsDto, VariantsQueryDto } from '../dtos/deals.dtos';
import type {
  IDealVariant,
  IBulkGenerateResult,
  IBulkPreviewResult,
  ICalendarDay,
} from '../types/deals.types';
import { ErrorHandler } from '../../../utils/error-handler';

// ─── Helpers ───

const buildCalendarGrid = (year: number, month: number, variants: IDealVariant[]): ICalendarDay[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const variantsByDate = new Map<string, IDealVariant[]>();
  for (const v of variants) {
    if (!v.startDatetime) continue;
    const key = new Date(v.startDatetime).toISOString().split('T')[0];
    const existing = variantsByDate.get(key) ?? [];
    existing.push(v);
    variantsByDate.set(key, existing);
  }

  const days: ICalendarDay[] = [];
  const startPad = firstDay.getDay();
  for (let i = startPad - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({ date, dateStr, isCurrentMonth: false, isToday: false, isPast: date < today, variants: [] });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date,
      dateStr,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today,
      variants: variantsByDate.get(dateStr) ?? [],
    });
  }
  return days;
};

interface UseDealAvailabilityReturn {
  variants: IDealVariant[];
  calendarDays: ICalendarDay[];
  calendarYear: number;
  calendarMonth: number;
  loading: boolean;
  bulkLoading: boolean;
  previewLoading: boolean;
  error: string | null;
  bulkPreview: IBulkPreviewResult | null;
  bulkForm: ReturnType<typeof useForm<BulkGenerateVariantsDto>>;
  actions: {
    fetchVariants: (params?: VariantsQueryDto) => Promise<void>;
    navigateMonth: (direction: 1 | -1) => void;
    onBulkPreview: (data: BulkGenerateVariantsDto) => Promise<void>;
    onBulkGenerate: (data: BulkGenerateVariantsDto) => Promise<IBulkGenerateResult>;
    clearPreview: () => void;
  };
}

/**
 * USE-CASE: Deal availability / calendar screen (DealAvailabilityPage.tsx).
 * Manages calendar grid, variant filtering, and bulk generation flow.
 */
export function useDealAvailability(dealId: string): UseDealAvailabilityReturn {
  const today = new Date();
  const [variants, setVariants] = useState<IDealVariant[]>([]);
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkPreview, setBulkPreview] = useState<IBulkPreviewResult | null>(null);

  const bulkForm = useForm<BulkGenerateVariantsDto>({
    resolver: zodResolver(bulkGenerateVariantsSchema),
    defaultValues: { dealId, repeatType: 'once', totalSlots: 1 },
  });

  const fetchVariants = useCallback(
    async (params?: VariantsQueryDto) => {
      setLoading(true);
      setError(null);
      try {
        const data = await dealsApi.getVariantsByDeal(dealId, params);
        setVariants(data);
      } catch (err) {
        setError(ErrorHandler.getErrorMessage(err, 'Failed to load variants'));
      } finally {
        setLoading(false);
      }
    },
    [dealId]
  );

  const navigateMonth = useCallback((direction: 1 | -1) => {
    setCalendarMonth((prev) => {
      const newMonth = prev + direction;
      if (newMonth > 11) {
        setCalendarYear((y) => y + 1);
        return 0;
      }
      if (newMonth < 0) {
        setCalendarYear((y) => y - 1);
        return 11;
      }
      return newMonth;
    });
  }, []);

  const onBulkPreview = useCallback(async (data: BulkGenerateVariantsDto) => {
    setPreviewLoading(true);
    setBulkPreview(null);
    try {
      const result = await dealsApi.previewBulkGenerateVariants(data);
      setBulkPreview(result);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'Preview failed' });
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const onBulkGenerate = useCallback(
    async (data: BulkGenerateVariantsDto): Promise<IBulkGenerateResult> => {
      setBulkLoading(true);
      try {
        const result = await dealsApi.bulkGenerateVariants(data);
        toast.success(`Generated ${result.generatedCount} variant(s)`);
        await fetchVariants();
        setBulkPreview(null);
        return result;
      } catch (err) {
        ErrorHandler.handle(err, { fallbackMessage: 'Bulk generation failed' });
        throw err;
      } finally {
        setBulkLoading(false);
      }
    },
    [fetchVariants]
  );

  const clearPreview = useCallback(() => setBulkPreview(null), []);

  const calendarDays = buildCalendarGrid(calendarYear, calendarMonth, variants);

  return {
    variants,
    calendarDays,
    calendarYear,
    calendarMonth,
    loading,
    bulkLoading,
    previewLoading,
    error,
    bulkPreview,
    bulkForm,
    actions: { fetchVariants, navigateMonth, onBulkPreview, onBulkGenerate, clearPreview },
  };
}
