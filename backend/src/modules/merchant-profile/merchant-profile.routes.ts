import { Router, Request, Response, NextFunction } from "express";
import * as service from "./merchant-profile.service";
import { verifyToken } from "../../middleware/auth.middleware";
import { 
  createMerchantProfileSchema, 
  updateMerchantProfileSchema
} from "./merchant-profile.dtos";
import { validateRequest } from "../../middleware/validate.middleware";
import { AuthenticatedRequest } from "../../types/express/index";

const router = Router();

// All merchant-profile routes require authentication
router.use(verifyToken);

/**
 * GET /api/merchant-profile
 * Fetches the authenticated user's merchant profile.
 */
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const profile = await service.getMerchantProfile(authReq.userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/merchant-profile
 * Creates a new merchant profile for the authenticated user.
 */
router.post(
  "/",
  validateRequest({ body: createMerchantProfileSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = createMerchantProfileSchema.parse(req.body);
      const profile = await service.createMerchantProfile(authReq.userId, data);
      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/merchant-profile
 * Updates the authenticated user's merchant profile.
 */
router.patch(
  "/",
  validateRequest({ body: updateMerchantProfileSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = updateMerchantProfileSchema.parse(req.body);
      const profile = await service.updateMerchantProfile(authReq.userId, data);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Returns overall merchant analytics for the deal dashboard.
 */
router.get("/analytics", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const merchantId = authReq.merchantProfileId!;
    const analytics = await service.getMerchantOverallAnalytics(merchantId);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;
