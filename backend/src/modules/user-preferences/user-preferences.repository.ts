import { prisma } from "../../config/prisma";
import { Prisma, UserPreference } from "@prisma/client";
import { UserPreferenceDTO } from "./user-preferences.dtos";

const normalizeTransportPreference = (value: unknown): string | null | undefined => {
  if (value == null) return value as null | undefined;
  if (Array.isArray(value)) {
    const cleaned = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned.join(",") : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};

/**
 * Creates user preferences for a specific user.
 */
export const createUserPreference = async (userId: string, data: UserPreferenceDTO): Promise<UserPreference> => {
  return prisma.userPreference.create({
    data: {
      userId,
      travelStyle: (data.travelStyle as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      preferredLocations: (data.preferredLocations as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      accommodationTypes: (data.accommodationTypes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      activityInterests: (data.activityInterests as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      tripDuration: data.tripDuration ?? null,
      travelGroupType: data.travelGroupType ?? null,
      transportPreference: normalizeTransportPreference(data.transportPreference) ?? null,
      diverLevel: data.diverLevel ?? null,
    },
  });
};

/**
 * Finds user preferences by user ID.
 */
export const findUserPreference = async (userId: string): Promise<UserPreference | null> => {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
};

/**
 * Updates user preferences for a specific user.
 */
export const updateUserPreference = async (userId: string, data: UserPreferenceDTO): Promise<UserPreference> => {
  return prisma.userPreference.update({
    where: { userId },
    data: {
      travelStyle: (data.travelStyle as Prisma.InputJsonValue) ?? undefined,
      budgetMin: data.budgetMin ?? undefined,
      budgetMax: data.budgetMax ?? undefined,
      preferredLocations: (data.preferredLocations as Prisma.InputJsonValue) ?? undefined,
      accommodationTypes: (data.accommodationTypes as Prisma.InputJsonValue) ?? undefined,
      activityInterests: (data.activityInterests as Prisma.InputJsonValue) ?? undefined,
      tripDuration: data.tripDuration ?? undefined,
      travelGroupType: data.travelGroupType ?? undefined,
      transportPreference: normalizeTransportPreference(data.transportPreference),
      diverLevel: data.diverLevel ?? undefined,
    },
  });
};
