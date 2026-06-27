import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendError } from "../utils/response";

interface RequestSchemas {
  params?: z.ZodType<any>;
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
}

/**
 * Creates an Express middleware that validates request params, body, and query using Zod schemas.
 * If validation fails, responds with a 400 error and validation message.
 */
export const validateRequest = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.defineProperty(req, "query", {
          value: parsed,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || "Validation error";
        return sendError(res, "ValidationFailed", errorMessage, 400);
      }
      next(error);
    }
  };
};
