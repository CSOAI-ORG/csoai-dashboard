/**
 * Referral Analytics Export Service
 * Handles CSV and PDF export of referral analytics data
 */

import { ReferralAnalyticsService } from './referralAnalyticsService.js';
import { ReferralPdfGenerator } from './referralPdfGenerator.js';

export class ReferralExportService {
  /**
   * Export referral analytics as CSV
   */
  static async exportAsCSV(userId: number, dateRange: 'week' | 'month' | 'quarter' = 'month'): Promise<string> {
    try {
      const analytics = await ReferralAnalyticsService.getReferralAnalytics(userId, dateRange);
      const summary = await ReferralAnalyticsService.getReferralSummary(userId);

      // Build CSV content
      const csvLines = [
        ['REFERRAL ANALYTICS REPORT'],
        [`Generated: ${new Date().toISOString()}`],
        [`Date Range: ${dateRange}`],
        [],
        ['SUMMARY METRICS'],
        ['Metric', 'Value'],
        ['Total Clicks', analytics.totalClicks],
        ['Total Conversions', analytics.totalConversions],
        ['Total Earnings', `$${analytics.totalEarnings.toFixed(2)}`],
        ['Conversion Rate', `${analytics.conversionRate.toFixed(2)}%`],
        ['Average Commission per Conversion', `$${analytics.averageCommissionPerConversion.toFixed(2)}`],
        ['Active Referral Codes', summary.activeReferralCodes],
        ['Total Referral Codes', summary.totalReferralCodes],
        [],
        ['TOP REFERRAL CODES'],
        ['Code', 'Clicks', 'Conversions', 'Earnings'],
        ...analytics.topReferralCodes.map((code) => [
          code.code,
          code.clicks,
          code.conversions,
          `$${code.earnings.toFixed(2)}`,
        ]),
        [],
        ['CLICKS TREND'],
        ['Date', 'Clicks'],
        ...analytics.clicksTrend.map((trend) => [trend.date, trend.clicks]),
        [],
        ['CONVERSIONS TREND'],
        ['Date', 'Conversions'],
        ...analytics.conversionsTrend.map((trend) => [trend.date, trend.conversions]),
        [],
        ['EARNINGS TREND'],
        ['Date', 'Earnings'],
        ...analytics.earningsTrend.map((trend) => [trend.date, `$${trend.earnings.toFixed(2)}`]),
      ];

      // Convert to CSV format
      return csvLines.map((line) => line.map((cell) => `"${cell}"`).join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting analytics as CSV:', error);
      throw error;
    }
  }

  /**
   * Export referral analytics as PDF
   */
  static async exportAsPDF(
    userId: number,
    dateRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<Buffer> {
    try {
      const pdf = await ReferralPdfGenerator.generateAnalyticsPDF(userId, dateRange);
      return pdf;
    } catch (error) {
      console.error('Error exporting analytics as PDF:', error);
      throw error;
    }
  }

  /**
   * Generate analytics report summary
   */
  static async generateReportSummary(
    userId: number,
    dateRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<string> {
    try {
      const analytics = await ReferralAnalyticsService.getReferralAnalytics(userId, dateRange);
      const summary = await ReferralAnalyticsService.getReferralSummary(userId);

      const report = `
REFERRAL ANALYTICS REPORT
Generated: ${new Date().toISOString()}
Date Range: ${dateRange}

SUMMARY METRICS
===============
Total Clicks: ${analytics.totalClicks}
Total Conversions: ${analytics.totalConversions}
Total Earnings: $${analytics.totalEarnings.toFixed(2)}
Conversion Rate: ${analytics.conversionRate.toFixed(2)}%
Average Commission per Conversion: $${analytics.averageCommissionPerConversion.toFixed(2)}

REFERRAL PROGRAM STATUS
=======================
Active Referral Codes: ${summary.activeReferralCodes}
Total Referral Codes: ${summary.totalReferralCodes}
Pending Earnings: $${summary.pendingEarnings.toFixed(2)}
Processed Earnings: $${summary.processedEarnings.toFixed(2)}

TOP REFERRAL CODES
==================
${analytics.topReferralCodes
  .map((code) => `${code.code}: ${code.clicks} clicks, ${code.conversions} conversions, $${code.earnings.toFixed(2)} earnings`)
  .join('\n')}

PERFORMANCE INSIGHTS
====================
- Best performing code: ${analytics.topReferralCodes[0]?.code || 'N/A'}
- Average clicks per code: ${(analytics.totalClicks / summary.totalReferralCodes).toFixed(2)}
- Average conversions per code: ${(analytics.totalConversions / summary.totalReferralCodes).toFixed(2)}
- Average earnings per code: $${(analytics.totalEarnings / summary.totalReferralCodes).toFixed(2)}
      `;

      return report.trim();
    } catch (error) {
      console.error('Error generating report summary:', error);
      throw error;
    }
  }
}
