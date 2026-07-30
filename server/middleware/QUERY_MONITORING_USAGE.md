# Query Performance Monitoring Usage Guide

## Overview

The query performance monitoring middleware tracks slow database queries (>500ms) to help identify bottlenecks as data grows.

## How to Use

### 1. Import the monitoring function

```typescript
import { monitorQuery } from "../middleware/queryPerformanceMonitor";
```

### 2. Wrap database queries

Wrap any database query that you want to monitor:

```typescript
// Before
const reports = await db
  .select()
  .from(watchdogReports)
  .where(eq(watchdogReports.isPublic, 1))
  .orderBy(desc(watchdogReports.createdAt))
  .limit(50);

// After
const reports = await monitorQuery(
  "watchdog.list",
  async () => db
    .select()
    .from(watchdogReports)
    .where(eq(watchdogReports.isPublic, 1))
    .orderBy(desc(watchdogReports.createdAt))
    .limit(50),
  { limit: 50 } // Optional: include query parameters for debugging
);
```

### 3. View performance metrics

Access the performance monitoring API:

```typescript
// Get all slow queries
const { queries } = await trpc.performanceMonitor.getSlowQueries.query();

// Get statistics
const stats = await trpc.performanceMonitor.getStats.query();
// Returns:
// {
//   totalSlowQueries: 5,
//   averageDuration: 750,
//   maxDuration: 1200,
//   minDuration: 550,
//   queries: [...] // Last 10 slow queries
// }

// Clear history (admin only)
await trpc.performanceMonitor.clearHistory.mutate();
```

## Example: Monitoring Critical Queries

### Dashboard Stats Query
```typescript
const stats = await monitorQuery(
  "dashboard.getStats",
  async () => db.select({
    totalReports: sql<number>`count(*)`,
    avgSeverity: sql<number>`avg(severity)`,
  }).from(watchdogReports),
  { userId: ctx.user?.id }
);
```

### User Training Progress
```typescript
const progress = await monitorQuery(
  "training.getUserProgress",
  async () => db
    .select()
    .from(userTrainingProgress)
    .where(eq(userTrainingProgress.userId, userId))
    .innerJoin(trainingModules, eq(userTrainingProgress.moduleId, trainingModules.id)),
  { userId }
);
```

### Complex Joins
```typescript
const assessments = await monitorQuery(
  "compliance.getDetailedAssessments",
  async () => db
    .select()
    .from(assessments)
    .innerJoin(aiSystems, eq(assessments.aiSystemId, aiSystems.id))
    .innerJoin(frameworks, eq(assessments.frameworkId, frameworks.id))
    .where(eq(aiSystems.organizationId, orgId)),
  { orgId }
);
```

## Best Practices

1. **Name queries descriptively**: Use format `router.procedure` (e.g., "watchdog.list", "training.getUserProgress")
2. **Include relevant parameters**: Add query parameters to help debug slow queries
3. **Monitor critical paths**: Focus on user-facing queries and complex joins
4. **Review regularly**: Check slow query logs weekly to identify optimization opportunities
5. **Set up alerts**: Consider adding alerts when slow query count exceeds threshold

## Console Output

When a slow query is detected, you'll see:

```
[SLOW QUERY] dashboard.getStats took 750ms {
  params: '{"userId":123}',
  timestamp: '2026-01-03T23:54:00.000Z'
}
```

## Performance Optimization Tips

When you identify slow queries:

1. **Add indexes**: Create database indexes on frequently queried columns
2. **Optimize joins**: Reduce the number of joins or use more efficient join strategies
3. **Limit result sets**: Add pagination or limit clauses
4. **Cache results**: Use caching for frequently accessed, rarely changing data
5. **Denormalize data**: Consider denormalizing for read-heavy operations
