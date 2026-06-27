import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { NotFoundException } from "../exceptions/not-found.exception";
import { UnauthorizedException } from "../exceptions/unauthorized.exception";

/**
 * Express middleware that checks if a requested property (Property)
 * exists and is owned by the authenticated merchant.
 * Supports both :id and :propertyId parameters.
 * Cache-caches the verified Property model (with units preloaded) on req.property.
 */
export const requirePropertyOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const merchantProfileId = req.merchantProfileId;
    if (!merchantProfileId) {
      throw new UnauthorizedException("Merchant profile not found. Please complete merchant registration.");
    }

    const propertyId = (req.params.id || req.params.propertyId) as string;
    if (!propertyId) {
      throw new NotFoundException("Property ID must be provided in request parameters.");
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { units: true }, // Preload the units relation!
    });

    if (!property) {
      throw new NotFoundException(`Accommodation property with ID "${propertyId}" was not found.`);
    }

    if (property.merchantId !== merchantProfileId) {
      throw new UnauthorizedException("Access Denied: You do not have permission to manage this accommodation property.");
    }

    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};
