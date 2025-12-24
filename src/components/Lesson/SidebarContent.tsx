"use client";

import type { Chapter, Lesson } from "@/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import type { QuizSummary } from "@/types/QuizSummary";
import QuizWarningDialog from "../QuizWarningDialog";
import { SidebarContentHeader } from "./SidebarContentHeader";
import { SidebarContentBody } from "./SidebarContentBody";

interface SidebarContentProps {
  chapters: Chapter[];
  finalExam: QuizSummary | null;
  currentLessonId: string;
  setCurrentLesson: (lesson: Lesson | undefined) => void;
  courseId: string;
  openChapters: string[];
  toggleChapter: (chapterId: string) => void;
  setIsMobileOpen: (open: boolean) => void;
  setIsDesktopOpen: (open: boolean) => void;
  setOpenChapters: (chapters: string[]) => void;
  setShowSidebarTrigger: (show: boolean) => void;
  isTesting: boolean;
  setIsTesting: (isTesting: boolean) => void;
  currentLesson: Lesson | undefined;
  setIsQuiz: React.Dispatch<React.SetStateAction<boolean>>;
  setFinalExam: React.Dispatch<React.SetStateAction<QuizSummary | null>>;
  isTestStarting: boolean;
}

export function SidebarContent({
  chapters,
  finalExam,
  currentLessonId,
  courseId,
  openChapters,
  toggleChapter,
  setIsMobileOpen,
  setIsDesktopOpen,
  setOpenChapters,
  setShowSidebarTrigger,
  isTesting,
  setIsTesting,
  setIsQuiz,
  setCurrentLesson,
  isTestStarting,
}: SidebarContentProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir && i18n.dir() === "rtl";
  const [showQuizWarningDialog, setShowQuizWarningDialog] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousLessonId, setPreviousLessonId] = useState<string | null>(null);

  const { quizId } = useParams<{ quizId: string }>();

  if (quizId) {
    currentLessonId = "";
    setCurrentLesson(undefined);
  }

  const navigate = useNavigate();

  // Liste des IDs des leçons complétées
  const completedLessons = chapters
    .flatMap((chapter) => chapter.lessons ?? [])
    .filter((lesson) => lesson.isCompleted)
    .map((lesson) => lesson.id);

  const getTotalChapterDuration = (chapter: Chapter) => {
    return (chapter?.lessons ?? []).reduce(
      (total, lesson) => total + lesson.duration,
      0
    );
  };

  const getCompletedLessonsCount = (chapter: Chapter) => {
    return (chapter.lessons ?? []).filter((lesson) =>
      completedLessons.includes(lesson.id)
    ).length;
  };

  const handleLessonClick = async (lesson: Lesson) => {
    if (isTesting && lesson.id !== currentLessonId && isTestStarting) {
      setShowQuizWarningDialog(true);
      return;
    }

    setCurrentLesson(undefined);

    if (!lesson.isLocked || lesson.id === currentLessonId) {
      setPreviousLessonId(null);

      // Start transition animation
      setIsTransitioning(true);
      setPreviousLessonId(currentLessonId);

      // Add a small delay for smooth transition
      setIsMobileOpen(false);
      setIsTesting(false);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);

      navigate(`/courses/${courseId}/lessons/${lesson.id}`);
    }
  };

  // Calculate course progress
  const totalLessons = chapters.reduce(
    (total, chapter) => total + (chapter.lessons?.length ?? 0),
    0
  );
  const completedCount = completedLessons.length;
  const progressPercentage =
    totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const handleFinalExamClick = () => {
    setIsTesting(false);
    setIsQuiz(true);

    // Navigue vers la page du quiz
    navigate(`/courses/${courseId}/quiz/${finalExam?.id}?quizType=FINAL_QUIZ`, {
      replace: true,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <SidebarContentHeader
        t={t}
        isRTL={isRTL}
        chapters={chapters}
        totalLessons={totalLessons}
        setIsMobileOpen={setIsMobileOpen}
        setIsDesktopOpen={setIsDesktopOpen}
        setOpenChapters={setOpenChapters}
        setShowSidebarTrigger={setShowSidebarTrigger}
      />

      <div className="flex-1 overflow-y-auto">
        <SidebarContentBody
          chapters={chapters}
          openChapters={openChapters}
          toggleChapter={toggleChapter}
          isRTL={isRTL}
          t={t}
          completedLessons={completedLessons}
          currentLessonId={currentLessonId}
          quizId={quizId}
          handleLessonClick={handleLessonClick}
          isTransitioning={isTransitioning}
          previousLessonId={previousLessonId}
          setIsTesting={setIsTesting}
          setIsQuiz={setIsQuiz}
          navigate={navigate}
          courseId={courseId}
          getCompletedLessonsCount={getCompletedLessonsCount}
          getTotalChapterDuration={getTotalChapterDuration}
          finalExam={finalExam}
          handleFinalExamClick={handleFinalExamClick}
          progressPercentage={progressPercentage}
        />

        <QuizWarningDialog
          showQuizWarningDialog={showQuizWarningDialog}
          setShowQuizWarningDialog={setShowQuizWarningDialog}
        />
      </div>
    </div>
  );
}
