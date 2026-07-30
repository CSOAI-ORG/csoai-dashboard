import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id?: number;
  title: string;
  description: string;
  regionId: number;
  framework: string;
  level: 'fundamentals' | 'advanced' | 'specialist';
  durationHours: number;
  price: number;
  active: number;
}

export default function CourseManagement() {
  const [, params] = useRoute('/admin/cms/courses/:id');
  const [, setLocation] = useLocation();
  const isNew = params?.id === 'new';
  const courseId = isNew ? null : parseInt(params?.id || '0');

  const [course, setCourse] = useState<Course>({
    title: '',
    description: '',
    regionId: 1,
    framework: '',
    level: 'fundamentals',
    durationHours: 40,
    price: 0,
    active: 1
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/cms/courses/${courseId}`);
      const data = await response.json();
      setCourse(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!course.title || !course.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? '/api/admin/cms/courses' : `/api/admin/cms/courses/${courseId}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });

      if (response.ok) {
        toast.success(isNew ? 'Course created successfully' : 'Course updated successfully');
        setLocation('/admin/cms');
      } else {
        toast.error('Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cms/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Course deleted successfully');
        setLocation('/admin/cms');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/admin/cms')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isNew ? 'Create New Course' : 'Edit Course'}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? 'Add a new training course to the platform' : 'Update course details and settings'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Course'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Basic information about the training course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="e.g., EU AI Act Fundamentals"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Provide a detailed description of the course..."
                rows={4}
              />
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <Label htmlFor="framework">Framework</Label>
              <Input
                id="framework"
                value={course.framework}
                onChange={(e) => setCourse({ ...course, framework: e.target.value })}
                placeholder="e.g., EU AI Act, NIST AI RMF"
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={course.level}
                onValueChange={(value: any) => setCourse({ ...course, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundamentals">Fundamentals</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                value={course.durationHours}
                onChange={(e) => setCourse({ ...course, durationHours: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (cents) *</Label>
              <Input
                id="price"
                type="number"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <p className="text-sm text-muted-foreground">
                Enter 0 for free courses. Price is in cents (e.g., 9900 = $99.00)
              </p>
            </div>

            {/* Region ID */}
            <div className="space-y-2">
              <Label htmlFor="regionId">Region ID *</Label>
              <Input
                id="regionId"
                type="number"
                value={course.regionId}
                onChange={(e) => setCourse({ ...course, regionId: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <Select
                value={course.active.toString()}
                onValueChange={(value) => setCourse({ ...course, active: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
