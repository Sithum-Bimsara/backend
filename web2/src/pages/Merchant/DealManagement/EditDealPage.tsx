import React, { useState, useEffect } from 'react';
import DealForm from '../../../features/DealManagement/components/DealForm/DealForm';
import type { IDeal } from '../../../features/DealManagement/types/deals.types';
import type { UpdateDealDto } from '../../../features/DealManagement/dtos/deals.dtos';
import * as dealsApi from '../../../features/DealManagement/api/deals.api';
import { MerchantActionButton, MerchantCardsSkeleton } from '../../../features/MerchantProfile/components/MerchantUI';
import { ErrorHandler } from '../../../utils/error-handler';

interface Props {
  dealId: string;
  onDealUpdated: (dealId: string) => void;
  onCancel: () => void;
}

const EditDealPage: React.FC<Props> = ({ dealId, onDealUpdated, onCancel }) => {
  const [deal, setDeal] = useState<IDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const data = await dealsApi.getDeal(dealId);
        setDeal(data);
      } catch (err: unknown) {
        setError(ErrorHandler.getErrorMessage(err, 'Failed to fetch deal'));
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [dealId]);

  const handleSubmit = async (data: UpdateDealDto) => {
    setError(null);
    try {
      await dealsApi.updateDeal(dealId, data);
      onDealUpdated(dealId);
    } catch (err) {
      ErrorHandler.handle(err, { fallbackMessage: 'Failed to update deal' });
    }
  };

  if (loading) {
    return (
      <div className="px-4 lg:px-8 py-6 space-y-6">
        <div className="h-8 w-52 bg-slate-200 rounded animate-pulse" />
        <MerchantCardsSkeleton cards={3} />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="px-4 lg:px-8 py-12 text-center text-red-500">
        <p>{error || 'Deal not found'}</p>
        <div className="mt-4 flex justify-center">
          <MerchantActionButton onClick={onCancel} variant="secondary">
            Back
          </MerchantActionButton>
        </div>
      </div>
    );
  }

  // Map IDeal back to UpdateDealDto for the form
  const initialData: UpdateDealDto = {
    title: deal.title || '',
    description: deal.description || '',
    location: deal.location || '',
    category: deal.category || '',
    durationType: 'days',
    durationDays: deal.durationDays ?? undefined,
    dealPrice: deal.dealPrice ?? undefined,
    originalPrice: deal.originalPrice ?? undefined,
    displayedPrice: deal.displayedPrice ?? undefined,
    primaryImageUrl: deal.primaryImageUrl || '',
    secondImageUrl: deal.secondImageUrl || '',
    thirdImageUrl: deal.thirdImageUrl || '',
    fourthImageUrl: deal.fourthImageUrl || '',
    itineraries: (deal.itineraries || []).map(it => ({
      dayNumber: it.dayNumber || 0,
      title: it.title || '',
      description: it.description || ''
    })),
    inclusions: (deal.inclusions || []).map(inc => ({
      description: inc.description || ''
    })),
    exclusions: (deal.exclusions || []).map(exc => ({
      description: exc.description || '',
      additionalPrice: exc.additionalPrice ?? undefined
    })),
    isLocalOnly: deal.isLocalOnly,
    currency: deal.currency || (deal.isLocalOnly ? 'MVR' : 'USD'),
    dealLockExpireTime: deal.dealLockExpireTime ?? undefined,
  };

  return (
    <DealForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
      initialData={initialData}
      isEdit={true}
    />
  );
};

export default EditDealPage;
