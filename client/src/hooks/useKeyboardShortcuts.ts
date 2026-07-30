import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key === shortcut.key || event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Hook for tab navigation shortcuts
export function useTabNavigationShortcuts(
  tabs: Array<{ id: string; label: string }>,
  currentTab: string,
  onTabChange: (tabId: string) => void
) {
  const shortcuts: KeyboardShortcut[] = tabs.map((tab, index) => ({
    key: String(index + 1),
    ctrl: true,
    handler: () => onTabChange(tab.id),
    description: `Switch to ${tab.label} tab`,
  }));

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
