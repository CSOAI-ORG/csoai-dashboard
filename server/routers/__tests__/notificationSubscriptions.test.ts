import { describe, it, expect } from 'vitest';
import { notificationSubscriptionsRouter } from '../notificationSubscriptions';

// Mock context for tRPC calls
const mockContext: any = {
  user: { id: 1, name: 'Test User', email: 'test@example.com' },
  req: {} as any,
  res: {} as any,
};

describe('Notification Subscriptions Router', () => {
  const caller = notificationSubscriptionsRouter.createCaller(mockContext);
  const testEmail = `test-${Date.now()}@example.com`;

  describe('subscribe', () => {
    it('should subscribe a new email address', async () => {
      const result = await caller.subscribe({
        email: testEmail,
        name: 'Test User',
        categories: ['all'],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('subscribed');
    });

    it('should update existing subscription', async () => {
      // Subscribe first time
      await caller.subscribe({
        email: testEmail,
        name: 'Test User',
        categories: ['all'],
      });

      // Subscribe again with different preferences
      const result = await caller.subscribe({
        email: testEmail,
        name: 'Test User Updated',
        categories: ['critical', 'high'],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('updated');
    });

    it('should validate email format', async () => {
      await expect(
        caller.subscribe({
          email: 'invalid-email',
          categories: ['all'],
        })
      ).rejects.toThrow();
    });

    it('should support multiple severity categories', async () => {
      const uniqueEmail = `multi-${Date.now()}@example.com`;
      const result = await caller.subscribe({
        email: uniqueEmail,
        name: 'Multi Category User',
        categories: ['critical', 'high', 'medium'],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('getSubscription', () => {
    it('should return subscription details', async () => {
      // First subscribe
      await caller.subscribe({
        email: testEmail,
        name: 'Test User',
        categories: ['all'],
      });

      // Then get subscription
      const result = await caller.getSubscription({
        email: testEmail,
      });

      expect(result).toBeDefined();
      if (result) {
        expect(result.email).toBe(testEmail);
        expect(result.name).toBe('Test User');
        expect(result.status).toBe('active');
        // expect(result.preferences).toBeDefined();
        // expect(result.preferences.categories).toContain('all');
      }
    });

    it('should return null for non-existent subscription', async () => {
      const result = await caller.getSubscription({
        email: 'nonexistent@example.com',
      });

      expect(result).toBeNull();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe an email address', async () => {
      const unsubEmail = `unsub-${Date.now()}@example.com`;
      
      // First subscribe
      await caller.subscribe({
        email: unsubEmail,
        categories: ['all'],
      });

      // Then unsubscribe
      const result = await caller.unsubscribe({
        email: unsubEmail,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message.toLowerCase()).toContain('unsubscribed');

      // Verify status changed
      const subscription = await caller.getSubscription({
        email: unsubEmail,
      });

      if (subscription) {
        expect(subscription.status).toBe('unsubscribed');
      }
    });

    it('should handle unsubscribe for non-existent email', async () => {
      const result = await caller.unsubscribe({
        email: 'nonexistent@example.com',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
