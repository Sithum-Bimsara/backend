import { Router, Request, Response, NextFunction } from "express";
import * as service from "./user-profile.service";
import { verifyToken } from "../../middleware/auth.middleware";
import { 
  updateUserProfileSchema, 
  verifyPhoneSchema,
  userLocksQuerySchema,
  UserLocksQueryDto
} from "./user-profile.dto";
import { validateRequest } from "../../middleware/validate.middleware";
import { AuthenticatedRequest } from "../../types/express/index";
import { attachResidency } from "../../middleware/traveller.middleware";

const router = Router();

// All user-profile routes require authentication
router.use(verifyToken);

/**
 * GET /api/user-profile
 * Fetches the authenticated user's profile.
 */
router.get(
  "/", 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const profile = await service.getUserProfile(authReq.userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/user-profile
 * Updates the authenticated user's profile information.
 */
router.patch(
  "/", 
  validateRequest({ body: updateUserProfileSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = updateUserProfileSchema.parse(req.body);
      const profile = await service.updateUserProfile(authReq.userId, data);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/user-profile/verify-phone
 * Verifies and updates the authenticated user's phone number.
 */
router.patch(
  "/verify-phone", 
  validateRequest({ body: verifyPhoneSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { phone } = verifyPhoneSchema.parse(req.body);
      const profile = await service.verifyPhone(authReq.userId, phone);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/user-profile/my-locks/deals
 * Retrieves paginated deal locks for the authenticated user.
 */
router.get(
  "/my-locks/deals",
  validateRequest({ query: userLocksQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const query = req.query as unknown as UserLocksQueryDto;
      const result = await service.getUserDealLocks(authReq.userId, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/user-profile/my-locks/accommodations
 * Retrieves paginated accommodation locks for the authenticated user.
 */
router.get(
  "/my-locks/accommodations",
  validateRequest({ query: userLocksQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const query = req.query as unknown as UserLocksQueryDto;
      const result = await service.getUserAccommodationLocks(authReq.userId, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/user-profile/my-locks/accommodation/:lockId/details
 * Retrieves detailed information about an active accommodation lock combined with public property details.
 */
router.get(
  "/my-locks/accommodation/:lockId/details",
  attachResidency,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const isLocal = authReq.isLocal ?? false;
      const result = await service.getAccommodationLockDetailWithProperty(
        authReq.userId,
        req.params.lockId as string,
        isLocal
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
