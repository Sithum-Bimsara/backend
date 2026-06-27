import { Router, Response, NextFunction } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { requireTraveller } from "../../../middleware/traveller.middleware";
import * as service from "../services/deal-lock.service";
import { lockDealSchema, createBookingSchema, paginationSchema, PaginationDto } from "../dtos/deal-lock.dtos";
import { getUserDealLocks, getUserAccommodationLocks } from "../../user-profile/user-profile.service";
import { NotFoundException } from "../../../exceptions/not-found.exception";
import { UnauthorizedException } from "../../../exceptions/unauthorized.exception";
import { validateRequest } from "../../../middleware/validate.middleware";
import { AuthenticatedRequest } from "../../../types/express/index";

const router = Router();

// All routes here require authentication
router.use(verifyToken);

/**
 * Places a temporary lock on a deal variant to reserve slots.
 */
router.post("/lock", requireTraveller, validateRequest({ body: lockDealSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const lock = await service.lockDeal(userId, authReq.body);
    res.status(200).json(lock);
  } catch (error) {
    next(error);
  }
});

/**
 * Retrieves details for a specific deal lock.
 */
router.get("/lock/:id", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const lock = await service.getLockById(authReq.params.id as string);
    if (!lock) throw new NotFoundException("Lock not found");
    if (lock.userId !== userId) throw new UnauthorizedException("You do not have access to this lock");
    res.status(200).json(lock);
  } catch (error) {
    next(error);
  }
});

/**
 * Deprecated: Retrieves all active/upcoming locks for the authenticated user (unified deal + accommodation).
 * Left for mobile backward compatibility. For web, use /api/user-profile/my-locks/deals and /api/user-profile/my-locks/accommodations.
 */
router.get("/user/my-locks", validateRequest({ query: paginationSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { page, limit } = req.query as unknown as PaginationDto;

    const skip = (page - 1) * limit;
    const take = limit;

    const [dealsRes, accsRes] = await Promise.all([
      getUserDealLocks(userId, { page: 1, limit: skip + take }),
      getUserAccommodationLocks(userId, { page: 1, limit: skip + take }),
    ]);

    const unifiedLocks = [
      ...dealsRes.data,
      ...accsRes.data,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      data: unifiedLocks.slice(skip, skip + take),
      total: dealsRes.total + accsRes.total,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Converts an active deal lock into a confirmed booking.
 */
router.post("/book", requireTraveller, validateRequest({ body: createBookingSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const booking = await service.createBooking(userId, authReq.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

/**
 * Retrieves the booking history for the authenticated traveller.
 */
router.get("/user/my-bookings", validateRequest({ query: paginationSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const result = await service.getMyBookings(userId, authReq.query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
