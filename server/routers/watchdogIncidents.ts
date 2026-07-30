import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { watchdogReports, watchdogComments } from "../../drizzle/schema";
import { eq, desc, and, like, or, sql, count } from "drizzle-orm";

export const watchdogIncidentsRouter = router({
  // Get list of all incidents with filtering and pagination
  list: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      severity: z.enum(['low', 'medium', 'high', 'critical', 'all']).optional().default('all'),
      status: z.enum(['submitted', 'under_review', 'investigating', 'resolved', 'dismissed', 'all']).optional().default('all'),
      incidentType: z.enum(['bias', 'privacy', 'safety', 'misinformation', 'manipulation', 'other', 'all']).optional().default('all'),
      search: z.string().optional(),
      sortBy: z.enum(['recent', 'severity', 'upvotes']).optional().default('recent'),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { incidents: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

      const { page = 1, limit = 20, severity = 'all', status = 'all', incidentType = 'all', search, sortBy = 'recent' } = input || {};
      const offset = (page - 1) * limit;

      // Build conditions
      const conditions: any[] = [eq(watchdogReports.isPublic, 1)];
      
      if (severity !== 'all') {
        conditions.push(eq(watchdogReports.severity, severity));
      }
      if (status !== 'all') {
        conditions.push(eq(watchdogReports.status, status));
      }
      if (incidentType !== 'all') {
        conditions.push(eq(watchdogReports.incidentType, incidentType));
      }
      if (search) {
        conditions.push(
          or(
            like(watchdogReports.title, `%${search}%`),
            like(watchdogReports.description, `%${search}%`),
            like(watchdogReports.aiSystemName, `%${search}%`),
            like(watchdogReports.companyName, `%${search}%`)
          )!
        );
      }

      // Get total count
      const countResult = await db
        .select({ total: count() })
        .from(watchdogReports)
        .where(and(...conditions));
      const total = countResult[0]?.total || 0;

      // Get incidents with sorting
      let orderBy;
      switch (sortBy) {
        case 'severity':
          orderBy = sql`FIELD(${watchdogReports.severity}, 'critical', 'high', 'medium', 'low')`;
          break;
        case 'upvotes':
          orderBy = desc(watchdogReports.upvotes);
          break;
        case 'recent':
        default:
          orderBy = desc(watchdogReports.createdAt);
      }

      const incidents = await db
        .select({
          id: watchdogReports.id,
          title: watchdogReports.title,
          description: watchdogReports.description,
          aiSystemName: watchdogReports.aiSystemName,
          companyName: watchdogReports.companyName,
          incidentType: watchdogReports.incidentType,
          severity: watchdogReports.severity,
          status: watchdogReports.status,
          upvotes: watchdogReports.upvotes,
          downvotes: watchdogReports.downvotes,
          reporterName: watchdogReports.reporterName,
          createdAt: watchdogReports.createdAt,
          updatedAt: watchdogReports.updatedAt,
        })
        .from(watchdogReports)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return {
        incidents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single incident by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const incidentResult = await db
        .select()
        .from(watchdogReports)
        .where(eq(watchdogReports.id, input.id))
        .limit(1);

      const incident = incidentResult[0];
      if (!incident) {
        return null;
      }

      // Get comments for this incident
      const comments = await db
        .select()
        .from(watchdogComments)
        .where(eq(watchdogComments.reportId, input.id))
        .orderBy(desc(watchdogComments.createdAt));

      return {
        ...incident,
        comments,
      };
    }),

  // Get incident statistics
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, critical: 0, high: 0, medium: 0, low: 0, resolved: 0, investigating: 0, underReview: 0, submitted: 0, byType: [] };

    const statsResult = await db
      .select({
        total: count(),
        critical: sql<number>`SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END)`,
        high: sql<number>`SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END)`,
        medium: sql<number>`SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END)`,
        low: sql<number>`SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END)`,
        resolved: sql<number>`SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END)`,
        investigating: sql<number>`SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END)`,
        underReview: sql<number>`SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END)`,
        submitted: sql<number>`SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END)`,
      })
      .from(watchdogReports)
      .where(eq(watchdogReports.isPublic, 1));

    const stats = statsResult[0] || { total: 0, critical: 0, high: 0, medium: 0, low: 0, resolved: 0, investigating: 0, underReview: 0, submitted: 0 };

    // Get incident type breakdown
    const typeBreakdown = await db
      .select({
        type: watchdogReports.incidentType,
        count: count(),
      })
      .from(watchdogReports)
      .where(eq(watchdogReports.isPublic, 1))
      .groupBy(watchdogReports.incidentType);

    return {
      ...stats,
      byType: typeBreakdown,
    };
  }),

  // Submit a new incident report
  submit: publicProcedure
    .input(z.object({
      title: z.string().min(10, "Title must be at least 10 characters"),
      description: z.string().min(50, "Description must be at least 50 characters"),
      aiSystemName: z.string().optional(),
      companyName: z.string().optional(),
      incidentType: z.enum(['bias', 'privacy', 'safety', 'misinformation', 'manipulation', 'other']),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
      reporterEmail: z.string().email().optional(),
      reporterName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(watchdogReports).values({
        title: input.title,
        description: input.description,
        aiSystemName: input.aiSystemName,
        companyName: input.companyName,
        incidentType: input.incidentType,
        severity: input.severity,
        reporterEmail: input.reporterEmail,
        reporterName: input.reporterName || 'Anonymous',
        status: 'submitted',
        isPublic: 1,
      });

      return { success: true, id: (result[0] as any).insertId };
    }),

  // Upvote an incident
  upvote: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(watchdogReports)
        .set({ upvotes: sql`${watchdogReports.upvotes} + 1` })
        .where(eq(watchdogReports.id, input.id));

      return { success: true };
    }),

  // Downvote an incident
  downvote: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(watchdogReports)
        .set({ downvotes: sql`${watchdogReports.downvotes} + 1` })
        .where(eq(watchdogReports.id, input.id));

      return { success: true };
    }),

  // Add comment to incident (protected - requires login)
  addComment: protectedProcedure
    .input(z.object({
      reportId: z.number(),
      content: z.string().min(10, "Comment must be at least 10 characters"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(watchdogComments).values({
        reportId: input.reportId,
        userId: ctx.user.id,
        authorName: ctx.user.name || 'Anonymous',
        content: input.content,
        isOfficial: ctx.user.role === 'admin' || ctx.user.role === 'watchdog_analyst' ? 1 : 0,
      });

      return { success: true, id: (result[0] as any).insertId };
    }),

  // Update incident status (admin/analyst only)
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['submitted', 'under_review', 'investigating', 'resolved', 'dismissed']),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'watchdog_analyst') {
        throw new Error('Unauthorized: Only admins and analysts can update incident status');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(watchdogReports)
        .set({ status: input.status })
        .where(eq(watchdogReports.id, input.id));

      return { success: true };
    }),
});
