import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "@/services/course.service";
import CourseCard from "@/components/course/CourseCard";
import type { Course } from "@/types/Course";
import { usePageTitle } from "@/hooks/usePageTitle";

// Composant CourseCard personnalisé pour l'admin avec actions
const AdminCourseCard = ({ course }: { course: Course }) => {
  return (
    <Link to={`/admin/courses/${course.id}`}>
      <div className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
        <CourseCard course={course} />
      </div>
    </Link>
  );
};

export default function AdminCoursesPage() {
  usePageTitle("courses"); // Définit le titre de la page
  const [searchQuery, setSearchQuery] = useState("");
  const PAGE_LIMIT = 50; // Show more courses in admin view

  // Fetch courses with React Query
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const result = await getAllCourses(1, PAGE_LIMIT, {});
      return result.courses;
    },
  });

  // Filter courses based on search query
  const filteredCourses =
    coursesData?.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
            Gestion des Cours
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Gérez et organisez tous vos cours en un seul endroit
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            {coursesData?.length || 0} cours au total
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 md:gap-2 justify-between items-start md:items-center">
            <div className="w-full md:w-96 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 z-10 pointer-events-none" />
              <Input
                placeholder="Chercher des cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            {/* Add New Course Button */}
            <Link to="/admin/courses/new">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Ajouter un cours</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton avec le design des CourseCard
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse h-full flex flex-col">
              {/* Image skeleton */}
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              {/* Content skeleton */}
              <CardContent className="p-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun cours trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `Aucun cours ne correspond à "${searchQuery}"`
                  : "Commencez par créer votre premier cours"}
              </p>
              {!searchQuery && (
                <Link to="/admin/courses/new">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un cours
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          filteredCourses.map((course: Course) => (
            <AdminCourseCard key={course.id} course={course} />
          ))
        )}
      </div>

      {/* Stats footer */}
      {!isLoading && filteredCourses.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>
              Affichage de {filteredCourses.length} cours
              {searchQuery && ` pour "${searchQuery}"`}
            </p>
            <div className="flex items-center gap-4">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {filteredCourses.filter((c) => (c.price || 0) === 0).length}{" "}
                Gratuits
              </Badge>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200"
              >
                {filteredCourses.filter((c) => (c.price || 0) > 0).length}{" "}
                Payants
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
