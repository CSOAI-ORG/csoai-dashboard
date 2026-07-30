import { AlertCircle, CheckCircle, Info, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

interface NotificationItemProps {
  id: number;
  type: 'compliance_alert' | 'system_update' | 'job_application' | 'certificate_issued' | 'council_decision' | 'report_update';
  title: string;
  message: string;
  link?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: number;
  createdAt: string;
  onDelete?: (id: number) => void;
  onMarkAsRead?: (id: number) => void;
}

export default function NotificationItem({
  id,
  type,
  title,
  message,
  link,
  priority,
  isRead,
  createdAt,
  onDelete,
  onMarkAsRead,
}: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteNotification = trpc.notifications.deleteNotification.useMutation();
  const markAsRead = trpc.notifications.markAsRead.useMutation();

  const getIcon = () => {
    switch (type) {
      case 'compliance_alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'system_update':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'certificate_issued':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'council_decision':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'job_application':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'border-l-4 border-gray-300 bg-gray-50 dark:bg-gray-900';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNotification.mutateAsync({ id });
      onDelete?.(id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsRead.mutateAsync({ id });
      onMarkAsRead?.(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg flex gap-3 items-start transition-all hover:shadow-md',
        getPriorityColor(),
        !isRead && 'font-semibold'
      )}
    >
      <div className="flex-shrink-0 pt-1">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message}</p>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
              >
                View Details →
              </a>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTime(createdAt)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {!isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsRead}
            className="h-8 px-2 text-xs"
          >
            Mark Read
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 px-2 text-xs text-destructive hover:text-destructive"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}
