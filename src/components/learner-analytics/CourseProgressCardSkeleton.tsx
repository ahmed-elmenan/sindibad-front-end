import { Card, CardContent } from "@/components/ui/card";

export function CourseProgressCardSkeleton() {
  return (
    <Card className="border-orange-200">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Course Image */}
          <div className="w-32 h-32 rounded-lg flex-shrink-0 bg-gray-300 animate-pulse" />

          {/* Course Info */}
          <div className="flex-1 space-y-4">
            {/* Title and Badges */}
            <div className="flex items-start justify-between">
              <div className="h-6 w-64 bg-gray-300 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-gray-300 animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-gray-300 animate-pulse" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-gray-300 animate-pulse rounded" />
                <div className="h-4 w-12 bg-gray-300 animate-pulse rounded" />
              </div>
              <div className="h-2 w-full rounded-full bg-gray-300 animate-pulse" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border border-orange-200">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-16 bg-gray-300 animate-pulse rounded" />
                  <div className="h-6 w-12 bg-gray-300 animate-pulse rounded" />
                </div>
              ))}
            </div>

            {/* Expand Button */}
            <div className="h-10 w-full rounded-md bg-gray-300 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseProgressListSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, index) => (
        <CourseProgressCardSkeleton key={index} />
      ))}
    </div>
  );
}
