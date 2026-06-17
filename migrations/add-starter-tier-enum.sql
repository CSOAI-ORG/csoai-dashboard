-- Add 'starter' to users.subscriptionTier enum so Starter checkout can provision.
-- Without this, a Starter payment completes in Stripe but the webhook's
-- UPDATE users SET subscription_tier='starter' is REJECTED by MySQL (enum truncation),
-- leaving the paying customer on 'free'.
-- Safe/additive: existing rows keep their value; only widens the allowed set.
-- Run against the production DATABASE_URL (MySQL).

ALTER TABLE `users`
  MODIFY COLUMN `subscriptionTier`
  ENUM('free','starter','pro','enterprise') NOT NULL DEFAULT 'free';

-- OPTIONAL (consistency): organizations.subscriptionTier uses 'professional' where
-- users uses 'pro'. Not required for checkout, but reconcile if you want one vocabulary:
-- ALTER TABLE `organizations`
--   MODIFY COLUMN `subscriptionTier`
--   ENUM('free','starter','pro','enterprise') NOT NULL DEFAULT 'free';
