/**
 * Abstract base class for all custom exceptions.
 * Carries the HTTP status code and a descriptive name.
 */
export abstract class BaseException extends Error {
  public statusCode: number;

  constructor(name: string, message: string, statusCode: number) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    // Set the prototype explicitly for instanceof checks to work across different JS environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
