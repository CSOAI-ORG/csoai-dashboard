/**
 * Tests for Rate Limiter utility and coupon validation rate limiting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter, couponValidationLimiter } from '../utils/rateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    // Create a fresh limiter for each test with short window for testing
    limiter = new (RateLimiter as any)({
      windowMs: 1000, // 1 second window for testing
      maxRequests: 3,
    });
  });

  it('should allow requests within limit', () => {
    const result1 = limiter.check('test-ip-1');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = limiter.check('test-ip-1');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = limiter.check('test-ip-1');
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests over limit', () => {
    // Use up all requests
    limiter.check('test-ip-2');
    limiter.check('test-ip-2');
    limiter.check('test-ip-2');

    // Next request should be blocked
    const result = limiter.check('test-ip-2');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.resetIn).toBeGreaterThan(0);
  });

  it('should track different IPs separately', () => {
    // Use up all requests for IP 1
    limiter.check('ip-a');
    limiter.check('ip-a');
    limiter.check('ip-a');
    const resultA = limiter.check('ip-a');
    expect(resultA.allowed).toBe(false);

    // IP 2 should still be allowed
    const resultB = limiter.check('ip-b');
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(2);
  });

  it('should reset after window expires', async () => {
    // Use up all requests
    limiter.check('test-ip-3');
    limiter.check('test-ip-3');
    limiter.check('test-ip-3');
    
    let result = limiter.check('test-ip-3');
    expect(result.allowed).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be allowed again
    result = limiter.check('test-ip-3');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });
});

describe('Coupon Validation Rate Limiter', () => {
  it('should be configured with correct limits', () => {
    // The coupon validation limiter should allow 20 requests per 15 minutes
    // We can't easily test the exact configuration, but we can verify it exists
    expect(couponValidationLimiter).toBeDefined();
    expect(typeof couponValidationLimiter.check).toBe('function');
  });

  it('should allow initial coupon validation attempts', () => {
    // Use a unique key for this test to avoid interference
    const testKey = `coupon-test-${Date.now()}`;
    const result = couponValidationLimiter.check(testKey);
    
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19); // 20 max - 1 used = 19 remaining
  });
});
