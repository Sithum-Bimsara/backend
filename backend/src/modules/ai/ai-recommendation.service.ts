import { prisma } from "../../config/prisma";
import type { Prisma } from "@prisma/client";
import {
  ACCOMMODATION_KEYWORDS,
  canonicalizeActivityPhrase,
  NOISE_ACTIVITY_PHRASES,
} from "./recommendation-taxonomy";
import { redisConnection } from "../../config/redis";
import { enqueueRecommendationJob } from "../../queues/recommendationQueue";
import { getSriLankaTime } from "../../utils/timezone";

const CANDIDATE_CACHE_KEY = "trending:deals:top100";

/**
 * --- TYPES & CONSTANTS ---
 */

export interface ScoredDealId {
  dealId: string;
  score: number;
}

const MATCH_WEIGHTS = {
  onboardingLocation: 20,
  onboardingActivities: 20,
  onboardingAccommodation: 10,
  onboardingPrice: 15,
  behaviorLocation: 10,
  behaviorActivities: 10,
  behaviorPrice: 15,
} as const;

type CounterMap = Record<string, number>;
type StatEventType = "view" | "lock" | "booking";

/**
 * --- DATA PARSING HELPERS ---
 */

const asCounterMap = (value: Prisma.JsonValue | null | undefined): CounterMap => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const map: CounterMap = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "number" && Number.isFinite(entry)) {
      map[key] = entry;
    }
  }
  return map;
};

const normalizeToken = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const next = value.trim().toLowerCase();
  return next.length > 0 ? next : null;
};

const parseJsonStringArray = (value: Prisma.JsonValue | null | undefined): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? normalizeToken(item) : null))
    .filter((item): item is string => Boolean(item));
};

const getTopCounterKeys = (map: CounterMap, max = 8): string[] => {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([key]) => key);
};

/**
 * --- FEATURE EXTRACTION ---
 */

const extractActivityPhrases = (text: string | null | undefined): string[] => {
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .replace(/[()\[\]{}]/g, " ")
    .replace(/\s*[+&,/|;:-]\s*/g, "|")
    .replace(/\b(?:and|with|then|to|for)\b/g, "|");

  return normalized
    .split("|")
    .map((part) => part.trim().replace(/\s+/g, " "))
    .filter((part) => part.length >= 3 && !NOISE_ACTIVITY_PHRASES.has(part))
    .map((phrase) => canonicalizeActivityPhrase(phrase))
    .filter((phrase): phrase is string => Boolean(phrase));
};

const extractAccommodationTokens = (text: string | null | undefined): string[] => {
  if (!text) return [];
  const haystack = text.toLowerCase();
  return Array.from(ACCOMMODATION_KEYWORDS).filter((token) => haystack.includes(token));
};

const getDealBaseFeatures = (deal: any) => {
  const prices = [
    ...(deal.variants ?? [])
      .map((v: any) => v.displayedPrice ?? v.dealPrice)
      .filter((p: any) => typeof p === "number"),
    deal.displayedPrice,
    deal.dealPrice,
  ].filter((p: any) => typeof p === "number");

  const price = prices.length > 0 ? Math.min(...prices) : null;
  const activities = new Set<string>();
  const categoryToken = normalizeToken(deal.category);
  if (categoryToken) activities.add(categoryToken);

  (deal.inclusions ?? []).forEach((inc: any) => {
    extractActivityPhrases(inc.description).forEach((p) => activities.add(p));
  });
  (deal.itineraries ?? []).forEach((it: any) => {
    extractActivityPhrases(it.title).forEach((p) => activities.add(p));
    extractActivityPhrases(it.description).forEach((p) => activities.add(p));
  });

  const accommodations = new Set<string>();
  extractAccommodationTokens(deal.description).forEach((t) => accommodations.add(t));
  (deal.inclusions ?? []).forEach((inc: any) => {
    extractAccommodationTokens(inc.description).forEach((t) => accommodations.add(t));
  });
  (deal.itineraries ?? []).forEach((it: any) => {
    extractAccommodationTokens(it.title).forEach((t) => accommodations.add(t));
    extractAccommodationTokens(it.description).forEach((t) => accommodations.add(t));
  });

  return {
    location: normalizeToken(deal.location),
    activities: Array.from(activities),
    accommodations: Array.from(accommodations),
    price,
    createdAt: deal.createdAt,
  };
};

/**
 * --- SCORING RULES ---
 */

const scoreTokenMatch = (dealTokens: string[], prefSet: Set<string>, weight: number) => {
  if (dealTokens.length === 0 || prefSet.size === 0) return 0;
  const matched = dealTokens.filter((t) => prefSet.has(t)).length;
  if (matched <= 0) return 0;
  return Math.round(weight * (matched / dealTokens.length));
};

const scoreRangeMatch = (price: number | null, min: number | null | undefined, max: number | null | undefined, weight: number) => {
  if (typeof price !== "number" || typeof min !== "number" || typeof max !== "number") return 0;
  if (price >= min && price <= max) return weight;

  const center = (min + max) / 2;
  const spread = Math.max((max - min) / 2, 1);
  const distance = Math.abs(price - center);
  const normalized = Math.max(0, 1 - distance / spread);
  return Math.round(weight * normalized);
};

/**
 * REVISED POPULARITY MODEL (with Time Decay)
 * popularity = (5 * bookings) + (3 * locks) + (1 * views)
 * decayedPopularity = popularity * exp(-ageDays / 7)
 */
const calculateDecayedPopularity = (stats: any, createdAt: Date) => {
  if (!stats) return 0;
  const popularity = (stats.totalBookings || 0) * 5 + (stats.totalLocks || 0) * 3 + (stats.totalViews || 0);
  
  const now = new Date();
  const ageMs = now.getTime() - new Date(createdAt).getTime();
  const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  
  // Halflife approximately 5 days (with denominator 7)
  const decayFactor = Math.exp(-ageDays / 7);
  
  return popularity * decayFactor;
};

/**
 * --- ERROR HANDLING ---
 */

const isMissingSchemaError = (error: unknown) => {
  const msg = (error as any)?.message || "";
  return (error as any)?.code === "P2021" || (error as any)?.code === "P2022" || /UserInterestProfile|DealStats|UserRecommendations/.test(msg);
};

/**
 * --- CORE PUBLIC FUNCTIONS ---
 */

/**
 * Updates a user's interest profile based on a deal interaction.
 * USES TRANSACTION FOR CONCURRENCY SAFETY (TASK 7)
 */
export const updateUserInterestFromDeal = async (userId: string, dealId: string, weight: number, tx?: Prisma.TransactionClient) => {
  if (!userId || weight <= 0) return;

  try {
    const execute = async (txClient: Prisma.TransactionClient) => {
      const deal = await txClient.deal.findUnique({
        where: { id: dealId },
        include: { inclusions: true, itineraries: true, variants: { where: { status: "active" } } },
      });

      if (!deal) return;
      const features = getDealBaseFeatures(deal);

      const existingProfile = await txClient.userInterestProfile.findUnique({ where: { userId } });

      let locs = asCounterMap(existingProfile?.interestedLocations);
      let acts = asCounterMap(existingProfile?.interestedActivities);
      let accs = asCounterMap(existingProfile?.accommodationTypes);

      if (features.location) locs[features.location] = (locs[features.location] ?? 0) + weight;
      features.activities.forEach((a) => (acts[a] = (acts[a] ?? 0) + weight));
      features.accommodations.forEach((a) => (accs[a] = (accs[a] ?? 0) + weight));

      const nextMin = typeof features.price === "number" ? Math.min(existingProfile?.preferredPriceMin ?? features.price, features.price) : existingProfile?.preferredPriceMin ?? null;
      const nextMax = typeof features.price === "number" ? Math.max(existingProfile?.preferredPriceMax ?? features.price, features.price) : existingProfile?.preferredPriceMax ?? null;

      await txClient.userInterestProfile.upsert({
        where: { userId },
        create: { userId, interestedLocations: locs, interestedActivities: acts, accommodationTypes: accs, preferredPriceMin: nextMin, preferredPriceMax: nextMax },
        update: { interestedLocations: locs, interestedActivities: acts, accommodationTypes: accs, preferredPriceMin: nextMin, preferredPriceMax: nextMax },
      });
    };

    if (tx) {
      await execute(tx);
    } else {
      await prisma.$transaction(async (innerTx) => {
        await execute(innerTx);
      });
    }
  } catch (error) {
    if (!isMissingSchemaError(error)) {
      console.error(`[AI Service] updateUserInterestFromDeal atomicity fail: ${error}`);
    }
  }
};

/**
 * Increments global stats for a deal or property.
 */
const incrementEntityStats = async (
  entityId: string,
  entityType: 'deal' | 'property',
  type: StatEventType,
  tx?: Prisma.TransactionClient
) => {
  const client = tx || prisma;
  const update: any = {};
  if (type === "view") update.totalViews = { increment: 1 };
  if (type === "lock") update.totalLocks = { increment: 1 };
  if (type === "booking") update.totalBookings = { increment: 1 };

  const where = entityType === 'deal' ? { dealId: entityId } : { propertyId: entityId };
  const create = {
    ...where,
    totalViews: type === "view" ? 1 : 0,
    totalLocks: type === "lock" ? 1 : 0,
    totalBookings: type === "booking" ? 1 : 0,
  };

  try {
    await client.interactionStats.upsert({
      where,
      create,
      update,
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
  }
};

export const incrementDealStats = async (dealId: string, type: StatEventType, tx?: Prisma.TransactionClient) => {
  await incrementEntityStats(dealId, 'deal', type, tx);
};

export const incrementPropertyStats = async (propertyId: string, type: StatEventType, tx?: Prisma.TransactionClient) => {
  await incrementEntityStats(propertyId, 'property', type, tx);
};

/**
 * TASK 4: CACHE CANDIDATE POOL
 * Fetches and ranks the top 100 trending deals based on decayed popularity.
 * Intended to be run periodically by a background job.
 */
export const getTrendingDealsCandidatePool = async () => {
  const startTime = Date.now();
  try {
    const allDeals = await prisma.deal.findMany({
      where: {
        isActive: true,
        merchant: { verificationStatus: "verified" },
        variants: { some: { status: "active", startDatetime: { gte: new Date() }, availableSlots: { gt: 0 } } },
      },
      include: {
        variants: { where: { status: "active" }, select: { displayedPrice: true } },
        inclusions: { select: { description: true } },
        itineraries: { select: { title: true, description: true } },
        stats: { select: { totalViews: true, totalLocks: true, totalBookings: true } },
      },
    });

    const pool = allDeals
      .map(deal => ({
        deal,
        decayedPopularity: calculateDecayedPopularity(deal.stats, deal.createdAt)
      }))
      .sort((a, b) => b.decayedPopularity - a.decayedPopularity)
      .slice(0, 100);

    const candidates = pool.map(p => p.deal);
    
    // Store in Redis as JSON
    await redisConnection.set(CANDIDATE_CACHE_KEY, JSON.stringify(candidates), "EX", 600); // 10 min TTL safety

    console.log(`[AI Service] getTrendingDealsCandidatePool completed in ${Date.now() - startTime}ms. Cached ${candidates.length} deals.`);
    return candidates;
  } catch (error) {
    console.error(`[AI Service] getTrendingDealsCandidatePool error: ${error}`);
    return [];
  }
};

/**
 * OPTIMIZED WORKER FLOW:
 * 1. Fetch TOP deals ONLY from Redis candidate pool (or fallback to DB).
 * 2. Scored selected candidates.
 */
export const getScoredRecommendations = async (userId: string, limit: number): Promise<ScoredDealId[]> => {
  const startTime = Date.now();
  let cacheHit = false;

  const [profile, prefs] = await Promise.all([
    prisma.userInterestProfile.findUnique({ where: { userId } }).catch(() => null),
    prisma.userPreference.findUnique({ where: { userId } }).catch(() => null),
  ]);

  if (!profile && !prefs) return [];

  /**
   * TASK 4: USE CACHED CANDIDATES
   */
  let candidates: any[] = [];
  try {
    const cachedData = await redisConnection.get(CANDIDATE_CACHE_KEY);
    if (cachedData) {
      candidates = JSON.parse(cachedData);
      cacheHit = true;
    }
  } catch (e) {
    console.error(`[AI Service] Redis candidate fetch fail: ${e}`);
  }

  // FALLBACK OR RECENT ACTIVE DEALS SYNC
  if (candidates.length === 0) {
    console.log(`[AI Service] Cache miss for trending candidates. Falling back to DB.`);
    candidates = await prisma.deal.findMany({
      where: {
        isActive: true,
        merchant: { verificationStatus: "verified" },
        variants: { some: { status: "active", startDatetime: { gte: new Date() }, availableSlots: { gt: 0 } } },
      },
      include: {
        variants: { where: { status: "active" }, select: { displayedPrice: true } },
        inclusions: { select: { description: true } },
        itineraries: { select: { title: true, description: true } },
        stats: { select: { totalViews: true, totalLocks: true, totalBookings: true } },
      },
      take: 100,
    });
  } else {
    // Append any recently active deals that are not yet in the Redis top 100 cache
    const cachedIds = new Set(candidates.map((c) => c.id));
    const recentActiveDeals = await prisma.deal.findMany({
      where: {
        id: { notIn: Array.from(cachedIds) },
        isActive: true,
        merchant: { verificationStatus: "verified" },
        variants: { some: { status: "active", startDatetime: { gte: new Date() }, availableSlots: { gt: 0 } } },
      },
      include: {
        variants: { where: { status: "active" }, select: { displayedPrice: true } },
        inclusions: { select: { description: true } },
        itineraries: { select: { title: true, description: true } },
        stats: { select: { totalViews: true, totalLocks: true, totalBookings: true } },
      },
    });
    if (recentActiveDeals.length > 0) {
      candidates = [...candidates, ...recentActiveDeals];
      console.log(`[AI Service] Appended ${recentActiveDeals.length} recent active deals to candidate pool.`);
    }
  }

  const prefData = {
    onboardingLocations: new Set(parseJsonStringArray(prefs?.preferredLocations)),
    onboardingActivities: new Set(parseJsonStringArray(prefs?.activityInterests)),
    onboardingAccs: new Set(parseJsonStringArray(prefs?.accommodationTypes)),
    behaviorLocations: new Set(getTopCounterKeys(asCounterMap(profile?.interestedLocations), 12)),
    behaviorActivities: new Set(getTopCounterKeys(asCounterMap(profile?.interestedActivities), 20)),
    behaviorAccs: new Set(getTopCounterKeys(asCounterMap(profile?.accommodationTypes), 12)),
  };

  const isNewUser = !profile || (Object.keys(asCounterMap(profile.interestedActivities)).length === 0 && Object.keys(asCounterMap(profile.interestedLocations)).length === 0);

  // 2. Score and Rank selected candidates
  const results = candidates
    .map((deal) => {
      const features = getDealBaseFeatures(deal);
      let aiScore = 0;
      const loc = features.location ? [features.location] : [];
      
      aiScore += scoreTokenMatch(loc, prefData.onboardingLocations, MATCH_WEIGHTS.onboardingLocation);
      aiScore += scoreTokenMatch(loc, prefData.behaviorLocations, MATCH_WEIGHTS.behaviorLocation);
      aiScore += scoreTokenMatch(features.activities, prefData.onboardingActivities, MATCH_WEIGHTS.onboardingActivities);
      aiScore += scoreTokenMatch(features.activities, prefData.behaviorActivities, MATCH_WEIGHTS.behaviorActivities);
      aiScore += scoreTokenMatch(features.accommodations, prefData.onboardingAccs, MATCH_WEIGHTS.onboardingAccommodation);
      aiScore += Math.min(MATCH_WEIGHTS.onboardingAccommodation, scoreTokenMatch(features.accommodations, prefData.behaviorAccs, 4));
      aiScore += scoreRangeMatch(features.price, prefs?.budgetMin, prefs?.budgetMax, MATCH_WEIGHTS.onboardingPrice);
      aiScore += scoreRangeMatch(features.price, profile?.preferredPriceMin, profile?.preferredPriceMax, MATCH_WEIGHTS.behaviorPrice);
      
      aiScore = Math.max(0, Math.min(100, aiScore));
      
      if (isNewUser) {
        const decayedPop = calculateDecayedPopularity(deal.stats, deal.createdAt);
        if (decayedPop > 50) aiScore *= 1.1; 
      }
      
      if (aiScore <= 0) aiScore = 5;

      return { dealId: deal.id, score: aiScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log(`[AI Service] Recommendations for ${userId}: ${results.length} deals computed in ${Date.now() - startTime}ms (Cache: ${cacheHit ? "HIT" : "MISS"}, Candidates: ${candidates.length})`);
  return results;
};

/**
 * Persists calculated recommendations to the database.
 */
export const saveUserRecommendations = async (userId: string, scoredDeals: ScoredDealId[]) => {
  try {
    await prisma.userRecommendations.upsert({
      where: { userId },
      create: { userId, data: scoredDeals as any },
      update: { data: scoredDeals as any },
    });
  } catch (error) {
    if (!isMissingSchemaError(error)) throw error;
  }
};

/**
 * Retrieves paginated recommended deals for a user, using cache when available.
 */
export const getRecommendedDealsPageForUser = async (
  userId: string,
  page: number,
  limit: number,
  /**
   * Pre-fetched UserRecommendations row — passed in when the caller already
   * ran this query in parallel with other work (e.g. eligibility check).
   * Skips a DB round-trip when provided.
   */
  prefetchedCache?: { data: any } | null
) => {
  const skip = (Math.max(1, page) - 1) * limit;

  // 1. Try Cache (Fast Path) — use pre-fetched value if available, otherwise query now.
  const cached =
    prefetchedCache !== undefined
      ? prefetchedCache
      : await prisma.userRecommendations.findUnique({ where: { userId }, select: { data: true } }).catch(() => null);
  
  let scoredList: ScoredDealId[] = [];
  if (cached?.data && Array.isArray(cached.data)) {
    scoredList = cached.data as any;
    // Asynchronously trigger a background refresh so that new deals are scored and cached for subsequent requests
    enqueueRecommendationJob(userId).catch((err) =>
      console.error(`[AI Service] Async background recommendation refresh failed: ${err.message}`)
    );
  } else {
    /**
     * PIPELINE A FALLBACK (TASK 1 & 4)
     * If no personalized cache exists, return global trending deals immediately.
     * Then, trigger a background job to compute the personalized ones.
     */
    console.log(`[AI Service] Cache miss for ${userId}. Returning trending fallback and enqueuing job.`);
    const cachedTrending = await redisConnection.get(CANDIDATE_CACHE_KEY);
    if (cachedTrending) {
      const trending = JSON.parse(cachedTrending);
      scoredList = trending.slice(0, 50).map((d: any) => ({ dealId: d.id, score: 0 }));
    }
    
    // Trigger async Pipeline B
    enqueueRecommendationJob(userId);
  }

  if (scoredList.length === 0) {
    return { data: [], total: 0, page, limit };
  }

  const allIds = scoredList.map((s) => s.dealId);

  const validDeals = await prisma.deal.findMany({
    where: {
      id: { in: allIds },
      isActive: true,
      merchant: { verificationStatus: "verified" },
      variants: {
        some: {
          status: "active",
          startDatetime: { gte: getSriLankaTime() },
          availableSlots: { gt: 0 },
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      category: true,
      primaryImageUrl: true,
      durationDays: true,
      isLocalOnly: true,
      displayedPrice: true,
      originalPrice: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
      merchant: { select: { id: true, businessName: true, logoUrl: true } },
    },
  });

  const validDealsMap = new Map(validDeals.map((d) => [d.id, d]));

  // Filter scored list to maintain order and remove inactive deals
  const validScoredList = scoredList.filter((s) => validDealsMap.has(s.dealId));

  const total = validScoredList.length;
  const pageScored = validScoredList.slice(skip, skip + limit);

  const sortedDeals = pageScored.map((s) => {
    const deal = validDealsMap.get(s.dealId)!;
    return {
      ...deal,
      aiScore: s.score,
    };
  });

  return { data: sortedDeals, total, page, limit };
};
