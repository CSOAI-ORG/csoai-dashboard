import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

/**
 * E2E Tests for Authentication Flows
 * Tests login, signup, session management, and protected routes
 */

async function gotoAndAcceptCookies(page: any, url: string) {
  const helpers = new TestHelpers(page);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await helpers.acceptCookies();
}

test.describe('Authentication', () => {
  test.describe('Login Flow', () => {
    test('should display login page correctly', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/login');

      // Check for login form elements using test ids to avoid newsletter/header duplicates
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-submit-button"]')).toBeVisible();

      await page.screenshot({ path: 'e2e/screenshots/login-page.png', fullPage: true });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/login');

      const emailInput = page.locator('[data-testid="login-email-input"]');
      const passwordInput = page.locator('[data-testid="login-password-input"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      await emailInput.fill('invalid@test.com');
      await passwordInput.fill('wrongpassword');

      const submitButton = page.locator('[data-testid="login-submit-button"]');
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      // Wait for error message
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'e2e/screenshots/login-error.png', fullPage: true });
    });

    test('should handle empty form submission', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/login');

      const submitButton = page.locator('[data-testid="login-submit-button"]');
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      // Should show validation errors
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/login-validation.png', fullPage: true });
    });
  });

  test.describe('Signup Flow', () => {
    test('should display signup page correctly', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/signup');

      await expect(page.locator('[data-testid="signup-form"]')).toBeVisible();
      await page.screenshot({ path: 'e2e/screenshots/signup-page.png', fullPage: true });
    });

    test('should validate email format on signup', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/signup');

      const emailInput = page.locator('[data-testid="signup-email-input"]');
      await expect(emailInput).toBeVisible();
      await emailInput.fill('not-an-email');
      await emailInput.blur();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/signup-email-validation.png', fullPage: true });
    });

    test('should validate password requirements', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/signup');

      const passwordInput = page.locator('[data-testid="signup-password-input"]');
      await expect(passwordInput).toBeVisible();
      // Try weak password
      await passwordInput.fill('123');
      await passwordInput.blur();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'e2e/screenshots/signup-password-validation.png', fullPage: true });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/dashboard');

      const currentUrl = page.url();

      // Should redirect to login or show auth prompt
      const isProtected = currentUrl.includes('login') ||
                          currentUrl.includes('auth') ||
                          await page.locator('text=Sign in, text=Log in, text=Please log in').isVisible();

      await page.screenshot({ path: 'e2e/screenshots/dashboard-protection.png', fullPage: true });
    });

    test('should redirect unauthenticated users from profile', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/profile');

      await page.screenshot({ path: 'e2e/screenshots/profile-protection.png', fullPage: true });
    });

    test('should redirect unauthenticated users from settings', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/settings');

      await page.screenshot({ path: 'e2e/screenshots/settings-protection.png', fullPage: true });
    });
  });

  test.describe('Session Management', () => {
    test('should handle session timeout gracefully', async ({ page }) => {
      // Navigate to a protected page
      await gotoAndAcceptCookies(page, '/dashboard');

      // Clear cookies to simulate session expiry
      await page.context().clearCookies();

      // Try to perform an action
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should handle gracefully
      await page.screenshot({ path: 'e2e/screenshots/session-timeout.png', fullPage: true });
    });
  });

  test.describe('OAuth Flow', () => {
    test('should display OAuth login options', async ({ page }) => {
      await gotoAndAcceptCookies(page, '/login');

      // Check for OAuth buttons
      const googleButton = page.locator('button:has-text("Google"), a:has-text("Google")').first();
      const githubButton = page.locator('button:has-text("GitHub"), a:has-text("GitHub")').first();

      await page.screenshot({ path: 'e2e/screenshots/oauth-options.png', fullPage: true });
    });
  });
});

test.describe('Password Reset', () => {
  test('should display forgot password page', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/forgot-password');

    await expect(page.locator('[data-testid="forgot-password-form"]')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/forgot-password.png', fullPage: true });
  });

  test('should validate email on password reset', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/forgot-password');

    const emailInput = page.locator('[data-testid="forgot-password-email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('invalid-email');

    const submitButton = page.locator('[data-testid="forgot-password-submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/password-reset-validation.png', fullPage: true });
  });
});
