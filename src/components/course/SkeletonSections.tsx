import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton pour la section Description
 */
export function DescriptionSkeleton() {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <Skeleton className="h-6 w-32 bg-gray-200" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2">
        <Skeleton className="h-4 w-full bg-gray-200" />
        <Skeleton className="h-4 w-full bg-gray-200" />
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la section Features
 */
export function FeaturesSkeleton() {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <Skeleton className="h-6 w-48 bg-gray-200" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <ul className="grid gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-200" />
              <Skeleton className="h-4 flex-1 bg-gray-200" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la section Contenu du Cours (Chapitres)
 */
export function ChaptersSkeleton() {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <Skeleton className="h-6 w-40 bg-gray-200" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-48 bg-gray-200" />
              <Skeleton className="h-4 w-16 bg-gray-200" />
            </div>
            <Skeleton className="h-3 w-32 bg-gray-200" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la section Packs de Réduction
 */
export function PacksSkeleton() {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <Skeleton className="h-6 w-40 bg-gray-200" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-3 sm:p-4">
              <Skeleton className="h-6 w-24 mb-2 bg-gray-200" />
              <Skeleton className="h-8 w-32 mb-1 bg-gray-200" />
              <Skeleton className="h-4 w-20 bg-gray-200" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la section Avis des Étudiants
 */
export function ReviewsSkeleton() {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <Skeleton className="h-6 w-40 bg-gray-200" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Skeleton className="h-6 w-32 bg-gray-200" />
          <Skeleton className="h-6 w-24 bg-gray-200" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-gray-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-24 bg-gray-200" />
                <Skeleton className="h-4 w-20 bg-gray-200" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-3/4 mt-1 bg-gray-200" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la sidebar (Stats du cours)
 */
export function CourseStatsSkeleton() {
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
        <Skeleton className="h-6 w-48 bg-gray-200" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pt-2 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full bg-gray-200" />
              <Skeleton className="h-4 flex-1 bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 bg-gray-200" />
            <Skeleton className="h-6 w-24 bg-gray-200" />
          </div>
        </div>
        <div className="pt-3 sm:pt-4 border-t border-gray-100">
          <Skeleton className="h-8 w-32 bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  );
}
