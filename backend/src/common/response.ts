export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorDetail[];
}

export function success<T>(data: T, message?: string, meta?: PaginationMeta): SuccessResponse<T> {
  const response: SuccessResponse<T> = { success: true, data };
  if (message) response.message = message;
  if (meta) response.meta = meta;
  return response;
}

export function error(message: string, errors?: ErrorDetail[]): ErrorResponse {
  const response: ErrorResponse = { success: false, message };
  if (errors) response.errors = errors;
  return response;
}
