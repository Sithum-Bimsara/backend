import * as dealsService from "../deals/services/deals.service";
import * as accService from "../accommodation/services/accommodation.service";
import * as reviewService from "../deals/services/deal-review.service";
import * as propertyReviewService from "../accommodation/services/accommodation-review.service";
import type { ViewAccommodationReviewDto } from "../accommodation/dtos/accommodation-review.dtos";
import { 
  PublicDealQueryDto, 
  paginatedPublicDealResponseSchema,
  paginatedAccommodationDealResponseSchema,
  viewPlatformStatsSchema,
  islandListingsResponseSchema
} from "./public-deals.dtos";
import * as aiService from "../ai/ai-recommendation.service";
import { enqueueRecommendationJob } from "../../queues/recommendationQueue";
import { enqueueViewTrackingJob } from "../../queues/viewTrackingQueue";
import { prisma } from "../../config/prisma";

import { UnauthorizedException } from "../../exceptions/unauthorized.exception";

// ─── Public Deal Service ───

export const getActiveDeals = async (query: PublicDealQueryDto) => {
  const result = await dealsService.getActiveDealsCursor({
    cursor: query.cursor,
    limit: query.limit,
    category: query.category,
    isLocalOnly: query.isLocalOnly,
  });

  return paginatedPublicDealResponseSchema.parse(result);
};

export const getAccommodationDeals = async (query: PublicDealQueryDto, isLocal: boolean = false) => {
  const result = await accService.getAccommodationDeals({
    cursor: query.cursor,
    limit: query.limit,
    island: query.island,
  }, isLocal);

  return paginatedAccommodationDealResponseSchema.parse(result);
};

export const searchDeals = async (query: PublicDealQueryDto, userId?: string | null, isLocal: boolean = false) => {
  let cursorDate: Date | undefined;
  if (query.cursor) {
    const [dealRecord, propertyRecord] = await Promise.all([
      prisma.deal.findUnique({ where: { id: query.cursor }, select: { createdAt: true } }),
      prisma.property.findUnique({ where: { id: query.cursor }, select: { createdAt: true } }),
    ]);
    cursorDate = dealRecord?.createdAt || propertyRecord?.createdAt;
  }

  const [dealsResult, accommodationsResult] = await Promise.all([
    dealsService.searchDealsCursor({
      cursorDate,
      limit: query.limit,
      search: query.search,
      location: query.location,
      category: query.category,
      isLocalOnly: query.isLocalOnly,
    }),
    accService.searchAccommodationsCursor({
      cursorDate,
      limit: query.limit,
      search: query.search,
      location: query.location,
      category: query.category,
      island: query.island,
      isLocalOnly: query.isLocalOnly,
    }, isLocal)
  ]);

  const mappedDeals = dealsResult.items.map(deal => ({
    ...deal,
    isAccommodation: false,
  }));

  const mappedAccommodations = accommodationsResult.items;

  const combinedItems = [...mappedDeals, ...mappedAccommodations];
  combinedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const slicedItems = combinedItems.slice(0, query.limit);
  const nextCursor = combinedItems.length > query.limit ? slicedItems[slicedItems.length - 1].id : null;

  const parsedResult = paginatedAccommodationDealResponseSchema.parse({
    items: slicedItems,
    nextCursor,
    total: (dealsResult.total || 0) + (accommodationsResult.total || 0),
  });

  const hasSearchSignal = Boolean(
    query.search || query.location || query.category
  );

  if (userId && hasSearchSignal) {
    dealsService.createSearchLog({
      userId,
      query: query.search,
      filters: {
        location: query.location ?? null,
        category: query.category ?? null,
        limit: query.limit ?? 10,
      },
      resultDealIds: slicedItems.map((item) => item.id),
    }).catch(err => {
      console.error("[SearchLog] Non-blocking logging failed:", err.message);
    });
    enqueueRecommendationJob(userId);
  }

  return parsedResult;
};

export const getDealDetail = async (dealId: string, options: { userId?: string | null; trackView?: boolean }) => {
  const { userId, trackView = true } = options;

  const deal = await dealsService.getDealDetailPublic(dealId);

  if (trackView) {
    enqueueViewTrackingJob({ userId: userId ?? null, dealId });
  }

  const [reviewsPreview, userReview] = await Promise.all([
    reviewService.getDealReviewsPreview(dealId).catch((err) => {
      console.error("[getDealDetail] reviewsPreview failed to load, degrading gracefully:", err.message);
      return null;
    }),
    userId
      ? reviewService.getUserReviewForDeal(userId, dealId).catch((err) => {
          console.error("[getDealDetail] userReview failed to load, degrading gracefully:", err.message);
          return null;
        })
      : null,
  ]);

  // Passthrough since dealDetail represents complex deeply nested relations
  return { ...deal, reviewsPreview, userReview };
};

export const getDealAddOns = async (dealId: string) => {
  const addOns = await dealsService.getDealExclusionsPublic(dealId);
  return addOns; // Passthrough
};

export const getPropertyDetail = async (id: string, userId?: string, isLocal: boolean = false) => {
  const [property, reviewsPreview, userReview] = await Promise.all([
    accService.getPropertyDetailPublic(id, isLocal),
    propertyReviewService.getPropertyReviewsPreview(id).catch((err) => {
      console.error("[getPropertyDetail] reviewsPreview failed to load, degrading gracefully:", err.message);
      return null;
    }),
    userId
      ? propertyReviewService.getUserReviewForProperty(userId, id).catch((err) => {
          console.error("[getPropertyDetail] userReview failed to load, degrading gracefully:", err.message);
          return null;
        })
      : null,
  ]);

  return { ...property, reviewsPreview, userReview };
};

export const getDealVariantsForLocking = async (dealId: string) => {
  return dealsService.getDealVariantsForLockingPublic(dealId);
};

export const getRecommendedDeals = async (userId: string, pagination: { page: number; limit: number }) => {
  const [currentUser, cachedRecommendations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isTraveller: true, preferences: { select: { id: true } } },
    }),
    prisma.userRecommendations.findUnique({ where: { userId }, select: { data: true } }).catch(() => null),
  ]);

  const isEligibleForRecommendations = Boolean(currentUser?.isTraveller && currentUser?.preferences);
  if (!isEligibleForRecommendations) {
    throw new UnauthorizedException("For You recommendations are available only for travellers with completed preferences.");
  }

  return aiService.getRecommendedDealsPageForUser(userId, pagination.page, pagination.limit, cachedRecommendations);
};

export const getPlatformStats = async () => {
  const stats = await dealsService.getPlatformStatsPublic();
  return viewPlatformStatsSchema.parse(stats);
};

/**
 * Coordinated getter to fetch unique island names that have active deals OR available rooms in the future.
 */
export const getActiveIslands = async (): Promise<string[]> => {
  const [dealIslands, roomIslands] = await Promise.all([
    dealsService.getActiveIslandsWithDeals(),
    accService.getActiveIslandsWithRooms(),
  ]);

  const combinedIslands = new Set<string>([...dealIslands, ...roomIslands]);
  return Array.from(combinedIslands);
};

export const getIslandListings = async (
  islandName: string,
  query: {
    dealsPage?: number;
    dealsLimit?: number;
    accommodationsPage?: number;
    accommodationsLimit?: number;
    isLocal?: boolean;
  }
) => {
  const dealsPage = query.dealsPage || 1;
  const dealsLimit = query.dealsLimit || 10;
  const accsPage = query.accommodationsPage || 1;
  const accsLimit = query.accommodationsLimit || 10;
  const isLocal = query.isLocal ?? false;

  const [dealsResult, accsResult] = await Promise.all([
    dealsService.getMinimalIslandDeals(islandName, { page: dealsPage, limit: dealsLimit }),
    accService.getMinimalIslandAccommodations(islandName, { page: accsPage, limit: accsLimit }),
  ]);

  const mappedDeals = dealsResult.items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    primaryImageUrl: item.primaryImageUrl,
    displayedPrice: item.displayedPrice,
    originalPrice: item.originalPrice,
    averageRating: item.averageRating,
    totalReviews: item.totalReviews,
    isAccommodation: false,
    merchant: item.merchant,
  }));

  const mappedAccommodations = accsResult.items.map((item) => {
    const cheapestUnit = item.units[0];
    const finalPrice = (isLocal && cheapestUnit?.localPrice) ? cheapestUnit.localPrice : (cheapestUnit?.nonLocalPrice || cheapestUnit?.pricePerNight || 0);

    return {
      id: item.id,
      title: item.name || "Untitled Property",
      description: item.description,
      primaryImageUrl: item.images[0]?.url || null,
      displayedPrice: finalPrice,
      originalPrice: cheapestUnit?.pricePerNight || null,
      averageRating: item.averageRating,
      totalReviews: item.totalReviews,
      isAccommodation: true,
      merchant: item.merchant,
    };
  });

  return islandListingsResponseSchema.parse({ 
    deals: mappedDeals, 
    accommodations: mappedAccommodations,
    pagination: {
      deals: {
        total: dealsResult.total,
        page: dealsPage,
        limit: dealsLimit,
        hasMore: dealsPage * dealsLimit < dealsResult.total,
      },
      accommodations: {
        total: accsResult.total,
        page: accsPage,
        limit: accsLimit,
        hasMore: accsPage * accsLimit < accsResult.total,
      },
    },
  });
};

// ─── Featured Reviews (Homepage) ───

export const getFeaturedReviews = async (
  dealLimit: number,
  accommLimit: number
) => {
  // Call each review service independently — strict service-to-service separation
  const [dealReviews, accommodationReviews] = await Promise.all([
    reviewService.getFeaturedReviews(dealLimit),
    propertyReviewService.getFeaturedReviews(accommLimit),
  ]);

  // Normalise accommodation reviews to a common shape (user.name is nullable)
  const normalisedAccomm = accommodationReviews.map((r: ViewAccommodationReviewDto) => ({
    id: r.id,
    dealId: null as string | null,
    propertyId: r.propertyId,
    rating: r.rating,
    comment: r.comment ?? "",
    badgeType: r.badgeType,
    isEdited: r.isEdited,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: { id: r.user?.id ?? "", name: r.user?.name ?? "Anonymous" },
  }));

  // Merge, sort newest first, no further slice (caller controls limits via params)
  return [...dealReviews, ...normalisedAccomm].sort(
    (a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime()
  );
};
