/**
 * Test helpers for creating properly typed mock objects
 */

type UserRole = 'user' | 'admin' | 'watchdog_analyst' | 'regulator' | 'enterprise_admin' | 'compliance_officer';

interface MockUserOptions {
  id: number;
  email?: string;
  name?: string;
  role?: UserRole;
  openId?: string;
}

/**
 * Creates a complete user mock object with all required fields
 * to satisfy TypeScript type checking in tests
 */
export function createMockUser(options: MockUserOptions) {
  return {
    id: options.id,
    email: options.email || `test-${options.id}@example.com`,
    name: options.name || `Test User ${options.id}`,
    role: options.role || 'user' as const,
    openId: options.openId || `test_openid_${options.id}`,
    brand: 'councilof.ai',
    password: null,
    loginMethod: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionTier: 'free' as const,
    subscriptionStatus: 'none' as const,
    foundingMember: 0,
    referralCode: null,
    payoutFrequency: 'monthly' as const,
    lastPayoutDate: null,
    stripeConnectAccountId: null,
  };
}

/**
 * Creates a mock tRPC context with a user
 */
export function createMockContext(userOptions: MockUserOptions) {
  return {
    user: createMockUser(userOptions),
    req: {} as any,
    res: {} as any,
  };
}
