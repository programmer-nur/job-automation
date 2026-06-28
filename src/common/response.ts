import type { ApiResponse, PaginationMeta, ValidationError } from "./types.js";

export function success<T>(
  data: T,
  message?: string,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    data,
    ...(meta && { meta }),
  };
}

export function error(
  message: string,
  errors?: ValidationError[],
): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    ...(errors && { errors }),
  };
}
