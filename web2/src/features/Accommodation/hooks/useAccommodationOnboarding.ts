import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateAccommodationCompleteDto } from '../dtos/accommodation.dto';
import type { PropertyStep } from '../types/accommodation.types';
import { createPropertyComplete } from '../api/accommodation.api';
import { ErrorHandler } from '../../../utils/error-handler';

export const DEFAULT_ACCOMMODATION: CreateAccommodationCompleteDto = {
  type: 'hotel',
  name: '',
  description: '',
  address: '',
  city: '',
  island: '',
  zipCode: '',
  latitude: null,
  longitude: null,
  starRating: 'N/A',
  homeListingType: 'private_room',
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
  units: [],
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
};

const STEP_ORDER: PropertyStep[] = [
  'type',
  'location',
  'details',
  'house-rules',
  'languages',
  'facilities',
  'nearby',
  'marine-life',
  'units',
  'host-profile',
  'images',
  'final',
];

export const useAccommodationOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('accommodation_onboarding_step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [draft, setDraft] = useState<CreateAccommodationCompleteDto>(() => {
    const saved = localStorage.getItem('accommodation_onboarding_draft');
    if (!saved) return DEFAULT_ACCOMMODATION;

    try {
      const parsed = JSON.parse(saved) as Partial<CreateAccommodationCompleteDto>;
      return {
        ...DEFAULT_ACCOMMODATION,
        ...parsed,
        houseRules: {
          ...DEFAULT_ACCOMMODATION.houseRules,
          ...(parsed.houseRules || {}),
        },
        hostProfile: {
          ...DEFAULT_ACCOMMODATION.hostProfile,
          ...(parsed.hostProfile || {}),
        },
        services: {
          ...DEFAULT_ACCOMMODATION.services,
          ...(parsed.services || {}),
        },
        units: parsed.units ?? DEFAULT_ACCOMMODATION.units,
        images: parsed.images ?? DEFAULT_ACCOMMODATION.images,
        nearbyPointsOfInterest: parsed.nearbyPointsOfInterest ?? DEFAULT_ACCOMMODATION.nearbyPointsOfInterest,
        marineLifeZones: parsed.marineLifeZones ?? DEFAULT_ACCOMMODATION.marineLifeZones,
        languages: parsed.languages ?? DEFAULT_ACCOMMODATION.languages,
      };
    } catch {
      return DEFAULT_ACCOMMODATION;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('accommodation_onboarding_step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('accommodation_onboarding_draft', JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const steps = useMemo(() => STEP_ORDER, []);

  const patchDraft = (patch: Partial<CreateAccommodationCompleteDto>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      if (next.type === 'hotel') {
        next.homeListingType = 'private_room';
      }
      return next;
    });
  };

  const ILLEGAL_INPUT_CHARS = [';', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '[', ']', '{', '}', '|', '\\', '<', '>', '?', '.', ',', '`', '~'];
  const checkIllegal = (text: string | null | undefined) => (text ? ILLEGAL_INPUT_CHARS.some((char) => text.includes(char)) : false);
  const ILLEGAL_MSG = 'Special symbols (like @, #, $, *, etc.) are not allowed.';

  const validateCurrentStep = () => {
    switch (steps[currentStep]) {
      case 'location':
        if ([draft.city, draft.zipCode].some(checkIllegal)) return ILLEGAL_MSG;
        return draft.address && draft.city && draft.island && draft.zipCode ? null : 'Address, city, island, and zipcode are required.';
      case 'details':
        if (checkIllegal(draft.name)) return ILLEGAL_MSG;
        if (!draft.name || !draft.description) return 'Property name and description are required.';
        return null;
      case 'house-rules':
        if (checkIllegal(draft.houseRules.petFeesPolicy.amount)) return ILLEGAL_MSG;
        return draft.houseRules.checkInFrom && draft.houseRules.checkInTo && draft.houseRules.checkOutFrom && draft.houseRules.checkOutTo ? null : 'Add check-in and check-out times.';
      case 'units':
        if (draft.units.length === 0) return 'Add at least one unit or room.';
        if (draft.units.some((unit) => !unit.maxGuests || unit.maxGuests <= 0)) return 'Ensure all units have a guest occupancy set.';
        return null;
      case 'images':
        return draft.images.length >= 4 ? null : `Please upload at least 4 images to continue. Currently: ${draft.images.length}`;
      case 'final':
        return draft.agreementAccepted && draft.activateListing ? null : 'You must accept the legal agreement and activate the listing.';
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validation = validateCurrentStep();
    if (validation) {
      setError(validation);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (steps[currentStep] === 'type' && draft.type === 'apartment') {
      navigate('/merchant-dashboard/accommodation/create-apartment');
      return;
    }

    setError(null);
    setCurrentStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((current) => Math.max(current - 1, 0));
  };

  const handleReset = () => {
    localStorage.removeItem('accommodation_onboarding_step');
    localStorage.removeItem('accommodation_onboarding_draft');
    setDraft(DEFAULT_ACCOMMODATION);
    setCurrentStep(0);
    setShowResetModal(false);
    setError(null);
  };

  const handleSubmit = async () => {
    const validation = validateCurrentStep();
    if (validation) {
      setError(validation);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const created = await createPropertyComplete(draft);
      localStorage.removeItem('accommodation_onboarding_step');
      localStorage.removeItem('accommodation_onboarding_draft');
      navigate(created?.id ? `/merchant-dashboard/accommodation/${created.id}/manage/details` : '/merchant-dashboard/accommodation');
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, 'Failed to create property');
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
