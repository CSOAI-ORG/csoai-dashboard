/**
 * Exam Security Monitor Component
 * Enterprise Launch Requirement: Phase 3 - Exam Structure and Delivery
 * Monitors for potential cheating behaviors during exam
 */

import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ExamSecurityMonitorProps {
  isActive: boolean;
  onSecurityViolation?: (type: string) => void;
}

export function ExamSecurityMonitor({ 
  isActive, 
  onSecurityViolation 
}: ExamSecurityMonitorProps) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);

  // Monitor tab visibility changes
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          
          if (newCount === 1) {
            toast.warning('Tab switch detected', {
              description: 'Please stay on the exam page. Multiple violations may invalidate your attempt.',
              icon: <AlertTriangle className="h-5 w-5" />,
            });
          } else if (newCount === 3) {
            toast.error('Multiple tab switches detected', {
              description: 'This behavior may be flagged for review.',
              icon: <AlertTriangle className="h-5 w-5" />,
            });
          }

          onSecurityViolation?.('tab_switch');
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, onSecurityViolation]);

  // Monitor copy attempts
  useEffect(() => {
    if (!isActive) return;

    const handleCopy = (e: ClipboardEvent) => {
      // Allow copying from input fields (for answers)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Prevent copying exam questions
      e.preventDefault();
      setCopyAttempts(prev => {
        const newCount = prev + 1;
        
        if (newCount === 1) {
          toast.warning('Copy attempt detected', {
            description: 'Copying exam content is not allowed.',
            icon: <EyeOff className="h-5 w-5" />,
          });
        }

        onSecurityViolation?.('copy_attempt');
        return newCount;
      });
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [isActive, onSecurityViolation]);

  // Monitor right-click (context menu)
  useEffect(() => {
    if (!isActive) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow context menu on input fields
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      e.preventDefault();
      toast.info('Right-click disabled', {
        description: 'Context menu is disabled during the exam.',
      });
      onSecurityViolation?.('context_menu');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [isActive, onSecurityViolation]);

  // Monitor keyboard shortcuts (Ctrl+F, Ctrl+C, etc.)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common cheating shortcuts
      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ['f', 'F', 'u', 'U', 's', 'S', 'p', 'P'];
        if (blockedKeys.includes(e.key)) {
          e.preventDefault();
          toast.info('Keyboard shortcut disabled', {
            description: 'This shortcut is disabled during the exam.',
          });
          onSecurityViolation?.('keyboard_shortcut');
        }
      }

      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        toast.warning('Developer tools blocked', {
          description: 'Developer tools are not allowed during the exam.',
        });
        onSecurityViolation?.('devtools_attempt');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSecurityViolation]);

  // Fullscreen monitoring (optional - can be enabled for stricter exams)
  const requestFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.info('Fullscreen recommended', {
          description: 'For the best exam experience, please use fullscreen mode.',
        });
      });
    }
  }, []);

  // Display security status (for debugging/admin)
  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 opacity-50 hover:opacity-100 transition-opacity">
      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <Eye className="h-3 w-3" />
          <span>Exam Monitor Active</span>
        </div>
        {(tabSwitchCount > 0 || copyAttempts > 0) && (
          <div className="mt-1 text-yellow-400 text-xs">
            {tabSwitchCount > 0 && <div>Tab switches: {tabSwitchCount}</div>}
            {copyAttempts > 0 && <div>Copy attempts: {copyAttempts}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
