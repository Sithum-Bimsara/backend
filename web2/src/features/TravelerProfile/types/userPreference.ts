import type { AccommodationType, ActivityInterest, DiverLevel, TransportPreference, TravelGroupType, TravelStyle, TripDuration } from "../enums/userPreference.enums";

export interface IUserPreference {
  id: string;
  userId: string;

  travelStyle?: TravelStyle[];
  budgetMin?: number;
  budgetMax?: number;

  preferredLocations?: string[];

  accommodationTypes?: AccommodationType[];
  activityInterests?: ActivityInterest[];

  diverLevel?: DiverLevel;
  tripDuration?: TripDuration;
  travelGroupType?: TravelGroupType;
  transportPreference?: TransportPreference;

  createdAt: string;
  updatedAt: string;
}
