# Sentry Error Report - January 5, 2026

## Summary
Total unresolved issues: **17**

## Recent Errors (Last 24 Hours)

### Critical/New Issues

1. **TRPCClientError - Unexpected token '<'** (4min ago, 7hr old)
   - Path: `/`
   - Error: `Unexpected token '<', "<!doctype "... is not valid JSON`
   - Events: 3
   - Priority: High
   - Note: This suggests the API is returning HTML instead of JSON (possibly a 404 or error page)

2. **TRPCClientError - No procedure found** (49min ago, 5hr old)
   - Path: `/bundle-checkout/200002`
   - Error: `No procedure found on path "courses.validateCoupon"`
   - Events: 3
   - Priority: High
   - Note: Missing TRPC procedure - needs to be added

3. **TRPCClientError - Unexpected token '<'** (4hr ago, 4hr old)
   - Path: `/`
   - Error: Same JSON parsing error
   - Events: 1
   - Priority: High

4. **Error - switchToPage out of bounds** (5hr ago, 6hr old)
   - Path: `GET /api/download-template/risk-assessment-matrix`
   - Error: `switchToPage(0) out of bounds, current buffer covers pages 1 to 1`
   - Events: 2
   - Priority: High
   - Note: PDF generation issue

5. **Error - write after end** (5hr ago, 6hr old) - FATAL
   - Path: `GET /api/download-template/risk-assessment-matrix`
   - Error: `write after end`
   - Events: 2
   - Priority: High
   - Note: Stream handling issue in template download

6. **TRPCClientError - Cannot read properties** (9hr ago, 10hr old)
   - Path: `/watchdog-signup`
   - Error: `Cannot read properties of undefined (reading 'id')`
   - Events: 4
   - Priority: High

7. **TRPCClientError - Please login** (11hr ago, 11hr old)
   - Path: `/dashboard`
   - Error: `Please login (10001)`
   - Events: 1
   - Priority: High
   - Note: Auth state issue - user accessing protected route without auth

### Older Issues (22hr - 2d)

8. **TRPCClientError - Please login** (22hr ago)
   - Path: `/courses`
   - Events: 1

9. **TRPCClientError - Enrollment failed** (22hr ago)
   - Path: `/courses`
   - Error: `Enrollment failed: Payment plan not available for this course. Please contact support.`
   - Events: 1
   - Note: This was the bug we fixed!

10. **TypeError - useState** (24hr ago)
    - Path: `/`
    - Error: `Cannot read properties of null (reading 'useState')`
    - Events: 1
    - Note: React hook error - possibly SSR issue

11. **TRPCClientError - Enrollment failed** (1d ago)
    - Path: `/courses`
    - Error: Same payment plan error
    - Events: 7
    - Note: Multiple occurrences before fix

12. **TRPCClientError - Failed to fetch** (1d ago)
    - Path: `/dashboard`
    - Events: 2
    - Note: Network connectivity issue

13-16. **TRPCClientError - Please login** (1d ago)
    - Various paths: `/my-courses`, `/dashboard`
    - Events: 9-10 each
    - Note: Auth state persistence issues

17. **Test error** (2d ago)
    - Sentry integration verification test

## Enrollment Flow Test Results

The enrollment flow test completed **successfully**:
- ✅ Signup worked
- ✅ Login worked
- ✅ FOUNDING10K coupon applied correctly (£149 → £0)
- ✅ Free enrollment completed
- ✅ Course appeared in My Courses

## Recommendations

1. **High Priority**: Fix the `courses.validateCoupon` missing procedure
2. **High Priority**: Fix PDF template download errors (switchToPage, write after end)
3. **Medium Priority**: Investigate "Unexpected token '<'" errors - API returning HTML
4. **Medium Priority**: Review auth state handling for "Please login" errors
5. **Low Priority**: The enrollment payment plan error appears to be fixed based on successful test
