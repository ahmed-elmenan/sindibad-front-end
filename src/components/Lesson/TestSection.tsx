import { Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TFunction } from "i18next";
import type { Chapter, Lesson } from "@/types";

interface TestSectionProps {
  t: TFunction;
  setIsTesting: (isTesting: boolean) => void;
  currentLesson: Lesson | undefined;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

export function TestSection({
  t,
  setIsTesting,
  currentLesson,
  setChapters,
}: TestSectionProps) {
  return (
    <Card className="mb-6 mx-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-2">
              {t("lessonPage.readyToTest")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("lessonPage.testDescription")}
            </p>
            <div className="flex items-center gap-2 mt-2 text-warning-foreground">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold">
                {t("lessonPage.testWarning")}
              </span>
            </div>
          </div>
          <Button
            className="ml-0 md:ml-4 w-full md:w-auto"
            onClick={() => {
              if (currentLesson) {
                setChapters((prevChapters) =>
                  prevChapters.map((chapter) => {
                    if (!chapter.lessons) return chapter;
                    const updatedLessons = chapter.lessons.map((lesson) =>
                      lesson.id === currentLesson.id
                        ? { ...lesson, hasActiveQuiz: true }
                        : lesson
                    );
                    return { ...chapter, lessons: updatedLessons };
                  })
                );
              }
              setIsTesting(true);
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            {currentLesson?.hasActiveQuiz
              ? t("lessonPage.inProgress")
              : t("lessonPage.startTest")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
