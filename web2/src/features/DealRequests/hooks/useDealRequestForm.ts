import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../context/useAuth';
import { dealRequestApi } from '../api/deal-request.api';
import { createDealRequestSchema } from '../schemas/deal-request.schema';

export interface DealRequestFormValues {
  contactNumber: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  adults: number;
  children: number;
  travelerType: string;
  preferences: string[];
  accommodationType: string;
  additionalRequests: string;
}

export type StepKey =
  | 'destination'
  | 'travelDates'
  | 'budget'
  | 'travelers'
  | 'preferences'
  | 'accommodation'
  | 'additionalRequests'
  | 'review';

export const steps: { key: StepKey; label: string }[] = [
  { key: 'destination', label: 'Destination' },
  { key: 'travelDates', label: 'Dates' },
  { key: 'budget', label: 'Budget' },
  { key: 'travelers', label: 'Travelers' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'accommodation', label: 'Stay' },
  { key: 'additionalRequests', label: 'Requests' },
  { key: 'review', label: 'Review' },
];

interface UseDealRequestFormOptions {
  showInlineSuccess?: boolean;
  onSuccess?: (message: string) => void;
}

export const useDealRequestForm = (options: UseDealRequestFormOptions = {}) => {
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DealRequestFormValues>({
    defaultValues: {
      contactNumber: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      adults: 2,
      children: 0,
      travelerType: 'Couple',
      preferences: ['Beach'],
      accommodationType: 'Any',
      additionalRequests: '',
    },
  });

  const { setValue, watch, reset } = form;
  const watchedValues = watch();

  // Pre-fill user's contact number if available
  useEffect(() => {
    if (user?.contactNumber) {
      setValue('contactNumber', user.contactNumber);
    }
  }, [user?.contactNumber, setValue]);

  const progressPercent = ((currentStep + 1) / steps.length) * 100;
  const currentStepLabel = steps[currentStep]?.label ?? 'Request';

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    reset({
      contactNumber: user?.contactNumber || '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      adults: 2,
      children: 0,
      travelerType: 'Couple',
      preferences: ['Beach'],
      accommodationType: 'Any',
      additionalRequests: '',
    });
    setCurrentStep(0);
    setSubmitError(null);
    setSuccess(null);
  };

  const togglePreference = (preference: string) => {
    const currentPreferences = watchedValues.preferences || [];
    const updated = currentPreferences.includes(preference)
      ? currentPreferences.filter((item) => item !== preference)
      : [...currentPreferences, preference];
    setValue('preferences', updated);
  };

  const buildMessage = (values: DealRequestFormValues) => {
    const summaryLines = [
      `Destination: Maldives - ${values.destination || 'Not specified'}`,
      `Travel dates: ${values.startDate} to ${values.endDate}`,
      `Budget: ${values.budget}`,
      `Travelers: ${values.adults} adults, ${values.children} children, ${values.travelerType}`,
      `Preferences: ${(values.preferences || []).join(', ')}`,
      `Accommodation: ${values.accommodationType}`,
      values.additionalRequests ? `Additional requests: ${values.additionalRequests}` : null,
    ].filter(Boolean);

    return summaryLines.join('\n');
  };

  const onSubmit = async (values: DealRequestFormValues) => {
    if (!user) {
      setSubmitError('Please sign in before submitting a deal request.');
      return;
    }

    // Step validation for contact number before submit
    const dtoValidation = createDealRequestSchema.safeParse({
      contactNumber: values.contactNumber.trim(),
      message: buildMessage(values),
    });

    if (!dtoValidation.success) {
      const errorMsg = dtoValidation.error.issues[0]?.message || 'Invalid form entry';
      setSubmitError(errorMsg);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      await dealRequestApi.createDealRequest({
        contactNumber: values.contactNumber.trim(),
        message: buildMessage(values),
      });

      const successMessage = 'Your request has been sent to our team.';
      if (options.showInlineSuccess) {
        setSuccess(successMessage);
      }
      options.onSuccess?.(successMessage);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    watchedValues,
    currentStep,
    progressPercent,
    currentStepLabel,
    steps,
    submitting,
    success,
    submitError,
    authLoading,
    user,
    actions: {
      goNext,
      goBack,
      setCurrentStep,
      handleReset,
      togglePreference,
      onSubmit: form.handleSubmit(onSubmit),
      updateField: setValue,
    },
  };
};
