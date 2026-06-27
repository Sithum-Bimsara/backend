import { Router, Request, Response, NextFunction } from "express";
import * as service from "./user-preferences.service";
import { verifyToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { userPreferenceSchema } from "./user-preferences.dtos";
import { AuthenticatedRequest } from "../../types/express/index";

const router = Router();

// All user-preferences routes require authentication
router.use(verifyToken);

router.post("/", validateRequest({ body: userPreferenceSchema }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const preferences = await service.createPreferencesService(authReq.userId, authReq.body);
    res.status(201).json({ success: true, message: "Preferences saved successfully", data: preferences });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const preferences = await service.getPreferencesService(authReq.userId);
    res.status(200).json({ success: true, data: preferences });
  } catch (error) {
    next(error);
  }
});

router.put("/", validateRequest({ body: userPreferenceSchema }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const preferences = await service.updatePreferencesService(authReq.userId, authReq.body);
    res.status(200).json({ success: true, message: "Preferences updated successfully", data: preferences });
  } catch (error) {
    next(error);
  }
});

export default router;
