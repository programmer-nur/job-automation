# AGENTS.md — AI Job Application Management Platform

## 1. Purpose

### Repository Purpose

AI-powered platform that helps job seekers discover, evaluate, organize, and manage job applications. AI automates repetitive work (collection, analysis, drafting, tracking) while humans retain full control over all final decisions.

### Product Vision

> Build an intelligent career assistant that combines AI, automation, and productivity tools to help professionals apply to better jobs with less effort while maintaining full human approval over every important decision.

See `docs/PRODUCT_VISION.md` for the complete vision, product principles, and roadmap.

### Goals

- Centralize all job applications in one place
- Automate repetitive job-search tasks via AI
- Improve application quality (tailored resumes, cover letters)
- Track every application lifecycle end-to-end
- Never miss a follow-up deadline
- Generate actionable insights from application history

---

## 2. AI Agent Responsibilities

Every AI agent operating in this repository must:

- **Plan before coding.** No implementation without a plan. Use the workflow in §5.
- **Think systematically.** Break problems down. State assumptions. Verify each step.
- **Follow repository standards.** Every rule in this file and every document referenced is mandatory.
- **Avoid assumptions.** Search existing code and docs before acting. Never invent APIs, tables, or abstractions.
- **Maintain consistency.** Match the style, patterns, and conventions of surrounding code.
- **Preserve architecture.** Never bypass layers (see §7). Never mix concerns.
- **Minimize technical debt.** Prefer simple, correct solutions. Refactor as you go. Leave code cleaner than you found it.
- **Explain architectural decisions.** When choosing between approaches, document the tradeoffs.

---

## 3. Repository Overview

```
/
├── .opencode/           # Agent skills and configuration
│   ├── skills/          # 25 installed agent skills (see skills-lock.json)
│   └── .gitignore
├── docs/                # Project documentation (the canonical source of truth)
│   ├── PRODUCT_VISION.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── API_SPECIFICATION.md
│   ├── TECH_STACK.md
│   └── AI_ARCHITECTURE.md   # Placeholder — to be populated
├── specs/               # Feature specifications (TBD)
│   └── feature/example.md   # Placeholder — to be populated
├── skills-lock.json     # Lock file for installed agent skills
├── AGENTS.md            # ← You are here. The single operational manual.
├── src/                 # Application source code (to be created)
│   ├── app.ts / server.ts
│   ├── config/
│   ├── core/
│   ├── common/
│   ├── middleware/
│   ├── modules/         # Feature modules (jobs, applications, resume, etc.)
│   ├── services/
│   ├── queues/
│   ├── integrations/
│   ├── shared/
│   └── utils/
├── frontend/            # Next.js frontend application (to be created)
├── prisma/              # Prisma schema and migrations (to be created)
└── tests/               # Test suites (to be created)
```

### Tech Stack (fast facts)

| Layer        | Technology                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Frontend     | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Redux Toolkit, React Hook Form, Zod            |
| Backend      | Node.js, Express.js, TypeScript, Pino (logging), BullMQ (queue)                                                        |
| Database     | PostgreSQL, Prisma ORM, Redis (cache/queue)                                                                            |
| Auth         | JWT + refresh tokens, bcrypt                                                                                           |
| AI           | Provider-agnostic (OpenAI, Anthropic, Gemini), prompt engineering                                                      |
| Integrations | Google Sheets API, Trello API, Gmail API, Google Drive API                                                             |
| Dev Tools    | pnpm, ESLint, Prettier, Husky, Commitlint (Conventional Commits), Vitest, Supertest, React Testing Library, Playwright |

See `docs/TECH_STACK.md` for full rationale.

---

## 4. Project Architecture

### Architecture Style

**Modular Monolith** with clear domain boundaries. Designed for future microservice extraction without major refactoring.

### Layers & Dependency Direction

```
Routes (HTTP)
    ↓
Controllers (request parsing, response formatting)
    ↓
Services (business logic — no HTTP knowledge)
    ↓
Repositories (database access via Prisma)
    ↓
Database (PostgreSQL — single source of truth)
```

Dependencies **only move downward**. Upper layers never bypass lower layers. Services never import Express. Repositories only contain Prisma queries.

### Data Flow

```
PostgreSQL
    ↓
Google Sheets ← sync via BullMQ
    ↓
Trello ← sync via BullMQ
    ↓
Dashboard & Analytics
```

### Request Lifecycle

```
HTTP Request → Middleware → Validation (Zod) → Controller → Service → Repository → Prisma → PostgreSQL → Response
```

See `docs/SYSTEM_ARCHITECTURE.md` for full architecture details including queue architecture, authentication flow, caching strategy, monitoring, and disaster recovery.

### Module Structure

Every feature module follows the same layout:

```
modules/jobs/
├── jobs.routes.ts
├── jobs.controller.ts
├── jobs.service.ts
├── jobs.repository.ts
├── jobs.validation.ts
├── jobs.types.ts
└── jobs.constants.ts
```

---

## 5. Development Workflow

### Strict Workflow (no skipping)

```
Understand → Plan → Review Docs → Design → Implement → Test → Review → Refactor → Verify → Document → Ship
```

**Rules:**

1. **Understand first.** Read the existing code and docs. Never start coding without context.
2. **Plan before coding.** For any non-trivial change, write a brief plan and get implicit approval.
3. **Review docs.** Check AGENTS.md, docs/, specs/, and relevant skill files before implementing.
4. **Design.** Consider the architecture, module boundaries, and API contracts. No surprise designs.
5. **Implement.** Follow the coding standards (§6) and architecture rules (§7).
6. **Test.** Write tests first (TDD) or alongside. See §14.
7. **Review.** Self-review against the checklist (§17). Run lint, typecheck, tests.
8. **Refactor.** Clean up. Remove duplication. Improve naming. Keep it simple.
9. **Verify.** Run the full test suite, lint, typecheck, and build.
10. **Document.** Update any affected docs. See §16.
11. **Ship.** Commit with Conventional Commit message. See §15.

---

## 6. Coding Standards

### TypeScript & JavaScript

- Strict mode enabled. No `any` without explicit justification.
- Prefer `interface` over `type` for object shapes. Use `type` for unions, intersections, and primitives.
- Use `const` by default; `let` only when reassignment is needed. Never `var`.
- Use `===` over `==`. Use `!==` over `!=`.
- Async/await over raw promises. Avoid callbacks (except in Express middleware).
- Use `null` for intentional absence; `undefined` for uninitialized state.

### React & Next.js

- Server Components by default. Add `'use client'` only when using state, effects, event handlers, or browser APIs.
- One component per file. Export as named function, not default.
- Props should be typed with an `interface` named `{ComponentName}Props`.
- Use `cn()` utility (`clsx` + `tailwind-merge`) for conditional classes.
- Parallelize data fetching with `Promise.all()` in Server Components.
- Use `Suspense` boundaries for streaming.
- See `.opencode/skills/senior-frontend/SKILL.md` and `.opencode/skills/nextjs-best-practices/SKILL.md`.

### Node.js & Express

- Controllers handle HTTP; Services handle business logic; Repositories handle data access.
- All routes use async error handling (wrap in `express-async-errors` or manual try/catch).
- Use Zod schemas for request validation at the route boundary.
- Use composition. Prefer small, focused middleware over monolithic handlers.
- See `.opencode/skills/senior-backend/SKILL.md` and `.opencode/skills/nodejs-express-server/SKILL.md`.

### Naming Conventions

| Concept             | Convention                      | Example           |
| ------------------- | ------------------------------- | ----------------- |
| Files               | `kebab-case`                    | `user-profile.ts` |
| Classes/PascalCase  | `PascalCase`                    | `UserService`     |
| Functions/variables | `camelCase`                     | `getUserById`     |
| Constants           | `UPPER_SNAKE_CASE`              | `MAX_RETRY_COUNT` |
| Types/Interfaces    | `PascalCase`                    | `CreateJobInput`  |
| Enums               | `PascalCase`                    | `JobStatus`       |
| Enum members        | `UPPER_SNAKE_CASE`              | `READY_TO_APPLY`  |
| Database tables     | `snake_case` via Prisma `@@map` | `resume_versions` |
| Database columns    | `snake_case` via Prisma `@map`  | `match_score`     |

### Formatting & Linting

- ESLint for linting. Prettier for formatting. Husky for pre-commit hooks.
- Commitlint enforces Conventional Commits (`type(scope): description`).
- Run `npm run lint` and `npm run format` before every commit.

### Imports

Order: (1) Node built-ins, (2) external packages, (3) internal modules (via `@/` alias), (4) relative imports. No blank line between groups of the same origin.

```typescript
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { JobService } from "@/modules/jobs/jobs.service";
import { AppError } from "@/common/errors";
```

### Exports

- Prefer named exports over default exports.
- Re-export from barrel files (`index.ts`) at module boundaries only.

### Error Handling

- Use a custom `AppError` class extending `Error` with `statusCode`, `code`, and optional `details`.
- All errors propagate to a global error handler middleware.
- Never expose stack traces to clients. Log them server-side with Pino.
- Use `.safeParse()` for Zod validation; return structured errors.

### Logging

- Use Pino for structured JSON logging.
- Levels: `INFO` (normal ops), `WARN` (recoverable issues), `ERROR` (failures), `DEBUG` (development).
- Log: API requests (method, path, duration), auth events, DB errors, queue jobs, AI requests, integrations.

### Configuration

- All config via environment variables. Validated at startup with Zod.
- Defaults in `.env.example`. Real secrets in `.env` (gitignored).
- See `docs/SYSTEM_ARCHITECTURE.md` §19 for the full env var list.

---

## 7. Architecture Rules

- **Never bypass service layer.** Controllers call services, not repositories directly.
- **Never mix business logic with HTTP.** Services have zero knowledge of Express/request/response.
- **Never duplicate logic.** If a pattern appears twice, extract it into a shared utility or service.
- **Prefer composition over inheritance.**
- **Keep modules isolated.** No cross-module imports. Use shared services for cross-cutting concerns.
- **Enforce clean architecture.** Infrastructure (external APIs, databases) must be behind an interface/abstraction.
- **Database is the single source of truth.** External services (Sheets, Trello) sync FROM the database, not vice versa.
- **AI assists, humans decide.** AI never performs irreversible actions. Always require user approval for submissions.
- **New modules must follow the existing structure** (routes → controller → service → repository).
- **No circular dependencies.** Use dependency injection or shared modules to break cycles.

---

## 8. UI Standards

### Components

- Prefer Server Components. Move interactivity to leaf Client Components.
- One component per file. Name files `kebab-case.tsx`.
- Use `cn()` for conditional class merging.
- Use shadcn/ui for common UI primitives (buttons, inputs, dialogs, etc.).
- See `.opencode/skills/frontend-ui-engineering/SKILL.md` and `.opencode/skills/senior-frontend/SKILL.md`.

### Hooks

- Extract reusable logic into custom hooks in `hooks/`.
- Name hooks `use{Feature}` (e.g., `useDebounce`, `useJobSearch`).

### State

- Redux Toolkit for global state (auth, session, UI).
- Local state with `useState`/`useReducer` for component-scoped state.
- Server state with RTK Query (caching, deduplication, optimistic updates).
- See `docs/TECH_STACK.md` for the full state management rationale.

### Forms

- React Hook Form + Zod for form validation.
- Use shadcn/ui form components where possible.

### Animations

- Prefer CSS transitions/animations over JS animation libraries.
- Use Framer Motion only when CSS is insufficient.

### Accessibility

- Semantic HTML (nav, main, button, heading hierarchy).
- Keyboard navigation for all interactive elements.
- ARIA labels on icons and complex widgets.
- Color contrast ≥ 4.5:1 for normal text.
- Visible focus indicators.

### Responsive Design

- Mobile-first with Tailwind breakpoints.
- Test on real viewport sizes. No horizontal scroll.

### Performance

- Lazy load below-the-fold components with `next/dynamic` or `Suspense`.
- Memoize expensive computations with `useMemo`/`useCallback`.
- Optimize images with `next/image`.
- Bundle budget: aim for < 150 KB gzip per route.
- See `.opencode/skills/performance-optimization/SKILL.md`.

---

## 9. Backend Standards

### Controllers

- Thin: parse request → validate → call service → format response.
- Never contain business logic or database calls.

### Services

- Contain all business logic. Never import HTTP concepts.
- Throw `AppError` on validation/domain failures.
- Return typed DTOs (not raw Prisma models where possible).

### Repositories

- Only Prisma queries. No business logic.
- One repository per entity. Methods mirror Prisma operations.

### Validation

- Zod schemas at every public API boundary.
- Validate in middleware or at the controller start. Fail fast.

### Authentication

- JWT access tokens (short-lived: 15 min) + refresh tokens (long-lived: 7 days).
- `authenticate` middleware extracts user from JWT and attaches to `req.user`.
- `authorize` middleware checks role-based access.

### Authorization

- Every protected endpoint checks resource ownership.
- Users can only access their own data unless admin.

### Caching

- Redis for: dashboard summaries, frequently accessed jobs, AI responses, session data.
- Cache invalidation on write. Set TTLs.

### Background Jobs

- BullMQ for async work: AI processing, syncs, notifications, reminders.
- Queue types: resume generation, cover letter gen, Trello sync, Google Sheets sync, email, AI processing.
- Retry failed jobs with exponential backoff.

### Rate Limiting

| Endpoint       | Limit       |
| -------------- | ----------- |
| Authentication | 10 req/min  |
| AI endpoints   | 30 req/min  |
| General API    | 100 req/min |
| Admin API      | 200 req/min |

### Monitoring

- Pino for structured logging.
- Track: API latency, queue health, DB performance, error rates, AI usage, external API failures.
- See `docs/SYSTEM_ARCHITECTURE.md` §22 for monitoring recommendations.

---

## 10. Database Standards

### Schema Design

- Normalize to 3NF. Use JSONB only for truly flexible metadata.
- Primary keys: UUIDs.
- Timestamps: `created_at`, `updated_at` on every table.
- Soft delete via `deleted_at` for Jobs, Applications, Resume Versions.

### Core Entities

See `docs/DATABASE_DESIGN.md` for full schema.

| Entity        | Purpose                   |
| ------------- | ------------------------- |
| User          | Platform users            |
| Job           | Imported opportunities    |
| Application   | Application lifecycle     |
| ResumeVersion | Tailored resume snapshots |
| CoverLetter   | Generated cover letters   |
| Task          | Follow-ups, next actions  |
| Notification  | Reminders                 |
| AIRequest     | AI interaction audit      |
| AuditLog      | Activity history          |

### Naming

- Prisma models: `PascalCase` (`ResumeVersion`, `CoverLetter`)
- Prisma fields: `camelCase` (`matchScore`, `followUpDate`)
- Database tables: `snake_case` via `@@map`
- Database columns: `snake_case` via `@map`
- Enums in DB: `UPPER_SNAKE_CASE`

### Indexes

Create indexes on: foreign keys, status fields, sort fields (created_at), composite filters (user_id + status).
See `docs/DATABASE_DESIGN.md` §18 for the full indexing strategy.

### Transactions

Use Prisma transactions for:

- Creating applications (multiple entities)
- AI resume generation
- Job imports
- Status change workflows
- Synchronization operations

### Migrations

- All schema changes via Prisma Migrate.
- One migration file per change. Descriptive names.
- Never edit existing migration files after they're merged.

### Performance

- Cursor-based pagination for large datasets.
- PostgreSQL Full-Text Search for job titles, companies, descriptions.
- JSONB for flexible metadata on `jobs.metadata` and `audit_logs.*_data`.

---

## 11. API Standards

### REST Conventions

- Resource-oriented URLs: `/api/v1/{resource}`
- HTTP methods: GET (read), POST (create), PATCH (partial update), DELETE (soft delete)
- Stateless. JSON in, JSON out.
- See `docs/API_SPECIFICATION.md` for the complete API spec.

### Response Format

Success:

```json
{ "success": true, "message": "...", "data": {} }
```

Error:

```json
{
  "success": false,
  "message": "...",
  "errors": [{ "field": "...", "message": "..." }]
}
```

### Status Codes

| Code | Use                 |
| ---- | ------------------- |
| 200  | Success             |
| 201  | Created             |
| 204  | No Content (DELETE) |
| 400  | Bad Request         |
| 401  | Unauthorized        |
| 403  | Forbidden           |
| 404  | Not Found           |
| 409  | Conflict            |
| 422  | Validation Error    |
| 429  | Rate Limit          |
| 500  | Internal Error      |

### Pagination

```
GET /api/v1/jobs?page=1&limit=20
```

Response includes `meta: { page, limit, total, totalPages }`.

### Filtering & Sorting

Query parameters for filters (`?status=READY_TO_APPLY`), `sortBy` and `sortOrder` (`asc`/`desc`).

### Versioning

- `/api/v1/` prefix. Breaking changes increment version.
- Old versions deprecated, not removed immediately.

### Documentation

- OpenAPI / Swagger spec alongside the API.
- Update API docs when endpoints change.

---

## 12. Security Standards

### Always Do (No Exceptions)

- Validate all external input at system boundaries (Zod).
- Parameterize all database queries (Prisma handles this automatically — never raw SQL with concatenation).
- Encode all output (React auto-escapes; never use `dangerouslySetInnerHTML` with user data).
- Hash passwords with bcrypt (salt rounds ≥ 12).
- Use Helmet for security headers (CSP, HSTS, X-Frame-Options).
- Use HTTP-only, secure, sameSite cookies for sessions.
- Rate limit authentication endpoints (10 req/min).
- Audit log all auth events and data mutations.
- Run `npm audit` before every release.

### Never Do

- Never commit secrets to git (`.env`, `*.key`, `*.pem`).
- Never log passwords, tokens, or PII.
- Never trust client-side validation as a security boundary.
- Never use `eval()` or `innerHTML` with user input.
- Never store auth tokens in `localStorage`.
- Never expose stack traces to users.
- Never bypass authorization checks.

### OWASP Prevention

- **Injection:** ORM (Prisma) + Zod validation. No raw SQL with concatenation.
- **Broken Auth:** JWT with short expiry, refresh token rotation, bcrypt.
- **XSS:** React auto-escaping + Helmet CSP headers.
- **Broken Access Control:** Resource ownership checks in every protected endpoint.
- **Security Misconfiguration:** Helmet, restricted CORS, env validation.
- **SSRF:** URL allowlists for any server-side fetch influenced by user input.

See `.opencode/skills/security-and-hardening/SKILL.md` for the full security guide and checklist.

---

## 13. Performance Rules

### Frontend

- Use `next/image` for optimized images (lazy loading, proper sizing).
- Lazy load below-the-fold components with `next/dynamic` and `Suspense`.
- Minimize client bundle: keep client components at leaf level.
- Use `React.memo` and `useMemo` only when profiling shows a bottleneck.
- Prefer `date-fns` over `moment` (12KB vs 290KB).
- Bundle analysis target: < 150 KB gzip per route.

### Backend

- Keep API responses under 300ms (excluding AI calls).
- Use Redis caching for dashboard, frequent queries, AI responses.
- Use database indexes on all query patterns.
- Paginate all list endpoints (cursor-based for large datasets).
- Offload heavy work to BullMQ queues (AI, sync, notifications).

### Database

- Index foreign keys and frequently filtered/sorted columns.
- Use composite indexes for multi-column filters.
- Avoid N+1 queries — use Prisma `include` or batch queries.
- Use PostgreSQL Full-Text Search instead of `LIKE '%term%'`.

### Monitoring

- Track: API latency (p50/p95/p99), queue depth, cache hit rate, DB query time.
- See `docs/SYSTEM_ARCHITECTURE.md` §22.

---

## 14. Testing Strategy

### Test Pyramid

| Level       | %    | Tools              |
| ----------- | ---- | ------------------ |
| Unit        | ~80% | Vitest             |
| Integration | ~15% | Vitest + Supertest |
| E2E         | ~5%  | Playwright         |

### Practices

- **TDD for new logic:** Write test first (RED), implement (GREEN), refactor.
- **Bug fixes:** Write a reproduction test that fails first → fix → test passes.
- **DAMP over DRY** in tests: each test tells a complete story.
- **Prefer real implementations over mocks:** real > fake > stub > mock.
- **Arrange-Act-Assert** pattern in every test.
- **One assertion per concept.** Descriptive test names that read like specs.

### Coverage Expectations

- Services/business logic: 90%+ coverage.
- Controllers/routes: coverage for success + error paths.
- UI components: test behavior, not implementation details.

### Key Files

- Tests live alongside source: `*.test.ts` or `*.spec.ts`.
- E2E tests in `tests/e2e/`.

See `.opencode/skills/test-driven-development/SKILL.md` for detailed TDD guidance.

---

## 15. Git Workflow

### Branch Naming

```
{type}/{short-description}
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`.
Examples: `feat/job-scoring`, `fix/auth-refresh`, `refactor/error-handling`.

### Commit Format

[Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]
```

Examples:

- `feat(jobs): add AI match scoring endpoint`
- `fix(auth): handle expired refresh token gracefully`
- `refactor(api): standardize error response format`

### PR Requirements

- Title matches commit format.
- Description explains what and why.
- Checklist: tests pass, lint passes, docs updated, no regressions.
- At least one review before merge (for significant changes).
- Keep PRs focused: < 300 lines changed. Split large changes.

### Merge Strategy

- Squash merge for feature branches into main.
- Linear history preferred.

### Release Process

- Releases tagged with semver: `v1.0.0`, `v1.1.0`, etc.
- Changelog generated from Conventional Commits.
- Deploy after all checks pass on main.

---

## 16. Documentation Rules

### When to Update Docs

- **Always:** When behavior changes, docs must change too.
- **New feature:** Update API_SPECIFICATION.md, add spec in specs/.
- **Schema change:** Update DATABASE_DESIGN.md.
- **Architecture change:** Update SYSTEM_ARCHITECTURE.md.
- **Tech change:** Update TECH_STACK.md.

### Required Documents

| File                           | Purpose                                | Update Trigger            |
| ------------------------------ | -------------------------------------- | ------------------------- |
| `docs/PRODUCT_VISION.md`       | Vision, principles, roadmap            | Strategy changes          |
| `docs/PRODUCT_REQUIREMENTS.md` | Functional/non-functional requirements | Feature changes           |
| `docs/SYSTEM_ARCHITECTURE.md`  | Architecture, layers, deployment       | Architecture changes      |
| `docs/DATABASE_DESIGN.md`      | Schema, indexes, entities              | Schema changes            |
| `docs/API_SPECIFICATION.md`    | Endpoints, formats, errors             | API changes               |
| `docs/TECH_STACK.md`           | Technologies, rationale                | Stack changes             |
| `specs/feature/*.md`           | Per-feature specifications             | New features              |
| `AGENTS.md`                    | AI agent operational manual            | Workflow/standard changes |

### Documentation Style

- Concise. Prefer tables and lists over prose.
- Code examples should be runnable/realistic.
- Keep the single source of truth. If something is in AGENTS.md, don't duplicate it in other docs — reference it.

---

## 17. Code Review Checklist

### Architecture

- [ ] Follows existing module structure (routes → controller → service → repository)
- [ ] No layer violations (services don't import HTTP, repositories don't contain business logic)
- [ ] No circular dependencies
- [ ] Feature-specific logic not leaking into shared modules
- [ ] Abstraction level is appropriate (not over-engineered)

### Naming

- [ ] Files: `kebab-case`. Components: `PascalCase`. Functions: `camelCase`.
- [ ] Variables clearly describe their purpose (no `temp`, `data`, `result`)
- [ ] Test names describe behavior, not implementation

### Security

- [ ] Input validated at all system boundaries (Zod)
- [ ] Authorization checked on every protected endpoint
- [ ] No secrets in code, logs, or git history
- [ ] SQL queries are parameterized (Prisma handles this)
- [ ] No XSS vectors (no `dangerouslySetInnerHTML`, no `eval`)
- [ ] Rate limiting on auth endpoints
- [ ] SSRF protection on user-supplied URLs

### Performance

- [ ] No N+1 queries
- [ ] Pagination on all list endpoints
- [ ] No synchronous I/O in hot paths
- [ ] Unnecessary re-renders minimized
- [ ] Lazy loading for below-the-fold content

### Testing

- [ ] New behavior has corresponding tests
- [ ] Bug fixes include a reproduction test
- [ ] Tests are DAMP (descriptive), not over-DRY
- [ ] Edge cases covered (null, empty, boundary values)
- [ ] Error paths tested (not just happy path)

### Accessibility

- [ ] Semantic HTML used
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ≥ 4.5:1

### Maintainability

- [ ] No dead code or commented-out code
- [ ] No unnecessary complexity or "clever" tricks
- [ ] Error handling is thorough (no silent failures)
- [ ] Logging at appropriate levels

### Documentation

- [ ] API changes reflected in docs
- [ ] Schema changes reflected in docs
- [ ] Non-obvious decisions explained in code comments or commit messages

See `.opencode/skills/code-review-and-quality/SKILL.md` for the full five-axis review framework.

---

## 18. AI Agent Guardrails

### Never

- ❌ **Never invent APIs.** Every endpoint must come from `docs/API_SPECIFICATION.md`.
- ❌ **Never invent database tables.** Every entity must come from `docs/DATABASE_DESIGN.md`.
- ❌ **Never ignore repository standards.** AGENTS.md and referenced docs are mandatory.
- ❌ **Never duplicate code.** If similar logic exists, reuse it or extract a shared utility.
- ❌ **Never bypass architecture.** No direct DB calls from controllers. No business logic in repositories.
- ❌ **Never skip tests.** Every new behavior needs tests. Every bug fix needs a reproduction test.
- ❌ **Never skip validation.** Zod at every boundary.
- ❌ **Never hardcode secrets.** Everything in env vars or a secure vault.
- ❌ **Never remove security checks.** Rate limiting, auth, authorization, input validation, CSRF.
- ❌ **Never change unrelated files.** Focus each change on one concern.
- ❌ **Never auto-submit applications.** AI assists, humans decide. This is a hard product constraint.
- ❌ **Never use `any` without explicit justification.**

### Always

- ✅ **Search existing code first.** Before writing anything, check if it already exists.
- ✅ **Reuse existing abstractions.** Services, repositories, middleware, utilities.
- ✅ **Follow conventions.** Match the style and patterns of surrounding code.
- ✅ **Preserve backward compatibility.** Unless explicitly told to break it.
- ✅ **Explain architectural decisions.** In commit messages or code comments.
- ✅ **Reference source docs.** When implementing a feature, link back to the PRD or spec.
- ✅ **Check for dead code after refactoring.** Remove what's no longer needed.
- ✅ **Run lint + typecheck + tests before committing.**

---

## 19. Definition of Done

A task is complete **only** when ALL of these are true:

- [ ] Implementation finished per spec/requirements
- [ ] All tests pass (`npm test` or equivalent)
- [ ] Lint passes (`npm run lint`)
- [ ] Formatting passes (`npm run format`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Documentation updated (docs if public API, inline if not)
- [ ] No console errors (frontend: zero console.error/warn)
- [ ] No security issues (`npm audit` clean or documented exceptions)
- [ ] Production ready (env vars documented, no debug code, no TODO stubs)

---

## 20. AI Execution Checklist

Every task follows this sequence. Never skip a step.

```
 1. Repository Review
    ├── Read AGENTS.md
    ├── Read relevant docs/ files
    ├── Read existing source code (search before writing)
    └── Understand the architecture

 2. Context Collection
    ├── Identify all files that need to change
    ├── Check for existing patterns to follow
    └── Identify potential side effects

 3. Specification
    ├── Understand what the task requires
    ├── Check against docs/PRODUCT_REQUIREMENTS.md
    └── Clarify ambiguities before coding

 4. Planning
    ├── Break work into small, ordered steps
    ├── Design the solution on paper first
    └── Consider architecture, security, performance

 5. Implementation
    ├── Write tests first (TDD) where practical
    ├── Implement one step at a time
    ├── Run tests after each step
    └── Keep changes focused and small

 6. Testing
    ├── Run full test suite
    ├── Add new tests for new behavior
    ├── Verify edge cases
    └── Run lint + typecheck

 7. Review
    ├── Self-review against §17 checklist
    ├── Check for dead code
    └── Verify no regressions

 8. Optimization
    ├── Check for obvious performance issues
    ├── Verify no N+1 queries
    └── Check bundle impact (frontend)

 9. Documentation
    ├── Update docs if API/schema/behavior changed
    ├── Write clear commit message
    └── Reference related issues/PRs

10. Final Verification
    ├── Run full test suite one more time
    ├── Run lint + typecheck + build
    ├── Verify no debug code remains
    └── Confirm Definition of Done (§19)
```

---

## Document Reference Map

| Topic                  | Primary Source                                                | Also See                       |
| ---------------------- | ------------------------------------------------------------- | ------------------------------ |
| Vision & Roadmap       | `docs/PRODUCT_VISION.md`                                      | `docs/PRODUCT_REQUIREMENTS.md` |
| Requirements           | `docs/PRODUCT_REQUIREMENTS.md`                                | `specs/feature/*.md`           |
| Architecture           | `docs/SYSTEM_ARCHITECTURE.md`                                 | This doc §4                    |
| Database               | `docs/DATABASE_DESIGN.md`                                     | This doc §10                   |
| API                    | `docs/API_SPECIFICATION.md`                                   | This doc §11                   |
| Tech Stack             | `docs/TECH_STACK.md`                                          | This doc §3                    |
| Security               | `.opencode/skills/security-and-hardening/SKILL.md`            | This doc §12                   |
| Testing                | `.opencode/skills/test-driven-development/SKILL.md`           | This doc §14                   |
| Code Review            | `.opencode/skills/code-review-and-quality/SKILL.md`           | This doc §17                   |
| Backend Patterns       | `.opencode/skills/senior-backend/SKILL.md`                    | This doc §9                    |
| Frontend Patterns      | `.opencode/skills/senior-frontend/SKILL.md`                   | This doc §8                    |
| Fullstack Patterns     | `.opencode/skills/senior-fullstack/SKILL.md`                  | —                              |
| Node/Express           | `.opencode/skills/nodejs-express-server/SKILL.md`             | —                              |
| CI/CD                  | `.opencode/skills/ci-cd-and-automation/SKILL.md`              | —                              |
| Performance            | `.opencode/skills/performance-optimization/SKILL.md`          | This doc §13                   |
| Accessibility          | `.opencode/skills/web-design-guidelines/SKILL.md`             | —                              |
| React/Next.js Perf     | `.opencode/skills/vercel-react-best-practices/SKILL.md`       | —                              |
| Next.js Best Practices | `.opencode/skills/nextjs-best-practices/SKILL.md`             | —                              |
| Frontend Design        | `.opencode/skills/frontend-design/SKILL.md`                   | —                              |
| UI Engineering         | `.opencode/skills/frontend-ui-engineering/SKILL.md`           | —                              |
| Observability          | `.opencode/skills/observability-and-instrumentation/SKILL.md` | —                              |
| Spec-Driven Dev        | `.opencode/skills/spec-driven-development/SKILL.md`           | —                              |
| Source-Driven Dev      | `.opencode/skills/source-driven-development/SKILL.md`         | —                              |
