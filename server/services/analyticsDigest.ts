/**
 * Analytics Digest Service
 * Send daily/weekly summaries of incidents and compliance changes to subscribers
 */

import { getDb } from "../db";
import { 
  users, 
  watchdogReports, 
  assessments, 
  notificationPreferences,
  aiSystems,
  frameworks 
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { sendEmail } from "../emailService";

interface IncidentSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byType: Record<string, number>;
  recentIncidents: Array<{
    title: string;
    severity: string;
    incidentType: string;
    createdAt: string;
  }>;
}

interface ComplianceSummary {
  totalAssessments: number;
  averageScore: number;
  improved: number;
  declined: number;
  recentAssessments: Array<{
    aiSystemName: string;
    frameworkName: string;
    score: number;
    createdAt: string;
  }>;
}

/**
 * Generate HTML email digest template for analytics
 */
function generateAnalyticsDigestHTML(
  userName: string,
  incidentSummary: IncidentSummary,
  complianceSummary: ComplianceSummary,
  frequency: 'daily' | 'weekly'
): string {
  const period = frequency === 'daily' ? 'Today' : 'This Week';
  
  const incidentTypeItems = Object.entries(incidentSummary.byType)
    .map(([type, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: #374151; text-transform: capitalize;">${type}</span>
        <span style="color: #6b7280; font-weight: 600;">${count}</span>
      </div>
    `)
    .join('');

  const recentIncidentsItems = incidentSummary.recentIncidents
    .slice(0, 5)
    .map((incident) => `
      <div style="border-left: 4px solid ${getSeverityColor(incident.severity)}; padding: 12px; margin-bottom: 12px; background: #f9fafb;">
        <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${incident.title}</div>
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
          <span style="text-transform: capitalize;">${incident.incidentType}</span> • 
          <span style="text-transform: capitalize;">${incident.severity}</span>
        </div>
        <div style="font-size: 12px; color: #9ca3af;">${formatDate(new Date(incident.createdAt))}</div>
      </div>
    `)
    .join('');

  const recentAssessmentsItems = complianceSummary.recentAssessments
    .slice(0, 5)
    .map((assessment) => `
      <div style="padding: 12px; margin-bottom: 12px; background: #f9fafb; border-radius: 6px;">
        <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${assessment.aiSystemName}</div>
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
          Framework: ${assessment.frameworkName}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #9ca3af;">${formatDate(new Date(assessment.createdAt))}</span>
          <span style="font-weight: 600; color: ${getScoreColor(assessment.score)};">${assessment.score}%</span>
        </div>
      </div>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>COAI Analytics Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📊 COAI Analytics Digest</h1>
            <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">${period}'s Incidents & Compliance Summary</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #374151; margin: 0 0 20px 0;">
              Hi ${userName},
            </p>
            <p style="color: #374151; margin: 0 0 30px 0;">
              Here's your ${frequency} summary of AI incidents and compliance changes:
            </p>

            <!-- Incident Summary Section -->
            <div style="margin-bottom: 40px;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">
                🚨 Incident Summary
              </h2>
              
              <!-- Incident Stats Grid -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #991b1b; margin-bottom: 4px;">Total Incidents</div>
                  <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${incidentSummary.total}</div>
                </div>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #991b1b; margin-bottom: 4px;">Critical</div>
                  <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${incidentSummary.critical}</div>
                </div>
                <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #9a3412; margin-bottom: 4px;">High</div>
                  <div style="font-size: 28px; font-weight: 700; color: #ea580c;">${incidentSummary.high}</div>
                </div>
                <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #854d0e; margin-bottom: 4px;">Medium</div>
                  <div style="font-size: 28px; font-weight: 700; color: #ca8a04;">${incidentSummary.medium}</div>
                </div>
              </div>

              <!-- Incident Types Breakdown -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Incidents by Type</h3>
                ${incidentTypeItems}
              </div>

              <!-- Recent Incidents -->
              ${incidentSummary.recentIncidents.length > 0 ? `
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Recent Incidents</h3>
                ${recentIncidentsItems}
              ` : '<p style="color: #6b7280; font-style: italic;">No recent incidents</p>'}
            </div>

            <!-- Compliance Summary Section -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
                ✅ Compliance Summary
              </h2>
              
              <!-- Compliance Stats Grid -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #166534; margin-bottom: 4px;">Total Assessments</div>
                  <div style="font-size: 28px; font-weight: 700; color: #16a34a;">${complianceSummary.totalAssessments}</div>
                </div>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #166534; margin-bottom: 4px;">Average Score</div>
                  <div style="font-size: 28px; font-weight: 700; color: #16a34a;">${complianceSummary.averageScore}%</div>
                </div>
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #1e40af; margin-bottom: 4px;">Improved</div>
                  <div style="font-size: 28px; font-weight: 700; color: #2563eb;">${complianceSummary.improved}</div>
                </div>
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px;">
                  <div style="font-size: 14px; color: #991b1b; margin-bottom: 4px;">Declined</div>
                  <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${complianceSummary.declined}</div>
                </div>
              </div>

              <!-- Recent Assessments -->
              ${complianceSummary.recentAssessments.length > 0 ? `
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 12px 0;">Recent Assessments</h3>
                ${recentAssessmentsItems}
              ` : '<p style="color: #6b7280; font-style: italic;">No recent assessments</p>'}
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://coai-dash-k34vnbtb.manus.space/analytics" style="display: inline-block; background: #0f172a; color: white; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                View Full Analytics Dashboard
              </a>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                You're receiving this ${frequency} digest because you're subscribed to COAI analytics updates.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                <a href="https://coai-dash-k34vnbtb.manus.space/settings/notifications" style="color: #3b82f6; text-decoration: none;">Manage subscription preferences</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#dc2626';
    case 'high':
      return '#ea580c';
    case 'medium':
      return '#ca8a04';
    case 'low':
      return '#16a34a';
    default:
      return '#6b7280';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#ca8a04';
  return '#dc2626';
}

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Send daily analytics digest emails
 */
export async function sendDailyAnalyticsDigests(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[AnalyticsDigest] Database not available');
    return;
  }

  // Get users with daily digest enabled
  const usersWithDigest = await db
    .select({
      userId: notificationPreferences.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(notificationPreferences)
    .leftJoin(users, eq(notificationPreferences.userId, users.id))
    .where(
      and(
        eq(notificationPreferences.digestEnabled, 1),
        eq(notificationPreferences.digestFrequency, 'daily')
      )
    );

  console.log(`[AnalyticsDigest] Processing daily digests for ${usersWithDigest.length} users`);

  // Get yesterday's date range
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterdayStr = yesterday.toISOString();
  const todayStr = today.toISOString();

  // Fetch incident summary
  const incidentSummary = await getIncidentSummary(db, yesterdayStr, todayStr);
  
  // Fetch compliance summary
  const complianceSummary = await getComplianceSummary(db, yesterdayStr, todayStr);

  // Skip if no data
  if (incidentSummary.total === 0 && complianceSummary.totalAssessments === 0) {
    console.log('[AnalyticsDigest] No incidents or assessments yesterday, skipping digests');
    return;
  }

  for (const user of usersWithDigest) {
    if (!user.userEmail || !user.userId) continue;

    // Generate and send digest email
    const htmlContent = generateAnalyticsDigestHTML(
      user.userName || 'User',
      incidentSummary,
      complianceSummary,
      'daily'
    );

    try {
      await sendEmail({
        to: user.userEmail,
        subject: `COAI Daily Analytics Digest - ${incidentSummary.total} incidents, ${complianceSummary.totalAssessments} assessments`,
        html: htmlContent,
      });

      console.log(`[AnalyticsDigest] Sent daily digest to user ${user.userId}`);
    } catch (error) {
      console.error(`[AnalyticsDigest] Failed to send digest to user ${user.userId}:`, error);
    }
  }
}

/**
 * Send weekly analytics digest emails
 */
export async function sendWeeklyAnalyticsDigests(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[AnalyticsDigest] Database not available');
    return;
  }

  // Get users with weekly digest enabled
  const usersWithDigest = await db
    .select({
      userId: notificationPreferences.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(notificationPreferences)
    .leftJoin(users, eq(notificationPreferences.userId, users.id))
    .where(
      and(
        eq(notificationPreferences.digestEnabled, 1),
        eq(notificationPreferences.digestFrequency, 'weekly')
      )
    );

  console.log(`[AnalyticsDigest] Processing weekly digests for ${usersWithDigest.length} users`);

  // Get last week's date range
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0);
  const todayWeekly = new Date();
  todayWeekly.setHours(0, 0, 0, 0);
  const lastWeekStr = lastWeek.toISOString();
  const todayWeeklyStr = todayWeekly.toISOString();

  // Fetch incident summary
  const incidentSummary = await getIncidentSummary(db, lastWeekStr, todayWeeklyStr);
  
  // Fetch compliance summary
  const complianceSummary = await getComplianceSummary(db, lastWeekStr, todayWeeklyStr);

  // Skip if no data
  if (incidentSummary.total === 0 && complianceSummary.totalAssessments === 0) {
    console.log('[AnalyticsDigest] No incidents or assessments last week, skipping digests');
    return;
  }

  for (const user of usersWithDigest) {
    if (!user.userEmail || !user.userId) continue;

    // Generate and send digest email
    const htmlContent = generateAnalyticsDigestHTML(
      user.userName || 'User',
      incidentSummary,
      complianceSummary,
      'weekly'
    );

    try {
      await sendEmail({
        to: user.userEmail,
        subject: `COAI Weekly Analytics Digest - ${incidentSummary.total} incidents, ${complianceSummary.totalAssessments} assessments`,
        html: htmlContent,
      });

      console.log(`[AnalyticsDigest] Sent weekly digest to user ${user.userId}`);
    } catch (error) {
      console.error(`[AnalyticsDigest] Failed to send digest to user ${user.userId}:`, error);
    }
  }
}

/**
 * Helper function to get incident summary
 */
async function getIncidentSummary(db: any, startDate: string, endDate: string): Promise<IncidentSummary> {
  const reports = await db
    .select()
    .from(watchdogReports)
    .where(
      and(
        gte(watchdogReports.createdAt, startDate),
        lte(watchdogReports.createdAt, endDate)
      )
    )
    .orderBy(desc(watchdogReports.createdAt));

  const summary: IncidentSummary = {
    total: reports.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    byType: {},
    recentIncidents: [],
  };

  reports.forEach((report: any) => {
    // Count by severity
    if (report.severity === 'critical') summary.critical++;
    else if (report.severity === 'high') summary.high++;
    else if (report.severity === 'medium') summary.medium++;
    else if (report.severity === 'low') summary.low++;

    // Count by type
    const type = report.incidentType || 'other';
    summary.byType[type] = (summary.byType[type] || 0) + 1;

    // Add to recent incidents
    summary.recentIncidents.push({
      title: report.title,
      severity: report.severity,
      incidentType: report.incidentType,
      createdAt: report.createdAt,
    });
  });

  return summary;
}

/**
 * Helper function to get compliance summary
 */
async function getComplianceSummary(db: any, startDate: string, endDate: string): Promise<ComplianceSummary> {
  const assessmentsData = await db
    .select({
      id: assessments.id,
      aiSystemId: assessments.aiSystemId,
      frameworkId: assessments.frameworkId,
      overallScore: assessments.overallScore,
      createdAt: assessments.createdAt,
    })
    .from(assessments)
    .where(
      and(
        gte(assessments.createdAt, startDate),
        lte(assessments.createdAt, endDate)
      )
    )
    .orderBy(desc(assessments.createdAt));

  const summary: ComplianceSummary = {
    totalAssessments: assessmentsData.length,
    averageScore: 0,
    improved: 0,
    declined: 0,
    recentAssessments: [],
  };

  if (assessmentsData.length === 0) {
    return summary;
  }

  // Calculate average score
  const totalScore = assessmentsData.reduce((sum: number, a: any) => {
    const score = a.overallScore ? parseFloat(a.overallScore as string) : 0;
    return sum + score;
  }, 0);
  summary.averageScore = Math.round(totalScore / assessmentsData.length);

  // Get AI system and framework names for recent assessments
  for (const assessment of assessmentsData.slice(0, 5)) {
    const aiSystem = await db
      .select({ name: aiSystems.name })
      .from(aiSystems)
      .where(eq(aiSystems.id, assessment.aiSystemId))
      .limit(1);

    const framework = await db
      .select({ name: frameworks.name })
      .from(frameworks)
      .where(eq(frameworks.id, assessment.frameworkId))
      .limit(1);

    summary.recentAssessments.push({
      aiSystemName: aiSystem[0]?.name || 'Unknown System',
      frameworkName: framework[0]?.name || 'Unknown Framework',
      score: assessment.overallScore ? parseFloat(assessment.overallScore as string) : 0,
      createdAt: assessment.createdAt,
    });
  }

  // TODO: Calculate improved/declined by comparing with previous assessments
  // For now, set to 0
  summary.improved = 0;
  summary.declined = 0;

  return summary;
}
