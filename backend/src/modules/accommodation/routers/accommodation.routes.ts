import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../../../middleware/auth.middleware";
import { requireMerchant } from "../../../middleware/merchant.middleware";
import { requirePropertyOwner } from "../../../middleware/property-owner.middleware";
import * as service from "../services/accommodation.service";
import { validateRequest } from "../../../middleware/validate.middleware";
import {
  createAccommodationSchema,
  createUnitSchema,
  bulkInventoryUpdateSchema,
  inventoryDateRangeSchema,
  listBookingsQuerySchema,
  listLocksQuerySchema,
  listPropertiesQuerySchema,
  propertyImageListSchema,
  updatePropertySchema,
  propertyIdParamsSchema,
  propertyUnitParamsSchema,
  propertySlotParamsSchema,
  CreateAccommodationCompleteDto,
  CreateUnitDto,
  UpdatePropertyDto,
  BulkInventoryUpdateDto,
  InventoryDateRangeDto,
  ListLocksQueryDto,
  ListBookingsQueryDto,
  ListPropertiesQueryDto,
} from "../dtos/accommodation.dto";

const router = Router();

// All merchant accommodation routes require a valid auth token and merchant profile
router.use(verifyToken, requireMerchant);

/**
 * GET /properties/mine
 * Returns a summary list of all properties owned by the authenticated merchant.
 */
router.get(
  "/properties/mine", 
  validateRequest({ query: listPropertiesQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantProfileId = req.merchantProfileId!;
      const query = req.query as unknown as ListPropertiesQueryDto;
      const result = await service.listMyProperties(merchantProfileId, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /property/:id
 * Returns full details of a single accommodation property owned by the merchant.
 */
router.get(
  "/property/:id", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.id as string;
      const result = await service.getProperty(propertyId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /property
 * Creates a new accommodation property with all details in one request.
 */
router.post(
  "/property", 
  validateRequest({ body: createAccommodationSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantProfileId = req.merchantProfileId!;
      const data = req.body as CreateAccommodationCompleteDto;
      const result = await service.createPropertyComplete(merchantProfileId, data);
      res.status(201).json({ success: true, message: "Accommodation property created successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /property/:id
 * Updates an existing accommodation property.
 */
router.patch(
  "/property/:id", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, body: updatePropertySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.id as string;
      const data = req.body as UpdatePropertyDto;
      const result = await service.updateProperty(propertyId, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /property/:id/images
 * Updates the images for an accommodation property.
 */
router.patch(
  "/property/:id/images", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, body: propertyImageListSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.id as string;
      const { images } = req.body;
      const result = await service.updatePropertyImages(propertyId, images);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /property/:id/unit
 * Adds a single unit to an existing property.
 */
router.post(
  "/property/:id/unit", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, body: createUnitSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const data = req.body as CreateUnitDto;
      const result = await service.addUnitToProperty(property, data);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /property/:id/unit/:unitId
 * Updates an existing unit.
 */
router.patch(
  "/property/:id/unit/:unitId", 
  requirePropertyOwner,
  validateRequest({ params: propertyUnitParamsSchema, body: createUnitSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const unitId = req.params.unitId as string;
      const data = req.body as CreateUnitDto;
      const result = await service.updateUnitOfProperty(property, unitId, data);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /property/:id
 * Permanently deletes a property and all its associated data (cascade).
 */
router.delete(
  "/property/:id", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params.id as string;
      await service.deleteProperty(propertyId);
      res.json({ success: true, message: "Accommodation property deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /property/:id/unit/:unitId/inventory
 * Returns RoomInventory records with daily RoomVariant slots for a unit, within a date range.
 */
router.get(
  "/property/:id/unit/:unitId/inventory", 
  requirePropertyOwner,
  validateRequest({ params: propertyUnitParamsSchema, query: inventoryDateRangeSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unitId = req.params.unitId as string;
      const { startDate, endDate } = req.query as unknown as InventoryDateRangeDto;
      const result = await service.getRoomInventory(unitId, startDate, endDate);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /property/:id/inventory/bulk
 * Bulk-creates or updates RoomInventory + RoomVariant slots for a date range.
 */
router.post(
  "/property/:id/inventory/bulk", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, body: bulkInventoryUpdateSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const data = req.body as BulkInventoryUpdateDto;
      const result = await service.updateBulkInventory(property, data);
      res.json({ success: true, message: "Availability updated successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /property/:id/inventory/bulk/preview
 * Previews which dates would be created/updated without writing to the database.
 */
router.post(
  "/property/:id/inventory/bulk/preview", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, body: bulkInventoryUpdateSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const data = req.body as BulkInventoryUpdateDto;
      const result = await service.previewBulkInventory(property, data);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /property/:id/inventory/slot/:slotId/block
 * Manually blocks an available RoomVariant slot.
 */
router.put(
  "/property/:id/inventory/slot/:slotId/block", 
  requirePropertyOwner,
  validateRequest({ params: propertySlotParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const slotId = req.params.slotId as string;
      const result = await service.blockRoomSlot(property.id, slotId);
      res.json({ success: true, message: "Room blocked successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /property/:id/inventory/slot/:slotId/restore
 * Restores a manually blocked RoomVariant slot back to available status.
 */
router.put(
  "/property/:id/inventory/slot/:slotId/restore", 
  requirePropertyOwner,
  validateRequest({ params: propertySlotParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const slotId = req.params.slotId as string;
      const result = await service.restoreRoomSlot(property.id, slotId);
      res.json({ success: true, message: "Room restored successfully", data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /property/:id/locks
 * Returns paginated list of accommodation locks for a property.
 */
router.get(
  "/property/:id/locks", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, query: listLocksQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const query = req.query as unknown as ListLocksQueryDto;
      const result = await service.listPropertyLocks(property.id, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /property/:id/bookings
 * Returns paginated list of accommodation bookings for a property.
 */
router.get(
  "/property/:id/bookings", 
  requirePropertyOwner,
  validateRequest({ params: propertyIdParamsSchema, query: listBookingsQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = req.property!;
      const query = req.query as unknown as ListBookingsQueryDto;
      const result = await service.listPropertyBookings(property.id, query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
