import { Request } from "express";
import { Property, Unit, Deal } from "@prisma/client";

export interface AuthUser {
  id: string;
  email?: string;
}

export interface DbUserSnapshot {
  id: string;
  email: string;
  isAdmin: boolean;
  isTraveller: boolean;
  isMerchant: boolean;
  status: "active" | "suspended";
  country?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
      userId?: string | null;
      merchantProfileId?: string;
      merchantVerificationStatus?: string;
      dbUser?: DbUserSnapshot | null;
      isLocal?: boolean;
      property?: Property & { units: Unit[] };
      deal?: Deal;
    }
  }
}

/**
 * Standard type for requests that have passed through verifyToken.
 * Guarantees that userId is a non-null string.
 */
export interface AuthenticatedRequest extends Request {
  userId: string;
  user: AuthUser;
}

export {};