import { Clock, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "@/types/Lesson";
import type { TFunction } from "i18next";
import { formatDuration, formatDateWithCurrentLocale } from "@/utils";

interface PresentationProps {
  lesson: Lesson;
  isRTL: boolean;
  t: TFunction;
}

export function Presentation({ lesson, isRTL, t }: PresentationProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-3xl">
          {lesson.title}
        </h2>
      </CardHeader>
      <CardContent>
        {/* Section Lesson Info */}
        <div
          className={`flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4${
            isRTL
              ? " flex-row-reverse justify-end text-right"
              : ""
          }`}
          style={isRTL ? { direction: "rtl" } : {}}
        >
          <div
            className={`flex items-center ${
              isRTL ? "flex-row-reverse gap-x-1" : "space-x-1"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {formatDuration(lesson.duration, t)}
            </span>
          </div>
          {lesson.updatedAt && (
            <div
              className={`flex items-center ${
                isRTL ? "flex-row-reverse gap-x-1" : "space-x-1"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {t("lessonPage.updatedOn")}{" "}
                {formatDateWithCurrentLocale(
                  lesson.updatedAt,
                  t
                )}
              </span>
            </div>
          )}
          <div
            className={`flex items-center ${
              isRTL ? "flex-row-reverse gap-x-1" : "space-x-1"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {t("lessonPage.lesson")} {lesson.order}
            </span>
          </div>
        </div>
        {lesson.skills.length > 0 && (
          <div
            className={`flex flex-wrap gap-2 mb-4${
              isRTL ? " justify-end" : ""
            }`}
          >
            {lesson.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}
        <div className="prose max-w-none">
          <p>{lesson.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
