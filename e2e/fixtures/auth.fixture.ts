/**
 * Playwright Test Fixtures for Authentication
 * 
 * Provides reusable fixtures for testing authenticated scenarios
 * with different user roles.
 */

import { test as base, expect, Page, BrowserContext } from '@playwright/test';
import { AuthMock, MOCK_USERS, MockUser } from '../auth-mock';

/**
 * Extended test fixtures with authentication support
 */
type AuthFixtures = {
  /** AuthMock instance for the current page */
  authMock: AuthMock;
  
  /** Page authenticated as admin user */
  adminPage: Page;
  
  /** Page authenticated as regular user */
  userPage: Page;
  
  /** Page authenticated as analyst */
  analystPage: Page;
  
  /** Page authenticated as instructor */
  instructorPage: Page;
  
  /** Page authenticated as enterprise user */
  enterprisePage: Page;
  
  /** Helper to login as any user */
  loginAs: (userKey: keyof typeof MOCK_USERS) => Promise<void>;
  
  /** Helper to logout current user */
  logout: () => Promise<void>;
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Basic auth mock for the default page
  authMock: async ({ page }, use) => {
    const auth = new AuthMock(page);
    await use(auth);
  },

  // Pre-authenticated admin page
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthMock(page);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await auth.loginAs('admin');
    await auth.setupApiMocks();
    
    await use(page);
    
    await auth.logout();
    await context.close();
  },

  // Pre-authenticated regular user page
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthMock(page);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await auth.loginAs('user');
    await auth.setupApiMocks();
    
    await use(page);
    
    await auth.logout();
    await context.close();
  },

  // Pre-authenticated analyst page
  analystPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthMock(page);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await auth.loginAs('analyst');
    await auth.setupApiMocks();
    
    await use(page);
    
    await auth.logout();
    await context.close();
  },

  // Pre-authenticated instructor page
  instructorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthMock(page);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await auth.loginAs('instructor');
    await auth.setupApiMocks();
    
    await use(page);
    
    await auth.logout();
    await context.close();
  },

  // Pre-authenticated enterprise user page
  enterprisePage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthMock(page);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await auth.loginAs('enterprise');
    await auth.setupApiMocks();
    
    await use(page);
    
    await auth.logout();
    await context.close();
  },

  // Helper to login as any user on the current page
  loginAs: async ({ page }, use) => {
    const auth = new AuthMock(page);
    
    const loginFn = async (userKey: keyof typeof MOCK_USERS) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      await auth.loginAs(userKey);
      await auth.setupApiMocks();
    };
    
    await use(loginFn);
  },

  // Helper to logout on the current page
  logout: async ({ page }, use) => {
    const auth = new AuthMock(page);
    
    const logoutFn = async () => {
      await auth.logout();
    };
    
    await use(logoutFn);
  },
});

export { expect };
export { MOCK_USERS, type MockUser };

/**
 * Test helper to verify user has access to a protected route
 */
export async function expectAccessGranted(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  
  // Should not be redirected to login
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('/login');
  expect(currentUrl).not.toContain('/unauthorized');
}

/**
 * Test helper to verify user is denied access to a protected route
 */
export async function expectAccessDenied(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  
  // Should be redirected to login or show unauthorized
  const currentUrl = page.url();
  const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/unauthorized');
  const hasErrorMessage = await page.locator('text=/unauthorized|access denied|permission/i').isVisible().catch(() => false);
  
  expect(isRedirected || hasErrorMessage).toBeTruthy();
}

/**
 * Test helper to verify specific permission is required
 */
export async function expectPermissionRequired(
  page: Page,
  route: string,
  permission: string
): Promise<void> {
  const auth = new AuthMock(page);
  const hasPermission = await auth.hasPermission(permission);
  
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  
  if (hasPermission) {
    await expectAccessGranted(page, route);
  } else {
    await expectAccessDenied(page, route);
  }
}
