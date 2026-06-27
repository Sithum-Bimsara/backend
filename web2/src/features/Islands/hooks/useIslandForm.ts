import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/island.api';
import type { CreateIslandDto } from '../schemas/island.dto';
import type { IslandFormDraft, MonsoonalCondition } from '../types/island.types';

export const DEFAULT_ISLAND: IslandFormDraft = {
  name: '',
  categories: [],
  overview: '',
  bestFor: '',
  activities: [],
  marineLifeZones: [],
  nightlife: '',
  safetyText: '',
  internetText: '',
  transferDetails: [],
  bestTimeMonths: Array(12).fill('good') as MonsoonalCondition[],
  bestTimeTextBest: '',
  bestTimeTextAvoid: '',
  bestTimeTextTips: '',
  costLocal: '',
  costNonLocal: '',
  costFoodDrinks: '',
  costActivities: '',
  costExtra: '',
  sampleDay: [],
  foodAndDrinkDeals: [],
  insiderTips: [],
  images: [],
};

const STEPS = [
  'Basic Info & Vibe',
  'Activities & Wildlife',
  'Practical Details',
  'Best Time Calendar',
  'Financial Breakdown',
  'High-res Imagery',
  'Custom Timelines & Food Deals',
];

export const useIslandForm = (islandId?: string) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('island_form_step');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [draft, setDraft] = useState<IslandFormDraft>(() => {
    // If updating, we fetch instead. But for initial load:
    if (islandId) return DEFAULT_ISLAND;

    const saved = localStorage.getItem('island_form_draft');
    if (!saved) return DEFAULT_ISLAND;

    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_ISLAND, ...parsed };
    } catch {
      return DEFAULT_ISLAND;
    }
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync draft to local storage only if NOT editing
  useEffect(() => {
    if (!islandId) {
      localStorage.setItem('island_form_draft', JSON.stringify(draft));
    }
  }, [draft, islandId]);

  useEffect(() => {
    if (!islandId) {
      localStorage.setItem('island_form_step', currentStep.toString());
    }
  }, [currentStep, islandId]);

  // Load existing island details if editing
  useEffect(() => {
    const loadIsland = async () => {
      if (!islandId) return;
      setFetching(true);
      setError(null);
      try {
        const island = await api.getIslandById(islandId);
        setDraft({
          name: island.name,
          categories: island.categories,
          overview: island.overview,
          bestFor: island.bestFor,
          activities: island.activities,
          marineLifeZones: island.marineLifeZones,
          nightlife: island.nightlife,
          safetyText: island.safetyText,
          internetText: island.internetText,
          transferDetails: island.transferDetails,
          bestTimeMonths: island.bestTimeMonths as any,
          bestTimeTextBest: island.bestTimeTextBest || '',
          bestTimeTextAvoid: island.bestTimeTextAvoid || '',
          bestTimeTextTips: island.bestTimeTextTips || '',
          costLocal: island.costLocal,
          costNonLocal: island.costNonLocal,
          costFoodDrinks: island.costFoodDrinks,
          costActivities: island.costActivities,
          costExtra: island.costExtra,
          sampleDay: island.sampleDay || [],
          foodAndDrinkDeals: island.foodAndDrinkDeals || [],
          insiderTips: island.insiderTips || [],
          images: island.images || [],
        });
      } catch (err: any) {
        setError('Failed to load island details for editing');
      } finally {
        setFetching(false);
      }
    };
    loadIsland();
  }, [islandId]);

  const patchDraft = useCallback((patch: Partial<IslandFormDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 0:
        if (!draft.name.trim()) return 'Island name is required.';
        if (draft.categories.length === 0) return 'At least one category is required.';
        if (!draft.overview.trim()) return 'Overview is required.';
        if (!draft.bestFor.trim()) return 'Best for summary is required.';
        return null;
      case 1:
        if (draft.activities.length === 0) return 'At least one activity is required.';
        if (draft.marineLifeZones.length === 0) return 'At least one marine life zone highlight is required.';
        if (!draft.nightlife.trim()) return 'Nightlife description is required.';
        return null;
      case 2:
        if (!draft.safetyText.trim()) return 'Safety text is required.';
        if (!draft.internetText.trim()) return 'Internet info is required.';
        if (draft.transferDetails.length === 0) return 'At least one transfer mode is required.';
        return null;
      case 3:
        if (draft.bestTimeMonths.length !== 12) return 'Must provide best time conditions for all 12 months.';
        return null;
      case 4:
        if (!draft.costLocal || Number(draft.costLocal) <= 0) return 'Stay Price (Local Residents) must be greater than zero.';
        if (!draft.costNonLocal || Number(draft.costNonLocal) <= 0) return 'Stay Price (Foreign Tourists) must be greater than zero.';
        if (!draft.costFoodDrinks || Number(draft.costFoodDrinks) <= 0) return 'Average Food & Drinks Cost must be greater than zero.';
        if (!draft.costActivities || Number(draft.costActivities) <= 0) return 'Average Activities Cost must be greater than zero.';
        if (!draft.costExtra || Number(draft.costExtra) <= 0) return 'Extra Fees must be greater than zero.';
        return null;
      case 5:
        if (draft.images.length === 0) return 'At least 1 image is required.';
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (!islandId) {
      localStorage.removeItem('island_form_draft');
      localStorage.removeItem('island_form_step');
    }
    setDraft(DEFAULT_ISLAND);
    setCurrentStep(0);
    setError(null);
  };

  const handleSubmit = async () => {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: CreateIslandDto = {
        ...draft,
        costLocal: Number(draft.costLocal),
        costNonLocal: Number(draft.costNonLocal),
        costFoodDrinks: Number(draft.costFoodDrinks),
        costActivities: Number(draft.costActivities),
        costExtra: Number(draft.costExtra),
        bestTimeMonths: draft.bestTimeMonths as any,
      };
      if (islandId) {
        await api.updateIsland(islandId, payload);
      } else {
        await api.createIsland(payload);
        localStorage.removeItem('island_form_draft');
        localStorage.removeItem('island_form_step');
      }
      navigate('/admin/islands'); // Redirect back to admin islands list page
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit island data');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return {
    steps: STEPS,
    currentStep,
    draft,
    loading,
    fetching,
    error,
    patchDraft,
    handleNext,
    handleBack,
    handleReset,
    handleSubmit,
    setCurrentStep,
    setError,
  };
};
