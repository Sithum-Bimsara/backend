import { Router, Request, Response, NextFunction } from "express";
import * as service from "../services/island.service";
import { verifyToken } from "../../../middleware/auth.middleware";
import { requireAdmin } from "../../../middleware/admin.middleware";
import { validateRequest } from "../../../middleware/validate.middleware";
import {
  createIslandSchema,
  updateIslandSchema,
  islandQuerySchema,
  suitableQuerySchema,
  compareQuerySchema,
  islandIdSchema,
} from "../dtos/island.dto";

const router = Router();

// ─── Public Routes ───

// 1. Get paginated islands list (with optional query parameters)
router.get(
  "/",
  validateRequest({ query: islandQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = islandQuerySchema.parse(req.query);
      const result = await service.getIslandsWithPagination(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 2. Get suitable matching islands based on selected categories and activities
router.get(
  "/suitable",
  validateRequest({ query: suitableQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = suitableQuerySchema.parse(req.query);
      const result = await service.getSuitableIslands(
        query.categories,
        query.activities
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 3. Get islands by array of IDs for direct comparison
router.get(
  "/compare",
  validateRequest({ query: compareQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = compareQuerySchema.parse(req.query);
      const result = await service.getIslandsByIds(query.ids);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// 4. Get a single island full details
router.get(
  "/:id",
  validateRequest({ params: islandIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = islandIdSchema.parse(req.params);
      const island = await service.getIslandById(id);
      res.status(200).json(island);
    } catch (error) {
      next(error);
    }
  }
);

// ─── Admin Protected Routes ───

// All write endpoints require active Admin role
router.post(
  "/",
  verifyToken,
  requireAdmin,
  validateRequest({ body: createIslandSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createIslandSchema.parse(req.body);
      const newIsland = await service.createIsland(body);
      res.status(201).json({
        success: true,
        message: "Island created successfully",
        data: newIsland,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  validateRequest({ params: islandIdSchema, body: updateIslandSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = islandIdSchema.parse(req.params);
      const body = updateIslandSchema.parse(req.body);
      const updatedIsland = await service.updateIsland(id, body);
      res.status(200).json({
        success: true,
        message: "Island updated successfully",
        data: updatedIsland,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateRequest({ params: islandIdSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = islandIdSchema.parse(req.params);
      await service.deleteIsland(id);
      res.status(200).json({
        success: true,
        message: "Island deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
