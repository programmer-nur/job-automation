# Design: Phase 11 — Admin Module

## Architecture

Standard module pattern: routes → controller → service → Prisma.

All endpoints use `authenticate` + `authorize('ADMIN')` middleware. No new Prisma models needed.

## Queries

### listUsers
- `prisma.user.findMany` with pagination
- Include `_count.jobs` for each user
- Exclude `passwordHash` from results

### listJobs
- `prisma.job.findMany` with pagination, include user email
- Join with User to get userEmail

### getAiStats
- Total request count via `prisma.aIRequest.count()`
- Group by type via raw findMany + in-memory grouping
- Success rate: completed / total
- Recent requests: latest 20 with user info

### listAuditLogs
- `prisma.auditLog.findMany` with pagination
- Include userName for display
