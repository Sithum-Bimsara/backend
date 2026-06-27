import { Router, Response, NextFunction } from "express";
import { verifyToken, optionalAuth } from "../../../middleware/auth.middleware";
import { requireTraveller } from "../../../middleware/traveller.middleware";
import { requireAdmin } from "../../../middleware/admin.middleware";
import * as service from "../services/deal-review.service";
import {
  createDealReviewSchema,
  updateDealReviewSchema,
  adminUpdateReviewBadgeSchema,
  dealReviewQuerySchema,
  adminBulkUpdateBadgeSchema,
  adminBulkDeleteSchema,
  dealIdParamsSchema,
  reviewIdParamsSchema,
  DealReviewQueryDto,
  CreateDealReviewDto,
  UpdateDealReviewDto,
  AdminUpdateReviewBadgeDto,
  AdminBulkUpdateBadgeDto,
  AdminBulkDeleteDto
} from "../dtos/deal-review.dtos";
import { validateRequest } from "../../../middleware/validate.middleware";
import { AuthenticatedRequest } from "../../../types/express/index";

const router = Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * Returns paginated reviews + rating summary for a deal. No auth required.
 */
router.get(
  "/deal/:dealId",
  optionalAuth,
  validateRequest({ params: dealIdParamsSchema, query: dealReviewQuerySchema }),
  async (req, res, next) => {
    try {
      const dealId = req.params.dealId as string;
      const query = req.query as unknown as DealReviewQueryDto;
      const result = await service.getDealReviews(dealId, query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Returns top-rated reviews for the homepage. No auth required.
 */
router.get(
  "/featured",
  async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const reviews = await service.getFeaturedReviews(limit);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }
);

// ─── AUTHENTICATED TRAVELLER ──────────────────────────────────────────────────

/**
 * Creates a review for a deal. Requires auth + traveller role.
 */
router.post(
  "/deal/:dealId",
  verifyToken,
  requireTraveller,
  validateRequest({ params: dealIdParamsSchema, body: createDealReviewSchema }),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;
      const dealId = authReq.params.dealId as string;
      const data = authReq.body as CreateDealReviewDto;
      
      const result = await service.createReview(userId, dealId, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Updates the authenticated user's own review.
 */
router.put(
  "/:reviewId",
  verifyToken,
  requireTraveller,
  validateRequest({ params: reviewIdParamsSchema, body: updateDealReviewSchema }),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;
      const reviewId = authReq.params.reviewId as string;
      const data = authReq.body as UpdateDealReviewDto;

      const result = await service.updateReview(userId, reviewId, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * Admin view: paginated reviews for a deal (all badge types).
 */
router.get(
  "/admin/deal/:dealId",
  verifyToken,
  requireAdmin,
  validateRequest({ params: dealIdParamsSchema, query: dealReviewQuerySchema }),
  async (req, res, next) => {
    try {
      const dealId = req.params.dealId as string;
      const query = req.query as unknown as DealReviewQueryDto;
      const result = await service.getAdminDealReviews(dealId, query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Bulk update badge types.
 */
router.patch(
  "/admin/bulk-badge",
  verifyToken,
  requireAdmin,
  validateRequest({ body: adminBulkUpdateBadgeSchema }),
  async (req, res, next) => {
    try {
      const data = req.body as AdminBulkUpdateBadgeDto;
      await service.adminBulkUpdateBadge(data);
      res.status(200).json({ success: true, message: "Bulk update successful" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Bulk delete reviews.
 */
router.delete(
  "/admin/bulk-delete",
  verifyToken,
  requireAdmin,
  validateRequest({ body: adminBulkDeleteSchema }),
  async (req, res, next) => {
    try {
      const data = req.body as AdminBulkDeleteDto;
      await service.adminBulkDelete(data);
      res.status(200).json({ success: true, message: "Bulk delete successful" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Permanently deletes a review. Admin only.
 */
router.delete(
  "/admin/:reviewId",
  verifyToken,
  requireAdmin,
  validateRequest({ params: reviewIdParamsSchema }),
  async (req, res, next) => {
    try {
      const reviewId = req.params.reviewId as string;
      await service.deleteReview(reviewId);
      res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Admin override: change badge type (normal ↔ verified).
 */
router.patch(
  "/admin/:reviewId/badge",
  verifyToken,
  requireAdmin,
  validateRequest({ params: reviewIdParamsSchema, body: adminUpdateReviewBadgeSchema }),
  async (req, res, next) => {
    try {
      const reviewId = req.params.reviewId as string;
      const data = req.body as AdminUpdateReviewBadgeDto;
      const result = await service.adminUpdateBadge(reviewId, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
