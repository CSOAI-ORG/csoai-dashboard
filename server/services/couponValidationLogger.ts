/**
 * Coupon Validation Logger
 * Tracks coupon validation attempts for abuse monitoring and analytics
 */

import { getDb } from "../db";

export interface CouponValidationAttempt {
  couponCode: string;
  bundleId?: number;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  discountAmount?: number;
  timestamp: string;
}

// In-memory cache for recent validation attempts (for quick abuse detection)
const recentAttempts: Map<string, CouponValidationAttempt[]> = new Map();
const MAX_CACHE_SIZE = 10000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Log a coupon validation attempt
 */
export async function logCouponValidation(attempt: CouponValidationAttempt): Promise<void> {
  // Add to in-memory cache for quick access
  const cacheKey = attempt.ipAddress || attempt.userId?.toString() || 'anonymous';
  const existingAttempts = recentAttempts.get(cacheKey) || [];
  existingAttempts.push(attempt);
  
  // Keep only recent attempts
  const cutoff = Date.now() - CACHE_TTL_MS;
  const filteredAttempts = existingAttempts.filter(
    a => new Date(a.timestamp).getTime() > cutoff
  );
  recentAttempts.set(cacheKey, filteredAttempts);

  // Cleanup cache if too large
  if (recentAttempts.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(recentAttempts.keys()).slice(0, 1000);
    keysToDelete.forEach(k => recentAttempts.delete(k));
  }

  // Log to database for persistence
  try {
    const db = await getDb();
    if (db) {
      // Insert into coupon_validation_logs table if it exists
      // For now, just log to console with structured format
      console.log('[CouponValidation]', JSON.stringify({
        ...attempt,
        type: attempt.success ? 'SUCCESS' : 'FAILURE',
      }));
    }
  } catch (error) {
    console.error('[CouponValidation] Failed to log attempt:', error);
  }
}

/**
 * Check for potential abuse patterns
 * Returns true if abuse is detected
 */
export function checkForAbusePatterns(
  identifier: string, // IP address or user ID
  options: {
    maxFailedAttempts?: number;
    timeWindowMs?: number;
    maxUniqueCodesPerWindow?: number;
  } = {}
): { isAbusive: boolean; reason?: string; metrics: AbuseMetrics } {
  const {
    maxFailedAttempts = 10,
    timeWindowMs = 15 * 60 * 1000, // 15 minutes
    maxUniqueCodesPerWindow = 20,
  } = options;

  const attempts = recentAttempts.get(identifier) || [];
  const cutoff = Date.now() - timeWindowMs;
  const recentAttemptsInWindow = attempts.filter(
    a => new Date(a.timestamp).getTime() > cutoff
  );

  // Count failed attempts
  const failedAttempts = recentAttemptsInWindow.filter(a => !a.success);
  
  // Count unique coupon codes tried
  const uniqueCodes = new Set(recentAttemptsInWindow.map(a => a.couponCode.toUpperCase()));

  const metrics: AbuseMetrics = {
    totalAttempts: recentAttemptsInWindow.length,
    failedAttempts: failedAttempts.length,
    uniqueCodesTried: uniqueCodes.size,
    timeWindowMs,
  };

  // Check for brute force attempts (many failed attempts)
  if (failedAttempts.length >= maxFailedAttempts) {
    return {
      isAbusive: true,
      reason: `Too many failed attempts: ${failedAttempts.length} in ${timeWindowMs / 60000} minutes`,
      metrics,
    };
  }

  // Check for code enumeration (trying many different codes)
  if (uniqueCodes.size >= maxUniqueCodesPerWindow) {
    return {
      isAbusive: true,
      reason: `Too many unique codes tried: ${uniqueCodes.size} in ${timeWindowMs / 60000} minutes`,
      metrics,
    };
  }

  return { isAbusive: false, metrics };
}

export interface AbuseMetrics {
  totalAttempts: number;
  failedAttempts: number;
  uniqueCodesTried: number;
  timeWindowMs: number;
}

/**
 * Get validation statistics for monitoring dashboard
 */
export function getValidationStats(timeWindowMs: number = 60 * 60 * 1000): ValidationStats {
  const cutoff = Date.now() - timeWindowMs;
  let totalAttempts = 0;
  let successfulAttempts = 0;
  let failedAttempts = 0;
  const failureReasons: Record<string, number> = {};
  const topCodes: Record<string, number> = {};

  for (const attempts of recentAttempts.values()) {
    for (const attempt of attempts) {
      if (new Date(attempt.timestamp).getTime() > cutoff) {
        totalAttempts++;
        if (attempt.success) {
          successfulAttempts++;
        } else {
          failedAttempts++;
          if (attempt.failureReason) {
            failureReasons[attempt.failureReason] = (failureReasons[attempt.failureReason] || 0) + 1;
          }
        }
        const code = attempt.couponCode.toUpperCase();
        topCodes[code] = (topCodes[code] || 0) + 1;
      }
    }
  }

  // Sort codes by frequency
  const sortedCodes = Object.entries(topCodes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  return {
    totalAttempts,
    successfulAttempts,
    failedAttempts,
    successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0,
    failureReasons,
    topCodes: sortedCodes,
    timeWindowMs,
  };
}

export interface ValidationStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  failureReasons: Record<string, number>;
  topCodes: { code: string; count: number }[];
  timeWindowMs: number;
}

/**
 * Clear old entries from the cache
 * Should be called periodically
 */
export function cleanupCache(): void {
  const cutoff = Date.now() - CACHE_TTL_MS;
  
  for (const [key, attempts] of recentAttempts.entries()) {
    const filteredAttempts = attempts.filter(
      a => new Date(a.timestamp).getTime() > cutoff
    );
    
    if (filteredAttempts.length === 0) {
      recentAttempts.delete(key);
    } else {
      recentAttempts.set(key, filteredAttempts);
    }
  }
}

// Cleanup cache every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);
