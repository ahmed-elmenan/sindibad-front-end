import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const PartialLoadingSkeleton = ({ 
  showCourse = false, 
  showReviews = false, 
  showChapters = false, 
  showPacks = false 
}: {
  showCourse?: boolean
  showReviews?: boolean
  showChapters?: boolean
  showPacks?: boolean
}) => {
  return (
    <div className="space-y-6">
      {!showCourse && (
        <div className="space-y-4">
          <Skeleton className="h-60 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )}
      
      {!showReviews && (
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {!showChapters && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      )}
      
      {!showPacks && (
        <Card className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
