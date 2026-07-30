/**
 * Achievement Email Service
 * Sends congratulatory emails for badges and streak milestones
 * with shareable badge cards embedded in the email
 */

import { Resend } from 'resend';
import { getDb } from '../db';
import { users, emailPreferences } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}
const FROM_EMAIL = 'CSOAI <noreply@csoai.org>';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://coai.manus.space';

export interface BadgeInfo {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  points: number | null;
  category: string;
}

export interface StreakMilestone {
  days: number;
  previousStreak: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generate a shareable badge card HTML for embedding in emails
 */
function generateBadgeCardHtml(badge: BadgeInfo, userName: string): string {
  const badgeColor = badge.color || '#10b981';
  const badgeIcon = badge.icon || '🏆';
  
  return `
    <div style="
      background: linear-gradient(135deg, ${badgeColor}15 0%, ${badgeColor}30 100%);
      border: 2px solid ${badgeColor};
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      margin: 30px auto;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    ">
      <div style="font-size: 64px; margin-bottom: 15px;">${badgeIcon}</div>
      <h2 style="
        color: ${badgeColor};
        margin: 0 0 10px 0;
        font-size: 24px;
        font-weight: 700;
      ">${badge.name}</h2>
      <p style="
        color: #4b5563;
        margin: 0 0 15px 0;
        font-size: 16px;
      ">${badge.description || 'Achievement Unlocked!'}</p>
      <div style="
        background: ${badgeColor};
        color: white;
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
      ">+${badge.points || 0} Points</div>
      <div style="
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid ${badgeColor}40;
        font-size: 14px;
        color: #6b7280;
      ">
        Earned by <strong style="color: #1f2937;">${userName}</strong><br>
        on CSOAI Platform
      </div>
    </div>
  `;
}

/**
 * Generate streak milestone badge HTML
 */
function generateStreakBadgeHtml(days: number, userName: string): string {
  const streakColors: Record<number, string> = {
    3: '#f59e0b',
    7: '#10b981',
    14: '#3b82f6',
    30: '#8b5cf6',
    60: '#ec4899',
    100: '#ef4444',
  };
  
  const streakEmojis: Record<number, string> = {
    3: '🔥',
    7: '🌟',
    14: '⚡',
    30: '💎',
    60: '🚀',
    100: '👑',
  };
  
  const color = streakColors[days] || '#10b981';
  const emoji = streakEmojis[days] || '🔥';
  
  return `
    <div style="
      background: linear-gradient(135deg, ${color}15 0%, ${color}30 100%);
      border: 2px solid ${color};
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      margin: 30px auto;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    ">
      <div style="font-size: 64px; margin-bottom: 15px;">${emoji}</div>
      <h2 style="
        color: ${color};
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: 700;
      ">${days}-Day Streak!</h2>
      <p style="
        color: #4b5563;
        margin: 0 0 15px 0;
        font-size: 16px;
      ">You've been learning for ${days} consecutive days!</p>
      <div style="
        background: ${color};
        color: white;
        display: inline-block;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 16px;
        font-weight: 600;
      ">Keep the momentum going!</div>
      <div style="
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid ${color}40;
        font-size: 14px;
        color: #6b7280;
      ">
        <strong style="color: #1f2937;">${userName}</strong><br>
        CSOAI Learning Streak
      </div>
    </div>
  `;
}

/**
 * Check if user has achievement emails enabled
 */
async function isAchievementEmailEnabled(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const [prefs] = await db
    .select()
    .from(emailPreferences)
    .where(eq(emailPreferences.userId, userId));
  
  // Default to enabled if no preferences set
  return prefs ? prefs.achievementsEnabled === 1 : true;
}

/**
 * Get user email and name
 */
async function getUserInfo(userId: number): Promise<{ email: string; name: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId));
  
  return user ? { email: user.email ?? '', name: user.name ?? '' } : null;
}

/**
 * Send badge earned email notification
 */
export async function sendBadgeEarnedEmail(
  userId: number,
  badge: BadgeInfo
): Promise<EmailResult> {
  try {
    // Check if user has achievement emails enabled
    const enabled = await isAchievementEmailEnabled(userId);
    if (!enabled) {
      return { success: true, messageId: 'skipped-disabled' };
    }
    
    // Get user info
    const userInfo = await getUserInfo(userId);
    if (!userInfo || !userInfo.email) {
      return { success: false, error: 'User email not found' };
    }
    
    const badgeCardHtml = generateBadgeCardHtml(badge, userInfo.name || 'Learner');
    
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: userInfo.email,
      subject: `🎉 You've earned a new badge: ${badge.name}!`,
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .content { 
      padding: 40px 30px;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .share-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .share-button {
      display: inline-block;
      background: #1da1f2;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 5px;
      font-size: 14px;
    }
    .share-button.linkedin {
      background: #0077b5;
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
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Achievement Unlocked!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">You've earned a new badge</p>
    </div>
    
    <div class="content">
      <p><strong>Congratulations, ${userInfo.name || 'Learner'}!</strong></p>
      
      <p>Your dedication to AI safety learning has paid off! You've just earned a new badge on CSOAI.</p>
      
      ${badgeCardHtml}
      
      <div class="share-section">
        <p style="margin: 0 0 15px 0; font-weight: 600;">Share your achievement!</p>
        <a href="https://twitter.com/intent/tweet?text=I%20just%20earned%20the%20${encodeURIComponent(badge.name)}%20badge%20on%20CSOAI!%20%F0%9F%8F%86%20Join%20me%20in%20learning%20AI%20safety.&url=${encodeURIComponent(FRONTEND_URL)}" class="share-button" target="_blank">Share on X</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(FRONTEND_URL + '/leaderboard')}" class="share-button linkedin" target="_blank">Share on LinkedIn</a>
      </div>
      
      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/leaderboard" class="cta-button">View All Your Badges →</a>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Keep learning to unlock more badges and climb the leaderboard!
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>
        <a href="${FRONTEND_URL}/dashboard">Dashboard</a> • 
        <a href="${FRONTEND_URL}/training">Training</a> • 
        <a href="${FRONTEND_URL}/leaderboard">Leaderboard</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        <a href="${FRONTEND_URL}/settings/notifications">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Achievement Email] Error sending badge email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Achievement Email] Badge email sent to user ${userId} for badge ${badge.name}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Achievement Email] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send badge email',
    };
  }
}

/**
 * Send streak milestone email notification
 */
export async function sendStreakMilestoneEmail(
  userId: number,
  milestone: StreakMilestone
): Promise<EmailResult> {
  try {
    // Check if user has achievement emails enabled
    const enabled = await isAchievementEmailEnabled(userId);
    if (!enabled) {
      return { success: true, messageId: 'skipped-disabled' };
    }
    
    // Get user info
    const userInfo = await getUserInfo(userId);
    if (!userInfo || !userInfo.email) {
      return { success: false, error: 'User email not found' };
    }
    
    const streakBadgeHtml = generateStreakBadgeHtml(milestone.days, userInfo.name || 'Learner');
    
    const motivationalMessages: Record<number, string> = {
      3: "You're building a great habit! Just 4 more days to reach a week.",
      7: "A full week of learning! You're on fire! 🔥",
      14: "Two weeks strong! You're in the top 10% of learners.",
      30: "One month of consistent learning! You're a true AI safety champion.",
      60: "60 days! Your dedication is inspiring others in the community.",
      100: "100 DAYS! You've achieved legendary status. You're unstoppable!",
    };
    
    const message = motivationalMessages[milestone.days] || `${milestone.days} days of learning! Amazing!`;
    
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: userInfo.email,
      subject: `🔥 ${milestone.days}-Day Streak! You're on fire!`,
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .content { 
      padding: 40px 30px;
    }
    .cta-button {
      display: inline-block;
      background: #f59e0b;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .motivation-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      padding: 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    .share-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .share-button {
      display: inline-block;
      background: #1da1f2;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 5px;
      font-size: 14px;
    }
    .share-button.linkedin {
      background: #0077b5;
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
      color: #f59e0b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Streak Milestone!</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">${milestone.days} Days of Learning</p>
    </div>
    
    <div class="content">
      <p><strong>Amazing work, ${userInfo.name || 'Learner'}!</strong></p>
      
      <p>You've reached an incredible milestone in your AI safety learning journey!</p>
      
      ${streakBadgeHtml}
      
      <div class="motivation-box">
        <p style="margin: 0; font-size: 16px;"><strong>💪 ${message}</strong></p>
      </div>
      
      <div class="share-section">
        <p style="margin: 0 0 15px 0; font-weight: 600;">Share your streak!</p>
        <a href="https://twitter.com/intent/tweet?text=I%20just%20hit%20a%20${milestone.days}-day%20learning%20streak%20on%20CSOAI!%20%F0%9F%94%A5%20Building%20my%20AI%20safety%20expertise%20one%20day%20at%20a%20time.&url=${encodeURIComponent(FRONTEND_URL)}" class="share-button" target="_blank">Share on X</a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(FRONTEND_URL + '/leaderboard')}" class="share-button linkedin" target="_blank">Share on LinkedIn</a>
      </div>
      
      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/training" class="cta-button">Continue Learning →</a>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Don't break your streak! Come back tomorrow to keep the momentum going.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>
        <a href="${FRONTEND_URL}/dashboard">Dashboard</a> • 
        <a href="${FRONTEND_URL}/training">Training</a> • 
        <a href="${FRONTEND_URL}/leaderboard">Leaderboard</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        <a href="${FRONTEND_URL}/settings/notifications">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Achievement Email] Error sending streak email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Achievement Email] Streak email sent to user ${userId} for ${milestone.days}-day streak`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Achievement Email] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send streak email',
    };
  }
}

/**
 * Check if a streak milestone was reached and send notification
 */
export async function checkAndSendStreakMilestoneEmail(
  userId: number,
  currentStreak: number,
  previousStreak: number
): Promise<void> {
  const milestones = [3, 7, 14, 30, 60, 100];
  
  for (const milestone of milestones) {
    // Check if we just crossed this milestone
    if (currentStreak >= milestone && previousStreak < milestone) {
      await sendStreakMilestoneEmail(userId, {
        days: milestone,
        previousStreak,
      });
      break; // Only send one email per update
    }
  }
}
