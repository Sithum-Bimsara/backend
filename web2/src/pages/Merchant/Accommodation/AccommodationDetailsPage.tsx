import React from 'react';
import { MerchantActionButton } from '../../../features/MerchantProfile/components/MerchantUI';
import type { IAccommodationView, BedType, PropertyImage, IUnit } from '../../../features/Accommodation/types/accommodation.types';
import type { UpdatePropertyDto } from '../../../features/Accommodation/dtos/accommodation.dto';
import PropertyNameForm from '../../../features/Accommodation/components/AccommodationForm/Common/PropertyNameForm';
import AddressForm from '../../../features/Accommodation/components/AccommodationForm/Common/AddressForm';
import HostProfileForm from '../../../features/Accommodation/components/AccommodationForm/Common/HostProfileForm';
import HouseRulesForm from '../../../features/Accommodation/components/AccommodationForm/Common/HouseRulesForm';
import LanguagesSelector from '../../../features/Accommodation/components/AccommodationForm/Common/LanguagesSelector';
import FacilitiesSelector from '../../../features/Accommodation/components/AccommodationForm/Common/FacilitiesSelector';
import {ImageUploader} from '../../../features/Accommodation/components/AccommodationForm/Common/ImageUploader';
import PrivateRoomManager from '../../../features/Accommodation/components/AccommodationForm/HotelFlow/PrivateRoomManager';
import AccommodationTabs from '../../../components/MerchantTabs/MerchantTabs';
import CustomSelect from '../../../components/Common/CustomSelect';
import { useAccommodationDetails } from '../../../features/Accommodation/hooks/useAccommodationDetails';
import { toast } from 'react-hot-toast';
import { AccommodationDetailsSkeleton } from '../../../features/Accommodation/components/AccommodationDetailsSkeleton';

const mapPropertyImageToDraft = (image: IAccommodationView['images'][number]): PropertyImage & { previewUrl: string } => ({
  url: image.url,
  previewUrl: image.url,
  width: 0,
  height: 0,
  fileSizeBytes: 0,
});

const inferUnitCategory = (roomType: string | null, name: string | null) => {
  const source = `${roomType ?? ''} ${name ?? ''}`.toLowerCase();
  if (source.includes('suite')) return 'Suite';
  if (source.includes('apartment')) return 'Apartment';
  if (source.includes('dorm')) return 'Dorm Room';
  if (source.includes('single')) return 'Single';
  if (source.includes('twin')) return 'Twin';
  return 'Double';
};

const mapPropertyUnitToDraft = (unit: IAccommodationView['units'][number]): IUnit => ({
  id: unit.id,
  name: unit.name,
  type: 'room',
  category: inferUnitCategory(unit.roomType, unit.name),
  maxGuests: unit.maxGuests ?? 1,
  excludeInfants: unit.excludeInfants,
  roomType: unit.roomType ?? '',
  cribsAvailable: unit.cribsAvailable ?? false,
  bathrooms: unit.bathrooms ?? 0,
  isBathroomPrivate: unit.isBathroomPrivate ?? true,
  bathroomItems: (unit.bathroomItems as string[]) ?? ["Toilet paper", "Shower", "Toilet"],
  size: unit.size ?? 0,
  smokingAllowed: unit.smokingAllowed ?? false,
  pricePerNight: unit.pricePerNight ?? 0,
  localPrice: unit.localPrice ?? 0,
  nonLocalPrice: unit.nonLocalPrice ?? 0,
  totalInventory: unit.totalInventory,
  dealLockExpireTime: unit.dealLockExpireTime,
  amenities: (unit.amenities as string[]) ?? ["Air conditioning", "Flat-screen TV", "Towels"],
  verificationStatus: unit.verificationStatus,
  bedConfigurations: (unit.bedConfigs || []).map((bedConfig) => ({
    bedType: bedConfig.bedType as BedType,
    count: bedConfig.count,
  })),
  ratePlan: unit.ratePlan ? {
    id: unit.ratePlan.id,
    name: unit.ratePlan.name ?? undefined,
    cancellationWindow: unit.ratePlan.cancellationWindow || '6pm_arrival',
    cancellationFeeType: unit.ratePlan.cancellationFeeType || 'first_night',
    accidentalBookingProtection: unit.ratePlan.accidentalBookingProtection ?? true,
    occupancyPricing: unit.ratePlan.occupancyPricing || { enabled: false, discounts: [] },
    childPricing: {
      enabled: unit.ratePlan.childPricingEnabled ?? false,
      infantsFree: unit.ratePlan.childPricingInfantsFree ?? true,
      childrenFree: unit.ratePlan.childPricingChildrenFree ?? true,
      childrenAgeFrom: unit.ratePlan.childPricingAgeFrom ?? 3,
      childrenAgeTo: unit.ratePlan.childPricingAgeTo ?? 10,
      infantFixedPrice: unit.ratePlan.childPricingInfantFixedPrice ?? null,
      childFixedPrice: unit.ratePlan.childPricingChildFixedPrice ?? null,
    }
  } : {
    cancellationWindow: '6pm_arrival',
    cancellationFeeType: 'first_night',
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
  },
});

const mapDraftUnitToPropertyUnit = (unit: IUnit): IAccommodationView['units'][number] => ({
  ...unit,
  id: unit.id || crypto.randomUUID(),
  verificationStatus: unit.verificationStatus || "PENDING",
  bedConfigs: (unit.bedConfigurations || []).map((bc) => ({
    id: crypto.randomUUID(),
    bedType: bc.bedType,
    count: bc.count,
  })),
  ratePlan: {
    id: unit.ratePlan.id || crypto.randomUUID(),
    propertyId: '',
    unitId: '',
    ...unit.ratePlan,
    childPricingEnabled: unit.ratePlan.childPricing.enabled,
    childPricingInfantsFree: unit.ratePlan.childPricing.infantsFree,
    childPricingChildrenFree: unit.ratePlan.childPricing.childrenFree,
    childPricingAgeFrom: unit.ratePlan.childPricing.childrenAgeFrom,
    childPricingAgeTo: unit.ratePlan.childPricing.childrenAgeTo,
    childPricingInfantFixedPrice: unit.ratePlan.childPricing.infantFixedPrice,
    childPricingChildFixedPrice: unit.ratePlan.childPricing.childFixedPrice,
  },
});

interface Props {
  propertyId: string;
  onBack: () => void;
  onNavigate: (tab: 'details' | 'calendar' | 'bookings') => void;
}

const AccommodationDetailsPage: React.FC<Props> = ({ propertyId, onBack, onNavigate }) => {
  const {
    property,
    setProperty,
    loading,
    error,
    isEditingProperty,
    setIsEditingProperty,
    localPropertyData,
    handleUpdateProperty,
    handleUnitSave,
    startEditing,
    updateLocalProperty,
    updateNearbyPoint,
    addNearbyPoint,
    removeNearbyPoint,
    updateMarineZone,
    addMarineZone,
    removeMarineZone,
    updatePropertyImagesOnServer,
    fetchProperty,
  } = useAccommodationDetails(propertyId);

  if (loading && !property) {
    return (
      <div className="flex flex-col bg-(--app-bg) flex-1 min-h-0">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-3">
              <MerchantActionButton onClick={onBack} variant="secondary">Back</MerchantActionButton>
              <div className="h-5 bg-slate-200 rounded w-48 animate-pulse ml-2"></div>
            </div>
            <div className="border-t border-slate-50">
              <AccommodationTabs activeTab="details" onNavigate={onNavigate} />
            </div>
          </div>
        </div>
        <AccommodationDetailsSkeleton />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="px-4 lg:px-8 py-6">
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error || 'Property not found'}
        </div>
        <MerchantActionButton onClick={onBack} variant="secondary" showArrow={false}>
          ← Back
        </MerchantActionButton>
      </div>
    );
  }

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
                {property.name || 'Property Details'}
              </h1>
              <span className={`shrink-0 inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${property.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${property.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {property.isActive ? 'Active' : 'Draft'}
              </span>

              {/* Refresh Button */}
              <button
                onClick={fetchProperty}
                disabled={loading}
                className={`ml-1 p-1.5 rounded-lg text-slate-400 hover:text-[#2dd4af] hover:bg-[#2dd4af]/10 transition-all border-none cursor-pointer bg-transparent disabled:opacity-50 ${loading ? 'animate-spin' : ''}`}
                title="Refresh data"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEditingProperty ? (
                <>
                  <button
                    onClick={() => setIsEditingProperty(false)}
                    className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateProperty(localPropertyData)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#2dd4af] text-white rounded-lg text-xs font-bold hover:bg-[#25b191] transition-all border-none cursor-pointer shadow-sm shadow-[#2dd4af]/20"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#0e2a47] bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="hidden sm:inline">Edit Property</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Tabs */}
          <div className="border-t border-slate-50">
            <AccommodationTabs activeTab="details" onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 flex-1 min-h-0 overflow-y-auto">

        {/* Property Details Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Property Type</label>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-base font-semibold text-[#0e2a47] capitalize">
                    {isEditingProperty ? localPropertyData.type : property.type}
                  </p>
                  {isEditingProperty && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                      Locked
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Property Name</label>
                <div className="mt-2">
                  <PropertyNameForm
                    name={isEditingProperty ? localPropertyData.name || '' : property.name || ''}
                    description={isEditingProperty ? localPropertyData.description || '' : property.description || ''}
                    onChange={(patch) => updateLocalProperty(patch)}
                    disabled={!isEditingProperty}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Location</label>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <AddressForm
                    value={isEditingProperty ? {
                      address: localPropertyData.address,
                      city: localPropertyData.city,
                      island: localPropertyData.island,
                      zipCode: localPropertyData.zipCode,
                      latitude: localPropertyData.latitude,
                      longitude: localPropertyData.longitude,
                    } as Partial<UpdatePropertyDto> : {
                      address: property.address,
                      city: property.city,
                      island: property.island,
                      zipCode: property.zipCode,
                      latitude: property.latitude,
                      longitude: property.longitude,
                    } as Partial<UpdatePropertyDto>}
                    onChange={updateLocalProperty}
                    disabled={!isEditingProperty}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  {property.type === 'hotel' && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">Star Rating</label>
                      <div className="mt-2">
                        <CustomSelect
                          disabled={!isEditingProperty}
                          value={isEditingProperty ? localPropertyData.starRating || "N/A" : property.starRating || "N/A"}
                          onChange={(val) => updateLocalProperty({ starRating: (val || 'N/A') as UpdatePropertyDto['starRating'] })}
                          options={[
                            { value: "N/A", label: "N/A" },
                            { value: "1 star", label: "1 Star" },
                            { value: "2 stars", label: "2 Stars" },
                            { value: "3 stars", label: "3 Stars" },
                            { value: "4 stars", label: "4 Stars" },
                            { value: "5 stars", label: "5 Stars" },
                          ]}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <div className="mt-1 inline-block">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${property.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {property.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* House Rules Part */}
              <div className="pt-4 border-t border-slate-50">
                <h3 className="text-sm font-bold text-[#0e2a47] mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#2dd4af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  House Rules
                </h3>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <HouseRulesForm
                    value={
                      isEditingProperty
                        ? {
                          smokingAllowed: localPropertyData.houseRules?.smokingAllowed ?? false,
                          childrenAllowed: localPropertyData.houseRules?.childrenAllowed ?? false,
                          partiesAllowed: localPropertyData.houseRules?.partiesAllowed ?? false,
                          petsPolicy: { mode: ((localPropertyData.houseRules?.petsPolicy as { mode?: 'yes' | 'no' | 'request' } | undefined)?.mode) ?? 'request' },
                          petFeesPolicy: { amount: ((localPropertyData.houseRules?.petFeesPolicy as { amount?: string } | undefined)?.amount) ?? '' },
                          checkInFrom: localPropertyData.houseRules?.checkInFrom ?? "",
                          checkInTo: localPropertyData.houseRules?.checkInTo ?? "",
                          checkOutFrom: localPropertyData.houseRules?.checkOutFrom ?? "",
                          checkOutTo: localPropertyData.houseRules?.checkOutTo ?? "",
                        }
                        : {
                          smokingAllowed: property.smokingAllowed ?? false,
                          childrenAllowed: property.childrenAllowed ?? false,
                          partiesAllowed: property.partiesAllowed ?? false,
                          petsPolicy: { mode: ((property.petsPolicy as { mode?: 'yes' | 'no' | 'request' } | undefined)?.mode) ?? 'request' },
                          petFeesPolicy: { amount: ((property.petFeesPolicy as { amount?: string } | undefined)?.amount) ?? '' },
                          checkInFrom: property.checkInFrom ?? "",
                          checkInTo: property.checkInTo ?? "",
                          checkOutFrom: property.checkOutFrom ?? "",
                          checkOutTo: property.checkOutTo ?? "",
                        }
                    }
                    onChange={(rules) => updateLocalProperty({ houseRules: rules })}
                    disabled={!isEditingProperty}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            {/* Facilities & Services */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#0e2a47] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2dd4af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                  Facilities & Services
                </h3>
                {isEditingProperty ? (
                  <FacilitiesSelector
                    value={localPropertyData?.propertyFacilities || []}
                    onChange={(facs) => updateLocalProperty({ propertyFacilities: facs })}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {property.propertyFacilities?.map((fac, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                        {fac}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Languages Spoken</label>
                {isEditingProperty ? (
                  <div className="mt-2">
                    <LanguagesSelector
                      value={localPropertyData?.languages || []}
                      onChange={(langs) => updateLocalProperty({ languages: langs })}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {property.languages?.map((lang, i) => (
                      <span key={i} className="text-sm text-[#0e2a47] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4af]"></span>
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Policies & Host Profile */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0e2a47] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2dd4af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Environment
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Nearby Points of Interest</h4>
                    {isEditingProperty ? (
                      <div className="mt-3 space-y-3">
                        {(localPropertyData?.nearbyPointsOfInterest || []).map((poi, index) => (
                          <div key={`${poi.name}-${index}`} className="grid gap-2 rounded-xl border border-slate-100 bg-white p-3 md:grid-cols-[1fr_1fr_auto]">
                            <input
                              value={poi.name}
                              onChange={(event) => updateNearbyPoint(index, { name: event.target.value })}
                              placeholder="Public ferry jetty"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2dd4af]"
                            />
                            <input
                              value={poi.distanceText}
                              onChange={(event) => updateNearbyPoint(index, { distanceText: event.target.value })}
                              placeholder="5 min walk"
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2dd4af]"
                            />
                            <button
                              type="button"
                              onClick={() => removeNearbyPoint(index)}
                              className="rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addNearbyPoint}
                          className="rounded-lg border border-dashed border-[#2dd4af]/40 px-4 py-2 text-sm font-semibold text-[#0e2a47] hover:bg-[#2dd4af]/5"
                        >
                          + Add Nearby Point
                        </button>
                      </div>
                    ) : (
                      property.nearbyPointsOfInterest && property.nearbyPointsOfInterest.length > 0 ? (
                        <div className="mt-3 grid gap-3">
                          {property.nearbyPointsOfInterest.map((poi, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-sm font-semibold text-[#0e2a47]">{poi.name}</div>
                              <div className="text-xs text-slate-500">{poi.distanceText}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No nearby points of interest defined.</p>
                      )
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Marine Life Zones</h4>
                    {isEditingProperty ? (
                      <div className="mt-3 space-y-3">
                        {(localPropertyData?.marineLifeZones || []).map((zone, index) => (
                          <div key={`${zone.zone}-${index}`} className="space-y-2 rounded-xl border border-slate-100 bg-white p-3">
                            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                              <input
                                value={zone.zone}
                                onChange={(event) => updateMarineZone(index, { zone: event.target.value })}
                                placeholder="Shark Point"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2dd4af]"
                              />
                              <button
                                type="button"
                                onClick={() => removeMarineZone(index)}
                                className="rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                            <textarea
                              value={zone.description || ''}
                              onChange={(event) => updateMarineZone(index, { description: event.target.value })}
                              placeholder="Safe areas to spot baby reef sharks or whale sharks seasonally."
                              rows={3}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2dd4af]"
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addMarineZone}
                          className="rounded-lg border border-dashed border-[#2dd4af]/40 px-4 py-2 text-sm font-semibold text-[#0e2a47] hover:bg-[#2dd4af]/5"
                        >
                          + Add Marine Life Zone
                        </button>
                      </div>
                    ) : (
                      property.marineLifeZones && property.marineLifeZones.length > 0 ? (
                        <div className="mt-3 grid gap-3">
                          {property.marineLifeZones.map((zone, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-sm font-semibold text-[#0e2a47]">{zone.zone}</div>
                              {zone.description && <div className="text-xs text-slate-500">{zone.description}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No marine life zones defined.</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-base font-bold text-[#0e2a47] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2dd4af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Host Profile
                </h3>
                <HostProfileForm
                  value={
                    isEditingProperty
                      ? {
                        propertyDescription: localPropertyData.hostProfile?.propertyDescription ?? '',
                        hostDescription: localPropertyData.hostProfile?.hostDescription ?? '',
                        neighborhoodDescription: localPropertyData.hostProfile?.neighborhoodDescription ?? '',
                      }
                      : {
                        propertyDescription: property.hostProfile?.propertyDescription ?? '',
                        hostDescription: property.hostProfile?.hostDescription ?? '',
                        neighborhoodDescription: property.hostProfile?.neighborhoodDescription ?? '',
                      }
                  }
                  onChange={(profile) => updateLocalProperty({ hostProfile: profile })}
                  disabled={!isEditingProperty}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Images Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
          <h3 className="text-base font-bold text-[#0e2a47] mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#2dd4af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Property Images
          </h3>
          <ImageUploader
            value={(property.images || []).map(mapPropertyImageToDraft)}
            onChange={async (images) => {
              try {
                await updatePropertyImagesOnServer(images);
              } catch {
                toast.error('Failed to update images');
              }
            }}
          />
        </div>

        {/* Accommodation Units Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
          <PrivateRoomManager
            units={(property.units || []).map(mapPropertyUnitToDraft)}
            onChange={(newUnits) => {
              setProperty((current) => current ? { ...current, units: newUnits.map(mapDraftUnitToPropertyUnit) } : current);
            }}
            onUnitSave={handleUnitSave}
            isPricingLocked={property.isActive}
            homeListingType={property.homeListingType}
          />
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailsPage;
