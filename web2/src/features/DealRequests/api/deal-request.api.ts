import { api } from '../../../lib/api';
import type { CreateDealRequestDto } from '../schemas/deal-request.schema';
import type { IViewDealRequest } from '../types/deal-request.types';

/**
 * ─── Pure Data Fetching API Layer ───
 */
export const dealRequestApi = {
  /**
   * Submits a custom package deal request.
   */
  createDealRequest: async (data: CreateDealRequestDto): Promise<IViewDealRequest> => {
    const response = await api.post<IViewDealRequest>('/deal-requests', data);
    return response.data;
  },
};
