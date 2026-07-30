/**
 * Payout Email Notification Service
 * Sends email notifications for payout events (processed, failed, pending)
 */

import { sendEmail } from '../emailService';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface PayoutNotificationData {
  userId: number;
  amount: number; // in cents
  currency?: string;
  payoutId?: string;
  transferId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  scheduledDate?: Date;
  processedDate?: Date;
}

/**
 * Payout Email Service
 * Handles all payout-related email notifications
 */
export class PayoutEmailService {
  private static readonly PLATFORM_NAME = 'CSOAI';
  private static readonly SUPPORT_EMAIL = 'support@councilof.ai';

  /**
   * Get user email by ID
   */
  private static async getUserEmail(userId: number): Promise<{ email: string | null; name: string | null }> {
    const db = await getDb();
    if (!db) return { email: null, name: null };

    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return { email: user?.email || null, name: user?.name || null };
  }

  /**
   * Format currency amount
   */
  private static formatCurrency(amountCents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  }

  /**
   * Send payout processed notification
   */
  static async sendPayoutProcessedEmail(data: PayoutNotificationData): Promise<boolean> {
    try {
      const { email, name } = await this.getUserEmail(data.userId);
      if (!email) {
        console.log(`[PayoutEmail] No email found for user ${data.userId}`);
        return false;
      }

      const amount = this.formatCurrency(data.amount, data.currency);
      const userName = name || 'Specialist';

      const html = this.generatePayoutProcessedHTML({
        userName,
        amount,
        payoutId: data.payoutId || data.transferId || 'N/A',
        processedDate: data.processedDate || new Date(),
      });

      const result = await sendEmail({
        to: email,
        subject: `💰 Payout Processed - ${amount} sent to your account`,
        html,
        text: `Your payout of ${amount} has been processed and sent to your bank account. Payout ID: ${data.payoutId || data.transferId || 'N/A'}`,
      });

      if (result.success) {
        console.log(`[PayoutEmail] Payout processed email sent to ${email}`);
      }

      return result.success;
    } catch (error) {
      console.error('[PayoutEmail] Error sending payout processed email:', error);
      return false;
    }
  }

  /**
   * Send payout failed notification
   */
  static async sendPayoutFailedEmail(data: PayoutNotificationData): Promise<boolean> {
    try {
      const { email, name } = await this.getUserEmail(data.userId);
      if (!email) {
        console.log(`[PayoutEmail] No email found for user ${data.userId}`);
        return false;
      }

      const amount = this.formatCurrency(data.amount, data.currency);
      const userName = name || 'Specialist';

      const html = this.generatePayoutFailedHTML({
        userName,
        amount,
        payoutId: data.payoutId || data.transferId || 'N/A',
        errorMessage: data.errorMessage || 'An unexpected error occurred',
      });

      const result = await sendEmail({
        to: email,
        subject: `⚠️ Payout Failed - Action Required`,
        html,
        text: `Your payout of ${amount} could not be processed. Error: ${data.errorMessage || 'Unknown error'}. Please check your payout settings.`,
      });

      if (result.success) {
        console.log(`[PayoutEmail] Payout failed email sent to ${email}`);
      }

      return result.success;
    } catch (error) {
      console.error('[PayoutEmail] Error sending payout failed email:', error);
      return false;
    }
  }

  /**
   * Send payout pending notification
   */
  static async sendPayoutPendingEmail(data: PayoutNotificationData): Promise<boolean> {
    try {
      const { email, name } = await this.getUserEmail(data.userId);
      if (!email) {
        console.log(`[PayoutEmail] No email found for user ${data.userId}`);
        return false;
      }

      const amount = this.formatCurrency(data.amount, data.currency);
      const userName = name || 'Specialist';

      const html = this.generatePayoutPendingHTML({
        userName,
        amount,
        scheduledDate: data.scheduledDate || new Date(),
      });

      const result = await sendEmail({
        to: email,
        subject: `📅 Payout Scheduled - ${amount} coming soon`,
        html,
        text: `Your payout of ${amount} has been scheduled and will be processed soon.`,
      });

      if (result.success) {
        console.log(`[PayoutEmail] Payout pending email sent to ${email}`);
      }

      return result.success;
    } catch (error) {
      console.error('[PayoutEmail] Error sending payout pending email:', error);
      return false;
    }
  }

  /**
   * Send payout threshold reached notification
   */
  static async sendThresholdReachedEmail(userId: number, currentBalance: number): Promise<boolean> {
    try {
      const { email, name } = await this.getUserEmail(userId);
      if (!email) {
        console.log(`[PayoutEmail] No email found for user ${userId}`);
        return false;
      }

      const amount = this.formatCurrency(currentBalance);
      const userName = name || 'Specialist';

      const html = this.generateThresholdReachedHTML({
        userName,
        amount,
      });

      const result = await sendEmail({
        to: email,
        subject: `🎉 Payout Threshold Reached - ${amount} ready for withdrawal`,
        html,
        text: `Congratulations! You've reached the minimum payout threshold. Your balance of ${amount} is now eligible for withdrawal.`,
      });

      if (result.success) {
        console.log(`[PayoutEmail] Threshold reached email sent to ${email}`);
      }

      return result.success;
    } catch (error) {
      console.error('[PayoutEmail] Error sending threshold reached email:', error);
      return false;
    }
  }

  /**
   * Generate HTML for payout processed email
   */
  private static generatePayoutProcessedHTML(data: {
    userName: string;
    amount: string;
    payoutId: string;
    processedDate: Date;
  }): string {
    const formattedDate = data.processedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">💰</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payout Processed!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${data.userName},
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your payout has been successfully processed and is on its way to your bank account.
              </p>
              
              <!-- Amount Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 8px; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Transferred</p>
                <p style="margin: 0; color: #15803d; font-size: 36px; font-weight: 700;">${data.amount}</p>
              </div>
              
              <!-- Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Payout ID</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px; font-family: monospace;">${data.payoutId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Processed Date</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Status</span>
                  </td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="background-color: #dcfce7; color: #166534; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">Completed</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                The funds should arrive in your bank account within 1-3 business days, depending on your bank's processing time.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://coai-dash-k34vnbtb.manus.space/payouts" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                  View Payout History
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                Questions? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #10b981;">${this.SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${this.PLATFORM_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for payout failed email
   */
  private static generatePayoutFailedHTML(data: {
    userName: string;
    amount: string;
    payoutId: string;
    errorMessage: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 12px 12px 0 0;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">⚠️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payout Failed</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${data.userName},
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Unfortunately, we were unable to process your payout. Don't worry – your funds are safe and we'll help you resolve this.
              </p>
              
              <!-- Error Box -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">Error Details</p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px;">${data.errorMessage}</p>
              </div>
              
              <!-- Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Attempted Amount</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px; font-weight: 600;">${data.amount}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Reference ID</span>
                  </td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="color: #111827; font-size: 14px; font-family: monospace;">${data.payoutId}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Action Steps -->
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0 0 12px; color: #92400e; font-size: 14px; font-weight: 600;">What to do next:</p>
                <ol style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                  <li>Check your Stripe Connect account settings</li>
                  <li>Verify your bank account information is correct</li>
                  <li>Ensure your account is fully verified</li>
                  <li>Contact support if the issue persists</li>
                </ol>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://coai-dash-k34vnbtb.manus.space/payouts" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                  Review Payout Settings
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                Need help? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #ef4444;">${this.SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${this.PLATFORM_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for payout pending email
   */
  private static generatePayoutPendingHTML(data: {
    userName: string;
    amount: string;
    scheduledDate: Date;
  }): string {
    const formattedDate = data.scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px 12px 0 0;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">📅</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payout Scheduled</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${data.userName},
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your payout has been scheduled and will be processed soon. Here are the details:
              </p>
              
              <!-- Amount Box -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Scheduled Amount</p>
                <p style="margin: 0; color: #1d4ed8; font-size: 36px; font-weight: 700;">${data.amount}</p>
              </div>
              
              <!-- Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Scheduled Date</span>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #6b7280; font-size: 14px;">Status</span>
                  </td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">Pending</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                We'll send you another email once the payout has been processed and the funds are on their way to your bank account.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://coai-dash-k34vnbtb.manus.space/payouts" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                  View Payout Details
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                Questions? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #3b82f6;">${this.SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${this.PLATFORM_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for threshold reached email
   */
  private static generateThresholdReachedHTML(data: {
    userName: string;
    amount: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 12px 12px 0 0;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">🎉</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Payout Threshold Reached!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${data.userName},
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Congratulations! You've reached the minimum payout threshold. Your earnings are now eligible for withdrawal.
              </p>
              
              <!-- Amount Box -->
              <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 8px; color: #5b21b6; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Available Balance</p>
                <p style="margin: 0; color: #6d28d9; font-size: 36px; font-weight: 700;">${data.amount}</p>
              </div>
              
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have automatic payouts enabled, this amount will be transferred to your bank account on your next scheduled payout date. Otherwise, you can request a manual payout from your dashboard.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://coai-dash-k34vnbtb.manus.space/payouts" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px;">
                  View Your Earnings
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                Questions? Contact us at <a href="mailto:${this.SUPPORT_EMAIL}" style="color: #8b5cf6;">${this.SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${this.PLATFORM_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
