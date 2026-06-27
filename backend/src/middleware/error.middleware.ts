import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { BaseException } from "../exceptions/base.exception";

/**
 * Global Error Handling Middleware.
 * This should be the last middleware registered in the Express app.
 * It catches all errors passed to next() and formats them using the standardized response utility.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 1. Check if it's one of our custom exceptions
  if (err instanceof BaseException) {
    return sendError(res, err.name, err.message, err.statusCode);
  }

  // 2. Handle Prisma or other common errors if needed (optional)
  // Example: if (err.code === 'P2002') ...

  // 3. Otherwise, it's an unexpected crash or generic Error
  console.error("[GlobalErrorHandler] Caught unexpected error:", err);
  
  // In production, we don't want to leak internal error details
  const message = process.env.NODE_ENV === "production" 
    ? "An unexpected error occurred." 
    : err.message;

  return sendError(res, "InternalServerError", message, 500);
};
