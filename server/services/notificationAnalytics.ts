/**
 * Notification Analytics Service
 * Tracks and aggregates notification delivery and engagement metrics
 */
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export interface DeliveryMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number; // percentage
  failureRate: number; // percentage
}

export interface EngagementMetrics {
  totalViewed: number;
  totalClicked: number;
  engagementRate: number; // percentage
  clickRate: number; // percentage
  avgEngagementTime: number; // seconds
}

export interface AnalyticsData {
  delivery: DeliveryMetrics;
  engagement: EngagementMetrics;
  effectiveness: number; // 0-100 score
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export class NotificationAnalyticsService {
  /**
   * Track notification delivery event
   */
  public async trackDelivery(
    notificationId: number,
    userId: number,
    channel: string,
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced',
    failureReason?: string
  ) {
    try {
      const db = await getDb();
      if (!db) return;

      // Insert delivery metric
      await db.execute(sql`
        INSERT INTO notification_delivery_metrics 
        (notificationId, userId, deliveryChannel, status, failureReason, sentAt, deliveredAt)
        VALUES (${notificationId}, ${userId}, ${channel}, ${status}, ${failureReason || null}, 
                ${status === 'sent' ? new Date() : null}, 
                ${status === 'delivered' ? new Date() : null})
      `);

      console.log(`[Analytics] Tracked delivery: notification ${notificationId}, status ${status}`);
    } catch (error) {
      console.error('[Analytics] Error tracking delivery:', error);
    }
  }

  /**
   * Track notification engagement event
   */
  public async trackEngagement(
    notificationId: number,
    userId: number,
    action: 'viewed' | 'clicked' | 'dismissed' | 'acted_on',
    clickedUrl?: string,
    engagementTime?: number
  ) {
    try {
      const db = await getDb();
      if (!db) return;

      await db.execute(sql`
        INSERT INTO notification_engagement_metrics 
        (notificationId, userId, actionTaken, clickedUrl, engagementTime, viewedAt, clickedAt)
        VALUES (${notificationId}, ${userId}, ${action}, ${clickedUrl || null}, ${engagementTime || null},
                ${action === 'viewed' ? new Date() : null},
                ${action === 'clicked' ? new Date() : null})
      `);

      console.log(`[Analytics] Tracked engagement: notification ${notificationId}, action ${action}`);
    } catch (error) {
      console.error('[Analytics] Error tracking engagement:', error);
    }
  }

  /**
   * Get delivery metrics for a time period
   */
  public async getDeliveryMetrics(
    startDate: Date,
    endDate: Date,
    notificationType?: string
  ): Promise<DeliveryMetrics> {
    try {
      const db = await getDb();
      if (!db) return { totalSent: 0, totalDelivered: 0, totalFailed: 0, deliveryRate: 0, failureRate: 0 };

      const query = sql`
        SELECT 
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as totalSent,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as totalDelivered,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as totalFailed
        FROM notification_delivery_metrics
        WHERE createdAt BETWEEN ${startDate} AND ${endDate}
      `;

      const result = await db.execute(query);
      const row = (result as any)[0];

      const totalSent = row?.totalSent || 0;
      const totalDelivered = row?.totalDelivered || 0;
      const totalFailed = row?.totalFailed || 0;

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        failureRate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0,
      };
    } catch (error) {
      console.error('[Analytics] Error getting delivery metrics:', error);
      return { totalSent: 0, totalDelivered: 0, totalFailed: 0, deliveryRate: 0, failureRate: 0 };
    }
  }

  /**
   * Get engagement metrics for a time period
   */
  public async getEngagementMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<EngagementMetrics> {
    try {
      const db = await getDb();
      if (!db) return { totalViewed: 0, totalClicked: 0, engagementRate: 0, clickRate: 0, avgEngagementTime: 0 };

      const query = sql`
        SELECT 
          COUNT(CASE WHEN actionTaken = 'viewed' THEN 1 END) as totalViewed,
          COUNT(CASE WHEN actionTaken = 'clicked' THEN 1 END) as totalClicked,
          AVG(CASE WHEN engagementTime > 0 THEN engagementTime ELSE NULL END) as avgEngagementTime
        FROM notification_engagement_metrics
        WHERE createdAt BETWEEN ${startDate} AND ${endDate}
      `;

      const result = await db.execute(query);
      const row = (result as any)[0];

      const totalViewed = row?.totalViewed || 0;
      const totalClicked = row?.totalClicked || 0;
      const avgEngagementTime = Math.round(row?.avgEngagementTime || 0);

      return {
        totalViewed,
        totalClicked,
        engagementRate: totalViewed > 0 ? (totalClicked / totalViewed) * 100 : 0,
        clickRate: totalViewed > 0 ? (totalClicked / totalViewed) * 100 : 0,
        avgEngagementTime,
      };
    } catch (error) {
      console.error('[Analytics] Error getting engagement metrics:', error);
      return { totalViewed: 0, totalClicked: 0, engagementRate: 0, clickRate: 0, avgEngagementTime: 0 };
    }
  }

  /**
   * Calculate notification effectiveness score
   */
  public async calculateEffectivenessScore(
    notificationId: number,
    deliveryRate: number,
    engagementRate: number
  ): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;

      // Effectiveness score: 60% delivery + 40% engagement
      const effectivenessScore = (deliveryRate * 0.6) + (engagementRate * 0.4);

      await db.execute(sql`
        INSERT INTO notification_effectiveness_scores
        (notificationId, notificationType, priority, deliveryScore, engagementScore, effectivenessScore)
        SELECT 
          ${notificationId},
          n.type,
          n.priority,
          ${deliveryRate},
          ${engagementRate},
          ${effectivenessScore}
        FROM notifications n
        WHERE n.id = ${notificationId}
        ON DUPLICATE KEY UPDATE
          deliveryScore = ${deliveryRate},
          engagementScore = ${engagementRate},
          effectivenessScore = ${effectivenessScore}
      `);

      return effectivenessScore;
    } catch (error) {
      console.error('[Analytics] Error calculating effectiveness score:', error);
      return 0;
    }
  }

  /**
   * Aggregate hourly analytics
   */
  public async aggregateHourlyAnalytics(hour: Date) {
    try {
      const db = await getDb();
      if (!db) return;

      const startOfHour = new Date(hour);
      startOfHour.setMinutes(0, 0, 0);
      const endOfHour = new Date(startOfHour);
      endOfHour.setHours(endOfHour.getHours() + 1);

      const delivery = await this.getDeliveryMetrics(startOfHour, endOfHour);
      const engagement = await this.getEngagementMetrics(startOfHour, endOfHour);

      await db.execute(sql`
        INSERT INTO notification_hourly_analytics
        (hour, totalSent, totalDelivered, totalFailed, totalViewed, totalClicked, 
         deliveryRate, engagementRate, clickRate, avgEngagementTime)
        VALUES (${startOfHour}, ${delivery.totalSent}, ${delivery.totalDelivered}, 
                ${delivery.totalFailed}, ${engagement.totalViewed}, ${engagement.totalClicked},
                ${delivery.deliveryRate}, ${engagement.engagementRate}, ${engagement.clickRate},
                ${engagement.avgEngagementTime})
        ON DUPLICATE KEY UPDATE
          totalSent = ${delivery.totalSent},
          totalDelivered = ${delivery.totalDelivered},
          totalFailed = ${delivery.totalFailed},
          totalViewed = ${engagement.totalViewed},
          totalClicked = ${engagement.totalClicked},
          deliveryRate = ${delivery.deliveryRate},
          engagementRate = ${engagement.engagementRate},
          clickRate = ${engagement.clickRate},
          avgEngagementTime = ${engagement.avgEngagementTime}
      `);

      console.log(`[Analytics] Aggregated hourly analytics for ${startOfHour.toISOString()}`);
    } catch (error) {
      console.error('[Analytics] Error aggregating hourly analytics:', error);
    }
  }

  /**
   * Detect anomalies in notification metrics
   */
  public async detectAnomalies(
    startDate: Date,
    endDate: Date
  ) {
    try {
      const db = await getDb();
      if (!db) return;

      const metrics = await this.getDeliveryMetrics(startDate, endDate);

      // Check for high failure rate (>20%)
      if (metrics.failureRate > 20) {
        await db.execute(sql`
          INSERT INTO notification_anomalies
          (anomalyType, severity, description, affectedNotifications)
          VALUES ('high_failure_rate', 'high', 
                  ${'Failure rate exceeded 20%: ' + metrics.failureRate.toFixed(2) + '%'},
                  ${metrics.totalFailed})
        `);
        console.warn(`[Analytics] Anomaly detected: High failure rate (${metrics.failureRate.toFixed(2)}%)`);
      }
    } catch (error) {
      console.error('[Analytics] Error detecting anomalies:', error);
    }
  }

  /**
   * Get analytics summary for dashboard
   */
  public async getAnalyticsSummary(
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsData> {
    const delivery = await this.getDeliveryMetrics(startDate, endDate);
    const engagement = await this.getEngagementMetrics(startDate, endDate);
    const effectiveness = (delivery.deliveryRate * 0.6) + (engagement.engagementRate * 0.4);

    return {
      delivery,
      engagement,
      effectiveness,
      period: {
        startDate,
        endDate,
      },
    };
  }
}

// Export singleton instance
export const notificationAnalytics = new NotificationAnalyticsService();
