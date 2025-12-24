import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Lesson } from "@/types/Lesson";
import type { TFunction } from "i18next";

interface ResourcesProps {
  lesson: Lesson;
  t: TFunction;
}

export function Resources({ lesson, t }: ResourcesProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">
            {t("lessonPage.additionalResources")}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t("lessonPage.additionalResourcesDescription")}
          </p>
          {lesson.referenceUrl ? (
            <Button
              variant="outline"
              onClick={() => {
                window.open(
                  lesson.referenceUrl,
                  "_blank"
                );
              }}
            >
              {t("lessonPage.seeResources")}
            </Button>
          ) : (
            <span className="text-muted-foreground">
              {t("lessonPage.noResources")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
