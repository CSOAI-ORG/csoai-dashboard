/**
 * Forum Email Notification Service
 * Handles sending email notifications for forum activity
 */

import { sendEmail } from '../emailService';
import { getDb } from '../db';
import { forumThreads, forumPosts } from '../../drizzle/schema-courses-forums';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://csoai.org';

interface EmailNotificationParams {
  recipientId: number;
  threadId: number;
  postId?: number;
  type: 'new_reply' | 'solution_marked' | 'thread_update';
  actorName: string;
}

/**
 * Send email notification for new reply
 */
export async function sendNewReplyEmail(params: EmailNotificationParams) {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    // Get recipient user
    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.recipientId))
      .limit(1);

    if (!recipient || !recipient.email) {
      return { success: false, error: 'Recipient not found or no email' };
    }

    // Get thread details
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, params.threadId))
      .limit(1);

    if (!thread) {
      return { success: false, error: 'Thread not found' };
    }

    // Get post content if provided
    let postContent = '';
    if (params.postId) {
      const [post] = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, params.postId))
        .limit(1);
      
      if (post) {
        // Strip HTML tags for email preview (simple version)
        postContent = post.content.replace(/<[^>]*>/g, '').substring(0, 200);
      }
    }

    const threadUrl = `${FRONTEND_URL}/training/courses?threadId=${params.threadId}`;

    const result = await sendEmail({
      to: recipient.email,
      subject: `New reply to "${thread.title}"`,
      text: `
Hi ${recipient.name || 'there'},

${params.actorName} replied to a thread you're following: "${thread.title}"

${postContent ? `Preview: ${postContent}...` : ''}

View the full discussion: ${threadUrl}

To manage your notification preferences, visit ${FRONTEND_URL}/settings

Best regards,
The CSOAI Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">New Reply in Discussion Forum</h2>
          <p>Hi ${recipient.name || 'there'},</p>
          <p><strong>${params.actorName}</strong> replied to a thread you're following:</p>
          <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">${thread.title}</h3>
            ${postContent ? `<p style="color: #6b7280; margin: 0;">${postContent}...</p>` : ''}
          </div>
          <p>
            <a href="${threadUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Discussion
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            To manage your notification preferences, visit <a href="${FRONTEND_URL}/settings" style="color: #3b82f6;">Settings</a>
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('[ForumEmail] Error sending new reply email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send email notification when a post is marked as solution
 */
export async function sendSolutionMarkedEmail(params: EmailNotificationParams) {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    // Get recipient user
    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.recipientId))
      .limit(1);

    if (!recipient || !recipient.email) {
      return { success: false, error: 'Recipient not found or no email' };
    }

    // Get thread details
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, params.threadId))
      .limit(1);

    if (!thread) {
      return { success: false, error: 'Thread not found' };
    }

    const threadUrl = `${FRONTEND_URL}/training/courses?threadId=${params.threadId}`;

    const result = await sendEmail({
      to: recipient.email,
      subject: `Your answer was marked as solution: "${thread.title}"`,
      text: `
Hi ${recipient.name || 'there'},

Great news! ${params.actorName} marked your answer as the solution to their question: "${thread.title}"

This recognition helps other students find helpful answers and contributes to the learning community.

View the thread: ${threadUrl}

Keep up the great work!

Best regards,
The CSOAI Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">✓ Your Answer Was Marked as Solution!</h2>
          <p>Hi ${recipient.name || 'there'},</p>
          <p>Great news! <strong>${params.actorName}</strong> marked your answer as the solution to their question:</p>
          <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3 style="margin: 0; color: #059669;">${thread.title}</h3>
          </div>
          <p>This recognition helps other students find helpful answers and contributes to the learning community.</p>
          <p>
            <a href="${threadUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Thread
            </a>
          </p>
          <p style="margin-top: 30px; color: #6b7280;">Keep up the great work!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            The CSOAI Team
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('[ForumEmail] Error sending solution marked email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send digest email for thread updates
 */
export async function sendThreadUpdateDigest(
  recipientId: number,
  updates: Array<{ threadId: number; threadTitle: string; replyCount: number }>
) {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    // Get recipient user
    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (!recipient || !recipient.email) {
      return { success: false, error: 'Recipient not found or no email' };
    }

    const updatesList = updates
      .map(
        (u) =>
          `• ${u.threadTitle} (${u.replyCount} new ${u.replyCount === 1 ? 'reply' : 'replies'})`
      )
      .join('\n');

    const updatesHtml = updates
      .map(
        (u) => `
        <li style="margin-bottom: 10px;">
          <a href="${FRONTEND_URL}/training/courses?threadId=${u.threadId}" style="color: #3b82f6; text-decoration: none;">
            ${u.threadTitle}
          </a>
          <span style="color: #6b7280;"> (${u.replyCount} new ${u.replyCount === 1 ? 'reply' : 'replies'})</span>
        </li>
      `
      )
      .join('');

    const result = await sendEmail({
      to: recipient.email,
      subject: `Discussion Forum Digest: ${updates.length} thread${updates.length === 1 ? '' : 's'} updated`,
      text: `
Hi ${recipient.name || 'there'},

Here's your digest of recent activity in threads you're following:

${updatesList}

Visit the forum to catch up on the discussions: ${FRONTEND_URL}/training/courses

To manage your notification preferences, visit ${FRONTEND_URL}/settings

Best regards,
The CSOAI Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">Discussion Forum Digest</h2>
          <p>Hi ${recipient.name || 'there'},</p>
          <p>Here's your digest of recent activity in threads you're following:</p>
          <ul style="list-style: none; padding: 0; margin: 20px 0;">
            ${updatesHtml}
          </ul>
          <p>
            <a href="${FRONTEND_URL}/training/courses" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Visit Forum
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            To manage your notification preferences, visit <a href="${FRONTEND_URL}/settings" style="color: #3b82f6;">Settings</a>
          </p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('[ForumEmail] Error sending digest email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
