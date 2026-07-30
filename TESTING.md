# COAI Dashboard Testing Guide

## Overview

This document describes the testing infrastructure for the COAI Dashboard, including E2E tests with Playwright, unit tests with Vitest, and database query performance monitoring.

## E2E Testing with Playwright

### Running Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e e2e/04-signup-flow.spec.ts

# Run tests matching a pattern
pnpm test:e2e --grep "signup"
```

### Test Structure

E2E tests are located in the `e2e/` directory:

- `01-homepage.spec.ts` - Homepage and navigation tests
- `02-training-journey.spec.ts` - Training module journey tests
- `03-watchdog-analyst.spec.ts` - Watchdog analyst workflow tests
- `04-signup-flow.spec.ts` - **NEW** - LOI signup form tests
- `05-training-flow.spec.ts` - **NEW** - Course player and module completion tests
- `06-certification-flow.spec.ts` - **NEW** - Certification exam tests
- `helpers.ts` - Shared test utilities and helper functions

### Data-testid Attributes

Critical UI elements have been tagged with `data-testid` attributes for stable E2E testing:

#### Signup Flow
- `signup-name-input` - Name input field
- `signup-email-input` - Email input field
- `signup-motivation-input` - Motivation textarea
- `signup-submit-button` - Form submission button

#### Training Flow
- `course-previous-button` - Navigate to previous module
- `course-next-button` - Navigate to next module
- `course-mark-complete-button` - Mark module as complete
- `course-download-certificate-button` - Download course certificate

#### Certification Exam
- `exam-start-real-button` - Start real certification exam
- `exam-start-practice-button` - Start practice mode
- `exam-submit-button` - Submit exam answers

#### Workbench
- `workbench-submit-decision-button` - Submit analyst decision

### Writing New Tests

Use the `TestHelpers` class for common operations:

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate
    await page.goto('/my-page');
    await helpers.waitForNavigation();
    
    // Interact with elements
    await page.click('[data-testid="my-button"]');
    
    // Verify results
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid for critical elements** - More stable than text or CSS selectors
2. **Wait for navigation** - Always wait for page loads to complete
3. **Handle async operations** - Use proper timeouts and wait conditions
4. **Test user journeys** - Focus on complete flows, not individual components
5. **Keep tests independent** - Each test should be able to run in isolation
6. **Use descriptive test names** - Clearly state what is being tested

## Unit Testing with Vitest

### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/routers/__tests__/applications.test.ts
```

### Test Coverage

Current unit test coverage includes:
- Backend routers (14+ test files)
- Database operations
- API endpoints
- Business logic

## Database Query Performance Monitoring

### Overview

The query performance monitoring system tracks slow database queries (>500ms) to help identify bottlenecks as data grows.

### Usage

Wrap database queries with the monitoring function:

```typescript
import { monitorQuery } from "../middleware/queryPerformanceMonitor";

// Wrap your query
const reports = await monitorQuery(
  "watchdog.list",
  async () => db
    .select()
    .from(watchdogReports)
    .where(eq(watchdogReports.isPublic, 1))
    .orderBy(desc(watchdogReports.createdAt))
    .limit(50),
  { limit: 50 } // Optional: query parameters for debugging
);
```

### Viewing Performance Metrics

Access the performance monitoring API via tRPC:

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

### Console Output

When a slow query is detected, you'll see:

```
[SLOW QUERY] dashboard.getStats took 750ms {
  params: '{"userId":123}',
  timestamp: '2026-01-03T23:54:00.000Z'
}
```

### Performance Optimization

When you identify slow queries:

1. **Add indexes** - Create database indexes on frequently queried columns
2. **Optimize joins** - Reduce the number of joins or use more efficient strategies
3. **Limit result sets** - Add pagination or limit clauses
4. **Cache results** - Use caching for frequently accessed, rarely changing data
5. **Denormalize data** - Consider denormalizing for read-heavy operations

See `server/middleware/QUERY_MONITORING_USAGE.md` for detailed usage examples.

## Test Coverage Goals

### Current Coverage
- ✅ Homepage and navigation
- ✅ Training journey
- ✅ Watchdog analyst workflow
- ✅ Signup flow (LOI submission)
- ✅ Training module completion
- ✅ Certification exam flow
- ✅ Backend API endpoints (unit tests)

### Future Coverage
- ⏳ Workbench case review flow
- ⏳ End-to-end analyst journey (signup → training → certification → workbench)
- ⏳ Admin panel operations
- ⏳ Payment and subscription flows
- ⏳ Multi-language support

## Continuous Integration

E2E tests can be run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm test:e2e
  env:
    CI: true
```

## Debugging Tests

### Take Screenshots

```typescript
await helpers.screenshot('debug-state');
```

### Run in Headed Mode

```bash
pnpm test:e2e:headed
```

### Use Playwright Inspector

```bash
PWDEBUG=1 pnpm test:e2e
```

### View Test Reports

After running tests, open the HTML report:

```bash
pnpm exec playwright show-report
```

## Troubleshooting

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if dev server is starting correctly
- Verify database connections

### Flaky Tests
- Add proper wait conditions
- Use `data-testid` instead of text selectors
- Ensure tests are independent

### Database Issues
- Check database connection in test environment
- Verify test data is properly seeded
- Use transactions for test isolation

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
