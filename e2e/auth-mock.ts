/**
 * Authentication Mock System for E2E Testing
 * 
 * Provides mock authentication for testing authenticated pages without
 * requiring actual OAuth or database authentication.
 * 
 * Features:
 * - Mock user sessions with different roles
 * - JWT token generation for API testing
 * - Storage state management for Playwright
 * - Role-based access control testing
 */

import { Page, BrowserContext } from '@playwright/test';
import * as crypto from 'crypto';

/**
 * User roles available in the system
 */
export type UserRole = 'admin' | 'user' | 'analyst' | 'instructor' | 'enterprise';

/**
 * Mock user interface
 */
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: string;
  };
  permissions: string[];
}

/**
 * Authentication state stored in browser
 */
export interface AuthState {
  user: MockUser;
  token: string;
  expiresAt: number;
}

/**
 * Pre-defined mock users for different testing scenarios
 */
export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: 'mock-admin-001',
    email: 'admin@coai-test.com',
    name: 'Test Admin',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T00:00:00Z',
    subscription: {
      plan: 'enterprise',
      status: 'active',
    },
    permissions: [
      'admin:read',
      'admin:write',
      'users:manage',
      'courses:manage',
      'reports:view',
      'analytics:view',
      'settings:manage',
      'billing:manage',
    ],
  },
  user: {
    id: 'mock-user-001',
    email: 'user@coai-test.com',
    name: 'Test User',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    createdAt: '2024-06-01T00:00:00Z',
    subscription: {
      plan: 'free',
      status: 'active',
    },
    permissions: [
      'courses:read',
      'profile:read',
      'profile:write',
    ],
  },
  analyst: {
    id: 'mock-analyst-001',
    email: 'analyst@coai-test.com',
    name: 'Test Analyst',
    role: 'analyst',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst',
    createdAt: '2024-03-15T00:00:00Z',
    subscription: {
      plan: 'pro',
      status: 'active',
    },
    permissions: [
      'courses:read',
      'reports:view',
      'reports:create',
      'watchdog:submit',
      'analytics:view',
      'profile:read',
      'profile:write',
    ],
  },
  instructor: {
    id: 'mock-instructor-001',
    email: 'instructor@coai-test.com',
    name: 'Test Instructor',
    role: 'instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=instructor',
    createdAt: '2024-02-01T00:00:00Z',
    subscription: {
      plan: 'pro',
      status: 'active',
    },
    permissions: [
      'courses:read',
      'courses:create',
      'courses:edit',
      'students:view',
      'analytics:view',
      'profile:read',
      'profile:write',
    ],
  },
  enterprise: {
    id: 'mock-enterprise-001',
    email: 'enterprise@coai-test.com',
    name: 'Enterprise User',
    role: 'enterprise',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=enterprise',
    createdAt: '2024-01-15T00:00:00Z',
    subscription: {
      plan: 'enterprise',
      status: 'active',
      expiresAt: '2025-12-31T23:59:59Z',
    },
    permissions: [
      'courses:read',
      'courses:create',
      'reports:view',
      'reports:create',
      'analytics:view',
      'api:access',
      'bulk:operations',
      'profile:read',
      'profile:write',
    ],
  },
  expiredUser: {
    id: 'mock-expired-001',
    email: 'expired@coai-test.com',
    name: 'Expired User',
    role: 'user',
    createdAt: '2023-01-01T00:00:00Z',
    subscription: {
      plan: 'pro',
      status: 'expired',
      expiresAt: '2024-12-31T23:59:59Z',
    },
    permissions: [
      'courses:read',
      'profile:read',
    ],
  },
};

/**
 * Generate a mock JWT token for testing
 * Note: This is NOT a real JWT - it's a mock for testing purposes
 */
export function generateMockToken(user: MockUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
  })).toString('base64url');
  const signature = crypto.createHash('sha256').update(`${header}.${payload}.mock-secret`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

/**
 * AuthMock class for managing mock authentication in tests
 */
export class AuthMock {
  private page: Page;
  private context: BrowserContext;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }

  /**
   * Login as a specific mock user
   */
  async loginAs(userKey: keyof typeof MOCK_USERS | MockUser): Promise<void> {
    const user = typeof userKey === 'string' ? MOCK_USERS[userKey] : userKey;
    const token = generateMockToken(user);
    
    const authState: AuthState = {
      user,
      token,
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    // Set authentication state in localStorage
    await this.page.evaluate((state) => {
      localStorage.setItem('auth', JSON.stringify(state));
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      
      // Dispatch storage event to notify React components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth',
        newValue: JSON.stringify(state),
      }));
    }, authState);

    // Set cookies for server-side auth
    await this.context.addCookies([
      {
        name: 'auth_token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
      {
        name: 'user_id',
        value: user.id,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth',
        newValue: null,
      }));
    });

    await this.context.clearCookies();
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const auth = localStorage.getItem('auth');
      if (!auth) return false;
      
      try {
        const state = JSON.parse(auth);
        return state.expiresAt > Date.now();
      } catch {
        return false;
      }
    });
  }

  /**
   * Get current user from storage
   */
  async getCurrentUser(): Promise<MockUser | null> {
    return await this.page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });
  }

  /**
   * Check if current user has a specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.permissions.includes(permission) ?? false;
  }

  /**
   * Set up mock API interceptors for authentication endpoints
   */
  async setupApiMocks(): Promise<void> {
    // Mock the /api/auth/me endpoint
    await this.page.route('**/api/auth/me', async (route) => {
      const user = await this.getCurrentUser();
      if (user) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        });
      }
    });

    // Mock the /api/auth/logout endpoint
    await this.page.route('**/api/auth/logout', async (route) => {
      await this.logout();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock the OAuth callback endpoint
    await this.page.route('**/api/auth/callback**', async (route) => {
      const user = MOCK_USERS.user;
      await this.loginAs(user);
      await route.fulfill({
        status: 302,
        headers: {
          Location: '/dashboard',
        },
      });
    });
  }

  /**
   * Create a storage state file for reuse across tests
   */
  async saveStorageState(path: string): Promise<void> {
    await this.context.storageState({ path });
  }
}

/**
 * Helper function to create an authenticated page
 */
export async function createAuthenticatedPage(
  context: BrowserContext,
  userKey: keyof typeof MOCK_USERS = 'user'
): Promise<Page> {
  const page = await context.newPage();
  const auth = new AuthMock(page);
  
  // Navigate to the app first to set up localStorage
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  // Login as the specified user
  await auth.loginAs(userKey);
  await auth.setupApiMocks();
  
  return page;
}

/**
 * Test fixture for authenticated tests
 */
export async function withAuth(
  page: Page,
  userKey: keyof typeof MOCK_USERS,
  testFn: (auth: AuthMock) => Promise<void>
): Promise<void> {
  const auth = new AuthMock(page);
  
  // Navigate to app and set up auth
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await auth.loginAs(userKey);
  await auth.setupApiMocks();
  
  try {
    await testFn(auth);
  } finally {
    await auth.logout();
  }
}

/**
 * Generate test data for a custom user
 */
export function createCustomUser(overrides: Partial<MockUser>): MockUser {
  const baseUser = MOCK_USERS.user;
  return {
    ...baseUser,
    id: `mock-custom-${Date.now()}`,
    ...overrides,
  };
}
