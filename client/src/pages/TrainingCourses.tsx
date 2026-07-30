import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Book, Clock, Users, Star, Search, Filter, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { courses } from '@/data/courses';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function TrainingCourses() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [coursesWithProgress, setCoursesWithProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses with enrollment and progress data
  useEffect(() => {
    const fetchCoursesWithProgress = async () => {
      if (!user) {
        setCoursesWithProgress(courses.map(c => ({ ...c, isEnrolled: false, progress: 0 })));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/with-enrollment/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Merge API data with static course data
          const merged = courses.map(course => {
            const apiCourse = data.find((c: any) => c.id === course.id);
            return {
              ...course,
              isEnrolled: apiCourse?.isEnrolled || false,
              progress: apiCourse?.progress || 0,
            };
          });
          setCoursesWithProgress(merged);
        } else {
          setCoursesWithProgress(courses.map(c => ({ ...c, isEnrolled: false, progress: 0 })));
        }
      } catch (error) {
        console.error('Error fetching courses with progress:', error);
        setCoursesWithProgress(courses.map(c => ({ ...c, isEnrolled: false, progress: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesWithProgress();
  }, [user]);

  // Get unique categories and levels
  const categories = ['all', ...Array.from(new Set(coursesWithProgress.map(c => c.category)))];
  const levels = ['all', ...Array.from(new Set(coursesWithProgress.map(c => c.level)))];

  // Filter courses
  const filteredCourses = coursesWithProgress.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container py-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">Free Training Courses</h1>
              <p className="text-lg text-muted-foreground">
                Start your AI safety journey with our free training courses. Master fundamentals through comprehensive,
                hands-on content designed by industry experts. Perfect for getting started before advancing to paid certification programs.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(selectedLevel !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedLevel !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedLevel}
                    <button
                      onClick={() => setSelectedLevel('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-1 hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel('all');
                    setSelectedCategory('all');
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="container py-12">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="p-12 text-center">
              <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <Link key={course.id} href={`/training-courses/${course.id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    {/* Thumbnail */}
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category & Level */}
                      <div className="flex items-center gap-2 mb-3">
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

                      {/* Title */}
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Instructor */}
                      <p className="text-sm font-medium mb-4">{course.instructor}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolled.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </div>
                      </div>

                      {/* Modules Count */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          {course.modules.length} modules • {course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0)} lessons
                        </p>
                      </div>

                      {/* Progress Indicator */}
                      {course.isEnrolled && course.progress > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              Progress
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
