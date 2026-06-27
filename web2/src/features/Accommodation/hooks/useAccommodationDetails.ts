import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { IAccommodationView, PropertyImage, IUnit, IMarineLifeZone, INearbyPOI } from '../types/accommodation.types';
import type { UpdatePropertyDto } from '../dtos/accommodation.dto';
import { addUnitToProperty, getPropertyById, updateProperty, updatePropertyImages, updateUnit } from '../api/accommodation.api';
import { ErrorHandler } from '../../../utils/error-handler';

export type PropertyEditDraft = UpdatePropertyDto & {
  houseRules?: NonNullable<UpdatePropertyDto['houseRules']>;
};

const DEFAULT_HOUSE_RULES: NonNullable<UpdatePropertyDto['houseRules']> = {
  smokingAllowed: false,
  childrenAllowed: false,
  partiesAllowed: false,
  petsPolicy: { mode: 'request' },
  petFeesPolicy: { amount: '' },
  checkInFrom: '14:00',
  checkInTo: '22:00',
  checkOutFrom: '07:00',
  checkOutTo: '11:00',
};

const mapDraftUnitToPropertyUnit = (unit: IUnit): IAccommodationView['units'][number] => ({
  ...unit,
  id: unit.id || crypto.randomUUID(),
  verificationStatus: unit.verificationStatus || 'PENDING',
  bedConfigs: (unit.bedConfigurations || []).map((bedConfiguration) => ({
    id: crypto.randomUUID(),
    bedType: bedConfiguration.bedType,
    count: bedConfiguration.count,
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

export const useAccommodationDetails = (propertyId: string) => {
  const [property, setProperty] = useState<IAccommodationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [localPropertyData, setLocalPropertyData] = useState<PropertyEditDraft>({});

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPropertyById(propertyId);
      setProperty(data);
    } catch (err: unknown) {
      const msg = ErrorHandler.getErrorMessage(err, 'Failed to load property');
      setError(msg);
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: msg });
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void fetchProperty();
  }, [fetchProperty]);

  const handleUpdateProperty = async (data: UpdatePropertyDto) => {
    try {
      await updateProperty(propertyId, data);
      setProperty((current) => (current ? { ...current, ...data } : current));
      setIsEditingProperty(false);
      toast.success('Property updated successfully');
    } catch (err: unknown) {
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: 'Failed to update property' });
    }
  };

  const upsertUnitInPropertyState = (savedUnit: IUnit) => {
    setProperty((current) => {
      if (!current) return current;

      const nextUnit = mapDraftUnitToPropertyUnit(savedUnit);
      const existingIndex = current.units.findIndex((unit) => unit.id === savedUnit.id);
      const nextUnits = existingIndex >= 0
        ? current.units.map((unit) => (unit.id === savedUnit.id ? nextUnit : unit))
        : [...current.units, nextUnit];

      return {
        ...current,
        units: nextUnits,
      };
    });
  };

  const handleUnitSave = async (unit: IUnit) => {
    try {
      const unitExists = property?.units?.some((existingUnit) => existingUnit.id === unit.id);

      if (unitExists && unit.id) {
        await updateUnit(propertyId, unit.id, unit);
      } else {
        await addUnitToProperty(propertyId, unit);
      }

      upsertUnitInPropertyState(unit);
      toast.success('Unit saved successfully');
    } catch (err: unknown) {
      ErrorHandler.handle(err, { showToast: true, fallbackMessage: 'Failed to save unit' });
      throw err;
    }
  };

  const startEditing = () => {
    if (!property) return;
    setLocalPropertyData({
      type: property.type ?? undefined,
      name: property.name ?? undefined,
      description: property.description ?? undefined,
      address: property.address ?? undefined,
      city: property.city ?? undefined,
      island: property.island ?? undefined,
      zipCode: property.zipCode ?? undefined,
      latitude: property.latitude ?? undefined,
      longitude: property.longitude ?? undefined,
      starRating: property.starRating ?? undefined,
      homeListingType: property.homeListingType || 'private_room',
      propertyFacilities: property.propertyFacilities ?? undefined,
      services: (property.services as UpdatePropertyDto['services']) || undefined,
      languages: property.languages ?? undefined,
      houseRules: property.hostProfile ? {
        smokingAllowed: property.smokingAllowed ?? false,
        childrenAllowed: property.childrenAllowed ?? false,
        partiesAllowed: property.partiesAllowed ?? false,
        petsPolicy: property.petsPolicy,
        petFeesPolicy: property.petFeesPolicy,
        checkInFrom: property.checkInFrom ?? '14:00',
        checkInTo: property.checkInTo ?? '22:00',
        checkOutFrom: property.checkOutFrom ?? '07:00',
        checkOutTo: property.checkOutTo ?? '11:00',
      } : DEFAULT_HOUSE_RULES,
      hostProfile: {
        propertyDescription: property.hostProfile?.propertyDescription ?? '',
        hostDescription: property.hostProfile?.hostDescription ?? '',
        neighborhoodDescription: property.hostProfile?.neighborhoodDescription ?? '',
      },
      nearbyPointsOfInterest: property.nearbyPointsOfInterest ?? [],
      marineLifeZones: property.marineLifeZones ?? [],
    });
    setIsEditingProperty(true);
  };

  const updateLocalProperty = (patch: Partial<UpdatePropertyDto>) => {
    setLocalPropertyData((prev) => ({ ...prev, ...patch }));
  };

  const updateNearbyPoint = (index: number, patch: Partial<INearbyPOI>) => {
    setLocalPropertyData((prev) => {
      const next = [...(prev.nearbyPointsOfInterest || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, nearbyPointsOfInterest: next };
    });
  };

  const addNearbyPoint = () => {
    setLocalPropertyData((prev) => ({
      ...prev,
      nearbyPointsOfInterest: [...(prev.nearbyPointsOfInterest || []), { name: '', distanceText: '' }],
    }));
  };

  const removeNearbyPoint = (index: number) => {
    setLocalPropertyData((prev) => ({
      ...prev,
      nearbyPointsOfInterest: (prev.nearbyPointsOfInterest || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateMarineZone = (index: number, patch: Partial<IMarineLifeZone>) => {
    setLocalPropertyData((prev) => {
      const next = [...(prev.marineLifeZones || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, marineLifeZones: next };
    });
  };

  const addMarineZone = () => {
    setLocalPropertyData((prev) => ({
      ...prev,
      marineLifeZones: [...(prev.marineLifeZones || []), { zone: '', description: '' }],
    }));
  };

  const removeMarineZone = (index: number) => {
    setLocalPropertyData((prev) => ({
      ...prev,
      marineLifeZones: (prev.marineLifeZones || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updatePropertyImagesOnServer = async (images: PropertyImage[]) => {
    await updatePropertyImages(propertyId, images.map((image) => ({ url: image.url || image.previewUrl! })));
    await fetchProperty();
  };

  return {
    property,
    setProperty,
    loading,
    error,
    isEditingProperty,
    setIsEditingProperty,
    localPropertyData,
    setLocalPropertyData,
    fetchProperty,
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
  };
};
