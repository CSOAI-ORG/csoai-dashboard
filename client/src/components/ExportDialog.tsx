import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  dataType: "students" | "cohorts" | "courses" | "certificates" | "analytics";
  totalRecords: number;
  onExport?: (options: ExportOptions) => Promise<void>;
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf" | "json";
  includeProgress: boolean;
  includeCertificates: boolean;
  includePersonalInfo: boolean;
  dateRange: "all" | "last_30_days" | "last_90_days" | "custom";
  filters: {
    status?: string[];
    cohort?: string[];
  };
}

export function ExportDialog({
  open,
  onOpenChange,
  title = "Export Data",
  description = "Configure export options and download your data",
  dataType,
  totalRecords,
  onExport,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf" | "json">("csv");
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeCertificates, setIncludeCertificates] = useState(true);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "last_30_days" | "last_90_days" | "custom">(
    "all"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    const options: ExportOptions = {
      format,
      includeProgress,
      includeCertificates,
      includePersonalInfo,
      dateRange,
      filters: {},
    };

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      if (onExport) {
        await onExport(options);
      } else {
        // Simulate export delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportComplete(true);

      // Auto-download simulation
      setTimeout(() => {
        const filename = `${dataType}_export_${new Date().toISOString().split("T")[0]}.${format}`;
        toast.success(`Downloaded: ${filename}`);
        
        // Reset after a delay
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          setExportComplete(false);
          onOpenChange(false);
        }, 1500);
      }, 500);
    } catch (error) {
      toast.error("Export failed. Please try again.");
      setIsExporting(false);
      setExportProgress(0);
      setExportComplete(false);
    }
  };

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case "csv":
        return <FileText className="h-5 w-5" />;
      case "excel":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "json":
        return <FileJson className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  const getFormatDescription = (fmt: string) => {
    switch (fmt) {
      case "csv":
        return "Comma-separated values, compatible with Excel and Google Sheets";
      case "excel":
        return "Microsoft Excel format with formatting and multiple sheets";
      case "pdf":
        return "Portable Document Format, ideal for printing and sharing";
      case "json":
        return "JavaScript Object Notation, for developers and APIs";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!isExporting && !exportComplete ? (
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Export Format</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
                <div className="grid gap-3">
                  {(["csv", "excel", "pdf", "json"] as const).map((fmt) => (
                    <label
                      key={fmt}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        format === fmt
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value={fmt} id={fmt} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getFormatIcon(fmt)}
                          <span className="font-semibold uppercase">{fmt}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getFormatDescription(fmt)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Data Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Include Data</Label>
              <div className="space-y-3 pl-1">
                {dataType === "students" && (
                  <>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="includeProgress"
                        checked={includeProgress}
                        onCheckedChange={(checked) => setIncludeProgress(checked as boolean)}
                      />
                      <label
                        htmlFor="includeProgress"
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        Course Progress & Completion Status
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="includeCertificates"
                        checked={includeCertificates}
                        onCheckedChange={(checked) => setIncludeCertificates(checked as boolean)}
                      />
                      <label
                        htmlFor="includeCertificates"
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        Certificates & Achievements
                      </label>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="includePersonalInfo"
                    checked={includePersonalInfo}
                    onCheckedChange={(checked) => setIncludePersonalInfo(checked as boolean)}
                  />
                  <label
                    htmlFor="includePersonalInfo"
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    Personal Information (Name, Email, etc.)
                  </label>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label htmlFor="dateRange" className="text-base font-semibold">
                Date Range
              </Label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger id="dateRange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-2">Export Summary</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Records:</span>
                <span className="text-2xl font-display font-bold text-primary">
                  {totalRecords.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 space-y-6">
            {!exportComplete ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-1">Preparing your export...</p>
                    <p className="text-sm text-muted-foreground">
                      Processing {totalRecords.toLocaleString()} records
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {exportProgress}% complete
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold mb-1">Export Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Your file is ready and downloading...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!isExporting && !exportComplete && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export {totalRecords.toLocaleString()} Records
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
