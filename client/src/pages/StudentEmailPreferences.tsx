import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Bell, Award, BookOpen, AlertTriangle, MessageSquare } from "lucide-react";

export default function StudentEmailPreferences() {
  const { data: preferences, isLoading, refetch } = trpc.emailPreferences.getPreferences.useQuery();
  const updateMutation = trpc.emailPreferences.updatePreferences.useMutation();

  const [localPrefs, setLocalPrefs] = useState({
    certificatesEnabled: true,
    progressReportsEnabled: true,
    atRiskAlertsEnabled: true,
    courseUpdatesEnabled: true,
    achievementsEnabled: true,
    instructorMessagesEnabled: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const handleToggle = (key: keyof typeof localPrefs) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(localPrefs);
      toast.success("Email preferences updated successfully");
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update email preferences");
      console.error(error);
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPrefs(preferences);
      setHasChanges(false);
    }
  };

  const notificationTypes = [
    {
      key: "certificatesEnabled" as const,
      icon: Award,
      title: "Certificate Notifications",
      description: "Receive emails when you earn new certificates",
    },
    {
      key: "progressReportsEnabled" as const,
      icon: BookOpen,
      title: "Progress Reports",
      description: "Weekly or monthly summaries of your learning progress",
    },
    {
      key: "atRiskAlertsEnabled" as const,
      icon: AlertTriangle,
      title: "At-Risk Alerts",
      description: "Notifications when you're flagged as at-risk of not completing courses",
    },
    {
      key: "courseUpdatesEnabled" as const,
      icon: Bell,
      title: "Course Updates",
      description: "Alerts about new content, course changes, and announcements",
    },
    {
      key: "achievementsEnabled" as const,
      icon: Award,
      title: "Achievement Notifications",
      description: "Celebrate milestones, badges, and learning achievements",
    },
    {
      key: "instructorMessagesEnabled" as const,
      icon: MessageSquare,
      title: "Instructor Messages",
      description: "Direct messages and feedback from your course instructors",
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Student Email Preferences</h1>
          <Card className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-muted rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Student Email Preferences</h1>
          <p className="text-muted-foreground">
            Choose which automated emails you want to receive about your learning progress
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.key}
                  className="flex items-start justify-between py-4 border-b last:border-b-0"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={type.key} className="text-base font-medium cursor-pointer">
                        {type.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={type.key}
                    checked={localPrefs[type.key]}
                    onCheckedChange={() => handleToggle(type.key)}
                  />
                </div>
              );
            })}
          </div>

          {hasChanges && (
            <div className="mt-6 pt-6 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">You have unsaved changes</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} disabled={updateMutation.isPending}>
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">About Email Notifications</p>
              <p>
                These preferences control automated emails from the CSOAI platform. You'll still receive
                important account-related emails regardless of these settings. You can update your
                preferences at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
