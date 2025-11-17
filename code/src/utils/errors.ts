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