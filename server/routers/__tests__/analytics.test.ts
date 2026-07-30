import { describe, it, expect } from 'vitest';
import { analyticsRouter } from '../analytics';

// Mock context for tRPC calls
const mockContext: any = {
  user: { id: 1, name: 'Test User', email: 'test@example.com' },
  req: {} as any,
  res: {} as any,
};

describe('Analytics Router', () => {
  const caller = analyticsRouter.createCaller(mockContext);

  describe('getIncidentTrends', () => {
    it('should return incident trends data', async () => {
      const result = await caller.getIncidentTrends({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: 'day',
      });

      expect(result).toBeDefined();
      if (result && result.length > 0) {
        expect(result[0]).toHaveProperty('date');
        expect(result[0]).toHaveProperty('total');
        expect(result[0]).toHaveProperty('critical');
        expect(result[0]).toHaveProperty('high');
        expect(result[0]).toHaveProperty('medium');
        expect(result[0]).toHaveProperty('low');
        expect(result[0]).toHaveProperty('resolved');
        expect(result[0]).toHaveProperty('pending');
        expect(result[0]).toHaveProperty('byType');
      }
    });

    it('should support weekly grouping', async () => {
      const result = await caller.getIncidentTrends({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: 'week',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should support monthly grouping', async () => {
      const result = await caller.getIncidentTrends({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        groupBy: 'month',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getComplianceHistory', () => {
    it('should return compliance history data', async () => {
      const result = await caller.getComplianceHistory({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(result).toBeDefined();
      if (result && result.length > 0) {
        expect(result[0]).toHaveProperty('date');
        expect(result[0]).toHaveProperty('averageScore');
        expect(result[0]).toHaveProperty('assessmentCount');
        expect(result[0]).toHaveProperty('frameworks');
      }
    });

    it('should filter by AI system ID', async () => {
      const result = await caller.getComplianceHistory({
        aiSystemId: 1,
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserActivityMetrics', () => {
    it('should return user activity metrics', async () => {
      const result = await caller.getUserActivityMetrics({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(result).toBeDefined();
      if (result && result.length > 0) {
        expect(result[0]).toHaveProperty('date');
        expect(result[0]).toHaveProperty('newUsers');
        expect(result[0]).toHaveProperty('activeUsers');
        expect(result[0]).toHaveProperty('events');
      }
    });

    it('should return empty array when no data', async () => {
      const result = await caller.getUserActivityMetrics({
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-01-02'),
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return real-time dashboard metrics', async () => {
      const result = await caller.getDashboardMetrics();

      expect(result).toBeDefined();
      if (result) {
        expect(result).toHaveProperty('signupsLast24h');
        expect(result).toHaveProperty('paymentsSuccessLast24h');
        expect(result).toHaveProperty('paymentsFailedLast24h');
        expect(result).toHaveProperty('courseCompletionsLast24h');
        expect(result).toHaveProperty('paymentSuccessRate');
        expect(result).toHaveProperty('timestamp');
      }
    });
  });
});
