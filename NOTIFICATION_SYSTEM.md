# COAI Dashboard - Custom Notification System

## Overview

The COAI Dashboard includes a comprehensive, production-ready notification system that enables real-time alerts, user preferences management, and multi-channel delivery. The system is fully integrated across the frontend, backend, and database layers.

## Architecture

### Backend Components

#### Database Schema
Located in `/drizzle/schema.ts`:

- **notifications** table: Stores all notifications with type, priority, content, and read status
- **notificationPreferences** table: Stores user preferences for notification types, delivery channels, and frequency
- **notificationTemplates** table: Predefined notification templates for consistency
- **notificationLogs** table: Audit trail of notification delivery attempts

#### API Endpoints
Located in `/server/routers/notifications.ts`:

The tRPC router provides the following protected procedures:

- **getNotifications(limit, offset, unreadOnly)**: Fetch user notifications with pagination
  - Returns: `{ notifications, total, unreadCount }`
  - Supports filtering by unread status
  
- **markAsRead(id)**: Mark a single notification as read
  - Updates `readAt` timestamp
  
- **markAllAsRead()**: Mark all user notifications as read
  - Bulk operation for efficiency
  
- **deleteNotification(id)**: Delete a notification
  - Includes ownership verification
  
- **getPreferences()**: Fetch user notification preferences
  - Auto-creates default preferences if none exist
  
- **updatePreferences(settings)**: Update notification preferences
  - Supports: email/Slack toggles, notification type toggles, digest mode, frequency
  
- **testNotification(channel)**: Send a test notification
  - Supports: 'email' and 'slack' channels

#### Notification Creation
The `createNotification()` helper function:

```typescript
async function createNotification(params: {
  userId: number;
  type: "compliance_alert" | "system_update" | "job_application" | 
        "certificate_issued" | "council_decision" | "report_update";
  title: string;
  message: string;
  link?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  metadata?: Record<string, any>;
  userEmail?: string;
})
```

**Features:**
- Creates in-app notification in database
- Respects user preferences before sending
- Supports email delivery (when enabled)
- Supports Slack webhook delivery (when configured)
- Includes metadata for rich notification context

### Frontend Components

#### NotificationCenter
**Location:** `/client/src/components/NotificationCenter.tsx`

A dropdown menu component integrated into the header that displays:
- List of recent notifications (up to 10)
- Unread count badge
- Quick actions (mark as read, delete)
- Link to view all notifications

**Features:**
- Auto-fetches when dropdown opens
- Real-time updates
- Priority-based visual styling
- Icon indicators for notification types

#### NotificationPreferences Page
**Location:** `/client/src/pages/NotificationPreferences.tsx`

Comprehensive settings page allowing users to customize:

1. **Notification Types**
   - Compliance Alerts
   - System Updates
   - Job Applications
   - Certificate Issued
   - Council Decisions
   - Report Updates

2. **Delivery Channels**
   - Email Notifications
   - Slack Notifications (with webhook URL configuration)

3. **Notification Frequency**
   - Instant delivery
   - Digest mode (daily/weekly summaries)

4. **Test Notifications**
   - Send test emails
   - Send test Slack messages

#### Header Integration
**Location:** `/client/src/components/Header.tsx`

The NotificationCenter component is integrated into the main header, providing:
- Always-visible notification bell icon
- Unread count badge
- Quick access to notifications
- Seamless user experience

## Notification Types

### 1. Compliance Alert
- **Priority:** High/Urgent
- **Trigger:** Compliance violations, requirement changes
- **Audience:** Compliance officers, system administrators

### 2. System Update
- **Priority:** Medium/High
- **Trigger:** Platform updates, maintenance notifications
- **Audience:** All users

### 3. Job Application
- **Priority:** Medium
- **Trigger:** New job applications, application status changes
- **Audience:** Hiring managers, HR team

### 4. Certificate Issued
- **Priority:** Medium
- **Trigger:** User completes certification exam
- **Audience:** Certified users

### 5. Council Decision
- **Priority:** High
- **Trigger:** Byzantine Council makes governance decision
- **Audience:** Stakeholders, affected parties

### 6. Report Update
- **Priority:** Medium
- **Trigger:** Watchdog report submission, status changes
- **Audience:** Report creators, reviewers

## Usage Examples

### Creating a Notification

```typescript
import { createNotification } from '@/server/routers/notifications';

// Send a compliance alert
await createNotification({
  userId: 123,
  type: 'compliance_alert',
  title: 'Compliance Violation Detected',
  message: 'Your system has failed compliance check #45',
  priority: 'urgent',
  link: '/compliance/violations/45',
  metadata: { violationId: 45, severity: 'critical' },
  userEmail: 'user@example.com'
});
```

### Fetching Notifications (Frontend)

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  const { data, refetch } = trpc.notifications.getNotifications.useQuery({
    limit: 20,
    offset: 0,
    unreadOnly: false
  });

  return (
    <div>
      <p>Unread: {data?.unreadCount}</p>
      {data?.notifications.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
}
```

### Updating Preferences

```typescript
const updatePrefs = trpc.notifications.updatePreferences.useMutation();

await updatePrefs.mutateAsync({
  emailEnabled: true,
  slackEnabled: true,
  slackWebhookUrl: 'https://hooks.slack.com/services/...',
  complianceAlerts: true,
  digestEnabled: true,
  digestFrequency: 'daily'
});
```

## Delivery Channels

### Email Notifications
- **Provider:** Resend API (configured via RESEND_API_KEY)
- **Status:** Ready for production
- **Configuration:** User email required, email delivery must be enabled

### Slack Notifications
- **Method:** Incoming Webhooks
- **Setup:** User provides Slack webhook URL in preferences
- **Format:** Rich message with title, description, and action link
- **Status:** Ready for production

## Database Queries

### Get User's Unread Count
```sql
SELECT COUNT(*) as unreadCount 
FROM notifications 
WHERE userId = ? AND isRead = 0;
```

### Get Notifications with Pagination
```sql
SELECT * FROM notifications 
WHERE userId = ? 
ORDER BY createdAt DESC 
LIMIT ? OFFSET ?;
```

### Mark Notification as Read
```sql
UPDATE notifications 
SET isRead = 1, readAt = NOW() 
WHERE id = ? AND userId = ?;
```

## Real-Time Updates

The notification system supports real-time updates through:

1. **Polling**: Frontend refetches every 10 seconds when NotificationCenter is open
2. **Event-based**: Direct API calls when notifications are created
3. **WebSocket** (future): Can be extended for true real-time delivery

## Performance Considerations

- **Pagination:** Notifications are paginated (default 20 per page)
- **Indexing:** Database indexes on userId, isRead, and createdAt for fast queries
- **Caching:** Frontend caches notification data until user refreshes
- **Cleanup:** Old notifications can be archived based on expiresAt timestamp

## Security

- **Authentication:** All endpoints require user authentication (protectedProcedure)
- **Authorization:** Users can only access their own notifications
- **Validation:** All inputs validated via Zod schemas
- **Rate Limiting:** Can be configured per endpoint

## Testing the System

### Manual Testing

1. **Create a notification:**
   - Navigate to any page that triggers a notification
   - Check the notification bell in the header

2. **View notifications:**
   - Click the notification bell
   - See the dropdown with recent notifications

3. **Manage preferences:**
   - Go to Settings → Notification Preferences
   - Toggle notification types and channels
   - Send test notifications

4. **Test email delivery:**
   - Enable email notifications
   - Send a test notification
   - Check your email

5. **Test Slack delivery:**
   - Configure Slack webhook URL
   - Send a test notification
   - Check your Slack channel

### Automated Testing

Unit tests are located in `/server/__tests__/notifications.test.ts` and cover:
- Notification creation
- Preference management
- Delivery channel selection
- Permission verification

Run tests with:
```bash
pnpm test
```

## Configuration

### Environment Variables

- `RESEND_API_KEY`: Email delivery service API key
- `VITE_APP_TITLE`: Application name for email templates
- `VITE_FRONTEND_URL`: Frontend URL for notification links

### Database

Ensure the following tables exist:
- `notifications`
- `notificationPreferences`
- `notificationTemplates`
- `notificationLogs`

Run migrations:
```bash
pnpm db:push
```

## Troubleshooting

### Notifications Not Appearing

1. Check user preferences: `getPreferences()`
2. Verify notification type is enabled
3. Check browser console for errors
4. Verify user is logged in

### Email Not Delivering

1. Verify RESEND_API_KEY is set
2. Check user email address is correct
3. Check email is enabled in preferences
4. Send a test notification to verify setup

### Slack Not Delivering

1. Verify webhook URL is correct
2. Test webhook URL independently
3. Ensure Slack channel exists and bot has access
4. Check Slack workspace permissions

## Future Enhancements

1. **WebSocket Support:** Real-time push notifications without polling
2. **SMS Delivery:** Add SMS as a delivery channel
3. **Push Notifications:** Browser/mobile push notifications
4. **Notification Scheduling:** Schedule notifications for later delivery
5. **Advanced Filtering:** Filter by date range, priority, type
6. **Notification Groups:** Group related notifications
7. **Analytics:** Track notification delivery and engagement
8. **Templates:** User-defined notification templates
9. **Automation:** Trigger notifications based on events
10. **Internationalization:** Multi-language notification support

## Support

For issues or questions about the notification system:
1. Check this documentation
2. Review the code in `/server/routers/notifications.ts`
3. Check the frontend components in `/client/src/components/`
4. Review the database schema in `/drizzle/schema.ts`

---

**Last Updated:** January 5, 2026
**Status:** Production Ready
**Version:** 1.0
