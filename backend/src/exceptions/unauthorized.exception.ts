import { BaseException } from "./base.exception";

/**
 * Thrown when access is denied or the user is not authorized (403).
 * (Note: 401 is usually for unauthenticated, 403 for unauthorized/forbidden)
 */
export class UnauthorizedException extends BaseException {
  constructor(message: string = "You do not have permission to perform this action") {
    super("UnauthorizedException", message, 403);
  }
}
