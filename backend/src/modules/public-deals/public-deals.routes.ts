import { Router, Response, NextFunction } from "express";
import { optionalAuth, verifyToken } from "../../middleware/auth.middleware";
import { attachResidency } from "../../middleware/traveller.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import * as service from "./public-deals.service";
import { 
  publicDealQuerySchema, 
  paginationQuerySchema, 
  idParamSchema, 
  dealDetailQuerySchema,
  PublicDealRequest
} from "./public-deals.dtos";

const router = Router();

/**
 * GET /platform-stats
 * Retrieves aggregate platform statistics including count of deals, travellers, and active locks.
 */
router.get(
  "/platform-stats", 
  async (_req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await service.getPlatformStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /recommended
 * Retrieves personalized AI recommendations for the authenticated user based on their preferences.
 */
router.get(
  "/recommended", 
  verifyToken, 
  validateRequest({
    query: paginationQuerySchema,
  }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const { page, limit } = paginationQuerySchema.parse(req.query);
      const result = await service.getRecommendedDeals(userId!, { page, limit });
      // Legacy AI recommendation format preservation
      res.status(200).json({ success: true, data: result.data, total: result.total, page, limit });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /
 * Lists all active deals with optional filtering and cursor-based pagination.
 */
router.get(
  "/", 
  optionalAuth, 
  validateRequest({ query: publicDealQuerySchema }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const query = publicDealQuerySchema.parse(req.query);
      const result = await service.getActiveDeals(query);
      res.status(200).json({ success: true, data: result.items, nextCursor: result.nextCursor });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /accommodations
 * Lists all active accommodation properties with availability, mapping them to the Deal card format.
 */
router.get(
  "/accommodations", 
  optionalAuth, 
  attachResidency, 
  validateRequest({ query: publicDealQuerySchema }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const query = publicDealQuerySchema.parse(req.query);
      const isLocal = req.isLocal ?? false;
      const result = await service.getAccommodationDeals(query, isLocal);
      res.status(200).json({ success: true, data: result.items, nextCursor: result.nextCursor });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * GET /accommodation/:id
 * Retrieves full details for a specific accommodation property listing, including units and rate plans.
 */
router.get(
  "/accommodation/:id", 
  optionalAuth, 
  attachResidency, 
  validateRequest({ params: idParamSchema }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const { id: propertyId } = idParamSchema.parse(req.params);
      const userId = req.userId ?? undefined;
      const isLocal = req.isLocal ?? false;
      const property = await service.getPropertyDetail(propertyId, userId as string, isLocal);
      res.status(200).json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * GET /search
 * Searches and lists deals with advanced filtering (search term, category, location, price range) and includes non-blocking search tracking.
 */
router.get(
  "/search", 
  optionalAuth, 
  attachResidency, 
  validateRequest({ query: publicDealQuerySchema }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const query = publicDealQuerySchema.parse(req.query);
      const isLocal = req.isLocal ?? false;
      const userId = req.userId ?? undefined;
      const result = await service.searchDeals(query, userId, isLocal);
      res.status(200).json({ success: true, data: result.items, nextCursor: result.nextCursor, total: result.total });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /active-islands
 * Retrieves unique island names with at least one active deal with future variants OR available rooms in the future.
 */
router.get(
  "/active-islands",
  async (_req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const islands = await service.getActiveIslands();
      res.status(200).json({ success: true, data: islands });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /active-islands/:islandName/listings
 * Retrieves minimal active deals and accommodations concurrently for a specific island.
 */
router.get(
  "/active-islands/:islandName/listings",
  optionalAuth,
  attachResidency,
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const islandName = req.params.islandName as string;
      const isLocal = req.isLocal ?? false;

      const dealsPage = req.query.dealsPage ? parseInt(req.query.dealsPage as string, 10) : 1;
      const dealsLimit = req.query.dealsLimit ? parseInt(req.query.dealsLimit as string, 10) : 10;
      const accommodationsPage = req.query.accommodationsPage ? parseInt(req.query.accommodationsPage as string, 10) : 1;
      const accommodationsLimit = req.query.accommodationsLimit ? parseInt(req.query.accommodationsLimit as string, 10) : 10;

      const result = await service.getIslandListings(islandName, {
        dealsPage,
        dealsLimit,
        accommodationsPage,
        accommodationsLimit,
        isLocal,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /featured-reviews
 * Returns the latest high-rated reviews merged from both deals and accommodation.
 * Accepts:
 *   - dealLimit   (number, default 3) — max deal reviews to fetch
 *   - accommLimit (number, default 3) — max accommodation reviews to fetch
 * Results are merged and sorted by newest first before being returned.
 * No auth required.
 */
router.get(
  "/featured-reviews",
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const dealLimit   = Math.min(parseInt(req.query.dealLimit   as string) || 3, 10);
      const accommLimit = Math.min(parseInt(req.query.accommLimit as string) || 3, 10);
      const reviews = await service.getFeaturedReviews(dealLimit, accommLimit);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /:id
 * Retrieves full details for a specific deal including itineraries, inclusions, exclusions, and active variants. Supports view tracking.
 */
router.get(
  "/:id", 
  optionalAuth, 
  validateRequest({ 
    params: idParamSchema,
    query: dealDetailQuerySchema
  }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const { id: dealId } = idParamSchema.parse(req.params);
      const userId = req.userId ?? undefined;
      const { trackView } = dealDetailQuerySchema.parse(req.query);

      const deal = await service.getDealDetail(dealId, { userId, trackView });
      res.status(200).json({ success: true, data: deal });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /:id/add-ons
 * Optimized endpoint to retrieve only the priced add-ons (exclusions) for a specific deal during the booking flow.
 */
router.get(
  "/:id/add-ons", 
  validateRequest({ params: idParamSchema }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const { id: dealId } = idParamSchema.parse(req.params);
      const addOns = await service.getDealAddOns(dealId);
      res.status(200).json({ success: true, data: addOns });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /:id/variants
 * Lightweight endpoint to return only active variants and lock expiry time for a deal, used when opening the "Lock Deal" modal.
 */
router.get(
  "/:id/variants", 
  validateRequest({ params: idParamSchema }),
  async (req: PublicDealRequest, res: Response, next: NextFunction) => {
    try {
      const { id: dealId } = idParamSchema.parse(req.params);
      const data = await service.getDealVariantsForLocking(dealId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
