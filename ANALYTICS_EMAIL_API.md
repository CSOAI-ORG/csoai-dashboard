# Analytics & Email Onboarding API Documentation

## Overview

This document provides comprehensive API documentation for the Analytics Dashboard and Automated Email Onboarding features of the CSOAI platform.

## Table of Contents

1. [Analytics API](#analytics-api)
2. [Email Onboarding API](#email-onboarding-api)
3. [Email Automation API](#email-automation-api)
4. [Integration Examples](#integration-examples)

---

## Analytics API

### Endpoints

#### 1. Get Dashboard Metrics

**Endpoint:** `GET /api/trpc/analytics.getDashboardMetrics`

**Description:** Retrieve real-time metrics for the last 24 hours.

**Response:**
```json
{
  "signupsLast24h": 25,
  "paymentsSuccessLast24h": 18,
  "paymentsFailedLast24h": 2,
  "courseCompletionsLast24h": 12,
  "paymentSuccessRate": "90.00"
}
```

#### 2. Get Signup Conversion Funnel

**Endpoint:** `POST /api/trpc/analytics.getSignupConversionFunnel`

**Request Body:**
```json
{
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "signupStarts": 500,
  "signupCompletes": 375,
  "conversionRate": 75.0
}
```

#### 3. Get Payment Metrics

**Endpoint:** `POST /api/trpc/analytics.getPaymentMetrics`

**Request Body:**
```json
{
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "successfulTransactions": 450,
  "failedTransactions": 50,
  "totalRevenue": 45000.00,
  "averageTransactionValue": 100.00
}
```

#### 4. Get Course Completion Stats

**Endpoint:** `POST /api/trpc/analytics.getCourseCompletionStats`

**Request Body:**
```json
{
  "startDate": "2025-12-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "enrolledCount": 300,
  "completedCount": 195,
  "completionRate": 65.0,
  "averageTimeToCompletion": 42.5
}
```

#### 5. Track Analytics Event

**Endpoint:** `POST /api/trpc/analytics.trackEvent`

**Request Body:**
```json
{
  "eventType": "course_completed",
  "userId": 123,
  "metadata": {
    "courseId": "ai-governance-101",
    "timeSpent": 3600
  }
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "evt_abc123"
}
```

---

## Email Onboarding API

### Endpoints

#### 1. Get User Email Preferences

**Endpoint:** `GET /api/trpc/emailOnboarding.getUserPreferences`

**Response:**
```json
{
  "userId": 123,
  "welcomeEmails": true,
  "courseRecommendations": true,
  "examPrepGuides": true,
  "successStories": true,
  "certificationUpdates": true,
  "frequency": "weekly"
}
```

#### 2. Update Email Preferences

**Endpoint:** `POST /api/trpc/emailOnboarding.updateEmailPreferences`

**Request Body:**
```json
{
  "welcomeEmails": true,
  "courseRecommendations": false,
  "examPrepGuides": true,
  "successStories": true,
  "certificationUpdates": true,
  "frequency": "biweekly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email preferences updated successfully"
}
```

#### 3. Get Email Templates

**Endpoint:** `GET /api/trpc/emailOnboarding.getTemplates`

**Response:**
```json
{
  "templates": [
    {
      "id": "welcome",
      "name": "Welcome Email",
      "subject": "Welcome to CSOAI - Your Certification Journey Begins"
    },
    {
      "id": "course_recommendation",
      "name": "Course Recommendation",
      "subject": "Personalized Course Recommendations for {{firstName}}"
    },
    {
      "id": "exam_prep",
      "name": "Exam Prep Guide",
      "subject": "Your {{examName}} Exam Prep Guide - Study Tips & Resources"
    },
    {
      "id": "success_stories",
      "name": "Success Stories",
      "subject": "Inspiring Success Stories from CSOAI Certified Analysts"
    },
    {
      "id": "certification_path",
      "name": "Certification Path",
      "subject": "Your Personalized Certification Path to {{targetCertification}}"
    }
  ]
}
```

#### 4. Preview Email Template

**Endpoint:** `POST /api/trpc/emailOnboarding.previewTemplate`

**Request Body:**
```json
{
  "templateId": "welcome",
  "variables": {
    "firstName": "John",
    "dashboardUrl": "https://app.csoai.com/dashboard"
  }
}
```

**Response:**
```json
{
  "subject": "Welcome to CSOAI - Your Certification Journey Begins",
  "html": "<div>...</div>",
  "text": "Welcome to CSOAI..."
}
```

---

## Email Automation API

### Endpoints

#### 1. Trigger Email Sequence

**Endpoint:** `POST /api/trpc/emailAutomation.triggerSequence`

**Request Body:**
```json
{
  "sequenceType": "welcome",
  "metadata": {
    "source": "signup_page",
    "referralCode": "ref_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sequenceId": 456
}
```

#### 2. Process Scheduled Emails (Admin)

**Endpoint:** `POST /api/trpc/emailAutomation.processScheduled`

**Response:**
```json
{
  "processed": 150,
  "failed": 5,
  "errors": []
}
```

#### 3. Cancel Email Sequence

**Endpoint:** `POST /api/trpc/emailAutomation.cancelSequence`

**Request Body:**
```json
{
  "sequenceId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sequence cancelled"
}
```

#### 4. Get Sequence Status

**Endpoint:** `GET /api/trpc/emailAutomation.getStatus`

**Query Parameters:**
- `sequenceId` (number): The sequence ID

**Response:**
```json
{
  "success": true,
  "sequence": {
    "id": 456,
    "userId": 123,
    "sequenceType": "welcome",
    "status": "active",
    "currentStep": 2,
    "createdAt": "2025-12-28T10:00:00Z",
    "updatedAt": "2025-12-29T10:00:00Z"
  }
}
```

#### 5. Health Check

**Endpoint:** `GET /api/trpc/emailAutomation.healthCheck`

**Response:**
```json
{
  "status": "operational",
  "service": "email-automation",
  "timestamp": "2025-12-28T10:00:00Z",
  "features": [
    "welcome_sequence",
    "course_recommendations",
    "exam_prep_guides",
    "success_stories",
    "certification_paths"
  ]
}
```

---

## Integration Examples

### Example 1: Complete User Onboarding Flow

```typescript
import { trpc } from '@/lib/trpc';

async function handleUserSignup(user: User) {
  // 1. Track signup event
  await trpc.analytics.trackEvent.mutate({
    eventType: 'signup_completed',
    userId: user.id,
    metadata: {
      source: 'landing_page',
      referralCode: user.referralCode,
    },
  });

  // 2. Trigger welcome email sequence
  const sequence = await trpc.emailAutomation.triggerSequence.mutate({
    sequenceType: 'welcome',
    metadata: {
      userId: user.id,
      email: user.email,
    },
  });

  // 3. Get dashboard metrics
  const metrics = await trpc.analytics.getDashboardMetrics.query();
  console.log('New signup count:', metrics.signupsLast24h);

  return { success: true, sequenceId: sequence.sequenceId };
}
```

### Example 2: Email Preference Management

```typescript
async function updateUserEmailPreferences(userId: number, preferences: EmailPreferences) {
  // Update preferences
  const result = await trpc.emailOnboarding.updateEmailPreferences.mutate(preferences);

  if (result.success) {
    // If user opted out of emails, cancel active sequences
    if (!preferences.welcomeEmails) {
      // Cancel sequences logic
    }
  }

  return result;
}
```

### Example 3: Analytics Dashboard

```typescript
async function loadAnalyticsDashboard() {
  // Get all metrics
  const [metrics, funnel, payments, courses] = await Promise.all([
    trpc.analytics.getDashboardMetrics.query(),
    trpc.analytics.getSignupConversionFunnel.query({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }),
    trpc.analytics.getPaymentMetrics.query({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }),
    trpc.analytics.getCourseCompletionStats.query({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    }),
  ]);

  return {
    metrics,
    funnel,
    payments,
    courses,
  };
}
```

### Example 4: Automated Email Processing

```typescript
// Run this as a scheduled job (e.g., every hour)
async function processScheduledEmails() {
  const result = await trpc.emailAutomation.processScheduled.mutate();
  
  console.log(`Processed: ${result.processed} emails`);
  console.log(`Failed: ${result.failed} emails`);
  
  if (result.errors.length > 0) {
    console.error('Errors:', result.errors);
  }
}

// Schedule with cron or similar
// 0 * * * * processScheduledEmails()
```

---

## Email Sequence Configuration

### Welcome Sequence

The welcome sequence is triggered automatically when a user signs up and includes:

1. **Day 0:** Welcome Email
2. **Day 1:** Course Recommendations
3. **Day 3:** Exam Prep Guide
4. **Day 7:** Success Stories
5. **Day 14:** Certification Path

### Customization

To customize the email sequence, modify the `defaultSequenceConfig` in `server/services/emailAutomation.ts`:

```typescript
export const defaultSequenceConfig: Record<string, EmailSequenceConfig[]> = {
  welcome: [
    {
      sequenceType: "welcome",
      delayDays: 0,
      templateId: "welcome",
      enabled: true,
    },
    // Add more emails...
  ],
};
```

---

## Error Handling

### Common Error Responses

```json
{
  "error": "Unauthorized: Only admins can process scheduled emails",
  "code": "UNAUTHORIZED"
}
```

```json
{
  "error": "User not found",
  "code": "NOT_FOUND"
}
```

```json
{
  "error": "Failed to send email: Invalid email address",
  "code": "INVALID_INPUT"
}
```

---

## Rate Limiting

- Analytics queries: 100 requests per minute
- Email operations: 50 requests per minute
- Admin operations: 10 requests per minute

---

## Monitoring & Logging

All analytics events and email operations are logged for monitoring and debugging:

```
[analytics] Event tracked: signup_completed (user_id: 123)
[email] Email sent: welcome (sequence_id: 456, user_id: 123)
[email] Email failed: course_recommendation (sequence_id: 456, error: Invalid email)
```

---

## Support

For API support, contact: api-support@csoai.com
