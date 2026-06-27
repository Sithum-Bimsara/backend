import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/admin.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import * as service from "./admin.service";
import {
  adminMerchantQuerySchema,
  adminUserQuerySchema,
  merchantIdParamsSchema,
  userIdParamsSchema,
  dealIdParamsSchema,
  adminDealQuerySchema,
  updateDealAdminSchema,
  variantIdParamsSchema,
  updateVariantPriceSchema,
  dateRangeSchema,
  AdminMerchantQueryDto,
  AdminUserQueryDto,
  AdminDealQueryDto,
  UpdateDealAdminDto,
  UpdateVariantPriceDto,
  adminCommunityQuerySchema,
  AdminCommunityQueryDto,
} from "./admin.dtos";
import { 
  dealRequestIdParamsSchema, 
  updateDealRequestStatusSchema,
  dealRequestQuerySchema,
  DealRequestQueryDto,
  UpdateDealRequestStatusDto
} from "../deal-requests/deal-requests.dto";

const router = Router();

// Middleware applied to all admin routes: Requires authentication and administrative privileges
router.use(verifyToken, requireAdmin);

/**
 * GET /dashboard
 * Retrieves aggregate platform statistics for the dashboard.
 * Includes user, merchant, deal, booking, and lock counts, plus revenue time-series data.
 */
router.get(
  "/dashboard",
  validateRequest({ query: dateRangeSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const data = await service.getDashboard({ startDate, endDate });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /merchants
 * Lists all registered merchants with pagination and search.
 * Filterable by verification status and searchable by business name, owner, or email.
 */
router.get(
  "/merchants",
  validateRequest({ query: adminMerchantQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminMerchantQueryDto;
      const result = await service.listMerchants(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /merchants/:id/details
 * Retrieves full details for a specific merchant profile.
 * Includes associated deals and performance analytics within an optional date range.
 */
router.get(
  "/merchants/:id/details",
  validateRequest({ params: merchantIdParamsSchema, query: dateRangeSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const data = await service.getMerchantDetails(id, { startDate, endDate });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /merchants/:id/verify
 * Marks a merchant profile as "verified".
 * Allows the merchant to list deals on the public platform.
 */
router.patch(
  "/merchants/:id/verify",
  validateRequest({ params: merchantIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const merchant = await service.verifyMerchant(id);
      res.json({ success: true, data: merchant });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /merchants/:id/unverify
 * Reverts a merchant profile to "pending" status.
 * Effectively hides the merchant's deals from the public view.
 */
router.patch(
  "/merchants/:id/unverify",
  validateRequest({ params: merchantIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const merchant = await service.unverifyMerchant(id);
      res.json({ success: true, data: merchant });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /merchants/:id/deals
 * Lists all deals for a specific merchant.
 * Provides granular visibility into pricing, status, and activity counts.
 */
router.get(
  "/merchants/:id/deals",
  validateRequest({ params: merchantIdParamsSchema, query: adminDealQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const query = req.query as unknown as AdminDealQueryDto;
      const result = await service.listAllDeals({ ...query, merchantId: id });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /deals/:dealId
 * Retrieves comprehensive details for a specific deal.
 * Includes variants, itineraries, inclusions, exclusions, and active lock/booking counts.
 */
router.get(
  "/deals/:dealId",
  validateRequest({ params: dealIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dealId = req.params.dealId as string;
      const data = await service.getDealDetail(dealId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /deals/:dealId
 * Updates core administrative fields of a deal (price, status, original price).
 * Propagates price changes to eligible variants via a database transaction.
 */
router.patch(
  "/deals/:dealId",
  validateRequest({ params: dealIdParamsSchema, body: updateDealAdminSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dealId = req.params.dealId as string;
      const body = req.body as UpdateDealAdminDto;
      const data = await service.updateDealAdmin(dealId, body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /variants/:variantId/price
 * Updates the price of a specific deal variant.
 * Restricted: Cannot update if the variant is in the past, has active locks, or confirmed bookings.
 */
router.patch(
  "/variants/:variantId/price",
  validateRequest({ params: variantIdParamsSchema, body: updateVariantPriceSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variantId = req.params.variantId as string;
      const body = req.body as UpdateVariantPriceDto;
      const data = await service.updateVariantPrice(variantId, body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /users
 * Lists all platform users with traveller role.
 * Includes search functionality and links to merchant profiles where applicable.
 */
router.get(
  "/users",
  validateRequest({ query: adminUserQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminUserQueryDto;
      const result = await service.listUsers(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /users/:id/details
 * Retrieves activity stats for a specific user.
 * Returns counts for bookings, locks, and community contributions.
 */
router.get(
  "/users/:id/details",
  validateRequest({ params: userIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = await service.getUserDetails(id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /users/:id/suspend
 * Suspends a user account, preventing login and platform interactions.
 */
router.patch(
  "/users/:id/suspend",
  validateRequest({ params: userIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const user = await service.suspendUser(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /users/:id/activate
 * Activates a previously suspended user account.
 */
router.patch(
  "/users/:id/activate",
  validateRequest({ params: userIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const user = await service.activateUser(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /deal-requests
 * Fetches all public deal requests (custom trip inquiries) (Admin only).
 */
router.get(
  "/deal-requests",
  validateRequest({ query: dealRequestQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as DealRequestQueryDto;
      const result = await service.getDealRequests(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /deal-requests/:id
 * Fetches a single deal request (Admin only).
 */
router.get(
  "/deal-requests/:id",
  validateRequest({ params: dealRequestIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await service.getDealRequestById(id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /deal-requests/:id/status
 * Updates the status of a deal request (Admin only).
 */
router.patch(
  "/deal-requests/:id/status",
  validateRequest({ params: dealRequestIdParamsSchema, body: updateDealRequestStatusSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = req.body as UpdateDealRequestStatusDto;
      const result = await service.updateDealRequestStatus(id, data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /community/posts/:id
 * Moderation: Permanently deletes a community post and its associated media from storage.
 */
router.delete(
  "/community/posts/:id",
  validateRequest({ params: userIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await service.deleteCommunityPost(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /community/comments/:id
 * Moderation: Permanently deletes a community comment and its nested tree.
 */
router.delete(
  "/community/comments/:id",
  validateRequest({ params: userIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await service.deleteCommunityComment(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /moderation/posts
 * Moderation: Lists posts with report and pagination support.
 */
router.get(
  "/moderation/posts",
  validateRequest({ query: adminCommunityQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminCommunityQueryDto;
      const result = await service.getModerationPosts(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /moderation/reported-posts
 * Moderation: Lists only reported posts.
 */
router.get(
  "/moderation/reported-posts",
  validateRequest({ query: adminCommunityQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminCommunityQueryDto;
      const result = await service.getModerationReportedPosts(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /moderation/reported-comments
 * Moderation: Lists only reported comments.
 */
router.get(
  "/moderation/reported-comments",
  validateRequest({ query: adminCommunityQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminCommunityQueryDto;
      const result = await service.getModerationReportedComments(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /moderation/posts/:id/comments
 * Moderation: Lists comments for a specific post.
 */
router.get(
  "/moderation/posts/:id/comments",
  validateRequest({ params: userIdParamsSchema, query: adminCommunityQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const query = req.query as unknown as AdminCommunityQueryDto;
      const result = await service.getModerationCommentsForPost(id, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
