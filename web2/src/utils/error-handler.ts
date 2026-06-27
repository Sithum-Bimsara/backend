import type { IErrorHandlerOptions } from "../types/api.types";
import { toast } from "react-hot-toast";

export class ErrorHandler {
  public static getErrorMessage(
    error: unknown,
    fallback: string = "An unexpected error occurred"
  ): string {
    if (error && typeof error === "object") {
      // Handle standard Zod errors passed directly or nested inside objects
      if ("issues" in error && Array.isArray((error as { issues: unknown }).issues)) {
        const issues = (error as { issues: Array<{ message: string }> }).issues;
        if (issues[0]?.message) {
          return issues[0].message;
        }
      }
      
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return fallback;
  }

  public static handle(
    error: unknown,
    options: IErrorHandlerOptions = {}
  ): void {
    const { showToast = true, fallbackMessage } = options;
    const message = fallbackMessage || this.getErrorMessage(error);
    console.error("Intercepted API Error:", error);
    
    if (showToast) {
      toast.error(message);
    }
  }
}
