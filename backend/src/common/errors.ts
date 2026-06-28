export interface ErrorDetail {
  field: string;
  message: string;
}

export interface AppErrorJSON {
  statusCode: number;
  code: string;
  message: string;
  details?: ErrorDetail[];
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static notFound(resource: string): AppError {
    return new AppError(404, 'NOT_FOUND', `${resource} not found`);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, 'BAD_REQUEST', message);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Access denied'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, 'CONFLICT', message);
  }

  static validation(details: ErrorDetail[]): AppError {
    return new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  toJSON(): AppErrorJSON {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
