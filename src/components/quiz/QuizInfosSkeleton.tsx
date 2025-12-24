import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const QuizInfoSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto pb-8 px-4 sm:px-6 lg:px-10">
      <div className="w-full mx-auto">
        <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl px-10">
          {/* Image header skeleton */}
          <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center overflow-hidden backdrop-blur-md bg-gradient-to-r from-gray-100 to-gray-200 h-[300px] animate-pulse">
            {/* Le petit rectangle a été supprimé */}
          </div>

          <CardContent className="pt-6 px-6 lg:px-8">
            {/* Header section skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div className="flex items-start gap-4">
                {/* Icon skeleton */}
                <div className="h-14 w-20 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"></div>

                <div className="flex-1 min-w-0">
                  {/* Title skeleton */}
                  <div className="mb-3">
                    <div className="h-8 bg-gray-300 rounded-lg w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>

                  {/* Badges skeleton */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Duration badge skeleton */}
                    <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>

                    {/* Status badge skeleton */}
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Type badge skeleton */}
              <div className="h-8 w-28 bg-gray-200 rounded-full animate-pulse self-start"></div>
            </div>

            {/* Description skeleton */}
            <div className="bg-gray-50/50 rounded-lg px-4 py-4 mb-5">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse"></div>
              </div>
            </div>

            {/* Warning section skeleton */}
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <div className="h-5 w-5 bg-gray-300 rounded animate-pulse flex-shrink-0 mt-0.5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>
            </div>

            <Separator className="mb-8 bg-gray-200" />

            {/* Action button skeleton */}
            <div className="flex justify-end rtl:justify-start">
              <div className="h-12 w-40 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default QuizInfoSkeleton
