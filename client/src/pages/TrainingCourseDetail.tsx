import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { ArrowLeft, Play, FileText, HelpCircle, Clock, Users, Star, Award, CheckCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCourseById } from '@/data/courses';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

export default function TrainingCourseDetail() {
  const [, params] = useRoute('/training-courses/:id');
  const courseId = params?.id;
  const course = courseId ? getCourseById(courseId) : undefined;
  
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [previewLessons, setPreviewLessons] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Fetch preview lessons
  const fetchPreviewLessons = async () => {
    if (!courseId) return;
    setLoadingPreview(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/preview`);
      if (response.ok) {
        const data = await response.json();
        setPreviewLessons(data);
      }
    } catch (error) {
      console.error('Error fetching preview lessons:', error);
      toast.error('Failed to load preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    if (previewLessons.length === 0) {
      fetchPreviewLessons();
    }
  };

  if (!course) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist.
            </p>
            <Link href="/training-courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.completed).length,
    0
  );
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'reading':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const [, setLocation] = useLocation();

  const handleEnroll = () => {
    toast.success('Enrolled in course! Start learning now.');
    // Navigate to the first lesson
    const firstModule = course.modules[0];
    const firstLesson = firstModule?.lessons[0];
    if (firstLesson) {
      setLocation(`/training-courses/${course.id}/learn?lesson=${firstLesson.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <Link href="/training-courses">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Course Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge
                    variant={
                      course.level === 'Beginner'
                        ? 'default'
                        : course.level === 'Intermediate'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {course.level}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {course.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{course.enrolled.toLocaleString()} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating} rating</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="text-lg font-semibold">{course.instructor}</p>
                </div>
              </div>

              {/* Right: Enrollment Card */}
              <div>
                <Card className="p-6 sticky top-6">
                  {/* Thumbnail */}
                  <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-muted">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Progress */}
                  {progressPercent > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Your Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {completedLessons} of {totalLessons} lessons completed
                      </p>
                    </div>
                  )}

                  {/* Course Stats */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Modules</span>
                      <span className="font-medium">{course.modules.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  {progressPercent === 0 ? (
                    <>
                      <Button onClick={handleEnroll} className="w-full mb-3" size="lg">
                        Enroll Now
                      </Button>
                      <Button onClick={handlePreview} variant="outline" className="w-full" size="lg">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Course
                      </Button>
                    </>
                  ) : progressPercent === 100 ? (
                    <Button className="w-full" size="lg" variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                  ) : (
                    <Link href={`/training-courses/${course.id}/learn`}>
                      <Button className="w-full" size="lg">
                        Continue Learning
                      </Button>
                    </Link>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Objectives */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                <ul className="space-y-3">
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Course Content */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Course Content</h2>
                <div className="space-y-4">
                  {course.modules.map((module, moduleIndex) => {
                    const isExpanded = expandedModules.has(module.id);
                    const moduleLessons = module.lessons.length;
                    const moduleCompleted = module.lessons.filter(l => l.completed).length;

                    return (
                      <div key={module.id} className="border rounded-lg overflow-hidden">
                        {/* Module Header */}
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {moduleIndex + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {moduleLessons} lessons
                                {moduleCompleted > 0 && ` • ${moduleCompleted} completed`}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>

                        {/* Module Lessons */}
                        {isExpanded && (
                          <div className="border-t bg-muted/20">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <Link
                                key={lesson.id}
                                href={`/training-courses/${course.id}/learn?lesson=${lesson.id}`}
                              >
                                <div className="p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background text-xs">
                                        {lessonIndex + 1}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getLessonIcon(lesson.type)}
                                        <span className="font-medium">{lesson.title}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-muted-foreground">
                                        {lesson.duration}
                                      </span>
                                      {lesson.completed && (
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prerequisites */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Certificate */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Certificate of Completion</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn a certificate upon completing all lessons and passing the final assessment.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Course Preview</DialogTitle>
              <DialogDescription>
                Get a taste of what you'll learn in this course with these preview lessons
              </DialogDescription>
            </DialogHeader>
            
            {loadingPreview ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : previewLessons.length > 0 ? (
              <div className="space-y-4">
                {previewLessons.map((lesson, index) => (
                  <Card key={lesson.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {lesson.type === 'video' && <Play className="h-4 w-4 text-muted-foreground" />}
                          {lesson.type === 'reading' && <FileText className="h-4 w-4 text-muted-foreground" />}
                          {lesson.type === 'quiz' && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                          <h3 className="font-semibold">{lesson.title}</h3>
                          <Badge variant="secondary" className="text-xs">{lesson.type}</Badge>
                        </div>
                        {lesson.duration && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Duration: {lesson.duration}
                          </p>
                        )}
                        {lesson.content && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {lesson.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Want to see more? Enroll now to access all {totalLessons} lessons!
                  </p>
                  <Button onClick={() => { setShowPreview(false); handleEnroll(); }} className="w-full" size="lg">
                    Enroll Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No preview available for this course</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
