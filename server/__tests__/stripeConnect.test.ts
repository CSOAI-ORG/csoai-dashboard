/**
 * Stripe Connect Service Tests
 * Tests for the Stripe Connect onboarding and payout functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      accounts: {
        create: vi.fn().mockResolvedValue({
          id: 'acct_test123',
          type: 'express',
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'acct_test123',
          charges_enabled: true,
          payouts_enabled: true,
          details_submitted: true,
          requirements: {
            currently_due: [],
            eventually_due: [],
            past_due: [],
          },
        }),
        createLoginLink: vi.fn().mockResolvedValue({
          url: 'https://connect.stripe.com/express/test-login',
        }),
      },
      accountLinks: {
        create: vi.fn().mockResolvedValue({
          url: 'https://connect.stripe.com/setup/test-link',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        }),
      },
      transfers: {
        create: vi.fn().mockResolvedValue({
          id: 'tr_test123',
          amount: 5000,
          currency: 'usd',
          destination: 'acct_test123',
          reversed: false,
        }),
      },
      payouts: {
        create: vi.fn().mockResolvedValue({
          id: 'po_test123',
          status: 'pending',
        }),
      },
      balance: {
        retrieve: vi.fn().mockResolvedValue({
          available: [{ amount: 10000, currency: 'usd' }],
          pending: [{ amount: 2500, currency: 'usd' }],
        }),
      },
    })),
  };
});

// Mock database
vi.mock('../db', () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ stripeConnectAccountId: 'acct_test123' }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

// Import after mocks
import { StripeConnectService } from '../services/stripeConnect';

describe('StripeConnectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createConnectAccount', () => {
    it('should create a new Stripe Connect Express account', async () => {
      const accountId = await StripeConnectService.createConnectAccount(
        1,
        'test@example.com',
        'US'
      );

      expect(accountId).toBe('acct_test123');
    });
  });

  describe('createOnboardingLink', () => {
    it('should generate an onboarding link for a Connect account', async () => {
      const result = await StripeConnectService.createOnboardingLink(
        'acct_test123',
        'https://example.com/refresh',
        'https://example.com/return'
      );

      expect(result.url).toBe('https://connect.stripe.com/setup/test-link');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('getAccountStatus', () => {
    it('should return account status for a valid account', async () => {
      const status = await StripeConnectService.getAccountStatus('acct_test123');

      expect(status.hasAccount).toBe(true);
      expect(status.accountId).toBe('acct_test123');
      expect(status.chargesEnabled).toBe(true);
      expect(status.payoutsEnabled).toBe(true);
      expect(status.detailsSubmitted).toBe(true);
    });
  });

  describe('createTransfer', () => {
    it('should create a transfer to a connected account', async () => {
      const result = await StripeConnectService.createTransfer(
        'acct_test123',
        5000,
        'usd',
        'Test transfer'
      );

      expect(result.transferId).toBe('tr_test123');
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe('usd');
      expect(result.status).toBe('completed');
    });
  });

  describe('getAccountBalance', () => {
    it('should return the balance of a connected account', async () => {
      const balance = await StripeConnectService.getAccountBalance('acct_test123');

      expect(balance.available).toBe(10000);
      expect(balance.pending).toBe(2500);
      expect(balance.currency).toBe('usd');
    });
  });

  describe('createDashboardLink', () => {
    it('should create a login link for the Stripe dashboard', async () => {
      const url = await StripeConnectService.createDashboardLink('acct_test123');

      expect(url).toBe('https://connect.stripe.com/express/test-login');
    });
  });
});
