import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { requireTraveller } from "../../../middleware/traveller.middleware";
import * as service from "../services/accommodation-lock.service";
import {
  lockAccommodationSchema,
  createAccommodationBookingSchema,
  lockIdParamsSchema,
  bookingIdParamsSchema,
  LockAccommodationDto,
  CreateAccommodationBookingDto,
} from "../dtos/accommodation-lock.dtos";
import { validateRequest } from "../../../middleware/validate.middleware";
import { AuthenticatedRequest } from "../../../types/express/index";

const router = Router();

// All routes require authentication and traveller role
router.use(verifyToken, requireTraveller);

/**
 * POST /api/accommodation/lock
 * Creates a temporary lock for an accommodation room selection.
 */
router.post(
  "/lock", 
  validateRequest({ body: lockAccommodationSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const data = req.body as LockAccommodationDto;
      const result = await service.lockAccommodation(userId, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/accommodation/lock/:id
 * Retrieves details for a specific accommodation lock.
 */
router.get(
  "/lock/:id", 
  validateRequest({ params: lockIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const lockId = req.params.id as string;
      const result = await service.getAccommodationLockById(userId, lockId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);


/**
 * POST /api/accommodation/book
 * Converts an active accommodation lock into a confirmed booking.
 */
router.post(
  "/book", 
  requireTraveller, 
  validateRequest({ body: createAccommodationBookingSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const data = req.body as CreateAccommodationBookingDto;
      const result = await service.createAccommodationBooking(userId, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/accommodation/booking/:id
 * Retrieves details for a specific accommodation booking.
 */
router.get(
  "/booking/:id",
  validateRequest({ params: bookingIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const bookingId = req.params.id as string;
      const result = await service.getAccommodationBookingById(userId, bookingId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
