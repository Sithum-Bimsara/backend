import React from 'react';
import DealForm from '../../../features/DealManagement/components/DealForm/DealForm';
import * as dealsApi from '../../../features/DealManagement/api/deals.api';
import type { CreateDealDto } from '../../../features/DealManagement/dtos/deals.dtos';

interface Props {
  onDealCreated: (dealId: string) => void;
  onCancel: () => void;
}

const CreateDealPage: React.FC<Props> = ({ onDealCreated, onCancel }) => {
  const handleSubmit = async (data: CreateDealDto) => {
    const deal = await dealsApi.createDeal(data);
    onDealCreated(deal.id);
  };

  return (
    <DealForm
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default CreateDealPage;
