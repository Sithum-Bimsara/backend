export const ACTIVITY_CANONICAL_MAP: Record<string, string> = {
  'sunset cruise': 'cruise',
  'dolphin watching': 'cruise',
  'manta snorkeling': 'snorkeling',
  'whale shark snorkeling': 'snorkeling',
  'nurse shark snorkeling': 'snorkeling',
  'turtle snorkeling': 'snorkeling',
  'guided snorkeling tour': 'snorkeling',
  'reef snorkeling': 'snorkeling',
  'night snorkeling': 'snorkeling',
  'scuba diving': 'diving',
  'reef diving': 'diving',
  'night diving': 'diving',
  'sunset fishing': 'fishing',
  'night fishing': 'fishing',
  'big game fishing': 'fishing',
  'island hopping': 'excursion',
  'local island visit': 'excursion',
  'castaway island experience': 'excursion',
  'sandbank picnic': 'excursion',
  'beach bbq': 'excursion',
  'private beach dinner': 'excursion',
  'sandbank dining': 'excursion',
  'snorkeling + dolphin + sandbank tour': 'snorkeling',
};

export const ACTIVITY_KEYWORDS = [
  'cruise',
  'dolphin',
  'manta',
  'whale shark',
  'nurse shark',
  'turtle',
  'snorkel',
  'dive',
  'diving',
  'fishing',
  'island hopping',
  'local island',
  'castaway island',
  'sandbank',
  'beach bbq',
  'private beach dinner',
  'sandbank dining',
  'tour',
  'experience',
  'safari',
  'adventure',
] as const;

export const NOISE_ACTIVITY_PHRASES = new Set([
  'arrival',
  'welcome',
  'go',
  'enjoy',
  'enjoy maldives',
  'enjoy maldives and go',
  'wake up',
  'breakfast',
  'lunch',
  'light lunch',
  'dinner',
  'meal',
  'marine guide',
  'guide',
  'transfer',
  'speedboat transfer',
  'resort transfer',
  'check in',
  'check out',
]);

export const ACCOMMODATION_KEYWORDS = [
  'hotel',
  'resort',
  'villa',
  'guesthouse',
  'homestay',
  'hostel',
  'suite',
  'bungalow',
  'yacht',
  'liveaboard',
] as const;

export const canonicalizeActivityPhrase = (phrase: string): string | null => {
  const normalized = phrase.trim().toLowerCase();
  if (!normalized || NOISE_ACTIVITY_PHRASES.has(normalized)) {
    return null;
  }

  const direct = ACTIVITY_CANONICAL_MAP[normalized];
  if (direct) {
    return direct;
  }

  for (const [alias, canonical] of Object.entries(ACTIVITY_CANONICAL_MAP)) {
    if (normalized.includes(alias)) {
      return canonical;
    }
  }

  if (ACTIVITY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    if (normalized.includes('snorkel')) return 'snorkeling';
    if (normalized.includes('dive')) return 'diving';
    if (normalized.includes('fishing')) return 'fishing';
    if (normalized.includes('cruise') || normalized.includes('dolphin')) return 'cruise';
    if (normalized.includes('island') || normalized.includes('sandbank') || normalized.includes('tour')) return 'excursion';
  }

  return null;
};
