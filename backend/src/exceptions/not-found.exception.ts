import { BaseException } from "./base.exception";

/**
 * Thrown when a requested resource is not found (404).
 */
export class NotFoundException extends BaseException {
  constructor(message: string) {
    super("NotFoundException", message, 404);
  }
}
