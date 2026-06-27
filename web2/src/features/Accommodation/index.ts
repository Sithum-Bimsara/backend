// ─── Pages ────────────────────────────────────────────────────────────────────
export { default as AddPropertyPage } from '../../pages/Merchant/Accommodation/AddPropertyPage';

// ─── Types (single source of truth) ──────────────────────────────────────────
export * from './types/accommodation.types';

// ─── Components ───────────────────────────────────────────────────────────────
export { default as PropertyTypeSelector } from './components/PropertyTypeSelector';
export { default as StepWizard } from './components/AccommodationForm/Common/StepWizard';
export { default as AmenitiesSelector } from './components/AccommodationForm/Common/AmenitiesSelector';
export { default as AddressForm } from './components/AccommodationForm/Common/AddressForm';
export { default as FacilitiesSelector } from './components/AccommodationForm/Common/FacilitiesSelector';
export { default as HouseRulesForm } from './components/AccommodationForm/Common/HouseRulesForm';
export { default as HostProfileForm } from './components/AccommodationForm/Common/HostProfileForm';
export { ImageUploader } from './components/AccommodationForm/Common/ImageUploader';
export { default as LanguagesSelector } from './components/AccommodationForm/Common/LanguagesSelector';
export { default as PropertyNameForm } from './components/AccommodationForm/Common/PropertyNameForm';
export { default as FinalStep } from './components/AccommodationForm/Common/FinalStep';
