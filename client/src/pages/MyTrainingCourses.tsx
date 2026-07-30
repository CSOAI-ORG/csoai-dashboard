import { useState, useEffect } from 'react';
import { Book, Clock, Award, Play, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { courses } from '@/data/courses';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';

export default function MyTrainingCourses() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enrolled courses with progress
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/with-enrollment/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Filter only enrolled courses and merge with static data
          const enrolled = data
            .filter((c: any) => c.isEnrolled)
            .map((apiCourse: any) => {
              const staticCourse = courses.find(sc => sc.id === apiCourse.id);
              const totalLessons = staticCourse?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
              const progressPercent = apiCourse.progress || 0;
              const completedLessons = Math.round((progressPercent / 100) * totalLessons);
              
              return {
                ...staticCourse,
                ...apiCourse,
                totalLessons,
                completedLessons,
                progressPercent,
                lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              };
            });
          setEnrolledCourses(enrolled);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const inProgress = enrolledCourses.filter(c => c.progressPercent > 0 && c.progressPercent < 100);
  const completed = enrolledCourses.filter(c => c.progressPercent === 100);
  const notStarted = enrolledCourses.filter(c => c.progressPercent === 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container py-12">
            <h1 className="text-4xl font-bold mb-4">My Courses</h1>
            <p className="text-lg text-muted-foreground">
              Track your learning progress and continue where you left off
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Book className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Courses</span>
                </div>
                <p className="text-3xl font-bold">{enrolledCourses.length}</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">In Progress</span>
                </div>
                <p className="text-3xl font-bold">{inProgress.length}</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <p className="text-3xl font-bold">{completed.length}</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Certificates</span>
                </div>
                <p className="text-3xl font-bold">{completed.length}</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Course Lists */}
        <div className="container py-12 space-y-12">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inProgress.map(course => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid grid-cols-3">
                      {/* Thumbnail */}
                      <div className="col-span-1 aspect-square overflow-hidden bg-muted">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="col-span-2 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                          <Badge variant="outline" className="text-xs">{course.level}</Badge>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                          {course.title}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(course.progressPercent)}%
                            </span>
                          </div>
                          <Progress value={course.progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </p>
                        </div>

                        <Link href={`/training-courses/${course.id}/learn`}>
                          <Button className="w-full" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Completed Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {completed.map(course => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Thumbnail */}
                    <div className="aspect-video overflow-hidden bg-muted relative">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        {course.instructor}
                      </p>

                      <div className="flex gap-2">
                        <Link href={`/training-courses/${course.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Review
                          </Button>
                        </Link>
                        <Button size="sm" className="flex-1">
                          <Award className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Not Started */}
          {notStarted.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Not Started</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {notStarted.map(course => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Thumbnail */}
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        {course.instructor}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>

                      <Link href={`/training-courses/${course.id}/learn`}>
                        <Button className="w-full" size="sm">
                          Start Course
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {enrolledCourses.length === 0 && (
            <Card className="p-12 text-center">
              <Book className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Link href="/training-courses">
                <Button size="lg">
                  Browse Courses
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
