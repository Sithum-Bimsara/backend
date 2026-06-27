import * as repo from "./user-preferences.repository";
import { enqueueRecommendationJob } from "../../queues/recommendationQueue";
import { UserPreferenceDTO } from "./user-preferences.dtos";
import { ConflictException } from "../../exceptions/conflict.exception";
import { NotFoundException } from "../../exceptions/not-found.exception";

/**
 * Creates user preferences.
 */
export const createPreferencesService = async (userId: string, data: UserPreferenceDTO) => {
  // Check if already exists
  const existing = await repo.findUserPreference(userId);
  if (existing) {
    throw new ConflictException("Preferences already exist");
  }

  const preferences = await repo.createUserPreference(userId, data);

  // AI Trigger: Cold start handling (prioritized)
  enqueueRecommendationJob(userId, { source: "cold-start" });

  return preferences;
};

/**
 * Fetches user preferences.
 */
export const getPreferencesService = async (userId: string) => {
  const preferences = await repo.findUserPreference(userId);

  if (!preferences) {
    throw new NotFoundException("No preferences found");
  }

  return preferences;
};

/**
 * Updates user preferences.
 */
export const updatePreferencesService = async (userId: string, data: UserPreferenceDTO) => {
  // Ensure it exists first
  const existing = await repo.findUserPreference(userId);
  if (!existing) {
    throw new NotFoundException("No preferences found to update");
  }

  const preferences = await repo.updateUserPreference(userId, data);

  // AI Trigger: Update recommendations based on new preferences
  enqueueRecommendationJob(userId);

  return preferences;
};
