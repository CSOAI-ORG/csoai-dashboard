import { useState, useEffect } from 'react';
import { useRoute, useSearch, Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, CheckCircle, Play, FileText, HelpCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getCourseById, getAllLessons, type Lesson, type Quiz } from '@/data/courses';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function LessonViewer() {
  const [, params] = useRoute('/training-courses/:id/learn');
  const search = useSearch();
  const [, setLocation] = useLocation();
  const courseId = params?.id;
  const lessonId = new URLSearchParams(search).get('lesson');
  
  const course = courseId ? getCourseById(courseId) : undefined;
  const allLessons = courseId ? getAllLessons(courseId) : [];
  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
  const currentLesson = currentLessonIndex >= 0 ? allLessons[currentLessonIndex] : allLessons[0];
  
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Reset quiz state when lesson changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }, [currentLesson?.id]);

  if (!course || !currentLesson) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The lesson you're looking for doesn't exist.
            </p>
            <Link href="/training-courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const hasNext = currentLessonIndex < allLessons.length - 1;
  const hasPrevious = currentLessonIndex > 0;

  const goToLesson = (index: number) => {
    const lesson = allLessons[index];
    if (lesson) {
      setLocation(`/training-courses/${courseId}/learn?lesson=${lesson.id}`);
    }
  };

  const markComplete = () => {
    toast.success('Lesson marked as complete!');
    if (hasNext) {
      goToLesson(currentLessonIndex + 1);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentLesson.quiz) return;
    
    let correct = 0;
    currentLesson.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    setQuizScore(correct);
    setQuizSubmitted(true);
    
    const percentage = (correct / currentLesson.quiz.length) * 100;
    if (percentage >= 70) {
      toast.success(`Great job! You scored ${correct}/${currentLesson.quiz.length}`);
    } else {
      toast.error(`You scored ${correct}/${currentLesson.quiz.length}. Try again!`);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

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

  const completedCount = allLessons.filter(l => l.completed).length;
  const progressPercent = (completedCount / allLessons.length) * 100;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/training-courses/${courseId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </Link>
                <div>
                  <h2 className="font-semibold">{course.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Lesson {currentLessonIndex + 1} of {allLessons.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {Math.round(progressPercent)}% Complete
                </div>
                <Progress value={progressPercent} className="w-32 h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Lesson List */}
            <div className="lg:col-span-1">
              <Card className="p-4 sticky top-24">
                <h3 className="font-semibold mb-4">Course Content</h3>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {allLessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => goToLesson(index)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        lesson.id === currentLesson.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getLessonIcon(lesson.type)}
                        <span className="text-sm font-medium line-clamp-1">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-80">{lesson.duration}</span>
                        {lesson.completed && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card className="p-8">
                {/* Lesson Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{currentLesson.type}</Badge>
                    {currentLesson.completed && (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-muted-foreground">{currentLesson.duration}</p>
                </div>

                {/* Video Lesson */}
                {currentLesson.type === 'video' && currentLesson.videoUrl && (
                  <div className="space-y-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={currentLesson.videoUrl}
                        title={currentLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {currentLesson.content && (
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                {/* Reading Lesson */}
                {currentLesson.type === 'reading' && currentLesson.content && (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                  </div>
                )}

                {/* Quiz Lesson */}
                {currentLesson.type === 'quiz' && currentLesson.quiz && (
                  <div className="space-y-6">
                    {currentLesson.quiz.map((question, qIndex) => (
                      <Card key={qIndex} className="p-6">
                        <h3 className="font-semibold mb-4">
                          Question {qIndex + 1}: {question.question}
                        </h3>
                        <RadioGroup
                          value={quizAnswers[qIndex]?.toString()}
                          onValueChange={(value) => {
                            if (!quizSubmitted) {
                              setQuizAnswers({ ...quizAnswers, [qIndex]: parseInt(value) });
                            }
                          }}
                          disabled={quizSubmitted}
                        >
                          {question.options.map((option, oIndex) => {
                            const isSelected = quizAnswers[qIndex] === oIndex;
                            const isCorrect = question.correctAnswer === oIndex;
                            const showFeedback = quizSubmitted && isSelected;

                            return (
                              <div
                                key={oIndex}
                                className={`flex items-center space-x-2 p-3 rounded-lg border ${
                                  showFeedback
                                    ? isCorrect
                                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                      : 'border-red-500 bg-red-50 dark:bg-red-950'
                                    : 'border-border'
                                }`}
                              >
                                <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                <Label
                                  htmlFor={`q${qIndex}-o${oIndex}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  {option}
                                </Label>
                                {showFeedback && (
                                  isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-600" />
                                  )
                                )}
                              </div>
                            );
                          })}
                        </RadioGroup>

                        {quizSubmitted && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Explanation:</p>
                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                          </div>
                        )}
                      </Card>
                    ))}

                    {/* Quiz Actions */}
                    <div className="flex items-center justify-between pt-4">
                      {quizSubmitted ? (
                        <>
                          <div className="text-lg font-semibold">
                            Score: {quizScore} / {currentLesson.quiz.length} (
                            {Math.round((quizScore / currentLesson.quiz.length) * 100)}%)
                          </div>
                          <Button onClick={resetQuiz} variant="outline">
                            Try Again
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-muted-foreground">
                            {Object.keys(quizAnswers).length} of {currentLesson.quiz.length} answered
                          </div>
                          <Button
                            onClick={handleQuizSubmit}
                            disabled={Object.keys(quizAnswers).length !== currentLesson.quiz.length}
                          >
                            Submit Quiz
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => goToLesson(currentLessonIndex - 1)}
                    disabled={!hasPrevious}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <Button onClick={markComplete}>
                    {currentLesson.completed ? 'Next Lesson' : 'Mark Complete & Continue'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
