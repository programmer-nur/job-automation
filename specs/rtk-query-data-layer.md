# RTK Query Data Layer Specification

## Feature Summary

Production-grade RTK Query data layer that serves as the single source of truth for all server state in the AI Job Application Management Platform frontend. Encapsulates all API communication, caching, optimistic updates, and cache invalidation behind typed hooks consumed by feature modules.

## Functional Requirements

1. Define a base `createApi` with `fetchBaseQuery` for all HTTP communication
2. Create per-module API slices via `injectEndpoints`: Auth, Jobs, Applications, Resumes, Cover Letters, AI, Tasks, Notifications, Dashboard, Admin, Health
3. Implement typed tag-based cache invalidation for all domain entities: `User`, `Job`, `Application`, `Resume`, `CoverLetter`, `Task`, `Notification`, `Dashboard`
4. Implement optimistic updates for all create/update/delete mutations
5. Provide typed React hooks for all endpoints
6. Set up Redux store with API middleware and auth reducer
7. Implement auth token management (auto-attach Bearer token, refresh on 401)

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Minimal over-fetching via selective `providesTags` / `invalidatesTags` |
| Performance | No redundant queries across nested components via `skip` / conditional queries |
| Reliability | Optimistic updates with rollback on failure for all mutations |
| Maintainability | One module per API slice, strict separation of concerns |
| Scalability | Normalized cache where appropriate, no duplicated state |
| Security | Tokens never stored in localStorage, auto-refresh on 401 |
| Developer Experience | Fully typed hooks with zero manual type assertions needed |

## Acceptance Criteria

- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes with zero errors and zero warnings
- [ ] Every backend API endpoint has a corresponding RTK Query endpoint
- [ ] All mutations have optimistic updates with rollback
- [ ] Tags are properly defined and invalidated on mutations
- [ ] Auth slice manages tokens, auto-attaches Bearer header, handles refresh
- [ ] Store is configured with API middleware and reducers

## Risks

| Risk | Mitigation |
|------|------------|
| Over-fetching due to broad tag invalidation | Use selective tag IDs, not just generic tag types |
| Stale cache after mutations | Define explicit `invalidatesTags` per mutation |
| Auth token race conditions | Queue requests during token refresh |

## Edge Cases

- Expired token during concurrent API calls
- Optimistic update rollback on network failure
- Paginated list caches becoming stale after create/update/delete
- Empty states (no data returned)
- API errors with field-level validation messages

## Dependencies

- `@reduxjs/toolkit` (installed)
- `react-redux` (installed)
- Backend API at `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api/v1`)
