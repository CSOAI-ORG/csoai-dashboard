/**
 * Payout Email Service Tests
 * Tests for payout email notification functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the email service
vi.mock('../emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id',
  }),
}));

// Mock database
vi.mock('../db', () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      email: 'test@example.com',
      name: 'Test User',
    }]),
  }),
}));

// Import after mocks
import { PayoutEmailService } from '../services/payoutEmailService';
import { sendEmail } from '../emailService';

describe('PayoutEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendPayoutProcessedEmail', () => {
    it('should send a payout processed email', async () => {
      const result = await PayoutEmailService.sendPayoutProcessedEmail({
        userId: 1,
        amount: 5000, // $50.00
        currency: 'usd',
        payoutId: 'po_test123',
        status: 'completed',
        processedDate: new Date(),
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Payout Processed'),
        })
      );
    });

    it('should include the correct amount in the email', async () => {
      await PayoutEmailService.sendPayoutProcessedEmail({
        userId: 1,
        amount: 10000, // $100.00
        currency: 'usd',
        payoutId: 'po_test456',
        status: 'completed',
        processedDate: new Date(),
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('$100.00'),
        })
      );
    });
  });

  describe('sendPayoutFailedEmail', () => {
    it('should send a payout failed email', async () => {
      const result = await PayoutEmailService.sendPayoutFailedEmail({
        userId: 1,
        amount: 5000,
        currency: 'usd',
        payoutId: 'po_test123',
        status: 'failed',
        errorMessage: 'Insufficient funds',
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Payout Failed'),
        })
      );
    });
  });

  describe('sendPayoutPendingEmail', () => {
    it('should send a payout pending email', async () => {
      const result = await PayoutEmailService.sendPayoutPendingEmail({
        userId: 1,
        amount: 7500, // $75.00
        currency: 'usd',
        status: 'pending',
        scheduledDate: new Date('2025-02-01'),
      });

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Payout Scheduled'),
        })
      );
    });
  });

  describe('sendThresholdReachedEmail', () => {
    it('should send a threshold reached email', async () => {
      const result = await PayoutEmailService.sendThresholdReachedEmail(1, 5000);

      expect(result).toBe(true);
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Payout Threshold Reached'),
        })
      );
    });
  });

  describe('email formatting', () => {
    it('should format currency correctly', async () => {
      await PayoutEmailService.sendPayoutProcessedEmail({
        userId: 1,
        amount: 12345, // $123.45
        currency: 'usd',
        payoutId: 'po_test789',
        status: 'completed',
        processedDate: new Date(),
      });

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('$123.45'),
        })
      );
    });
  });
});
