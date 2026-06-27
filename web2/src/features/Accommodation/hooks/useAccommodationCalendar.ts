import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BulkInventoryUpdateDto } from '../dtos/accommodation.dto';
import type { IAccommodationView, IRoomInventory } from '../types/accommodation.types';
import { getPropertyById, getRoomInventory, updateBulkInventory, previewBulkInventoryUpdate, blockRoomSlot, restoreRoomSlot } from '../api/accommodation.api';
import { getLocalDateStr } from '../../../lib/date-utils';
import { getSriLankaTime } from '../../../lib/timezone';
import { useChat } from '../../Chat/ChatContext';
import { ErrorHandler } from '../../../utils/error-handler';

export interface SelectedCalendarSlot {
  inventory: IRoomInventory;
  slot: NonNullable<IRoomInventory['slots']>[0];
  index: number;
}

export const useAccommodationCalendar = (propertyId: string) => {
  const [property, setProperty] = useState<IAccommodationView | null>(null);
  const [inventory, setInventory] = useState<IRoomInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initiateChat, isInitiating } = useChat();
  const [startDate, setStartDate] = useState(() => {
    const slDate = getSriLankaTime();
    slDate.setHours(0, 0, 0, 0);
    const day = slDate.getDay();
    slDate.setDate(slDate.getDate() - day);
    return slDate;
  });
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState<Partial<BulkInventoryUpdateDto>>({
    status: 'available',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  });
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [conflictingDates, setConflictingDates] = useState<string[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [slotProcessing, setSlotProcessing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedCalendarSlot | null>(null);

  const fetchInventory = useCallback(async (unitId: string, start: Date) => {
    try {
      setInventoryLoading(true);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const data = await getRoomInventory(propertyId, unitId, start.toISOString(), end.toISOString());
      setInventory(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: 'Failed to fetch inventory' });
    } finally {
      setInventoryLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const data = await getPropertyById(propertyId);
        setProperty(data);

        if (data.units && data.units.length > 0) {
          setSelectedUnitId(data.units[0].id);
        }
      } catch (err: unknown) {
        const msg = ErrorHandler.getErrorMessage(err, 'Failed to load property');
        setError(msg);
        ErrorHandler.handle(err, { showToast: true, fallbackMessage: msg });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [propertyId]);

  useEffect(() => {
    if (selectedUnitId && startDate) {
      fetchInventory(selectedUnitId, startDate);
    }
  }, [selectedUnitId, startDate, fetchInventory]);

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const handleRefresh = useCallback(() => {
    if (selectedUnitId && startDate) {
      fetchInventory(selectedUnitId, startDate);
    }
  }, [selectedUnitId, startDate, fetchInventory]);

  const handlePrevPeriod = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - 7);
    setStartDate(d);
  };

  const handleNextPeriod = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 7);
    setStartDate(d);
  };

  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, [startDate]);

  const todayStr = getLocalDateStr(getSriLankaTime());

  const maxEndDate = useMemo(() => {
    if (!bulkData.startDate) return undefined;
    const d = getSriLankaTime(bulkData.startDate as string);
    d.setDate(d.getDate() + 14);
    return getLocalDateStr(d);
  }, [bulkData.startDate]);

  const handlePreview = useCallback(async () => {
    if (!selectedUnitId || !bulkData.startDate || !bulkData.endDate) return;

    setBulkError(null);
    setPreviewLoading(true);
    setConflictingDates([]);

    try {
      const result = await previewBulkInventoryUpdate(propertyId, {
        ...bulkData,
        unitId: selectedUnitId,
        startDate: bulkData.startDate as string,
        endDate: bulkData.endDate as string,
      });

      const typedResult = (result || {}) as { dates?: string[]; conflicts?: string[] };
      const dates = typedResult.dates || [];
      const conflicts = typedResult.conflicts || [];
      
      setPreviewDates(dates);
      setConflictingDates(conflicts);

      if (conflicts.length > 0) {
        setBulkError('Some selected dates already have inventory configured. Please select another range.');
      }
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, 'Failed to preview dates');
      setBulkError(msg);
      ErrorHandler.handle(err, { showToast: false });
    } finally {
      setPreviewLoading(false);
    }
  }, [bulkData, selectedUnitId, propertyId]);

  useEffect(() => {
    if (bulkData.startDate && bulkData.endDate) {
      handlePreview();
    } else {
      setPreviewDates([]);
      setConflictingDates([]);
      setBulkError(null);
    }
  }, [bulkData.startDate, bulkData.endDate, handlePreview]);

  const handleBlockSlot = async (slotId: string) => {
    if (!selectedUnitId) return;
    setSlotProcessing(true);
    try {
      await blockRoomSlot(propertyId, slotId);
      fetchInventory(selectedUnitId, startDate);
      setSelectedSlot(null);
    } catch (err: unknown) {
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: 'Failed to block slot' });
    } finally {
      setSlotProcessing(false);
    }
  };

  const handleRestoreSlot = async (slotId: string) => {
    if (!selectedUnitId) return;
    setSlotProcessing(true);
    try {
      await restoreRoomSlot(propertyId, slotId);
      fetchInventory(selectedUnitId, startDate);
      setSelectedSlot(null);
    } catch (err: unknown) {
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: 'Failed to restore slot' });
    } finally {
      setSlotProcessing(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedUnitId || !bulkData.startDate || !bulkData.endDate) return;

    try {
      setInventoryLoading(true);
      await updateBulkInventory(propertyId, {
        ...bulkData,
        unitId: selectedUnitId,
        startDate: bulkData.startDate as string,
        endDate: bulkData.endDate as string,
      });
      setShowBulkModal(false);
      await fetchInventory(selectedUnitId, startDate);
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, 'Failed to update inventory');
      setBulkError(msg);
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: msg });
    } finally {
      setInventoryLoading(false);
    }
  };

  const selectedUnit = property?.units?.find((unit) => unit.id === selectedUnitId);
  const isHotel = property?.type === 'hotel';

  return {
    property,
    inventory,
    loading,
    inventoryLoading,
    error,
    initiateChat,
    isInitiating,
    startDate,
    setStartDate,
    selectedUnitId,
    selectedUnit,
    isHotel,
    showBulkModal,
    setShowBulkModal,
    bulkData,
    setBulkData,
    previewDates,
    previewLoading,
    conflictingDates,
    bulkError,
    slotProcessing,
    selectedSlot,
    setSelectedSlot,
    todayStr,
    maxEndDate,
    calendarDays,
    fetchInventory,
    handleUnitChange,
    handleRefresh,
    handlePrevPeriod,
    handleNextPeriod,
    handleBlockSlot,
    handleRestoreSlot,
    handleBulkUpdate,
  };
};
