# Design: Phase 9 — Dashboard Module

## Queries

All scoped to `userId` with `deletedAt: null` where applicable.

### Summary
```typescript
const [totalJobs, totalApplications, interviews, offers, rejections, pendingTasks, unreadNotifications, activeResumes] = await Promise.all([
  prisma.job.count({ where: { userId, deletedAt: null } }),
  prisma.application.count({ where: { userId, deletedAt: null } }),
  prisma.application.count({ where: { userId, status: 'INTERVIEWING', deletedAt: null } }),
  prisma.application.count({ where: { userId, status: 'OFFER', deletedAt: null } }),
  prisma.application.count({ where: { userId, status: 'REJECTED', deletedAt: null } }),
  prisma.task.count({ where: { userId, completedAt: null, deletedAt: null } }),
  prisma.notification.count({ where: { userId, isRead: false } }),
  prisma.resumeVersion.count({ where: { userId, isActive: true, deletedAt: null } }),
]);
```

### Monthly
Group applications by month using PostgreSQL date_trunc. Since we're using Prisma, fetch all applications and group in-memory.

### Match Scores
Fetch jobs with matchScore, bucketed into 5 ranges.

### Sources
Fetch jobs with non-null source, grouped by source value.

## Error Scenarios
- None specific — always returns data (possibly empty)
- Missing auth → 401 (from authenticate middleware)

## Test Plan
### Service Tests (4)
Mock Prisma counts for each endpoint. Verify correct aggregation.

### Integration Tests (6)
Mock the entire dashboard service. Test HTTP pipeline.
- Each route: 200 success, 401 no auth
