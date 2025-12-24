import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CourseCardSkeleton() {
  return (
    <Card className="bg-white border border-orange-100/50 shadow-sm h-full overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <CardHeader className="pb-2 md:pb-3 px-3 md:px-6 pt-3 md:pt-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 space-y-2">
            <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
          <div className="h-5 md:h-6 w-12 md:w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 md:px-6 pb-3 md:pb-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="space-y-1">
            <div className="h-6 md:h-8 w-20 md:w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 md:h-4 w-12 md:w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 md:h-6 w-16 md:w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 md:w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 md:w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-10 md:w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SearchFiltersSkeleton() {
  return (
    <section className="space-y-6">
      {/* Main Search Bar Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-orange-100/30 rounded-2xl blur-xl"></div>
        <Card className="relative bg-white/80 backdrop-blur-sm border border-orange-100/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-2xl">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Summary Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </section>
  )
}

export function CourseDetailsSkeleton() {
  return (
    <div className="min-h-screen gradient-bg">
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8 space-y-6 md:space-y-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Hero section skeleton */}
            <div className="space-y-4 px-2 md:px-0">
              <div className="aspect-[16/9] md:aspect-[2/1] bg-gray-200 rounded-lg md:rounded-xl animate-pulse max-h-60 md:max-h-80" />
              <div className="space-y-3">
                <div className="h-8 md:h-10 bg-gray-200 rounded animate-pulse w-2/3" /> {/* Title */}
                <div className="h-4 md:h-6 bg-gray-200 rounded animate-pulse w-1/2" /> {/* Subtitle */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" /> {/* Rating */}
                  <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" /> {/* Level */}
                  <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse" /> {/* Category */}
                </div>
              </div>
            </div>

            {/* Description skeleton */}
            <Card className="bg-white border border-orange-100/50 mx-2 md:mx-0">
              <CardHeader className="px-4 md:px-6">
                <div className="h-6 md:h-8 w-1/2 bg-gray-200 rounded animate-pulse" /> {/* Section Title */}
              </CardHeader>
              <CardContent className="px-4 md:px-6 space-y-2">
                <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>

            {/* Chapters skeleton */}
            <div className="space-y-4 mx-2 md:mx-0">
              <div className="h-6 md:h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-2" /> {/* Section Title */}
              {[1,2,3].map((i) => (
                <Card key={i} className="bg-white border border-orange-100/50">
                  <CardHeader className="px-4 py-2 flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="px-4 py-2 space-y-2">
                    {[1,2].map(j => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reviews skeleton */}
            <div className="mx-2 md:mx-0">
              <Card className="bg-white border border-orange-100/50">
                <CardHeader className="px-4 py-2">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" /> {/* Section Title */}
                </CardHeader>
                <CardContent className="px-4 py-2 space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /> {/* User name */}
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" /> {/* Date */}
                        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" /> {/* Comment */}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-1 px-2 md:px-0">
            <div className="space-y-6 lg:sticky lg:top-8">
              <Card className="bg-white border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="px-4 md:px-6">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto" /> {/* Price/Pack Title */}
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
                  <div className="h-10 md:h-12 bg-gray-200 rounded animate-pulse" /> {/* Price */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-6 md:h-8 w-6 md:w-8 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-3 md:h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="px-4 md:px-6">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto" /> {/* PackSelector Title */}
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
                  <div className="h-10 md:h-12 bg-gray-200 rounded animate-pulse" /> {/* PackSelector Content */}
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-6 md:h-8 w-6 md:w-8 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-3 md:h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}