# COAI Dashboard Testing Roadmap

## Executive Summary

This document provides a comprehensive testing roadmap for the COAI Dashboard application, identifying current issues, implemented fixes, and recommendations for ensuring production readiness.

---

## Current Status

### TypeScript Errors Analysis

**Total Errors: 601** (down from 518 initially identified)

| Error Type | Count | Description |
|------------|-------|-------------|
| TS2339 | 278 | Property does not exist on type |
| TS7006 | 120 | Parameter implicitly has 'any' type |
| TS2769 | 104 | No overload matches this call |
| TS2322 | 30 | Type not assignable |
| TS18047 | 22 | Possibly null/undefined |
| TS2345 | 11 | Argument type mismatch |
| Other | 36 | Various type issues |

### Files with Most Errors

| File | Error Count | Priority |
|------|-------------|----------|
| server/routers/emailTemplates.test.ts | 32 | Medium |
| server/routers/cohorts.test.ts | 29 | Medium |
| server/routers/students.test.ts | 28 | Medium |
| server/__tests__/workflow-advanced-features.test.ts | 16 | Low |
| server/routers/__tests__/forumMentionsSearchAnalytics.test.ts | 14 | Low |
| server/routers/giveaway.ts | 13 | High |
| server/routers/forums.ts | 13 | High |
| server/routers/studentAnalytics.ts | 12 | High |

---

## Implemented Fixes

### 1. Rate Limiting (Completed ✅)

Added rate limiting to protect sensitive endpoints:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| Enrollment | 10 requests | 5 minutes |
| Password Reset | 3 requests | 15 minutes |
| API Key Generation | 5 requests | 1 hour |
| Giveaway Applications | 3 requests | 10 minutes |
| Bulk Operations | 5 requests | 10 minutes |
| Email Sending | 50 requests | 1 hour |
| Coupon Validation | 20 requests | 15 minutes |

**Files Modified:**
- `server/utils/rateLimiter.ts` - Added new rate limiters
- `server/routers/bundleEnrollment.ts` - Applied enrollment rate limiting
- `server/routers/giveaway.ts` - Applied giveaway rate limiting
- `server/routers/bulkActions.ts` - Applied bulk operation rate limiting

### 2. Coupon Validation Logging (Completed ✅)

Implemented comprehensive coupon validation logging for abuse monitoring:

**Features:**
- In-memory cache for quick abuse detection
- Structured logging of all validation attempts
- Abuse pattern detection (brute force, code enumeration)
- Validation statistics for monitoring dashboard

**Files Created:**
- `server/services/couponValidationLogger.ts`

**Logged Events:**
- Successful validations
- Failed validations with reasons (invalid_code, expired, inactive, usage_limit_reached)
- Rate-limited attempts
- Abuse detection triggers

### 3. E2E Testing Infrastructure (Completed ✅)

Set up Playwright for comprehensive E2E testing:

**Test Files Created:**
- `e2e/07-coupon-validation.spec.ts` - Coupon and enrollment flow tests
- `e2e/08-authentication.spec.ts` - Authentication flow tests
- `e2e/09-api-health.spec.ts` - API health and security tests

**Test Coverage:**
- Coupon validation flow
- Enrollment flow
- Giveaway application
- Admin dashboard access protection
- API rate limiting
- Authentication flows (login, signup, OAuth)
- Protected routes
- Session management
- Password reset
- API health checks
- Security headers

---

## Recommended Fixes (Priority Order)

### High Priority

#### 1. Fix Router TypeScript Errors

**Issue:** Several routers have type mismatches, particularly with boolean vs number types for MySQL columns.

**Files to Fix:**
- `server/routers/forums.ts` (13 errors)
- `server/routers/studentAnalytics.ts` (12 errors)
- `server/routers/bundleEnrollment.ts` (11 errors)
- `server/routers/analytics.ts` (11 errors)

**Solution:**
```typescript
// Change boolean values to numbers for MySQL
isEdited: false  →  isEdited: 0
isLocked: true   →  isLocked: 1
```

#### 2. Fix Schema Field Mismatches

**Issue:** Some routers reference fields that don't exist in the schema.

**Examples:**
- `validForBundleIds` in coupons table
- `cohortId` in course_enrollments table
- `lastLoginAt` in users table

**Solution:** Either add missing fields to schema or remove references from code.

#### 3. Add Missing Type Annotations

**Issue:** 120 instances of implicit 'any' type parameters.

**Solution:** Add explicit type annotations:
```typescript
// Before
.reduce((sum, c) => sum + c.value, 0)

// After
.reduce((sum: number, c: { value: number }) => sum + c.value, 0)
```

### Medium Priority

#### 4. Fix Test Files

**Issue:** Test files have outdated mocks and type mismatches.

**Files to Fix:**
- `server/routers/emailTemplates.test.ts`
- `server/routers/cohorts.test.ts`
- `server/routers/students.test.ts`

**Solution:** Update test mocks to match current schema and API signatures.

#### 5. Add Input Validation

**Issue:** Some endpoints accept potentially unsafe input.

**Recommendation:** Add Zod validation for all user inputs.

### Low Priority

#### 6. Add Security Headers

**Recommendation:** Add security headers to all responses:
- X-Frame-Options
- X-Content-Type-Options
- Content-Security-Policy
- Strict-Transport-Security

#### 7. Implement Structured Logging

**Recommendation:** Replace console.log with structured logging (e.g., Pino, Winston).

---

## Testing Strategy

### Unit Tests (Vitest)

**Current Status:** Rate limiter tests passing (6/6)

**Recommended Coverage:**
- [ ] All router procedures
- [ ] Service functions
- [ ] Utility functions
- [ ] Schema validations

### Integration Tests

**Recommended Coverage:**
- [ ] Database operations
- [ ] Email sending
- [ ] Stripe integration
- [ ] OAuth flows

### E2E Tests (Playwright)

**Current Status:** 9 test files with 75+ test cases

**Test Categories:**
1. Homepage and navigation
2. Training journey
3. Watchdog analyst
4. Signup flow
5. Training flow
6. Certification flow
7. Coupon validation
8. Authentication
9. API health

---

## Monitoring Recommendations

### 1. Error Tracking

Already implemented with Sentry. Ensure all critical paths have proper error boundaries.

### 2. Performance Monitoring

Add monitoring for:
- API response times
- Database query performance
- Rate limiting metrics

### 3. Security Monitoring

Monitor for:
- Failed authentication attempts
- Rate limit violations
- Coupon abuse patterns
- Unusual traffic patterns

---

## Deployment Checklist

Before deploying to production:

- [ ] Fix all high-priority TypeScript errors
- [ ] Run full test suite (unit + E2E)
- [ ] Review security headers
- [ ] Verify rate limiting is active
- [ ] Check database migrations are up to date
- [ ] Verify environment variables are set
- [ ] Test payment flows in Stripe test mode
- [ ] Review error tracking configuration
- [ ] Test OAuth flows
- [ ] Verify email sending works

---

## Quick Commands

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Run unit tests
pnpm test

# Run E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/07-coupon-validation.spec.ts

# View test report
npx playwright show-report
```

---

## Contact

For questions about this testing roadmap, please contact the development team.

Last Updated: January 5, 2026
