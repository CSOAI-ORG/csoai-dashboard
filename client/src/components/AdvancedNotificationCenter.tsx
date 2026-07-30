import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Search, Filter, Download, Trash2, Check } from 'lucide-react';
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

interface FilterState {
  startDate?: Date;
  endDate?: Date;
  priority: string[];
  type: string[];
  isRead?: boolean;
  searchQuery: string;
}

export function AdvancedNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    priority: [],
    type: [],
    searchQuery: '',
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { isConnected, sendNotificationRead } = useNotificationWebSocket({
    onNotification: (notif) => {
      setNotifications(prev => [notif as any, ...prev]);
    },
    onStatusUpdate: (notificationId, status) => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: status === 'read' } : n)
      );
    },
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filters,
          limit: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMarkAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: Array.from(selectedIds) }),
      });
      setNotifications(prev =>
        prev.map(n => selectedIds.has(n.id) ? { ...n, isRead: true } : n)
      );
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: Array.from(selectedIds) }),
      });
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="flex gap-2">
          {isConnected && <Badge className="bg-green-100 text-green-800">Connected</Badge>}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search notifications..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <div className="space-y-2">
                  {['urgent', 'high', 'medium', 'low'].map(p => (
                    <label key={p} className="flex items-center gap-2">
                      <Checkbox
                        checked={filters.priority.includes(p)}
                        onCheckedChange={(checked) => {
                          const newPriority = checked
                            ? [...filters.priority, p]
                            : filters.priority.filter(x => x !== p);
                          setFilters({ ...filters, priority: newPriority });
                        }}
                      />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.isRead === false}
                      onCheckedChange={(checked) => {
                        setFilters({ ...filters, isRead: checked ? false : undefined });
                      }}
                    />
                    <span>Unread Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setFilters({ priority: [], type: [], searchQuery: '' })}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedIds.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{selectedIds.size} notification(s) selected</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleMarkAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Checkbox checked={selectedIds.size === notifications.length && notifications.length > 0} onCheckedChange={handleSelectAll} />
          <span className="text-sm text-gray-600">{notifications.length} notifications</span>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No notifications found</div>
        ) : (
          notifications.map(notif => (
            <Card key={notif.id} className={notif.isRead ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Checkbox checked={selectedIds.has(notif.id)} onCheckedChange={() => handleToggleSelect(notif.id)} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{notif.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(notif.priority)}>
                          {notif.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      {!notif.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            sendNotificationRead(notif.id);
                            setNotifications(prev =>
                              prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                            );
                          }}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
