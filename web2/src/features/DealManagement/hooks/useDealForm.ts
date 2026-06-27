import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as dealsApi from '../api/deals.api';
import {
  createDealSchema,
  updateDealSchema,
  generateItineraryAISchema,
  generateAddOnsAISchema,
} from '../dtos/deals.dtos';
import type {
  CreateDealDto,
  UpdateDealDto,
  GenerateItineraryAIDto,
  GenerateAddOnsAIDto,
} from '../dtos/deals.dtos';
import type {
  IDeal,
  IGenerateItineraryAIResponse,
  IGenerateAddOnsAIResponse,
} from '../types/deals.types';
import { ErrorHandler } from '../../../utils/error-handler';

// ─── Create Form Hook ───

interface UseDealCreateFormReturn {
  form: ReturnType<typeof useForm<CreateDealDto>>;
  submitting: boolean;
  aiLoading: boolean;
  onSubmit: (data: CreateDealDto) => Promise<void>;
  generateItinerary: (data: GenerateItineraryAIDto) => Promise<IGenerateItineraryAIResponse>;
  generateAddOns: (data: GenerateAddOnsAIDto) => Promise<IGenerateAddOnsAIResponse>;
}

/**
 * USE-CASE: Create deal screen (CreateDealPage.tsx).
 * Handles full form state, Zod validation, AI generation, submit + navigation.
 */
export function useDealCreateForm(): UseDealCreateFormReturn {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const form = useForm<CreateDealDto>({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      currency: 'USD',
      durationDays: 1,
      dealPrice: 0,
      originalPrice: 0,
      dealLockExpireTime: 15,
      isLocalOnly: false,
      itineraries: [],
      inclusions: [],
      exclusions: [],
    },
  });

  const onSubmit = async (data: CreateDealDto) => {
    setSubmitting(true);
    try {
      const deal = await dealsApi.createDeal(data);
      toast.success('Deal created successfully');
      navigate(`/merchant/deals/${deal.id}`);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'Failed to create deal' });
    } finally {
      setSubmitting(false);
    }
  };

  const generateItinerary = async (
    data: GenerateItineraryAIDto
  ): Promise<IGenerateItineraryAIResponse> => {
    const validated = generateItineraryAISchema.parse(data);
    setAiLoading(true);
    try {
      return await dealsApi.generateItineraryWithAI(validated);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'AI itinerary generation failed' });
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const generateAddOns = async (
    data: GenerateAddOnsAIDto
  ): Promise<IGenerateAddOnsAIResponse> => {
    const validated = generateAddOnsAISchema.parse(data);
    setAiLoading(true);
    try {
      return await dealsApi.generateAddOnsWithAI(validated);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'AI add-ons generation failed' });
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  return { form, submitting, aiLoading, onSubmit, generateItinerary, generateAddOns };
}

// ─── Edit Form Hook ───

interface UseDealEditFormReturn {
  form: ReturnType<typeof useForm<UpdateDealDto>>;
  submitting: boolean;
  aiLoading: boolean;
  initialise: (deal: IDeal) => void;
  onSubmit: (id: string, data: UpdateDealDto) => Promise<void>;
  generateItinerary: (data: GenerateItineraryAIDto) => Promise<IGenerateItineraryAIResponse>;
  generateAddOns: (data: GenerateAddOnsAIDto) => Promise<IGenerateAddOnsAIResponse>;
}

/**
 * USE-CASE: Edit deal screen (EditDealPage.tsx).
 * Pre-populates form from existing deal, partial Zod validation.
 */
export function useDealEditForm(): UseDealEditFormReturn {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const form = useForm<UpdateDealDto>({
    resolver: zodResolver(updateDealSchema),
  });

  const initialise = useCallback(
    (deal: IDeal) => {
      form.reset({
        title: deal.title,
        description: deal.description,
        location: deal.location,
        category: deal.category,
        durationType: deal.durationType ?? undefined,
        durationDays: deal.durationDays,
        dealPrice: deal.dealPrice,
        originalPrice: deal.originalPrice,
        displayedPrice: deal.displayedPrice ?? undefined,
        primaryImageUrl: deal.primaryImageUrl ?? undefined,
        secondImageUrl: deal.secondImageUrl ?? undefined,
        thirdImageUrl: deal.thirdImageUrl ?? undefined,
        fourthImageUrl: deal.fourthImageUrl ?? undefined,
        dealLockExpireTime: deal.dealLockExpireTime,
        isLocalOnly: deal.isLocalOnly,
        currency: deal.currency,
        itineraries: deal.itineraries?.map((it) => ({
          dayNumber: it.dayNumber ?? 1,
          title: it.title ?? '',
          description: it.description ?? undefined,
        })),
        inclusions: deal.inclusions?.map((inc) => ({ description: inc.description ?? '' })),
        exclusions: deal.exclusions?.map((exc) => ({
          description: exc.description ?? '',
          additionalPrice: exc.additionalPrice ?? undefined,
        })),
      });
    },
    [form]
  );

  const onSubmit = async (id: string, data: UpdateDealDto) => {
    setSubmitting(true);
    try {
      await dealsApi.updateDeal(id, data);
      toast.success('Deal updated successfully');
      navigate(`/merchant/deals/${id}`);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'Failed to update deal' });
    } finally {
      setSubmitting(false);
    }
  };

  const generateItinerary = async (
    data: GenerateItineraryAIDto
  ): Promise<IGenerateItineraryAIResponse> => {
    const validated = generateItineraryAISchema.parse(data);
    setAiLoading(true);
    try {
      return await dealsApi.generateItineraryWithAI(validated);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'AI itinerary generation failed' });
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const generateAddOns = async (
    data: GenerateAddOnsAIDto
  ): Promise<IGenerateAddOnsAIResponse> => {
    const validated = generateAddOnsAISchema.parse(data);
    setAiLoading(true);
    try {
      return await dealsApi.generateAddOnsWithAI(validated);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'AI add-ons generation failed' });
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  return { form, submitting, aiLoading, initialise, onSubmit, generateItinerary, generateAddOns };
}
