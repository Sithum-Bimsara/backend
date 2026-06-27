import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StepIndicator from './StepIndicator';
import BasicInfoStep from './BasicInfoStep';
import PricingStep from './PricingStep';
import ImagesStep from './ImagesStep';
import DetailsStep from './DetailsStep';
import type { CreateDealDto } from '../../dtos/deals.dtos';
import { MerchantActionButton, MerchantConfirmModal } from '../../../../features/MerchantProfile/components/MerchantUI';
import { AnimatePresence } from 'framer-motion';
import FormErrorBanner from '../../../../components/FormErrorBanner/FormErrorBanner';

interface DealFormProps {
  onSubmit: (data: CreateDealDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateDealDto>;
  isEdit?: boolean;
}

const STEPS = ['Basic Info', 'Pricing', 'Images', 'Details'];

const defaultFormData: CreateDealDto = {
  title: '',
  description: '',
  location: '',
  category: '',
  durationType: 'days',
  durationDays: 0,
  dealPrice: 0,
  originalPrice: 0,
  displayedPrice: 0,
  primaryImageUrl: '',
  secondImageUrl: '',
  thirdImageUrl: '',
  fourthImageUrl: '',
  itineraries: [],
  inclusions: [],
  exclusions: [],
  isLocalOnly: false,
  currency: 'USD',
  dealLockExpireTime: 1, // Default 1 day
};

const DealForm: React.FC<DealFormProps> = ({ onSubmit, onCancel, initialData, isEdit }) => {
  const [step, setStep] = useState<number>(() => {
    if (isEdit) return 0;
    const saved = localStorage.getItem('deal_onboarding_step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [formData, setFormData] = useState<CreateDealDto>(() => {
    const base = {
      ...defaultFormData,
      ...initialData,
    };
    if (isEdit) return base;
    const saved = localStorage.getItem('deal_onboarding_draft');
    if (!saved) return base;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...base,
        ...parsed,
      };
    } catch {
      return base;
    }
  });

  const [loading, setLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  // Persist current step to localStorage in creation flow
  useEffect(() => {
    if (!isEdit) {
      localStorage.setItem('deal_onboarding_step', step.toString());
    }
  }, [step, isEdit]);

  // Persist form data to localStorage in creation flow
  useEffect(() => {
    if (!isEdit) {
      localStorage.setItem('deal_onboarding_draft', JSON.stringify(formData));
    }
  }, [formData, isEdit]);

  const handleChange = (partial: Partial<CreateDealDto>) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    localStorage.removeItem('deal_onboarding_draft');
    localStorage.removeItem('deal_onboarding_step');
    setFormData({
      ...defaultFormData,
      ...initialData,
    });
    setStep(0);
    setError(null);
    setShowResetModal(false);
  };

  const handleNext = () => {
    if (step === 0) {
      if (!formData.title.trim()) {
        setError('Deal title is required');
        return;
      }
      if (/[^a-zA-Z\s]/.test(formData.title)) {
        setError('Deal title cannot contain numbers or symbols. Letters and spaces only.');
        return;
      }
      if (!formData.description?.trim()) {
        setError('Description is required');
        return;
      }
      if (!formData.location?.trim()) {
        setError('Location is required');
        return;
      }
      if (!formData.category?.trim()) {
        setError('Category is required');
        return;
      }
      if (formData.durationDays === undefined || formData.durationDays <= 0) {
        setError('Number of Days is required and must be greater than 0');
        return;
      }
      if (formData.dealLockExpireTime === undefined || formData.dealLockExpireTime <= 0) {
        setError('Lock Expiry is required and must be greater than 0');
        return;
      }
    }

    if (step === 1) {
      if (formData.originalPrice === undefined || Number.isNaN(formData.originalPrice) || formData.originalPrice <= 0) {
        setError('Original Price is required and must be greater than 0');
        return;
      }
      if (/[^0-9.]/.test(formData.originalPrice.toString())) {
        setError('Original Price cannot contain letters, negative signs, or symbols.');
        return;
      }

      if (formData.dealPrice === undefined || Number.isNaN(formData.dealPrice) || formData.dealPrice <= 0) {
        setError('Deal Price is required and must be greater than 0');
        return;
      }
      if (/[^0-9.]/.test(formData.dealPrice.toString())) {
        setError('Deal Price cannot contain letters, negative signs, or symbols.');
        return;
      }

      const rate = formData.isLocalOnly ? 0.08 : 0.03;
      const displayedPrice = Math.round(formData.dealPrice * (1 + rate));
      const symbol = formData.currency === 'MVR' ? 'MVR' : '$';
      if (displayedPrice >= formData.originalPrice) {
        setError(`Displayed Price (${symbol}${displayedPrice}) must be lower than Original Price (${symbol}${formData.originalPrice}). Please lower your Deal Price.`);
        return;
      }
    }

    if (step === 2 && isUploadingImages) {
      setError('Please wait until all images finish uploading.');
      return;
    }

    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const buildRowValidationMessage = () => {
    const itineraryIssues: string[] = [];
    (formData.itineraries || []).forEach((item, index) => {
      if (!item.title?.trim()) {
        itineraryIssues.push(`Itinerary day ${index + 1} needs a title.`);
      }
      if (!item.description?.trim()) {
        itineraryIssues.push(`Itinerary day ${index + 1} needs a description.`);
      }
    });

    const inclusionIssues = (formData.inclusions || [])
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.description?.trim())
      .map(({ index }) => `Inclusion ${index + 1} needs a description.`);

    const exclusionIssues = (formData.exclusions || [])
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.description?.trim())
      .map(({ index }) => `Exclusion ${index + 1} needs a description.`);

    const issues = [...itineraryIssues, ...inclusionIssues, ...exclusionIssues];
    if (issues.length === 0) return null;

    return `Please complete the highlighted rows before creating the deal: ${issues.join(' ')}`;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Deal title is required');
      return;
    }

    if (!formData.durationDays) {
      setError('Number of Days is required');
      return;
    }

    const rowValidationMessage = buildRowValidationMessage();
    if (rowValidationMessage) {
      setError(rowValidationMessage);
      return;
    }

    const itineraryDays = (formData.itineraries || []).length;
    if (itineraryDays !== formData.durationDays) {
      const expectedLabel = formData.durationDays === 1 ? '1 day' : `${formData.durationDays} days`;
      const actualLabel = itineraryDays === 1 ? '1 itinerary day' : `${itineraryDays} itinerary days`;
      const difference = Math.abs(formData.durationDays - itineraryDays);
      const actionLabel = itineraryDays < formData.durationDays
        ? `Please add ${difference === 1 ? '1 more itinerary day' : `${difference} more itinerary days`}.`
        : `Please remove ${difference === 1 ? '1 itinerary day' : `${difference} itinerary days`}.`;

      setError(
        `Your package duration is set to ${expectedLabel}, but you have added ${actualLabel}. ${actionLabel} The number of itinerary days must match the package duration before you can create the deal.`
      );
      return;
    }

    if (isUploadingImages) {
      setError('Please wait until all images finish uploading.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Clean up empty optional strings to undefined to satisfy backend strict validation
      const cleanedData = { ...formData };
      cleanedData.durationType = 'days';
      const keysToClean: (keyof CreateDealDto)[] = [
        'description', 'primaryImageUrl', 'secondImageUrl', 'thirdImageUrl', 'fourthImageUrl'
      ];
      keysToClean.forEach(key => {
        if (cleanedData[key] === '') {
          delete cleanedData[key];
        }
      });
      await onSubmit(cleanedData);
      if (!isEdit) {
        localStorage.removeItem('deal_onboarding_draft');
        localStorage.removeItem('deal_onboarding_step');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data;
        if (respData?.errors) {
          // format zod errors into a string
          const errorMsgs = Object.entries(respData.errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join(' | ');
          setError(errorMsgs);
        } else {
          setError(respData?.message || err.message || 'Failed to save deal');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save deal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 lg:px-8 py-2 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-[#0e2a47]">{isEdit ? 'Edit Deal' : 'Create New Deal'}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isEdit ? 'Update your deal information' : 'Set up a new travel package for your customers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEdit && (
            <MerchantActionButton
              onClick={() => setShowResetModal(true)}
              variant="danger"
              showArrow={false}
            >
              Reset Draft
            </MerchantActionButton>
          )}
          <MerchantActionButton
            onClick={onCancel}
            variant="secondary"
            showArrow={false}
          >
            Close
          </MerchantActionButton>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <AnimatePresence mode="wait">
          <FormErrorBanner error={error} />
        </AnimatePresence>

        {step === 0 && <BasicInfoStep data={formData} onChange={handleChange} />}
        {step === 1 && <PricingStep data={formData} onChange={handleChange} />}
        {step === 2 && (
          <ImagesStep
            data={formData}
            onChange={handleChange}
            onUploadStatusChange={setIsUploadingImages}
          />
        )}
        {step === 3 && <DetailsStep data={formData} onChange={handleChange} />}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-4">
        <MerchantActionButton
          onClick={step === 0 ? onCancel : handleBack}
          variant="secondary"
          showArrow={step !== 0}
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </MerchantActionButton>

        {step < STEPS.length - 1 ? (
          <MerchantActionButton
            onClick={handleNext}
            variant="primary"
          >
            Next →
          </MerchantActionButton>
        ) : (
          <MerchantActionButton
            onClick={handleSubmit}
            variant="primary"
            disabled={loading || isUploadingImages}
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
              </svg>
            )}
            {isUploadingImages ? 'Uploading Images...' : isEdit ? 'Save Changes' : 'Create Deal'}
          </MerchantActionButton>
        )}
      </div>

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

export default DealForm;
