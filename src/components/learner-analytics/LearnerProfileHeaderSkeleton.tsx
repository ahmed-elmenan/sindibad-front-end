import { Card, CardContent } from "@/components/ui/card";

export function LearnerProfileHeaderSkeleton() {
  return (
    <Card className="border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar Skeleton */}
          <div className="w-[150px] h-[150px] rounded-full flex-shrink-0 bg-gray-300 animate-pulse" />

          {/* Info Skeleton */}
          <div className="flex-1 space-y-4">
            {/* Name and Status */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 bg-gray-300 animate-pulse rounded" />
              <div className="h-6 w-20 rounded-full bg-gray-300 animate-pulse" />
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-300 animate-pulse rounded" />
                  <div className="h-5 w-full bg-gray-300 animate-pulse rounded" />
                </div>
              ))}
            </div>

            {/* Ranking */}
            <div className="flex items-center gap-4 mt-4">
              <div className="h-6 w-32 bg-gray-300 animate-pulse rounded" />
              <div className="h-8 w-16 bg-gray-300 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
