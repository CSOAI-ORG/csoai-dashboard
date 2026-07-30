import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  count?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function CardSkeleton({ 
  count = 1, 
  showHeader = true, 
  showFooter = false 
}: CardSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          {showHeader && (
            <CardHeader>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          )}
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
          {showFooter && (
            <div className="px-6 pb-6">
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </Card>
      ))}
    </>
  );
}
