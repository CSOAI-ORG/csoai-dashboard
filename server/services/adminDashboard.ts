import { getDb } from "../db";
import { websocketConnections, realtimeEvents } from "../../drizzle/schema";
import { eq, gte, desc, count } from "drizzle-orm";

export interface DashboardMetrics {
  activeConnections: number;
  eventThroughput: number;
  systemHealth: number;
  averageLatency: number;
  errorRate: number;
  timestamp: Date;
}

export interface DashboardStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topJurisdictions: Array<{ jurisdiction: string; count: number }>;
  recentEvents: any[];
  systemHealth: {
    uptime: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// In-memory metrics storage (until adminMetrics table is added to schema)
const metricsStore: Array<{
  id: number;
  metricType: string;
  value: number;
  metadata: string | null;
  recordedAt: Date;
}> = [];
let metricsIdCounter = 1;

export class AdminDashboard {
  /**
   * Record metrics
   */
  static async recordMetric(
    metricType: string,
    value: number,
    metadata?: Record<string, any>
  ) {
    // Store in memory
    metricsStore.push({
      id: metricsIdCounter++,
      metricType,
      value,
      metadata: metadata ? JSON.stringify(metadata) : null,
      recordedAt: new Date(),
    });
    
    // Keep only last 1000 metrics
    if (metricsStore.length > 1000) {
      metricsStore.shift();
    }
    
    return { id: metricsIdCounter - 1 };
  }

  /**
   * Get current metrics
   */
  static async getCurrentMetrics(): Promise<DashboardMetrics> {
    const db = await getDb();
    
    let activeConnections = 0;
    if (db) {
      try {
        const connectionsResult = await db
          .select({ count: count() })
          .from(websocketConnections)
          .where(eq(websocketConnections.isActive, 1));
        activeConnections = connectionsResult[0]?.count || 0;
      } catch {
        activeConnections = 0;
      }
    }

    // Get recent metrics from memory
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentMetrics = metricsStore.filter(
      (m) => m.recordedAt >= fiveMinutesAgo
    );

    // Calculate averages
    const throughputMetrics = recentMetrics.filter(
      (m) => m.metricType === "event_throughput"
    );
    const latencyMetrics = recentMetrics.filter(
      (m) => m.metricType === "latency"
    );
    const errorMetrics = recentMetrics.filter(
      (m) => m.metricType === "error_rate"
    );
    const healthMetrics = recentMetrics.filter(
      (m) => m.metricType === "system_health"
    );

    const avgThroughput =
      throughputMetrics.length > 0
        ? throughputMetrics.reduce((sum, m) => sum + m.value, 0) /
          throughputMetrics.length
        : 0;

    const avgLatency =
      latencyMetrics.length > 0
        ? latencyMetrics.reduce((sum, m) => sum + m.value, 0) /
          latencyMetrics.length
        : 0;

    const avgErrorRate =
      errorMetrics.length > 0
        ? errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length
        : 0;

    const avgHealth =
      healthMetrics.length > 0
        ? healthMetrics.reduce((sum, m) => sum + m.value, 0) / healthMetrics.length
        : 100;

    return {
      activeConnections,
      eventThroughput: avgThroughput,
      systemHealth: avgHealth,
      averageLatency: avgLatency,
      errorRate: avgErrorRate,
      timestamp: new Date(),
    };
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const db = await getDb();
    
    let totalEvents = 0;
    let eventsByType: Record<string, number> = {};
    let eventsBySeverity: Record<string, number> = {};
    let recentEventsData: any[] = [];

    if (db) {
      try {
        // Get total events
        const totalEventsResult = await db
          .select({ count: count() })
          .from(realtimeEvents);
        totalEvents = totalEventsResult[0]?.count || 0;

        // Get events by type
        const eventsByTypeResult = await db
          .select({
            type: realtimeEvents.eventType,
            count: count(),
          })
          .from(realtimeEvents)
          .groupBy(realtimeEvents.eventType);

        eventsByType = eventsByTypeResult.reduce(
          (acc, row) => {
            acc[row.type || "unknown"] = row.count;
            return acc;
          },
          {} as Record<string, number>
        );

        // Get events by severity
        const eventsBySeverityResult = await db
          .select({
            severity: realtimeEvents.severity,
            count: count(),
          })
          .from(realtimeEvents)
          .groupBy(realtimeEvents.severity);

        eventsBySeverity = eventsBySeverityResult.reduce(
          (acc, row) => {
            acc[row.severity || "unknown"] = row.count;
            return acc;
          },
          {} as Record<string, number>
        );

        // Get recent events
        recentEventsData = await db
          .select()
          .from(realtimeEvents)
          .orderBy(desc(realtimeEvents.createdAt))
          .limit(20);
      } catch {
        // Use defaults
      }
    }

    // Get current metrics
    const metrics = await this.getCurrentMetrics();

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      topJurisdictions: [],
      recentEvents: recentEventsData,
      systemHealth: {
        uptime: Date.now() / 1000,
        activeConnections: metrics.activeConnections,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0,
      },
    };
  }

  /**
   * Get metrics history for charting
   */
  static async getMetricsHistory(
    metricType: string,
    hoursBack: number = 24
  ) {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    return metricsStore
      .filter((m) => m.metricType === metricType && m.recordedAt >= cutoffTime)
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  }

  /**
   * Get connection timeline
   */
  static async getConnectionTimeline(hoursBack: number = 24) {
    const db = await getDb();
    if (!db) return [];

    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    try {
      const connections = await db
        .select()
        .from(websocketConnections)
        .where(gte(websocketConnections.createdAt, cutoffTime.toISOString()))
        .orderBy(websocketConnections.createdAt);

      // Group by hour
      const timeline = connections.reduce(
        (acc, conn) => {
          const hour = new Date(conn.createdAt).toISOString().slice(0, 13);
          if (!acc[hour]) acc[hour] = 0;
          acc[hour]++;
          return acc;
        },
        {} as Record<string, number>
      );

      return Object.entries(timeline).map(([time, count]) => ({
        time,
        connections: count,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get system alerts
   */
  static async getSystemAlerts() {
    const metrics = await this.getCurrentMetrics();
    const alerts = [];

    if (metrics.errorRate > 5) {
      alerts.push({
        severity: "critical",
        message: `High error rate detected: ${metrics.errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString(),
      });
    }

    if (metrics.averageLatency > 1000) {
      alerts.push({
        severity: "warning",
        message: `High latency detected: ${metrics.averageLatency.toFixed(0)}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    if (metrics.activeConnections > 10000) {
      alerts.push({
        severity: "info",
        message: `High connection count: ${metrics.activeConnections}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (metrics.systemHealth < 50) {
      alerts.push({
        severity: "critical",
        message: `System health critical: ${metrics.systemHealth.toFixed(0)}%`,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }
}
