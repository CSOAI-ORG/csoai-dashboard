import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export function ListSkeleton({ 
  items = 5, 
  showAvatar = true, 
  showActions = false 
}: ListSkeletonProps) {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
