import { api } from '../../../lib/api';
import type {
  GetPublicDealsParamsDto,
  LockDealRequestDto,
  CreateBookingRequestDto,
} from '../dtos/deals.dto';
import type {
  IDealCard,
  IDealDetail,
  IPropertyDetail,
  IDealLockInfo,
  ILockResponse,
  IUserLock,
  IBookingResponse,
  IPaginatedResponse,
  PaginationParams,
  IPlatformStats,
  IIslandListingsResponse,
} from '../types/deals.types';

// Base URLs per concern
const PUBLIC = '/public-deals';        // Read-only public browsing
const DEALS  = '/deals';               // Deal locks & bookings
const ACCOMMODATION = '/accommodation'; // Accommodation locks & bookings

// ─── Public Deal API (no auth required) ───

export const getPublicDeals = async (
  params?: GetPublicDealsParamsDto
): Promise<IPaginatedResponse<IDealCard>> => {
  const res = await api.get(PUBLIC, { params });
  return res.data;
};

export const getAccommodationDeals = async (
  params?: GetPublicDealsParamsDto
): Promise<IPaginatedResponse<IDealCard>> => {
  const res = await api.get(`${PUBLIC}/accommodations`, { params });
  return res.data;
};

export const searchPublicDeals = async (
  params?: GetPublicDealsParamsDto
): Promise<IPaginatedResponse<IDealCard>> => {
  const res = await api.get(`${PUBLIC}/search`, { params });
  return res.data;
};

export const getPublicDeal = async (
  id: string,
  params?: { source?: string; trackView?: boolean }
): Promise<IDealDetail> => {
  const res = await api.get(`${PUBLIC}/${id}`, { params });
  return res.data.data;
};

export const getPublicProperty = async (
  id: string
): Promise<IPropertyDetail> => {
  const res = await api.get(`${PUBLIC}/accommodation/${id}`);
  return res.data.data;
};

export const getRecommendedDeals = async (
  params?: PaginationParams
): Promise<IPaginatedResponse<IDealCard>> => {
  const res = await api.get(`${PUBLIC}/recommended`, { params });
  return res.data;
};

export const getPlatformStats = async (): Promise<IPlatformStats> => {
  const res = await api.get(`${PUBLIC}/platform-stats`);
  return res.data.data;
};

export const getActiveIslands = async (): Promise<string[]> => {
  const res = await api.get<{ success: boolean; data: string[] }>(`${PUBLIC}/active-islands`);
  return res.data.data;
};
export const getIslandListings = async (
  islandName: string,
  params?: {
    dealsPage?: number;
    dealsLimit?: number;
    accommodationsPage?: number;
    accommodationsLimit?: number;
  }
): Promise<IIslandListingsResponse> => {
  const res = await api.get<{ success: boolean; data: IIslandListingsResponse }>(
    `${PUBLIC}/active-islands/${encodeURIComponent(islandName)}/listings`,
    { params }
  );
  return res.data.data;
};

/**
 * Fetch active variants + dealLockExpireTime for a specific deal.
 * Called on-demand when the user opens the "Lock Deal" modal from a deal card.
 */
export const getDealVariants = async (dealId: string): Promise<IDealLockInfo> => {
  const res = await api.get(`${PUBLIC}/${dealId}/variants`);
  return res.data.data;
};

// ─── Deal Lock & Booking API (auth required) ───

export const lockDeal = async (
  data: LockDealRequestDto
): Promise<ILockResponse> => {
  const res = await api.post(`${DEALS}/lock`, data);
  return res.data;
};

export const getMyLocks = async (params?: PaginationParams): Promise<IPaginatedResponse<IUserLock>> => {
  const res = await api.get(`${DEALS}/user/my-locks`, { params });
  return res.data;
};

export const createBooking = async (
  data: CreateBookingRequestDto
): Promise<IBookingResponse> => {
  const res = await api.post(`${DEALS}/book`, data);
  return res.data;
};

export const getMyBookings = async (params?: PaginationParams): Promise<IPaginatedResponse<IBookingResponse>> => {
  const res = await api.get(`${DEALS}/user/my-bookings`, { params });
  return res.data;
};

// ─── Accommodation Lock & Booking API (auth required) ───

export const lockAccommodation = async (data: {
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  quantity: number;
}): Promise<any> => {
  const res = await api.post(`${ACCOMMODATION}/lock`, data);
  return res.data.data;
};

export const createAccommodationBooking = async (data: {
  lockId: string;
  guests: number;
}): Promise<any> => {
  const res = await api.post(`${ACCOMMODATION}/book`, data);
  return res.data.data;
};
