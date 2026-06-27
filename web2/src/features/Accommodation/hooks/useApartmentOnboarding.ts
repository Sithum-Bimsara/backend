import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateAccommodationCompleteDto } from '../dtos/accommodation.dto';
import type { BedType, IUnit, PropertyStep } from '../types/accommodation.types';
import { createPropertyComplete } from '../api/accommodation.api';
import { ErrorHandler } from '../../../utils/error-handler';

export interface ApartmentDraft extends Omit<CreateAccommodationCompleteDto, 'units' | 'type'> {
  type: 'apartment';
  maxGuests: number;
  size: number;
  bedConfigurations: Array<{ bedType: BedType; count: number }>;
  excludeInfants: boolean;
  cribsAvailable: boolean;
  bathrooms: number;
  isBathroomPrivate: boolean;
  bathroomItems: string[];
  pricePerNight: number;
  localPrice: number;
  nonLocalPrice: number;
  occupancyPricing: NonNullable<IUnit['ratePlan']>['occupancyPricing'];
  amenities: string[];
}

export const DEFAULT_APARTMENT: ApartmentDraft = {
  type: 'apartment',
  name: '',
  description: '',
  address: '',
  city: '',
  island: '',
  zipCode: '',
  latitude: null,
  longitude: null,
  starRating: 'N/A',
  homeListingType: 'entire_place',
  propertyFacilities: [],
  services: { breakfast: 'no', parking: 'no' },
  languages: ['Arabic', 'English'],
  houseRules: {
    smokingAllowed: false,
    childrenAllowed: true,
    partiesAllowed: false,
    petsPolicy: { mode: 'request' },
    petFeesPolicy: { amount: '' },
    checkInFrom: '14:00',
    checkInTo: '22:00',
    checkOutFrom: '07:00',
    checkOutTo: '11:00',
  },
  hostProfile: { propertyDescription: '', hostDescription: '', neighborhoodDescription: '' },
  nearbyPointsOfInterest: [],
  marineLifeZones: [],
  images: [],
  agreementAccepted: true,
  activateListing: false,
  cancellationPolicy: {
    cancellationWindow: '6pm_arrival',
    cancellationFeeType: 'first_night',
    accidentalBookingProtection: true,
  },
  childPricing: {
    enabled: true,
    infantsFree: true,
    childrenFree: true,
    childrenAgeFrom: 3,
    childrenAgeTo: 10,
    infantFixedPrice: null,
    childFixedPrice: null,
  },
  maxGuests: 2,
  size: 35,
  bedConfigurations: [],
  excludeInfants: false,
  cribsAvailable: false,
  bathrooms: 1,
  isBathroomPrivate: true,
  bathroomItems: [],
  pricePerNight: 0,
  localPrice: 0,
  nonLocalPrice: 0,
  occupancyPricing: { enabled: false, discounts: [] },
  amenities: [],
};

const STEP_ORDER: PropertyStep[] = [
  'unit_type',
  'location',
  'details',
  'house-rules',
  'languages',
  'facilities',
  'nearby',
  'marine-life',
  'beds',
  'bathrooms',
  'amenities',
  'pricing',
  'child-pricing',
  'cancellation',
  'host-profile',
  'images',
  'final',
];

export const useApartmentOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('apartment_onboarding_step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [draft, setDraft] = useState<ApartmentDraft>(() => {
    const saved = localStorage.getItem('apartment_onboarding_draft');
    if (!saved) return DEFAULT_APARTMENT;

    try {
      const parsed = JSON.parse(saved) as Partial<ApartmentDraft>;
      return {
        ...DEFAULT_APARTMENT,
        ...parsed,
        houseRules: { ...DEFAULT_APARTMENT.houseRules, ...(parsed.houseRules || {}) },
        hostProfile: { ...DEFAULT_APARTMENT.hostProfile, ...(parsed.hostProfile || {}) },
        services: { ...DEFAULT_APARTMENT.services, ...(parsed.services || {}) },
        cancellationPolicy: { ...DEFAULT_APARTMENT.cancellationPolicy, ...(parsed.cancellationPolicy || {}) },
        childPricing: { ...DEFAULT_APARTMENT.childPricing, ...(parsed.childPricing || {}) },
        occupancyPricing: { ...DEFAULT_APARTMENT.occupancyPricing, ...(parsed.occupancyPricing || {}) },
        bedConfigurations: parsed.bedConfigurations ?? DEFAULT_APARTMENT.bedConfigurations,
        images: parsed.images ?? DEFAULT_APARTMENT.images,
        nearbyPointsOfInterest: parsed.nearbyPointsOfInterest ?? DEFAULT_APARTMENT.nearbyPointsOfInterest,
        marineLifeZones: parsed.marineLifeZones ?? DEFAULT_APARTMENT.marineLifeZones,
        languages: parsed.languages ?? DEFAULT_APARTMENT.languages,
        bathroomItems: parsed.bathroomItems ?? DEFAULT_APARTMENT.bathroomItems,
        bathrooms: parsed.bathrooms ?? DEFAULT_APARTMENT.bathrooms,
        isBathroomPrivate: parsed.isBathroomPrivate ?? DEFAULT_APARTMENT.isBathroomPrivate,
        amenities: parsed.amenities ?? DEFAULT_APARTMENT.amenities,
      };
    } catch {
      return DEFAULT_APARTMENT;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('apartment_onboarding_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('apartment_onboarding_draft', JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const steps = useMemo(() => STEP_ORDER, []);

  const patchDraft = (patch: Partial<ApartmentDraft>) => setDraft((curr) => ({ ...curr, ...patch }));

  const illegalChars = [';', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '[', ']', '{', '}', '|', '\\', '<', '>', '?', '.', ',', '`', '~'];
  const checkIllegal = (text: string | null | undefined) => (text ? illegalChars.some((char) => text.includes(char)) : false);
  const illegalMsg = 'Special symbols (like @, #, $, *, etc.) are not allowed.';

  const validateCurrentStep = () => {
    switch (steps[currentStep]) {
      case 'location':
        if ([draft.city, draft.zipCode].some(checkIllegal)) return illegalMsg;
        return draft.address && draft.city && draft.island && draft.zipCode ? null : 'Address, city, island, and zipcode are required.';
      case 'details':
        if (checkIllegal(draft.name)) return illegalMsg;
        return draft.name && draft.description ? null : 'Apartment name and description are required.';
      case 'house-rules':
        if (checkIllegal(draft.houseRules.petFeesPolicy.amount)) return illegalMsg;
        return draft.houseRules.checkInFrom && draft.houseRules.checkInTo && draft.houseRules.checkOutFrom && draft.houseRules.checkOutTo ? null : 'Set your check-in and check-out time windows.';
      case 'beds':
        if (draft.maxGuests <= 0) return 'Max guests must be at least 1.';
        if (draft.bedConfigurations.length === 0) return 'Please add at least one bed configuration.';
        if (!draft.size || draft.size <= 0) return 'Please enter a valid apartment size.';
        return null;
      case 'pricing':
        if (draft.pricePerNight <= 0) return 'Base price per night must be greater than 0.';
        return null;
      case 'child-pricing':
        if (draft.childPricing?.enabled) {
          if (!draft.childPricing.infantsFree && (!draft.childPricing.infantFixedPrice || draft.childPricing.infantFixedPrice <= 0)) {
            return 'Please enter a valid fixed daily fee for infants.';
          }
          if (!draft.childPricing.childrenFree && (!draft.childPricing.childFixedPrice || draft.childPricing.childFixedPrice <= 0)) {
            return 'Please enter a valid fixed daily fee for children.';
          }
        }
        return null;
      case 'images':
        return draft.images.length >= 4 ? null : `Please upload at least 4 images. Currently: ${draft.images.length}`;
      case 'final':
        return draft.agreementAccepted && draft.activateListing ? null : 'You must accept the legal agreement and activate the listing.';
      default:
        return null;
    }
  };

  const mapToAccommodation = (data: ApartmentDraft): CreateAccommodationCompleteDto => ({
    type: 'apartment',
    name: data.name,
    description: data.description,
    address: data.address,
    city: data.city,
    island: data.island,
    zipCode: data.zipCode,
    latitude: data.latitude,
    longitude: data.longitude,
    starRating: data.starRating,
    homeListingType: 'entire_place',
    propertyFacilities: data.propertyFacilities,
    services: data.services,
    languages: data.languages,
    houseRules: data.houseRules,
    hostProfile: data.hostProfile,
    nearbyPointsOfInterest: data.nearbyPointsOfInterest,
    marineLifeZones: data.marineLifeZones,
    images: data.images,
    agreementAccepted: data.agreementAccepted,
    activateListing: data.activateListing,
    cancellationPolicy: data.cancellationPolicy,
    childPricing: data.childPricing,
    units: [
      {
        id: crypto.randomUUID(),
        name: data.name || 'Entire Apartment',
        type: 'room',
        category: 'Apartment',
        maxGuests: data.maxGuests,
        size: data.size,
        bedConfigurations: data.bedConfigurations,
        excludeInfants: data.excludeInfants,
        cribsAvailable: data.cribsAvailable,
        bathrooms: data.bathrooms,
        isBathroomPrivate: data.isBathroomPrivate,
        bathroomItems: data.bathroomItems,
        roomType: null,
        smokingAllowed: data.houseRules.smokingAllowed,
        amenities: data.amenities,
        pricePerNight: data.pricePerNight,
        localPrice: data.localPrice,
        nonLocalPrice: data.nonLocalPrice,
        totalInventory: 1,
        dealLockExpireTime: 1,
        ratePlan: {
          name: 'Standard Rate',
          cancellationWindow: data.cancellationPolicy.cancellationWindow,
          cancellationFeeType: data.cancellationPolicy.cancellationFeeType,
          accidentalBookingProtection: data.cancellationPolicy.accidentalBookingProtection,
          occupancyPricing: data.occupancyPricing,
          childPricing: data.childPricing,
        },
      },
    ],
  });

  const handleNext = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setCurrentStep((curr) => Math.min(curr + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((curr) => Math.max(curr - 1, 0));
  };

  const handleReset = () => {
    localStorage.removeItem('apartment_onboarding_step');
    localStorage.removeItem('apartment_onboarding_draft');
    setDraft(DEFAULT_APARTMENT);
    setCurrentStep(0);
    setShowResetModal(false);
    setError(null);
  };

  const handleSubmit = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = mapToAccommodation(draft);
      const created = await createPropertyComplete(payload);
      localStorage.removeItem('apartment_onboarding_step');
      localStorage.removeItem('apartment_onboarding_draft');
      navigate(`/merchant-dashboard/accommodation/${created.id}/manage/details`);
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, 'Failed to create apartment');
      setError(msg);
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: msg });
    } finally {
      setLoading(false);
    }
  };

  return {
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
    setError,
    setCurrentStep,
  };
};
