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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  X,
  Loader2,
  Eye,
  Code,
  Type,
  Save,
  Copy,
  FileText,
  Tag,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface MergeTag {
  tag: string;
  description: string;
  example: string;
  required?: boolean;
}

interface TemplateFormData {
  key: string;
  name: string;
  description: string;
  category: "onboarding" | "course" | "certification" | "notification" | "marketing" | "system";
  subject: string;
  htmlBody: string;
  textBody: string;
  previewText: string;
  availableMergeTags: MergeTag[];
}

const defaultMergeTags: MergeTag[] = [
  { tag: "firstName", description: "User's first name", example: "John", required: true },
  { tag: "lastName", description: "User's last name", example: "Doe", required: true },
  { tag: "email", description: "User's email address", example: "john@example.com", required: true },
  { tag: "courseName", description: "Course name", example: "AI Safety Fundamentals" },
  { tag: "cohortName", description: "Cohort name", example: "Spring 2024" },
  { tag: "certificateUrl", description: "Certificate download URL", example: "https://..." },
  { tag: "dashboardUrl", description: "Dashboard URL", example: "https://..." },
];

export default function EmailTemplateEditor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<TemplateFormData>({
    key: "",
    name: "",
    description: "",
    category: "notification",
    subject: "",
    htmlBody: "",
    textBody: "",
    previewText: "",
    availableMergeTags: defaultMergeTags,
  });

  // tRPC queries
  const { data: templatesData, isLoading, refetch } = trpc.emailTemplates.list.useQuery({
    search: searchQuery || undefined,
    category: categoryFilter === "all" ? undefined : (categoryFilter as any),
    limit: 100,
    offset: 0,
  });

  const { data: templateDetails } = trpc.emailTemplates.getById.useQuery(
    { id: selectedTemplateId! },
    { enabled: !!selectedTemplateId && (editDialogOpen || previewDialogOpen) }
  );

  // tRPC mutations
  const createTemplate = trpc.emailTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully");
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  const updateTemplate = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully");
      setEditDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  const deleteTemplate = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const previewTemplate = trpc.emailTemplates.preview.useMutation({
    onSuccess: (data) => {
      setPreviewData(data as any);
    },
    onError: (error) => {
      toast.error(`Failed to generate preview: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      category: "notification",
      subject: "",
      htmlBody: "",
      textBody: "",
      previewText: "",
      availableMergeTags: defaultMergeTags,
    });
    setSelectedTemplateId(null);
    setPreviewData({});
  };

  const handleCreate = async () => {
    if (!formData.key || !formData.name || !formData.subject || !formData.htmlBody) {
      toast.error("Key, name, subject, and HTML body are required");
      return;
    }

    await createTemplate.mutateAsync({
      key: formData.key,
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      subject: formData.subject,
      htmlBody: formData.htmlBody,
      textBody: formData.textBody || undefined,
      previewText: formData.previewText || undefined,
      availableMergeTags: formData.availableMergeTags,
    });
  };

  const handleEdit = (template: any) => {
    setSelectedTemplateId(template.id);
    setFormData({
      key: template.key,
      name: template.name,
      description: template.description || "",
      category: template.category,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || "",
      previewText: template.previewText || "",
      availableMergeTags: template.availableMergeTags || defaultMergeTags,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedTemplateId || !formData.name || !formData.subject || !formData.htmlBody) {
      toast.error("Name, subject, and HTML body are required");
      return;
    }

    await updateTemplate.mutateAsync({
      id: selectedTemplateId,
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      subject: formData.subject,
      htmlBody: formData.htmlBody,
      textBody: formData.textBody || undefined,
      previewText: formData.previewText || undefined,
      availableMergeTags: formData.availableMergeTags,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate.mutateAsync({ id });
    }
  };

  const handlePreview = async (templateId: number) => {
    setSelectedTemplateId(templateId);
    setPreviewDialogOpen(true);

    // Generate sample data for preview
    const sampleData: Record<string, string> = {};
    defaultMergeTags.forEach((tag) => {
      sampleData[tag.tag] = tag.example;
    });

    await previewTemplate.mutateAsync({
      id: templateId,
      sampleData,
    });
  };

  const insertMergeTag = (tag: string) => {
    const mergeTag = `{{${tag}}}`;
    setFormData({
      ...formData,
      htmlBody: formData.htmlBody + mergeTag,
    });
    toast.success(`Inserted merge tag: ${mergeTag}`);
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      onboarding: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      course: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      certification: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      notification: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      marketing: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
      system: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    };

    return (
      <Badge variant="outline" className={colors[category] || colors.system}>
        {category}
      </Badge>
    );
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
            <h1 className="text-4xl font-display font-bold tracking-tight">Email Templates</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Create and manage email templates with merge tags
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{templatesData?.total || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {templatesData?.items.filter((t) => t.isActive).length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">
                  {templatesData?.items.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-500/10 p-3">
                <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">6</p>
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
                placeholder="Search templates by name or key..."
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Templates Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templatesData?.items.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{template.key}</code>
                  </TableCell>
                  <TableCell>{getCategoryBadge(template.category)}</TableCell>
                  <TableCell>
                    {template.isActive ? (
                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{template.usageCount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">
                    {template.lastUsedAt ? formatDate(template.lastUsedAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(template.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePreview(template.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(template.key)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Key
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(template.id)}
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

        {/* Create/Edit Template Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onOpenChange={(open) => {
            if (createDialogOpen) setCreateDialogOpen(open);
            if (editDialogOpen) setEditDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {createDialogOpen ? "Create Email Template" : "Edit Email Template"}
              </DialogTitle>
              <DialogDescription>
                Design your email template with merge tags for personalization
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-6 py-4">
              {/* Left Column - Form Fields */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-key">Template Key *</Label>
                    <Input
                      id="template-key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="e.g., welcome_email"
                      disabled={editDialogOpen}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-subject">Email Subject *</Label>
                  <Input
                    id="template-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Welcome to {{courseName}}!"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-preview">Preview Text</Label>
                  <Input
                    id="template-preview"
                    value={formData.previewText}
                    onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                    placeholder="Text shown in email preview..."
                  />
                </div>

                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html">HTML Body</TabsTrigger>
                    <TabsTrigger value="text">Plain Text</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="space-y-2">
                    <Label htmlFor="template-html">HTML Body *</Label>
                    <Textarea
                      id="template-html"
                      value={formData.htmlBody}
                      onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                      placeholder="<h1>Hello {{firstName}}!</h1>..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </TabsContent>
                  <TabsContent value="text" className="space-y-2">
                    <Label htmlFor="template-text">Plain Text Body</Label>
                    <Textarea
                      id="template-text"
                      value={formData.textBody}
                      onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
                      placeholder="Hello {{firstName}}!..."
                      rows={12}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Merge Tags */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Available Merge Tags
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to insert into template
                  </p>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {formData.availableMergeTags.map((tag) => (
                    <Card
                      key={tag.tag}
                      className="p-3 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => insertMergeTag(tag.tag)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {`{{${tag.tag}}}`}
                          </code>
                          {tag.required && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{tag.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Example: {tag.example}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createDialogOpen ? handleCreate : handleUpdate}
                disabled={createTemplate.isPending || updateTemplate.isPending}
              >
                {(createTemplate.isPending || updateTemplate.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                {createDialogOpen ? "Create Template" : "Update Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
              <DialogDescription>
                Preview how the email will look with sample data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Subject:</Label>
                <p className="text-lg mt-1">{previewData.subject}</p>
              </div>
              <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
                <div dangerouslySetInnerHTML={{ __html: previewData.htmlBody || "" }} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
