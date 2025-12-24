import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LessonPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row mx-auto">
        <div className="w-full lg:flex-1">
          {/* Video Player Skeleton */}
          <div className="mb-6">
            <Card className="relative overflow-hidden bg-gray-100 max-h-[480px] rounded-none">
              <div className="w-full aspect-[16/7] max-h-[480px] bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
              
              {/* Video Controls Skeleton */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-600 rounded animate-pulse"></div>
                  <div className="flex-1 h-2 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-16 h-2 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs Skeleton */}
          <div className="relative mb-6 px-2 sm:px-8">
            <div className="flex flex-nowrap w-full border-b border-gray-200 bg-transparent p-0 h-auto relative gap-3.5">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Tab Content Skeleton - Presentation */}
            <Card className="mt-3">
              <CardHeader>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </CardHeader>
              <CardContent>
                {/* Lesson Info Skeleton */}
                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Skills Badges Skeleton */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-18 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* Description Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Section Skeleton */}
          <Card className="mb-6 mx-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}