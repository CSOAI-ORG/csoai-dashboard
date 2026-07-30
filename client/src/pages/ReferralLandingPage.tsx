/**
 * Referral Landing Page
 * Public-facing referral program signup with earnings calculator
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, TrendingUp, Users, DollarSign, Copy, Check, Share2, Linkedin, Twitter, Mail } from 'lucide-react';

export default function ReferralLandingPage() {
  const [, setLocation] = useLocation();
  const [referralCode, setReferralCode] = useState('REF-' + Math.random().toString(36).substr(2, 9).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const baseUrl = window.location.origin;
    setReferralLink(`${baseUrl}/signup?ref=${referralCode}&referrer=You`);
    
    // Track page view with Plausible
    if (window.plausible) {
      window.plausible('pageview');
    }
  }, [referralCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Track copy event
    if (window.plausible) {
      window.plausible('Referral Code Copied');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Track copy event
    if (window.plausible) {
      window.plausible('Referral Link Copied');
    }
  };

  const handleShare = (platform: string) => {
    const text = `Join me in becoming a certified AI Safety Analyst! Use my referral code ${referralCode} and earn rewards together.`;
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(referralLink);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join CSOAI Referral Program&body=${encodedText}%0A%0A${encodedLink}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
      if (window.plausible) {
        window.plausible(`Share ${platform}`);
      }
    }
  };

  const handleSignup = () => {
    setLocation(`/signup?ref=${referralCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-900 dark:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 bg-white dark:bg-white dark:bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/csoai-icon.svg.png" alt="CSOAI" className="h-8 w-8" />
            <span className="text-xl font-bold">CSOAI</span>
          </div>
          <Button 
            onClick={handleSignup}
            className="bg-green-600 hover:bg-green-700"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-full px-4 py-2 mb-6">
            <Gift className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Earn 20% Commission</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Turn Your Network Into Revenue
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Refer certified AI Safety Analysts and earn 20% commission on every certification. Build passive income while growing the AI safety community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Average Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">$2,400</div>
              <p className="text-sm text-gray-400 mt-2">per 10 successful referrals</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Active Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">1,247</div>
              <p className="text-sm text-gray-400 mt-2">earning commissions monthly</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Commission Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">20%</div>
              <p className="text-sm text-gray-400 mt-2">lifetime commission</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Referral Code Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with your network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  readOnly
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-white font-mono"
                />
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-white text-sm truncate"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <label className="block text-sm font-medium mb-2">Share On</label>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleShare('twitter')}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 flex-1"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleShare('linkedin')}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 flex-1"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleShare('email')}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700 flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Earnings Calculator */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Earnings Calculator</CardTitle>
            <CardDescription>See how much you could earn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Referrals: {referralCount}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={referralCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  setReferralCount(count);
                  setEstimatedEarnings(count * 240); // $240 per referral (20% of $1200 avg course price)
                  if (window.plausible) {
                    window.plausible('Calculator Used');
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="bg-gray-700 rounded p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Estimated Monthly Earnings:</span>
                <span className="text-3xl font-bold text-green-400">
                  ${estimatedEarnings.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>Based on:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>20% commission per certification</li>
                <li>Average certification value: $1,200</li>
                <li>Conversion rate: 60%</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Benefits Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Why Join Our Referral Program?</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Recurring Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Earn 20% commission on every certification your referrals complete, month after month.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Share your unique referral code via email, social media, or direct link.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Real-Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Monitor your referrals and earnings in real-time from your dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Automatic payouts to your account every month via Stripe Connect.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gradient-to-r from-green-900 to-blue-900 border-green-700">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of referrers building passive income while growing the AI safety community.
            </p>
            <Button
              onClick={handleSignup}
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
            >
              Get Your Referral Code
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2025 CSOAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
