/**
 * Alert Toast Provider Component
 * Manages real-time alert notifications with toast, sound, and desktop notifications
 */

import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useAlertSubscription } from '@/hooks/useAlertSubscription';
import { toast } from 'sonner';

interface AlertToastContextType {
  showAlert: (alert: any) => void;
  enableSoundNotifications: boolean;
  setEnableSoundNotifications: (enabled: boolean) => void;
  enableDesktopNotifications: boolean;
  setEnableDesktopNotifications: (enabled: boolean) => void;
}

const AlertToastContext = createContext<AlertToastContextType | undefined>(undefined);

interface AlertToastProviderProps {
  children: React.ReactNode;
}

export const AlertToastProvider: React.FC<AlertToastProviderProps> = ({ children }) => {
  const [enableSound, setEnableSound] = React.useState(true);
  const [enableDesktop, setEnableDesktop] = React.useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio elements for notifications
  useEffect(() => {
    // Create success sound
    const successAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==');
    audioRef.current = successAudio;
  }, []);

  /**
   * Handle incoming alert
   */
  const handleAlert = useCallback(
    (alert: any) => {
      const severityMap = {
        low: { color: 'bg-blue-500', icon: 'ℹ️' },
        medium: { color: 'bg-yellow-500', icon: '⚠️' },
        high: { color: 'bg-orange-500', icon: '🔴' },
        critical: { color: 'bg-red-600', icon: '🚨' },
      };

      const severity = alert.severity || 'medium';
      const config = severityMap[severity as keyof typeof severityMap] || severityMap.medium;

      // Show toast notification
      toast[severity === 'critical' ? 'error' : 'info'](`${config.icon} ${alert.title || 'Alert'}`, {
        description: alert.message || 'A new alert has been received',
        duration: severity === 'critical' ? Infinity : 5000,
      });

      // Play sound for urgent alerts
      if (enableSound && (severity === 'high' || severity === 'critical')) {
        playNotificationSound(severity);
      }

      // Send desktop notification for critical alerts
      if (enableDesktop && severity === 'critical') {
        sendDesktopNotification(alert);
      }
    },
    [toast, enableSound, enableDesktop]
  );

  /**
   * Play notification sound
   */
  const playNotificationSound = (severity: string) => {
    try {
      // Use Web Audio API to generate a beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Frequency based on severity
      const frequency = severity === 'critical' ? 800 : 600;
      oscillator.frequency.value = frequency;

      // Duration
      const duration = 0.2;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error('[Alert Toast] Error playing sound:', error);
    }
  };

  /**
   * Send desktop notification
   */
  const sendDesktopNotification = (alert: any) => {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(alert.title || 'Critical Alert', {
        body: alert.message || 'A critical alert requires your attention',
        icon: '/alert-icon.png',
        badge: '/badge.png',
        tag: `alert-${alert.id}`,
        requireInteraction: true,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(alert.title || 'Critical Alert', {
            body: alert.message || 'A critical alert requires your attention',
            icon: '/alert-icon.png',
            badge: '/badge.png',
            tag: `alert-${alert.id}`,
            requireInteraction: true,
          });
        }
      });
    }
  };

  // Subscribe to alerts via WebSocket
  const { isConnected } = useAlertSubscription({
    onAlert: handleAlert,
    onError: (error) => {
      console.error('[Alert Toast] WebSocket error:', error);
      toast.error('Connection Error', {
        description: 'Failed to connect to alert service',
      });
    },
  });

  const value: AlertToastContextType = {
    showAlert: handleAlert,
    enableSoundNotifications: enableSound,
    setEnableSoundNotifications: setEnableSound,
    enableDesktopNotifications: enableDesktop,
    setEnableDesktopNotifications: setEnableDesktop,
  };

  return (
    <AlertToastContext.Provider value={value}>
      {children}
    </AlertToastContext.Provider>
  );
};

/**
 * Hook to use alert toast context
 */
export const useAlertToast = (): AlertToastContextType => {
  const context = useContext(AlertToastContext);
  if (!context) {
    throw new Error('useAlertToast must be used within AlertToastProvider');
  }
  return context;
};

// Re-export sonner toast for direct use
export { toast } from 'sonner';
