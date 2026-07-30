/**
 * Consent-aware analytics utility
 * Only loads analytics scripts when user has consented to analytics cookies
 */

import { getCookiePreferences, getConsentStatus } from '@/components/CookieConsent';

declare global {
  interface Window {
    plausible?: (...args: any[]) => void;
    _plausibleLoaded?: boolean;
  }
}

// Check if analytics consent is given
export function hasAnalyticsConsent(): boolean {
  if (!getConsentStatus()) return false;
  const preferences = getCookiePreferences();
  return preferences.analytics === true;
}

// Initialize Plausible analytics only if consent is given
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Don't load if already loaded
  if (window._plausibleLoaded) return;
  
  // Check for analytics consent
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] Skipped - no consent');
    return;
  }
  
  // Load Plausible script
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = 'https://plausible.io/js/script.js';
  script.setAttribute('data-domain', window.location.hostname);
  
  script.onload = () => {
    console.log('[Analytics] Plausible loaded successfully');
    window._plausibleLoaded = true;
  };
  
  script.onerror = () => {
    console.error('[Analytics] Failed to load Plausible');
  };
  
  document.head.appendChild(script);
  
  // Initialize plausible function
  window.plausible = window.plausible || function(...args: any[]) {
    (window as any).plausible.q = (window as any).plausible.q || [];
    (window as any).plausible.q.push(args);
  };
  
  console.log('[Analytics] Initialized with consent');
}

// Track a custom event (only if consent is given)
export function trackEvent(eventName: string, props?: Record<string, string | number | boolean>): void {
  if (!hasAnalyticsConsent()) {
    console.log(`[Analytics] Event "${eventName}" not tracked - no consent`);
    return;
  }
  
  if (window.plausible) {
    window.plausible(eventName, { props });
    console.log(`[Analytics] Tracked event: ${eventName}`);
  }
}

// Track page view (only if consent is given)
export function trackPageView(url?: string): void {
  if (!hasAnalyticsConsent()) return;
  
  if (window.plausible) {
    window.plausible('pageview', { u: url || window.location.href });
  }
}

// Remove analytics (for when user revokes consent)
export function removeAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Remove Plausible script
  const scripts = document.querySelectorAll('script[src*="plausible.io"]');
  scripts.forEach(script => script.remove());
  
  // Clear plausible function
  delete window.plausible;
  window._plausibleLoaded = false;
  
  console.log('[Analytics] Removed');
}

// Listen for consent changes and update analytics accordingly
export function setupConsentListener(): void {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('cookieConsentChanged', (e: Event) => {
    const customEvent = e as CustomEvent;
    const preferences = customEvent.detail;
    
    if (preferences.analytics) {
      // User enabled analytics
      initializeAnalytics();
    } else {
      // User disabled analytics
      removeAnalytics();
    }
  });
}
