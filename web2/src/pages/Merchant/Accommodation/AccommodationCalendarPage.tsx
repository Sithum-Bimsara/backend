import React from 'react';
import { MerchantActionButton } from '../../../features/MerchantProfile/components/MerchantUI';
import AccommodationTabs from '../../../components/MerchantTabs/MerchantTabs';
import AvailabilityLegend from '../../../components/Calendar/AvailabilityLegend';
import RefreshButton from '../../../components/Calendar/RefreshButton';
import AddAvailabilityButton from '../../../components/Calendar/AddAvailabilityButton';
import UnitSelectorPills from '../../../features/Accommodation/components/UnitSelectorPills';
import BulkUpdateModal from '../../../components/Calendar/BulkUpdateModal';
import SlotDetailModal from '../../../components/Calendar/SlotDetailModal';
import CalendarHeader from '../../../components/Calendar/CalendarHeader';
import CalendarDayHeader from '../../../components/Calendar/CalendarDayHeader';
import CalendarDayColumn from '../../../components/Calendar/CalendarDayColumn';
import { useAccommodationCalendar } from '../../../features/Accommodation/hooks/useAccommodationCalendar';
import { getLocalDateStr } from '../../../lib/date-utils';
import { getSriLankaTime } from '../../../lib/timezone';
import { AccommodationCalendarSkeleton } from '../../../features/Accommodation/components/AccommodationCalendarSkeleton';

interface Props {
  propertyId: string;
  onBack: () => void;
  onNavigate: (tab: 'details' | 'calendar' | 'bookings') => void;
}

const AccommodationCalendarPage: React.FC<Props> = ({ propertyId, onBack, onNavigate }) => {
  const {
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
    handleUnitChange,
    handleRefresh,
    handlePrevPeriod,
    handleNextPeriod,
    handleBlockSlot,
    handleRestoreSlot,
    handleBulkUpdate,
  } = useAccommodationCalendar(propertyId);

  if (loading && !property) {
    return (
      <div className="flex flex-col bg-(--app-bg) flex-1 min-h-0">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-3">
              <MerchantActionButton onClick={onBack} variant="secondary">Back</MerchantActionButton>
              <div className="h-5 bg-slate-200 rounded w-48 animate-pulse ml-2"></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-slate-50 gap-4">
              <AccommodationTabs activeTab="calendar" onNavigate={onNavigate} />
            </div>
          </div>
        </div>
        <AccommodationCalendarSkeleton />
      </div>
    );
  }

  if (error || !property) return <div>{error || 'Error loading property'}</div>;

  return (
    <div className="flex flex-col bg-(--app-bg) flex-1 min-h-0">
      {/* Sticky Header — Matches DealPageHeader Style */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Row: Actions & Title */}
          <div className="flex items-center gap-3 py-3">
            {/* Back Button */}
            <MerchantActionButton onClick={onBack} variant="secondary">
              Back
            </MerchantActionButton>

            {/* Title & Status */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h1 className="text-sm font-bold text-slate-800 truncate">
                {property.name}
              </h1>
              <span className={`shrink-0 inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${property.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${property.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {property.isActive ? 'Active' : 'Draft'}
              </span>

              <RefreshButton
                onClick={handleRefresh}
                isLoading={inventoryLoading}
              />
            </div>

            <AddAvailabilityButton onClick={() => setShowBulkModal(true)} />
          </div>

          {/* Bottom Row: Tabs & Unit Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-slate-50 gap-4">
            {/* Left: Navigation Tabs */}
            <AccommodationTabs activeTab="calendar" onNavigate={onNavigate} />

            <UnitSelectorPills
              units={property.units}
              selectedUnitId={selectedUnitId}
              onUnitChange={handleUnitChange}
              isHotel={isHotel}
            />
          </div>
        </div>
      </div>



      <div className="px-4 lg:px-8 py-6 relative flex-1 min-h-0 flex flex-col">
        {/* Right: Calendar Grid */}
        <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
          <CalendarHeader
            startDate={startDate}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
            onToday={() => {
              const slDate = getSriLankaTime();
              slDate.setHours(0, 0, 0, 0);
              const day = slDate.getDay();
              slDate.setDate(slDate.getDate() - day);
              setStartDate(slDate);
            }}
          />

          <AvailabilityLegend />


          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <div className="grid grid-cols-7 grid-rows-[auto_1fr] h-full min-w-140 sm:min-w-0">
              {calendarDays.map((date, idx) => {
                const isToday = getSriLankaTime().toDateString() === date.toDateString();

                return (
                  <CalendarDayHeader
                    key={idx}
                    date={date}
                    isToday={isToday}
                  />
                );
              })}

              {calendarDays.map((date, idx) => {
                const dateStr = getLocalDateStr(date);
                const dayInventory = Array.isArray(inventory) ? inventory.find(inv => getLocalDateStr(inv?.date) === dateStr) : null;
                const isToday = getSriLankaTime().toDateString() === date.toDateString();

                const today = getSriLankaTime();
                today.setHours(0, 0, 0, 0);
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0);
                const isPast = compareDate < today;

                return (
                  <CalendarDayColumn
                    key={idx}
                    isToday={isToday}
                    isPast={isPast}
                    inventoryLoading={inventoryLoading}
                    dayInventory={dayInventory}
                    onSelectSlot={(inv, slot, sIdx) => setSelectedSlot({ inventory: inv, slot, index: sIdx })}
                  />
                );
              })}
            </div>
          </div>
          <SlotDetailModal
            selectedSlot={selectedSlot}
            onClose={() => setSelectedSlot(null)}
            onBlockSlot={handleBlockSlot}
            onRestoreSlot={handleRestoreSlot}
            slotProcessing={slotProcessing}
            initiateChat={initiateChat}
            isInitiatingChat={isInitiating}
            selectedUnitRate={selectedUnit?.pricePerNight || '—'}
          />
        </div>

        <BulkUpdateModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          bulkData={bulkData}
          setBulkData={setBulkData}
          bulkError={bulkError}
          todayStr={todayStr}
          maxEndDate={maxEndDate}
          previewLoading={previewLoading}
          previewDates={previewDates}
          conflictingDates={conflictingDates}
          onUpdate={handleBulkUpdate}
          isHotel={isHotel}
          selectedUnitTotalInventory={selectedUnit?.totalInventory}
        />

      </div>
    </div>
  );
};

export default AccommodationCalendarPage;
