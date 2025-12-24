const SkeletonCourseDetailsPage = () => {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="h-8 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
              <div className="h-10 w-36 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Grid Layout Skeleton */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="md:col-span-2 space-y-8">
              {/* Image Skeleton */}
              <div className="aspect-video bg-gray-200 rounded-lg"></div>

              {/* Description Card Skeleton */}
              <div className="bg-white rounded-lg border shadow-sm p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>

              {/* Course Content Card Skeleton */}
              <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* Reviews Card Skeleton */}
              <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-40"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Course Stats Card Skeleton */}
              <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>

              {/* Quick Actions Card Skeleton */}
              <div className="bg-white rounded-lg border shadow-sm p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-36"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default SkeletonCourseDetailsPage;
