import { Router, Request, Response, NextFunction } from "express";
import { verifyToken, optionalAuth } from "../../../middleware/auth.middleware";
import { requireTraveller } from "../../../middleware/traveller.middleware";
import { requireAdmin } from "../../../middleware/admin.middleware";
import * as service from "../services/accommodation-review.service";
import {
  createAccommodationReviewSchema,
  updateAccommodationReviewSchema,
  reviewQuerySchema,
  ReviewQueryDto,
  CreateAccommodationReviewDto,
  UpdateAccommodationReviewDto,
  propertyIdSchema,
  reviewIdSchema,
  adminUpdateReviewBadgeSchema,
  adminBulkUpdateBadgeSchema,
  adminBulkDeleteSchema,
  AdminUpdateReviewBadgeDto,
  AdminBulkUpdateBadgeDto,
  AdminBulkDeleteDto
} from "../dtos/accommodation-review.dtos";
import { validateRequest } from "../../../middleware/validate.middleware";
import { AuthenticatedRequest } from "../../../types/express/index";

const router = Router();

/**
 * GET /accommodation-reviews/property/:propertyId
 * Returns paginated reviews for a property.
 */
router.get(
  "/property/:propertyId",
  optionalAuth,
  validateRequest({ params: propertyIdSchema, query: reviewQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.propertyId as string;
      const query = req.query as unknown as ReviewQueryDto; 
      const result = await service.getPropertyReviews(propertyId, query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /accommodation-reviews/property/:propertyId
 * Creates a review.
 */
router.post(
  "/property/:propertyId",
  verifyToken,
  requireTraveller,
  validateRequest({ params: propertyIdSchema, body: createAccommodationReviewSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.propertyId as string;
      const userId = (req as AuthenticatedRequest).userId;
      const dto = req.body as CreateAccommodationReviewDto;
      const result = await service.createReview(userId, propertyId, dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /accommodation-reviews/:reviewId
 * Updates own review.
 */
router.put(
  "/:reviewId",
  verifyToken,
  requireTraveller,
  validateRequest({ params: reviewIdSchema, body: updateAccommodationReviewSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = req.params.reviewId as string;
      const userId = (req as AuthenticatedRequest).userId;
      const dto = req.body as UpdateAccommodationReviewDto;
      const result = await service.updateReview(userId, reviewId, dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /accommodation-reviews/:reviewId
 */
router.delete(
  "/:reviewId",
  verifyToken,
  requireTraveller,
  validateRequest({ params: reviewIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = req.params.reviewId as string;
      const userId = (req as AuthenticatedRequest).userId;
      await service.deleteReview(userId, reviewId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ─── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * Admin view: paginated reviews for a property (all badge types).
 */
router.get(
  "/admin/property/:propertyId",
  verifyToken,
  requireAdmin,
  validateRequest({ params: propertyIdSchema, query: reviewQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.propertyId as string;
      const query = req.query as unknown as ReviewQueryDto;
      const result = await service.getAdminPropertyReviews(propertyId, query);
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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
  validateRequest({ params: reviewIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = req.params.reviewId as string;
      await service.adminDeleteReview(reviewId);
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
  validateRequest({ params: reviewIdSchema, body: adminUpdateReviewBadgeSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
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
