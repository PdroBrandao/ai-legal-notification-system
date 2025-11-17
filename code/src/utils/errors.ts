/**
 * Custom Application Error Class
 * 
 * Extends the standard Error with application-specific metadata:
 * - Error code for categorization
 * - HTTP status code for API responses
 * 
 * Used throughout the application for structured error handling.
 */
export class AppError extends Error {
    constructor(
      message: string,
      public code: string = 'APP_ERROR',
      public status: number = 400
    ) {
      super(message);
      this.name = 'AppError';
    }
  }