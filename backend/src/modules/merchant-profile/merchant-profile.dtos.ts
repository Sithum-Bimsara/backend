import { z } from "zod";

// ─── Output Shaping ───────────────────────────────────────────────────────────

export const viewMerchantProfileSchema = z.object({
  id: z.uuid(),
  userId: z.string().uuid(),
  businessName: z.string(),
  businessDescription: z.string(),
  verificationStatus: z.enum(["pending", "verified"]),
  contactNumber: z.string(),
  businessRegistrationDocUrl: z.string().nullable(),
  businessRegistrationDocName: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).optional(),
  user: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
  }).nullish(),
});

// ─── Input Validation ─────────────────────────────────────────────────────────

export const createMerchantProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessDescription: z.string().min(1, "Business description is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  address: z.string().min(1, "Business address is required"),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  businessRegistrationDocumentBase64: z.string().min(1, "Business registration document is required"),
  businessRegistrationDocumentName: z.string().optional(),
  businessRegistrationDocumentType: z.string().optional(),
});

export const updateMerchantProfileSchema = z.object({
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  businessRegistrationDocumentBase64: z.string().optional(),
  businessRegistrationDocumentName: z.string().optional(),
  businessRegistrationDocumentType: z.string().optional(),
  removeBusinessRegistrationDocument: z.boolean().optional(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type CreateMerchantProfileDto = z.infer<typeof createMerchantProfileSchema>;
export type UpdateMerchantProfileDto = z.infer<typeof updateMerchantProfileSchema>;
export type ViewMerchantProfileDto = z.infer<typeof viewMerchantProfileSchema>;
