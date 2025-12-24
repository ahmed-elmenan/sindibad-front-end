"use client"

import React, { useEffect } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Play, CheckCircle, Clock, Lock, Award } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Chapter, Lesson } from "@/types"
import { formatDuration } from "@/utils/dateUtils"
import type { QuizSummary } from "@/types/QuizSummary"
import { FinalExamCard } from "../quiz/FinalExamCard"
import { chapterVariants, lessonVariants } from "@/constants/LessonSideBarVariants"
import type { TFunction } from "i18next"

interface SidebarContentBodyProps {
  chapters: Chapter[]
  openChapters: string[]
  toggleChapter: (chapterId: string) => void
  isRTL: boolean
  t: TFunction
  completedLessons: string[]
  currentLessonId: string
  quizId?: string
  handleLessonClick: (lesson: Lesson) => void
  isTransitioning: boolean
  previousLessonId: string | null
  setIsTesting: (isTesting: boolean) => void
  setIsQuiz: (isQuiz: boolean) => void
  navigate: (path: string, options?: any) => void
  courseId: string
  getCompletedLessonsCount: (chapter: Chapter) => number
  getTotalChapterDuration: (chapter: Chapter) => number
  finalExam: QuizSummary | null
  handleFinalExamClick: () => void
  progressPercentage: number
}

export function SidebarContentBody({
  chapters,
  openChapters,
  toggleChapter,
  isRTL,
  t,
  completedLessons,
  currentLessonId,
  quizId,
  handleLessonClick,
  isTransitioning,
  previousLessonId,
  setIsTesting,
  setIsQuiz,
  navigate,
  courseId,
  getCompletedLessonsCount,
  getTotalChapterDuration,
  finalExam,
  handleFinalExamClick,
  progressPercentage,
}: SidebarContentBodyProps) {
  const [openMiniChapters, setOpenMiniChapters] = React.useState<string[]>([])

  const toggleMiniChapter = (miniChapterId: string) => {
    setOpenMiniChapters((prev) => {
      const isCurrentlyOpen = prev.includes(miniChapterId);
      
      if (isCurrentlyOpen) {
        // Si elle est ouverte, la fermer (et garder les autres fermées)
        return [];
      } else {
        // Si elle est fermée, ouvrir seulement celle-ci (fermer toutes les autres)
        return [miniChapterId];
      }
    });
  }

  // Automatically open chapter and miniChapter of current lesson or quiz
  useEffect(() => {
    if ((currentLessonId || quizId) && chapters.length > 0) {
      let targetChapter = null;

      // If we have a current lesson, find its chapter
      if (currentLessonId) {
        const currentLesson = chapters
          .flatMap(chapter => chapter.lessons || [])
          .find(lesson => lesson.id === currentLessonId);

        if (currentLesson) {
          targetChapter = chapters.find(ch =>
            ch.lessons?.some(lesson => lesson.id === currentLessonId)
          );
        }
      }

      // If we have a quizId, find the chapter that contains this quiz
      if (quizId && !targetChapter) {
        targetChapter = chapters.find(chapter => chapter.quiz?.id === quizId);
      }

      if (targetChapter) {
        // Open the chapter if not already open
        if (!openChapters.includes(targetChapter.id)) {
          toggleChapter(targetChapter.id);
        }

        // If we have a current lesson, also open its miniChapter
        if (currentLessonId) {
          const currentLesson = chapters
            .flatMap(chapter => chapter.lessons || [])
            .find(lesson => lesson.id === currentLessonId);

          if (currentLesson) {
            const miniChapter = currentLesson.miniChapter || "default";
            const miniChapterId = `${targetChapter.id}-${miniChapter}`;

            // Open the miniChapter if not already open
            setOpenMiniChapters(prev => {
              if (!prev.includes(miniChapterId)) {
                return [...prev, miniChapterId];
              }
              return prev;
            });
          }
        }
      }
    }
  }, [currentLessonId, quizId, chapters, openChapters, toggleChapter]);

  const groupLessonsByMiniChapter = (lessons: Lesson[]) => {
    const grouped = lessons.reduce(
      (acc, lesson) => {
        const miniChapter = lesson.miniChapter || "default"
        if (!acc[miniChapter]) {
          acc[miniChapter] = []
        }
        acc[miniChapter].push(lesson)
        return acc
      },
      {} as Record<string, Lesson[]>,
    )

    // Sort lessons within each miniChapter by order
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.order - b.order)
    })

    return grouped
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {chapters.map((chapter, chapterIndex) => {
            const allLessonsCompleted = chapter.lessons?.every((lesson) => completedLessons.includes(lesson.id)) ?? false;
            return (
            <motion.div
              key={chapter.id}
              className="border-b"
              variants={chapterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ delay: chapterIndex * 0.1 }}
            >
              <Collapsible open={openChapters.includes(chapter.id)} onOpenChange={() => toggleChapter(chapter.id)}>
                <CollapsibleTrigger asChild>
                  <motion.div
                    className={`cursor-pointer transition-colors p-4 border-b ${
                      allLessonsCompleted
                        ? "bg-green-50 border-l-4 border-green-500"
                        : "hover:bg-gray-50"
                    }${
                      isRTL ? " text-right" : ""
                    }`}
                    whileHover={{ backgroundColor: allLessonsCompleted ? "rgb(236, 253, 245)" : "rgb(249, 250, 251)" }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className={`flex items-center justify-between${isRTL ? " flex-row-reverse" : ""}`}>
                      {isRTL &&
                        (openChapters.includes(chapter.id) ? (
                          <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                            <ChevronUp className="w-4 h-4 ml-2" />
                          </motion.div>
                        ) : (
                          <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </motion.div>
                        ))}
                      <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium text-base ${
                            allLessonsCompleted ? "text-green-700" : ""
                          }`}>
                            {t("lessonSidebar.phase", { number: chapter.order })} : {chapter.title}
                          </h4>
                          {allLessonsCompleted && (
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{
                                duration: 0.5,
                                ease: "easeInOut",
                              }}
                            >
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                        <div
                          className={`flex items-center text-xs text-muted-foreground mt-1${
                            isRTL ? " flex-row-reverse gap-x-2 justify-end" : " space-x-2"
                          }`}
                        >
                          <span>
                            {t("lessonSidebar.completed", {
                              completed: getCompletedLessonsCount(chapter),
                              total: chapter.lessons?.length ?? 0,
                            })}
                          </span>
                          <span>•</span>
                          <span>{formatDuration(getTotalChapterDuration(chapter), t)}</span>
                        </div>
                      </div>
                      {!isRTL &&
                        (openChapters.includes(chapter.id) ? (
                          <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                            <ChevronUp className="w-4 h-4 ml-2" />
                          </motion.div>
                        ) : (
                          <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.3 }}>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <motion.div
                    className="bg-gray-50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <AnimatePresence>
                      {chapter.lessons &&
                        (() => {
                          const groupedLessons = groupLessonsByMiniChapter(chapter.lessons as Lesson[])

                          return Object.entries(groupedLessons).map(([miniChapterName, lessons], miniChapterIndex) => {
                            const miniChapterId = `${chapter.id}-${miniChapterName}`
                            const isMiniChapterOpen = openMiniChapters.includes(miniChapterId)

                            return (
                              <motion.div
                                key={miniChapterId}
                                className="border-b border-gray-200 last:border-b-0"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: miniChapterIndex * 0.1 }}
                              >
                                {(() => {
                                  const isDisabled = lessons.every((lesson) => lesson.isLocked);
                                  const isCompleted = lessons.every((lesson) => completedLessons.includes(lesson.id));
                                  return (
                                    <Collapsible
                                      open={isDisabled ? false : isMiniChapterOpen}
                                      onOpenChange={() => {
                                        if (!isDisabled) {
                                          toggleMiniChapter(miniChapterId);
                                        }
                                      }}
                                    >
                                      <CollapsibleTrigger asChild>
                                        <motion.div
                                          className={`transition-colors p-3 ${
                                            isCompleted
                                              ? "bg-green-50 border-l-4 border-green-500"
                                              : "bg-gray-50"
                                          }${
                                            isRTL ? " text-right" : ""
                                          } ${isDisabled ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer hover:bg-gray-100"}`}
                                          whileHover={isDisabled ? {} : { backgroundColor: isCompleted ? "rgb(236, 253, 245)" : "rgb(243, 244, 246)" }}
                                          whileTap={isDisabled ? {} : { scale: 0.995 }}
                                        >
                                          <div
                                            className={`flex items-center justify-between${
                                              isRTL ? " flex-row-reverse" : ""
                                            }`}
                                          >
                                            {isRTL &&
                                              (isMiniChapterOpen ? (
                                                <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.2 }}>
                                                  <ChevronUp className="w-3 h-3 ml-2" />
                                                </motion.div>
                                              ) : (
                                                <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.2 }}>
                                                  <ChevronDown className="w-3 h-3 ml-2" />
                                                </motion.div>
                                              ))}
                                            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                                              <div className="flex items-center gap-2">
                                                <h5 className={`font-semibold text-sm ${
                                                  isCompleted ? "text-green-700" : "text-gray-700"
                                                }`}>
                                                  {miniChapterName === "default"
                                                    ? t("lessonSidebar.lessons", "Lessons")
                                                    : miniChapterName}
                                                </h5>
                                                {isCompleted && (
                                                  <motion.div
                                                    animate={{ rotate: [0, 360] }}
                                                    transition={{
                                                      duration: 0.5,
                                                      ease: "easeInOut",
                                                    }}
                                                  >
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                  </motion.div>
                                                )}
                                              </div>
                                              <div
                                                className={`flex items-center text-xs text-muted-foreground mt-0.5${
                                                  isRTL ? " flex-row-reverse gap-x-1 justify-end" : " space-x-1"
                                                }`}
                                              >
                                                <span>
                                                  {lessons.length} {t("lessonSidebar.lessons", "lessons")}
                                                </span>
                                              </div>
                                            </div>
                                            {!isRTL &&
                                              (isMiniChapterOpen ? (
                                                <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.2 }}>
                                                  <ChevronUp className="w-3 h-3 ml-2" />
                                                </motion.div>
                                              ) : (
                                                <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.2 }}>
                                                  <ChevronDown className="w-3 h-3 ml-2" />
                                                </motion.div>
                                              ))}
                                          </div>
                                        </motion.div>
                                      </CollapsibleTrigger>

                                      <CollapsibleContent>
                                        <motion.div
                                          className="bg-white"
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.2, ease: "easeInOut" }}
                                        >
                                          <AnimatePresence>
                                            {lessons.map((lesson, lessonIndex) => {
                                              const isCompleted = completedLessons.includes(lesson.id)
                                              const isCurrent = lesson.id === currentLessonId && !quizId
                                              const isLocked =
                                                lesson.id === currentLessonId && !quizId ? false : lesson.isLocked
                                              const hasActiveQuiz = lesson.hasActiveQuiz
                                              const isPrevious = lesson.id === previousLessonId

                                              return (
                                                <motion.button
                                                  key={lesson.id + (isCurrent ? "-current" : "-notcurrent")}
                                                  variants={lessonVariants(isRTL) as any}
                                                  initial="initial"
                                                  animate="animate"
                                                  exit="exit"
                                                  whileHover={!isLocked ? "hover" : undefined}
                                                  whileTap={!isLocked ? "tap" : undefined}
                                                  transition={{
                                                    ...lessonVariants(isRTL).animate.transition,
                                                    delay: lessonIndex * 0.05,
                                                    type: "spring" as any,
                                                  }}
                                                  onClick={() => handleLessonClick(lesson as Lesson)}
                                                  disabled={isLocked && !isCurrent}
                                                  className={`w-full p-3 border-l-4 relative overflow-hidden
                                                  ${
                                                    isCurrent
                                                      ? "border-primary bg-primary/5 text-primary"
                                                      : "border-transparent text-black"
                                                  }
                                                  ${
                                                    isLocked && !isCurrent
                                                      ? "opacity-50 cursor-not-allowed bg-gray-100"
                                                      : "cursor-pointer"
                                                  }
                                                  ${isRTL ? " text-right" : " text-left"}
                                                  ${
                                                    hasActiveQuiz
                                                      ? "relative border-green-400 bg-gradient-to-r from-green-50 to-emerald-50"
                                                      : ""
                                                  }
                                                `}
                                                >
                                                  {/* ... existing lesson content animations and styling ... */}
                                                  {isCurrent && (
                                                    <motion.div
                                                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"
                                                      animate={{
                                                        opacity: [0.3, 0.6, 0.3],
                                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                                      }}
                                                      transition={{
                                                        duration: 3,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                        ease: "easeInOut",
                                                      }}
                                                    />
                                                  )}

                                                  {isTransitioning && isPrevious && (
                                                    <motion.div
                                                      className="absolute inset-0"
                                                      style={{
                                                        background: "linear-gradient(to right, rgba(0,0,0,0), rgba(255,255,255,0.8), rgba(0,0,0,0))",
                                                      }}
                                                      initial={{ x: "-100%" }}
                                                      animate={{ x: "100%" }}
                                                      transition={{
                                                        duration: 0.6,
                                                        ease: "easeInOut",
                                                      }}
                                                    />
                                                  )}

                                                  {hasActiveQuiz && !isCurrent && (
                                                    <motion.div
                                                      className="absolute inset-0 bg-gradient-to-r from-green-200/20 via-emerald-200/20 to-green-200/20"
                                                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                                                      transition={{
                                                        duration: 2,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                      }}
                                                    />
                                                  )}

                                                  <div
                                                    className={`flex items-start relative z-10${
                                                      isRTL ? " flex-row-reverse gap-x-3" : " space-x-3"
                                                    }`}
                                                  >
                                                    <motion.div
                                                      className="flex-shrink-0 mt-1"
                                                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                                      transition={{
                                                        duration: 2,
                                                        repeat: Number.POSITIVE_INFINITY,
                                                      }}
                                                    >
                                                      {isLocked && !isCurrent ? (
                                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                                      ) : isCompleted ? (
                                                        <motion.div
                                                          animate={{ rotate: [0, 360] }}
                                                          transition={{
                                                            duration: 0.5,
                                                            ease: "easeInOut",
                                                          }}
                                                        >
                                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                                        </motion.div>
                                                      ) : (
                                                        <Play className="w-4 h-4 text-muted-foreground" />
                                                      )}
                                                    </motion.div>

                                                    <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}>
                                                      <motion.h5
                                                        className={`text-sm truncate ${
                                                          isCurrent ? "text-primary" : hasActiveQuiz ? "text-green-800" : ""
                                                        }`}
                                                        animate={
                                                          isCurrent
                                                            ? {
                                                                color: [
                                                                  "rgb(59, 130, 246)",
                                                                  "rgb(147, 51, 234)",
                                                                  "rgb(59, 130, 246)",
                                                                ],
                                                              }
                                                            : {}
                                                        }
                                                        transition={{
                                                          duration: 3,
                                                          repeat: Number.POSITIVE_INFINITY,
                                                        }}
                                                      >
                                                        {lesson.order}. {lesson.title}
                                                      </motion.h5>

                                                      <div className="flex items-center space-x-2 mt-1">
                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                          {formatDuration(lesson.duration, t)}
                                                        </span>
                                                      </div>

                                                      {lesson.skills.length > 0 && (
                                                        <motion.div
                                                          className="flex flex-wrap gap-1 mt-2"
                                                          initial={{ opacity: 0, y: 10 }}
                                                          animate={{ opacity: 1, y: 0 }}
                                                          transition={{
                                                            delay: 0.2,
                                                            type: "spring",
                                                            stiffness: 100,
                                                            damping: 20,
                                                            mass: 1,
                                                          }}
                                                        >
                                                          {lesson.skills.slice(0, 2).map((skill, skillIndex) => (
                                                            <motion.div
                                                              key={skill}
                                                              initial={{ opacity: 0, scale: 0.8 }}
                                                              animate={{ opacity: 1, scale: 1 }}
                                                              transition={{
                                                                delay: skillIndex * 0.1,
                                                              }}
                                                            >
                                                              <Badge variant="secondary" className="text-xs">
                                                                {skill}
                                                              </Badge>
                                                            </motion.div>
                                                          ))}
                                                          {lesson.skills.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                              +{lesson.skills.length - 2}
                                                            </Badge>
                                                          )}
                                                        </motion.div>
                                                      )}

                                                      {hasActiveQuiz && (
                                                        <motion.div
                                                          className="flex items-center w-full gap-1 mt-2"
                                                          initial={{ opacity: 0, x: -20 }}
                                                          animate={{ opacity: 1, x: 0 }}
                                                          transition={{ delay: 0.3 }}
                                                        >
                                                          <Badge className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 shadow-sm">
                                                            <motion.div
                                                              className="relative"
                                                              animate={{ scale: [1, 1.2, 1] }}
                                                              transition={{
                                                                duration: 1.5,
                                                                repeat: Number.POSITIVE_INFINITY,
                                                              }}
                                                            >
                                                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>

                                                              <div className="absolute inset-0 w-1.5 h-1.5 bg-white rounded-full"></div>
                                                            </motion.div>
                                                            <span className="font-medium">
                                                              {t("quizInfos.inProgress", "En cours")}
                                                            </span>
                                                          </Badge>
                                                        </motion.div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </motion.button>
                                              )
                                            })}
                                          </AnimatePresence>
                                        </motion.div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  );
                                })()}
                              </motion.div>
                            )
                          })
                        })()}
                    </AnimatePresence>

                    {/* ... existing quiz section code ... */}
                    {chapter.quiz && (
                      <div className="relative">
                        <button
                          type="button"
                          className={`
                            w-full mt-2 mb-2 px-4 py-3 rounded-lg flex items-center gap-3
                            border-2 transition relative overflow-hidden
                            shadow-sm cursor-pointer
                            ${isRTL ? "flex-row-reverse text-right" : ""}
                            ${
                              chapter.quiz.isLocked
                                ? "opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 border-gray-300 text-gray-400"
                                : chapter.quiz.isCompleted
                                  ? "border-primary bg-gradient-to-r from-primary/10 to-primary/30 text-primary"
                                  : chapter.quiz.isActive
                                    ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
                                    : "border-yellow-400 bg-yellow-50 hover:bg-yellow-100"
                            }
                          `}
                          disabled={chapter.quiz.isLocked}
                          onClick={() => {
                            if (chapter.quiz && !chapter.quiz.isLocked) {
                              setIsTesting(false)
                              setIsQuiz(true)
                              navigate(`/courses/${courseId}/quiz/${chapter.quiz.id}?quizType=PHASE_QUIZ`, {
                                replace: true,
                              })
                            }
                          }}
                        >
                          {chapter.quiz.isActive && !chapter.quiz.isLocked && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 via-emerald-200/20 to-green-200/20"></div>
                          )}
                          {chapter.quiz.isCompleted && !chapter.quiz.isLocked && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"></div>
                          )}

                          <Award
                            className={`w-5 h-5 flex-shrink-0 relative z-10 ${
                              chapter.quiz.isCompleted
                                ? "text-primary"
                                : chapter.quiz.isActive
                                  ? "text-green-600"
                                  : "text-yellow-500"
                            }`}
                          />

                          <div className={`flex-1 min-w-0 relative z-10`}>
                            <div className={`flex items-center justify-between`}>
                              <div className={`flex flex-col items-start`}>
                                <div
                                  className={`font-semibold text-sm truncate ${
                                    chapter.quiz.isCompleted
                                      ? "text-primary"
                                      : chapter.quiz.isActive
                                        ? "text-green-800"
                                        : "text-yellow-800"
                                  }`}
                                >
                                  {chapter.quiz.title}
                                </div>
                                <div
                                  className={`flex items-center gap-2 mt-1 text-xs ${
                                    chapter.quiz.isCompleted
                                      ? "text-primary"
                                      : chapter.quiz.isActive
                                        ? "text-green-700"
                                        : "text-yellow-700"
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDuration(chapter.quiz.duration, t)}</span>
                                </div>
                              </div>

                              <div className={`flex flex-col gap-1 ${isRTL ? "ml-2" : "mr-2"}`}>
                                <Badge
                                  variant="outline"
                                  className={
                                    chapter.quiz.isCompleted
                                      ? "border-primary text-primary bg-primary/10"
                                      : chapter.quiz.isActive
                                        ? "border-green-400 text-green-700 bg-green-100"
                                        : "border-yellow-400 text-yellow-700 bg-yellow-100"
                                  }
                                >
                                  {t("lessonSidebar.chapterQuiz", { number: chapter.order })}
                                </Badge>

                                {chapter.quiz.isCompleted && (
                                  <Badge className="flex items-center w-full gap-1 bg-gradient-to-r from-primary to-primary/80 text-white text-xs px-2 py-0.5 shadow-sm">
                                    <CheckCircle className="w-3 h-3" />
                                    <span className="font-medium">{t("quizInfos.completed", "Completed")}</span>
                                  </Badge>
                                )}

                                {chapter.quiz.isActive && !chapter.quiz.isCompleted && (
                                  <Badge className="flex items-center w-full gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 shadow-sm">
                                    <div className="relative">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                      <div className="absolute inset-0 w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    <span className="font-medium">{t("quizInfos.inProgress", "En cours")}</span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
            );
          })}
        </AnimatePresence>

        {finalExam && (
          <FinalExamCard
            finalExam={finalExam!}
            t={t}
            isRTL={isRTL}
            handleFinalExamClick={handleFinalExamClick}
            progressPercentage={progressPercentage}
          />
        )}
      </div>
    </div>
  )
}
