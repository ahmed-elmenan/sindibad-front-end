import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function LearnerRankingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-9 w-80 bg-gray-200" />
        <Skeleton className="h-5 w-96 bg-gray-200" />
      </div>

      {/* Filters Card Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48 bg-gray-200" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar Skeleton */}
            <div className="flex-1">
              <Skeleton className="h-10 w-full bg-gray-200" />
            </div>

            {/* Gender Filter Skeleton */}
            <div className="w-full md:w-[180px]">
              <Skeleton className="h-10 w-full bg-gray-200" />
            </div>

            {/* Formation Filter Skeleton */}
            <div className="flex-1 md:max-w-[250px]">
              <Skeleton className="h-10 w-full bg-gray-200" />
            </div>
          </div>

          {/* Results Summary Skeleton */}
          <div className="mt-4">
            <Skeleton className="h-4 w-64 bg-gray-200" />
          </div>
        </CardContent>
      </Card>

      {/* Table Card Skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-1/5 text-center">
                    <Skeleton className="h-4 w-12 mx-auto bg-gray-200" />
                  </TableHead>
                  <TableHead className="w-1/5 text-center">
                    <Skeleton className="h-4 w-16 mx-auto bg-gray-200" />
                  </TableHead>
                  <TableHead className="w-1/5 text-left">
                    <Skeleton className="h-4 w-24 bg-gray-200" />
                  </TableHead>
                  <TableHead className="w-1/5 text-left">
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                  </TableHead>
                  <TableHead className="w-1/5 text-center">
                    <Skeleton className="h-4 w-16 mx-auto bg-gray-200" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Generate 5 skeleton rows */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    {/* Rank Column */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Skeleton className="h-5 w-5 rounded-full bg-gray-200" />
                      </div>
                    </TableCell>

                    {/* Avatar Column */}
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-10 w-10 rounded-full bg-gray-200" />
                      </div>
                    </TableCell>

                    {/* Full Name Column */}
                    <TableCell>
                      <Skeleton className="h-4 w-32 bg-gray-200" />
                    </TableCell>

                    {/* Username Column */}
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-gray-200" />
                    </TableCell>

                    {/* Score Column */}
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Card Skeleton */}
      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
          {/* Rows per page skeleton */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-10 w-20 bg-gray-200" />
          </div>

          {/* Pagination skeleton */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-end">
            {/* Page info skeleton */}
            <Skeleton className="h-4 w-20 bg-gray-200" />

            {/* Pagination buttons skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-10 w-20 bg-gray-200" /> {/* Previous */}
              <Skeleton className="h-10 w-10 bg-gray-200" /> {/* Page 1 */}
              <Skeleton className="h-10 w-10 bg-gray-200" /> {/* Page 2 */}
              <Skeleton className="h-10 w-10 bg-gray-200" /> {/* Page 3 */}
              <Skeleton className="h-10 w-6 bg-gray-200" /> {/* Ellipsis */}
              <Skeleton className="h-10 w-20 bg-gray-200" /> {/* Next */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
