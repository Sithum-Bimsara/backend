import { Router } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { requireMerchant } from "../../../middleware/merchant.middleware";
import { requireDealOwner } from "../../../middleware/deal-owner.middleware";
import * as service from "../services/deals.service";
import { validateRequest } from "../../../middleware/validate.middleware";
import {
  createDealSchema,
  updateDealSchema,
  updateVariantSchema,
  bulkGenerateVariantsSchema,
  variantsQuerySchema,
  VariantsQueryDto,
  listDealsQuerySchema,
  ListDealsQueryDto,
  BulkGenerateVariantsDto,
  dateRangeQuerySchema,
  DateRangeQueryDto,
  listLocksQuerySchema,
  listBookingsQuerySchema,
  ListLocksQueryDto,
  ListBookingsQueryDto,
} from "../dtos/deals.dtos";
import { AuthenticatedRequest } from "../../../types/express/index";

const router = Router();

// All deal routes require a valid auth token and an active merchant profile.
router.use(verifyToken, requireMerchant);

// ─── DEAL ROUTES ───


/**
 * Returns all active deals owned by the current merchant with cursor-based pagination and search.
 */
router.get("/mine", validateRequest({ query: listDealsQuerySchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const query = authReq.query as unknown as ListDealsQueryDto;
    const result = await service.listMyDeals(merchantId, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Creates a new deal for the authenticated merchant.
 */
router.post("/", validateRequest({ body: createDealSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const deal = await service.createDeal(merchantId, authReq.body);
    res.status(201).json(deal);
  } catch (error) {
    next(error);
  }
});

/**
 * Returns a single deal by its ID with full details.
 */
router.get("/:id", requireDealOwner, async (req, res, next) => {
  try {
    const dealId = req.params.id as string;
    const deal = await service.getDealById(dealId);
    res.status(200).json(deal);
  } catch (error) {
    next(error);
  }
});

/**
 * Returns analytics for a specific deal.
 */
router.get("/:id/analytics", requireDealOwner, validateRequest({ query: dateRangeQuerySchema }), async (req, res, next) => {
  try {
    const dealId = req.params.id as string;
    const query = req.query as unknown as DateRangeQueryDto;
    const analytics = await service.getDealAnalytics(dealId, query);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireDealOwner, validateRequest({ body: updateDealSchema }), async (req, res, next) => {
  try {
    const deal = req.deal!;
    const updated = await service.updateDeal(deal, req.body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

// ─── VARIANT ROUTES ───

/**
 * Lists all variants for a deal with optional status and date filtering.
 */
router.get("/:dealId/variants", requireDealOwner, validateRequest({ query: variantsQuerySchema }), async (req, res, next) => {
  try {
    const queryParams = req.query as unknown as VariantsQueryDto;
    const variants = await service.getVariantsByDeal(queryParams);
    res.status(200).json(variants);
  } catch (error) {
    next(error);
  }
});

/**
 * Updates an existing variant's slots or pricing.
 */
router.patch("/variants/:id", validateRequest({ body: updateVariantSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const variant = await service.updateVariant(authReq.params.id as string, merchantId, authReq.body);
    res.status(200).json(variant);
  } catch (error) {
    next(error);
  }
});

/**
 * Cancels an entire variant day.
 */
router.patch("/variants/:id/cancel", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const variant = await service.cancelVariant(authReq.params.id as string, merchantId);
    res.status(200).json(variant);
  } catch (error) {
    next(error);
  }
});

/**
 * Restores an entire cancelled variant.
 */
router.patch("/variants/:id/restore", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const variant = await service.restoreVariant(authReq.params.id as string, merchantId);
    res.status(200).json(variant);
  } catch (error) {
    next(error);
  }
});

/**
 * Cancels a single slot inside a variant.
 */
router.patch("/variants/slots/:id/cancel", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const slot = await service.cancelSlot(authReq.params.id as string, merchantId);
    res.status(200).json(slot);
  } catch (error) {
    next(error);
  }
});

/**
 * Restores a previously cancelled slot.
 */
router.patch("/variants/slots/:id/restore", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const slot = await service.restoreSlot(authReq.params.id as string, merchantId);
    res.status(200).json(slot);
  } catch (error) {
    next(error);
  }
});

// ─── BULK VARIANT OPERATIONS ───

/**
 * Bulk generates future variants automatically based on a schedule.
 */
router.post("/variants/bulk-generate", validateRequest({ body: bulkGenerateVariantsSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const body = authReq.body as unknown as BulkGenerateVariantsDto;
    const result = await service.bulkGenerateVariants(merchantId, body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Previews bulk generation and checks for conflicts.
 */
router.post("/variants/bulk-preview", validateRequest({ body: bulkGenerateVariantsSchema }), async (req, res, next) => {
  try {
    const body = req.body as unknown as BulkGenerateVariantsDto;
    const result = await service.previewBulkGenerateVariants(body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /deals/:id/locks
 * Returns paginated list of package deal locks for a deal.
 */
router.get(
  "/:id/locks",
  requireDealOwner,
  validateRequest({ query: listLocksQuerySchema }),
  async (req, res, next) => {
    try {
      const deal = req.deal!;
      const query = req.query as unknown as ListLocksQueryDto;
      const result = await service.listDealLocks(deal, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /deals/:id/bookings
 * Returns paginated list of package deal bookings for a deal.
 */
router.get(
  "/:id/bookings",
  requireDealOwner,
  validateRequest({ query: listBookingsQuerySchema }),
  async (req, res, next) => {
    try {
      const deal = req.deal!;
      const query = req.query as unknown as ListBookingsQueryDto;
      const result = await service.listDealBookings(deal, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
