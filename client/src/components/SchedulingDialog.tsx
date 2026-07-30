/**
 * Scheduling Dialog Component
 * Allows users to configure cron-based scheduling for workflows
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Repeat, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: number | null;
  workflowName: string;
  currentSchedule?: {
    enabled: boolean;
    cronExpression?: string;
    timezone?: string;
  };
  onSave: (schedule: {
    enabled: boolean;
    cronExpression: string;
    timezone: string;
  }) => Promise<void>;
}

// Preset schedule options
const SCHEDULE_PRESETS = [
  { label: "Every hour", value: "0 * * * *", description: "Runs at the start of every hour" },
  { label: "Every day at 9 AM", value: "0 9 * * *", description: "Runs daily at 9:00 AM" },
  { label: "Every day at 5 PM", value: "0 17 * * *", description: "Runs daily at 5:00 PM" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1", description: "Runs every Monday at 9:00 AM" },
  { label: "Every weekday at 9 AM", value: "0 9 * * 1-5", description: "Runs Monday-Friday at 9:00 AM" },
  { label: "First day of month", value: "0 0 1 * *", description: "Runs on the 1st of each month at midnight" },
  { label: "Every 15 minutes", value: "*/15 * * * *", description: "Runs every 15 minutes" },
  { label: "Every 6 hours", value: "0 */6 * * *", description: "Runs every 6 hours" },
];

// Day of week options
const DAYS_OF_WEEK = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

export function SchedulingDialog({
  open,
  onOpenChange,
  workflowId,
  workflowName,
  currentSchedule,
  onSave,
}: SchedulingDialogProps) {
  const [enabled, setEnabled] = useState(currentSchedule?.enabled || false);
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [selectedPreset, setSelectedPreset] = useState(SCHEDULE_PRESETS[1].value);
  const [customCron, setCustomCron] = useState(currentSchedule?.cronExpression || "0 9 * * *");
  const [timezone, setTimezone] = useState(currentSchedule?.timezone || "UTC");
  
  // Custom builder state
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("9");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState<string[]>([]);

  useEffect(() => {
    if (currentSchedule?.cronExpression) {
      setCustomCron(currentSchedule.cronExpression);
      // Check if it matches a preset
      const preset = SCHEDULE_PRESETS.find(p => p.value === currentSchedule.cronExpression);
      if (preset) {
        setSelectedPreset(preset.value);
        setMode("preset");
      } else {
        setMode("custom");
      }
    }
  }, [currentSchedule]);

  // Build cron expression from custom builder
  useEffect(() => {
    if (mode === "custom") {
      const dow = dayOfWeek.length > 0 ? dayOfWeek.sort().join(",") : "*";
      const cronExpr = `${minute} ${hour} ${dayOfMonth} ${month} ${dow}`;
      setCustomCron(cronExpr);
    }
  }, [minute, hour, dayOfMonth, month, dayOfWeek, mode]);

  const handleSave = async () => {
    try {
      const cronExpression = mode === "preset" ? selectedPreset : customCron;
      await onSave({
        enabled,
        cronExpression,
        timezone,
      });
      toast.success("Schedule saved successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save schedule");
    }
  };

  const getNextExecutionTime = () => {
    // This is a simplified preview - in production you'd use a cron parser library
    const cronExpr = mode === "preset" ? selectedPreset : customCron;
    const parts = cronExpr.split(" ");
    
    if (parts.length !== 5) return "Invalid cron expression";
    
    const [min, hr, dom, mon, dow] = parts;
    
    if (min === "*" && hr === "*") return "Every minute";
    if (hr === "*") return `Every hour at minute ${min}`;
    if (dom === "*" && mon === "*" && dow === "*") return `Daily at ${hr}:${min.padStart(2, "0")}`;
    if (dow !== "*") {
      const days = dow.split(",").map(d => DAYS_OF_WEEK[parseInt(d)]?.label || d).join(", ");
      return `Every ${days} at ${hr}:${min.padStart(2, "0")}`;
    }
    
    return `At ${hr}:${min.padStart(2, "0")}`;
  };

  const toggleDayOfWeek = (day: string) => {
    setDayOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Workflow
          </DialogTitle>
          <DialogDescription>
            Configure automated scheduling for <strong>{workflowName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Schedule</Label>
              <p className="text-sm text-muted-foreground">
                Activate automated execution for this workflow
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* Schedule Mode Tabs */}
              <Tabs value={mode} onValueChange={(v) => setMode(v as "preset" | "custom")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preset">Quick Presets</TabsTrigger>
                  <TabsTrigger value="custom">Custom Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Select Schedule</Label>
                    <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{preset.label}</span>
                              <span className="text-xs text-muted-foreground">{preset.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hour (0-23)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                        placeholder="9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minute (0-59)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Days of Week (optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <Badge
                          key={day.value}
                          variant={dayOfWeek.includes(day.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleDayOfWeek(day.value)}
                        >
                          {day.label}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave empty to run every day
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Day of Month (1-31, or * for every day)</Label>
                    <Input
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      placeholder="*"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Month (1-12, or * for every month)</Label>
                    <Input
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      placeholder="*"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Next Execution</p>
                      <p className="text-sm text-muted-foreground">{getNextExecutionTime()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Repeat className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Cron Expression</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {mode === "preset" ? selectedPreset : customCron}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Timezone</p>
                      <p className="text-sm text-muted-foreground">{timezone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
