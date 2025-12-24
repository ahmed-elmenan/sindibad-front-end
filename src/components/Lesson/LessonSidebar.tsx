"use client";

import { useState, useEffect } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Chapter, Lesson } from "@/types";
import { useTranslation } from "react-i18next";
import { SidebarContent } from "./SidebarContent";
import type { QuizSummary } from "@/types/QuizSummary";

interface LessonSidebarProps {
  chapters: Chapter[];
  finalExam: QuizSummary | null;
  currentLessonId: string;
  setCurrentLesson: (lesson: Lesson | undefined) => void;
  courseId: string;
  isTesting: boolean;
  setIsTesting: (isTesting: boolean) => void;
  currentLesson: Lesson | undefined;
  setIsQuiz: React.Dispatch<React.SetStateAction<boolean>>;
  setFinalExam: React.Dispatch<React.SetStateAction<QuizSummary | null>>;
  isTestStarting: boolean;
}

export function LessonSidebar({
  chapters,
  finalExam,
  currentLessonId,
  setCurrentLesson,
  courseId,
  isTesting,
  setIsTesting,
  currentLesson,
  setIsQuiz,
  setFinalExam,
  isTestStarting,
}: LessonSidebarProps) {
  const { t } = useTranslation();

  // Trouver le chapitre contenant la leçon courante
  const currentChapterId =
    chapters.find((chapter) =>
      chapter.lessons?.some((lesson) => lesson.id === currentLessonId)
    )?.id ||
    (chapters[0]?.id ?? "");

  // Initialiser openChapters vide, puis ouvrir dynamiquement le chapitre courant
  const [openChapters, setOpenChapters] = useState<string[]>([]);

  // Ouvre le chapitre courant quand currentLessonId ou chapters changent
  useEffect(() => {
    if (currentLessonId && currentChapterId) {
      setOpenChapters([currentChapterId]);
    } else if (chapters[0]?.id) {
      setOpenChapters([chapters[0].id]);
    }
  }, [currentLessonId, currentChapterId, chapters]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Ajoute un état pour gérer la visibilité du sidebar desktop
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  // Ajoute un état pour gérer le hover du bouton flottant
  const [showSidebarTrigger, setShowSidebarTrigger] = useState(false);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => {
      const isCurrentlyOpen = prev.includes(chapterId);

      if (isCurrentlyOpen) {
        // Si elle est ouverte, la fermer (et garder les autres fermées)
        return [];
      } else {
        // Si elle est fermée, ouvrir seulement celle-ci (fermer toutes les autres)
        return [chapterId];
      }
    });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      {isDesktopOpen && (
        <div
          className="hidden lg:block w-110 border-l bg-card sticky rtl:border-l-0 rtl:border-r"
          style={{ top: 64, height: "calc(100vh - 64px)" }}
        >
          <SidebarContent
            chapters={chapters}
            finalExam={finalExam}
            setIsTesting={setIsTesting}
            currentLessonId={currentLessonId}
            courseId={courseId}
            openChapters={openChapters}
            toggleChapter={toggleChapter}
            setCurrentLesson={setCurrentLesson}
            setIsMobileOpen={setIsMobileOpen}
            setIsDesktopOpen={setIsDesktopOpen}
            setOpenChapters={setOpenChapters}
            setShowSidebarTrigger={setShowSidebarTrigger}
            isTesting={isTesting}
            currentLesson={currentLesson}
            setIsQuiz={setIsQuiz}
            setFinalExam={setFinalExam}
            isTestStarting={isTestStarting}
          />
        </div>
      )}

      {/* Trigger flottant pour rouvrir le sidebar */}
      {!isDesktopOpen && (
        <div
          className="hidden lg:flex items-center group fixed right-0 top-1/3 z-50"
          style={{ minHeight: 48 }}
          onMouseEnter={() => setShowSidebarTrigger(true)}
          onMouseLeave={() => setShowSidebarTrigger(false)}
        >
          <Button
            onClick={() => setIsDesktopOpen(true)}
            className={`
              flex items-center bg-primary text-primary-foreground rounded-l-md rounded-r-none shadow-lg
              transition-all duration-300 overflow-hidden
              ${showSidebarTrigger ? "w-48 px-4" : "w-12 px-0"}
              h-12
              group
            `}
            style={{ outline: "none", border: "none" }}
            aria-label={t("lessonSidebar.openMenu")}
          >
            <ArrowLeft className="w-6 h-6" />
            <span
              className={`
                ml-2 font-semibold text-base whitespace-nowrap
                transition-all duration-300
                ${
                  showSidebarTrigger
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 p-0 m-0 overflow-hidden"
                }
              `}
            >
              {t("lessonSidebar.openMenu")}
            </span>
          </Button>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-white w-full max-w-xs shadow-lg lg:hidden">
          <SidebarContent
            chapters={chapters}
            finalExam={finalExam}
            setIsTesting={setIsTesting}
            currentLessonId={currentLessonId}
            setCurrentLesson={setCurrentLesson}
            courseId={courseId}
            openChapters={openChapters}
            toggleChapter={toggleChapter}
            setIsMobileOpen={setIsMobileOpen}
            setIsDesktopOpen={setIsDesktopOpen}
            setOpenChapters={setOpenChapters}
            setShowSidebarTrigger={setShowSidebarTrigger}
            isTesting={isTesting}
            currentLesson={currentLesson}
            setIsQuiz={setIsQuiz}
            setFinalExam={setFinalExam}
            isTestStarting={isTestStarting}
          />
        </div>
      )}

      {/* Bouton flottant pour ouvrir le menu sur mobile */}
      {!isMobileOpen && (
        <Button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg lg:hidden flex items-center justify-center"
          aria-label="Ouvrir le menu du cours"
        >
          <Menu className="w-7 h-7" />
        </Button>
      )}
    </>
  );
}
