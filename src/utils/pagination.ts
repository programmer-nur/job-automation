import type { PaginationMeta } from "@/common/types.js";

export function getPaginationParams(page?: number, limit?: number) {
  const p = Math.max(1, page ?? 1);
  const l = Math.min(Math.max(1, limit ?? 20), 100);
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
}

export function getPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
