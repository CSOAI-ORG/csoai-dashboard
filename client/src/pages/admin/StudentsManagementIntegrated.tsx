import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users,
  Search,
  Download,
  Mail,
  UserPlus,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Filter,
  X,
  Loader2,
  FileDown,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function StudentsManagementIntegrated() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cohortFilter, setCohortFilter] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // tRPC queries
  const { data: studentsData, isLoading, refetch } = trpc.students.list.useQuery({
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter as any,
    cohortId: cohortFilter === "all" ? undefined : parseInt(cohortFilter),
    limit: 100,
    offset: 0,
  });

  const { data: cohorts } = trpc.cohorts.list.useQuery({
    status: "active",
    limit: 100,
    offset: 0,
  });

  const { data: exportData } = trpc.students.export.useQuery(
    {
      cohortId: cohortFilter === "all" ? undefined : parseInt(cohortFilter),
      status: statusFilter === "all" ? undefined : statusFilter as any,
    },
    { enabled: exportDialogOpen }
  );

  // tRPC mutations
  const deleteStudent = trpc.students.delete.useMutation({
    onSuccess: () => {
      toast.success("Student deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete student: ${error.message}`);
    },
  });

  const bulkUpdateStatus = trpc.students.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Students updated successfully");
      setSelectedStudents([]);
      setBulkActionDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update students: ${error.message}`);
    },
  });

  const bulkAssignCohort = trpc.cohorts.bulkAssignStudents.useMutation({
    onSuccess: () => {
      toast.success("Students assigned to cohort successfully");
      setSelectedStudents([]);
      setBulkActionDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to assign students: ${error.message}`);
    },
  });

  const handleSelectAll = () => {
    if (selectedStudents.length === studentsData?.items.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsData?.items.map((s) => s.id) || []);
    }
  };

  const handleSelectStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteStudent = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await deleteStudent.mutateAsync({ id });
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    await bulkUpdateStatus.mutateAsync({
      studentIds: selectedStudents,
      status: status as any,
    });
  };

  const handleBulkCohortAssign = async (cohortId: number) => {
    await bulkAssignCohort.mutateAsync({
      cohortId,
      studentIds: selectedStudents,
    });
  };

  const handleExportCSV = () => {
    if (!exportData) return;

    const headers = [
      "Student Number",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Status",
      "Cohort",
      "Cohort Code",
      "GPA",
      "Total Credits",
      "Enrollment Date",
      "Graduation Date",
    ];

    const rows = exportData.map((student) => [
      student.studentNumber,
      student.firstName,
      student.lastName,
      student.email,
      student.phone,
      student.status,
      student.cohort,
      student.cohortCode,
      student.gpa,
      student.totalCredits.toString(),
      student.enrollmentDate,
      student.graduationDate,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
    toast.success("Students exported successfully");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      case "graduated":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
            <Award className="mr-1 h-3 w-3" />
            Graduated
          </Badge>
        );
      case "withdrawn":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Withdrawn
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8 animate-fade-in-scale">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Students Management</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage student records, enrollments, and cohort assignments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-5 w-5" />
              Export
            </Button>
            <Button size="lg" className="gap-2">
              <UserPlus className="h-5 w-5" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{studentsData?.total || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {studentsData?.items.filter((s) => s.status === "active").length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Graduated</p>
                <p className="text-2xl font-bold">
                  {studentsData?.items.filter((s) => s.status === "graduated").length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-gray-500/10 p-3">
                <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">
                  {studentsData?.items.filter((s) => s.status === "inactive").length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, email, or student number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cohortFilter} onValueChange={setCohortFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Cohort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {cohorts?.items.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id.toString()}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedStudents.length} student{selectedStudents.length > 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setBulkActionDialogOpen(true)}>
                  Bulk Actions
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStudents([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Students Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStudents.length === studentsData?.items.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsData?.items.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      {student.studentNumber && (
                        <p className="text-xs text-muted-foreground">#{student.studentNumber}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.cohort ? (
                      <Badge variant="outline">{student.cohort.name}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>{student.gpa || "N/A"}</TableCell>
                  <TableCell>{student.totalCredits}</TableCell>
                  <TableCell className="text-sm">{formatDate(student.enrollmentDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Bulk Actions Dialog */}
        <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
              <DialogDescription>
                Apply actions to {selectedStudents.length} selected student
                {selectedStudents.length > 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("active")}
                  >
                    Set Active
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("inactive")}
                  >
                    Set Inactive
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("graduated")}
                  >
                    Set Graduated
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("suspended")}
                  >
                    Set Suspended
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign to Cohort</Label>
                <Select onValueChange={(value) => handleBulkCohortAssign(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts?.items.map((cohort) => (
                      <SelectItem key={cohort.id} value={cohort.id.toString()}>
                        {cohort.name} ({cohort.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Students</DialogTitle>
              <DialogDescription>
                Export {exportData?.length || 0} students to CSV format
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                The export will include all student information based on your current filters.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
