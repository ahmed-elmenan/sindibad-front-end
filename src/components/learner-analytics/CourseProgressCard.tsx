import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, Clock, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import type { CourseProgress } from "@/types/learnerAnalytics";

interface CourseProgressCardProps {
  course: CourseProgress;
}

export function CourseProgressCard({ course }: CourseProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-emerald-600";
    if (score >= 600) return "text-teal-600";
    if (score >= 400) return "text-amber-600";
    return "text-red-600";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">🥇 1er</Badge>;
    if (rank === 2) return <Badge className="bg-slate-400 hover:bg-slate-500 text-white">🥈 2ème</Badge>;
    if (rank === 3) return <Badge className="bg-orange-600 hover:bg-orange-700 text-white">🥉 3ème</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Course Thumbnail */}
          <img
            src={course.courseThumbnail}
            alt={course.courseTitle}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border-2 border-orange-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop";
            }}
          />

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold line-clamp-2">{course.courseTitle}</h3>
            {course.courseDescription && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {course.courseDescription}
              </p>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2 mt-2">
              {course.completionPercentage === 100 ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complété
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Circle className="w-3 h-3 mr-1" />
                  En cours
                </Badge>
              )}
              {getRankBadge(course.learnerRank)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium">Progression</span>
            <span className="font-semibold">{course.completionPercentage}%</span>
          </div>
          <Progress
            value={course.completionPercentage}
            className="h-2 [&>div]:bg-orange-500"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {course.completedLessons}/{course.totalLessons} leçons complétées
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
          {/* Score */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(course.learnerScore)}`}>
              {course.learnerScore}
            </div>
            <p className="text-xs text-muted-foreground">Votre score</p>
          </div>

          {/* Average */}
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {course.averageScore}
            </div>
            <p className="text-xs text-muted-foreground">Moyenne</p>
          </div>

          {/* Rank */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              #{course.learnerRank}
            </div>
            <p className="text-xs text-muted-foreground">sur {course.totalLearners}</p>
          </div>

          {/* Performance Indicator */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              course.learnerScore > course.averageScore ? "text-emerald-600" : "text-rose-600"
            }`}>
              {course.learnerScore > course.averageScore ? "+" : ""}
              {(course.learnerScore - course.averageScore).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">vs moyenne</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Inscrit : {formatDate(course.enrolledDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Dernier accès : {formatDate(course.lastAccessDate)}</span>
          </div>
        </div>

        {/* Expand/Collapse Details */}
        {course.chapters && course.chapters.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Masquer les chapitres
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Voir les chapitres ({course.chapters.length})
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {course.chapters.map((chapter) => (
                  <div key={chapter.chapterId} className="p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        {chapter.chapterOrder}. {chapter.chapterTitle}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {chapter.completionPercentage}%
                      </Badge>
                    </div>
                    <Progress
                      value={chapter.completionPercentage}
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {chapter.lessons.filter((l) => l.isCompleted).length}/{chapter.lessons.length} leçons
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
