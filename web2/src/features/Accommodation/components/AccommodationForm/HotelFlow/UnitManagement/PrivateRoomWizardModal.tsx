import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RoomAmenitiesSelector from "./RoomAmenitiesSelector";
import RoomBathroomConfig from "./RoomBathroomConfig";
import AccommodationSleepingConfig from "./AccommodationSleepingConfig";
import UnitPricingConfig from "./UnitPricingConfig";
import CancellationPolicy from "./CancellationPolicy";
import ChildPricingConfig from "./ChildPricingConfig";
import { MerchantConfirmModal } from "../../../../../MerchantProfile/components/MerchantUI";
import type { IRatePlan, IUnit, IOccupancyPricing } from "../../../../types/accommodation.types";
import CustomSelect from "../../../../../../components/Common/CustomSelect";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: IUnit) => void | Promise<void>;
  initialUnit?: IUnit;
  isPricingLocked?: boolean;
}

const ROOM_TYPES = ["double", "single", "twin", "twin/double", "triple", "quad", "family", "studio", "suite", "dormitory", "apartment", "dorm room", "bed in room"];

const ROOM_NAMES = [
  "Double Room", "Double Room with Private Bathroom", "Budget Double Room", "Business Double Room with Gym Access",
  "Deluxe Double Room", "Deluxe Double Room (1 adult + 1 child)", "Deluxe Double Room (1 adult + 2 children)",
  "Deluxe Double Room (2 Adults + 1 Child)", "Deluxe Double Room with Balcony", "Deluxe Double Room with Balcony and Sea View",
  "Deluxe Double Room with Bath", "Deluxe Double Room with Castle View", "Deluxe Double Room with Extra Bed",
  "Deluxe Double Room with Sea View", "Deluxe Double Room with Shower", "Deluxe Double Room with Side Sea View",
  "Deluxe Double or Twin Room", "Deluxe King Room", "Deluxe Queen Room", "Deluxe Room", "Double Room (1 Adult + 1 Child)",
  "Double Room - Disability Access", "Double Room with Balcony", "Double Room with Balcony (2 Adults + 1 Child)",
  "Double Room with Balcony (3 Adults)", "Double Room with Balcony and Sea View", "Double Room with Extra Bed",
  "Double Room with Garden View", "Double Room with Lake View", "Double Room with Mountain View", "Double Room with Patio",
  "Double Room with Pool View", "Double Room with Private External Bathroom", "Double Room with Sea View",
  "Double Room with Shared Bathroom", "Double Room with Shared Toilet", "Double Room with Spa Bath", "Double Room with Terrace",
  "Economy Double Room", "King Room", "King Room - Disability Access", "King Room with Balcony", "King Room with Garden View",
  "King Room with Lake View", "King Room with Mountain View", "King Room with Pool View", "King Room with Roll-In Shower - Disability Access",
  "King Room with Sea View", "King Room with Spa Bath", "Large Double Room", "Queen Room", "Queen Room - Disability Access",
  "Queen Room with Balcony", "Queen Room with Garden View", "Queen Room with Pool View", "Queen Room with Sea View",
  "Queen Room with Shared Bathroom", "Queen Room with Spa Bath", "Small Double Room", "Standard Double Room",
  "Standard Double Room with Fan", "Standard Double Room with Shared Bathroom", "Standard King Room", "Standard Queen Room",
  "Superior Double Room", "Superior King Room", "Superior Queen Room"
];

const DEFAULT_RATE_PLAN: IRatePlan = {
  cancellationWindow: "6pm_arrival",
  cancellationFeeType: "first_night",
  accidentalBookingProtection: true,
  occupancyPricing: { enabled: false, discounts: [] },
  childPricing: {
    enabled: true,
    infantsFree: true,
    childrenFree: true,
    childrenAgeFrom: 3,
    childrenAgeTo: 10,
    infantFixedPrice: null,
    childFixedPrice: null,
  },
};

const PrivateRoomWizardModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialUnit, isPricingLocked }) => {
  const [unit, setUnit] = useState<IUnit>(initialUnit || {
    id: crypto.randomUUID(),
    name: "",
    type: "room",
    category: "Double",
    maxGuests: 2,
    excludeInfants: false,
    roomType: "double",
    cribsAvailable: false,
    bathrooms: 1,
    isBathroomPrivate: true,
    bathroomItems: ["Toilet paper", "Shower", "Toilet"],
    size: 20,
    smokingAllowed: false,
    pricePerNight: 0,
    localPrice: 0,
    nonLocalPrice: 0,
    totalInventory: 0,
    dealLockExpireTime: 1,
    amenities: ["Air conditioning", "Flat-screen TV", "Towels"],
    bedConfigurations: [],
    ratePlan: DEFAULT_RATE_PLAN,
  });

  const TABS = [
    { id: "basics", label: "Basics" },
    { id: "beds", label: "Beds" },
    { id: "amenities", label: "Amenities" },
    { id: "bathroom", label: "Bathroom" },
    { id: "pricing_plans", label: "Pricing" },
    { id: "child_prices", label: "Child Prices" },
    { id: "inventory_cancellation", label: "Cancellation" }
  ] as const;

  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("basics");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialUnit) {
        setUnit({
          ...initialUnit,
          bedConfigurations: initialUnit.bedConfigurations || [],
          isBathroomPrivate: initialUnit.isBathroomPrivate ?? true,
          bathroomItems: initialUnit.bathroomItems || ["Toilet paper", "Shower", "Toilet"],
          amenities: initialUnit.amenities || ["Air conditioning", "Flat-screen TV", "Towels"],
          ratePlan: initialUnit.ratePlan || DEFAULT_RATE_PLAN,
        });
      } else {
        setUnit({
          id: crypto.randomUUID(),
          name: "",
          type: "room",
          category: "Double",
          maxGuests: 2,
          excludeInfants: false,
          roomType: "double",
          cribsAvailable: false,
          bathrooms: 1,
          isBathroomPrivate: true,
          bathroomItems: ["Toilet paper", "Shower", "Toilet"],
          size: 20,
          smokingAllowed: false,
          pricePerNight: 0,
          localPrice: 0,
          nonLocalPrice: 0,
          totalInventory: 0,
          dealLockExpireTime: 1,
          amenities: ["Air conditioning", "Flat-screen TV", "Towels"],
          bedConfigurations: [],
          ratePlan: DEFAULT_RATE_PLAN,
        });
      }
      setActiveTab("basics");
    }
  }, [isOpen, initialUnit]);

  React.useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeTab, isOpen]);

  const updateUnit = (patch: Partial<IUnit>) => setUnit(prev => ({ ...prev, ...patch }));

  const updateRatePlan = (patch: Partial<IRatePlan>) => {
    setUnit(prev => ({
      ...prev,
      ratePlan: { ...(prev.ratePlan || DEFAULT_RATE_PLAN), ...patch }
    }));
  };

  const validateCurrentTab = () => {
    const missingFields = [];
    if (activeTab === "basics") {
      if (!unit.roomType) missingFields.push("Room Type");
      if (!unit.name) missingFields.push("Room Name");
      if (!unit.maxGuests) missingFields.push("Max Occupancy");
      if (!unit.totalInventory) missingFields.push("Total Inventory");
    }
    if (activeTab === "beds" && (!unit.bedConfigurations || unit.bedConfigurations.length === 0)) {
      missingFields.push("Bed Configuration");
    }
    if (activeTab === "pricing_plans" && (!unit.pricePerNight || unit.pricePerNight <= 0)) {
      missingFields.push("Base Pricing");
    }
    if (activeTab === "child_prices") {
      const cp = unit.ratePlan?.childPricing;
      if (cp?.enabled) {
        if (!cp.infantsFree && (!cp.infantFixedPrice || cp.infantFixedPrice <= 0)) {
          missingFields.push("Infant Fixed Fee");
        }
        if (cp.childrenAgeFrom !== -1 && !cp.childrenFree && (!cp.childFixedPrice || cp.childFixedPrice <= 0)) {
          missingFields.push("Child Fixed Fee");
        }
      }
    }
    
    if (missingFields.length > 0) {
      setValidationError(`Please complete the following: ${missingFields.join(", ")}`);
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    setValidationError(null);
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex md:items-center justify-end md:bg-slate-900/40 md:backdrop-blur-sm">
      {/* Desktop Backdrop */}
      <div className="hidden md:block absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="h-full w-full md:max-w-5xl bg-white shadow-2xl overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden p-2 -ml-2 text-slate-400">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="space-y-0.5 md:space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">Configure Room</h2>
                <span className="md:hidden px-2 py-0.5 rounded-full bg-[#2dd4af]/10 text-[#2dd4af] text-[8px] font-bold uppercase">
                  Step {TABS.findIndex(t => t.id === activeTab) + 1} of {TABS.length}
                </span>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Detail your listing composition</p>
            </div>
          </div>
          <button onClick={onClose} className="hidden md:flex p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Layout Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Vertical Sidebar - Desktop Only */}
          <div className="hidden md:flex w-72 border-r border-slate-100 bg-slate-50/50 flex-col py-8 px-5 shrink-0 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isActive) return;
                      if (validateCurrentTab()) {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`w-full group flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all duration-200 border-2 ${
                      isActive 
                        ? "bg-white border-[#2dd4af] text-slate-900 shadow-lg shadow-[#2dd4af]/10" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-white hover:text-slate-600"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${
                      isActive ? "bg-[#2dd4af] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    }`}>
                      {idx + 1}
                    </div>
                    {tab.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2dd4af]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-8">
              <div className="p-5 rounded-2xl bg-[#2dd4af]/5 border border-[#2dd4af]/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2dd4af] text-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Tip</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Complete all sections to ensure your room listing is fully optimized for better visibility.</p>
              </div>
            </div>
          </div>

          {/* Content Area Container */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Mobile Tab Navigation */}
            <div className="md:hidden sticky top-0 z-10 flex justify-start px-4 border-b border-slate-100 bg-white/80 backdrop-blur-md overflow-x-auto hide-scrollbar shrink-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isActive) return;
                      if (validateCurrentTab()) {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`px-4 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
                      isActive ? "text-[#2dd4af]" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#2dd4af] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-10 custom-scrollbar">
              <AnimatePresence mode="wait">
                {validationError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wide">{validationError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
            {activeTab === "basics" && (
              <motion.div 
                key="basics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-10"
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Room Type</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 md:gap-2">
                      {ROOM_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => updateUnit({ roomType: type })}
                          className={`py-2.5 md:py-3 px-1 rounded-xl border text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
                            unit.roomType === type ? "border-[#2dd4af] bg-[#2dd4af]/5 text-slate-900 shadow-sm" : "border-slate-100 bg-white text-slate-400"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <CustomSelect
                    label="Room Name"
                    placeholder="Select a name"
                    searchable={true}
                    value={unit.name}
                    onChange={(name) => updateUnit({ name })}
                    options={ROOM_NAMES.map(name => ({ value: name, label: name }))}
                  />

                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Size (m²)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={unit.size || ""}
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => updateUnit({ size: Number(e.target.value) })}
                        className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:border-[#2dd4af] outline-none transition-all"
                        placeholder="e.g. 25"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Total Units</label>
                      <input 
                        type="number" 
                        min="1"
                        value={unit.totalInventory || ""}
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => updateUnit({ totalInventory: Number(e.target.value) })}
                        className="w-full h-10 md:h-12 px-4 md:px-5 rounded-lg border border-slate-200 bg-white text-xs md:text-sm font-medium text-slate-900 focus:border-[#2dd4af] outline-none transition-all"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "beds" && (
              <motion.div 
                key="beds"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <AccommodationSleepingConfig 
                  unit={unit} 
                  onChange={updateUnit}
                  isSingleRoom={true}
                />
              </motion.div>
            )}

            {activeTab === "amenities" && (
              <motion.div 
                key="amenities"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-8"
              >
                <RoomAmenitiesSelector 
                  value={unit.amenities || []}
                  onChange={(amenities) => updateUnit({ amenities })}
                />

                <div className="pt-4 md:pt-6 border-t border-slate-100">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Smoking Policy</label>
                  <div className="flex gap-3 md:gap-4">
                    {[
                      { id: true, label: "Allowed" },
                      { id: false, label: "Non-smoking" }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => updateUnit({ smokingAllowed: opt.id })}
                        className={`flex-1 h-10 md:h-12 rounded-xl border text-[10px] md:text-xs font-bold transition-all uppercase tracking-widest ${
                          unit.smokingAllowed === opt.id ? "border-[#2dd4af] bg-[#2dd4af]/5 text-slate-900 shadow-sm" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "bathroom" && (
              <motion.div 
                key="bathroom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <RoomBathroomConfig 
                  isPrivate={unit.isBathroomPrivate}
                  items={unit.bathroomItems}
                  onChange={(patch) => {
                    const unitPatch: Partial<IUnit> = {};
                    if (patch.isPrivate !== undefined) unitPatch.isBathroomPrivate = patch.isPrivate;
                    if (patch.items !== undefined) unitPatch.bathroomItems = patch.items;
                    updateUnit(unitPatch);
                  }}
                />
              </motion.div>
            )}

            {activeTab === "pricing_plans" && (
              <motion.div 
                key="pricing_plans"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <UnitPricingConfig 
                  unit={{
                    ...unit,
                    occupancyPricing: unit.ratePlan?.occupancyPricing || DEFAULT_RATE_PLAN.occupancyPricing,
                  } as IUnit & { occupancyPricing: IOccupancyPricing }}
                  onChange={(patch) => {
                    if (patch.occupancyPricing) updateRatePlan({ occupancyPricing: patch.occupancyPricing });
                    if (patch.pricePerNight !== undefined) updateUnit({ pricePerNight: patch.pricePerNight, localPrice: patch.localPrice, nonLocalPrice: patch.nonLocalPrice });
                  }}
                  isReadOnly={isPricingLocked}
                />
              </motion.div>
            )}

            {activeTab === "child_prices" && (
              <motion.div 
                key="child_prices"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                 <ChildPricingConfig 
                    childPricing={unit.ratePlan?.childPricing || DEFAULT_RATE_PLAN.childPricing}
                    onChange={(patch) => {
                      const current = unit.ratePlan?.childPricing || DEFAULT_RATE_PLAN.childPricing;
                      updateRatePlan({ childPricing: { ...current, ...patch } });
                    }}
                    isReadOnly={isPricingLocked}
                 />
              </motion.div>
            )}

            {activeTab === "inventory_cancellation" && (
              <motion.div 
                key="inventory_cancellation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CancellationPolicy 
                  value={unit.ratePlan || DEFAULT_RATE_PLAN}
                  onChange={(patch) => updateRatePlan(patch)}
                  dealLockExpireTime={unit.dealLockExpireTime}
                  onDealLockExpireTimeChange={(dealLockExpireTime) => updateUnit({ dealLockExpireTime })}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          {/* Footer Area */}
          <div className="p-4 md:p-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
            <button 
              onClick={onClose}
              className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors px-2"
            >
              Cancel
            </button>
            
            <div className="flex items-center gap-3">
              {activeTab !== "basics" && (
                <button 
                  onClick={() => {
                    const tabIds = TABS.map(t => t.id);
                    const currentIdx = tabIds.indexOf(activeTab);
                    setActiveTab(tabIds[currentIdx - 1] as typeof TABS[number]["id"]);
                  }}
                  className="h-10 md:h-12 px-5 md:px-8 rounded-xl border border-slate-200 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
              )}
              
              <button 
                onClick={async () => {
                  if (!validateCurrentTab()) return;
                  
                  if (activeTab === "inventory_cancellation") {
                    setIsSaving(true);
                    try {
                      await onSave(unit);
                      onClose();
                    } finally {
                      setIsSaving(false);
                    }
                  } else {
                    const tabIds = TABS.map(t => t.id);
                    const currentIdx = tabIds.indexOf(activeTab);
                    setActiveTab(tabIds[currentIdx + 1] as typeof TABS[number]["id"]);
                  }
                }}
                disabled={isSaving}
                className="h-10 md:h-12 px-6 md:px-10 rounded-xl bg-[#2dd4af] text-white text-[10px] md:text-xs font-bold shadow-lg shadow-[#2dd4af]/20 hover:opacity-90 transition-all uppercase tracking-widest flex items-center gap-2"
              >
                {isSaving ? "Saving..." : activeTab === "inventory_cancellation" ? "Save Config" : "Next"}
              </button>
            </div>
          </div>
          </div>
        </div>
      </motion.div>

      <MerchantConfirmModal
        isOpen={!!alertConfig}
        title={alertConfig?.title || "Alert"}
        message={alertConfig?.message || ""}
        confirmLabel="Got it"
        hideCancel
        tone="warning"
        onConfirm={() => setAlertConfig(null)}
        onCancel={() => setAlertConfig(null)}
      />
    </div>
  );
};

export default PrivateRoomWizardModal;
