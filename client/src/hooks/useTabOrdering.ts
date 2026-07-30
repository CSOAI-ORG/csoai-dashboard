import { useState, useEffect } from 'react';

const STORAGE_KEY = 'csoai-tab-order';

export interface TabItem {
  id: string;
  label: string;
  icon: any;
  description: string;
}

export function useTabOrdering(defaultTabs: TabItem[]) {
  const [orderedTabs, setOrderedTabs] = useState<TabItem[]>(() => {
    // Try to load saved order from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved) as string[];
        // Reorder tabs based on saved IDs
        const reordered = savedOrder
          .map(id => defaultTabs.find(tab => tab.id === id))
          .filter((tab): tab is TabItem => tab !== undefined);
        
        // Add any new tabs that weren't in saved order
        const newTabs = defaultTabs.filter(
          tab => !savedOrder.includes(tab.id)
        );
        
        return [...reordered, ...newTabs];
      } catch (e) {
        console.error('Failed to parse saved tab order:', e);
        return defaultTabs;
      }
    }
    return defaultTabs;
  });

  // Save order to localStorage whenever it changes
  useEffect(() => {
    const order = orderedTabs.map(tab => tab.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [orderedTabs]);

  const reorderTabs = (newOrder: TabItem[]) => {
    setOrderedTabs(newOrder);
  };

  const resetOrder = () => {
    setOrderedTabs(defaultTabs);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    orderedTabs,
    reorderTabs,
    resetOrder,
  };
}
