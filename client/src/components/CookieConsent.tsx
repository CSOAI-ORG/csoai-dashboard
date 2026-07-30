import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cookie consent types
export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = 'csoai_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'csoai_cookie_preferences';

// Default preferences
const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

// Get stored consent status
export function getConsentStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

// Get stored preferences
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return defaultPreferences;
  
  const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (stored) {
    try {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    } catch {
      return defaultPreferences;
    }
  }
  return defaultPreferences;
}

// Check if specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences();
  return preferences[type] ?? false;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = getConsentStatus();
    if (!hasConsented) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      setPreferences(getCookiePreferences());
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    
    // Dispatch event for other components to react to consent changes
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: prefs }));
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptNecessary = () => {
    saveConsent(defaultPreferences);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
          showBanner ? "opacity-100" : "opacity-0"
        )}
        onClick={() => {}} // Prevent closing by clicking backdrop
      />
      
      {/* Banner */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <Card className="max-w-4xl mx-auto shadow-2xl border-2 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your experience
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              We use cookies and similar technologies to help personalize content, tailor and measure ads, 
              and provide a better experience. By clicking "Accept All", you consent to the use of ALL cookies. 
              You can manage your preferences by clicking "Customize".
            </p>

            {/* Settings Panel */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Customize Cookie Settings</span>
                </div>
                {showSettings ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showSettings && (
                <div className="border-t p-4 space-y-4 bg-muted/20">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <Label className="font-medium">Strictly Necessary</Label>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Always Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Essential for the website to function. Cannot be disabled.
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label className="font-medium">Analytics Cookies</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Help us understand how visitors interact with our website by collecting anonymous data.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => updatePreference('analytics', checked)}
                    />
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label className="font-medium">Functional Cookies</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enable enhanced functionality like remembering preferences and personalization.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.functional}
                      onCheckedChange={(checked) => updatePreference('functional', checked)}
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label className="font-medium">Marketing Cookies</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used to track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => updatePreference('marketing', checked)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleAcceptNecessary}
                className="flex-1"
              >
                Necessary Only
              </Button>
              {showSettings && (
                <Button
                  variant="outline"
                  onClick={handleSavePreferences}
                  className="flex-1"
                >
                  Save Preferences
                </Button>
              )}
              <Button
                onClick={handleAcceptAll}
                className="flex-1"
              >
                Accept All
              </Button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <a href="/privacy" className="hover:text-primary hover:underline">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="/cookies" className="hover:text-primary hover:underline">
                Cookie Policy
              </a>
              <span>•</span>
              <a href="/terms" className="hover:text-primary hover:underline">
                Terms of Service
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Hook to check cookie consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    setHasConsented(getConsentStatus());
    setConsent(getCookiePreferences());

    const handleConsentChange = (e: CustomEvent<CookiePreferences>) => {
      setConsent(e.detail);
      setHasConsented(true);
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, []);

  return { consent, hasConsented };
}
