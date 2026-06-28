# AI_EXECUTION_WORKFLOW.md

## Purpose

This document defines the mandatory execution workflow for all AI agents working on this project. It is a companion to `AGENTS.md` — while `AGENTS.md` is the broad operational manual covering all standards and practices, this document focuses specifically on the **ordered, gated development lifecycle** every feature must follow.

The goal is to ensure that every feature is developed using Specification-Driven Development (SDD), Test-Driven Development (TDD), and production-grade software engineering practices.

**No AI agent may write implementation code before completing the planning, architecture, testing, and review phases described in this document.**

A feature is not complete until it has passed through every phase below. Skipping any phase is prohibited.

---

## Core Rule

**NEVER START CODING IMMEDIATELY.**

Before implementing any feature, the AI agent must fully understand:

- Project vision
- Product requirements
- Architecture
- Domain model
- Testing strategy
- Security requirements
- Performance requirements
- Coding standards
- Existing implementation

The AI agent must always prioritize **correctness, maintainability, scalability, testability, security, and developer experience** over implementation speed.

> See `AGENTS.md §2` for the full list of AI agent responsibilities.

---

## Required Reading Order

Before performing any task, read the following files from the `docs/` and `.opencode/` directories in this order:

### 1. Operational Manual
- `AGENTS.md` — Complete operational manual (all 20 sections)

### 2. Product & Requirements
- `docs/PRODUCT_VISION.md` — Vision, principles, roadmap
- `docs/PRODUCT_REQUIREMENTS.md` — Functional and non-functional requirements

### 3. Architecture & Design
- `docs/SYSTEM_ARCHITECTURE.md` — Layers, module structure, deployment
- `docs/DATABASE_DESIGN.md` — Schema, entities, indexes, naming
- `docs/API_SPECIFICATION.md` — Endpoints, response format, error codes
- `docs/TECH_STACK.md` — Technology rationale

### 4. AI Architecture
- `docs/AI_ARCHITECTURE.md` — AI service design (if populated)

### 5. Feature Specs (if applicable)
- `specs/feature/*.md` — Feature-specific specifications

### 6. Agent Skills (as needed)
- `.opencode/skills/*/SKILL.md` — Load relevant skills via the skill tool

**If any file is missing:**
1. Stop implementation.
2. Report the missing documentation.
3. Request clarification.

Never make assumptions about missing requirements. Every gap must be filled by a human or explicitly acknowledged as a non-blocker.

---

## Mandatory Development Lifecycle

Every feature must follow the workflow below. No phase may be skipped.

```
SPEC
  ↓
PLAN
  ↓
DESIGN
  ↓
TEST
  ↓
BUILD
  ↓
VERIFY
  ↓
REVIEW
  ↓
SHIP
```

---

## Phase 1 — SPEC

**Goal:** Understand the feature completely. No ambiguity may remain.

### Activities
- Read all relevant docs (see Required Reading Order above).
- Clarify requirements with the human if anything is unclear.
- Identify all functional and non-functional requirements.
- Surface assumptions explicitly before proceeding.

### Deliverables

| Artifact | Description |
|---|---|
| Feature Summary | One-paragraph description of what the feature does and why |
| Functional Requirements | Bullet list of what the feature must do |
| Non-Functional Requirements | Performance, security, scalability, accessibility constraints |
| Acceptance Criteria | Specific, testable conditions that define "done" |
| Risks | What could go wrong and how to mitigate |
| Edge Cases | Empty states, error states, boundary values, race conditions |
| Dependencies | What other features, modules, or services this feature depends on |

### Output
**SPECIFICATION REPORT** — written to `specs/feature/{feature-name}.md` if a new feature spec is warranted.

### Gate
The AI agent must not proceed until requirements are clear and the human has approved the specification.

> See `.opencode/skills/spec-driven-development/SKILL.md` for the full SDD workflow and spec template.

---

## Phase 2 — PLAN

**Goal:** Create a detailed implementation plan that can be reviewed and approved before any code is written.

### Activities
- Determine the technical approach.
- Break the feature into discrete components.
- Plan state management and data flow.
- Identify which AGENTS.md sections apply (architecture rules, coding standards, security, etc.).
- Plan the testing strategy.

### Deliverables

| Artifact | Description |
|---|---|
| Technical Approach | High-level solution description with rationale |
| Component Breakdown | List of files to create or modify, with responsibilities |
| State Management Plan | How state flows through the system (Redux, URL params, local state) |
| Data Flow Plan | How data moves from API → service → database and back |
| Testing Strategy | What to test at each level (unit, integration, E2E) |
| Migration Strategy | Database migrations, data backfills, zero-downtime considerations |
| Rollback Strategy | How to revert if something goes wrong in production |

### Output
**IMPLEMENTATION PLAN**

### Gate
The plan must be approved before coding begins.

---

## Phase 3 — DESIGN

**Goal:** Design the solution before implementation. Validate architecture consistency, domain boundaries, and dependency flow.

### Activities
- Design the component/service structure.
- Map state transitions and error flows.
- Perform a security review of the design.
- Verify the design respects the architecture rules in `AGENTS.md §7`.
- Ensure module boundaries are clean and dependencies flow downward.

### Deliverables

| Artifact | Description |
|---|---|
| Component Diagram | High-level structural diagram of new components |
| Service Diagram | Service interactions and interfaces |
| State Flow | State machine or state transitions |
| Event Flow | Events emitted and consumed (if applicable) |
| Error Flow | How errors propagate and are handled |
| Security Review | Threat model: trust boundaries, auth, input validation, data exposure |

### Validation Checklist
- [ ] Architecture — follows modular monolith pattern (`AGENTS.md §4`)
- [ ] Domain boundaries — no cross-module imports (`AGENTS.md §7`)
- [ ] Dependency direction — only downward (`AGENTS.md §4`)
- [ ] Security — OWASP prevention patterns (`AGENTS.md §12`)
- [ ] API contract — matches `docs/API_SPECIFICATION.md`
- [ ] Database schema — matches `docs/DATABASE_DESIGN.md`

### Output
**TECHNICAL DESIGN DOCUMENT**

---

## Phase 4 — TEST

**Goal:** Tests are written before implementation code. This is the TDD phase.

### Activities
- Write unit tests for all business logic.
- Write integration tests for API endpoints and database interactions.
- Write E2E tests for critical user flows.
- Define happy path, failure path, edge cases, and security cases.

### Deliverables

| Artifact | Description |
|---|---|
| Test Plan | What will be tested and at what level |
| Unit Tests | `*.test.ts` files alongside source code |
| Integration Tests | API-level tests using Supertest |
| E2E Tests | Critical user flows in `tests/e2e/` |

### Test Requirements
- **Unit tests:** 90%+ coverage on business logic (`AGENTS.md §14`)
- **Integration tests:** All API endpoints (success + error paths)
- **E2E tests:** At least the primary user flow end-to-end
- **Accessibility tests:** Keyboard nav, ARIA labels, color contrast (`AGENTS.md §8`)
- **DAMP over DRY:** Each test tells a complete story (`AGENTS.md §14`)
- **Arrange-Act-Assert:** Every test follows this pattern
- **One assertion per concept:** Descriptive test names that read like specs

### Outputs
**TEST PLAN** and **TEST IMPLEMENTATION**

### Gate
No production code may be written before tests exist. Tests must fail (RED) before implementation (GREEN).

> See `.opencode/skills/test-driven-development/SKILL.md` for the full TDD cycle (RED → GREEN → REFACTOR).

---

## Phase 5 — BUILD

**Goal:** Implement the feature following all coding standards and architecture rules.

### Activities
- Write implementation code one test at a time (TDD).
- Follow the coding standards in `AGENTS.md §6`.
- Respect all architecture rules in `AGENTS.md §7`.

### Implementation Requirements

| Requirement | Standard |
|---|---|
| TypeScript | Strict mode. No `any` without explicit justification. |
| SOLID Principles | Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion |
| Dependency Injection | Where appropriate for testability |
| Reusable Abstractions | Extract shared logic; no duplication |
| Domain Structure | Feature modules with routes → controller → service → repository |
| Error Handling | `AppError` class with `statusCode`, `code`, `details` |
| Validation | Zod schemas at every public API boundary |
| Logging | Pino structured logging at appropriate levels |
| Documentation | JSDoc on every public function |

### Rules
- **No duplicated logic.** If a pattern appears twice, extract it.
- **No dead code.** Remove unused imports, variables, and functions.
- **No temporary hacks.** No `// TODO`, `// FIXME`, or `// HACK` stubs.
- **No commented-out code.** Delete it or keep it, never comment it out.
- **No `any`.** Every type must be explicit or inferred strictly.

### Output
**IMPLEMENTED FEATURE** — production-ready code.

---

## Phase 6 — VERIFY

**Goal:** Run all verification steps. The feature must be proven correct.

### Required Checks

| Check | Standard |
|---|---|
| TypeScript | Zero errors (`npm run typecheck`) |
| Lint | Zero warnings (`npm run lint`) |
| Unit Tests | All passing, 90%+ coverage |
| Integration Tests | All passing |
| E2E Tests | All passing |
| Accessibility | No violations (keyboard, ARIA, contrast) |
| Performance | API < 300ms, dashboard < 2s, bundle < 150 KB gzip per route |
| Security | No secrets in code, no XSS/SSRF/SQLi vectors, `npm audit` clean |
| Build | Production build succeeds (`npm run build`) |

### Additional Checks
- [ ] No N+1 queries (`AGENTS.md §13`)
- [ ] Pagination on list endpoints (`AGENTS.md §11`)
- [ ] Cache invalidation on write (`AGENTS.md §9`)
- [ ] Error responses don't expose internals (`AGENTS.md §12`)
- [ ] Console errors: zero (`AGENTS.md §8`)

### Output
**VERIFICATION REPORT** — a summary of all check results.

---

## Phase 7 — REVIEW

**Goal:** Perform a senior engineer-level code review.

### Review Checklist

| Axis | What to Check |
|---|---|
| Architecture | Is the architecture pattern respected? Are layers separated? No circular dependencies? |
| Security | Any vulnerabilities? Input validated? Auth checked? No secrets exposed? |
| Performance | Any bottlenecks? N+1 queries? Unbounded loops? Missing pagination? |
| Scalability | Will this scale to 100k+ jobs and 1M+ applications? |
| Maintainability | Easy to extend? Clear boundaries? No dead code? |
| Readability | Easy to understand? Descriptive names? No clever tricks? |
| Testing | Sufficient coverage? Edge cases tested? Error paths tested? DAMP over DRY? |
| Documentation | API docs updated? Schema docs updated? Inline docs on public functions? |

### Self-Review
Use the full checklist in `AGENTS.md §17` before requesting human review.

### Output
**CODE REVIEW REPORT** — issues categorized as Critical, Required, Optional, or Nit (see `.opencode/skills/code-review-and-quality/SKILL.md`).

---

## Phase 8 — SHIP

**Goal:** Merge the feature into the main branch with a clean history and updated documentation.

### Before Merging
- [ ] Tests pass
- [ ] Lint + format pass
- [ ] TypeScript zero errors
- [ ] Build succeeds
- [ ] Documentation updated (`docs/` and/or `specs/`)
- [ ] Changelog updated (if applicable)
- [ ] No breaking changes introduced
- [ ] Architecture unchanged (unless intentional)
- [ ] Commit message follows Conventional Commits (`AGENTS.md §15`): `type(scope): description`
- [ ] PR < 300 lines changed (`AGENTS.md §15`)
- [ ] Branch name follows convention: `{type}/{short-description}`

### Output
**RELEASE REPORT** — summary of what was shipped, with references to docs, specs, and related issues.

---

## Decision-Making Rules

When multiple solutions exist, prefer in this order:

| Priority | Value | Why |
|---|---|---|
| 1 | **Simplicity** | Simple code is easier to understand, test, and maintain |
| 2 | **Maintainability** | Code will be read far more often than it's written |
| 3 | **Testability** | Untestable code is unreliable code |
| 4 | **Security** | Never compromise security for convenience |
| 5 | **Performance** | Optimize only after measuring; meet the targets in §6 |

Never choose a shortcut that sacrifices architecture quality. If a fast solution violates the architecture rules in `AGENTS.md §7`, it is not an acceptable solution.

---

## AI Coding Standards

### Always
- Use explicit TypeScript types (never rely on inference for public APIs)
- Use Zod validation at every system boundary (`AGENTS.md §9`)
- Handle errors explicitly — never swallow exceptions
- Write tests before implementation (TDD)
- Use dependency inversion where appropriate
- Respect feature module boundaries
- Follow the project architecture (routes → controller → service → repository)
- Search existing code before writing anything new (`AGENTS.md §18`)
- Reference source docs when implementing features

### Never
- Use `any` without explicit justification
- Ignore TypeScript errors
- Bypass linting rules
- Disable or skip tests
- Introduce hidden or circular dependencies
- Break module boundaries (no cross-module imports)
- Commit unfinished code
- Invent APIs not in `docs/API_SPECIFICATION.md`
- Invent database tables not in `docs/DATABASE_DESIGN.md`
- Hardcode secrets in source code

---

## Refactoring Rules

### Refactor When
- Duplication exists (a pattern appears twice → extract)
- Complexity increases (a function or module grows beyond its single responsibility)
- Architecture degrades (layer violations, circular dependencies, leaky abstractions)
- Maintainability decreases (hard to understand, hard to change, hard to test)

### Never Refactor Without
- Existing tests that cover the behavior being refactored
- Tests passing before the refactoring begins
- Tests passing after every incremental change

Refactoring and feature work must be submitted in separate commits (`AGENTS.md §15`).

---

## Security Requirements

### Always
- Validate all input at system boundaries using Zod (`AGENTS.md §12`)
- Sanitize user content before rendering (React auto-escaping, never `dangerouslySetInnerHTML`)
- Hash passwords with bcrypt (salt rounds ≥ 12)
- Use Helmet for security headers
- Use HTTP-only, secure, sameSite cookies for sessions
- Encrypt sensitive data at rest (PII, tokens)
- Audit log all auth events and data mutations
- Run `npm audit` before every release

### Never
- Store secrets in source code or version control
- Log passwords, tokens, or PII
- Trust client-side validation as a security boundary
- Expose stack traces or internal error details to users
- Store auth tokens in `localStorage`
- Use `eval()` or `innerHTML` with user input
- Bypass authorization checks

> See `.opencode/skills/security-and-hardening/SKILL.md` for the complete security guide.

---

## Performance Requirements

| Measure | Target |
|---|---|
| Application startup | < 2 seconds |
| Widget startup | < 300ms |
| API response (excluding AI calls) | < 300ms |
| Dashboard load | < 2 seconds |
| UI interaction responsiveness | < 100ms |
| Memory usage | Minimal — no memory leaks |
| Bundle size | < 150 KB gzip per route |
| Database query time (p95) | < 50ms for indexed queries |
| Core Web Vitals (LCP, INP, CLS) | Pass Google thresholds |

The AI agent must optimize performance without sacrificing readability or maintainability. Profile before optimizing.

> See `AGENTS.md §13` and `.opencode/skills/performance-optimization/SKILL.md` for detailed performance guidance.

---

## Definition of Done

A feature is considered complete **only** when all of these are true:

- [ ] Requirements satisfied (per SPEC phase acceptance criteria)
- [ ] Architecture respected (no layer violations, clean module boundaries)
- [ ] Tests written (unit + integration + E2E where applicable)
- [ ] Tests passing (all automated checks green)
- [ ] Documentation updated (`docs/`, `specs/`, inline)
- [ ] Accessibility verified (keyboard, ARIA, contrast)
- [ ] Security verified (no vulnerabilities, `npm audit` clean)
- [ ] Performance verified (meets targets above)
- [ ] Code reviewed (self-review + human review)
- [ ] Ready for production (env vars documented, no debug code, no TODO stubs)

**Anything less is not complete.**

---

## Relationship to AGENTS.md

This document is designed as a companion to `AGENTS.md`. Use both together:

| Topic | Primary Source |
|---|---|
| Repository purpose, vision, goals | `AGENTS.md §1` |
| AI agent responsibilities | `AGENTS.md §2` |
| Repository overview & tech stack | `AGENTS.md §3` |
| Architecture (layers, modules) | `AGENTS.md §4`, `docs/SYSTEM_ARCHITECTURE.md` |
| Development workflow (high-level) | `AGENTS.md §5` |
| Execution workflow (detailed) | **This document** |
| Coding standards | `AGENTS.md §6` |
| Architecture rules | `AGENTS.md §7` |
| UI standards | `AGENTS.md §8` |
| Backend standards | `AGENTS.md §9` |
| Database standards | `AGENTS.md §10`, `docs/DATABASE_DESIGN.md` |
| API standards | `AGENTS.md §11`, `docs/API_SPECIFICATION.md` |
| Security standards | `AGENTS.md §12` |
| Performance rules | `AGENTS.md §13` |
| Testing strategy | `AGENTS.md §14` |
| Git workflow | `AGENTS.md §15` |
| Documentation rules | `AGENTS.md §16` |
| Code review checklist | `AGENTS.md §17` |
| AI agent guardrails | `AGENTS.md §18` |
| Definition of Done | `AGENTS.md §19` **and** this document |
| AI execution checklist | `AGENTS.md §20` |

---

## Final Rule

**Think like a Staff Engineer.**

Do not optimize for writing code. Optimize for building a **production-grade, maintainable, scalable, secure, and testable software system**.

Every line of code you write will be read, reviewed, and maintained by other engineers (human and AI). Write for them, not for the compiler. Prefer clarity over cleverness. Prefer simplicity over speed. Prefer correctness over convenience.

The goal is not to finish fast. The goal is to build something that lasts.
