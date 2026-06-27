export const DEFAULT_DEAL_IMAGE_URL = '/images/default-deal.svg';

export const resolveDealImageUrl = (imageUrl?: string | null): string => {
  const normalized = imageUrl?.trim();
  return normalized && normalized.length > 0 ? normalized : DEFAULT_DEAL_IMAGE_URL;
};

export const resolveDealGallery = (
  imageUrls: Array<string | null | undefined>,
  targetCount = 4,
): string[] => {
  const clean = imageUrls.filter((url): url is string => Boolean(url?.trim())).map((url) => url.trim());

  if (clean.length >= targetCount) {
    return clean.slice(0, targetCount);
  }

  const filled = [...clean];
  while (filled.length < targetCount) {
    filled.push(DEFAULT_DEAL_IMAGE_URL);
  }

  return filled;
};
