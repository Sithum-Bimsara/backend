import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AddressForm from "../../../features/Accommodation/components/AccommodationForm/Common/AddressForm";
import FacilitiesSelector from "../../../features/Accommodation/components/AccommodationForm/Common/FacilitiesSelector";
import ServicesForm from "../../../features/Accommodation/components/AccommodationForm/Common/ServicesForm";
import LanguagesSelector from "../../../features/Accommodation/components/AccommodationForm/Common/LanguagesSelector";
import HouseRulesForm from "../../../features/Accommodation/components/AccommodationForm/Common/HouseRulesForm";
import HostProfileForm from "../../../features/Accommodation/components/AccommodationForm/Common/HostProfileForm";
import PropertyNameForm from "../../../features/Accommodation/components/AccommodationForm/Common/PropertyNameForm";
import { ImageUploader } from "../../../features/Accommodation/components/AccommodationForm/Common/ImageUploader";
import FinalStep from "../../../features/Accommodation/components/AccommodationForm/Common/FinalStep";
import NearbyPOIForm from "../../../features/Accommodation/components/AccommodationForm/Common/NearbyPOIForm";
import MarineLifeSelector from "../../../features/Accommodation/components/AccommodationForm/Common/MarineLifeSelector";
import ApartmentSleepingConfig from "../../../features/Accommodation/components/AccommodationForm/ApartmentFlow/ApartmentSleepingConfig";
import ApartmentBathroomConfig from "../../../features/Accommodation/components/AccommodationForm/ApartmentFlow/ApartmentBathroomConfig";
import ApartmentPricingConfig from "../../../features/Accommodation/components/AccommodationForm/ApartmentFlow/ApartmentPricingConfig";
import ApartmentChildPricingConfig from "../../../features/Accommodation/components/AccommodationForm/ApartmentFlow/ApartmentChildPricingConfig";
import ApartmentCancellationPolicy from "../../../features/Accommodation/components/AccommodationForm/ApartmentFlow/ApartmentCancellationPolicy";
import ApartmentAmenitiesSelector from "../../../features/Accommodation/components/AccommodationForm/ApartmentFlow/ApartmentRoomAmenitiesSelector";
import { MerchantConfirmModal } from "../../../features/MerchantProfile/components/MerchantUI";
import { useApartmentOnboarding } from "../../../features/Accommodation/hooks/useApartmentOnboarding";
import type { ApartmentDraft } from "../../../features/Accommodation/hooks/useApartmentOnboarding";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";

const AddApartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    steps,
    currentStep,
    draft,
    loading,
    error,
    showResetModal,
    setShowResetModal,
    patchDraft,
    handleNext,
    handleBack,
    handleSubmit,
    handleReset,
  } = useApartmentOnboarding();

  const renderStep = () => {
    const step = steps[currentStep];
    switch (step) {
      case "unit_type":
        return (
          <div className="space-y-6">
            <div className="p-8 rounded-4xl bg-[#2dd4af]/5 border border-[#2dd4af]/10 text-center space-y-4">
              <div className="h-20 w-20 bg-white rounded-3xl shadow-xl shadow-[#2dd4af]/10 flex items-center justify-center mx-auto">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#0e2a47]">Entire Apartment</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  You are listing your entire apartment. Guests will have the whole place to themselves.
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 text-xs text-slate-400 font-medium leading-relaxed">
              Note: This flow is optimized for single-unit apartments. If you have multiple different room types, please use the Hotel flow instead.
            </div>
          </div>
        );
      case "location":
        return (
          <AddressForm
            value={draft}
            onChange={(patch) => patchDraft(patch as Partial<ApartmentDraft>)}
          />
        );
      case "details":
        return (
          <PropertyNameForm
            name={draft.name}
            description={draft.description}
            onChange={(p) => patchDraft(p)}
          />
        );
      case "facilities": return (
        <div className="space-y-6">
          <FacilitiesSelector value={draft.propertyFacilities} onChange={(f) => patchDraft({ propertyFacilities: f })} />
          <ServicesForm value={draft.services} onChange={(s) => patchDraft({ services: s })} />
        </div>
      );
      case "nearby": return <NearbyPOIForm value={draft.nearbyPointsOfInterest} onChange={(n) => patchDraft({ nearbyPointsOfInterest: n })} />;
      case "marine-life": return <MarineLifeSelector value={draft.marineLifeZones} onChange={(m) => patchDraft({ marineLifeZones: m })} />;
      case "house-rules": return <HouseRulesForm value={draft.houseRules} onChange={(h) => patchDraft({ houseRules: h })} />;
      case "languages": return <LanguagesSelector value={draft.languages} onChange={(l) => patchDraft({ languages: l })} />;
      case "host-profile": return <HostProfileForm value={draft.hostProfile} onChange={(h) => patchDraft({ hostProfile: h })} />;

      case "beds": return (
        <ApartmentSleepingConfig
          maxGuests={draft.maxGuests}
          size={draft.size}
          bedConfigurations={draft.bedConfigurations}
          excludeInfants={draft.excludeInfants}
          cribsAvailable={draft.cribsAvailable}
          onChange={patchDraft}
        />
      );
      case "bathrooms": return (
        <ApartmentBathroomConfig
          isPrivate={draft.isBathroomPrivate}
          bathroomCount={draft.bathrooms}
          items={draft.bathroomItems}
          onChange={(p) => {
            const patch: Partial<ApartmentDraft> = {};
            if (p.isPrivate !== undefined) patch.isBathroomPrivate = p.isPrivate;
            if (p.bathroomCount !== undefined) patch.bathrooms = p.bathroomCount;
            if (p.items !== undefined) patch.bathroomItems = p.items;
            patchDraft(patch);
          }}
        />
      );
      case "amenities": return (
        <ApartmentAmenitiesSelector
          value={draft.amenities}
          onChange={(a) => patchDraft({ amenities: a })}
        />
      );
      case "pricing": return (
        <ApartmentPricingConfig
          pricePerNight={draft.pricePerNight}
          localPrice={draft.localPrice}
          nonLocalPrice={draft.nonLocalPrice}
          maxGuests={draft.maxGuests}
          occupancyPricing={draft.occupancyPricing}
          onChange={patchDraft}
        />
      );
      case "child-pricing": return (
        <ApartmentChildPricingConfig
          childPricing={draft.childPricing}
          onChange={(c) => patchDraft({ childPricing: { ...draft.childPricing, ...c } })}
        />
      );
      case "cancellation": return (
        <ApartmentCancellationPolicy
          cancellationWindow={draft.cancellationPolicy.cancellationWindow}
          cancellationFeeType={draft.cancellationPolicy.cancellationFeeType}
          accidentalBookingProtection={draft.cancellationPolicy.accidentalBookingProtection}
          onChange={(p) => patchDraft({ cancellationPolicy: { ...draft.cancellationPolicy, ...p } })}
        />
      );
      case "images": return <ImageUploader value={draft.images} onChange={(i) => patchDraft({ images: i })} />;
      case "final":
        return (
          <FinalStep
            agreementAccepted={draft.agreementAccepted}
            activateListing={draft.activateListing}
            onChange={(p) => patchDraft({
              ...p,
              agreementAccepted: p.agreementAccepted !== undefined ? (p.agreementAccepted as true) : undefined
            })}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Progress Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/merchant-dashboard/accommodation')}
                className="group flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:inline">Exit</span>
              </button>

              <button
                onClick={() => setShowResetModal(true)}
                className="group flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors"
                title="Clear all saved progress and start fresh"
              >
                <div className="h-8 w-8 rounded-lg border border-red-100 flex items-center justify-center group-hover:border-red-200 transition-colors bg-red-50/50">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 6L6 19M6 6l13 13" /></svg>
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:inline">Reset</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden lg:inline">Progress</span>
              </button>
            </div>

            <div className="text-right min-w-0">
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Step {currentStep + 1} of {steps.length}</span>
              <h1 className="text-xs md:text-sm font-bold text-slate-900 truncate">{steps[currentStep].replace(/_/g, ' ')}</h1>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="h-full bg-[#2dd4af] shadow-[0_0_10px_rgba(45,212,175,0.5)]"
            />
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-6 md:pt-12">
        <div className="space-y-6 md:space-y-8">
          {/* Main Card Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative">
            <div className="p-5 md:p-10">
              {/* Error Message */}
              <AnimatePresence mode="wait">
                <FormErrorBanner error={error} />
              </AnimatePresence>

              {/* Step Content */}
              <div className="min-h-50 md:min-h-75">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Actions Bar inside card footer */}
            <div className="px-5 md:px-8 py-4 md:py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-xl">
              <button
                onClick={handleBack}
                disabled={currentStep === 0 || loading}
                className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all"
              >
                Previous
              </button>

              <button
                onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                disabled={loading}
                className="relative flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-[#2dd4af] text-white rounded-lg text-xs md:text-sm font-bold shadow-lg shadow-[#2dd4af]/20 hover:bg-[#25b898] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? 'Publish Apartment' : 'Continue'}
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Helper Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="p-4 md:p-6 rounded-xl border border-slate-200 bg-white/50 space-y-2">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h4 className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-wider">Secure Hosting</h4>
              <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-medium">Your data is encrypted and saved automatically. You can resume this listing at any time from your dashboard.</p>
            </div>
            <div className="p-4 md:p-6 rounded-xl border border-slate-200 bg-white/50 space-y-2">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
              <h4 className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-wider">Need Help?</h4>
              <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-medium">Our support team is available 24/7 to help you optimize your apartment listing for maximum bookings.</p>
            </div>
          </div>
        </div>
      </main>

      <MerchantConfirmModal
        isOpen={showResetModal}
        title="Reset All Progress?"
        message="Are you sure you want to clear all your saved data and start the onboarding process from scratch? This action cannot be undone."
        confirmLabel="Reset Everything"
        tone="danger"
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};

export default AddApartmentPage;
