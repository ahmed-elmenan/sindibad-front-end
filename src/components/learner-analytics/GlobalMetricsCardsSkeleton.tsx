import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function GlobalMetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="border-orange-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-gray-300 animate-pulse rounded" />
              <div className="h-5 w-5 rounded-full bg-gray-300 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-10 w-16 bg-gray-300 animate-pulse rounded" />
            <div className="h-2 w-full rounded-full bg-gray-300 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-4 w-32 bg-gray-300 animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
