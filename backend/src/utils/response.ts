import { Response } from "express";

interface ApiErrorResponse {
  message: string;
  error?: string;
}

/**
 * Sends a standardized error response.
 * @param res Express Response object
 * @param message Error message to display to the client
 * @param error Internal error details or code
 * @param statusCode HTTP status code (default: 400)
 */
export const sendError = (
  res: Response,
  message: string,
  error?: string,
  statusCode = 400
) => {
  const response: ApiErrorResponse = {
    message,
    error,
  };
  res.status(statusCode).json(response);
};
