import React, { useState } from "react";
import type { IUnit } from "../../../types/accommodation.types";
import { MerchantActionButton, MerchantConfirmModal } from "../../../../MerchantProfile/components/MerchantUI";
import PrivateRoomWizardModal from "./UnitManagement/PrivateRoomWizardModal";
import EntirePlaceInlineEditor from "./UnitManagement/EntirePlaceInlineEditor";

interface Props {
  units: IUnit[];
  onChange: (units: IUnit[]) => void;
  onUnitSave?: (unit: IUnit) => void | Promise<void>;
  isPricingLocked?: boolean;
  homeListingType?: string | null;
}

const PrivateRoomManager: React.FC<Props> = ({ units, onChange, onUnitSave, homeListingType }) => {
  const isEntirePlace = homeListingType === 'entire_place';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<IUnit | undefined>(undefined);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const [isInlineEditorOpen, setIsInlineEditorOpen] = useState(false);

  const formatMoney = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value);
  };


  const handleSave = async (unit: IUnit) => {
    if (onUnitSave) {
      await onUnitSave(unit);
    } else {
      const exists = units.find(u => u.id === unit.id);
      if (exists) {
        onChange(units.map(u => u.id === unit.id ? unit : u));
      } else {
        onChange([...units, unit]);
      }
    }
    setIsModalOpen(false);
    setEditingUnit(undefined);
  };

  const removeUnit = (id: string) => {
    onChange(units.filter(u => u.id !== id));
    setUnitToDelete(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Units & Room Structure</h2>
          <p className="text-xs md:text-sm text-slate-500">Define the rooms or units available at your property.</p>
        </div>
        {!isEntirePlace && (
          <MerchantActionButton
            onClick={() => {
              setEditingUnit(undefined);
              setIsModalOpen(true);
            }}
            variant="primary"
          >
            + Add Unit
          </MerchantActionButton>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {units.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200">
            <div className="h-16 w-16 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /><line x1="12" y1="22" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900">No rooms added yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-60 mx-auto">Click the button above to add your first room or unit type.</p>
          </div>
        ) : (
          <>
            {units.map((unit) => (
            <div
              key={unit.id}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-[#2dd4af]/30 transition-all shadow-sm hover:shadow-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm md:text-base font-black text-slate-800 tracking-tight mr-1">
                    {unit.name}
                  </span>
                  {unit.verificationStatus === 'VERIFIED' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Not Accepted Yet</span>
                    </div>
                  )}
                  {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                    {unit.category || unit.roomType}
                  </span> */}
                  {!isEntirePlace && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2dd4af]/10 text-[#2dd4af] text-[10px] font-bold uppercase tracking-widest border border-[#2dd4af]/20">
                      {unit.totalInventory} Units
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Max {unit.maxGuests} Guests
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingUnit(unit);
                      if (isEntirePlace) {
                        setIsInlineEditorOpen(true);
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                    className="h-9 px-5 flex items-center gap-2 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#2dd4af] transition-all shadow-md shadow-slate-900/10 hover:shadow-[#2dd4af]/20"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    Edit Details
                  </button>
                  <button
                    onClick={() => setUnitToDelete(unit.id || null)}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200 hover:border-red-100"
                    title="Remove Unit"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 space-y-8">

                {/* Row 1: Configuration + Bathroom + Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Configuration */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" /><path d="M9 3v18" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Configuration</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Size</span>
                        <span className="font-bold text-slate-900">{unit.size || 'N/A'} sqm</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Smoking</span>
                        <span className={`font-bold ${unit.smokingAllowed ? 'text-emerald-600' : 'text-slate-400'}`}>{unit.smokingAllowed ? 'Allowed' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Infants Excluded</span>
                        <span className="font-bold text-slate-900">{unit.excludeInfants ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Cribs Available</span>
                        <span className="font-bold text-slate-900">{unit.cribsAvailable ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bathroom */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 2v3M16 2v3M3 7h18M3 7l1 13a2 2 0 002 2h12a2 2 0 002-2l1-13" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Bathroom</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Privacy</span>
                        <span className="font-bold text-slate-900">{unit.isBathroomPrivate ? 'Private' : 'Shared'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Count</span>
                        <span className="font-bold text-slate-900">{unit.bathrooms ?? 1}</span>
                      </div>
                      {unit.bathroomItems && unit.bathroomItems.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1.5">Items</span>
                          <div className="flex flex-wrap gap-1">
                            {unit.bathroomItems.map(item => (
                              <span key={item} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">{item}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pricing</span>
                    <div>
                      <div className="text-2xl font-black text-slate-900 leading-none">{formatMoney(unit.pricePerNight)}</div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Per Night (Base)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Local Rate</span>
                        <span className="font-bold text-slate-900">{formatMoney(unit.localPrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Intl Rate</span>
                        <span className="font-bold text-slate-900">{formatMoney(unit.nonLocalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Deal Lock</span>
                        <span className="font-bold text-slate-900">{unit.dealLockExpireTime} day(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Beds */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16M22 4v16M2 12h20M7 12V8a1 1 0 011-1h8a1 1 0 011 1v4" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Bed Configuration</span>
                  </div>
                  {unit.bedConfigurations && unit.bedConfigurations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {unit.bedConfigurations.map((bed, i) => (
                        <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-sm">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16M22 4v16M2 12h20M7 12V8a1 1 0 011-1h8a1 1 0 011 1v4" /></svg>
                          {bed.count}× {bed.bedType}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">No beds configured</p>
                  )}
                </div>

                {/* Row 3: Amenities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Room Amenities</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{unit.amenities?.length || 0}</span>
                  </div>
                  {unit.amenities && unit.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {unit.amenities.map(amenity => (
                        <span key={amenity} className="px-2.5 py-1 rounded-lg bg-[#2dd4af]/8 border border-[#2dd4af]/20 text-[10px] font-semibold text-slate-700">{amenity}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">No amenities listed</p>
                  )}
                </div>

                {/* Row 4: Policies */}
                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Child Policy */}
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Child Policy</div>
                    {unit.ratePlan?.childPricing?.enabled ? (
                      <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Children Ages</span>
                          <span>{unit.ratePlan.childPricing.childrenAgeFrom}–{unit.ratePlan.childPricing.childrenAgeTo} yrs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Infants</span>
                          <span className={unit.ratePlan.childPricing.infantsFree ? 'text-emerald-600' : 'text-slate-900'}>{unit.ratePlan.childPricing.infantsFree ? 'Free' : `$${unit.ratePlan.childPricing.infantFixedPrice || 0}/night`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Children</span>
                          <span className={unit.ratePlan.childPricing.childrenFree ? 'text-emerald-600' : 'text-slate-900'}>{unit.ratePlan.childPricing.childrenFree ? 'Free' : `$${unit.ratePlan.childPricing.childFixedPrice || 0}/night`}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Not configured</p>
                    )}
                  </div>

                  {/* Cancellation */}
                  <div className="p-4 rounded-xl bg-red-50/40 border border-red-100 space-y-2">
                    <div className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Cancellation Policy</div>
                    <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Window</span>
                        <span>{unit.ratePlan?.cancellationWindow?.replace(/_/g, ' ') || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fee Type</span>
                        <span>{unit.ratePlan?.cancellationFeeType === 'full_stay' ? '100% of stay' : 'First night only'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Accidental Protection</span>
                        <span className={unit.ratePlan?.accidentalBookingProtection ? 'text-emerald-600' : 'text-slate-400'}>{unit.ratePlan?.accidentalBookingProtection ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </>
        )}
      </div>

      <PrivateRoomWizardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialUnit={editingUnit}
        isPricingLocked={editingUnit?.verificationStatus === 'VERIFIED'}
      />

      <EntirePlaceInlineEditor
        isOpen={isInlineEditorOpen}
        onClose={() => setIsInlineEditorOpen(false)}
        onSave={handleSave}
        initialUnit={editingUnit}
        isPricingLocked={editingUnit?.verificationStatus === 'VERIFIED'}
      />

      <MerchantConfirmModal
        isOpen={!!unitToDelete}
        title="Remove Unit"
        message="Are you sure you want to remove this room type? This action cannot be undone."
        confirmLabel="Remove Unit"
        tone="danger"
        onConfirm={() => { if (unitToDelete) removeUnit(unitToDelete); }}
        onCancel={() => setUnitToDelete(null)}
      />
    </div>
  );
};

export default PrivateRoomManager;
