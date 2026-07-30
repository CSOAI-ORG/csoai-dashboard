import { useEffect, useState } from 'react';

export interface RecentlyViewedItem {
  id: string;
  label: string;
  timestamp: number;
}

const STORAGE_KEY = 'dashboard-recently-viewed';
const MAX_ITEMS = 5;

export function useRecentlyViewed(currentTab: string, tabLabel: string) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as RecentlyViewedItem[];
        setRecentlyViewed(items);
      }
    } catch (error) {
      console.error('Failed to load recently viewed items:', error);
    }
  }, []);

  // Track current tab visit
  useEffect(() => {
    if (!currentTab || !tabLabel) return;

    const newItem: RecentlyViewedItem = {
      id: currentTab,
      label: tabLabel,
      timestamp: Date.now(),
    };

    setRecentlyViewed((prev) => {
      // Remove existing entry for this tab
      const filtered = prev.filter((item) => item.id !== currentTab);
      
      // Add new entry at the beginning
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recently viewed items:', error);
      }

      return updated;
    });
  }, [currentTab, tabLabel]);

  return recentlyViewed;
}
