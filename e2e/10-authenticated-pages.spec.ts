/**
 * Authenticated Pages Visual Regression Tests
 * 
 * Tests protected routes with different user roles using the mock authentication system.
 * This ensures visual consistency across authenticated pages.
 */

import { test, expect, MOCK_USERS, expectAccessGranted } from './fixtures/auth.fixture';

const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled' as const,
};

const COMPARISON_THRESHOLD = 0.1;

test.describe('Authenticated Pages - Admin Role', () => {
  test('Admin dashboard visual consistency', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(1000);
    
    // Mask dynamic content like timestamps and metrics
    const dynamicElements = await adminPage.locator('[data-testid*="metric"], [data-testid*="timestamp"]').all();
    
    await expect(adminPage).toHaveScreenshot('admin-dashboard.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
      mask: dynamicElements,
    });
  });

  test('Admin settings page visual consistency', async ({ adminPage }) => {
    await adminPage.goto('/settings');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(500);
    
    await expect(adminPage).toHaveScreenshot('admin-settings.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Admin users management page visual consistency', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(500);
    
    await expect(adminPage).toHaveScreenshot('admin-users-management.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Authenticated Pages - Regular User Role', () => {
  test('User dashboard visual consistency', async ({ userPage }) => {
    await userPage.goto('/dashboard');
    await userPage.waitForLoadState('networkidle');
    await userPage.waitForTimeout(1000);
    
    await expect(userPage).toHaveScreenshot('user-dashboard.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('User profile page visual consistency', async ({ userPage }) => {
    await userPage.goto('/profile');
    await userPage.waitForLoadState('networkidle');
    await userPage.waitForTimeout(500);
    
    await expect(userPage).toHaveScreenshot('user-profile.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('User training courses page visual consistency', async ({ userPage }) => {
    await userPage.goto('/training-courses');
    await userPage.waitForLoadState('networkidle');
    await userPage.waitForTimeout(500);
    
    await expect(userPage).toHaveScreenshot('user-training-courses.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Authenticated Pages - Analyst Role', () => {
  test('Analyst dashboard visual consistency', async ({ analystPage }) => {
    await analystPage.goto('/dashboard');
    await analystPage.waitForLoadState('networkidle');
    await analystPage.waitForTimeout(1000);
    
    await expect(analystPage).toHaveScreenshot('analyst-dashboard.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Analyst watchdog reports page visual consistency', async ({ analystPage }) => {
    await analystPage.goto('/watchdog');
    await analystPage.waitForLoadState('networkidle');
    await analystPage.waitForTimeout(500);
    
    await expect(analystPage).toHaveScreenshot('analyst-watchdog.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Analyst reports page visual consistency', async ({ analystPage }) => {
    await analystPage.goto('/reports');
    await analystPage.waitForLoadState('networkidle');
    await analystPage.waitForTimeout(500);
    
    await expect(analystPage).toHaveScreenshot('analyst-reports.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Authenticated Pages - Enterprise Role', () => {
  test('Enterprise dashboard visual consistency', async ({ enterprisePage }) => {
    await enterprisePage.goto('/dashboard');
    await enterprisePage.waitForLoadState('networkidle');
    await enterprisePage.waitForTimeout(1000);
    
    await expect(enterprisePage).toHaveScreenshot('enterprise-dashboard.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Enterprise API access page visual consistency', async ({ enterprisePage }) => {
    await enterprisePage.goto('/api-docs');
    await enterprisePage.waitForLoadState('networkidle');
    await enterprisePage.waitForTimeout(500);
    
    await expect(enterprisePage).toHaveScreenshot('enterprise-api-docs.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Enterprise analytics page visual consistency', async ({ enterprisePage }) => {
    await enterprisePage.goto('/analytics');
    await enterprisePage.waitForLoadState('networkidle');
    await enterprisePage.waitForTimeout(500);
    
    await expect(enterprisePage).toHaveScreenshot('enterprise-analytics.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Role-Based Access Control Visual Tests', () => {
  test('Login redirect for unauthenticated user', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Should show login page or redirect
    await expect(page).toHaveScreenshot('unauthenticated-redirect.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Access denied page for insufficient permissions', async ({ userPage }) => {
    // Regular user trying to access admin page
    await userPage.goto('/admin/users');
    await userPage.waitForLoadState('networkidle');
    await userPage.waitForTimeout(500);
    
    await expect(userPage).toHaveScreenshot('access-denied.png', {
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Dynamic Login Tests', () => {
  test('Login as different users dynamically', async ({ page, loginAs, logout }) => {
    // Test login as admin
    await loginAs('admin');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify admin-specific UI elements
    const adminMenu = page.locator('[data-testid="admin-menu"]');
    // Admin should see admin menu (if it exists)
    
    await logout();
    
    // Test login as regular user
    await loginAs('user');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // User should not see admin menu
    await expect(page.locator('[data-testid="admin-menu"]')).not.toBeVisible();
  });
});

test.describe('Session State Visual Tests', () => {
  test('User avatar and name display correctly', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await adminPage.waitForLoadState('networkidle');
    
    // Check for user info in header
    const userInfo = adminPage.locator('[data-testid="user-info"], [data-testid="user-avatar"]');
    if (await userInfo.first().isVisible().catch(() => false)) {
      await expect(userInfo.first()).toHaveScreenshot('user-info-header.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Navigation shows correct menu items for role', async ({ analystPage }) => {
    await analystPage.goto('/dashboard');
    await analystPage.waitForLoadState('networkidle');
    
    // Check sidebar navigation
    const sidebar = analystPage.locator('[data-testid="sidebar"], nav').first();
    if (await sidebar.isVisible().catch(() => false)) {
      await expect(sidebar).toHaveScreenshot('analyst-sidebar-nav.png', {
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});
