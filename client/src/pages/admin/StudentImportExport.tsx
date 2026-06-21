import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  FileText,
  Trash2,
  Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportRow {
  name: string;
  email: string;
  cohortId?: string;
  status: 'pending' | 'valid' | 'invalid';
  errors?: string[];
}

export default function StudentImportExport() {
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: cohortsData } = trpc.cohorts.list.useQuery({});
  const cohorts = cohortsData?.items;
  const { data: studentsData } = trpc.students.list.useQuery({});
  const students = studentsData?.items;
  const bulkCreateStudents = trpc.students.bulkCreate.useMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRow = (row: any): ImportRow => {
    const errors: string[] = [];
    const name = row.name || row.Name || row.NAME || '';
    const email = row.email || row.Email || row.EMAIL || '';
    const cohortId = row.cohortId || row.CohortId || row.cohort_id || '';

    if (!name || name.trim() === '') {
      errors.push('Name is required');
    }

    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Invalid email format');
    }

    return {
      name: name.trim(),
      email: email.trim(),
      cohortId: cohortId.trim() || selectedCohort,
      status: errors.length > 0 ? 'invalid' : 'valid',
      errors: errors.length > 0 ? errors : undefined,
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === 'csv') {
        await handleCSVUpload(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        await handleExcelUpload(file);
      } else {
        toast.error('Unsupported file format. Please upload CSV or Excel files.');
      }
    } catch (error) {
      toast.error('Failed to read file');
      console.error(error);
    }
  };

  const handleCSVUpload = async (file: File) => {
    const text = await file.text();
    const rows = text.split('\n').filter((row) => row.trim() !== '');
    const headers = rows[0].split(',').map((h) => h.trim());

    const data: ImportRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map((v) => v.trim());
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      data.push(validateRow(rowData));
    }

    setImportData(data);
    toast.success(`Loaded ${data.length} rows from CSV`);
  };

  const handleExcelUpload = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const data: ImportRow[] = jsonData.map((row: any) => validateRow(row));

    setImportData(data);
    toast.success(`Loaded ${data.length} rows from Excel`);
  };

  const handleImport = async () => {
    const validRows = importData.filter((row) => row.status === 'valid');

    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const studentsToCreate = validRows.map((row) => ({
        name: row.name,
        email: row.email,
        cohortId: row.cohortId ? parseInt(row.cohortId) : undefined,
      }));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await bulkCreateStudents.mutateAsync({ students: studentsToCreate });

      clearInterval(progressInterval);
      setProgress(100);

      toast.success(`Successfully imported ${validRows.length} students`);
      setImportData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to import students');
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleExport = () => {
    if (!students || students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const exportData = students.map((student) => ({
      Name: student.name,
      Email: student.email,
      'Cohort ID': student.cohortId || '',
      Status: student.status || 'active',
      'Enrolled At': student.enrolledAt || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    const fileName = `students-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Exported ${students.length} students`);
  };

  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const headers = ['Name', 'Email', 'Cohort ID', 'Status', 'Enrolled At'];
    const rows = students.map((student) => [
      student.name,
      student.email,
      student.cohortId || '',
      student.status || 'active',
      student.enrolledAt || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${students.length} students to CSV`);
  };

  const validCount = importData.filter((row) => row.status === 'valid').length;
  const invalidCount = importData.filter((row) => row.status === 'invalid').length;

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Import & Export</h1>
        <p className="text-muted-foreground">
          Bulk import students from CSV/Excel files or export your student database
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Student Data</CardTitle>
              <CardDescription>
                Upload a CSV or Excel file containing student information. Required columns: Name, Email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: CSV, XLSX, XLS
                  </p>
                </div>

                <div>
                  <Label htmlFor="default-cohort">Default Cohort (Optional)</Label>
                  <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {cohorts?.map((cohort) => (
                        <SelectItem key={cohort.id} value={cohort.id.toString()}>
                          {cohort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Applied to rows without a cohort specified
                  </p>
                </div>
              </div>

              {importData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium">{validCount} Valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">{invalidCount} Invalid</span>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Importing students...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleImport} disabled={isProcessing || validCount === 0}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import {validCount} Students
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImportData([])}
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Table */}
          {importData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview & Validation</CardTitle>
                <CardDescription>Review the data before importing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cohort ID</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {row.status === 'valid' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.cohortId || '-'}</TableCell>
                          <TableCell>
                            {row.errors && row.errors.length > 0 ? (
                              <div className="space-y-1">
                                {row.errors.map((error, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs">
                                    {error}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Valid
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Export to Excel
                </CardTitle>
                <CardDescription>
                  Download all student data as an Excel spreadsheet (.xlsx)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExport} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel File
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Includes: Name, Email, Cohort ID, Status, Enrolled Date
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Export to CSV
                </CardTitle>
                <CardDescription>
                  Download all student data as a CSV file for maximum compatibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportCSV} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV File
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Compatible with Excel, Google Sheets, and most databases
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Current Database Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Current Database</CardTitle>
              <CardDescription>Overview of your student database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{students?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Users className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold">{cohorts?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Cohorts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {students?.filter((s) => s.cohortId).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Assigned to Cohorts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
