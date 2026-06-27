import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import { 
  createDealRequestSchema, 
  CreateDealRequestDto,
} from "./deal-requests.dto";
import * as service from "./deal-requests.service";
import { AuthenticatedRequest } from "../../types/express/index";

const router = Router();


/**
 * POST /api/deal-requests
 * Submits a new deal request.
 */
router.post(
  "/", 
  verifyToken, 
  validateRequest({ body: createDealRequestSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = authReq.body as CreateDealRequestDto;
      const result = await service.submitDealRequest(authReq.userId, data);
      
      return res.status(201).json({ 
        success: true, 
        message: "Deal request submitted successfully",
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }
);


export default router;
