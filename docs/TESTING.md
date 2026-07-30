# Testing Infrastructure Documentation

This document describes the testing infrastructure for the COAI Dashboard project, including visual regression testing, authentication mocking, and CI/CD pipeline configuration.

## Table of Contents

1. [Overview](#overview)
2. [Test Types](#test-types)
3. [Authentication Mock System](#authentication-mock-system)
4. [Visual Regression Testing](#visual-regression-testing)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Running Tests Locally](#running-tests-locally)
7. [Updating Baselines](#updating-baselines)

## Overview

The COAI Dashboard uses a comprehensive testing strategy that includes:

- **Unit Tests**: Vitest-based tests for server-side logic
- **E2E Tests**: Playwright-based end-to-end tests for user flows
- **Visual Regression Tests**: Screenshot comparison tests to catch UI changes
- **Authenticated Page Tests**: Tests for protected routes using mock authentication

## Test Types

### Unit Tests

Located in `server/__tests__/`, these tests verify server-side business logic.

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test -- --coverage
```

### E2E Tests

Located in `e2e/`, these tests verify complete user journeys.

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode
pnpm test:e2e:ui

# Run headed (visible browser)
pnpm test:e2e:headed
```

### Visual Regression Tests

Located in `e2e/visual-regression.spec.ts` and `e2e/11-component-visual-regression.spec.ts`.

```bash
# Run visual regression tests
npx playwright test visual-regression.spec.ts 11-component-visual-regression.spec.ts

# Update baseline screenshots
npx playwright test visual-regression.spec.ts --update-snapshots
```

## Authentication Mock System

The authentication mock system allows testing of protected routes without requiring actual OAuth or database authentication.

### Files

- `e2e/auth-mock.ts` - Core authentication mock implementation
- `e2e/fixtures/auth.fixture.ts` - Playwright test fixtures for authentication
- `e2e/10-authenticated-pages.spec.ts` - Tests using the auth mock

### Available Mock Users

| User Key | Role | Subscription | Permissions |
|----------|------|--------------|-------------|
| `admin` | Admin | Enterprise | Full access |
| `user` | User | Free | Basic access |
| `analyst` | Analyst | Pro | Reports, Watchdog |
| `instructor` | Instructor | Pro | Course management |
| `enterprise` | Enterprise | Enterprise | API access, bulk ops |
| `expiredUser` | User | Expired Pro | Limited access |

### Usage Example

```typescript
import { test, expect, MOCK_USERS } from './fixtures/auth.fixture';

test.describe('Admin Dashboard', () => {
  test('Admin can access user management', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await expect(adminPage).toHaveURL('/admin/users');
  });
});

test.describe('Dynamic Login', () => {
  test('Switch between users', async ({ page, loginAs, logout }) => {
    await loginAs('admin');
    // Test admin features
    
    await logout();
    
    await loginAs('user');
    // Test user features
  });
});
```

### Creating Custom Users

```typescript
import { createCustomUser } from './auth-mock';

const customUser = createCustomUser({
  email: 'custom@test.com',
  name: 'Custom User',
  role: 'analyst',
  permissions: ['reports:view', 'reports:create'],
});
```

## Visual Regression Testing

### How It Works

1. Screenshots are taken of pages/components during test runs
2. Screenshots are compared against baseline images stored in `e2e/screenshots/`
3. If differences exceed the threshold (10%), the test fails
4. Diff images are generated showing the changes

### Test Categories

#### Page-Level Tests (`visual-regression.spec.ts`)

- Public pages (homepage, login, pricing, etc.)
- Authenticated pages (dashboard, settings, etc.)
- Responsive design (mobile, tablet, desktop, wide)
- Theme variants (light/dark mode)
- Component states (error, loading, filled forms)

#### Component-Level Tests (`11-component-visual-regression.spec.ts`)

- Button variants and states
- Card components
- Form components (inputs, checkboxes, switches)
- Badge and alert variants
- Dialog/modal components
- Table components
- Navigation components (tabs, accordion, breadcrumb)
- Avatar and progress components
- Tooltip components

### Screenshot Options

```typescript
const SCREENSHOT_OPTIONS = {
  fullPage: true,           // Capture entire page
  animations: 'disabled',   // Disable animations for consistency
};

const COMPARISON_THRESHOLD = 0.1;  // 10% pixel difference allowed
```

### Masking Dynamic Content

For elements that change frequently (timestamps, metrics):

```typescript
const dynamicElements = await page.locator('[data-testid="timestamp"]').all();

await expect(page).toHaveScreenshot('page.png', {
  mask: dynamicElements,
});
```

## CI/CD Pipeline

### Workflow Files

- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/visual-regression.yml` - Visual regression specific workflow

### Pipeline Jobs

| Job | Description | Trigger |
|-----|-------------|---------|
| `lint-and-typecheck` | TypeScript and format checks | All PRs and pushes |
| `unit-tests` | Vitest unit tests | After lint passes |
| `e2e-tests` | Playwright E2E tests | After unit tests |
| `visual-regression` | Screenshot comparison tests | After unit tests |
| `authenticated-tests` | Protected route tests | After unit tests |
| `build` | Production build check | After lint passes |

### Triggering the Pipeline

The pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`

### Viewing Results

1. Go to the repository's Actions tab
2. Select the workflow run
3. Download artifacts for detailed results:
   - `visual-regression-results` - Screenshots and diffs
   - `e2e-test-results` - E2E test reports
   - `unit-test-coverage` - Coverage reports

## Running Tests Locally

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install chromium --with-deps
```

### Running Different Test Suites

```bash
# Unit tests
pnpm test

# All E2E tests
pnpm test:e2e

# Visual regression only
npx playwright test visual-regression.spec.ts

# Component visual tests only
npx playwright test 11-component-visual-regression.spec.ts

# Authenticated page tests only
npx playwright test 10-authenticated-pages.spec.ts

# Specific test file
npx playwright test e2e/01-homepage.spec.ts
```

### Debug Mode

```bash
# Run with Playwright UI
pnpm test:e2e:ui

# Run headed (visible browser)
pnpm test:e2e:headed

# Debug specific test
npx playwright test --debug e2e/visual-regression.spec.ts
```

## Updating Baselines

When UI changes are intentional, update the baseline screenshots:

### Local Update

```bash
# Update all visual regression baselines
npx playwright test visual-regression.spec.ts --update-snapshots

# Update component baselines
npx playwright test 11-component-visual-regression.spec.ts --update-snapshots

# Update specific test
npx playwright test visual-regression.spec.ts -g "Homepage" --update-snapshots
```

### Via GitHub Actions

1. Go to Actions tab
2. Select "Visual Regression Tests" workflow
3. Click "Run workflow"
4. Select "update-baselines" job
5. A PR will be created with updated screenshots

### Best Practices

1. **Review all changes** before committing updated baselines
2. **Run tests locally** before pushing to catch issues early
3. **Use meaningful test names** for easy identification of failures
4. **Mask dynamic content** to avoid false positives
5. **Keep threshold reasonable** (0.1 = 10% is a good default)

## Troubleshooting

### Common Issues

#### Tests fail with "Screenshot comparison failed"

1. Check if the UI change was intentional
2. Review the diff image in `test-results/`
3. If intentional, update baselines with `--update-snapshots`

#### Authentication mock not working

1. Ensure the page has loaded before calling `loginAs()`
2. Check that `setupApiMocks()` is called after login
3. Verify localStorage is accessible (not in incognito mode)

#### CI pipeline fails but local tests pass

1. Check for environment differences (Node version, OS)
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set in CI

### Getting Help

- Check existing test files for examples
- Review Playwright documentation: https://playwright.dev/docs/test-snapshots
- Check Vitest documentation: https://vitest.dev/guide/
