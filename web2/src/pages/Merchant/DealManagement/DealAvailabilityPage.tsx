import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDealDetail } from '../../../features/DealManagement/hooks/useDealDetail';
import { useDealAvailability } from '../../../features/DealManagement/hooks/useDealAvailability';
import EditVariantModal from '../../../features/DealManagement/components/EditVariantModal';
import RecurringRuleModal from '../../../features/DealManagement/components/RecurringRuleModal';
import type { IDealVariant } from '../../../features/DealManagement/types/deals.types';
import { getLocalDateStr } from '../../../lib/date-utils';
import { MerchantConfirmModal, MerchantManageAvailabilitySkeleton } from '../../../features/MerchantProfile/components/MerchantUI';
import DealPageHeader from '../../../features/DealManagement/components/DealPageHeader';
import { ErrorHandler } from '../../../utils/error-handler';

// Modular Calendar Components
import CalendarHeader from '../../../components/Calendar/CalendarHeader';
import AvailabilityLegend from '../../../components/Calendar/AvailabilityLegend';
import CalendarDayHeader from '../../../components/Calendar/CalendarDayHeader';
import DealCalendarDayColumn from '../../../features/DealManagement/components/DealCalendarDayColumn';
import type { SlotData } from '../../../features/DealManagement/components/DealCalendarDayColumn';
import DealSlotDetailModal from '../../../features/DealManagement/components/DealSlotDetailModal';

interface Props {
  dealId: string;
  onBack: () => void;
  onNavigate: (tab: 'details' | 'availability' | 'bookings') => void;
}

const DealAvailabilityPage: React.FC<Props> = ({ dealId, onBack, onNavigate }) => {
  const { deal, loading: dealLoading } = useDealDetail(dealId);
  const {
    variants,
    loading: variantsLoading,
    actions: {
      fetchVariants,
      updateVariant,
      cancelVariant,
      restoreVariant,
      cancelSlot,
      restoreSlot,
    },
  } = useDealDetail(dealId);
  const { actions: availActions } = useDealAvailability(dealId);

  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<IDealVariant | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    variant: IDealVariant;
    slot: SlotData;
    index: number;
  } | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string; tone?: 'danger' | 'warning' | 'teal' | 'primary' } | null>(null);
  
  // Lifted Calendar State
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const sunday = new Date(now.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const handlePrevWeek = useCallback(() => {
    setCalendarStartDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCalendarStartDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  }, []);

  const handleGoToToday = useCallback(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    const sunday = new Date(now.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    setCalendarStartDate(sunday);
  }, []);

  const handleRefresh = useCallback(() => {
    const end = new Date(calendarStartDate);
    end.setDate(calendarStartDate.getDate() + 6);
    fetchVariants({ startDate: getLocalDateStr(calendarStartDate), endDate: getLocalDateStr(end) });
  }, [calendarStartDate, fetchVariants]);

  useEffect(() => {
    const end = new Date(calendarStartDate);
    end.setDate(calendarStartDate.getDate() + 6);
    
    const startStr = getLocalDateStr(calendarStartDate);
    const endStr = getLocalDateStr(end);
    
    fetchVariants({ startDate: startStr, endDate: endStr });
  }, [calendarStartDate, fetchVariants]);

  // Listen for the "Add Availability" button in the shared header
  useEffect(() => {
    const handleOpen = () => setShowRecurringModal(true);
    window.addEventListener('open-add-availability', handleOpen);
    return () => window.removeEventListener('open-add-availability', handleOpen);
  }, []);

  const calendarDays = useMemo(() => {
    const days: { date: Date; dateStr: string; isToday: boolean; isPast: boolean; variants: IDealVariant[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(calendarStartDate);
      date.setDate(calendarStartDate.getDate() + i);
      const dateStr = getLocalDateStr(date);

      const dayVariants = variants.filter((v) => {
        if (!v.startDatetime) return false;
        return getLocalDateStr(new Date(v.startDatetime)) === dateStr;
      });

      days.push({
        date,
        dateStr,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        variants: dayVariants,
      });
    }

    return days;
  }, [calendarStartDate, variants]);

  const handleVariantAction = async (
    action: (id: string) => Promise<IDealVariant | void>,
    id: string,
    successAction?: () => void
  ) => {
    try {
      await action(id);
      successAction?.();
    } catch (err: unknown) {
      const message = ErrorHandler.getErrorMessage(err, 'Failed to perform action');
      setNotification({ title: 'Action Failed', message, tone: 'danger' });
      throw err; // Propagate for local loading states if needed
    }
  };

  if (dealLoading) return <MerchantManageAvailabilitySkeleton />;
  if (!deal) return <div className="p-8 text-center text-slate-400">Deal not found</div>;

  return (
    <div className="flex flex-col bg-(--app-bg) overflow-hidden h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-1.5rem)]">
      <DealPageHeader
        deal={deal}
        onBack={onBack}
        activeTab="availability"
        onTabChange={onNavigate}
        onRefresh={handleRefresh}
        isRefreshing={variantsLoading}
      />

      <div className="px-4 lg:px-8 py-6 relative flex-1 min-h-0 flex flex-col">
        {/* Modular Calendar Grid matching Accommodation */}
        <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
          <CalendarHeader
            startDate={calendarStartDate}
            onPrevPeriod={handlePrevWeek}
            onNextPeriod={handleNextWeek}
            onToday={handleGoToToday}
          />

          <AvailabilityLegend />

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <div className="grid grid-cols-7 grid-rows-[auto_1fr] h-full min-w-140 sm:min-w-0">
              {calendarDays.map((day, idx) => (
                <CalendarDayHeader
                  key={`header-${idx}`}
                  date={day.date}
                  isToday={day.isToday}
                />
              ))}

              {calendarDays.map((day, idx) => (
                <DealCalendarDayColumn
                  key={`col-${idx}`}
                  isToday={day.isToday}
                  isPast={day.isPast}
                  isLoading={variantsLoading}
                  variants={day.variants}
                  onVariantClick={setEditingVariant}
                  onSelectSlot={(variant, slot, index) => setSelectedSlot({ variant, slot, index })}
                />
              ))}
            </div>
          </div>
          
          <DealSlotDetailModal
            selectedSlot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onCancelVariant={(id) => handleVariantAction(cancelVariant, id, () => setSelectedSlot(null))}
            onRestoreVariant={(id) => handleVariantAction(restoreVariant, id, () => setSelectedSlot(null))}
            onCancelSlot={(id) => handleVariantAction(cancelSlot, id, () => setSelectedSlot(null))}
            onRestoreSlot={(id) => handleVariantAction(restoreSlot, id, () => setSelectedSlot(null))}
          />
        </div>
      </div>

      {/* Global Notification Modal */}
      <MerchantConfirmModal
        isOpen={!!notification}
        title={notification?.title || ''}
        message={notification?.message || ''}
        tone={notification?.tone}
        confirmLabel="Got it"
        hideCancel
        onConfirm={() => {
          setNotification(null);
          handleRefresh();
        }}
        onCancel={() => {
          setNotification(null);
          handleRefresh();
        }}
      />

      {/* Modals */}
      {editingVariant && (
        <EditVariantModal
          variant={editingVariant}
          dealIsActive={deal.isActive}
          isLocalOnly={deal.isLocalOnly}
          currency={deal.currency}
          onSubmit={async (id, data) => {
            await handleVariantAction((vId) => updateVariant(vId, data), id, () => setEditingVariant(null));
          }}
          onClose={() => setEditingVariant(null)}
        />
      )}

      {showRecurringModal && (
        <RecurringRuleModal
          dealId={dealId}
          dealIsActive={deal.isActive}
          isLocalOnly={deal.isLocalOnly}
          currency={deal.currency}
          onSubmit={async (data) => {
            try {
              await availActions.onBulkGenerate(data);
              setShowRecurringModal(false);
            } catch (err: unknown) {
              const message = ErrorHandler.getErrorMessage(err, 'Failed to generate availability');
              setShowRecurringModal(false);
              setNotification({ title: 'Action Failed', message, tone: 'danger' });
            }
          }}
          onClose={() => setShowRecurringModal(false)}
        />
      )}
    </div>
  );
};

export default DealAvailabilityPage;
