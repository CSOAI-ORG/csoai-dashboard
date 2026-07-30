/*
 * CSOAI Settings Page
 * User and organization settings
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Building, Bell, Shield, Key, Palette, Globe, Wallet, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";

const settingsSections = [
  {
    title: "Profile",
    description: "Manage your personal information",
    icon: User,
  },
  {
    title: "Organization",
    description: "Company and team settings",
    icon: Building,
  },
  {
    title: "Notifications",
    description: "Configure alert preferences",
    icon: Bell,
  },
  {
    title: "Payout Settings",
    description: "Configure payout frequency",
    icon: Wallet,
  },
  {
    title: "Security",
    description: "Password and authentication",
    icon: Shield,
  },
  {
    title: "API Keys",
    description: "Manage API access tokens",
    icon: Key,
  },
  {
    title: "Appearance",
    description: "Theme and display settings",
    icon: Palette,
  },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("Profile");
  const [payoutFrequency, setPayoutFrequency] = useState<"weekly" | "biweekly" | "monthly">("monthly");

  // Fetch payout settings from backend
  // DISABLED: Referral feature temporarily disabled for launch
  // const { data: payoutSettings, isLoading: isLoadingSettings } = trpc.referral.getPayoutSettings.useQuery();
  const isLoadingSettings = false;
  const payoutSettings = null;

  // Update payout frequency mutation
  // const updatePayoutFrequencyMutation = trpc.referral.updatePayoutFrequency.useMutation({
  //   onSuccess: (data) => {
  //     toast.success("Payout settings saved", {
  //       description: data.message,
  //     });
  //   },
  //   onError: (error) => {
  //     toast.error("Failed to save payout settings", {
  //       description: error.message,
  //     });
  // });

  // Set initial payout frequency from backend
  // useEffect(() => {
  //   if (payoutSettings?.data?.payoutFrequency) {
  //     setPayoutFrequency(payoutSettings.data.payoutFrequency as "weekly" | "biweekly" | "monthly");
  //   }
  // }, [payoutSettings]);

  const handleSavePayoutSettings = () => {
    // updatePayoutFrequencyMutation.mutate({ frequency: payoutFrequency });
    toast.info("Payout settings feature temporarily disabled");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold font-primary">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="space-y-2">
            {settingsSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.03 }}
                >
                  <Button
                    variant={activeSection === section.title ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveSection(section.title)}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === "Profile" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="Admin" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="User" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="admin@coai.example" />
                    </div>

                    {/* Organization */}
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input id="organization" defaultValue="CSOAI Demo Corp" />
                    </div>

                    <Separator />

                    {/* Preferences */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Preferences</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Email Notifications</p>
                          <p className="text-xs text-muted-foreground">
                            Receive email alerts for compliance updates
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Council Vote Alerts</p>
                          <p className="text-xs text-muted-foreground">
                            Get notified when votes require attention
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Watchdog Reports</p>
                          <p className="text-xs text-muted-foreground">
                            Alerts for new public incident reports
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <Separator />

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <Button onClick={() => toast.success("Settings saved")}>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "Payout Settings" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Payout Settings
                    </CardTitle>
                    <CardDescription>
                      Configure how and when you receive your referral commission payouts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoadingSettings ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        {/* Payout Frequency */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Payout Frequency</h4>
                          <p className="text-xs text-muted-foreground">
                            Choose how often you want to receive your referral commission payouts. 
                            Payouts are processed automatically based on your selected frequency.
                          </p>
                          
                          <div className="space-y-2">
                            <Label htmlFor="payoutFrequency">Frequency</Label>
                            <Select value={payoutFrequency} onValueChange={(value) => setPayoutFrequency(value as "weekly" | "biweekly" | "monthly")}>
                              <SelectTrigger className="w-full max-w-xs">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Weekly</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="biweekly">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Bi-weekly (Every 2 weeks)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="monthly">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Monthly</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* payoutSettings?.data?.lastPayoutDate && (
                            <p className="text-xs text-muted-foreground">
                              Last payout: {new Date(payoutSettings.data.lastPayoutDate).toLocaleDateString()}
                            </p>
                          ) */}
                        </div>

                        <Separator />

                        {/* Payout Information */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Payout Information</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Minimum Payout</p>
                              <p className="text-lg font-semibold">$50.00</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Payouts are processed when your balance reaches this threshold
                              </p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Processing Time</p>
                              <p className="text-lg font-semibold">3-5 Business Days</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                After payout is initiated via Stripe
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Payout Method */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Payout Method</h4>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded">
                                <Wallet className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Stripe Connect</p>
                                <p className="text-xs text-muted-foreground">
                                  Payouts are sent directly to your connected Stripe account
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast.info("Stripe Connect", { description: "Manage your Stripe account in the Billing section" })}>
                              Manage
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        {/* Save Button */}
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSavePayoutSettings}
                            disabled={false}
                          >
                            {false ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Payout Settings"
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection !== "Profile" && activeSection !== "Payout Settings" && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {activeSection}
                    </CardTitle>
                    <CardDescription>
                      This section is coming soon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      We're working on bringing you more settings options. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
