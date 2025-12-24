import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Bookmark, Trophy, GraduationCap } from "lucide-react";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export default function LearnerProfileSkeleton() {
  return (
    <div className="min-h-screen gradient-bg">
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="bg-white border border-orange-100/50 shadow-sm mb-8">
          <CardHeader className="flex flex-col items-center gap-4">
            {/* Profile Image Skeleton */}
            <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse border-4 border-orange-200 shadow-md" />

            {/* Name Skeleton */}
            <Skeleton className="h-8 w-64" />

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-6">
              {/* Ranking Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 shadow-sm border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-500" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gray-400" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {/* Contact Information */}
              <div className="space-y-3 p-4 bg-orange-50/30 rounded-lg">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3 p-4 bg-blue-50/30 rounded-lg">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-3 p-4 bg-purple-50/30 rounded-lg">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enrolled Courses Card */}
        <Card className="bg-white border border-orange-100/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-orange-500" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Course Items */}
              {[1, 2].map((index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="pl-6 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="pl-6">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
