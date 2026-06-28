# RTK Query Data Layer — Technical Design

## Architecture Overview

Single Redux store with RTK Query as the exclusive server-state layer. All HTTP communication flows through `fetchBaseQuery` wrapped in a `baseQueryWithReauth` interceptor for automatic token refresh. Per-module API slices extend the base definition via `injectEndpoints`.

## Component Diagram

```
src/store/
├── index.ts                     # configureStore(api.middleware, authReducer)
├── hooks.ts                     # useAppSelector, useAppDispatch
├── slices/
│   └── authSlice.ts             # Redux slice: user, tokens, isAuthenticated, loading
├── api/
│   ├── baseApi.ts               # createApi root + fetchBaseQuery + baseQueryWithReauth
│   └── slices/
│       ├── authApi.ts           # Tag: User
│       ├── jobsApi.ts           # Tag: Job
│       ├── applicationsApi.ts   # Tag: Application
│       ├── resumesApi.ts        # Tag: Resume
│       ├── coverLettersApi.ts   # Tag: CoverLetter
│       ├── tasksApi.ts          # Tag: Task
│       ├── notificationsApi.ts  # Tag: Notification
│       ├── dashboardApi.ts      # Tag: Dashboard
│       └── adminApi.ts          # Tag: (no specific, uses broad invalidation)
└── types/
    └── api.ts                   # Request/Response TypeScript interfaces
```

## Data Flow

```
React Component
  ↓ useGetJobsQuery({ page: 1, limit: 20 })
RTK Query Hook
  ↓ checks providesTags cache
Cache Hit ──→ Return cached data, skip fetch
Cache Miss ──→ fetchBaseQuery → /api/v1/jobs?page=1&limit=20
  ↓
Response → transformResponse normalizes → Cache → Component re-renders

Mutation (useCreateJobMutation)
  ↓ onQueryStarted → optimisticUpdate
Cache updated immediately (pessimistic → shows new item)
  ↓ await response
Success → invalidatesTags(['Job']) → List caches refresh
Failure → rollback (undo cache change) → Toast error
```

## State Flow Map

| State | Owner | Why |
|-------|-------|-----|
| Server entities (jobs, apps, etc.) | RTK Query cache | Automatic dedup, caching, invalidation, refetching |
| Auth tokens | `authSlice` (Redux) | Synchronous access in `prepareHeaders`, persisted to localStorage |
| User profile | `authSlice` | Loaded on mount via `getMe`, globally available |
| UI state (modals, active tab, filters) | Local `useState` / URL searchParams | Ephemeral, component-scoped |
| Form state | React Hook Form | Isolated, validation-driven |

## Error Flow

```
API Error (non-401)
  → baseQuery returns { error: { status, data } }
  → Component checks error.isError, error.data.message
  → Shows error toast / inline error

API Error (401 + refresh succeeds)
  → baseQueryWithReauth catches 401
  → Calls /auth/refresh-token with stored refreshToken
  → On success: retries original request with new token
  → On failure: dispatches logout(), redirects to /login

API Error (401 + refresh fails)
  → baseQueryWithReauth dispatches logout()
  → Clears auth state
  → Redirects to /login
```

## Security Review

| Concern | Mitigation |
|---------|------------|
| Token storage | localStorage for refreshToken (HTTP-only cookie not feasible in SPA; mitigated by short expiry + rotation) |
| Token exposure | Never logged. Never in URL params. Bearer header only. |
| XSS | React auto-escaping. No `dangerouslySetInnerHTML`. CSP headers from backend. |
| CSRF | SameSite cookies for backend session (if used). State-changing endpoints require Bearer token. |
| Rate limiting | Handled server-side. Frontend retries with backoff. |

## Tag Strategy

| Tag Type | Entity Scope | Invalidation Trigger |
|----------|-------------|---------------------|
| `User` | Current user profile | Login, register, update profile |
| `Job` | All job list + detail queries | Create, update, delete, import, favorite, status change jobs |
| `Application` | All application queries | Create, update, delete, status change applications |
| `Resume` | All resume queries | Upload, update, delete, set default, tailor |
| `CoverLetter` | All cover letter queries | Generate, update, delete |
| `Task` | All task queries | Create, update, complete, delete |
| `Notification` | All notification queries | Mark read, mark all read |
| `Dashboard` | Dashboard analytics | Periodic refresh, after application changes |
| `Admin` | Admin panel data | Admin actions |

Tags are applied at two granularities:
- `'Job'` — broad tag, invalidates all job caches
- `{ type: 'Job', id: job.id }` — specific tag, only invalidates a single job detail
