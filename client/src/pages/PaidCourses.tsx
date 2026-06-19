import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, BookOpen, Award, Sparkles } from 'lucide-react';

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

export default function PaidCourses() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            <Sparkles className="w-4 h-4 mr-2" />
            First 10,000 Signups Get FREE Access
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Safety Certification Training
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Master global AI safety frameworks. Get certified as an AI Safety Analyst.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Bundle Offers Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bundle Offers</h2>
            <p className="text-gray-600">Save up to £1,494 with our course bundles</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="p-8 border-2 border-emerald-200 hover:border-emerald-400 transition-all hover:shadow-xl">
                <div className="text-center mb-6">
                  <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-300">
                    {bundle.id === 200001 ? 'BEST FOR BEGINNERS' : 'MOST COMPREHENSIVE'}
                  </Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                  <p className="text-gray-600 mb-4">{bundle.description}</p>
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl font-bold text-emerald-600">
                      {formatPrice(bundle.bundlePrice)}
                    </span>
                    <div className="text-left">
                      <div className="text-gray-400 line-through text-sm">
                        {formatPrice(bundle.regularPrice)}
                      </div>
                      <div className="text-emerald-600 font-semibold text-sm">
                        Save {formatPrice(bundle.savings)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>{bundle.courseIds.length} comprehensive courses</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>Official certification upon completion</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>Lifetime access to course materials</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>Flexible payment plans available</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleEnroll('bundle', bundle.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold"
                >
                  Enroll Now - {formatPrice(bundle.bundlePrice)}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Individual Courses Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Individual Regional Modules</h2>
            <p className="text-gray-600">Choose specific frameworks based on your region or industry</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <Badge className="mb-3 bg-blue-100 text-blue-700 border-blue-300">
                    {course.framework}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{course.durationHours} hours</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Self-paced learning</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Certificate included</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleEnroll('course', course.id)}
                    variant="outline"
                    className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    Enroll Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Free Training CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Not Ready to Commit?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Start with our free training modules to get a taste of our teaching style and content quality before purchasing.
          </p>
          <Button
            onClick={() => setLocation('/training')}
            variant="outline"
            size="lg"
            className="border-2 border-gray-400 text-gray-700 hover:bg-gray-200"
          >
            Start Free Training
          </Button>
        </div>
      </div>
    </div>
  );
}
