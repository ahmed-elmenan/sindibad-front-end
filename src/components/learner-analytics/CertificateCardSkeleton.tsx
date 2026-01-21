import { Card, CardContent } from "@/components/ui/card";

export function CertificateCardSkeleton() {
  return (
    <Card className="border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-300 animate-pulse" />

          {/* Info */}
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 bg-gray-300 animate-pulse rounded" />
            <div className="h-4 w-32 bg-gray-300 animate-pulse rounded" />
          </div>

          {/* Badge and Button */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 rounded-full bg-gray-300 animate-pulse" />
            <div className="h-9 w-28 rounded-md bg-gray-300 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CertificatesListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <CertificateCardSkeleton key={index} />
      ))}
    </div>
  );
}
