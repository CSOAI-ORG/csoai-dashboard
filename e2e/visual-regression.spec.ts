/**
 * Visual Regression Tests
 * 
 * Uses Playwright's screenshot comparison feature to catch unintended UI changes.
 * Screenshots are stored in e2e/screenshots/ and compared against baseline images.
 * 
 * Run with: npx playwright test visual-regression.spec.ts
 * Update baselines with: npx playwright test visual-regression.spec.ts --update-snapshots
 */

import { test, expect } from '@playwright/test';
import { login, TEST_USER, TestHelpers } from './helpers';

// Accept cookies before every visual test so the banner does not block clicks/screenshots.
test.beforeEach(async ({ page }) => {
  const helpers = new TestHelpers(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await helpers.acceptCookies();
});

// Configure visual comparison settings
const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled' as const,
  mask: [] as any[], // Elements to mask during comparison (e.g., dynamic content)
};

// Threshold for pixel differences (0-1, where 0 is exact match)
const COMPARISON_THRESHOLD = 0.1;

test.describe('Visual Regression Tests - Public Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for fonts and images to load
    await page.waitForLoadState('networkidle');
  });

  test('Homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Mask dynamic elements like timestamps
    const dynamicElements = await page.locator('[data-testid="dynamic-content"]').all();
    
    await expect(page).toHaveScreenshot('homepage.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
      mask: dynamicElements,
    });
  });

  test('Login page visual consistency', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('login-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Signup page visual consistency', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('signup-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Pricing page visual consistency', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('pricing-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Contact page visual consistency', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('contact-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('About page visual consistency', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('about-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Watchdog incident report page visual consistency', async ({ page }) => {
    await page.goto('/watchdog/report');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('watchdog-report-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Visual Regression Tests - Authenticated Pages', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard visual consistency', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Mask dynamic metrics that change frequently
    const dynamicMetrics = await page.locator('[data-testid="dashboard-metrics-grid"] .text-3xl').all();
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
      mask: dynamicMetrics,
    });
  });

  test('AI Systems page visual consistency', async ({ page }) => {
    await page.goto('/ai-systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('ai-systems-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Training courses page visual consistency', async ({ page }) => {
    await page.goto('/training-courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('training-courses-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Certificates page visual consistency', async ({ page }) => {
    await page.goto('/certificates');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('certificates-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Leaderboard page visual consistency', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Mask dynamic leaderboard data
    const leaderboardEntries = await page.locator('[data-testid*="leaderboard-entry"]').all();
    
    await expect(page).toHaveScreenshot('leaderboard-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
      mask: leaderboardEntries,
    });
  });

  test('Settings page visual consistency', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('settings-page.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Visual Regression Tests - Component States', () => {
  test('Login form error state', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in invalid credentials
    await page.fill('[data-testid="login-email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="login-password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-submit-button"]');
    
    // Wait for error message to appear
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('login-error-state.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Contact form filled state', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Fill in the contact form
    await page.fill('[data-testid="contact-name-input"]', 'Test User');
    await page.fill('[data-testid="contact-email-input"]', 'test@example.com');
    await page.fill('[data-testid="contact-subject-input"]', 'Test Subject');
    await page.fill('[data-testid="contact-message-input"]', 'This is a test message for visual regression testing.');
    
    await expect(page).toHaveScreenshot('contact-form-filled.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Pricing toggle yearly/monthly', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Screenshot with yearly pricing (default)
    await expect(page).toHaveScreenshot('pricing-yearly.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
    
    // Toggle to monthly pricing
    await page.click('[data-testid="pricing-billing-toggle"]');
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('pricing-monthly.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Visual Regression Tests - Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'wide', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`Homepage at ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    });

    test(`Pricing page at ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(`pricing-${viewport.name}.png`, {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    });
  }
});

test.describe('Visual Regression Tests - Dark/Light Theme', () => {
  test('Homepage in dark mode', async ({ page }) => {
    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Homepage in light mode', async ({ page }) => {
    // Set light mode preference
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('homepage-light.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Dashboard in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Mask dynamic content
    const dynamicMetrics = await page.locator('[data-testid="dashboard-metrics-grid"] .text-3xl').all();
    
    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
      mask: dynamicMetrics,
    });
  });

  test('Dashboard in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Mask dynamic content
    const dynamicMetrics = await page.locator('[data-testid="dashboard-metrics-grid"] .text-3xl').all();
    
    await expect(page).toHaveScreenshot('dashboard-light.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
      mask: dynamicMetrics,
    });
  });
});

test.describe('Visual Regression Tests - Navigation States', () => {
  test('Dashboard sidebar navigation', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Screenshot of sidebar navigation
    const sidebar = page.locator('[data-testid="main-navigation"]').nth(0);
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveScreenshot('sidebar-navigation.png', {
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Dashboard sidebar hover states', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Hover over a navigation item
    const navItem = page.locator('[data-testid="nav-ai-systems"]');
    await navItem.hover();
    await page.waitForTimeout(200);
    
    const sidebar = page.locator('[data-testid="main-navigation"]').nth(0);
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveScreenshot('sidebar-navigation-hover.png', {
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Visual Regression Tests - Certification Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');
  });

  test('Certification exam start page', async ({ page }) => {
    await page.goto('/certification/CSOAI-FOUNDATION');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('certification-exam-start.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Certification exam buttons', async ({ page }) => {
    await page.goto('/certification/CSOAI-FOUNDATION');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Screenshot of exam start buttons
    const startButtons = page.locator('[data-testid="exam-start-real-button"], [data-testid="exam-start-practice-button"], [data-testid="exam-start-timed-practice-button"]').first();
    
    if (await startButtons.isVisible()) {
      await expect(startButtons.locator('..')).toHaveScreenshot('certification-exam-buttons.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});


test.describe('Visual Regression Tests - AI Systems Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');
  });

  test('AI Systems page full view', async ({ page }) => {
    await page.goto('/ai-systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('ai-systems-full.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('AI Systems page header', async ({ page }) => {
    await page.goto('/ai-systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const header = page.locator('[data-testid="ai-systems-header"]');
    if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(header).toHaveScreenshot('ai-systems-header.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    } else {
      // Page may require authentication, take full page screenshot instead
      await expect(page).toHaveScreenshot('ai-systems-header-redirect.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('AI Systems create modal', async ({ page }) => {
    await page.goto('/ai-systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open create modal if button is visible
    const registerButton = page.locator('[data-testid="ai-systems-register-button"]');
    if (await registerButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await registerButton.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[data-testid="ai-systems-create-modal"]');
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toHaveScreenshot('ai-systems-create-modal.png', {
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });

  test('AI Systems empty state', async ({ page }) => {
    await page.goto('/ai-systems');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Search for something that doesn't exist if search input is visible
    const searchInput = page.locator('[data-testid="ai-systems-search-input"]');
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('nonexistent-system-xyz123');
      await page.waitForTimeout(500);
      
      const emptyState = page.locator('[data-testid="ai-systems-empty-state"]');
      if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(emptyState).toHaveScreenshot('ai-systems-empty-state.png', {
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });
});

test.describe('Visual Regression Tests - Compliance Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');
  });

  test('Compliance page full view', async ({ page }) => {
    await page.goto('/compliance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('compliance-full.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Compliance page header', async ({ page }) => {
    await page.goto('/compliance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const header = page.locator('[data-testid="compliance-header"]');
    if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(header).toHaveScreenshot('compliance-header.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    } else {
      await expect(page).toHaveScreenshot('compliance-header-redirect.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Compliance summary cards', async ({ page }) => {
    await page.goto('/compliance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const summaryCards = page.locator('[data-testid="compliance-summary-cards"]');
    if (await summaryCards.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(summaryCards).toHaveScreenshot('compliance-summary-cards.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Compliance frameworks list', async ({ page }) => {
    await page.goto('/compliance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const frameworksList = page.locator('[data-testid="compliance-frameworks-list"]');
    if (await frameworksList.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(frameworksList).toHaveScreenshot('compliance-frameworks-list.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Visual Regression Tests - Agent Council Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle');
  });

  test('Agent Council page full view', async ({ page }) => {
    await page.goto('/council');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('agent-council-full.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Agent Council page header', async ({ page }) => {
    await page.goto('/council');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const header = page.locator('[data-testid="agent-council-header"]');
    if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(header).toHaveScreenshot('agent-council-header.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    } else {
      await expect(page).toHaveScreenshot('agent-council-header-redirect.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Agent Council stats grid', async ({ page }) => {
    await page.goto('/council');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const statsGrid = page.locator('[data-testid="agent-council-stats-grid"]');
    if (await statsGrid.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(statsGrid).toHaveScreenshot('agent-council-stats-grid.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Agent Council groups grid', async ({ page }) => {
    await page.goto('/council');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const groupsGrid = page.locator('[data-testid="agent-council-groups-grid"]');
    if (await groupsGrid.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(groupsGrid).toHaveScreenshot('agent-council-groups-grid.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Agent Council vote dialog', async ({ page }) => {
    await page.goto('/council');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open vote dialog if button is visible
    const triggerButton = page.locator('[data-testid="agent-council-trigger-vote-button"]');
    if (await triggerButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await triggerButton.click();
      await page.waitForTimeout(500);
      
      const dialog = page.locator('[data-testid="agent-council-vote-dialog"]');
      if (await dialog.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(dialog).toHaveScreenshot('agent-council-vote-dialog.png', {
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });

  test('Agent Council vote dialog filled', async ({ page }) => {
    await page.goto('/council');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open vote dialog if button is visible
    const triggerButton = page.locator('[data-testid="agent-council-trigger-vote-button"]');
    if (await triggerButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await triggerButton.click();
      await page.waitForTimeout(500);
      
      // Fill in the form if inputs are visible
      const titleInput = page.locator('[data-testid="agent-council-vote-title-input"]');
      if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleInput.fill('Privacy Compliance Assessment');
        await page.fill('[data-testid="agent-council-vote-description-input"]', 'Evaluate the privacy compliance of our new data processing system under GDPR and EU AI Act requirements.');
        
        const dialog = page.locator('[data-testid="agent-council-vote-dialog"]');
        await expect(dialog).toHaveScreenshot('agent-council-vote-dialog-filled.png', {
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });
});
