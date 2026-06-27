import type { UserStatus } from "../enums/auth.enum";

//////////////////////////////////////////////////////
// BASE USER (Safe version of DB model)
//////////////////////////////////////////////////////

export interface IUser {
  id: string;
  name: string;
  email: string;
  contactNumber?: string | null;

  country?: string | null;
  phone?: string | null;
  phoneVerified: boolean;
  isMaldivesVerified: boolean;

  isTraveller: boolean;
  isMerchant: boolean;
  isAdmin: boolean;

  status: UserStatus;

  merchantProfile?: IMerchantProfile | null;

  createdAt: string;
}

//////////////////////////////////////////////////////
// MERCHANT PROFILE
//////////////////////////////////////////////////////

export interface IMerchantProfile {
  id: string;
  userId: string;

  businessName: string;
  businessDescription: string;
  contactNumber: string;
  logoUrl?: string | null;
  businessRegistrationDocUrl?: string | null;
  businessRegistrationDocName?: string | null;

  address?: string | null;
  city?: string | null;
  country?: string | null;

  createdAt: string;
}

//////////////////////////////////////////////////////
// LOGIN RESPONSE — Enhanced with boolean flags
//////////////////////////////////////////////////////

export interface ILoginResponse {
  message: string;
  user: IUser;
  isTraveller: boolean;
  isMerchant: boolean;
  isAdmin: boolean;
  hasPreferences: boolean;
  hasMerchantProfile: boolean;
}

//////////////////////////////////////////////////////
// GET ME RESPONSE — Same flags as login
//////////////////////////////////////////////////////

export interface IGetMeResponse {
  user: IUser;
  isTraveller: boolean;
  isMerchant: boolean;
  isAdmin: boolean;
  hasPreferences: boolean;
  hasMerchantProfile: boolean;
}

//////////////////////////////////////////////////////
// REGISTER USER RESPONSE
//////////////////////////////////////////////////////

export interface IUserRegisterResponse {
  message: string;
  user: IUser;
}

//////////////////////////////////////////////////////
// REGISTER MERCHANT RESPONSE
//////////////////////////////////////////////////////

export interface IMerchantRegisterResponse {
  message: string;
  user: IUser;
}

//////////////////////////////////////////////////////
// ADD ROLE RESPONSE
//////////////////////////////////////////////////////

export interface IAddRoleResponse {
  message: string;
  user: IUser;
}
