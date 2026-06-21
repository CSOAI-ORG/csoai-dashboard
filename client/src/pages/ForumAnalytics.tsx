import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ForumAnalytics as ForumAnalyticsComponent } from '@/components/ForumAnalytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';

export default function ForumAnalytics() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);

  // Fetch available courses
  const { data: courses } = trpc.courses.getCatalog.useQuery({});

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Forum Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track community engagement, response times, and top contributors
            </p>
          </div>
        </div>

        {/* Course Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Course:</label>
            <Select
              value={selectedCourseId?.toString() || 'all'}
              onValueChange={(value) => 
                setSelectedCourseId(value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Analytics Component */}
        <ForumAnalyticsComponent courseId={selectedCourseId} />
      </div>
    </DashboardLayout>
  );
}
