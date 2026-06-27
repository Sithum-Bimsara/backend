import { useState, useCallback } from 'react';
import * as dealsApi from '../api/deals.api';
import type { CreateDealDto, GenerateItineraryAIInput } from '../dtos/deals.dtos';

export interface AISettings {
  travelerType: string;
  travelStyle: string;
  accommodationLevel: string;
  pace: 'relaxed' | 'balanced' | 'packed';
}

export function useDealAIGenerator() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);
  const [aiCurrentDay, setAiCurrentDay] = useState(1);
  const [addonsAILoading, setAddonsAILoading] = useState(false);
  const [addonsAIError, setAddonsAIError] = useState<string | null>(null);

  const [aiSettings, setAiSettings] = useState<AISettings>({
    travelerType: 'couples',
    travelStyle: 'relaxation',
    accommodationLevel: '4-star',
    pace: 'balanced',
  });

  const generateDayItinerary = useCallback(
    async (
      data: CreateDealDto,
      onChange: (data: Partial<CreateDealDto>) => void,
      input: GenerateItineraryAIInput,
      inferredDays: number
    ) => {
      if (!data.title?.trim()) {
        setAiError('Please add deal title in Basic Info before AI generation.');
        return;
      }

      if (!data.location?.trim()) {
        setAiError('Please add location in Basic Info before AI generation.');
        return;
      }

      try {
        setAiLoading(true);
        setAiError(null);
        setAiSuccess(null);

        const contextItineraries = (data.itineraries || [])
          .filter((item) => item.dayNumber !== aiCurrentDay)
          .filter((item) => item.title?.trim() || item.description?.trim())
          .map((item) => ({
            dayNumber: item.dayNumber,
            title: item.title,
            description: item.description,
          }));

        const previousItineraries =
          aiCurrentDay === 1
            ? []
            : contextItineraries
                .filter((item) => (item.dayNumber || 0) < aiCurrentDay)
                .sort((a, b) => a.dayNumber - b.dayNumber);

        const futureItineraries =
          aiCurrentDay === inferredDays
            ? []
            : contextItineraries
                .filter((item) => (item.dayNumber || 0) > aiCurrentDay)
                .sort((a, b) => a.dayNumber - b.dayNumber);

        const generated = await dealsApi.generateItineraryWithAI({
          ...input,
          title: data.title,
          description: data.description,
          location: data.location,
          durationDays: inferredDays,
          generationDay: aiCurrentDay,
          previousItineraries,
          futureItineraries,
          travelerType: aiSettings.travelerType,
          travelStyle: aiSettings.travelStyle,
          accommodationLevel: aiSettings.accommodationLevel,
          pace: aiSettings.pace,
        });

        const generatedDay =
          generated.itineraries.find((item) => item.dayNumber === aiCurrentDay) ||
          generated.itineraries[0];

        if (!generatedDay) {
          throw new Error(`Failed to generate Day ${aiCurrentDay}`);
        }

        const currentItineraries = [...(data.itineraries || [])];
        const dayIndex = currentItineraries.findIndex(
          (item) => item.dayNumber === aiCurrentDay
        );
        const dayPayload = {
          dayNumber: aiCurrentDay,
          title: generatedDay.title,
          description: generatedDay.description,
        };

        if (dayIndex >= 0) {
          currentItineraries[dayIndex] = dayPayload;
        } else {
          currentItineraries.push(dayPayload);
        }

        const sortedItineraries = currentItineraries
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((item, index) => ({
            dayNumber: item.dayNumber || index + 1,
            title: item.title,
            description: item.description,
          }));

        onChange({
          itineraries: sortedItineraries,
        });

        setAiSuccess(`Day ${aiCurrentDay} generated successfully!`);
        return true;
      } catch (error: unknown) {
        const message =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message === 'string'
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : error instanceof Error
            ? error.message
            : 'Failed to generate day itinerary';

        setAiError(message || 'Failed to generate day itinerary');
        return false;
      } finally {
        setAiLoading(false);
      }
    },
    [aiCurrentDay, aiSettings]
  );

  const generateAddOns = useCallback(
    async (
      data: CreateDealDto,
      onChange: (data: Partial<CreateDealDto>) => void
    ) => {
      if (!data.title?.trim()) {
        setAddonsAIError('Please add deal title in Basic Info before AI generation.');
        return false;
      }

      if (!data.location?.trim()) {
        setAddonsAIError('Please add location in Basic Info before AI generation.');
        return false;
      }

      if (!data.durationDays || data.durationDays <= 0) {
        setAddonsAIError('Please add duration in Basic Info before AI generation.');
        return false;
      }

      if (!data.itineraries || data.itineraries.length === 0) {
        setAddonsAIError('Please add or generate itinerary days before generating add-ons.');
        return false;
      }

      try {
        setAddonsAILoading(true);
        setAddonsAIError(null);

        const generated = await dealsApi.generateAddOnsWithAI({
          title: data.title,
          description: data.description,
          location: data.location,
          durationDays: data.durationDays,
          dealPrice: data.dealPrice,
          displayedPrice: data.displayedPrice,
          itineraries: data.itineraries,
        });

        onChange({
          inclusions: generated.inclusions.map((item) => ({
            description: item.description,
          })),
          exclusions: generated.exclusions.map((item) => ({
            description: item.description,
            additionalPrice: item.additionalPrice,
          })),
        });
        return true;
      } catch (error: unknown) {
        const message =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message === 'string'
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : error instanceof Error
            ? error.message
            : 'Failed to generate add-ons';

        setAddonsAIError(message || 'Failed to generate add-ons');
        return false;
      } finally {
        setAddonsAILoading(false);
      }
    },
    []
  );

  return {
    aiLoading,
    aiError,
    aiSuccess,
    aiCurrentDay,
    addonsAILoading,
    addonsAIError,
    aiSettings,
    setAiSettings,
    setAiCurrentDay,
    setAiError,
    setAiSuccess,
    setAddonsAIError,
    generateDayItinerary,
    generateAddOns,
  };
}
