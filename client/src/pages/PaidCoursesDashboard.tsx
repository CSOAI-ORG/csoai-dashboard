import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, BookOpen, Award, Sparkles, ShoppingCart, Package } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Course {
  id: number;
  title: string;
  description: string;
  framework: string;
  durationHours: number;
  price: number;
  regionId: number;
}

interface Bundle {
  id: number;
  name: string;
  description: string;
  bundlePrice: number;
  regularPrice: number;
  savings: number;
  courseIds: number[];
}

export default function PaidCoursesDashboard() {
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Paid Courses - CSOAI';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Load bundles
      const bundlesRes = await fetch('/api/course-bundles');
      const bundlesData = await bundlesRes.json();
      
      // Parse courseIds from JSON string
      const parsedBundles = bundlesData.map((b: any) => ({
        ...b,
        courseIds: typeof b.courseIds === 'string' ? JSON.parse(b.courseIds) : b.courseIds,
      }));
      
      setBundles(parsedBundles);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `£${(price / 100).toFixed(0)}`;
  };

  const handleEnroll = (type: 'course' | 'bundle', id: number) => {
    // Navigate to checkout with course/bundle ID
    setLocation(`/checkout?type=${type}&id=${id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container py-12">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-4 h-4 mr-2" />
                First 10,000 Signups Get FREE Access
              </Badge>
              <h1 className="text-4xl font-bold mb-4">
                AI Safety Certification Training
              </h1>
              <p className="text-lg text-muted-foreground">
                Master global AI safety frameworks. Get certified as an AI Safety Analyst.
              </p>
            </div>
          </div>
        </div>

        <div className="container py-12">
          {/* Bundle Offers Section */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Bundle Offers</h2>
                <p className="text-muted-foreground">Save up to £1,494 with our course bundles</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
              {bundles.map((bundle) => (
                <Card key={bundle.id} className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl">
                  <div className="text-center mb-6">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                      {bundle.id === 200001 ? 'BEST FOR BEGINNERS' : 'MOST COMPREHENSIVE'}
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                    <p className="text-muted-foreground mb-4">{bundle.description}</p>
                    
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(bundle.bundlePrice)}
                      </span>
                      <div className="text-left">
                        <div className="text-muted-foreground line-through text-sm">
                          {formatPrice(bundle.regularPrice)}
                        </div>
                        <div className="text-primary font-semibold text-sm">
                          Save {formatPrice(bundle.savings)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-foreground">
                      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span>{bundle.courseIds.length} comprehensive courses</span>
                    </div>
                    <div className="flex items-center text-foreground">
                      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span>Official certification upon completion</span>
                    </div>
                    <div className="flex items-center text-foreground">
                      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span>Lifetime access to course materials</span>
                    </div>
                    <div className="flex items-center text-foreground">
                      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span>Flexible payment plans available</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleEnroll('bundle', bundle.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Enroll Now - {formatPrice(bundle.bundlePrice)}
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Individual Courses Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Individual Regional Modules</h2>
                <p className="text-muted-foreground">Choose specific frameworks based on your region or industry</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <Badge className="mb-3 bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                      {course.framework}
                    </Badge>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">{course.description}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{course.durationHours} hours</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>Self-paced learning</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Certificate included</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleEnroll('course', course.id)}
                      variant="outline"
                      className="w-full border-2 border-primary text-primary hover:bg-primary/10"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Free Training CTA */}
          <div className="mt-16 text-center bg-muted/50 rounded-xl p-12 border">
            <h3 className="text-2xl font-bold mb-4">Not Ready to Commit?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start with our free training modules to get a taste of our teaching style and content quality before purchasing.
            </p>
            <Button
              onClick={() => setLocation('/training-courses')}
              variant="outline"
              size="lg"
              className="border-2"
            >
              Start Free Training
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
