/**
 * Workflow Templates Library Page
 * Browse and clone pre-built workflow templates
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Users, 
  GraduationCap, 
  Award, 
  Bell, 
  Heart,
  Search,
  Copy,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const categoryIcons: Record<string, any> = {
  welcome: Users,
  course: GraduationCap,
  engagement: Heart,
  certification: Award,
  reminder: Bell,
  nurture: Mail,
};

const categoryColors: Record<string, string> = {
  welcome: "text-blue-500",
  course: "text-green-500",
  engagement: "text-pink-500",
  certification: "text-purple-500",
  reminder: "text-yellow-500",
  nurture: "text-orange-500",
};

export default function WorkflowTemplates() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch templates
  const { data: templates, isLoading } = trpc.workflowTemplates.getTemplates.useQuery();
  const { data: stats } = trpc.workflowTemplates.getTemplateStats.useQuery();

  // Clone template mutation
  const cloneTemplate = trpc.workflowTemplates.cloneTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Template cloned successfully! Redirecting to workflow builder...");
      setTimeout(() => {
        setLocation(`/admin/workflow-builder?id=${data.workflowId}`);
      }, 1500);
    },
    onError: (error) => {
      toast.error(`Failed to clone template: ${error.message}`);
    },
  });

  const handleCloneTemplate = (templateId: number, templateName: string) => {
    cloneTemplate.mutate({
      templateId,
      name: `${templateName} (Copy)`,
    });
  };

  const filteredTemplates = templates?.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Workflow Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Pre-built workflow templates for common email automation scenarios
          </p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Welcome Series</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCategory.welcome}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Course Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCategory.course}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="welcome">Welcome Series</SelectItem>
                <SelectItem value="course">Course Reminders</SelectItem>
                <SelectItem value="engagement">Re-engagement</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="nurture">Nurture Campaigns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
      ) : !filteredTemplates || filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = categoryIcons[template.category] || Mail;
            const colorClass = categoryColors[template.category] || "text-gray-500";

            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    {template.usageCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {template.usageCount} uses
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(template.tags) && (template.tags as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(template.tags as string[]).map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => handleCloneTemplate(template.id, template.name)}
                      disabled={cloneTemplate.isPending}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {cloneTemplate.isPending ? "Cloning..." : "Use This Template"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
