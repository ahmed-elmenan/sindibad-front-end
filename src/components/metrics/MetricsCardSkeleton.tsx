import { Card } from "../ui/card"

export const MetricsCardSkeleton = () => {
  return (
    <Card className="relative overflow-hidden bg-card border border-border rounded-2xl max-h-[310px]">
      <div className="relative p-4 h-[13rem] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon skeleton */}
            <div className="p-2.5 rounded-xl bg-gray-200 animate-pulse">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
            {/* Title skeleton */}
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Status dot skeleton */}
          <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse"></div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="relative mb-6">
            {/* Value skeleton */}
            <div className="h-8 w-28 bg-gray-200 rounded animate-pulse mb-2"></div>
            {/* Underline skeleton */}
            <div className="w-10 h-0.5 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Chart area skeleton */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Change value skeleton */}
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>

            {/* Percentage badge skeleton */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100">
              <div className="h-2 w-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-2 w-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-gray-200 animate-pulse"></div>
    </Card>
  )
}
