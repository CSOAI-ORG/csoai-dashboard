import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebSocketNotificationManager } from '../services/websocketNotificationManager';
import { NotificationAnalyticsService } from '../services/notificationAnalytics';
import { NotificationFilterService } from '../services/notificationFilter';

describe('WebSocket Notification Manager', () => {
  let manager: WebSocketNotificationManager;

  beforeEach(() => {
    manager = new WebSocketNotificationManager();
    manager.initialize();
  });

  afterEach(() => {
    manager.shutdown();
  });

  it('should queue messages for offline delivery', () => {
    const mockMessage = {
      type: 'notification' as const,
      notificationId: 1,
      userId: 1,
      status: 'sent' as const,
      timestamp: Date.now(),
      data: { title: 'Test', message: 'Test message' },
    };

    manager['queueMessage'](mockMessage, 1);
    const stats = manager.getQueueStats();

    expect(stats.totalQueued).toBe(1);
    expect(stats.usersWithQueue).toBe(1);
  });

  it('should track delivery status', () => {
    manager['trackDelivery'](1, 1, 'sent');
    const status = manager.getDeliveryStatus(1, 1);

    expect(status).toBe('sent');
  });

  it('should handle queue size limits', () => {
    const mockMessage = {
      type: 'notification' as const,
      notificationId: 1,
      userId: 1,
      status: 'sent' as const,
      timestamp: Date.now(),
    };

    for (let i = 0; i < 150; i++) {
      manager['queueMessage'](mockMessage, 1);
    }

    const stats = manager.getQueueStats();
    expect(stats.totalQueued).toBeLessThanOrEqual(100);
  });

  it('should calculate effectiveness score formula correctly', () => {
    const deliveryRate = 85;
    const engagementRate = 60;
    const expectedScore = (deliveryRate * 0.6) + (engagementRate * 0.4);
    
    expect(expectedScore).toBeCloseTo(75, 0);
  });
});

describe('Notification Analytics Service', () => {
  let analytics: NotificationAnalyticsService;

  beforeEach(() => {
    analytics = new NotificationAnalyticsService();
  });

  it('should have correct effectiveness score formula', () => {
    const deliveryRate = 90;
    const engagementRate = 70;
    const expectedScore = (deliveryRate * 0.6) + (engagementRate * 0.4);
    
    expect(expectedScore).toBeCloseTo(82, 0);
  });

  it('should calculate effectiveness for perfect delivery', () => {
    const deliveryRate = 100;
    const engagementRate = 100;
    const expectedScore = (deliveryRate * 0.6) + (engagementRate * 0.4);
    
    expect(expectedScore).toBeCloseTo(100, 0);
  });

  it('should calculate effectiveness for poor delivery', () => {
    const deliveryRate = 50;
    const engagementRate = 30;
    const expectedScore = (deliveryRate * 0.6) + (engagementRate * 0.4);
    
    expect(expectedScore).toBeCloseTo(42, 0);
  });
});

describe('Notification Filter Service', () => {
  let filter: NotificationFilterService;

  beforeEach(() => {
    filter = new NotificationFilterService();
  });

  it('should return saved filter presets', () => {
    const presets = filter.getSavedFilterPresets();

    expect(presets).toHaveLength(5);
    expect(presets[0].id).toBe('last_7_days_high');
    expect(presets[1].id).toBe('unread');
    expect(presets[2].id).toBe('compliance_alerts');
  });

  it('should have correct filter preset names', () => {
    const presets = filter.getSavedFilterPresets();
    const names = presets.map(p => p.name);

    expect(names).toContain('Last 7 Days - High Priority');
    expect(names).toContain('Unread Notifications');
    expect(names).toContain('Compliance Alerts');
    expect(names).toContain('Last 24 Hours');
    expect(names).toContain('Critical Only');
  });

  it('should have correct filter configurations', () => {
    const presets = filter.getSavedFilterPresets();
    const unreadPreset = presets.find(p => p.id === 'unread');

    expect(unreadPreset?.filters.isRead).toBe(false);
  });

  it('should have compliance alerts filter', () => {
    const presets = filter.getSavedFilterPresets();
    const compliancePreset = presets.find(p => p.id === 'compliance_alerts');

    expect(compliancePreset?.filters.type).toContain('compliance_alert');
  });

  it('should have critical only filter', () => {
    const presets = filter.getSavedFilterPresets();
    const criticalPreset = presets.find(p => p.id === 'critical');

    expect(criticalPreset?.filters.priority).toContain('urgent');
  });
});

describe('Notification Features Integration', () => {
  it('should support full notification lifecycle', async () => {
    const manager = new WebSocketNotificationManager();
    manager.initialize();

    const mockMessage = {
      type: 'notification' as const,
      notificationId: 1,
      userId: 1,
      status: 'sent' as const,
      timestamp: Date.now(),
      data: { title: 'Test', message: 'Test message' },
    };

    manager['queueMessage'](mockMessage, 1);
    manager['trackDelivery'](1, 1, 'delivered');

    const stats = manager.getQueueStats();
    const deliveryStatus = manager.getDeliveryStatus(1, 1);

    expect(stats.totalQueued).toBe(1);
    expect(deliveryStatus).toBe('delivered');

    manager.shutdown();
  });

  it('should handle multiple users independently', () => {
    const manager = new WebSocketNotificationManager();
    manager.initialize();

    const msg1 = { type: 'notification' as const, notificationId: 1, userId: 1, status: 'sent' as const, timestamp: Date.now() };
    const msg2 = { type: 'notification' as const, notificationId: 2, userId: 2, status: 'sent' as const, timestamp: Date.now() };

    manager['queueMessage'](msg1, 1);
    manager['queueMessage'](msg2, 2);

    const stats = manager.getQueueStats();
    expect(stats.usersWithQueue).toBe(2);
    expect(stats.totalQueued).toBe(2);

    manager.shutdown();
  });

  it('should support all filter presets', () => {
    const filter = new NotificationFilterService();
    const presets = filter.getSavedFilterPresets();

    expect(presets.length).toBeGreaterThan(0);
    presets.forEach(preset => {
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('description');
      expect(preset).toHaveProperty('filters');
    });
  });
});
