# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the COAI Dashboard using Playwright.

## Overview

The E2E test suite covers critical user journeys across the platform:

- **Homepage & Navigation**: Verifies the promotional banner, countdown timer, and main navigation
- **Training Journey**: Tests course browsing and enrollment flows
- **Watchdog Analyst**: Tests analyst application and workbench functionality

## Running Tests

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Run tests with UI (interactive mode)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed
```

## Test Structure

```
e2e/
├── helpers.ts              # Shared test utilities and helpers
├── 01-homepage.spec.ts     # Homepage and navigation tests
├── 02-training-journey.spec.ts  # Training flow tests
└── 03-watchdog-analyst.spec.ts  # Analyst journey tests
```

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import helpers: `import { TestHelpers } from './helpers';`
3. Use the TestHelpers class for common operations
4. Follow the existing test patterns for consistency

## Test Helpers

The `TestHelpers` class provides common operations:

- `goToHome()` - Navigate to homepage
- `clickElement(selector)` - Wait and click an element
- `fillField(selector, value)` - Fill a form field
- `verifyCountdownTimer()` - Verify countdown timer functionality
- `verifyPromoBanner()` - Verify promotional banner

## CI/CD Integration

Tests are configured to run in CI with:
- Automatic retries (2 attempts)
- HTML report generation
- Screenshots on failure
- Video recording on failure

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions
3. **Keep tests independent** - each test should work in isolation
4. **Use meaningful test descriptions** - describe what the test validates
5. **Clean up test data** - ensure tests don't leave artifacts

## Troubleshooting

- **Tests timing out**: Increase timeout in `playwright.config.ts`
- **Flaky tests**: Add explicit waits or use `waitForLoadState('networkidle')`
- **Element not found**: Check if element is in viewport and visible
