import { z } from "zod";
import { viewAccommodationLockDetailSchema } from "../accommodation/dtos/accommodation-lock.dtos";

// ─── Base Layer ──────────────────────────────────────────────────────────────

export const viewUserProfileSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  contactNumber: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  isTraveller: z.boolean(),
  isMerchant: z.boolean(),
  isAdmin: z.boolean(),
});

export const viewUserPhoneVerificationSchema = z.object({
  id: z.uuid(),
  phone: z.string().nullable(),
  phoneVerified: z.boolean(),
  isMaldivesVerified: z.boolean(),
});

// ─── Input Validation ────────────────────────────────────────────────────────

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const verifyPhoneSchema = z.object({
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
});

// ─── Locks & Pagination Schemas ──────────────────────────────────────────────

export const userLocksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
});

export const viewUserDealLockSchema = z.object({
  id: z.uuid(),
  type: z.literal("deal"),
  title: z.string(),
  location: z.string(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  expiresAt: z.date().or(z.string()).nullable(),
  price: z.number(),
  quantity: z.number(),
  variantDate: z.date().or(z.string()).nullable(),
  category: z.string().nullable(),
  dealId: z.uuid(),
  variantId: z.uuid(),
  customAddons: z.array(z.any()).optional(),
});

export const viewUserAccommodationLockSchema = z.object({
  id: z.uuid(),
  type: z.literal("accommodation"),
  title: z.string(),
  location: z.string(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  createdAt: z.date().or(z.string()),
  expiresAt: z.date().or(z.string()).nullable(),
  price: z.number(),
  quantity: z.number(),
  checkInDate: z.date().or(z.string()),
  checkOutDate: z.date().or(z.string()),
  unitName: z.string(),
  propertyId: z.uuid(),
  unitId: z.uuid(),
  customAddons: z.array(z.any()).optional(),
});

export const viewUserAccommodationLockDetailResponseSchema = z.object({
  lock: viewAccommodationLockDetailSchema,
  property: z.any(),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
export type VerifyPhoneDto = z.infer<typeof verifyPhoneSchema>;
export type ViewUserProfileDto = z.infer<typeof viewUserProfileSchema>;
export type ViewUserPhoneVerificationDto = z.infer<typeof viewUserPhoneVerificationSchema>;
export type UserLocksQueryDto = z.infer<typeof userLocksQuerySchema>;
export type ViewUserDealLockDto = z.infer<typeof viewUserDealLockSchema>;
export type ViewUserAccommodationLockDto = z.infer<typeof viewUserAccommodationLockSchema>;
export type ViewUserAccommodationLockDetailResponseDto = z.infer<typeof viewUserAccommodationLockDetailResponseSchema>;
