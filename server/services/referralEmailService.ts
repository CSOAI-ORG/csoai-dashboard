/**
 * Referral Email Service
 * Sends automated emails for referral events using Resend API
 */

import { ReferralService } from "./referralService.js";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class ReferralEmailService {
  private static RESEND_API_KEY = process.env.RESEND_API_KEY;
  private static FROM_EMAIL = "referrals@csoai.com";

  /**
   * Send referral signup notification to referrer
   */
  static async sendReferralSignupEmail(
    referrerEmail: string,
    referrerName: string,
    referredEmail: string
  ): Promise<boolean> {
    try {
      const template = this.getSignupTemplate(referrerName, referredEmail);
      await this.sendEmail(referrerEmail, template);
      return true;
    } catch (error) {
      console.error("Error sending referral signup email:", error);
      return false;
    }
  }

  /**
   * Send conversion notification to referrer
   */
  static async sendConversionEmail(
    referrerEmail: string,
    referrerName: string,
    referredEmail: string,
    certificationName: string,
    commissionAmount: number
  ): Promise<boolean> {
    try {
      const template = this.getConversionTemplate(
        referrerName,
        referredEmail,
        certificationName,
        commissionAmount
      );
      await this.sendEmail(referrerEmail, template);
      return true;
    } catch (error) {
      console.error("Error sending conversion email:", error);
      return false;
    }
  }

  /**
   * Send commission earned notification
   */
  static async sendCommissionEarnedEmail(
    referrerEmail: string,
    referrerName: string,
    totalCommission: number,
    conversionCount: number
  ): Promise<boolean> {
    try {
      const template = this.getCommissionTemplate(
        referrerName,
        totalCommission,
        conversionCount
      );
      await this.sendEmail(referrerEmail, template);
      return true;
    } catch (error) {
      console.error("Error sending commission email:", error);
      return false;
    }
  }

  /**
   * Send payout notification
   */
  static async sendPayoutEmail(
    referrerEmail: string,
    referrerName: string,
    payoutAmount: number,
    payoutDate: string
  ): Promise<boolean> {
    try {
      const template = this.getPayoutTemplate(
        referrerName,
        payoutAmount,
        payoutDate
      );
      await this.sendEmail(referrerEmail, template);
      return true;
    } catch (error) {
      console.error("Error sending payout email:", error);
      return false;
    }
  }

  /**
   * Send email via Resend API
   */
  private static async sendEmail(
    to: string,
    template: EmailTemplate
  ): Promise<string> {
    if (!this.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: this.FROM_EMAIL,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.id;
  }

  /**
   * Email template: Referral signup
   */
  private static getSignupTemplate(
    referrerName: string,
    referredEmail: string
  ): EmailTemplate {
    return {
      subject: `🎉 New Referral: ${referredEmail} joined CSOAI!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Great news, ${referrerName}!</h2>
          <p>Someone you referred just signed up for CSOAI:</p>
          <p style="font-size: 18px; font-weight: bold; color: #333;">${referredEmail}</p>
          <p>When they complete their certification, you'll earn a 20% commission!</p>
          <a href="https://csoai.com/referral" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Your Referrals
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from CSOAI Referral Program.
          </p>
        </div>
      `,
      text: `Great news, ${referrerName}!\n\nSomeone you referred just signed up for CSOAI: ${referredEmail}\n\nWhen they complete their certification, you'll earn a 20% commission!\n\nView your referrals: https://csoai.com/referral`,
    };
  }

  /**
   * Email template: Conversion
   */
  private static getConversionTemplate(
    referrerName: string,
    referredEmail: string,
    certificationName: string,
    commissionAmount: number
  ): EmailTemplate {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(commissionAmount);

    return {
      subject: `💰 Commission Earned: ${referredEmail} completed ${certificationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Congratulations, ${referrerName}!</h2>
          <p>${referredEmail} just completed the <strong>${certificationName}</strong>!</p>
          <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 20px 0;">
            You earned ${formattedAmount}
          </p>
          <p>This commission will be processed in your next monthly payout.</p>
          <a href="https://csoai.com/referral" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Your Dashboard
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from CSOAI Referral Program.
          </p>
        </div>
      `,
      text: `Congratulations, ${referrerName}!\n\n${referredEmail} just completed the ${certificationName}!\n\nYou earned ${formattedAmount}\n\nThis commission will be processed in your next monthly payout.\n\nView your dashboard: https://csoai.com/referral`,
    };
  }

  /**
   * Email template: Commission summary
   */
  private static getCommissionTemplate(
    referrerName: string,
    totalCommission: number,
    conversionCount: number
  ): EmailTemplate {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(totalCommission);

    return {
      subject: `📊 Your Monthly Commission Summary: ${formattedAmount} earned`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Monthly Commission Summary</h2>
          <p>Hi ${referrerName},</p>
          <p>Here's your referral performance for this month:</p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb;">Referrals Converted</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${conversionCount}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">Total Commission</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #16a34a; font-size: 18px;">${formattedAmount}</td>
            </tr>
          </table>
          <p>Your commission will be processed for payout next month.</p>
          <a href="https://csoai.com/referral" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Full Details
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from CSOAI Referral Program.
          </p>
        </div>
      `,
      text: `Monthly Commission Summary\n\nHi ${referrerName},\n\nReferrals Converted: ${conversionCount}\nTotal Commission: ${formattedAmount}\n\nYour commission will be processed for payout next month.\n\nView full details: https://csoai.com/referral`,
    };
  }

  /**
   * Email template: Payout
   */
  private static getPayoutTemplate(
    referrerName: string,
    payoutAmount: number,
    payoutDate: string
  ): EmailTemplate {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(payoutAmount);

    return {
      subject: `✅ Payout Processed: ${formattedAmount} transferred to your account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Payout Processed!</h2>
          <p>Hi ${referrerName},</p>
          <p>Your referral commission payout has been processed:</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #16a34a; font-size: 24px; font-weight: bold;">
              ${formattedAmount}
            </p>
            <p style="margin: 10px 0 0 0; color: #666;">
              Transferred on ${payoutDate}
            </p>
          </div>
          <p>The funds should appear in your bank account within 1-3 business days.</p>
          <a href="https://csoai.com/referral" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Transaction Details
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from CSOAI Referral Program.
          </p>
        </div>
      `,
      text: `Payout Processed!\n\nHi ${referrerName},\n\nYour referral commission payout has been processed:\n\n${formattedAmount}\n\nTransferred on ${payoutDate}\n\nThe funds should appear in your bank account within 1-3 business days.\n\nView transaction details: https://csoai.com/referral`,
    };
  }
}
