/**
 * Referral Program Dashboard
 * 20% commission for organizations referring certified analysts
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, Mail, Linkedin, Twitter, TrendingUp, DollarSign, Users, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ReferralEarnings {
  referrerId: string;
  totalEarnings: number;
  pendingEarnings: number;
  processedEarnings: number;
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  nextPayoutDate: Date;
}

interface ReferralStats {
  totalReferrers: number;
  totalReferrals: number;
  totalConversions: number;
  totalCommissions: number;
  averageCommissionPerReferral: number;
  topReferrers: Array<{
    referrerId: string;
    earnings: number;
    referrals: number;
    conversions: number;
  }>;
}

export function ReferralProgram() {
  const [referralCode, setReferralCode] = useState('CSOAI-A1B2C3D4');
  const [earnings, setEarnings] = useState<ReferralEarnings>({
    referrerId: 'user-123',
    totalEarnings: 4800, // $48.00
    pendingEarnings: 1200, // $12.00
    processedEarnings: 3600, // $36.00
    totalReferrals: 12,
    convertedReferrals: 8,
    conversionRate: 66.7,
    nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const [stats, setStats] = useState<ReferralStats>({
    totalReferrers: 342,
    totalReferrals: 2847,
    totalConversions: 1205,
    totalCommissions: 240500, // $2,405.00
    averageCommissionPerReferral: 199.5,
    topReferrers: [
      { referrerId: 'user-001', earnings: 28500, referrals: 45, conversions: 19 },
      { referrerId: 'user-002', earnings: 24200, referrals: 38, conversions: 16 },
      { referrerId: 'user-003', earnings: 19800, referrals: 33, conversions: 13 },
    ],
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://csoai.org/join?ref=${referralCode}`);
    toast.success('Referral link copied to clipboard!');
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const marketingMaterials = {
    email: `Hi there!

I'm earning 20% commission by referring analysts to CSOAI - the world's leading AI Safety Certification platform.

Join me and get certified as an AI Safety Analyst:
https://csoai.org/join?ref=${referralCode}

You'll get:
✅ Industry-recognized certification
✅ Job board access
✅ Government integration
✅ Career advancement

Use my referral link above and we both benefit!

Best,
Your Friend`,

    social: `🚀 I'm earning 20% commission by referring analysts to CSOAI!

Join me reviewing AI systems for compliance.

Get 20% off with my referral link:
https://csoai.org/join?ref=${referralCode}

#AISafety #Certification #Jobs`,

    linkedin: `I'm excited to share that I'm part of CSOAI's referral program, earning 20% commission for each analyst I refer.

If you're interested in joining the fastest-growing AI safety profession, use my referral link:
https://csoai.org/join?ref=${referralCode}

Benefits:
• Industry-recognized certification
• Job opportunities
• Government compliance oversight
• Career advancement in AI governance

Looking forward to seeing you in the program!`,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-gray-600">Earn 20% commission for each analyst you refer</p>
        </div>

        <Alert>
          <Gift className="h-4 w-4" />
          <AlertDescription>
            Earn $10-$30 per referral when your referred analyst completes certification. Payouts
            processed monthly via Stripe.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold">{formatCurrency(earnings.totalEarnings)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payout</p>
                  <p className="text-3xl font-bold">{formatCurrency(earnings.pendingEarnings)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-3xl font-bold">{earnings.totalReferrals}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold">{earnings.conversionRate.toFixed(1)}%</p>
                </div>
                <Gift className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to start earning commissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={`https://csoai.org/join?ref=${referralCode}`}
              readOnly
              className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
            />
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard.writeText(marketingMaterials.email);
                toast.success('Email template copied!');
              }}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard.writeText(marketingMaterials.social);
                toast.success('Social media template copied!');
              }}
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard.writeText(marketingMaterials.linkedin);
                toast.success('LinkedIn template copied!');
              }}
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Track your referral conversions and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Sarah Johnson',
                    status: 'converted',
                    date: '2025-12-20',
                    earnings: 300,
                  },
                  {
                    name: 'Michael Chen',
                    status: 'converted',
                    date: '2025-12-18',
                    earnings: 300,
                  },
                  {
                    name: 'Emma Davis',
                    status: 'pending',
                    date: '2025-12-15',
                    earnings: 0,
                  },
                  {
                    name: 'James Wilson',
                    status: 'converted',
                    date: '2025-12-12',
                    earnings: 300,
                  },
                ].map((referral, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{referral.name}</p>
                      <p className="text-sm text-gray-600">{referral.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={referral.status === 'converted' ? 'default' : 'outline'}
                      >
                        {referral.status}
                      </Badge>
                      <p className="font-semibold">
                        {referral.earnings > 0 ? formatCurrency(referral.earnings) : '-'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Monthly payout schedule and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Next payout: {earnings.nextPayoutDate.toLocaleDateString()} (
                  {formatCurrency(earnings.pendingEarnings)} pending)
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {[
                  { date: '2025-11-30', amount: 1800, status: 'completed' },
                  { date: '2025-10-31', amount: 1200, status: 'completed' },
                  { date: '2025-09-30', amount: 600, status: 'completed' },
                ].map((payout, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{payout.date}</p>
                      <p className="text-sm text-gray-600">Monthly payout</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{payout.status}</Badge>
                      <p className="font-semibold">{formatCurrency(payout.amount)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>Leaderboard of highest-earning referrers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topReferrers.map((referrer, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold">User {idx + 1}</p>
                        <p className="text-sm text-gray-600">
                          {referrer.conversions} conversions from {referrer.referrals} referrals
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-600">{formatCurrency(referrer.earnings)}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Program Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Program Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalReferrers}</p>
              <p className="text-sm text-gray-600">Active Referrers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalConversions}</p>
              <p className="text-sm text-gray-600">Conversions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(stats.totalCommissions)}</p>
              <p className="text-sm text-gray-600">Total Paid</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
