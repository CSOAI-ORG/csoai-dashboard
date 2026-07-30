import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function IncidentReportForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"minor" | "major" | "critical">("major");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = trpc.status.reportIncident.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Incident reported successfully! Our team has been notified.");
      // Reset form
      setTimeout(() => {
        setTitle("");
        setDescription("");
        setSeverity("major");
        setReporterEmail("");
        setReporterName("");
        setSubmitted(false);
      }, 3000);
    },
    onError: (error) => {
      toast.error(`Failed to report incident: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    reportMutation.mutate({
      title,
      description,
      severity,
      reporterEmail: reporterEmail || undefined,
      reporterName: reporterName || undefined,
    });
  };

  if (submitted) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle>Incident Reported</CardTitle>
              <CardDescription>
                Thank you for helping us maintain platform reliability
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your incident report has been submitted and our team has been notified. 
            We'll investigate and provide updates on the status page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-orange-500" />
          <div>
            <CardTitle>Report an Incident</CardTitle>
            <CardDescription>
              Help us improve platform reliability by reporting issues
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Issue Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={10}
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what happened, when it occurred, and what you were trying to do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={2000}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters. Include as much detail as possible.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">
              Severity <span className="text-red-500">*</span>
            </Label>
            <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor - Minor inconvenience</SelectItem>
                <SelectItem value="major">Major - Significant impact</SelectItem>
                <SelectItem value="critical">Critical - Service unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reporterName">Your Name (Optional)</Label>
              <Input
                id="reporterName"
                placeholder="John Doe"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterEmail">Your Email (Optional)</Label>
              <Input
                id="reporterEmail"
                type="email"
                placeholder="john@example.com"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For updates on this incident
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This form is for reporting platform incidents and 
              service issues. For AI safety incidents, please use the{" "}
              <a href="/watchdog" className="text-primary hover:underline">
                Watchdog reporting system
              </a>
              .
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={reportMutation.isPending}
            className="w-full"
          >
            {reportMutation.isPending ? "Submitting..." : "Submit Incident Report"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
