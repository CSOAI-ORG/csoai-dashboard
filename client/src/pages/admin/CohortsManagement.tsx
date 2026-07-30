import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  X,
  Loader2,
  Calendar,
  UserPlus,
  Download,
  FileDown,
  BookOpen,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CohortFormData {
  name: string;
  description: string;
  code: string;
  status: "active" | "archived" | "draft";
  startDate: string;
  endDate: string;
  capacity: string;
}

export default function CohortsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewStudentsDialogOpen, setViewStudentsDialogOpen] = useState(false);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CohortFormData>({
    name: "",
    description: "",
    code: "",
    status: "active",
    startDate: "",
    endDate: "",
    capacity: "",
  });

  // tRPC queries
  const { data: cohortsData, isLoading, refetch } = trpc.cohorts.list.useQuery({
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    limit: 100,
    offset: 0,
  });

  const { data: stats } = trpc.cohorts.getStats.useQuery();

  const { data: cohortDetails } = trpc.cohorts.getById.useQuery(
    { id: selectedCohortId! },
    { enabled: !!selectedCohortId && (editDialogOpen || viewStudentsDialogOpen) }
  );

  const { data: cohortStudents } = trpc.cohorts.getStudents.useQuery(
    { cohortId: selectedCohortId!, limit: 100, offset: 0 },
    { enabled: !!selectedCohortId && viewStudentsDialogOpen }
  );

  // tRPC mutations
  const createCohort = trpc.cohorts.create.useMutation({
    onSuccess: () => {
      toast.success("Cohort created successfully");
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create cohort: ${error.message}`);
    },
  });

  const updateCohort = trpc.cohorts.update.useMutation({
    onSuccess: () => {
      toast.success("Cohort updated successfully");
      setEditDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update cohort: ${error.message}`);
    },
  });

  const deleteCohort = trpc.cohorts.delete.useMutation({
    onSuccess: () => {
      toast.success("Cohort deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete cohort: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      status: "active",
      startDate: "",
      endDate: "",
      capacity: "",
    });
    setSelectedCohortId(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    await createCohort.mutateAsync({
      name: formData.name,
      description: formData.description || undefined,
      code: formData.code,
      status: formData.status,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    });
  };

  const handleEdit = (cohort: any) => {
    setSelectedCohortId(cohort.id);
    setFormData({
      name: cohort.name,
      description: cohort.description || "",
      code: cohort.code,
      status: cohort.status,
      startDate: cohort.startDate ? cohort.startDate.split("T")[0] : "",
      endDate: cohort.endDate ? cohort.endDate.split("T")[0] : "",
      capacity: cohort.capacity?.toString() || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedCohortId || !formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    await updateCohort.mutateAsync({
      id: selectedCohortId,
      name: formData.name,
      description: formData.description || undefined,
      code: formData.code,
      status: formData.status,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this cohort? This action cannot be undone.")) {
      await deleteCohort.mutateAsync({ id });
    }
  };

  const handleViewStudents = (cohortId: number) => {
    setSelectedCohortId(cohortId);
    setViewStudentsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
            Active
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">
            Archived
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
            Draft
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
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
            <h1 className="text-4xl font-display font-bold tracking-tight">Cohort Management</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Organize students into cohorts for better course management
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Cohort
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cohorts</p>
                <p className="text-2xl font-bold">{stats?.totalCohorts || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Cohorts</p>
                <p className="text-2xl font-bold">{stats?.activeCohorts || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <UserPlus className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{stats?.activeStudents || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cohorts by name or code..."
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

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Cohorts Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohortsData?.items.map((cohort) => (
                <TableRow key={cohort.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cohort.name}</p>
                      {cohort.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {cohort.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cohort.code}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(cohort.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => handleViewStudents(cohort.id)}
                    >
                      {cohort.currentEnrollment}
                    </Button>
                  </TableCell>
                  <TableCell>{cohort.capacity || "Unlimited"}</TableCell>
                  <TableCell className="text-sm">{formatDate(cohort.startDate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(cohort.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewStudents(cohort.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          View Students
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(cohort)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(cohort.id)}
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

        {/* Create Cohort Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
              <DialogDescription>
                Add a new cohort to organize students and courses
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cohort Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Spring 2024 AI Course"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Cohort Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., 2024-SPRING-AI"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the cohort..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createCohort.isPending}>
                {createCohort.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Cohort
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Cohort Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Cohort</DialogTitle>
              <DialogDescription>
                Update cohort information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Cohort Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Cohort Code *</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateCohort.isPending}>
                {updateCohort.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Cohort
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Students Dialog */}
        <Dialog open={viewStudentsDialogOpen} onOpenChange={setViewStudentsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cohort Students</DialogTitle>
              <DialogDescription>
                {cohortDetails?.name} ({cohortDetails?.code}) - {cohortStudents?.total || 0} students
              </DialogDescription>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohortStudents?.items.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        {student.studentNumber && (
                          <p className="text-xs text-muted-foreground">#{student.studentNumber}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{student.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.gpa || "N/A"}</TableCell>
                    <TableCell>{student.totalCredits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
