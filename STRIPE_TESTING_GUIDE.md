# Stripe Payment Testing Guide

## Overview

This guide explains how to test the Stripe payment integration for the CSOAI Dashboard, including subscription creation, webhook handling, and promo code usage.

## Current Configuration

- **Production Webhook URL**: `https://coai-dash-k34vnbtb.manus.space/api/stripe/webhook`
- **Webhook Secret**: Configured in environment variables
- **Subscription Tiers**:
  - **Pro Monthly**: $99/month
  - **Pro Yearly**: $990/year (17% discount)
  - **Enterprise Monthly**: $499/month
  - **Enterprise Yearly**: $4,990/year (17% discount)

## Test Coupon Created

A 100% discount coupon has been created for testing:
- **Coupon ID**: `ruQdaYaM`
- **Discount**: 100% off
- **Duration**: Once (applies to first payment only)
- **Name**: "Test Payment - 100% Off"

## Creating Promotion Codes (Stripe Dashboard)

Since the Stripe API has changed, create promotion codes manually in the Stripe Dashboard:

### Steps:

1. **Log in to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Switch to **Live mode** (toggle in top-right)

2. **Navigate to Promotion Codes**
   - Click **Products** → **Coupons** in the left sidebar
   - Find the coupon `ruQdaYaM` ("Test Payment - 100% Off")
   - Click on the coupon

3. **Create Promotion Codes**
   - Click **"Create promotion code"** button
   - Create codes for each tier:
     - `TESTPROMONTHLY` - For Pro Monthly testing
     - `TESTPROYEARLY` - For Pro Yearly testing
     - `TESTENTERPRISEMONTHLY` - For Enterprise Monthly testing
     - `TESTENTERPRISEYEARLY` - For Enterprise Yearly testing
   - Set **Max redemptions**: 50 (or as needed)
   - Click **Create promotion code**

## Testing Payment Flows

### Test Scenario 1: Pro Monthly Subscription

1. **Navigate to the deployed site**:
   ```
   https://coai-dash-k34vnbtb.manus.space
   ```

2. **Log in or create an account**

3. **Go to Settings → Payment**

4. **Click "Upgrade to Pro"**

5. **Select "Monthly" billing**

6. **Enter promo code**: `TESTPROMONTHLY`

7. **Complete checkout**:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

8. **Verify success**:
   - Payment should be $0.00 (100% discount)
   - Redirect back to dashboard
   - Subscription status should update to "Pro"

### Test Scenario 2: Enterprise Yearly Subscription

1. **Follow steps 1-3 from Scenario 1**

2. **Click "Upgrade to Enterprise"**

3. **Select "Yearly" billing**

4. **Enter promo code**: `TESTENTERPRISEYEARLY`

5. **Complete checkout** (same test card details)

6. **Verify success**:
   - Payment should be $0.00
   - Subscription status should update to "Enterprise"

### Test Scenario 3: Subscription Upgrade

1. **Start with Pro Monthly subscription**

2. **Go to Settings → Payment**

3. **Click "Upgrade to Enterprise"**

4. **Verify**:
   - Prorated charge calculation
   - Subscription updates correctly
   - Webhook handles subscription update event

### Test Scenario 4: Subscription Cancellation

1. **Have an active subscription**

2. **Go to Settings → Payment**

3. **Click "Cancel Subscription"**

4. **Confirm cancellation**

5. **Verify**:
   - Subscription status updates to "canceled"
   - Webhook handles subscription deletion event
   - User retains access until period end

## Webhook Events to Monitor

The webhook handler processes these events:

### 1. `checkout.session.completed`
- **Triggered**: When checkout is completed
- **Handler**: `handleCheckoutCompleted()`
- **Actions**:
  - Updates user with `stripeCustomerId` and `stripeSubscriptionId`
  - Sets `subscriptionTier` (pro/enterprise)
  - Sets `subscriptionStatus` to "active"

### 2. `customer.subscription.created`
- **Triggered**: When subscription is created
- **Handler**: `handleSubscriptionUpdate()`
- **Actions**:
  - Updates subscription status
  - Updates tier based on price ID

### 3. `customer.subscription.updated`
- **Triggered**: When subscription changes (upgrade/downgrade)
- **Handler**: `handleSubscriptionUpdate()`
- **Actions**:
  - Updates subscription status
  - Updates tier if changed

### 4. `customer.subscription.deleted`
- **Triggered**: When subscription is canceled
- **Handler**: `handleSubscriptionCanceled()`
- **Actions**:
  - Sets `subscriptionTier` to "free"
  - Sets `subscriptionStatus` to "canceled"

### 5. `invoice.paid`
- **Triggered**: When invoice payment succeeds
- **Handler**: Logs event (can add email notification)

### 6. `invoice.payment_failed`
- **Triggered**: When invoice payment fails
- **Handler**: Logs event (can add email notification)

## Monitoring Webhook Delivery

### In Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Recent deliveries** tab
4. Check for:
   - ✅ Success (200 response)
   - ❌ Failures (4xx/5xx responses)
   - Response time

### In Application Logs:

Monitor server logs for webhook events:
```bash
# Check recent webhook events
grep "Stripe Webhook" /var/log/app.log

# Check for errors
grep "Stripe Webhook.*Error" /var/log/app.log
```

### In Database:

Verify database updates after webhook events:
```sql
-- Check user subscription status
SELECT id, email, subscriptionTier, subscriptionStatus, stripeCustomerId, stripeSubscriptionId
FROM users
WHERE stripeCustomerId IS NOT NULL;

-- Check course enrollments (if applicable)
SELECT id, userId, courseId, subscriptionStatus, paidAmount
FROM course_enrollments
WHERE stripeSubscriptionId IS NOT NULL;
```

## Testing Webhook Locally

To test webhooks in development:

1. **Install Stripe CLI**:
   ```bash
   stripe login
   ```

2. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Trigger test events**:
   ```bash
   # Test checkout completion
   stripe trigger checkout.session.completed

   # Test subscription creation
   stripe trigger customer.subscription.created

   # Test subscription update
   stripe trigger customer.subscription.updated

   # Test subscription cancellation
   stripe trigger customer.subscription.deleted
   ```

## Troubleshooting

### Webhook Signature Verification Failed

**Error**: `Webhook Error: No signatures found matching the expected signature for payload`

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` environment variable is correct
- Check that webhook endpoint URL matches Stripe Dashboard configuration
- Ensure request body is not modified before webhook handler

### User Not Updated After Payment

**Possible causes**:
1. **Missing user_id in metadata**:
   - Ensure checkout session includes `metadata: { user_id: userId }`
   - Check `client_reference_id` is set as fallback

2. **Database connection issue**:
   - Check database is accessible
   - Verify database credentials

3. **Webhook not reaching server**:
   - Check webhook endpoint is publicly accessible
   - Verify no firewall blocking Stripe IPs

### Subscription Status Not Updating

**Check**:
1. Webhook events are being received (Stripe Dashboard)
2. Webhook handler is processing events (server logs)
3. Database updates are successful (query database)
4. Price IDs match environment variables

## Security Considerations

### Production Checklist:

- ✅ Use live Stripe keys (not test keys)
- ✅ Webhook secret is stored securely in environment variables
- ✅ Webhook signature verification is enabled
- ✅ HTTPS is enforced for webhook endpoint
- ✅ Raw body parsing is used for webhook endpoint
- ✅ User authentication is required for payment pages
- ✅ Subscription status is verified server-side

### Best Practices:

1. **Never expose Stripe secret key** in client-side code
2. **Always verify webhook signatures** to prevent spoofing
3. **Use idempotency keys** for critical operations
4. **Log all webhook events** for audit trail
5. **Handle webhook retries** gracefully (Stripe retries failed webhooks)
6. **Test failure scenarios** (payment failures, network errors)

## Next Steps

After successful testing:

1. ✅ **Verify all webhook events are processed correctly**
2. ✅ **Test all subscription tiers (Pro/Enterprise, Monthly/Yearly)**
3. ✅ **Test subscription upgrades and downgrades**
4. ✅ **Test subscription cancellations**
5. ✅ **Monitor webhook delivery success rate**
6. ✅ **Set up alerts for webhook failures**
7. ✅ **Document any edge cases discovered**

## Support

For issues with Stripe integration:
- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **CSOAI Dashboard Issues**: Create an issue in the GitHub repository
