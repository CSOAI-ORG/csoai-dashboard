/**
 * Reports Router
 * Handles report generation, scheduling, and downloads
 */

import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { getDb } from '../db.js';
import { aiSystems, assessments, frameworks } from '../../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';
import { ReportGenerator } from '../services/reportGenerator.js';
import { TRPCError } from '@trpc/server';

export const reportsRouter = router({
  /**
   * Generate a compliance report on-demand
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number(),
        frameworkId: z.number(),
        format: z.enum(['pdf', 'excel']),
        dateRange: z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify user has access to this AI system
        const [system] = await db
          .select()
          .from(aiSystems)
          .where(and(
            eq(aiSystems.id, input.aiSystemId),
            eq(aiSystems.userId, ctx.user.id)
          ))
          .limit(1);

        if (!system) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this AI system',
          });
        }

        // Get framework details
        const [framework] = await db
          .select()
          .from(frameworks)
          .where(eq(frameworks.id, input.frameworkId))
          .limit(1);

        if (!framework) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Framework not found',
          });
        }

        // Get assessments for this system and framework
        const [assessmentData] = await db
          .select()
          .from(assessments)
          .where(and(
            eq(assessments.aiSystemId, input.aiSystemId),
            eq(assessments.frameworkId, input.frameworkId)
          ))
          .limit(1);

        if (!assessmentData) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No assessment found for this system and framework',
          });
        }

        // Generate PDF or Excel based on format
        let reportBuffer: Buffer;
        let mimeType: string;
        let filename: string;

        if (input.format === 'pdf') {
          reportBuffer = await ReportGenerator.generatePDF({
            title: `${system.name} - ${framework.name} Compliance Report`,
            jurisdiction: 'Global',
            organizationName: system.name,
            reportPeriod: {
              start: input.dateRange?.startDate ? new Date(input.dateRange.startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              end: input.dateRange?.endDate ? new Date(input.dateRange.endDate) : new Date(),
            },
            complianceScore: calculateComplianceScore(assessmentData),
            auditResults: [],
            enforcementActions: [],
            certifications: [],
            trends: {
              riskTrend: 'stable',
              complianceTrend: 'improving',
              keyMetrics: {},
            },
            recommendations: [],
          });
          mimeType = 'application/pdf';
          filename = `${system.name}-${framework.name}-report-${Date.now()}.pdf`;
        } else {
          // Excel format - using a simple CSV for now
          const csv = generateComplianceCSV({
            systemName: system.name,
            frameworkName: framework.name,
            assessmentData: assessmentData,
          });
          reportBuffer = Buffer.from(csv, 'utf-8');
          mimeType = 'text/csv';
          filename = `${system.name}-${framework.name}-report-${Date.now()}.csv`;
        }

        return {
          success: true,
          reportId: `report_${Date.now()}`,
          filename,
          mimeType,
          size: reportBuffer.length,
          generatedAt: new Date().toISOString(),
          downloadUrl: `/api/download-report/${Date.now()}`,
        };
      } catch (error) {
        console.error('Error generating report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate report',
        });
      }
    }),

  /**
   * Schedule a report for automated generation
   */
  scheduleReport: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number(),
        frameworkId: z.number(),
        format: z.enum(['pdf', 'excel']),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual']),
        recipients: z.array(z.string().email()),
        startDate: z.string(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify user has access to this AI system
        const [system] = await db
          .select()
          .from(aiSystems)
          .where(and(
            eq(aiSystems.id, input.aiSystemId),
            eq(aiSystems.userId, ctx.user.id)
          ))
          .limit(1);

        if (!system) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this AI system',
          });
        }

        // In a production system, this would create a scheduled job
        // For now, we return a confirmation
        return {
          success: true,
          scheduleId: `schedule_${Date.now()}`,
          message: `Report scheduled for ${input.frequency} delivery`,
          nextGenerationDate: new Date().toISOString(),
          recipients: input.recipients,
          status: 'active',
        };
      } catch (error) {
        console.error('Error scheduling report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule report',
        });
      }
    }),

  /**
   * Get list of scheduled reports for a user
   */
  getScheduledReports: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify user has access to the AI system if specified
        if (input.aiSystemId) {
          const [system] = await db
            .select()
            .from(aiSystems)
            .where(and(
              eq(aiSystems.id, input.aiSystemId),
              eq(aiSystems.userId, ctx.user.id)
            ))
            .limit(1);

          if (!system) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You do not have access to this AI system',
            });
          }
        }

        // Return mock scheduled reports for now
        return {
          schedules: [
            {
              id: 'schedule_1',
              aiSystemId: input.aiSystemId || 1,
              frequency: 'monthly',
              format: 'pdf',
              recipients: ['admin@example.com'],
              nextGenerationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              lastGeneratedDate: new Date().toISOString(),
              status: 'active',
            },
          ],
          total: 1,
        };
      } catch (error) {
        console.error('Error fetching scheduled reports:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch scheduled reports',
        });
      }
    }),

  /**
   * Cancel a scheduled report
   */
  cancelScheduledReport: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // In a production system, this would delete the scheduled job
        return {
          success: true,
          message: 'Scheduled report cancelled',
          scheduleId: input.scheduleId,
        };
      } catch (error) {
        console.error('Error cancelling scheduled report:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel scheduled report',
        });
      }
    }),

  /**
   * Get report history for a user
   */
  getReportHistory: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Return mock report history for now
        return {
          reports: [
            {
              id: 'report_1',
              aiSystemId: input.aiSystemId || 1,
              frameworkName: 'EU AI Act',
              format: 'pdf',
              generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              size: 2048000,
              status: 'completed',
              downloadUrl: '/api/download-report/1',
            },
            {
              id: 'report_2',
              aiSystemId: input.aiSystemId || 1,
              frameworkName: 'NIST AI RMF',
              format: 'excel',
              generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              size: 512000,
              status: 'completed',
              downloadUrl: '/api/download-report/2',
            },
          ],
          total: 2,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error('Error fetching report history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch report history',
        });
      }
    }),
});

/**
 * Helper function to calculate compliance score from assessment data
 */
function calculateComplianceScore(assessmentData: any): number {
  if (!assessmentData.items || assessmentData.items.length === 0) return 0;
  
  const compliantItems = assessmentData.items.filter(
    (item: any) => item.status === 'compliant'
  ).length;
  
  return Math.round((compliantItems / assessmentData.items.length) * 100);
}

/**
 * Helper function to generate CSV format compliance report
 */
function generateComplianceCSV(data: {
  systemName: string;
  frameworkName: string;
  assessmentData: any;
}): string {
  const headers = ['Requirement', 'Status', 'Evidence', 'Notes'];
  const rows: string[] = [headers.join(',')];

  if (data.assessmentData.items) {
    data.assessmentData.items.forEach((item: any) => {
      rows.push([
        `"${item.requirementId}"`,
        `"${item.status}"`,
        `"${item.evidence || ''}"`,
        `"${item.notes || ''}"`,
      ].join(','));
    });
  }

  return rows.join('\n');
}
