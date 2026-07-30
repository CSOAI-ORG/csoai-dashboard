import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Plus,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

interface CourseStats {
  id: number;
  title: string;
  moduleCount: number;
  lessonCount: number;
  active: number;
}

export default function AdminCMS() {
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalQuizzes: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/cms/courses');
      const data = await response.json();
      setCourses(data);
      
      // Calculate stats
      const totalModules = data.reduce((sum: number, c: CourseStats) => sum + c.moduleCount, 0);
      const totalLessons = data.reduce((sum: number, c: CourseStats) => sum + c.lessonCount, 0);
      
      setStats({
        totalCourses: data.length,
        totalModules,
        totalLessons,
        totalQuizzes: 0 // Will be calculated separately if needed
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Content Management System</h1>
            <p className="text-muted-foreground">
              Manage courses, lessons, and assessments for the CSOAI training platform
            </p>
          </div>
          <Link href="/admin/cms/courses/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Course
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                Across all regions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalModules}</div>
              <p className="text-xs text-muted-foreground">
                Content modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground">
                Individual lessons
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Quiz questions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/cms/courses">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Manage Courses
                </CardTitle>
                <CardDescription>
                  Create, edit, and organize training courses
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/cms">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Manage Lessons
                </CardTitle>
                <CardDescription>
                  Open a course below to edit its lesson content and materials
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/exam-analytics">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Manage Assessments
                </CardTitle>
                <CardDescription>
                  Review exam questions, results and analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>
              Overview of all training courses in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <Link key={course.id} href={`/admin/cms/courses/${course.id}`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{course.title}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{course.moduleCount} modules</span>
                        <span>{course.lessonCount} lessons</span>
                        <span className={course.active ? 'text-green-600' : 'text-red-600'}>
                          {course.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
