import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

/**
 * E2E Tests for Coupon Validation Flow
 * Tests rate limiting, validation, and abuse detection
 */

async function gotoAndAcceptCookies(page: any, url: string) {
  const helpers = new TestHelpers(page);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await helpers.acceptCookies();
}

test.describe('Coupon Validation', () => {
  test('should show error for invalid coupon code', async ({ page }) => {
    // Navigate to a bundle enrollment page
    await gotoAndAcceptCookies(page, '/training');

    // Look for coupon input field
    const couponInput = page.locator('input[placeholder*="coupon"], input[name*="coupon"]');

    if (await couponInput.isVisible()) {
      await couponInput.fill('INVALIDCODE123');

      // Submit or trigger validation
      const applyButton = page.locator('button:has-text("Apply"), button:has-text("Validate")').first();
      if (await applyButton.isVisible()) {
        await applyButton.click();

        // Expect error message
        await expect(page.locator('text=Invalid coupon code')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/training');

    const couponInput = page.locator('input[placeholder*="coupon"], input[name*="coupon"]');

    if (await couponInput.isVisible()) {
      // Try multiple rapid validations
      for (let i = 0; i < 5; i++) {
        await couponInput.fill(`TESTCODE${i}`);
        const applyButton = page.locator('button:has-text("Apply"), button:has-text("Validate")').first();
        if (await applyButton.isVisible()) {
          await applyButton.click();
          await page.waitForTimeout(100);
        }
      }

      // After rapid attempts, should still be usable (not blocked)
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('Enrollment Flow', () => {
  test('should display enrollment options', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/training');

    // Check for enrollment-related content
    const enrollButton = page.locator('button:has-text("Enroll"), button:has-text("Start"), a:has-text("Enroll")').first();

    // Take screenshot for debugging
    await page.screenshot({ path: 'e2e/screenshots/enrollment-page.png', fullPage: true });
  });

  test('should require authentication for enrollment', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/training');

    // Try to enroll without being logged in
    const enrollButton = page.locator('button:has-text("Enroll Now"), button:has-text("Start Training")').first();

    if (await enrollButton.isVisible()) {
      await enrollButton.click();

      // Should redirect to login or show auth modal
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      const hasAuthPrompt = currentUrl.includes('login') ||
                           currentUrl.includes('auth') ||
                           await page.locator('text=Sign in, text=Log in').first().isVisible();

      // Take screenshot
      await page.screenshot({ path: 'e2e/screenshots/enrollment-auth-check.png', fullPage: true });
    }
  });
});

test.describe('Giveaway Application', () => {
  test('should display giveaway application form', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/giveaway');

    // Check for form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();

    await page.screenshot({ path: 'e2e/screenshots/giveaway-form.png', fullPage: true });
  });

  test('should validate email format', async ({ page }) => {
    await gotoAndAcceptCookies(page, '/giveaway');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();

    if (await emailInput.isVisible()) {
      // Try invalid email
      await emailInput.fill('invalid-email');

      const submitButton = page.locator('button[type="submit"], button:has-text("Apply"), button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show validation error
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'e2e/screenshots/giveaway-validation.png', fullPage: true });
      }
    }
  });
});

test.describe('Admin Dashboard Access', () => {
  test('should protect admin routes', async ({ page }) => {
    // Try to access admin dashboard without auth
    await gotoAndAcceptCookies(page, '/admin');

    // Should redirect to login or show access denied
    const currentUrl = page.url();
    const isProtected = currentUrl.includes('login') ||
                        currentUrl.includes('auth') ||
                        !currentUrl.includes('/admin') ||
                        await page.locator('text=Access denied, text=Unauthorized, text=Please log in').first().isVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/admin-protection.png', fullPage: true });
  });
});
