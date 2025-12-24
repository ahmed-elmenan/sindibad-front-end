"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

type QuizSkeletonProps = {
  dir?: "ltr" | "rtl"
}

/**
 * QuizSkeleton
 * Squelette visuel du quiz (en cours de chargement).
 * - Première carte (header) supprimée
 * - Conserve uniquement la carte de question
 * - Boutons en gris clair
 */
export default function QuizSkeleton({ dir = "ltr" }: QuizSkeletonProps) {
  const isRTL = dir === "rtl"

  return (
    <div
      className="min-h-screen p-6 bg-white-100"
      style={{
        direction: dir,
      }}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="mx-auto w-full space-y-8">
        {/* Question Card (seule carte conservée) */}
        <Card className="p-8 w-full bg-white-100 border-none shadow-none">
          <CardContent className="p-0">
            <div className="mb-8">
              <div className="mb-6 flex items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl">
                  <Skeleton className="h-16 w-16 rounded-xl bg-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <Skeleton className="h-6 w-28 rounded-full bg-gray-300" />
                    <Skeleton className="h-6 w-24 rounded-full bg-gray-300" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-11/12 bg-gray-300" />
                    <Skeleton className="h-6 w-10/12 bg-gray-300" />
                  </div>
                </div>
              </div>

              {/* Options (multiple-choice style placeholders) */}
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center rounded-xl border-2 border-gray-200 p-6" aria-hidden="true">
                    <Skeleton className={`h-6 w-6 rounded-full border-2 bg-gray-300 ${isRTL ? "ml-4" : "mr-4"}`} />
                    <Skeleton className="h-5 w-full max-w-[600px] bg-gray-300" />
                  </div>
                ))}
              </div>

              {/* Zone de texte (open question) placeholder */}
              <div className="mt-6 space-y-3">
                <Skeleton className="h-40 w-full rounded-xl bg-gray-300" />
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-4 w-24 bg-gray-300" />
                  <Skeleton className="h-4 w-20 bg-gray-300" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="lg"
            disabled
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 shadow-none"
          >
            <Skeleton className="h-5 w-24 bg-gray-300" />
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-full bg-gray-300" />
            ))}
          </div>

          <Button
            size="lg"
            disabled
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 shadow-none"
          >
            <Skeleton className="h-5 w-24 bg-gray-300" />
          </Button>
        </div>
      </div>
      <span className="sr-only">Chargement du quiz...</span>
    </div>
  )
}
