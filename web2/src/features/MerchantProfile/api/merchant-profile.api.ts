import { api } from "../../../lib/api";
import type { IMerchantProfile, IMerchantOverallAnalytics } from "../types/merchant-profile.types";
import type { CreateMerchantProfileDto, UpdateMerchantProfileDto } from "../schemas/merchant-profile.schema";

const BASE = "/merchant-profile";

/**
 * Fetches the currently logged in merchant's profile.
 */
export const getMyProfile = async (): Promise<IMerchantProfile> => {
  const res = await api.get(BASE);
  return res.data;
};

/**
 * Creates a new merchant profile during onboarding.
 */
export const createProfile = async (data: CreateMerchantProfileDto): Promise<IMerchantProfile> => {
  const res = await api.post(BASE, data);
  return res.data;
};

/**
 * Updates the existing merchant profile.
 */
export const updateProfile = async (data: UpdateMerchantProfileDto): Promise<IMerchantProfile> => {
  const res = await api.patch(BASE, data);
  return res.data;
};


/**
 * Returns overall merchant analytics for the merchant dashboard.
 */
export const getMerchantOverallAnalytics = async (): Promise<IMerchantOverallAnalytics> => {
  const res = await api.get(`${BASE}/analytics`);
  return res.data;
};
