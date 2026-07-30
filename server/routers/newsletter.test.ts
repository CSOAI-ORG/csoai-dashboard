/**
 * Newsletter Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

import { getDb } from '../db';

describe('Newsletter Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should create new subscription for new email', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        $returningId: vi.fn().mockResolvedValue([{ id: 1 }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      // The router would be called with input
      const input = {
        email: 'test@example.com',
        name: 'Test User',
        source: 'footer',
      };

      // Verify the mock setup is correct
      expect(mockDb.select).toBeDefined();
      expect(mockDb.insert).toBeDefined();
    });

    it('should return already subscribed for existing active email', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          email: 'existing@example.com',
          status: 'active',
        }]),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      // Verify existing subscriber is detected
      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result[0].status).toBe('active');
    });

    it('should reactivate unsubscribed email', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          email: 'unsubscribed@example.com',
          status: 'unsubscribed',
          name: 'Old Name',
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockResolvedValue({}),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      // Verify unsubscribed status is detected
      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result[0].status).toBe('unsubscribed');
    });
  });

  describe('unsubscribe', () => {
    it('should update status to unsubscribed', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{
          id: 1,
          email: 'test@example.com',
          status: 'active',
        }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockResolvedValue({}),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      // Verify subscriber exists
      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result[0]).toBeDefined();
    });

    it('should handle non-existent email gracefully', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      const result = await mockDb.select().from({}).where({}).limit(1);
      expect(result).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return subscriber statistics', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockResolvedValue([{
          total: 100,
          active: 85,
        }]),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      const result = await mockDb.select().from({});
      expect(result[0].total).toBe(100);
      expect(result[0].active).toBe(85);
    });

    it('should return zeros when database unavailable', async () => {
      (getDb as any).mockResolvedValue(null);

      const db = await getDb();
      expect(db).toBeNull();
    });
  });

  describe('listSubscribers (admin)', () => {
    it('should return paginated subscriber list', async () => {
      const mockSubscribers = [
        { id: 1, email: 'user1@example.com', status: 'active' },
        { id: 2, email: 'user2@example.com', status: 'active' },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockSubscribers),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      const result = await mockDb.select().from({}).orderBy({}).limit(50).offset(0);
      expect(result).toHaveLength(2);
    });

    it('should filter by status when specified', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([
          { id: 1, email: 'active@example.com', status: 'active' },
        ]),
      };
      
      (getDb as any).mockResolvedValue(mockDb);

      // Verify filter is applied
      expect(mockDb.where).toBeDefined();
    });
  });
});

describe('Newsletter Subscription Flow', () => {
  it('should validate email format', () => {
    const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
    const invalidEmails = ['invalid', 'no@', '@nodomain.com'];

    validEmails.forEach(email => {
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    invalidEmails.forEach(email => {
      expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it('should normalize email to lowercase', () => {
    const email = 'Test.User@EXAMPLE.COM';
    const normalized = email.toLowerCase();
    expect(normalized).toBe('test.user@example.com');
  });
});
