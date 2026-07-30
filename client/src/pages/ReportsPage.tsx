/**
 * Reports Management Page
 * Generate, schedule, and download compliance reports
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Clock, AlertCircle } from 'lucide-react';

export function ReportsPage() {
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [recipients, setRecipients] = useState<string>('');

  // Fetch AI systems
  const { data: systems } = useQuery({
    queryKey: ['aiSystems'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'Customer Analytics AI' },
        { id: 2, name: 'Fraud Detection System' },
        { id: 3, name: 'Content Moderation AI' },
      ];
    },
  });

  // Fetch frameworks
  const { data: frameworks } = useQuery({
    queryKey: ['frameworks'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        { id: 1, name: 'EU AI Act' },
        { id: 2, name: 'NIST AI RMF' },
        { id: 3, name: 'ISO 42001' },
      ];
    },
  });

  // Generate report mutation
  const generateReportMutation = trpc.reports.generateReport.useMutation({
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });
  
  const handleGenerateReport = () => {
    if (!selectedSystem || !selectedFramework) return;
    generateReportMutation.mutate({
      aiSystemId: parseInt(selectedSystem),
      frameworkId: parseInt(selectedFramework),
      format: reportFormat,
    });
  };

  // Schedule report mutation
  const scheduleReportMutation = trpc.reports.scheduleReport.useMutation();
  
  const handleScheduleReport = () => {
    if (!selectedSystem || !selectedFramework || !recipients) return;
    scheduleReportMutation.mutate({
      aiSystemId: parseInt(selectedSystem),
      frameworkId: parseInt(selectedFramework),
      format: reportFormat,
      frequency,
      recipients: recipients.split(',').map((e) => e.trim()),
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  // Fetch scheduled reports
  const { data: scheduledReports } = trpc.reports.getScheduledReports.useQuery({});

  // Fetch report history
  const { data: reportHistory } = trpc.reports.getReportHistory.useQuery({
    limit: 10,
    offset: 0,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Compliance Reports</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Generate, schedule, and download compliance reports for your AI systems
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate On-Demand Report</CardTitle>
              <CardDescription>
                Create a compliance report for your AI system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Selection */}
              <div className="space-y-2">
                <Label htmlFor="system">AI System</Label>
                <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                  <SelectTrigger id="system">
                    <SelectValue placeholder="Select an AI system" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems?.map((system) => (
                      <SelectItem key={system.id} value={system.id.toString()}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Framework Selection */}
              <div className="space-y-2">
                <Label htmlFor="framework">Compliance Framework</Label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks?.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id.toString()}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label htmlFor="format">Report Format</Label>
                <Select value={reportFormat} onValueChange={(v) => setReportFormat(v as 'pdf' | 'excel')}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedSystem || !selectedFramework || generateReportMutation.isPending}
                className="w-full"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
              </Button>

              {generateReportMutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>{generateReportMutation.error?.message || 'An error occurred'}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Reports Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Automated Reports</CardTitle>
              <CardDescription>
                Set up recurring compliance reports to be delivered automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Selection */}
              <div className="space-y-2">
                <Label htmlFor="schedule-system">AI System</Label>
                <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                  <SelectTrigger id="schedule-system">
                    <SelectValue placeholder="Select an AI system" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems?.map((system) => (
                      <SelectItem key={system.id} value={system.id.toString()}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Framework Selection */}
              <div className="space-y-2">
                <Label htmlFor="schedule-framework">Compliance Framework</Label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger id="schedule-framework">
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks?.map((framework) => (
                      <SelectItem key={framework.id} value={framework.id.toString()}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency Selection */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Delivery Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily' | 'weekly' | 'monthly')}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="recipients"
                  placeholder="admin@company.com, compliance@company.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
              </div>

              {/* Schedule Button */}
              <Button
                onClick={handleScheduleReport}
                disabled={!selectedSystem || !selectedFramework || !recipients || scheduleReportMutation.isPending}
                className="w-full"
                size="lg"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {scheduleReportMutation.isPending ? 'Scheduling...' : 'Schedule Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Scheduled Reports List */}
          {scheduledReports?.schedules && scheduledReports.schedules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.schedules.map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Report
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Next: {new Date(schedule.nextGenerationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{schedule.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                View and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportHistory?.reports && reportHistory.reports.length > 0 ? (
                <div className="space-y-4">
                  {reportHistory.reports.map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{report.frameworkName} Report</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(report.generatedAt).toLocaleDateString()}
                          </div>
                          <div>
                            {(report.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <Badge variant="outline">{report.status}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = report.downloadUrl;
                          link.download = `report-${report.id}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reports generated yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
