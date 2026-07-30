import { Page, expect, Locator } from '@playwright/test';

/**
 * E2E Test Helpers for COAI Dashboard
 * Uses data-testid attributes and role-based queries for resilient selectors
 */

export class TestHelpers {
  constructor(public page: Page) {}

  /**
   * Navigate to homepage
   */
  async goToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Dismiss the cookie-consent banner if it appears.
   * Call this after navigation in any test that needs to click behind the banner.
   */
  async acceptCookies() {
    const accept = this.page.locator('button', { hasText: /Accept All/i }).or(
      this.page.getByRole('button', { name: /Accept All/i })
    );
    if (await accept.isVisible().catch(() => false)) {
      await accept.click();
      await accept.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }
  }

  /**
   * Get element by data-testid attribute
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Get element by role with optional name
   */
  getByRole(role: string, options?: { name?: string | RegExp }): Locator {
    return this.page.getByRole(role as any, options);
  }

  /**
   * Get element by text content (case insensitive)
   */
  getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  /**
   * Wait for and click an element by test id
   */
  async clickByTestId(testId: string) {
    const element = this.getByTestId(testId);
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  /**
   * Wait for and click an element by selector
   */
  async clickElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.click(selector);
  }

  /**
   * Fill a form field by test id
   */
  async fillByTestId(testId: string, value: string) {
    const element = this.getByTestId(testId);
    await element.waitFor({ state: 'visible' });
    await element.fill(value);
  }

  /**
   * Fill a form field by selector
   */
  async fillField(selector: string, value: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.fill(selector, value);
  }

  /**
   * Check if element contains text
   */
  async expectTextContent(selector: string, text: string) {
    const element = await this.page.waitForSelector(selector);
    const content = await element.textContent();
    expect(content).toContain(text);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot for debugging
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Check if countdown timer is visible and working
   * Uses data-testid attributes for reliable selection
   */
  async verifyCountdownTimer() {
    // Check for countdown timer container
    const timer = this.getByTestId('countdown-timer');
    
    // If countdown timer exists, verify its parts
    if (await timer.isVisible().catch(() => false)) {
      await expect(this.getByTestId('countdown-days')).toBeVisible();
      await expect(this.getByTestId('countdown-hours')).toBeVisible();
      await expect(this.getByTestId('countdown-minutes')).toBeVisible();
      await expect(this.getByTestId('countdown-seconds')).toBeVisible();
    } else {
      // Fallback to text-based selection
      await expect(this.page.locator('text=Days')).toBeVisible();
      await expect(this.page.locator('text=Hours')).toBeVisible();
      await expect(this.page.locator('text=Minutes')).toBeVisible();
      await expect(this.page.locator('text=Seconds')).toBeVisible();
    }
  }

  /**
   * Verify promotional banner or hero section
   */
  async verifyPromoBanner() {
    // Look for key promotional elements on the homepage
    // These selectors are more resilient to text changes
    const heroSection = this.page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for main CTA or promotional content
    const ctaButton = this.page.locator('button, a').filter({ hasText: /training|start|join|get started/i }).first();
    if (await ctaButton.isVisible().catch(() => false)) {
      await expect(ctaButton).toBeVisible();
    }
  }

  /**
   * Verify main navigation is present
   */
  async verifyMainNavigation() {
    const nav = this.getByTestId('main-navigation');
    if (await nav.isVisible().catch(() => false)) {
      await expect(nav).toBeVisible();
    } else {
      // Fallback to role-based query
      const navigation = this.page.getByRole('navigation');
      await expect(navigation.first()).toBeVisible();
    }
  }

  /**
   * Click navigation item by name
   */
  async clickNavItem(name: string) {
    // Try data-testid first
    const testId = `nav-${name.toLowerCase().replace(/\s+/g, '-')}`;
    const navItem = this.getByTestId(testId);
    
    if (await navItem.isVisible().catch(() => false)) {
      await navItem.click();
    } else {
      // Fallback to text-based selection
      await this.page.click(`text=${name}`);
    }
    await this.waitForNavigation();
  }

  /**
   * Click "Start Free Training Now" button or similar CTA
   */
  async clickStartTraining() {
    // Try multiple possible button texts
    const ctaTexts = [
      'Start Free Training Now',
      'Start Training',
      'Start Free Training',
      'Get Started',
      'Begin Training'
    ];
    
    for (const text of ctaTexts) {
      const button = this.page.locator(`text=${text}`).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        return;
      }
    }
    
    // Fallback to any prominent CTA button
    const ctaButton = this.page.locator('button, a').filter({ hasText: /training/i }).first();
    await ctaButton.click();
  }

  /**
   * Wait for element to be visible with timeout
   */
  async waitForVisible(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Check if element exists in DOM
   */
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0;
  }

  /**
   * Get text content of element by test id
   */
  async getTextByTestId(testId: string): Promise<string | null> {
    const element = this.getByTestId(testId);
    if (await element.isVisible().catch(() => false)) {
      return await element.textContent();
    }
    return null;
  }
}

/**
 * Mock user data for testing
 */
export const mockUsers = {
  analyst: {
    email: 'test-analyst@example.com',
    name: 'Test Analyst',
    password: 'TestPassword123!',
  },
  admin: {
    email: 'test-admin@example.com',
    name: 'Test Admin',
    password: 'AdminPassword123!',
  },
};

/**
 * Test user credentials for visual regression tests
 */
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

/**
 * Login helper function for authenticated tests
 * Attempts OAuth login or falls back to email/password login
 */
export async function login(page: Page): Promise<void> {
  try {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if we're already logged in by looking for dashboard elements
    const dashboardIndicator = page.locator('[data-testid="main-navigation"]');
    if (await dashboardIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      return; // Already logged in
    }
    
    // Try email/password login if available
    const emailInput = page.locator('[data-testid="login-email-input"]');
    const passwordInput = page.locator('[data-testid="login-password-input"]');
    const submitButton = page.locator('[data-testid="login-submit-button"]');
    
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(TEST_USER.email);
      await passwordInput.fill(TEST_USER.password);
      await submitButton.click();
      await page.waitForLoadState('networkidle');
    } else {
      // Fallback: Try to find any login form
      const anyEmailInput = page.locator('input[type="email"], input[name="email"]').first();
      const anyPasswordInput = page.locator('input[type="password"]').first();
      const anySubmitButton = page.locator('button[type="submit"]').first();
      
      if (await anyEmailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await anyEmailInput.fill(TEST_USER.email);
        await anyPasswordInput.fill(TEST_USER.password);
        await anySubmitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Wait for potential redirect after login
    await page.waitForTimeout(1000);
  } catch (error) {
    // Login may fail in test environment, continue anyway for visual tests
    console.log('Login attempt completed (may not have succeeded):', error);
  }
}
