/**
 * Weekly Digest Email Service
 * Sends personalized weekly summaries showing progress, rank changes,
 * badges earned, and encouragement to maintain streaks
 */

import { Resend } from 'resend';
import { getDb } from '../db';
import { 
  users, 
  emailPreferences, 
  userStreaks, 
  userBadges, 
  badges,
  courseEnrollments,
  dailyActivityLog,
} from '../../drizzle/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}
const FROM_EMAIL = 'CSOAI <noreply@csoai.org>';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://coai.manus.space';

export interface WeeklyDigestData {
  userId: number;
  userName: string;
  email: string;
  currentStreak: number;
  previousStreak: number;
  streakChange: number;
  badgesEarnedThisWeek: Array<{
    name: string;
    icon: string | null;
    earnedAt: string;
  }>;
  coursesCompletedThisWeek: number;
  totalCoursesCompleted: number;
  minutesLearned: number;
  currentRank: number;
  previousRank: number;
  rankChange: number;
  topPercentile: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Get the date one week ago
 */
function getWeekAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

/**
 * Get motivational message based on user's activity
 */
function getMotivationalMessage(data: WeeklyDigestData): string {
  if (data.streakChange > 0 && data.currentStreak >= 7) {
    return `🔥 Amazing! Your ${data.currentStreak}-day streak is on fire! You're in the top ${data.topPercentile}% of learners.`;
  }
  if (data.badgesEarnedThisWeek.length > 0) {
    return `🏆 Great week! You earned ${data.badgesEarnedThisWeek.length} new badge${data.badgesEarnedThisWeek.length > 1 ? 's' : ''}! Keep up the momentum.`;
  }
  if (data.rankChange > 0) {
    return `📈 You climbed ${data.rankChange} spot${data.rankChange > 1 ? 's' : ''} on the leaderboard! Keep pushing forward.`;
  }
  if (data.minutesLearned > 60) {
    return `⏱️ You spent ${Math.round(data.minutesLearned / 60)} hours learning this week. That's dedication!`;
  }
  if (data.currentStreak > 0) {
    return `💪 You have a ${data.currentStreak}-day streak going. Don't let it slip away!`;
  }
  return `👋 We miss you! Come back and continue your AI safety journey. Every day counts!`;
}

/**
 * Generate streak status HTML
 */
function generateStreakSection(data: WeeklyDigestData): string {
  const streakColor = data.currentStreak >= 7 ? '#f59e0b' : data.currentStreak > 0 ? '#10b981' : '#6b7280';
  const streakEmoji = data.currentStreak >= 30 ? '💎' : data.currentStreak >= 7 ? '🔥' : data.currentStreak > 0 ? '✨' : '💤';
  
  let changeIndicator = '';
  if (data.streakChange > 0) {
    changeIndicator = `<span style="color: #10b981; font-size: 14px;">↑ ${data.streakChange} from last week</span>`;
  } else if (data.streakChange < 0) {
    changeIndicator = `<span style="color: #ef4444; font-size: 14px;">↓ ${Math.abs(data.streakChange)} from last week</span>`;
  }

  return `
    <div style="
      background: linear-gradient(135deg, ${streakColor}15 0%, ${streakColor}25 100%);
      border-left: 4px solid ${streakColor};
      border-radius: 0 12px 12px 0;
      padding: 20px;
      margin: 20px 0;
    ">
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 48px;">${streakEmoji}</div>
        <div>
          <div style="font-size: 32px; font-weight: 700; color: ${streakColor};">${data.currentStreak} Days</div>
          <div style="color: #6b7280; font-size: 14px;">Current Streak</div>
          ${changeIndicator}
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate badges section HTML
 */
function generateBadgesSection(badges: WeeklyDigestData['badgesEarnedThisWeek']): string {
  if (badges.length === 0) {
    return `
      <div style="
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 20px 0;
      ">
        <p style="color: #6b7280; margin: 0;">No new badges this week. Keep learning to earn more! 🎯</p>
      </div>
    `;
  }

  const badgeItems = badges.map(badge => `
    <div style="
      display: inline-block;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 5px;
      text-align: center;
    ">
      <div style="font-size: 24px;">${badge.icon || '🏆'}</div>
      <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${badge.name}</div>
    </div>
  `).join('');

  return `
    <div style="margin: 20px 0;">
      <h3 style="color: #1f2937; margin-bottom: 15px;">🏆 Badges Earned This Week</h3>
      <div style="text-align: center;">
        ${badgeItems}
      </div>
    </div>
  `;
}

/**
 * Generate rank section HTML
 */
function generateRankSection(data: WeeklyDigestData): string {
  let rankChangeHtml = '';
  if (data.rankChange > 0) {
    rankChangeHtml = `<span style="color: #10b981;">↑ ${data.rankChange}</span>`;
  } else if (data.rankChange < 0) {
    rankChangeHtml = `<span style="color: #ef4444;">↓ ${Math.abs(data.rankChange)}</span>`;
  } else {
    rankChangeHtml = `<span style="color: #6b7280;">—</span>`;
  }

  return `
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    ">
      <div style="
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      ">
        <div style="font-size: 28px; font-weight: 700; color: #1f2937;">#${data.currentRank}</div>
        <div style="color: #6b7280; font-size: 14px;">Your Rank ${rankChangeHtml}</div>
      </div>
      <div style="
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      ">
        <div style="font-size: 28px; font-weight: 700; color: #10b981;">${data.totalCoursesCompleted}</div>
        <div style="color: #6b7280; font-size: 14px;">Courses Completed</div>
      </div>
      <div style="
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      ">
        <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${Math.round(data.minutesLearned / 60)}h</div>
        <div style="color: #6b7280; font-size: 14px;">Learning Time</div>
      </div>
    </div>
  `;
}

/**
 * Collect weekly digest data for a user
 */
export async function collectWeeklyDigestData(userId: number): Promise<WeeklyDigestData | null> {
  const db = await getDb();
  if (!db) return null;

  const weekAgo = getWeekAgo();
  const weekAgoStr = weekAgo.toISOString();

  // Get user info
  const [user] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  if (!user || !user.email) return null;

  // Get streak info
  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId));

  // Get badges earned this week
  const earnedBadges = await db
    .select({
      name: badges.name,
      icon: badges.icon,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(
      and(
        eq(userBadges.userId, userId),
        gte(userBadges.earnedAt, weekAgoStr)
      )
    );

  // Get courses completed this week
  const [coursesThisWeek] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.status, 'completed'),
        gte(courseEnrollments.completedAt, weekAgoStr)
      )
    );

  // Get total courses completed
  const [totalCourses] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.status, 'completed')
      )
    );

  // Get minutes learned this week
  const [activitySum] = await db
    .select({ total: sql<number>`SUM(minutesSpent)` })
    .from(dailyActivityLog)
    .where(
      and(
        eq(dailyActivityLog.userId, userId),
        gte(dailyActivityLog.activityDate, weekAgo.toISOString().split('T')[0])
      )
    );

  // Calculate rank (simplified - based on streak)
  const [rankResult] = await db.execute(sql`
    SELECT COUNT(*) + 1 as rank
    FROM user_streaks
    WHERE currentStreak > ${streak?.currentStreak || 0}
  `);
  const currentRank = (rankResult as any)?.[0]?.rank || 1;

  // Get total users for percentile calculation
  const [totalUsersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userStreaks);
  const totalUsers = totalUsersResult?.count || 1;
  const topPercentile = Math.round((1 - (currentRank / totalUsers)) * 100);

  return {
    userId,
    userName: user.name || 'Learner',
    email: user.email,
    currentStreak: streak?.currentStreak || 0,
    previousStreak: streak?.currentStreak || 0, // Would need historical data
    streakChange: 0, // Would need historical data
    badgesEarnedThisWeek: earnedBadges.map(b => ({
      name: b.name || 'Badge',
      icon: b.icon,
      earnedAt: b.earnedAt || '',
    })),
    coursesCompletedThisWeek: coursesThisWeek?.count || 0,
    totalCoursesCompleted: totalCourses?.count || 0,
    minutesLearned: activitySum?.total || 0,
    currentRank,
    previousRank: currentRank, // Would need historical data
    rankChange: 0, // Would need historical data
    topPercentile: Math.max(1, topPercentile),
  };
}

/**
 * Send weekly digest email to a user
 */
export async function sendWeeklyDigestEmail(userId: number): Promise<EmailResult> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    // Check if user has digest emails enabled
    const [prefs] = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.userId, userId));

    if (prefs && prefs.progressReportsEnabled === 0) {
      return { success: true, messageId: 'skipped-disabled' };
    }

    // Collect digest data
    const data = await collectWeeklyDigestData(userId);
    if (!data) {
      return { success: false, error: 'Could not collect user data' };
    }

    const motivationalMessage = getMotivationalMessage(data);
    const streakSection = generateStreakSection(data);
    const badgesSection = generateBadgesSection(data.badgesEarnedThisWeek);
    const rankSection = generateRankSection(data);

    const resendClient = getResend();
    if (!resendClient) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const { data: emailData, error } = await resendClient.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `📊 Your Weekly AI Safety Learning Summary`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content { 
      padding: 40px 30px;
    }
    .motivation-box {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your Weekly Summary</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
    
    <div class="content">
      <p><strong>Hi ${data.userName}!</strong></p>
      
      <div class="motivation-box">
        <p style="margin: 0; font-size: 18px; font-weight: 500; color: #1e40af;">
          ${motivationalMessage}
        </p>
      </div>
      
      <h3 style="color: #1f2937; margin-top: 30px;">🔥 Your Streak</h3>
      ${streakSection}
      
      <h3 style="color: #1f2937; margin-top: 30px;">📈 This Week's Progress</h3>
      ${rankSection}
      
      ${badgesSection}
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${FRONTEND_URL}/training" class="cta-button">Continue Learning →</a>
      </div>
      
      <div style="
        background: #fef3c7;
        border-radius: 8px;
        padding: 15px;
        margin-top: 30px;
        text-align: center;
      ">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          💡 <strong>Pro tip:</strong> Consistency beats intensity. Just 15 minutes a day can transform your AI safety expertise!
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>
        <a href="${FRONTEND_URL}/dashboard">Dashboard</a> • 
        <a href="${FRONTEND_URL}/training">Training</a> • 
        <a href="${FRONTEND_URL}/leaderboard">Leaderboard</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        You're receiving this because you're subscribed to weekly progress reports.<br>
        <a href="${FRONTEND_URL}/settings/notifications">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Weekly Digest] Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Weekly Digest] Email sent to user ${userId}`);
    return { success: true, messageId: emailData?.id };
  } catch (error) {
    console.error('[Weekly Digest] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send digest email',
    };
  }
}

/**
 * Send weekly digests to all eligible users
 * This should be called by a scheduled job (e.g., every Sunday)
 */
export async function sendAllWeeklyDigests(): Promise<{
  sent: number;
  skipped: number;
  failed: number;
}> {
  const db = await getDb();
  if (!db) return { sent: 0, skipped: 0, failed: 0 };

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // Get all users with email preferences enabled (or no preferences set)
  const eligibleUsers = await db
    .select({ userId: users.id })
    .from(users)
    .leftJoin(emailPreferences, eq(users.id, emailPreferences.userId))
    .where(
      sql`${emailPreferences.progressReportsEnabled} = 1 OR ${emailPreferences.id} IS NULL`
    );

  console.log(`[Weekly Digest] Sending digests to ${eligibleUsers.length} users`);

  for (const { userId } of eligibleUsers) {
    const result = await sendWeeklyDigestEmail(userId);
    
    if (result.success) {
      if (result.messageId === 'skipped-disabled') {
        skipped++;
      } else {
        sent++;
      }
    } else {
      failed++;
      console.error(`[Weekly Digest] Failed for user ${userId}: ${result.error}`);
    }

    // Rate limiting - wait 100ms between emails
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`[Weekly Digest] Complete: ${sent} sent, ${skipped} skipped, ${failed} failed`);
  return { sent, skipped, failed };
}
