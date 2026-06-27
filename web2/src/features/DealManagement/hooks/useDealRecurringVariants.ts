import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as dealsApi from '../api/deals.api';
import type { BulkGenerateVariantsDto } from '../dtos/deals.dtos';
import { getLocalDateStr } from '../../../lib/date-utils';

interface UseDealRecurringVariantsParams {
  dealId: string;
  onSubmit: (data: BulkGenerateVariantsDto) => Promise<void>;
  onSuccess: () => void;
}

export function useDealRecurringVariants({
  dealId,
  onSubmit,
  onSuccess,
}: UseDealRecurringVariantsParams) {
  const [form, setForm] = useState<BulkGenerateVariantsDto>({
    dealId,
    repeatType: 'daily',
    daysOfWeek: [],
    interval: 2,
    startDate: '',
    endDate: '',
    timeOfDay: '09:00',
    totalSlots: 3,
  });
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictingDates, setConflictingDates] = useState<string[]>([]);

  const today = useMemo(() => getLocalDateStr(new Date()), []);

  const maxEndDate = useMemo(() => {
    if (!form.startDate) return undefined;
    const d = new Date(form.startDate);
    d.setDate(d.getDate() + 14);
    return getLocalDateStr(d);
  }, [form.startDate]);

  const handlePreview = useCallback(async () => {
    // Validation for preview
    if (!form.startDate) return;
    if (form.repeatType !== 'once' && !form.endDate) return;

    setError(null);
    setPreviewLoading(true);
    setConflictingDates([]);

    try {
      const data: BulkGenerateVariantsDto = {
        ...form,
        startDate: getLocalDateStr(form.startDate),
        endDate:
          form.repeatType === 'once'
            ? getLocalDateStr(form.startDate)
            : getLocalDateStr(form.endDate),
      };

      // Unified preview and conflict check
      const result = await dealsApi.previewBulkGenerateVariants(data);

      setPreviewDates(result.dates);
      setConflictingDates(result.conflicts);

      if (result.conflicts.length > 0) {
        setError('Some selected dates already have variants. Please choose different dates.');
      }
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to preview dates'
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [form]);

  // Auto-trigger preview when relevant fields change
  useEffect(() => {
    const isReady =
      form.repeatType === 'once' ? !!form.startDate : !!form.startDate && !!form.endDate;

    if (isReady) {
      handlePreview();
    } else {
      setPreviewDates([]);
      setConflictingDates([]);
    }
  }, [
    form.startDate,
    form.endDate,
    form.repeatType,
    form.daysOfWeek,
    form.interval,
    form.timeOfDay,
    handlePreview,
  ]);

  const toggleDay = useCallback((day: number) => {
    setForm((f) => {
      const current = f.daysOfWeek || [];
      return {
        ...f,
        daysOfWeek: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
      };
    });
  }, []);

  const generateVariants = useCallback(async () => {
    if (!form.startDate || (form.repeatType !== 'once' && !form.endDate)) {
      setError('Required dates are missing');
      return;
    }
    if (conflictingDates.length > 0) {
      setError('Cannot create: One or more dates already have variants');
      return;
    }
    if (new Date(form.startDate) < new Date(today)) {
      setError('Start date cannot be in the past');
      return;
    }
    if (form.totalSlots < 1 || form.totalSlots > 15) {
      setError('Slots per variant must be between 1 and 15');
      return;
    }
    if (previewDates.length > 15) {
      setError(
        'Cannot generate more than 15 variants at once. Please narrow your date range or interval.'
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        startDate: getLocalDateStr(form.startDate),
        endDate:
          form.repeatType === 'once'
            ? getLocalDateStr(form.startDate)
            : getLocalDateStr(form.endDate),
      });
      onSuccess();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to create rule'
      );
    } finally {
      setLoading(false);
    }
  }, [form, conflictingDates, today, previewDates, onSubmit, onSuccess]);

  return {
    form,
    previewDates,
    previewLoading,
    loading,
    error,
    conflictingDates,
    today,
    maxEndDate,
    setForm,
    setError,
    setPreviewDates,
    setConflictingDates,
    toggleDay,
    generateVariants,
  };
}
