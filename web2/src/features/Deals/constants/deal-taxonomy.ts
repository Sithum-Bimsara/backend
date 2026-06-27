export interface DealCategoryOption {
  value: string;
  label: string;
}

export interface DealChoiceOption {
  value: string;
  label: string;
  icon: string;
  desc?: string;
}

export const ONBOARDING_ACTIVITY_OPTIONS: DealChoiceOption[] = [
  { value: 'sunset_cruise', label: 'Sunset Cruise', icon: '🌅', desc: 'Relaxed evening ride' },
  { value: 'dolphin_watching', label: 'Dolphin Watching', icon: '🐬', desc: 'Marine life spotting' },
  { value: 'manta_snorkeling', label: 'Manta Snorkeling', icon: '🐠', desc: 'See manta rays up close' },
  { value: 'whale_shark_snorkeling', label: 'Whale Shark Snorkeling', icon: '🐋', desc: 'Swim with whale sharks' },
  { value: 'nurse_shark_snorkeling', label: 'Nurse Shark Snorkeling', icon: '🦈', desc: 'Safe reef shark encounter' },
  { value: 'turtle_snorkeling', label: 'Turtle Snorkeling', icon: '🐢', desc: 'Spot sea turtles' },
  { value: 'guided_snorkeling', label: 'Guided Snorkeling Tour', icon: '🤿', desc: 'With local guide' },
  { value: 'reef_snorkeling', label: 'Reef Snorkeling', icon: '🐠', desc: 'Coral reef exploration' },
  { value: 'night_snorkeling', label: 'Night Snorkeling', icon: '🌙', desc: 'After-dark marine adventure' },
  { value: 'scuba_diving', label: 'Scuba Diving', icon: '🤿', desc: 'Diving excursions' },
  { value: 'sunset_fishing', label: 'Sunset Fishing', icon: '🎣', desc: 'Evening fishing trip' },
  { value: 'night_fishing', label: 'Night Fishing', icon: '🌙', desc: 'Traditional night fishing' },
  { value: 'big_game_fishing', label: 'Big Game Fishing', icon: '🐟', desc: 'Deep sea sport fishing' },
  { value: 'island_hopping', label: 'Island Hopping', icon: '🏝️', desc: 'Visit multiple islands' },
  { value: 'local_island_visit', label: 'Local Island Visit', icon: '🌴', desc: 'Cultural island experience' },
  { value: 'castaway_island', label: 'Castaway Island Experience', icon: '🏖️', desc: 'Secluded island escape' },
  { value: 'sandbank_picnic', label: 'Sandbank Picnic', icon: '🏖️', desc: 'Picnic on a sandbank' },
  { value: 'beach_bbq', label: 'Beach BBQ', icon: '🔥', desc: 'Beachside barbecue' },
  { value: 'private_beach_dinner', label: 'Private Beach Dinner', icon: '🍽️', desc: 'Romantic dining' },
  { value: 'sandbank_dining', label: 'Sandbank Dining', icon: '🍽️', desc: 'Fine dining on sandbank' },
  { value: 'package', label: 'Package', icon: '📦', desc: 'Complete vacation packages' },
];

export const CATEGORIES = ONBOARDING_ACTIVITY_OPTIONS.map((item) => ({
  value: item.label,
  label: item.label,
  icon: item.icon,
}));

export const ONBOARDING_ACCOMMODATION_OPTIONS: DealChoiceOption[] = [
  { value: 'overwater_villa', label: 'Overwater Villa', icon: '🏝️' },
  { value: 'beach_villa', label: 'Beach Villa', icon: '🏖️' },
  { value: 'private_island', label: 'Private Island Resort', icon: '🌴' },
  { value: 'boutique_resort', label: 'Boutique Resort', icon: '✨' },
  { value: 'guesthouse', label: 'Local Guesthouse', icon: '🏠' },
  { value: 'liveaboard', label: 'Liveaboard Yacht', icon: '🛥️' },
];
