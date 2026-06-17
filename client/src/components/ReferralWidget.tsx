/**
 * Referral Widget
 * Dashboard widget showing referral stats and earnings
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, TrendingUp, Users, DollarSign, Copy, Share2, ArrowRight } from 'lucide-react';

interface ReferralStats {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  recentActivity: Array<{
    referredEmail: string;
    certificationName: string;
    commissionAmount: number;
    convertedAt: string;
    status: string;
  }>;
}

interface ReferralCodeInfo {
  code: string;
  status: string;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  createdAt: string;
}

export function ReferralWidget() {
  const [stats, setStats] = useState<ReferralStats>({
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    recentActivity: [],
  });
  const [referralCode, setReferralCode] = useState<ReferralCodeInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use mock data
    setStats({
      totalClicks: 12,
      totalConversions: 3,
      totalEarnings: 720,
      recentActivity: [
        {
          referredEmail: 'john@example.com',
          certificationName: 'Professional Certification',
          commissionAmount: 240,
          convertedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'earned',
        },
        {
          referredEmail: 'jane@example.com',
          certificationName: 'Expert Certification',
          commissionAmount: 480,
          convertedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'earned',
        },
      ],
    });

    setReferralCode({
      code: 'REF-ABC123DEF',
      status: 'active',
      totalClicks: 12,
      totalConversions: 3,
      totalEarnings: 720,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setLoading(false);
  }, []);

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (!referralCode) return;
    const shareUrl = `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode.code)}`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Join CSOAI',
          text: 'Join me on CSOAI — AI safety certification & compliance.',
          url: shareUrl,
        })
        .catch(() => {
          /* user dismissed the share sheet — no-op */
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Referral Program
          </CardTitle>
          <Button
            onClick={handleShare}
            size="sm"
            variant="outline"
            className="border-green-200 hover:bg-green-100"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
        <CardDescription>Earn 20% commission on every referral</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600">Clicks</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalClicks}</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600">Conversions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalConversions}</div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-gray-600">Earnings</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(stats.totalEarnings / 100).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Referral Code */}
        {referralCode && (
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralCode.code}
                readOnly
                className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm font-mono text-gray-900"
              />
              <Button
                onClick={handleCopyCode}
                size="sm"
                variant="outline"
                className="border-gray-300"
              >
                {copied ? '✓' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Conversions</h4>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.referredEmail}</p>
                    <p className="text-xs text-gray-600">{activity.certificationName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      +{formatCurrency(activity.commissionAmount)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(activity.convertedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleShare}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          View Full Referral Dashboard
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
