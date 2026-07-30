import { useState, useEffect } from 'react';

const PINNED_TABS_KEY = 'csoai_pinned_tabs';

export interface PinnedTab {
  id: string;
  label: string;
  timestamp: number;
}

export function usePinnedTabs() {
  const [pinnedTabs, setPinnedTabs] = useState<PinnedTab[]>([]);

  // Load pinned tabs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINNED_TABS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPinnedTabs(parsed);
      }
    } catch (error) {
      console.error('Failed to load pinned tabs:', error);
    }
  }, []);

  // Save pinned tabs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PINNED_TABS_KEY, JSON.stringify(pinnedTabs));
    } catch (error) {
      console.error('Failed to save pinned tabs:', error);
    }
  }, [pinnedTabs]);

  const pinTab = (id: string, label: string) => {
    setPinnedTabs(prev => {
      // Check if already pinned
      if (prev.some(tab => tab.id === id)) {
        return prev;
      }
      // Add new pinned tab
      return [...prev, { id, label, timestamp: Date.now() }];
    });
  };

  const unpinTab = (id: string) => {
    setPinnedTabs(prev => prev.filter(tab => tab.id !== id));
  };

  const isPinned = (id: string) => {
    return pinnedTabs.some(tab => tab.id === id);
  };

  const togglePin = (id: string, label: string) => {
    if (isPinned(id)) {
      unpinTab(id);
    } else {
      pinTab(id, label);
    }
  };

  return {
    pinnedTabs,
    pinTab,
    unpinTab,
    isPinned,
    togglePin,
  };
}
