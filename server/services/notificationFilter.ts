import { getDb } from '../db';
import { notifications } from '../../drizzle/schema';
import { and, or, gte, lte, like, eq, inArray, desc, sql } from 'drizzle-orm';

export interface NotificationFilterOptions {
  userId: number;
  startDate?: Date;
  endDate?: Date;
  priority?: string[];
  type?: string[];
  isRead?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface FilteredNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  link?: string;
}

export class NotificationFilterService {
  public async getFilteredNotifications(options: NotificationFilterOptions) {
    try {
      const db = await getDb();
      if (!db) return { notifications: [], total: 0 };

      const { userId, startDate, endDate, priority, type, isRead, searchQuery, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;

      const conditions: any[] = [eq(notifications.userId, userId)];

      if (startDate && endDate) {
        conditions.push(and(gte(notifications.createdAt, startDate.toISOString()), lte(notifications.createdAt, endDate.toISOString())));
      } else if (startDate) {
        conditions.push(gte(notifications.createdAt, startDate.toISOString()));
      } else if (endDate) {
        conditions.push(lte(notifications.createdAt, endDate.toISOString()));
      }

      if (priority && priority.length > 0) {
        conditions.push(inArray(notifications.priority, priority as any));
      }

      if (type && type.length > 0) {
        conditions.push(inArray(notifications.type, type as any));
      }

      if (isRead !== undefined) {
        conditions.push(eq(notifications.isRead, isRead ? 1 : 0));
      }

      if (searchQuery && searchQuery.trim()) {
        const searchTerm = `%${searchQuery}%`;
        conditions.push(or(like(notifications.title, searchTerm), like(notifications.message, searchTerm)));
      }

      const whereClause = and(...conditions);
      const sortColumn = sortBy === 'priority' ? notifications.priority : sortBy === 'type' ? notifications.type : notifications.createdAt;

      const results = await db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(sortOrder === 'desc' ? desc(sortColumn) : sortColumn)
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(notifications)
        .where(whereClause);
      const total = (countResult[0] as any)?.count || 0;

      return { notifications: results as unknown as FilteredNotification[], total };
    } catch (error) {
      console.error('[Filter] Error filtering notifications:', error);
      return { notifications: [], total: 0 };
    }
  }

  public getSavedFilterPresets() {
    return [
      { id: 'last_7_days_high', name: 'Last 7 Days - High Priority', description: 'High and urgent notifications from the last 7 days', filters: { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), priority: ['high', 'urgent'] } },
      { id: 'unread', name: 'Unread Notifications', description: 'All unread notifications', filters: { isRead: false } },
      { id: 'compliance_alerts', name: 'Compliance Alerts', description: 'All compliance-related notifications', filters: { type: ['compliance_alert'] } },
      { id: 'last_24_hours', name: 'Last 24 Hours', description: 'Notifications from the last 24 hours', filters: { startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { id: 'critical', name: 'Critical Only', description: 'Only urgent priority notifications', filters: { priority: ['urgent'] } },
    ];
  }

  public async getSearchSuggestions(userId: number, query: string, limit: number = 5): Promise<string[]> {
    try {
      const db = await getDb();
      if (!db) return [];
      const results = await db.select({ title: notifications.title }).from(notifications).where(and(eq(notifications.userId, userId), like(notifications.title, `%${query}%`))).limit(limit);
      return results.map(r => r.title);
    } catch (error) {
      console.error('[Filter] Error getting search suggestions:', error);
      return [];
    }
  }

  public async markMultipleAsRead(notificationIds: number[], userId: number): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;
      await db.update(notifications).set({ isRead: 1, readAt: new Date().toISOString() }).where(and(inArray(notifications.id, notificationIds), eq(notifications.userId, userId)));
      console.log(`[Filter] Marked ${notificationIds.length} notifications as read`);
      return notificationIds.length;
    } catch (error) {
      console.error('[Filter] Error marking notifications as read:', error);
      return 0;
    }
  }

  public async deleteMultiple(notificationIds: number[], userId: number): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;
      const idList = notificationIds.join(',');
      await db.execute(sql`DELETE FROM notifications WHERE id IN (${notificationIds}) AND userId = ${userId}`);
      console.log(`[Filter] Deleted ${notificationIds.length} notifications`);
      return notificationIds.length;
    } catch (error) {
      console.error('[Filter] Error deleting notifications:', error);
      return 0;
    }
  }

  public async exportAsJSON(userId: number, options: NotificationFilterOptions): Promise<string> {
    try {
      const { notifications: notifs } = await this.getFilteredNotifications({ ...options, userId, limit: 10000 });
      return JSON.stringify(notifs, null, 2);
    } catch (error) {
      console.error('[Filter] Error exporting notifications:', error);
      return '[]';
    }
  }

  public async exportAsCSV(userId: number, options: NotificationFilterOptions): Promise<string> {
    try {
      const { notifications: notifs } = await this.getFilteredNotifications({ ...options, userId, limit: 10000 });
      let csv = 'ID,Title,Message,Type,Priority,Status,Created Date,Read Date\n';
      for (const notif of notifs) {
        csv += `${notif.id},"${notif.title.replace(/"/g, '""')}","${notif.message.replace(/"/g, '""')}",${notif.type},${notif.priority},${notif.isRead ? 'Read' : 'Unread'},${notif.createdAt},${notif.readAt || ''}\n`;
      }
      return csv;
    } catch (error) {
      console.error('[Filter] Error exporting as CSV:', error);
      return '';
    }
  }
}

export const notificationFilter = new NotificationFilterService();
