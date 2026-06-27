export interface Island {
  id: string;
  name: string;
  atoll: string;
  category?: 'Local' | 'Resort' | 'Capital';
  description?: string;
  image?: string;
  highlights?: string[];
  vibe?: string;
}

/**
 * Full list of inhabited islands and major hubs in the Maldives.
 * Used for selections, onboarding, and deal requests.
 */
export const MALDIVES_ISLANDS_RAW: Omit<Island, 'id'>[] = [
  // Kaafu Atoll (Male' Atoll)
  { name: "Malé", atoll: "Kaafu Atoll" },
  { name: "Hulhumalé", atoll: "Kaafu Atoll" },
  { name: "Maafushi", atoll: "Kaafu Atoll" },
  { name: "Gulhi", atoll: "Kaafu Atoll" },
  { name: "Guraidhoo", atoll: "Kaafu Atoll" },
  { name: "Thulusdhoo", atoll: "Kaafu Atoll" },
  { name: "Dhiffushi", atoll: "Kaafu Atoll" },
  { name: "Himmafushi", atoll: "Kaafu Atoll" },
  { name: "Huraa", atoll: "Kaafu Atoll" },
  { name: "Gaafaru", atoll: "Kaafu Atoll" },
  { name: "Kaashidhoo", atoll: "Kaafu Atoll" },

  // Alif Alif Atoll (North Ari Atoll)
  { name: "Rasdhoo", atoll: "Alif Alif Atoll" },
  { name: "Ukulhas", atoll: "Alif Alif Atoll" },
  { name: "Mathiveri", atoll: "Alif Alif Atoll" },
  { name: "Feridhoo", atoll: "Alif Alif Atoll" },
  { name: "Maalhos", atoll: "Alif Alif Atoll" },
  { name: "Bodufolhudhoo", atoll: "Alif Alif Atoll" },
  { name: "Thoddoo", atoll: "Alif Alif Atoll" },

  // Alif Dhaalu Atoll (South Ari Atoll)
  { name: "Mahibadhoo", atoll: "Alif Dhaalu Atoll" },
  { name: "Dhigurah", atoll: "Alif Dhaalu Atoll" },
  { name: "Dhangethi", atoll: "Alif Dhaalu Atoll" },
  { name: "Omadhoo", atoll: "Alif Dhaalu Atoll" },
  { name: "Kunburudhoo", atoll: "Alif Dhaalu Atoll" },
  { name: "Fenfushi", atoll: "Alif Dhaalu Atoll" },
  { name: "Maamigili", atoll: "Alif Dhaalu Atoll" },

  // Baa Atoll
  { name: "Dharavandhoo", atoll: "Baa Atoll" },
  { name: "Maalhos", atoll: "Baa Atoll" },
  { name: "Kamadhoo", atoll: "Baa Atoll" },
  { name: "Kendhoo", atoll: "Baa Atoll" },
  { name: "Kihaadhoo", atoll: "Baa Atoll" },
  { name: "Dhonfanu", atoll: "Baa Atoll" },
  { name: "Kudarikilu", atoll: "Baa Atoll" },
  { name: "Eydhafushi", atoll: "Baa Atoll" },
  { name: "Fulhadhoo", atoll: "Baa Atoll" },
  { name: "Fehendhoo", atoll: "Baa Atoll" },
  { name: "Goidhoo", atoll: "Baa Atoll" },

  // Lhaviyani Atoll
  { name: "Naifaru", atoll: "Lhaviyani Atoll" },
  { name: "Hinnavaru", atoll: "Lhaviyani Atoll" },
  { name: "Kurendhoo", atoll: "Lhaviyani Atoll" },
  { name: "Olhuvelifushi", atoll: "Lhaviyani Atoll" },

  // Vaavu Atoll
  { name: "Felidhoo", atoll: "Vaavu Atoll" },
  { name: "Keyodhoo", atoll: "Vaavu Atoll" },
  { name: "Thinadhoo", atoll: "Vaavu Atoll" },
  { name: "Rakheedhoo", atoll: "Vaavu Atoll" },
  { name: "Fulidhoo", atoll: "Vaavu Atoll" },

  // Addu City
  { name: "Hithadhoo", atoll: "Addu City" },
  { name: "Maradhoo", atoll: "Addu City" },
  { name: "Feydhoo", atoll: "Addu City" },
  { name: "Hulhudhoo", atoll: "Addu City" },
  { name: "Meedhoo", atoll: "Addu City" },

  // Fuvahmulah City
  { name: "Fuvahmulah", atoll: "Fuvahmulah City" },

  // Haa Alif Atoll
  { name: "Dhidhdhoo", atoll: "Haa Alif Atoll" },
  { name: "Hoarafushi", atoll: "Haa Alif Atoll" },
  { name: "Ihavandhoo", atoll: "Haa Alif Atoll" },
  { name: "Kelaa", atoll: "Haa Alif Atoll" },
  { name: "Filladhoo", atoll: "Haa Alif Atoll" },
  { name: "Vashafaru", atoll: "Haa Alif Atoll" },

  // Haa Dhaalu Atoll
  { name: "Kulhudhuffushi", atoll: "Haa Dhaalu Atoll" },
  { name: "Hanimaadhoo", atoll: "Haa Dhaalu Atoll" },
  { name: "Nolhivaranfaru", atoll: "Haa Dhaalu Atoll" },
  { name: "Vaikaradhoo", atoll: "Haa Dhaalu Atoll" },

  // Noonu Atoll
  { name: "Manadhoo", atoll: "Noonu Atoll" },
  { name: "Velidhoo", atoll: "Noonu Atoll" },
  { name: "Holhudhoo", atoll: "Noonu Atoll" },
  { name: "Kendhikulhudhoo", atoll: "Noonu Atoll" },

  // Raa Atoll
  { name: "Ungoofaaru", atoll: "Raa Atoll" },
  { name: "Meedhoo", atoll: "Raa Atoll" },
  { name: "Maduvvari", atoll: "Raa Atoll" },
  { name: "Alifushi", atoll: "Raa Atoll" },
  { name: "Dhuvaafaru", atoll: "Raa Atoll" },

  // Shaviyani Atoll
  { name: "Funadhoo", atoll: "Shaviyani Atoll" },
  { name: "Milandhoo", atoll: "Shaviyani Atoll" },
  { name: "Kanditheemu", atoll: "Shaviyani Atoll" },

  // Gaafu Alif Atoll
  { name: "Villingili", atoll: "Gaafu Alif Atoll" },
  { name: "Dhaandhoo", atoll: "Gaafu Alif Atoll" },
  { name: "Kooddoo", atoll: "Gaafu Alif Atoll" },
  { name: "Nilandhoo", atoll: "Gaafu Alif Atoll" },
  { name: "Maamendhoo", atoll: "Gaafu Alif Atoll" },

  // Gaafu Dhaalu Atoll
  { name: "Thinadhoo", atoll: "Gaafu Dhaalu Atoll" },
  { name: "Gadhdhoo", atoll: "Gaafu Dhaalu Atoll" },
  { name: "Vaadhoo", atoll: "Gaafu Dhaalu Atoll" },
  { name: "Faresmaathoda", atoll: "Gaafu Dhaalu Atoll" },

  // Laamu Atoll
  { name: "Fonadhoo", atoll: "Laamu Atoll" },
  { name: "Gan", atoll: "Laamu Atoll" },
  { name: "Maabaidhoo", atoll: "Laamu Atoll" },
  { name: "Isdhoo", atoll: "Laamu Atoll" },

  // Thaa Atoll
  { name: "Veymandoo", atoll: "Thaa Atoll" },
  { name: "Thimarafushi", atoll: "Thaa Atoll" },
  { name: "Guraidhoo", atoll: "Thaa Atoll" },

  // Meemu Atoll
  { name: "Muli", atoll: "Meemu Atoll" },
  { name: "Dhiggaru", atoll: "Meemu Atoll" },
  { name: "Mulah", atoll: "Meemu Atoll" },

  // Faafu Atoll
  { name: "Nilandhoo", atoll: "Faafu Atoll" },
  { name: "Magoodhoo", atoll: "Faafu Atoll" },

  // Dhaalu Atoll
  { name: "Kudahuvadhoo", atoll: "Dhaalu Atoll" },
  { name: "Meedhoo", atoll: "Dhaalu Atoll" },
  { name: "Rinbudhoo", atoll: "Dhaalu Atoll" },
];

/**
 * Featured islands with rich UI metadata.
 */
export const POPULAR_ISLANDS: Island[] = [
  {
    id: 'male',
    name: 'Malé',
    atoll: 'Kaafu Atoll',
    category: 'Capital',
    highlights: ['Sultan Park', 'Fish Market', 'Grand Friday Mosque'],
    vibe: 'Bustling & Cultural'
  },
  {
    id: 'maafushi',
    name: 'Maafushi',
    atoll: 'Kaafu Atoll',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Bikini Beach', 'Water Sports', 'Island Hopping'],
    vibe: 'Active & Friendly'
  },
  {
    id: 'hulhumale',
    name: 'Hulhumalé',
    atoll: 'Kaafu Atoll',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Central Park', 'Water Sports', 'Beach Cafes'],
    vibe: 'Modern & Spacious'
  },
  {
    id: 'thulusdhoo',
    name: 'Thulusdhoo',
    atoll: 'Kaafu Atoll',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Surfing', 'Coca-Cola Factory', 'Snorkeling'],
    vibe: 'Chilled & Adventurous'
  },
  {
    id: 'rasdhoo',
    name: 'Rasdhoo',
    atoll: 'Alif Alif Atoll',
    image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Hammerhead Point', 'Sandbank Trip', 'Diving'],
    vibe: 'Aquatic & Serene'
  },
  {
    id: 'ukulhas',
    name: 'Ukulhas',
    atoll: 'Alif Alif Atoll',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop',
    highlights: ['Long White Beach', 'Manta Ray Safaris', 'Eco-Tours'],
    vibe: 'Eco-conscious & Peaceful'
  },
  {
    id: 'dhiffushi',
    name: 'Dhiffushi',
    atoll: 'Kaafu Atoll',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Sunrise Views', 'Sandbank Picnic', 'Kayaking'],
    vibe: 'Tranquil & Authentic'
  },
  {
    id: 'fuvahmulah',
    name: 'Fuvahmulah',
    atoll: 'Fuvahmulah City',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Tiger Shark Diving', 'Freshwater Lakes', 'Nature Trails'],
    vibe: 'Wild & Exotic'
  }
];

/**
 * Merged Source of Truth for ALL Islands.
 * Combines raw list with rich metadata where available.
 */
export const ISLANDS_DATA: Island[] = MALDIVES_ISLANDS_RAW.map((island) => {
  const popular = POPULAR_ISLANDS.find(p => p.name === island.name && p.atoll === island.atoll);
  if (popular) return popular;

  return {
    id: `${island.name.replace(/\s+/g, '-').toLowerCase()}-${island.atoll.replace(/\s+/g, '-').toLowerCase()}`,
    name: island.name,
    atoll: island.atoll,
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Local Culture', 'Pristine Beaches', 'Turquoise Water'],
    vibe: 'Authentic & Serene'
  };
});

// For backward compatibility and specialized lists
export const MALDIVES_ISLANDS = ISLANDS_DATA;

/**
 * Destination options for the Deal Request Wizard.
 */
export const DESTINATION_OPTIONS = [
  'Malé', 
  'Maafushi', 
  'Ari Atoll', 
  'Baa Atoll', 
  'Addu City', 
  'Hulhumalé', 
  'Vaavu Atoll', 
  'Thulusdhoo'
];

/**
 * Atoll options for user onboarding.
 */
export const ATOLL_OPTIONS = [
  { value: 'male_atoll', label: 'North Malé Atoll', icon: '🏝️' },
  { value: 'south_male', label: 'South Malé Atoll', icon: '🌊' },
  { value: 'ari_atoll', label: 'Ari Atoll', icon: '🐠' },
  { value: 'baa_atoll', label: 'Baa Atoll', icon: '🪸' },
  { value: 'vaavu_atoll', label: 'Vaavu Atoll', icon: '🦈' },
  { value: 'laccadive', label: 'Lhaviyani Atoll', icon: '🌅' },
];
