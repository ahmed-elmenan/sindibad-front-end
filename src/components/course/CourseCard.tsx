import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock } from "lucide-react";
import StarRating from "./StarRating";
import type { Course } from "@/types/Course";
import { useLocation, useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: Course;
}

const getLevelColor = (level: string) => {
  switch (level.toUpperCase()) {
    case "BEGINNER":
      return "bg-green-50 text-green-700 border border-green-200";
    case "INTERMEDIATE":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "ADVANCED":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
};

export default function CourseCard({ course }: CourseCardProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (location.pathname.startsWith("/organisation/courses")) {
      navigate(`/organisation/courses/${course.id}`);
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <div className="block h-full" onClick={handleClick} style={{ cursor: "pointer" }}>
      <Card className="bg-white border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full flex flex-col hover:border-orange-200/60 hover:scale-[1.02] active:scale-[0.98]">
        {/* Image */}
        <div className="aspect-video overflow-hidden relative bg-white flex items-center justify-center p-2">
          <img
            src={course.imgUrl || "/react.png"}
            alt={course.title}
            className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1">
          {/* Header */}
          <CardHeader className="pb-2 md:pb-3 px-3 md:px-6 pt-3 md:pt-6">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-sm md:text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 leading-tight">
                {course.title}
              </CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {course.description}
            </CardDescription>
          </CardHeader>

          {/* Footer */}
          <CardContent className="pt-0 px-3 md:px-6 pb-3 md:pb-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  {course.price === 0 ? `Gratuit` : `${course.price} MAD`}
                </span>
                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration} heures</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-orange-50/80 text-orange-700 border-orange-200/60 px-2 py-1 whitespace-nowrap"
              >
                {course.category}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <Badge
                className={`${getLevelColor(
                  course.level
                )} shrink-0 text-xs font-medium px-2 py-1`}
              >
                {course.level}
              </Badge>
              </div>
              <StarRating rating={course.avgRating} size="sm" />
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
