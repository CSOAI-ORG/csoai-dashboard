import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  BookOpen,
  Clock,
  Award,
  Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Quiz } from '@/components/Quiz';
import { getModuleQuiz } from '@/data/quizzes';
import type { QuizResult } from '@/types/quiz';
import { CourseDiscussion } from '@/components/CourseDiscussion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleProgressIndicator } from '@/components/ModuleProgressIndicator';
import { CourseProgressCard } from '@/components/CourseProgressCard';
import { CircularProgress } from '@/components/CircularProgress';
import { BadgeNotification, useBadgeNotification } from '@/components/BadgeNotification';
import { useAuth } from '@/contexts/AuthContext';

interface CourseModule {
  title: string;
  description?: string;
  content?: string;
  durationMinutes?: number;
}

export default function CoursePlayer() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const courseId = parseInt(params.id || '0');
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [lastTimeUpdate, setLastTimeUpdate] = useState(Date.now());
  
  // Badge notification hook
  const { badge: earnedBadge, isOpen: showBadgeModal, showBadge, closeBadge } = useBadgeNotification();
  const { user } = useAuth();
  
  // Fetch streak and badges for notification context
  const { data: streak } = trpc.streaksBadges.getMyStreak.useQuery();
  const { data: myBadges } = trpc.streaksBadges.getMyBadges.useQuery();

  // Fetch course details
  const { data: courseData, isLoading } = trpc.courses.getCourseDetails.useQuery({ courseId });
  
  // Cast modules to proper type
  const course = courseData ? {
    ...courseData,
    modules: (courseData.modules as CourseModule[] | null) || []
  } : null;
  
  // Fetch user's enrollment and progress
  const { data: enrollments } = trpc.courses.getMyEnrollments.useQuery();
  const enrollmentsList = Array.isArray(enrollments) ? enrollments : [];
  const enrollment = enrollmentsList.find((e: any) => e.courseId === courseId);

  // Mark module complete mutation
  const markCompleteMutation = trpc.courses.markCourseCompleted.useMutation({
    onSuccess: (data: any) => {
      toast.success('Module marked as complete!');
      setCompletedModules(prev => new Set([...Array.from(prev), currentModuleIndex]));
    },
    onError: (error: any) => {
      toast.error(`Failed to mark complete: ${error.message}`);
    }
  });

  // Generate certificate mutation
  const generateCertificateMutation = trpc.certificates.generate.useMutation({
    onSuccess: (data) => {
      if (data.success && data.pdfData) {
        // Convert base64 to blob and trigger download
        const byteCharacters = atob(data.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `COAI-Certificate-${course?.title?.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Certificate downloaded successfully!');
      } else {
        toast.info(data.message || 'Certificate already exists');
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate certificate: ${error.message}`);
    }
  });

  // Time tracking mutation
  const updateTimeSpentMutation = trpc.progress.updateTimeSpent.useMutation();
  const updateActivityMutation = trpc.streaksBadges.updateActivity.useMutation();

  // Handle certificate download
  const handleDownloadCertificate = () => {
    if (!courseId) return;
    generateCertificateMutation.mutate({ courseId });
  };

  // Track time spent - update every 5 minutes
  useEffect(() => {
    if (!courseId || !enrollment) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const minutesElapsed = Math.floor((now - lastTimeUpdate) / 60000);
      
      if (minutesElapsed >= 5) {
        updateTimeSpentMutation.mutate({
          courseId,
          minutesToAdd: minutesElapsed,
        });
        // Update activity for streak tracking
        updateActivityMutation.mutate({
          minutesSpent: minutesElapsed,
          courseId,
        }, {
          onSuccess: (data) => {
            // Check if a new badge was awarded
            if (data?.newBadge) {
              showBadge(data.newBadge);
            }
          }
        });
        setLastTimeUpdate(now);
      }
    }, 60000); // Check every minute

    // Update time on unmount
    return () => {
      clearInterval(interval);
      const now = Date.now();
      const minutesElapsed = Math.floor((now - lastTimeUpdate) / 60000);
      if (minutesElapsed > 0) {
        updateTimeSpentMutation.mutate({
          courseId,
          minutesToAdd: minutesElapsed,
        });
      }
    };
  }, [courseId, enrollment, lastTimeUpdate]);

  // Calculate progress from enrollment
  const progress = enrollment?.progress || 0;

  const currentModule = course?.modules?.[currentModuleIndex];
  const isLastModule = currentModuleIndex === (course?.modules?.length || 0) - 1;
  const isFirstModule = currentModuleIndex === 0;
  const isModuleComplete = completedModules.has(currentModuleIndex);

  // Handle quiz completion
  const handleQuizComplete = (result: QuizResult) => {
    if (result.passed) {
      setQuizPassed(true);
      toast.success(`Quiz passed with ${result.percentage}%!`);
    } else {
      toast.error(`Quiz failed. You need 70% to pass.`);
    }
  };

  // Handle module completion (after quiz)
  const handleMarkComplete = () => {
    if (!course || !enrollment) return;
    
    markCompleteMutation.mutate({
      enrollmentId: enrollment.id
    });
    
    // Reset quiz state for next module
    setShowQuiz(false);
    setQuizPassed(false);
  };

  // Show quiz button handler
  const handleShowQuiz = () => {
    setShowQuiz(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Navigation
  const goToNextModule = () => {
    if (!isLastModule) {
      setCurrentModuleIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousModule = () => {
    if (!isFirstModule) {
      setCurrentModuleIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Check if user is enrolled
  if (!enrollment && !isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="p-8 text-center max-w-2xl mx-auto">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Enrollment Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to enroll in this course to access the learning content.
          </p>
          <Link href={`/courses`}>
            <Button>Browse Courses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading || !course) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/my-courses">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to My Courses
                </Button>
              </Link>
            </div>
            <Badge variant="secondary">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{course.durationHours} hours</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{course.modules?.length || 0} modules</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Certificate included</span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Course Progress</span>
                <span className="text-muted-foreground">
                  {Math.round((progress / 100) * (course.modules?.length || 0))} of {course.modules?.length || 0} modules completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="flex items-center gap-4">
              <CircularProgress progress={progress} size={80} strokeWidth={6} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {Math.floor((enrollment?.timeSpentMinutes || 0) / 60)}h {(enrollment?.timeSpentMinutes || 0) % 60}m spent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Module Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              {/* Module Progress Indicator */}
              <ModuleProgressIndicator
                modules={course.modules?.map((module: any, index: number) => ({
                  id: index,
                  title: module.title,
                  completed: completedModules.has(index),
                  estimatedMinutes: module.durationMinutes || 30
                })) || []}
                currentModuleId={currentModuleIndex}
                className="mb-6"
              />
              <Separator className="my-4" />
              <h3 className="font-semibold mb-4">Quick Navigation</h3>
              <div className="space-y-2">
                {course.modules?.map((module: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentModuleIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentModuleIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {completedModules.has(index) ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          Module {index + 1}
                        </div>
                        <div className="text-xs opacity-90 truncate">
                          {module.title}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {module.durationMinutes} min
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Certificate Download */}
              {progress === 100 && (
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => toast.info('Certificate generation coming soon!')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              {/* Module Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Module {currentModuleIndex + 1} of {course.modules?.length || 0}</span>
                  <span>•</span>
                  <span>{currentModule?.durationMinutes} minutes</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{currentModule?.title}</h2>
                {currentModule?.description && (
                  <p className="text-muted-foreground">{currentModule.description}</p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Tabs for Content and Discussion */}
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Module Content</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-6">
                  {/* Module Content */}
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {currentModule?.content || 'No content available for this module.'}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
                
                <TabsContent value="discussion" className="mt-6">
                  <CourseDiscussion courseId={courseId} lessonId={currentModuleIndex} />
                </TabsContent>
              </Tabs>

              <Separator className="my-8" />

              {/* Module Quiz */}
              {!isModuleComplete && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Module Assessment</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete the quiz below to test your understanding. You need 70% to pass.
                  </p>
                  
                  {!showQuiz ? (
                    <Button onClick={handleShowQuiz} size="lg">
                      Start Quiz
                    </Button>
                  ) : getModuleQuiz(courseId, currentModuleIndex) ? (
                    <Quiz 
                      questions={getModuleQuiz(courseId, currentModuleIndex)!} 
                      onComplete={handleQuizComplete}
                    />
                  ) : (
                    <div className="text-muted-foreground">Quiz not available for this module yet.</div>
                  )}
                </div>
              )}

              <Separator className="my-8" />

              {/* Module Actions */}
              <div className="flex items-center justify-between">
                <Button
                  data-testid="course-previous-button"
                  variant="outline"
                  onClick={goToPreviousModule}
                  disabled={isFirstModule}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Module
                </Button>

                <div className="flex items-center gap-3">
                  {!isModuleComplete && quizPassed && (
                    <Button
                      data-testid="course-mark-complete-button"
                      variant="default"
                      onClick={handleMarkComplete}
                      disabled={markCompleteMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                  
                  {!isModuleComplete && !quizPassed && showQuiz && (
                    <div className="text-sm text-muted-foreground">
                      Pass the quiz to mark this module as complete
                    </div>
                  )}
                  
                  {isModuleComplete && !isLastModule && (
                    <Button data-testid="course-next-button" onClick={goToNextModule}>
                      Next Module
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  {isModuleComplete && isLastModule && progress === 100 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-6 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-3">
                          <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <h3 className="font-bold text-lg">Congratulations!</h3>
                            <p className="text-sm text-muted-foreground">You've completed this course</p>
                          </div>
                        </div>
                        <Button 
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                          data-testid="course-download-certificate-button"
                          onClick={handleDownloadCertificate}
                          disabled={generateCertificateMutation.isPending}
                        >
                          <Download className="w-5 h-5 mr-2" />
                          {generateCertificateMutation.isPending ? 'Generating...' : 'Download Certificate'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Share your achievement with employers and peers
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Badge Notification Modal */}
      <BadgeNotification
        badge={earnedBadge}
        isOpen={showBadgeModal}
        onClose={closeBadge}
        userName={user?.name || 'Learner'}
        streakCount={streak?.currentStreak || 0}
        totalBadges={(myBadges?.length || 0) + 1}
      />
    </div>
  );
}
