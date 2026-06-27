import { api } from '../../../lib/api';
import type {
  IIslandMin,
  IIslandFull,
  IPaginatedIslandResponse,
} from '../types/island.types';
import type {
  CreateIslandDto,
  UpdateIslandDto,
} from '../schemas/island.dto';

const BASE = '/islands';

export const createIsland = async (data: CreateIslandDto): Promise<IIslandFull> => {
  const res = await api.post(BASE, data);
  return res.data.data || res.data;
};

export const updateIsland = async (id: string, data: UpdateIslandDto): Promise<IIslandFull> => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data.data || res.data;
};

export const getIslandById = async (id: string): Promise<IIslandFull> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data.data || res.data;
};

export const getIslands = async (params?: { page?: number; limit?: number; search?: string }): Promise<IPaginatedIslandResponse> => {
  const res = await api.get(BASE, { params });
  return res.data.data || res.data;
};

export const getSuitableIslands = async (params: { categories: string[]; activities: string[] }): Promise<IIslandMin[]> => {
  const categoriesStr = params.categories.join(',');
  const activitiesStr = params.activities.join(',');
  const res = await api.get(`${BASE}/suitable`, {
    params: {
      categories: categoriesStr || undefined,
      activities: activitiesStr || undefined,
    },
  });
  return res.data.data || res.data || [];
};

export const getCompareIslands = async (ids: string[]): Promise<IIslandFull[]> => {
  if (ids.length === 0) return [];
  const res = await api.get(`${BASE}/compare`, {
    params: {
      ids: ids.join(','),
    },
  });
  return res.data.data || res.data || [];
};

export const deleteIsland = async (id: string): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};
