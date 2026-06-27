import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { NotFoundException } from "../exceptions/not-found.exception";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";

/**
 * Express middleware that checks if a requested travel deal
 * exists and is owned by the authenticated merchant.
 * Supports both :id and :dealId parameters.
 * Cache-caches the verified Deal model on req.deal.
 */
export const requireDealOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const merchantProfileId = req.merchantProfileId;
    if (!merchantProfileId) {
      throw new UnauthorizedException("Merchant profile not found. Please complete merchant registration.");
    }

    const dealId = (req.params.id || req.params.dealId) as string;
    if (!dealId) {
      throw new NotFoundException("Deal ID must be provided in request parameters.");
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with ID "${dealId}" was not found.`);
    }

    if (deal.merchantId !== merchantProfileId) {
      throw new UnauthorizedException("Access Denied: You do not have permission to manage this deal.");
    }

    req.deal = deal;
    next();
  } catch (error) {
    next(error);
  }
};
