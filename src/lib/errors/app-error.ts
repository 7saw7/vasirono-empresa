export type AppErrorDetails = Record<string, string[]> | undefined;

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: AppErrorDetails;

  constructor(
    code: string,
    message: string,
    status = 500,
    details?: AppErrorDetails
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}