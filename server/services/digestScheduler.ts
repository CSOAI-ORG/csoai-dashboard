/**
 * Digest Scheduler Service
 * Schedule daily and weekly email digests using node-cron
 */

import cron from 'node-cron';
import { sendDailyDigests, sendWeeklyDigests } from './emailDigest';
import { sendDailyAnalyticsDigests, sendWeeklyAnalyticsDigests } from './analyticsDigest';

/**
 * Initialize all scheduled digest jobs
 */
export function initializeDigestScheduler(): void {
  console.log('[DigestScheduler] Initializing scheduled digest jobs...');

  // Daily notification digests - Run at 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    console.log('[DigestScheduler] Running daily notification digests...');
    try {
      await sendDailyDigests();
      console.log('[DigestScheduler] Daily notification digests completed');
    } catch (error) {
      console.error('[DigestScheduler] Error sending daily notification digests:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Weekly notification digests - Run at 9:00 AM every Monday
  cron.schedule('0 9 * * 1', async () => {
    console.log('[DigestScheduler] Running weekly notification digests...');
    try {
      await sendWeeklyDigests();
      console.log('[DigestScheduler] Weekly notification digests completed');
    } catch (error) {
      console.error('[DigestScheduler] Error sending weekly notification digests:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Daily analytics digests - Run at 7:00 AM every day
  cron.schedule('0 7 * * *', async () => {
    console.log('[DigestScheduler] Running daily analytics digests...');
    try {
      await sendDailyAnalyticsDigests();
      console.log('[DigestScheduler] Daily analytics digests completed');
    } catch (error) {
      console.error('[DigestScheduler] Error sending daily analytics digests:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Weekly analytics digests - Run at 8:00 AM every Monday
  cron.schedule('0 8 * * 1', async () => {
    console.log('[DigestScheduler] Running weekly analytics digests...');
    try {
      await sendWeeklyAnalyticsDigests();
      console.log('[DigestScheduler] Weekly analytics digests completed');
    } catch (error) {
      console.error('[DigestScheduler] Error sending weekly analytics digests:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('[DigestScheduler] All digest jobs scheduled successfully');
  console.log('[DigestScheduler] - Daily notification digests: 8:00 AM UTC');
  console.log('[DigestScheduler] - Weekly notification digests: 9:00 AM UTC every Monday');
  console.log('[DigestScheduler] - Daily analytics digests: 7:00 AM UTC');
  console.log('[DigestScheduler] - Weekly analytics digests: 8:00 AM UTC every Monday');
}

/**
 * Manually trigger daily digests (for testing)
 */
export async function triggerDailyDigests(): Promise<void> {
  console.log('[DigestScheduler] Manually triggering daily digests...');
  await sendDailyDigests();
  await sendDailyAnalyticsDigests();
  console.log('[DigestScheduler] Manual daily digests completed');
}

/**
 * Manually trigger weekly digests (for testing)
 */
export async function triggerWeeklyDigests(): Promise<void> {
  console.log('[DigestScheduler] Manually triggering weekly digests...');
  await sendWeeklyDigests();
  await sendWeeklyAnalyticsDigests();
  console.log('[DigestScheduler] Manual weekly digests completed');
}
