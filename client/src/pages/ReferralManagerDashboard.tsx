/**
 * Referral Manager Dashboard
 * Dashboard for referral managers to view team performance and manage commissions
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, DollarSign, CheckCircle2, Clock, AlertCircle, Download, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  status: 'active' | 'inactive';
}

interface CommissionApproval {
  id: number;
  referredUserEmail: string;
  referredUserName?: string;
  certificationName: string;
  commissionAmount: number;
  status: string;
  submittedDate: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    totalClicks: 450,
    totalConversions: 35,
    totalEarnings: 1750,
    conversionRate: 7.78,
    status: 'active',
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    totalClicks: 380,
    totalConversions: 28,
    totalEarnings: 1400,
    conversionRate: 7.37,
    status: 'active',
  },
  {
    id: 3,
    name: 'Emily Watson',
    email: 'emily@example.com',
    totalClicks: 250,
    totalConversions: 15,
    totalEarnings: 750,
    conversionRate: 6.0,
    status: 'active',
  },
];

export default function ReferralManagerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // Fetch pending approvals
  const { data: approvalsResponse, isLoading: isFetchingApprovals, refetch: refetchApprovals, error: approvalsError } = trpc.referral.getPendingApprovals.useQuery();

  useEffect(() => {
    if (approvalsError) {
      toast.error('Failed to load pending approvals');
      console.error('Approvals error:', approvalsError);
    }
  }, [approvalsError]);

  const pendingApprovals = approvalsResponse?.data || [];

  // Approve commission mutation
  const approveMutation = trpc.referral.approveCommission.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Commission approved successfully');
        refetchApprovals();
      }
      setApprovingId(null);
    },
    onError: (error) => {
      toast.error('Failed to approve commission');
      console.error('Approve error:', error);
      setApprovingId(null);
    },
  });

  // Reject commission mutation
  const rejectMutation = trpc.referral.rejectCommission.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Commission rejected successfully');
        refetchApprovals();
      }
      setRejectingId(null);
    },
    onError: (error) => {
      toast.error('Failed to reject commission');
      console.error('Reject error:', error);
      setRejectingId(null);
    },
  });

  // Get commission stats
  const { data: statsResponse, isLoading: isFetchingStats, error: statsError } = trpc.referral.getCommissionStats.useQuery();

  useEffect(() => {
    if (statsError) {
      console.error('Stats error:', statsError);
    }
  }, [statsError]);

  const stats = statsResponse?.data || {
    totalEarned: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalFailed: 0,
    averageCommission: 0,
  };

  // Filter team members
  const filteredMembers = useMemo(() => {
    return mockTeamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Calculate team totals
  const teamTotals = useMemo(() => {
    return {
      totalMembers: mockTeamMembers.length,
      activeMembers: mockTeamMembers.filter((m) => m.status === 'active').length,
      totalClicks: mockTeamMembers.reduce((sum, m) => sum + m.totalClicks, 0),
      totalConversions: mockTeamMembers.reduce((sum, m) => sum + m.totalConversions, 0),
      totalEarnings: mockTeamMembers.reduce((sum, m) => sum + m.totalEarnings, 0),
      pendingApprovals: pendingApprovals.length,
      pendingAmount: pendingApprovals.reduce((sum, a) => sum + a.commissionAmount, 0),
    };
  }, [pendingApprovals]);

  const handleApproveCommission = async (id: number) => {
    setApprovingId(id);
    await approveMutation.mutateAsync({ conversionId: id });
  };

  const handleRejectCommission = async (id: number) => {
    setRejectingId(id);
    await rejectMutation.mutateAsync({ conversionId: id });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Manager Dashboard</h1>
          <p className="text-gray-600">Manage your referral team and approve commissions</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{teamTotals.activeMembers}</div>
              <p className="text-xs text-gray-500 mt-1">of {teamTotals.totalMembers} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Team Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{teamTotals.totalConversions}</div>
              <p className="text-xs text-gray-500 mt-1">Total certified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Team Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${teamTotals.totalEarnings}</div>
              <p className="text-xs text-gray-500 mt-1">Total commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${teamTotals.pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">{teamTotals.pendingApprovals} pending</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Commission Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Commission Approvals</CardTitle>
              <CardDescription>Review and approve pending commission requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isFetchingApprovals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="ml-2 text-gray-600">Loading approvals...</span>
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-gray-600">No pending commissions to approve</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{approval.referredUserEmail}</div>
                        <div className="text-sm text-gray-500">{approval.certificationName}</div>
                        <div className="text-xs text-gray-400 mt-1">Submitted: {new Date(approval.submittedDate).toLocaleDateString()}</div>
                      </div>

                      <div className="text-right mr-6">
                        <div className="font-semibold text-emerald-600">${approval.commissionAmount.toFixed(2)}</div>
                        <div className="text-xs text-amber-600 font-medium">Pending</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectCommission(approval.id)}
                          disabled={rejectingId === approval.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {rejectingId === approval.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Reject'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveCommission(approval.id)}
                          disabled={approvingId === approval.id}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {approvingId === approval.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Commission Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Commission Statistics</CardTitle>
              <CardDescription>Overview of commission status and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {isFetchingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Earned</div>
                    <div className="text-2xl font-bold text-emerald-600">${stats.totalEarned.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Processed</div>
                    <div className="text-2xl font-bold text-blue-600">${stats.totalProcessed.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Pending</div>
                    <div className="text-2xl font-bold text-amber-600">${stats.totalPending.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>View and manage referral team performance</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Clicks</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Conversions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Conv. Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Earnings</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{member.totalClicks}</td>
                        <td className="py-3 px-4 text-gray-900">{member.totalConversions}</td>
                        <td className="py-3 px-4 text-gray-900">{member.conversionRate.toFixed(2)}%</td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">${member.totalEarnings}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No team members found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
