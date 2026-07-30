/**
 * Admin Incidents Router
 * Manage system incidents with automatic subscriber notifications
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { systemIncidents, incidentUpdates, serviceStatus } from "../../drizzle/schema-status";
import { users } from "../../drizzle/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyIncidentCreated, notifyIncidentUpdated, notifyIncidentResolved } from "../services/statusNotifications";

export const adminIncidentsRouter = router({
  /**
   * Get all incidents with pagination
   */
  getIncidents: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(['investigating', 'identified', 'monitoring', 'resolved', 'all']).default('all'),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const { page, limit, status } = input;
      const offset = (page - 1) * limit;

      // Build query
      const whereClause = status !== 'all' ? eq(systemIncidents.status, status as any) : undefined;
      
      const incidents = await db
        .select()
        .from(systemIncidents)
        .where(whereClause)
        .orderBy(desc(systemIncidents.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(systemIncidents)
        .where(status !== 'all' ? eq(systemIncidents.status, status as any) : undefined);

      return {
        incidents,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    }),

  /**
   * Get incident details with updates
   */
  getIncidentDetails: protectedProcedure
    .input(z.object({ incidentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      const [incident] = await db
        .select()
        .from(systemIncidents)
        .where(eq(systemIncidents.id, input.incidentId))
        .limit(1);

      if (!incident) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Incident not found' });
      }

      // Get updates
      const updates = await db
        .select()
        .from(incidentUpdates)
        .where(eq(incidentUpdates.incidentId, input.incidentId))
        .orderBy(desc(incidentUpdates.createdAt));

      return {
        incident,
        updates,
      };
    }),

  /**
   * Create new incident
   */
  createIncident: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        severity: z.enum(['minor', 'major', 'critical']),
        affectedServices: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Create incident
      const result = await db
        .insert(systemIncidents)
        .values({
          title: input.title,
          description: input.description,
          severity: input.severity,
          status: 'investigating',
          affectedServices: JSON.stringify(input.affectedServices),
          reportedBy: ctx.user.id,
          startedAt: new Date().toISOString(),
        });

      const incidentId = Number((result as any).insertId);

      // Send notifications to subscribers
      await notifyIncidentCreated(incidentId);

      return { success: true, incidentId };
    }),

  /**
   * Update incident status
   */
  updateIncidentStatus: protectedProcedure
    .input(
      z.object({
        incidentId: z.number(),
        status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Update incident
      const updateData: any = {
        status: input.status,
        updatedAt: new Date().toISOString(),
      };

      if (input.status === 'identified') {
        updateData.identifiedAt = new Date().toISOString();
      } else if (input.status === 'monitoring') {
        updateData.monitoringAt = new Date().toISOString();
      } else if (input.status === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }

      await db
        .update(systemIncidents)
        .set(updateData)
        .where(eq(systemIncidents.id, input.incidentId));

      // Add update entry
      await db.insert(incidentUpdates).values({
        incidentId: input.incidentId,
        status: input.status,
        message: input.message,
        createdBy: ctx.user.id,
      });

      // Send notifications
      if (input.status === 'resolved') {
        await notifyIncidentResolved(input.incidentId);
      } else {
        await notifyIncidentUpdated(input.incidentId, input.message);
      }

      return { success: true };
    }),

  /**
   * Post incident update
   */
  postIncidentUpdate: protectedProcedure
    .input(
      z.object({
        incidentId: z.number(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Get current incident status
      const [incident] = await db
        .select()
        .from(systemIncidents)
        .where(eq(systemIncidents.id, input.incidentId))
        .limit(1);

      if (!incident) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Incident not found' });
      }

      // Add update entry
      await db.insert(incidentUpdates).values({
        incidentId: input.incidentId,
        status: incident.status,
        message: input.message,
        createdBy: ctx.user.id,
      });

      // Send notification
      await notifyIncidentUpdated(input.incidentId, input.message);

      return { success: true };
    }),

  /**
   * Delete incident (admin only, use with caution)
   */
  deleteIncident: protectedProcedure
    .input(z.object({ incidentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      // Check if user is admin
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Delete updates first
      await db.delete(incidentUpdates).where(eq(incidentUpdates.incidentId, input.incidentId));

      // Delete incident
      await db.delete(systemIncidents).where(eq(systemIncidents.id, input.incidentId));

      return { success: true };
    }),

  /**
   * Get available services for incident creation
   */
  getAvailableServices: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

    // Check if user is admin
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user || user.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }

    const services = await db.select().from(serviceStatus).orderBy(serviceStatus.displayName);

    return services;
  }),
});

// Import sql from drizzle-orm
import { sql } from "drizzle-orm";
