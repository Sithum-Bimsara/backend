import { api } from "../../../lib/api";
import type { 
  IUserProfile, 
  IUpdateUserProfileDTO, 
  IVerifyPhoneResponse,
  IViewUserDealLock,
  IViewUserAccommodationLock,
  ILockedAccommodationDetail
} from "../types/user-profile.types";

const BASE = '/user-profile';

export const getMyProfile = async (): Promise<IUserProfile> => {
  const res = await api.get(BASE);
  return res.data.data;
};

export const updateProfile = async (data: IUpdateUserProfileDTO): Promise<IUserProfile> => {
  const res = await api.patch(BASE, data);
  return res.data.data;
};

export const verifyPhone = async (phone: string): Promise<IVerifyPhoneResponse> => {
  const res = await api.patch(`${BASE}/verify-phone`, { phone });
  return res.data.data;
};

export const getMyDealLocks = async (params: { page: number; limit: number }): Promise<{ data: IViewUserDealLock[]; total: number }> => {
  const res = await api.get(`${BASE}/my-locks/deals`, { params });
  return res.data;
};

export const getMyAccommodationLocks = async (params: { page: number; limit: number }): Promise<{ data: IViewUserAccommodationLock[]; total: number }> => {
  const res = await api.get(`${BASE}/my-locks/accommodations`, { params });
  return res.data;
};

export const getMyAccommodationLockDetail = async (lockId: string): Promise<ILockedAccommodationDetail> => {
  const res = await api.get(`${BASE}/my-locks/accommodation/${lockId}/details`);
  return res.data.data;
};
