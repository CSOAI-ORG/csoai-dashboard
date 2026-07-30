import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Shield, BarChart3, Megaphone, Cog, Cookie } from 'lucide-react';
import { getCookiePreferences, getConsentStatus, CookiePreferences } from '@/components/CookieConsent';

// Cookie data with detailed information
const cookieData = {
  necessary: [
    {
      name: 'csoai_session',
      provider: 'CSOAI',
      purpose: 'Maintains your login session and authentication state',
      duration: 'Session',
      type: 'First-party',
    },
    {
      name: 'csoai_csrf',
      provider: 'CSOAI',
      purpose: 'Protects against cross-site request forgery attacks',
      duration: 'Session',
      type: 'First-party',
    },
    {
      name: 'csoai_cookie_consent',
      provider: 'CSOAI',
      purpose: 'Stores your cookie consent preferences',
      duration: '1 year',
      type: 'First-party',
    },
    {
      name: 'csoai_cookie_preferences',
      provider: 'CSOAI',
      purpose: 'Stores your detailed cookie category preferences',
      duration: '1 year',
      type: 'First-party',
    },
  ],
  analytics: [
    {
      name: 'plausible_*',
      provider: 'Plausible Analytics',
      purpose: 'Privacy-focused analytics to understand website usage patterns',
      duration: 'Session',
      type: 'First-party',
    },
    {
      name: '_sentry_*',
      provider: 'Sentry',
      purpose: 'Error tracking and performance monitoring to improve site reliability',
      duration: '1 year',
      type: 'Third-party',
    },
  ],
  functional: [
    {
      name: 'csoai_theme',
      provider: 'CSOAI',
      purpose: 'Remembers your preferred color theme (light/dark mode)',
      duration: '1 year',
      type: 'First-party',
    },
    {
      name: 'csoai_language',
      provider: 'CSOAI',
      purpose: 'Stores your preferred language setting',
      duration: '1 year',
      type: 'First-party',
    },
    {
      name: 'csoai_region',
      provider: 'CSOAI',
      purpose: 'Remembers your selected regulatory region for compliance content',
      duration: '1 year',
      type: 'First-party',
    },
    {
      name: 'csoai_sidebar_state',
      provider: 'CSOAI',
      purpose: 'Remembers sidebar collapsed/expanded state',
      duration: '30 days',
      type: 'First-party',
    },
  ],
  marketing: [
    {
      name: 'No marketing cookies',
      provider: 'N/A',
      purpose: 'CSOAI does not currently use marketing or advertising cookies',
      duration: 'N/A',
      type: 'N/A',
    },
  ],
};

export default function CookiePolicy() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    document.title = 'Cookie Policy - CSOAI';
    setHasConsented(getConsentStatus());
    setPreferences(getCookiePreferences());

    // Listen for consent changes
    const handleConsentChange = (e: CustomEvent<CookiePreferences>) => {
      setPreferences(e.detail);
      setHasConsented(true);
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const openCookieSettings = () => {
    // Clear consent to show the banner again
    localStorage.removeItem('csoai_cookie_consent');
    window.location.reload();
  };

  const categoryIcons = {
    necessary: <Shield className="h-5 w-5" />,
    analytics: <BarChart3 className="h-5 w-5" />,
    functional: <Cog className="h-5 w-5" />,
    marketing: <Megaphone className="h-5 w-5" />,
  };

  const categoryDescriptions = {
    necessary: 'Essential cookies that are required for the website to function properly. These cannot be disabled.',
    analytics: 'Help us understand how visitors interact with our website by collecting anonymous usage data.',
    functional: 'Enable enhanced functionality and personalization, such as remembering your preferences.',
    marketing: 'Used to track visitors across websites to display relevant advertisements.',
  };

  return (
    <div className="w-full bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  Cookie Policy
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  Last updated: January 4, 2025
                </p>
              </div>
            </div>
            
            {/* Current Preferences Card */}
            {hasConsented && preferences && (
              <Card className="mt-8 border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Your Current Cookie Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="default" className="bg-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Necessary: Active
                    </Badge>
                    <Badge variant={preferences.analytics ? "default" : "secondary"}>
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics: {preferences.analytics ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant={preferences.functional ? "default" : "secondary"}>
                      <Cog className="h-3 w-3 mr-1" />
                      Functional: {preferences.functional ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant={preferences.marketing ? "default" : "secondary"}>
                      <Megaphone className="h-3 w-3 mr-1" />
                      Marketing: {preferences.marketing ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={openCookieSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Change Cookie Settings
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. 
              They are widely used to make websites work more efficiently, provide a better user experience, and give website 
              owners information about how their site is being used.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              At CSOAI, we are committed to transparency about the cookies we use and giving you control over your privacy. 
              This policy explains what cookies we use, why we use them, and how you can manage your preferences.
            </p>
          </motion.div>

          {/* Cookie Categories */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cookie Categories</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We categorize cookies into four types based on their purpose. You can manage your preferences for each category 
              (except Necessary cookies, which are required for the website to function).
            </p>

            {/* Cookie Tables by Category */}
            {(Object.keys(cookieData) as Array<keyof typeof cookieData>).map((category) => (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    {categoryIcons[category]}
                    {category} Cookies
                    {category === 'necessary' && (
                      <Badge variant="default" className="ml-2 bg-green-600">Always Active</Badge>
                    )}
                    {category !== 'necessary' && preferences && (
                      <Badge variant={preferences[category] ? "default" : "secondary"} className="ml-2">
                        {preferences[category] ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categoryDescriptions[category]}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Cookie Name</TableHead>
                          <TableHead className="w-[120px]">Provider</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead className="w-[100px]">Duration</TableHead>
                          <TableHead className="w-[100px]">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cookieData[category].map((cookie, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                            <TableCell>{cookie.provider}</TableCell>
                            <TableCell className="text-sm">{cookie.purpose}</TableCell>
                            <TableCell>{cookie.duration}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {cookie.type}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Third-Party Services */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use the following third-party services that may set cookies on your device:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Plausible Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Privacy-focused web analytics that doesn't use cookies by default. We use it to understand 
                    how visitors use our website without tracking personal information.
                  </p>
                  <a href="https://plausible.io/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-primary hover:underline">
                    View Plausible Privacy Policy →
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sentry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Error tracking and performance monitoring service that helps us identify and fix issues 
                    to improve your experience.
                  </p>
                  <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-primary hover:underline">
                    View Sentry Privacy Policy →
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Stripe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Payment processing service used for course purchases and subscriptions. Stripe may set 
                    cookies for fraud prevention and payment security.
                  </p>
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-primary hover:underline">
                    View Stripe Privacy Policy →
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Manus OAuth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Authentication service used for secure login. Session cookies are set to maintain 
                    your authenticated state.
                  </p>
                  <a href="https://manus.im/privacy" target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-primary hover:underline">
                    View Manus Privacy Policy →
                  </a>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* How to Control Cookies */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Control Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You have several options for controlling cookies:
            </p>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">1. Use Our Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click the button below to open our cookie consent banner and adjust your preferences.
                  </p>
                  <Button variant="outline" onClick={openCookieSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Cookie Preferences
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">2. Browser Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Most web browsers allow you to control cookies through their settings. You can typically find these 
                    in the "Options" or "Preferences" menu of your browser. Note that blocking all cookies may affect 
                    website functionality.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">3. Delete Existing Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    You can delete cookies already stored on your device through your browser settings. This will 
                    remove your preferences and you may need to log in again.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Legal Basis */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Legal Basis for Processing</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Under the General Data Protection Regulation (GDPR) and UK GDPR, we process cookie data based on:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong>Legitimate Interest:</strong> For necessary cookies required for website functionality</li>
              <li><strong>Consent:</strong> For analytics, functional, and marketing cookies where we ask for your permission</li>
            </ul>
          </motion.div>

          {/* Updates */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Updates to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. We will notify you of any significant changes by posting the updated 
              policy on our website with a new "Last updated" date.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have questions about our use of cookies or this policy, please contact us:
            </p>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> privacy@csoai.org<br />
                  <strong>Data Protection Officer:</strong> dpo@csoai.org<br />
                  <strong>Address:</strong> CSOAI, United Kingdom<br />
                  <strong>Website:</strong> www.csoai.org
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
