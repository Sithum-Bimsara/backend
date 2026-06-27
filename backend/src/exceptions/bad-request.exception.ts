import { BaseException } from "./base.exception";

/**
 * Thrown when the request is invalid or cannot be processed (400).
 */
export class BadRequestException extends BaseException {
  constructor(message: string) {
    super("BadRequestException", message, 400);
  }
}
