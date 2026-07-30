import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, Loader2, CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

interface Enrollment {
  id: number;
  enrollmentType: string;
  paymentStatus: string;
  enrolledAt: string;
  completedAt: string | null;
  item: {
    id: number;
    title: string;
    description: string;
    framework?: string;
    durationHours?: number;
    name?: string;
  };
}

export default function MyCoursesNew() {
  const [, setLocation] = useLocation();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      // TODO: Get actual user ID from auth
      const userId = 1;
      
      const response = await fetch(`/api/enrollment/my-courses/${userId}`);
      const data = await response.json();
      
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">
              Track your enrolled courses and progress
            </p>
          </div>
          <Button onClick={() => setLocation('/paid-courses')}>
            Browse More Courses
          </Button>
        </div>

        {/* Enrollments */}
        {enrollments.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Button onClick={() => setLocation('/paid-courses')}>
              Browse Courses
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const item = enrollment.item;
              const isBundle = enrollment.enrollmentType === 'bundle';
              const title = isBundle ? item.name : item.title;
              const isCompleted = !!enrollment.completedAt;
              
              return (
                <Card key={enrollment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={isBundle ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                        {isBundle ? 'Bundle' : (item.framework || 'Course')}
                      </Badge>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    {!isBundle && item.durationHours && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{item.durationHours} hours</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
                    </div>
                    
                    {enrollment.paymentStatus === 'free' && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        FREE with coupon
                      </Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => toast.info('Course content coming soon!')}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Course
                    </Button>
                    
                    {isCompleted && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info('Exam feature coming soon!')}
                      >
                        Retake Exam
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
