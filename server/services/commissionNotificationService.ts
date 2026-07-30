/**
 * Commission Notification Service
 * Sends email notifications for commission approval/rejection events
 */

import { getDb } from '../db.js';
import { users } from '../../drizzle/schema.js';
import { referralConversions } from '../../drizzle/schema-referral.js';
import { eq } from 'drizzle-orm';

interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export class CommissionNotificationService {
  /**
   * Send commission approved notification
   */
  static async sendApprovalNotification(
    conversionId: number,
    referrerId: number
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      // Get conversion details
      const conversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.id, conversionId))
        .limit(1);

      if (!conversion || conversion.length === 0) {
        return {
          success: false,
          error: 'Conversion not found',
        };
      }

      const conv = conversion[0];

      // Get referrer details
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referrerId))
        .limit(1);

      if (!referrer || referrer.length === 0) {
        return {
          success: false,
          error: 'Referrer not found',
        };
      }

      const referrerUser = referrer[0];

      // Prepare notification
      const notification: EmailNotification = {
        to: referrerUser.email || '',
        subject: 'Commission Approved - CSOAI Referral Program',
        template: 'commission_approved',
        data: {
          referrerName: referrerUser.name || 'Referrer',
          referredEmail: conv.referredEmail,
          certificationName: conv.certificationName || 'AI Safety Certification',
          commissionAmount: parseFloat(conv.commissionAmount as any),
          conversionDate: conv.convertedAt || conv.createdAt,
          approvalDate: new Date().toISOString(),
        },
      };

      // Send notification using existing notification system
      const result = await this.sendNotification(notification);

      return {
        success: true,
        message: 'Approval notification sent successfully',
      };
    } catch (error) {
      console.error('Error sending approval notification:', error);
      return {
        success: false,
        error: 'Failed to send notification',
      };
    }
  }

  /**
   * Send commission rejected notification
   */
  static async sendRejectionNotification(
    conversionId: number,
    referrerId: number,
    reason?: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      // Get conversion details
      const conversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.id, conversionId))
        .limit(1);

      if (!conversion || conversion.length === 0) {
        return {
          success: false,
          error: 'Conversion not found',
        };
      }

      const conv = conversion[0];

      // Get referrer details
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referrerId))
        .limit(1);

      if (!referrer || referrer.length === 0) {
        return {
          success: false,
          error: 'Referrer not found',
        };
      }

      const referrerUser = referrer[0];

      // Prepare notification
      const notification: EmailNotification = {
        to: referrerUser.email || '',
        subject: 'Commission Rejected - CSOAI Referral Program',
        template: 'commission_rejected',
        data: {
          referrerName: referrerUser.name || 'Referrer',
          referredEmail: conv.referredEmail,
          certificationName: conv.certificationName || 'AI Safety Certification',
          commissionAmount: parseFloat(conv.commissionAmount as any),
          conversionDate: conv.convertedAt || conv.createdAt,
          rejectionDate: new Date().toISOString(),
          rejectionReason: reason || 'No reason provided',
        },
      };

      // Send notification
      const result = await this.sendNotification(notification);

      return {
        success: true,
        message: 'Rejection notification sent successfully',
      };
    } catch (error) {
      console.error('Error sending rejection notification:', error);
      return {
        success: false,
        error: 'Failed to send notification',
      };
    }
  }

  /**
   * Send payout notification
   */
  static async sendPayoutNotification(
    referrerId: number,
    payoutAmount: number,
    conversionCount: number,
    payoutDate: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      // Get referrer details
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referrerId))
        .limit(1);

      if (!referrer || referrer.length === 0) {
        return {
          success: false,
          error: 'Referrer not found',
        };
      }

      const referrerUser = referrer[0];

      // Prepare notification
      const notification: EmailNotification = {
        to: referrerUser.email || '',
        subject: 'Payout Processed - CSOAI Referral Program',
        template: 'payout_processed',
        data: {
          referrerName: referrerUser.name || 'Referrer',
          payoutAmount: payoutAmount,
          conversionCount: conversionCount,
          payoutDate: payoutDate,
          averageCommission: payoutAmount / conversionCount,
        },
      };

      // Send notification
      const result = await this.sendNotification(notification);

      return {
        success: true,
        message: 'Payout notification sent successfully',
      };
    } catch (error) {
      console.error('Error sending payout notification:', error);
      return {
        success: false,
        error: 'Failed to send notification',
      };
    }
  }

  /**
   * Send weekly summary notification
   */
  static async sendWeeklySummaryNotification(
    referrerId: number,
    weekData: {
      clicks: number;
      conversions: number;
      earnings: number;
      conversionRate: number;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      // Get referrer details
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referrerId))
        .limit(1);

      if (!referrer || referrer.length === 0) {
        return {
          success: false,
          error: 'Referrer not found',
        };
      }

      const referrerUser = referrer[0];

      // Prepare notification
      const notification: EmailNotification = {
        to: referrerUser.email || '',
        subject: 'Weekly Referral Summary - CSOAI',
        template: 'weekly_summary',
        data: {
          referrerName: referrerUser.name || 'Referrer',
          weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toString(),
          weekEndDate: new Date().toISOString().toString(),
          clicks: weekData.clicks,
          conversions: weekData.conversions,
          earnings: weekData.earnings,
          conversionRate: weekData.conversionRate,
        },
      };

      // Send notification
      const result = await this.sendNotification(notification);

      return {
        success: true,
        message: 'Weekly summary notification sent successfully',
      };
    } catch (error) {
      console.error('Error sending weekly summary notification:', error);
      return {
        success: false,
        error: 'Failed to send notification',
      };
    }
  }

  /**
   * Send generic notification (uses existing notification system)
   */
  private static async sendNotification(notification: EmailNotification): Promise<boolean> {
    try {
      // This would integrate with the existing notification system
      // For now, we'll log it and return success
      // In production, this would call the notification service API

      console.log('Sending notification:', {
        to: notification.to,
        subject: notification.subject,
        template: notification.template,
        data: notification.data,
      });

      // TODO: Integrate with existing notification/email service
      // Example: await notificationService.sendEmail(notification);

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}
