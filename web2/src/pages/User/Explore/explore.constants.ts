export const SORT_OPTIONS = ['Best match', 'Price: Low to High', 'Price: High to Low', 'Most Dates'] as const;
export type ExploreSortOption = (typeof SORT_OPTIONS)[number];