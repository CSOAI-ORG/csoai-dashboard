/*
 * Payout History Page
 * View historical payouts and commission earnings
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import StripeConnectOnboarding from "@/components/StripeConnectOnboarding";
import { trpc } from "@/lib/trpc";

interface Payout {
  id: number;
  totalAmount: string | number;
  conversionCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | string;
  stripePayoutId?: string;
  stripeTransferId?: string;
  errorMessage?: string;
  scheduledFor?: string;
  processedAt?: string;
  createdAt: string;
}

const statusConfig: Record<string, {
  label: string;
  icon: typeof Clock;
  variant: "secondary" | "default" | "destructive";
  color: string;
}> = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary",
    color: "text-yellow-500",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    variant: "secondary",
    color: "text-blue-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "default",
    color: "text-green-500",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    variant: "destructive",
    color: "text-red-500",
  },
};

export default function PayoutHistory() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch payout history
  const { data: payoutHistoryData, isLoading: isLoadingHistory } = trpc.referral.getPayoutHistory.useQuery();

  // Fetch commission stats
  const { data: commissionStatsData, isLoading: isLoadingStats } = trpc.referral.getCommissionStats.useQuery();

  const payouts: Payout[] = (payoutHistoryData?.data || []) as Payout[];
  const stats = commissionStatsData?.data as {
    totalEarned?: number;
    totalProcessed?: number;
    totalPending?: number;
    totalFailed?: number;
    averageCommission?: number;
    pendingAmount?: number;
    totalPayouts?: number;
    lastPayoutDate?: string | null;
  } || {};

  // Filter payouts
  const filteredPayouts = statusFilter === "all" 
    ? payouts 
    : payouts.filter(p => p.status === statusFilter);

  // Pagination
  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalEarned = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(String(p.totalAmount)), 0);

  const pendingAmount = payouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + parseFloat(String(p.totalAmount)), 0);

  const handleExportCSV = () => {
    const headers = ["Date", "Amount", "Conversions", "Status", "Stripe ID"];
    const rows = filteredPayouts.map(p => [
      p.processedAt ? new Date(p.processedAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString(),
      `$${parseFloat(String(p.totalAmount)).toFixed(2)}`,
      p.conversionCount.toString(),
      p.status,
      p.stripeTransferId || p.stripePayoutId || "-",
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payout-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export complete", { description: "Payout history exported to CSV" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-primary flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Payout History
            </h1>
            <p className="text-muted-foreground text-sm">
              View your commission payouts and earnings history
            </p>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stripe Connect Onboarding */}
        <StripeConnectOnboarding />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-semibold text-green-500">
                      {isLoadingStats ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        formatCurrency(totalEarned || stats.totalEarned || 0)
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Payout</p>
                    <p className="text-2xl font-semibold text-yellow-500">
                      {isLoadingStats ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        formatCurrency(pendingAmount || stats.pendingAmount || stats.totalPending || 0)
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Payouts</p>
                    <p className="text-2xl font-semibold">
                      {isLoadingStats ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        payouts.filter(p => p.status === 'completed').length || stats.totalPayouts || stats.totalProcessed || 0
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Last Payout</p>
                    <p className="text-2xl font-semibold">
                      {isLoadingStats ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        payouts.filter(p => p.status === 'completed')[0]?.processedAt 
                          ? formatDate(payouts.filter(p => p.status === 'completed')[0].processedAt!)
                          : stats.lastPayoutDate 
                          ? formatDate(stats.lastPayoutDate as string)
                          : "N/A"
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payout History Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-medium">Payout Transactions</CardTitle>
                <CardDescription>
                  Detailed history of all your commission payouts
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : paginatedPayouts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No payouts found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusFilter !== "all" 
                    ? "Try changing the filter to see more results"
                    : "Your payout history will appear here once you receive your first payout"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedPayouts.map((payout, idx) => {
                    const status = statusConfig[payout.status];
                    const StatusIcon = status.icon;
                    
                    return (
                      <motion.div
                        key={payout.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${payout.status === 'completed' ? 'bg-green-500/10' : payout.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
                            <StatusIcon className={`h-5 w-5 ${status.color} ${payout.status === 'processing' ? 'animate-spin' : ''}`} />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatCurrency(parseFloat(String(payout.totalAmount)))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payout.conversionCount} conversion{payout.conversionCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">
                              {payout.processedAt 
                                ? formatDate(payout.processedAt)
                                : payout.scheduledFor
                                  ? `Scheduled: ${formatDate(payout.scheduledFor)}`
                                  : formatDate(payout.createdAt)}
                            </p>
                            {payout.stripeTransferId && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {payout.stripeTransferId.substring(0, 20)}...
                              </p>
                            )}
                          </div>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayouts.length)} of {filteredPayouts.length} payouts
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">About Payouts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payouts are processed automatically based on your payout frequency settings. 
                  The minimum payout threshold is $50. Payouts are sent via Stripe Connect 
                  and typically arrive within 3-5 business days.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs mt-2" onClick={() => window.location.href = '/settings'}>
                  Manage payout settings →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
