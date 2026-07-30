/**
 * Stripe Connect Onboarding Component
 * Guides specialists through setting up their Stripe Connect account to receive payouts
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  DollarSign,
  Building2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface StripeConnectOnboardingProps {
  onComplete?: () => void;
}

export default function StripeConnectOnboarding({ onComplete }: StripeConnectOnboardingProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isGettingLink, setIsGettingLink] = useState(false);

  // Get account status
  const { data: accountStatus, isLoading, refetch } = trpc.stripeConnect.getAccountStatus.useQuery();
  
  // Get account balance
  const { data: balance } = trpc.stripeConnect.getAccountBalance.useQuery(undefined, {
    enabled: accountStatus?.hasAccount && accountStatus?.payoutsEnabled,
  });

  // Mutations
  const createAccountMutation = trpc.stripeConnect.createConnectAccount.useMutation();
  const getOnboardingLinkMutation = trpc.stripeConnect.getOnboardingLink.useMutation();
  const getDashboardLinkMutation = trpc.stripeConnect.getDashboardLink.useMutation();

  const handleCreateAccount = async () => {
    setIsCreating(true);
    try {
      const result = await createAccountMutation.mutateAsync({ country: "US" });
      
      if (result.isNew) {
        toast.success("Stripe Connect account created! Complete onboarding to receive payouts.");
      }
      
      // Get onboarding link
      await handleGetOnboardingLink();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGetOnboardingLink = async () => {
    setIsGettingLink(true);
    try {
      const baseUrl = window.location.origin;
      const result = await getOnboardingLinkMutation.mutateAsync({
        refreshUrl: `${baseUrl}/settings/payouts?refresh=true`,
        returnUrl: `${baseUrl}/settings/payouts?onboarding=complete`,
      });
      
      // Open Stripe onboarding in new tab
      window.open(result.url, "_blank");
      toast.success("Stripe onboarding opened in new tab");
    } catch (error: any) {
      toast.error(error.message || "Failed to get onboarding link");
    } finally {
      setIsGettingLink(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const result = await getDashboardLinkMutation.mutateAsync();
      window.open(result.url, "_blank");
    } catch (error: any) {
      toast.error(error.message || "Failed to open dashboard");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Account fully set up
  if (accountStatus?.hasAccount && accountStatus?.payoutsEnabled && accountStatus?.detailsSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-green-700 dark:text-green-400">Payout Account Active</CardTitle>
              <CardDescription>Your Stripe Connect account is fully set up</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Display */}
          {balance && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(balance.available / 100).toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${(balance.pending / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleOpenDashboard} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Stripe Dashboard
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Account exists but needs more info
  if (accountStatus?.hasAccount && !accountStatus?.detailsSubmitted) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-amber-700 dark:text-amber-400">Complete Your Setup</CardTitle>
              <CardDescription>Finish onboarding to start receiving payouts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountStatus.requirements && accountStatus.requirements.currentlyDue.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Required Information</AlertTitle>
              <AlertDescription>
                Please provide the following to complete your account:
                <ul className="list-disc list-inside mt-2">
                  {accountStatus.requirements.currentlyDue.slice(0, 3).map((req, i) => (
                    <li key={i} className="text-sm">{req.replace(/_/g, " ")}</li>
                  ))}
                  {accountStatus.requirements.currentlyDue.length > 3 && (
                    <li className="text-sm">...and {accountStatus.requirements.currentlyDue.length - 3} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleGetOnboardingLink} 
            disabled={isGettingLink}
            className="w-full"
          >
            {isGettingLink ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Continue Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No account - show setup flow
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Set Up Payouts
        </CardTitle>
        <CardDescription>
          Connect your bank account to receive commission payouts from referrals and analyst work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
          >
            <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Earn Commissions</p>
              <p className="text-sm text-muted-foreground">
                Get 20% commission on every certification purchased through your referral link
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
          >
            <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Direct Bank Deposits</p>
              <p className="text-sm text-muted-foreground">
                Payouts go directly to your bank account on your chosen schedule
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
          >
            <ShieldCheck className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium">Secure & Compliant</p>
              <p className="text-sm text-muted-foreground">
                Powered by Stripe Connect with bank-level security and tax reporting
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <Button 
          onClick={handleCreateAccount} 
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Set Up Payout Account
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By setting up payouts, you agree to Stripe's{" "}
          <a 
            href="https://stripe.com/connect-account/legal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Connected Account Agreement
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
