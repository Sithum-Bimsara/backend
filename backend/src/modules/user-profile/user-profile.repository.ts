import { prisma } from "../../config/prisma";

import {
  UserProfileRecord, 
  UserPhoneVerificationRecord, 
  userProfileDetailedSelect, 
  userPhoneVerificationSelect,
  adminUserPaginatedInclude,
  AdminUserPaginatedRecord,
  adminUserStatusSelect,
  AdminUserStatusRecord,
  adminUserWithProfileInclude,
  AdminUserWithProfileRecord,
  UserWhereInput,
  UpdateUserProfileData
} from "./user-profile.types";

/**
 * Finds a user by their ID.
 */
export const findUserById = async (userId: string): Promise<UserProfileRecord | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: userProfileDetailedSelect,
  });
};

/**
 * Updates a user's profile information.
 */
export const updateUserById = async (userId: string, data: UpdateUserProfileData): Promise<UserProfileRecord> => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: userProfileDetailedSelect,
  });
};

/**
 * Updates a user's phone number and verification status.
 */
export const verifyPhone = async (userId: string, phone: string): Promise<UserPhoneVerificationRecord> => {
  const isMaldives = phone.startsWith("+960");
  return prisma.user.update({
    where: { id: userId },
    data: { 
      phone, 
      phoneVerified: true,
      isMaldivesVerified: isMaldives
    },
    select: userPhoneVerificationSelect,
  });
};

/**
 * Checks if a user has admin privileges.
 */
export const getUserIsAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ 
    where: { id: userId }, 
    select: { isAdmin: true } 
  });
  return user?.isAdmin ?? false;
};

/**
 * Fetches all users with admin privileges.
 */
export const getAdmins = async (): Promise<{ id: string; email: string | null }[]> => {
  return prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true },
  });
};

// ─── Admin Queries ───

export const countUsers = async (where?: UserWhereInput): Promise<number> => {
  return prisma.user.count({ where });
};

export const findUsersPaginated = async (
  where: UserWhereInput, 
  page: number, 
  limit: number
): Promise<AdminUserPaginatedRecord[]> => {
  return prisma.user.findMany({
    where,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: "desc" },
    include: adminUserPaginatedInclude,
  });
};

export const updateUserStatus = async (
  id: string, 
  status: "active" | "suspended"
): Promise<AdminUserStatusRecord> => {
  return prisma.user.update({
    where: { id },
    data: { status },
    select: adminUserStatusSelect,
  });
};

export const getUserWithProfile = async (id: string): Promise<AdminUserWithProfileRecord | null> => {
  return prisma.user.findUnique({
    where: { id },
    include: adminUserWithProfileInclude,
  });
};
