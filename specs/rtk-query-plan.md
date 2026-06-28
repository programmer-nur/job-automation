# RTK Query Data Layer — Implementation Plan

## Technical Approach

Single `createApi` base definition with `fetchBaseQuery` configured for:
- Base URL from `NEXT_PUBLIC_API_URL`
- Automatic Bearer token injection via `prepareHeaders`
- `baseQueryWithReauth` wrapper for automatic token refresh on 401

Each domain entity gets its own file under `src/store/api/` using `injectEndpoints`.

Tag types: `User`, `Job`, `Application`, `Resume`, `CoverLetter`, `Task`, `Notification`, `Dashboard`

## File Structure

```
src/store/
├── index.ts              # configureStore with api middleware + auth reducer
├── hooks.ts              # useAppSelector, useAppDispatch typed hooks
├── slices/
│   └── authSlice.ts      # auth state (user, tokens, loading)
├── api/
│   ├── baseApi.ts        # createApi with fetchBaseQuery + reauth wrapper
│   └── slices/
│       ├── authApi.ts          # login, register, refresh, logout, getMe
│       ├── jobsApi.ts          # CRUD + import + favorite + status + score + parse
│       ├── applicationsApi.ts  # CRUD + status + follow-up + notes
│       ├── resumesApi.ts       # CRUD + default + tailor
│       ├── coverLettersApi.ts  # generate + CRUD
│       ├── tasksApi.ts         # CRUD + complete
│       ├── notificationsApi.ts # list + markRead + markAllRead
│       ├── dashboardApi.ts     # summary + monthly + scores + sources
│       └── adminApi.ts         # users + jobs + ai + audit
└── types/
    └── api.ts            # Frontend API types mirroring backend types
```

## Data Flow

```
Component
  ↓ (calls generated hook, e.g. useGetJobsQuery)
RTK Query Hook
  ↓ (checks cache via providesTags)
Cache Hit  → Return cached data (no fetch)
Cache Miss → fetchBaseQuery → Backend API
  ↓
Response → Normalized → Cache → Component re-renders

Mutation (useCreateJobMutation)
  ↓ (optimisticUpdate via onQueryStarted)
Cache update immediately
  ↓ (await server response)
Success → invalidateTags → Refresh affected caches
Failure → rollback cache to pre-mutation state
```

## State Management

| State | Location | Why |
|-------|----------|-----|
| Server data | RTK Query cache | Automatic dedup, caching, invalidation |
| Auth tokens | `authSlice` (Redux) | Need synchronous access for `prepareHeaders` |
| User profile | `authSlice` | Loaded on app mount, used globally |
| UI state (modals, filters) | Local `useState` or URL params | Ephemeral, component-scoped |

## Testing Strategy

- Unit tests for auth token refresh logic
- Integration tests for API slices (mock fetch with MSW)
- Test optimistic update + rollback scenarios

## Migration Strategy

No migration needed — this is the initial data layer implementation. Existing store will be replaced.

## Rollback Strategy

If issues arise: revert the store directory to the previous version (empty store with no API slices).
