import { z } from "zod";

//////////////////////////////////////////////////////
// COMMON FIELDS (Reusable)
//////////////////////////////////////////////////////

export const emailField = z.string().email("Invalid email");

export const passwordField = z.string().min(6, "Password must be at least 6 characters");

export const nameField = z.string().min(1).max(100);

//////////////////////////////////////////////////////
// LOGIN
//////////////////////////////////////////////////////

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginDto = z.infer<typeof loginSchema>;

//////////////////////////////////////////////////////
// BASE REGISTER (Reusable)
//////////////////////////////////////////////////////

export const registerBaseSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

//////////////////////////////////////////////////////
// REGISTER - NORMAL USER
// Same fields as base — no extras needed
//////////////////////////////////////////////////////

export const registerUserSchema = registerBaseSchema;

export type RegisterUserDto = z.infer<typeof registerUserSchema>;

/**
 * DTO sent to backend API
 * password removed
 * supabaseUserId added
 */
export const registerUserApiSchema = registerUserSchema
  .omit({ password: true })
  .extend({
    supabaseUserId: z.string(),
  });

export type RegisterUserApiDto = z.infer<typeof registerUserApiSchema>;

//////////////////////////////////////////////////////
// REGISTER - MERCHANT
// Same fields as base — no business fields needed
// Business info is collected during merchant onboarding
//////////////////////////////////////////////////////

export const registerMerchantSchema = registerBaseSchema;

export type RegisterMerchantDto = z.infer<typeof registerMerchantSchema>;

export const registerMerchantApiSchema = registerMerchantSchema
  .omit({ password: true })
  .extend({
    supabaseUserId: z.string(),
  });

export type RegisterMerchantApiDto = z.infer<typeof registerMerchantApiSchema>;

//////////////////////////////////////////////////////
// ADD ROLE — For cross-registration
//////////////////////////////////////////////////////

export const addRoleSchema = z.object({
  role: z.enum(["traveller", "merchant"]),
});

export type AddRoleDto = z.infer<typeof addRoleSchema>;
