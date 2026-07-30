# Stripe Payment Integration - Course Purchases

## Overview

All 3 courses now have complete Stripe payment integration with flexible payment plans. Users can choose from one-time payment or monthly subscriptions (3, 6, or 12 months).

## Stripe Products Created

### 1. EU AI Act Fundamentals
- **Product ID**: `prod_TfW0EWT7kcccZD`
- **Description**: Comprehensive 8-module course covering the EU AI Act with certification upon completion

**Pricing Options:**
- **One-time**: £499 (Price ID: `price_1Sl2FaPQoWxXkjBZikPsHDzO`)
- **3-month plan**: £199/month (Price ID: `price_1Sl2FfPQoWxXkjBZ35sqQ0R6`)
- **6-month plan**: £99/month (Price ID: `price_1Sl2FjPQoWxXkjBZWsZWjUOC`)
- **12-month plan**: £59/month (Price ID: `price_1Sl2FoPQoWxXkjBZJIdyNTQE`)

### 2. NIST AI RMF Fundamentals
- **Product ID**: `prod_TiTB5y1L9N8OJ0`
- **Description**: Comprehensive 8-module course covering the NIST AI Risk Management Framework with certification upon completion

**Pricing Options:**
- **One-time**: £499 (Price ID: `price_1Sl2FsPQoWxXkjBZXS48jcJl`)
- **3-month plan**: £199/month (Price ID: `price_1Sl2FxPQoWxXkjBZr7R1cjKw`)
- **6-month plan**: £99/month (Price ID: `price_1Sl2G2PQoWxXkjBZCz85uk0P`)
- **12-month plan**: £59/month (Price ID: `price_1Sl2G6PQoWxXkjBZsm8G58fB`)

### 3. ISO 42001 Fundamentals
- **Product ID**: `prod_TiTBaTjS6uC9up`
- **Description**: Comprehensive 8-module course covering ISO 42001 AI Management System with certification upon completion

**Pricing Options:**
- **One-time**: £499 (Price ID: `price_1Sl2GBPQoWxXkjBZHRtPgfgo`)
- **3-month plan**: £199/month (Price ID: `price_1Sl2GFPQoWxXkjBZAFdj2prD`)
- **6-month plan**: £99/month (Price ID: `price_1Sl2GJPQoWxXkjBZisJWaDtO`)
- **12-month plan**: £59/month (Price ID: `price_1Sl2GOPQoWxXkjBZfpOPrPio`)

## Database Integration

All Stripe product IDs and price IDs have been stored in the database `courses` table:
- `stripeProductId` - Main product identifier
- `stripePriceIdOneTime` - One-time payment price
- `stripePriceId3Month` - 3-month subscription price
- `stripePriceId6Month` - 6-month subscription price
- `stripePriceId12Month` - 12-month subscription price

## Payment Flow

### Frontend (client/src/pages/Courses.tsx)
1. User browses courses on `/courses` page
2. User selects payment plan (one-time, 3-month, 6-month, or 12-month)
3. User clicks "Enroll Now" button
4. Frontend calls `trpc.courses.enrollInCourse.mutateAsync()`
5. User is redirected to Stripe Checkout

### Backend (server/courses.ts)
1. `enrollInCourse` mutation receives course ID and payment type
2. Validates user is not already enrolled
3. Retrieves course and corresponding Stripe price ID
4. Creates Stripe Checkout session with:
   - Correct price ID based on payment plan
   - Mode: "subscription" for monthly plans, "payment" for one-time
   - Success URL: `/my-courses?success=true&courseId={id}`
   - Cancel URL: `/courses?cancelled=true`
   - Metadata: userId, courseId, paymentType
5. Returns checkout URL to frontend

### Webhook Processing (server/stripe.ts)
1. Stripe sends webhook events to `/api/stripe/webhook`
2. `checkout.session.completed` event:
   - Creates course enrollment record
   - Sets status to "enrolled"
   - Records payment amount and subscription ID
3. `customer.subscription.deleted` event:
   - Updates enrollment status to "cancelled"
   - Maintains access until subscription end date

## Testing the Integration

### Manual Testing Steps
1. Navigate to `/courses` page (must be logged in)
2. Select a course (EU AI Act, NIST AI RMF, or ISO 42001)
3. Choose a payment plan from the selector
4. Click "Enroll Now"
5. Complete Stripe Checkout with test card: `4242 4242 4242 4242`
6. Verify redirect to `/my-courses` with success message
7. Verify course appears in "My Courses" with enrolled status

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

## Environment Variables Required

```bash
STRIPE_SECRET_KEY=sk_live_... # Production key
STRIPE_PUBLISHABLE_KEY=pk_live_... # Production key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret
VITE_FRONTEND_URL=https://csoai.org # For redirect URLs
```

## Next Steps

1. **Test Payment Flow**: Complete a test purchase for each course
2. **Verify Webhooks**: Ensure webhook events are being received and processed
3. **Test Subscriptions**: Verify monthly billing works correctly
4. **Test Cancellations**: Ensure subscription cancellations are handled properly
5. **Monitor Stripe Dashboard**: Check for successful payments and subscriptions

## Support

For issues with Stripe integration:
1. Check Stripe Dashboard logs at https://dashboard.stripe.com/logs
2. Check webhook event history at https://dashboard.stripe.com/webhooks
3. Review server logs for enrollment errors
4. Verify environment variables are set correctly
