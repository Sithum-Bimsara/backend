import type { IPropertyDetail } from "../../Deals/types/deals.types";

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
}

export interface IUpdateUserProfileDTO {
  name?: string;
  address?: string;
  city?: string;
}

export interface IVerifyPhoneResponse {
  id: string;
  phone: string;
  phoneVerified: boolean;
  isMaldivesVerified: boolean;
}

export interface IViewUserDealLock {
  id: string;
  type: "deal";
  title: string;
  location: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  price: number;
  quantity: number;
  customAddons?: Array<{ name: string; price: number; details?: string }>;
  variantDate: string | null;
  category: string | null;
  dealId: string;
  variantId: string;
}

export interface IViewUserAccommodationLock {
  id: string;
  type: "accommodation";
  title: string;
  location: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  price: number;
  quantity: number;
  customAddons?: Array<{ name: string; price: number; details?: string }>;
  checkInDate: string;
  checkOutDate: string;
  unitName: string;
  propertyId: string;
  unitId: string;
}

export interface ICustomAddon {
  id: string;
  name: string;
  price: number;
  details: string | null;
  addedAt: string;
  accommodationLockId: string | null;
}

export interface IViewAccommodationLockDetail {
  id: string;
  userId: string;
  propertyId: string;
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  lockedPrice: number;
  expiresAt: string;
  quantity: number;
  status: "active" | "converted" | "expired" | "cancelled";
  createdAt: string;
  updatedAt: string;
  customAddons: ICustomAddon[];
  property?: {
    name: string;
    city: string;
  };
  unit?: {
    name: string;
  };
}

export interface ILockedAccommodationDetail {
  lock: IViewAccommodationLockDetail;
  property: IPropertyDetail;
}
