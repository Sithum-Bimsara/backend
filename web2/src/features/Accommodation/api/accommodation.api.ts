import { api } from '../../../lib/api';
import type {
  IAccommodationView,
  IAccommodationSummaryView,
  IRoomInventory,
  IUnit,
} from '../types/accommodation.types';
import type {
  CreateAccommodationCompleteDto,
  UpdatePropertyDto,
  ListPropertiesQueryDto,
  ListLocksQueryDto,
  ListBookingsQueryDto,
  BulkInventoryUpdateDto,
} from '../dtos/accommodation.dto';

const BASE = '/accommodation';

// ─── Property API ─────────────────────────────────────────────────────────────

export const createPropertyComplete = async (
  draft: CreateAccommodationCompleteDto
): Promise<{ id: string; isActive: boolean; name: string | null }> => {
  const res = await api.post(`${BASE}/property`, draft);
  return res.data.data;
};

export const getPropertyById = async (id: string): Promise<IAccommodationView> => {
  const res = await api.get(`${BASE}/property/${id}`);
  return res.data.data;
};

export const getMyProperties = async (params?: ListPropertiesQueryDto): Promise<{ properties: IAccommodationSummaryView[]; total: number; page: number; totalPages: number }> => {
  const res = await api.get(`${BASE}/properties/mine`, { params });
  const items = res.data.items || res.data.data || [];
  const total = res.data.total ?? items.length;
  const page = res.data.page ?? params?.page ?? 1;
  const totalPages = res.data.totalPages ?? Math.ceil(total / (params?.limit || 8));
  return { properties: items, total, page, totalPages };
};

export const updateProperty = async (
  propertyId: string,
  data: UpdatePropertyDto
): Promise<IAccommodationView> => {
  const res = await api.patch(`${BASE}/property/${propertyId}`, data);
  return res.data.data;
};

export const updatePropertyImages = async (
  propertyId: string,
  images: { url: string }[]
): Promise<void> => {
  await api.patch(`${BASE}/property/${propertyId}/images`, { images });
};


// ─── Unit API ─────────────────────────────────────────────────────────────────

export const addUnitToProperty = async (
  propertyId: string,
  unit: IUnit
): Promise<void> => {
  await api.post(`${BASE}/property/${propertyId}/unit`, unit);
};

export const updateUnit = async (
  propertyId: string,
  unitId: string,
  unit: IUnit
): Promise<void> => {
  await api.patch(`${BASE}/property/${propertyId}/unit/${unitId}`, unit);
};


// ─── Inventory API ────────────────────────────────────────────────────────────

export const getRoomInventory = async (
  propertyId: string,
  unitId: string,
  startDate: string,
  endDate: string
): Promise<IRoomInventory[]> => {
  const res = await api.get(`${BASE}/property/${propertyId}/unit/${unitId}/inventory`, {
    params: { startDate, endDate },
  });
  return res.data.data;
};

export const updateBulkInventory = async (
  propertyId: string,
  input: BulkInventoryUpdateDto
): Promise<void> => {
  await api.post(`${BASE}/property/${propertyId}/inventory/bulk`, input);
};

export const previewBulkInventoryUpdate = async (
  propertyId: string,
  input: BulkInventoryUpdateDto
): Promise<unknown> => {
  const res = await api.post(`${BASE}/property/${propertyId}/inventory/bulk/preview`, input);
  return res.data.data;
};

export const blockRoomSlot = async (propertyId: string, slotId: string): Promise<void> => {
  await api.put(`${BASE}/property/${propertyId}/inventory/slot/${slotId}/block`);
};

export const restoreRoomSlot = async (propertyId: string, slotId: string): Promise<void> => {
  await api.put(`${BASE}/property/${propertyId}/inventory/slot/${slotId}/restore`);
};

// ─── Locks & Bookings API ──────────────────────────────────────────────────────

export const getPropertyLocks = async (
  propertyId: string,
  params?: ListLocksQueryDto
): Promise<{ locks: import('../types/accommodation.types').IAccommodationLock[]; total: number; page: number; totalPages: number }> => {
  const res = await api.get(`${BASE}/property/${propertyId}/locks`, { params });
  const items = res.data.items || [];
  const total = res.data.total ?? items.length;
  const page = res.data.page ?? params?.page ?? 1;
  const totalPages = res.data.totalPages ?? Math.ceil(total / (params?.limit || 10));
  return { locks: items, total, page, totalPages };
};

export const getPropertyBookings = async (
  propertyId: string,
  params?: ListBookingsQueryDto
): Promise<{ bookings: import('../types/accommodation.types').IAccommodationBooking[]; total: number; page: number; totalPages: number }> => {
  const res = await api.get(`${BASE}/property/${propertyId}/bookings`, { params });
  const items = res.data.items || [];
  const total = res.data.total ?? items.length;
  const page = res.data.page ?? params?.page ?? 1;
  const totalPages = res.data.totalPages ?? Math.ceil(total / (params?.limit || 10));
  return { bookings: items, total, page, totalPages };
};
