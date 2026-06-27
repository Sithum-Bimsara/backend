import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IUnit, IOccupancyPricing } from '../../../../types/accommodation.types';
import AccommodationSleepingConfig from './AccommodationSleepingConfig';
import RoomBathroomConfig from './RoomBathroomConfig';
import UnitPricingConfig from './UnitPricingConfig';
import ChildPricingConfig from './ChildPricingConfig';
import CancellationPolicy from './CancellationPolicy';
import RoomAmenitiesSelector from './RoomAmenitiesSelector';
import { MerchantActionButton } from '../../../../../MerchantProfile/components/MerchantUI';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: IUnit) => Promise<void>;
  initialUnit?: IUnit;
  isPricingLocked?: boolean;
}

const DEFAULT_RATE_PLAN = {
  cancellationWindow: '6pm_arrival' as const,
  cancellationFeeType: 'first_night' as const,
  accidentalBookingProtection: true,
  occupancyPricing: { enabled: false, discounts: [] },
  childPricing: {
    enabled: false,
    infantsFree: true,
    childrenFree: true,
    childrenAgeFrom: 3,
    childrenAgeTo: 10,
    infantFixedPrice: null,
    childFixedPrice: null,
  },
};

const DEFAULT_UNIT: IUnit = {
  id: '',
  name: 'Entire Place',
  type: 'bedroom',
  category: 'Apartment',
  maxGuests: 2,
  excludeInfants: false,
  roomType: null,
  cribsAvailable: false,
  bathrooms: 1,
  isBathroomPrivate: true,
  bathroomItems: ['Toilet paper', 'Shower', 'Toilet'],
  size: 0,
  smokingAllowed: false,
  pricePerNight: 0,
  localPrice: 0,
  nonLocalPrice: 0,
  totalInventory: 1,
  dealLockExpireTime: 1,
  amenities: ['Air conditioning', 'Flat-screen TV', 'Towels'],
  bedConfigurations: [],
  ratePlan: DEFAULT_RATE_PLAN,
} as unknown as IUnit;

const EntirePlaceInlineEditor: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialUnit,
  isPricingLocked 
}) => {
  const [unit, setUnit] = useState<IUnit>({ ...DEFAULT_UNIT, id: crypto.randomUUID() });
  const [isSaving, setIsSaving] = useState(false);

  // Sync initialUnit into state whenever the editor opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialUnit) {
        setUnit({
          ...initialUnit,
          bedConfigurations: initialUnit.bedConfigurations || [],
          bathroomItems: initialUnit.bathroomItems || ['Toilet paper', 'Shower', 'Toilet'],
          amenities: initialUnit.amenities || ['Air conditioning', 'Flat-screen TV', 'Towels'],
          ratePlan: initialUnit.ratePlan || DEFAULT_RATE_PLAN,
        });
      } else {
        setUnit({ ...DEFAULT_UNIT, id: crypto.randomUUID() });
      }
    }
  }, [isOpen, initialUnit]);

  const updateUnit = (patch: Partial<IUnit>) => setUnit(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(unit);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-[#0e2a47]">Edit Listing Details</h2>
                <p className="text-xs text-slate-500 font-medium">Configure your entire place listing from one place.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
              {/* Basic Info Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#2dd4af]/10 flex items-center justify-center text-[#2dd4af]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Sleeping & Capacity</h3>
                </div>
                <AccommodationSleepingConfig 
                  unit={unit}
                  onChange={updateUnit}
                />
              </section>

              <hr className="border-slate-100" />

              {/* Bathroom Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 2v3M16 2v3M3 7h18M3 7l1 13a2 2 0 002 2h12a2 2 0 002-2l1-13" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Bathroom Details</h3>
                </div>
                <RoomBathroomConfig 
                  isPrivate={unit.isBathroomPrivate}
                  items={unit.bathroomItems || []}
                  onChange={(p) => updateUnit({ 
                    isBathroomPrivate: p.isPrivate, 
                    bathroomItems: p.items 
                  })}
                />
              </section>

              <hr className="border-slate-100" />

              {/* Amenities Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Room Amenities</h3>
                </div>
                <RoomAmenitiesSelector 
                  value={unit.amenities}
                  onChange={(a) => updateUnit({ amenities: a })}
                />
              </section>

              <hr className="border-slate-100" />

              {/* Pricing Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 8v8M8 12h8" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Pricing & Rates</h3>
                </div>
                <UnitPricingConfig 
                  unit={{
                    ...unit,
                    occupancyPricing: unit.ratePlan?.occupancyPricing || { enabled: false, discounts: [] },
                  } as IUnit & { occupancyPricing: IOccupancyPricing }}
                  onChange={(patch) => {
                    if (patch.occupancyPricing) updateUnit({ ratePlan: { ...unit.ratePlan, occupancyPricing: patch.occupancyPricing } });
                    if (patch.pricePerNight !== undefined) updateUnit({ pricePerNight: patch.pricePerNight, localPrice: patch.localPrice, nonLocalPrice: patch.nonLocalPrice });
                  }}
                  isReadOnly={isPricingLocked}
                />
              </section>

              <hr className="border-slate-100" />

              {/* Child Pricing Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><circle cx="19" cy="8" r="3" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Child Policies</h3>
                </div>
                <ChildPricingConfig 
                  childPricing={unit.ratePlan.childPricing}
                  onChange={(c) => updateUnit({ 
                    ratePlan: { ...unit.ratePlan, childPricing: { ...unit.ratePlan.childPricing, ...c } } 
                  })}
                />
              </section>

              <hr className="border-slate-100" />

              {/* Cancellation Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Cancellation Policy</h3>
                </div>
                <CancellationPolicy 
                  value={unit.ratePlan || {}}
                  onChange={(p) => updateUnit({ 
                    ratePlan: { ...unit.ratePlan, ...p } 
                  })}
                  hideInventoryLock
                />
              </section>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                Discard Changes
              </button>
              <MerchantActionButton
                onClick={handleSave}
                disabled={isSaving}
                variant="primary"
              >
                {isSaving ? 'Saving Changes...' : 'Save All Details'}
              </MerchantActionButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EntirePlaceInlineEditor;
