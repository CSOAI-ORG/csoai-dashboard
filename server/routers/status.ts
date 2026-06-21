import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { 
  systemIncidents, 
  incidentUpdates, 
  serviceStatus, 
  uptimeMetrics, 
  apiMetrics,
  statusSubscriptions 
} from "../../drizzle/schema-status";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export const statusRouter = router({
  // Get all active and recent incidents
  getIncidents: publicProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      includeResolved: z.boolean().optional().default(false),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(systemIncidents)
        .where(eq(systemIncidents.isPublic, 1))
        .orderBy(desc(systemIncidents.startedAt))
        .limit(input.limit);

      if (!input.includeResolved) {
        query = db
          .select()
          .from(systemIncidents)
          .where(
            and(
              eq(systemIncidents.isPublic, 1),
              sql`${systemIncidents.status} != 'resolved'`
            )
          )
          .orderBy(desc(systemIncidents.startedAt))
          .limit(input.limit);
      }

      return await query;
    }),

  // Get incident details with updates
  getIncidentDetails: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [incident] = await db
        .select()
        .from(systemIncidents)
        .where(eq(systemIncidents.id, input.id))
        .limit(1);

      if (!incident) return null;

      const updates = await db
        .select()
        .from(incidentUpdates)
        .where(eq(incidentUpdates.incidentId, input.id))
        .orderBy(desc(incidentUpdates.createdAt));

      return { incident, updates };
    }),

  // Report a new incident (public)
  reportIncident: publicProcedure
    .input(z.object({
      title: z.string().min(10).max(255),
      description: z.string().min(20).max(2000),
      severity: z.enum(['minor', 'major', 'critical']),
      affectedServices: z.array(z.string()).optional(),
      reporterEmail: z.string().email().optional(),
      reporterName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(systemIncidents).values({
        title: input.title,
        description: input.description,
        severity: input.severity,
        affectedServices: input.affectedServices ? JSON.stringify(input.affectedServices) : null,
        reportedBy: ctx.user?.id || null,
        reporterEmail: input.reporterEmail || null,
        reporterName: input.reporterName || null,
        status: 'investigating',
        isPublic: 1,
      });

      const incidentId = Number((result as any)[0]?.insertId || 0);

      // Create initial update
      await db.insert(incidentUpdates).values({
        incidentId,
        status: 'investigating',
        message: 'Incident reported and under investigation.',
        createdBy: ctx.user?.id || null,
      });

      return { success: true, incidentId };
    }),

  // Get all service statuses
  getServiceStatus: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(serviceStatus)
      .orderBy(serviceStatus.category, serviceStatus.displayName);
  }),

  // Get uptime statistics
  getUptimeStats: publicProcedure
    .input(z.object({
      serviceName: z.string().optional(),
      days: z.number().optional().default(30),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      const startDateStr = startDate.toISOString().split('T')[0];

      let query = db
        .select()
        .from(uptimeMetrics)
        .where(gte(uptimeMetrics.date, startDateStr))
        .orderBy(uptimeMetrics.date);

      if (input.serviceName) {
        query = db
          .select()
          .from(uptimeMetrics)
          .where(
            and(
              eq(uptimeMetrics.serviceName, input.serviceName),
              gte(uptimeMetrics.date, startDateStr)
            )
          )
          .orderBy(uptimeMetrics.date);
      }

      return await query;
    }),

  // Get overall uptime percentage
  getOverallUptime: publicProcedure
    .input(z.object({
      days: z.number().optional().default(30),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { uptime: 0, days: input.days };

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const result = await db
        .select({
          avgUptime: sql<number>`AVG(${uptimeMetrics.uptimePercent})`,
          totalChecks: sql<number>`SUM(${uptimeMetrics.totalChecks})`,
          successfulChecks: sql<number>`SUM(${uptimeMetrics.successfulChecks})`,
        })
        .from(uptimeMetrics)
        .where(gte(uptimeMetrics.date, startDateStr));

      const avgUptime = result[0]?.avgUptime || 0;
      const uptime = typeof avgUptime === 'string' ? parseFloat(avgUptime) : Number(avgUptime);
      return {
        uptime: Number(uptime.toFixed(2)),
        days: input.days,
        totalChecks: result[0]?.totalChecks || 0,
        successfulChecks: result[0]?.successfulChecks || 0,
      };
    }),

  // Get API response time metrics
  getApiMetrics: publicProcedure
    .input(z.object({
      endpoint: z.string().optional(),
      hours: z.number().optional().default(24),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - input.hours);

      let query = db
        .select()
        .from(apiMetrics)
        .where(gte(apiMetrics.timestamp, startTime.toISOString()))
        .orderBy(desc(apiMetrics.timestamp))
        .limit(1000);

      if (input.endpoint) {
        query = db
          .select()
          .from(apiMetrics)
          .where(
            and(
              eq(apiMetrics.endpoint, input.endpoint),
              gte(apiMetrics.timestamp, startTime.toISOString())
            )
          )
          .orderBy(desc(apiMetrics.timestamp))
          .limit(1000);
      }

      return await query;
    }),

  // Subscribe to status updates
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().email(),
      services: z.array(z.string()).optional(),
      notifyOnIncident: z.boolean().optional().default(true),
      notifyOnResolution: z.boolean().optional().default(true),
      notifyOnMaintenance: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(statusSubscriptions).values({
        email: input.email,
        services: input.services ? JSON.stringify(input.services) : null,
        notifyOnIncident: input.notifyOnIncident ? 1 : 0,
        notifyOnResolution: input.notifyOnResolution ? 1 : 0,
        notifyOnMaintenance: input.notifyOnMaintenance ? 1 : 0,
        isActive: 1,
      });

      const subscriptionId = Number((result as any)[0]?.insertId || 0);

      return { success: true, subscriptionId };
    }),

  // Admin: Update incident status
  updateIncident: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
      message: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update incident status
      const updateData: any = { status: input.status };
      if (input.status === 'identified') updateData.identifiedAt = new Date().toISOString();
      if (input.status === 'monitoring') updateData.monitoringAt = new Date().toISOString();
      if (input.status === 'resolved') updateData.resolvedAt = new Date().toISOString();

      await db
        .update(systemIncidents)
        .set(updateData)
        .where(eq(systemIncidents.id, input.id));

      // Add update message
      await db.insert(incidentUpdates).values({
        incidentId: input.id,
        status: input.status,
        message: input.message,
        createdBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Admin: Update service status
  updateServiceStatus: protectedProcedure
    .input(z.object({
      serviceName: z.string(),
      status: z.enum(['operational', 'degraded', 'partial_outage', 'major_outage']),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(serviceStatus)
        .set({
          status: input.status,
          lastCheckedAt: new Date().toISOString(),
        })
        .where(eq(serviceStatus.serviceName, input.serviceName));

      return { success: true };
    }),
});
