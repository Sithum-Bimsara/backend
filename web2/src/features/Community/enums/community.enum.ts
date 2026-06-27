//////////////////////////////////////////////////////
// POST CATEGORIES
//////////////////////////////////////////////////////

export const POST_CATEGORIES = {
  RELAXATION: "RELAXATION",
  ADVENTURE: "ADVENTURE",
  DIVING: "DIVING",
  ROMANTIC: "ROMANTIC",
  LUXURY: "LUXURY",
  BUDGET: "BUDGET",
  FAMILY: "FAMILY",
  WILDLIFE: "WILDLIFE",
  CULTURE: "CULTURE",
  FOOD: "FOOD",
} as const;

export type PostCategory = typeof POST_CATEGORIES[keyof typeof POST_CATEGORIES];

//////////////////////////////////////////////////////
// POST TAGS
//////////////////////////////////////////////////////

export const POST_TAGS = [
  "scuba-diving",
  "snorkeling",
  "surfing",
  "jet-ski",
  "kayaking",
  "dolphin-watching",
  "sunset-cruise",
  "resort",
  "guesthouse",
  "water-villa",
  "beach-villa",
  "couple",
  "family",
  "solo",
  "friends",
  "relaxing",
  "adventure",
  "luxury",
  "romantic",
  "cheap",
  "premium",
  "discount",
  "beginner-diver",
  "advanced-diver",
  "reef-diving",
  "night-diving",
  "sunset",
  "full-day",
] as const;

export type PostTag = typeof POST_TAGS[number];
