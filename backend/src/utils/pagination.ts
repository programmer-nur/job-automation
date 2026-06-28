import type { PaginationMeta } from '@/common/response';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPaginationParams(page?: number, limit?: number): { skip: number; take: number } {
  const p = Math.max(1, page ?? DEFAULT_PAGE);
  const l = limit && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;

  return {
    skip: (p - 1) * l,
    take: l,
  };
}

export function getPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return {
    page: Math.max(1, page),
    limit,
    total,
    totalPages,
  };
}
