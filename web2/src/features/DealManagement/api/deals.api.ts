import { api } from '../../../lib/api';
import type {
  CreateDealDto,
  UpdateDealDto,
  UpdateVariantDto,
  BulkGenerateVariantsDto,
  ListDealsQueryDto,
  DateRangeQueryDto,
  VariantsQueryDto,
  GenerateItineraryAIDto,
  GenerateAddOnsAIDto,
} from '../dtos/deals.dtos';
import type {
  IDeal,
  IDealVariant,
  IPaginatedDealsResponse,
  IDealAnalytics,
  IBulkGenerateResult,
  IBulkPreviewResult,
  ISlotActionResponse,
  IGenerateItineraryAIResponse,
  IGenerateAddOnsAIResponse,
  IDealLock,
  IDealBooking,
} from '../types/deals.types';

const BASE = '/deals';

// ─── Deal API ───

export const createDeal = async (data: CreateDealDto): Promise<IDeal> => {
  const res = await api.post(BASE, data);
  return res.data;
};

export const getDeal = async (id: string): Promise<IDeal> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const getMyDeals = async (params?: ListDealsQueryDto): Promise<IPaginatedDealsResponse> => {
  const res = await api.get(`${BASE}/mine`, { params });
  return res.data;
};

export const updateDeal = async (id: string, data: UpdateDealDto): Promise<IDeal> => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};


export const getDealAnalytics = async (
  dealId: string,
  params?: DateRangeQueryDto
): Promise<IDealAnalytics> => {
  const res = await api.get(`${BASE}/${dealId}/analytics`, { params });
  return res.data;
};

// ─── Variant API ───

export const getVariantsByDeal = async (
  dealId: string,
  params?: VariantsQueryDto
): Promise<IDealVariant[]> => {
  const res = await api.get(`${BASE}/${dealId}/variants`, {
    params: { dealId, ...params },
  });
  return res.data;
};

export const getVariant = async (id: string): Promise<IDealVariant> => {
  const res = await api.get(`${BASE}/variants/${id}`);
  return res.data;
};

export const updateVariant = async (
  id: string,
  data: UpdateVariantDto
): Promise<IDealVariant> => {
  const res = await api.patch(`${BASE}/variants/${id}`, data);
  return res.data;
};

export const cancelVariant = async (id: string): Promise<IDealVariant> => {
  const res = await api.patch(`${BASE}/variants/${id}/cancel`);
  return res.data;
};

export const restoreVariant = async (id: string): Promise<IDealVariant> => {
  const res = await api.patch(`${BASE}/variants/${id}/restore`);
  return res.data;
};

export const cancelSlot = async (id: string): Promise<ISlotActionResponse> => {
  const res = await api.patch(`${BASE}/variants/slots/${id}/cancel`);
  return res.data;
};

export const restoreSlot = async (id: string): Promise<ISlotActionResponse> => {
  const res = await api.patch(`${BASE}/variants/slots/${id}/restore`);
  return res.data;
};

// ─── Bulk Generation ───

export const bulkGenerateVariants = async (
  data: BulkGenerateVariantsDto
): Promise<IBulkGenerateResult> => {
  const res = await api.post(`${BASE}/variants/bulk-generate`, data);
  return res.data;
};

export const previewBulkGenerateVariants = async (
  data: BulkGenerateVariantsDto
): Promise<IBulkPreviewResult> => {
  const res = await api.post(`${BASE}/variants/bulk-preview`, data);
  return res.data;
};

// ─── AI Generation ───

export const generateItineraryWithAI = async (
  data: GenerateItineraryAIDto
): Promise<IGenerateItineraryAIResponse> => {
  const res = await api.post('/ai/generate-itinerary', data);
  return res.data;
};

export const generateAddOnsWithAI = async (
  data: GenerateAddOnsAIDto
): Promise<IGenerateAddOnsAIResponse> => {
  const res = await api.post('/ai/generate-add-ons', data);
  return res.data;
};

export const getDealLocks = async (
  dealId: string,
  params?: { startDate?: string; endDate?: string; page: number; limit: number }
): Promise<{ locks: IDealLock[]; total: number; page: number; totalPages: number }> => {
  const res = await api.get(`${BASE}/${dealId}/locks`, { params });
  return {
    locks: res.data.items,
    total: res.data.total,
    page: params?.page ?? 1,
    totalPages: Math.ceil(res.data.total / (params?.limit ?? 10)),
  };
};

export const getDealBookings = async (
  dealId: string,
  params?: { startDate?: string; endDate?: string; page: number; limit: number }
): Promise<{ bookings: IDealBooking[]; total: number; page: number; totalPages: number }> => {
  const res = await api.get(`${BASE}/${dealId}/bookings`, { params });
  return {
    bookings: res.data.items,
    total: res.data.total,
    page: params?.page ?? 1,
    totalPages: Math.ceil(res.data.total / (params?.limit ?? 10)),
  };
};

