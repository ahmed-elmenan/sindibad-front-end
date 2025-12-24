"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/Lesson/VideoPlayer";
import { LessonSidebar } from "@/components/Lesson/LessonSidebar";
import { CommentsSection } from "@/components/Lesson/CommentsSection";
import { Presentation } from "@/components/Lesson/Presentation";
import { Resources } from "@/components/Lesson/Resources";
import { TestSection } from "@/components/Lesson/TestSection";
import NoAccessMessage from "@/components/ui/NoAccessMessage";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";
import { useChapters } from "@/hooks/useChapters";
import { useComments } from "@/hooks/useComments";
import VideoQuiz from "./quiz/QuizPage";
// Import dynamique ou placeholder pour QuizInfosPage
// Remplacez ce chemin par le bon si besoin
import QuizInfosPage from "./quiz/QuizInfosPage";
import LessonPageSkeleton from "@/components/Lesson/LessonPageSkeleton";
import WaitingAdminMessage from "@/components/Lesson/WaitingAdminMessage";

export default function LessonPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const isRTL = i18n.dir && i18n.dir() === "rtl";

  const [isQuiz, setIsQuiz] = useState(false);
  const quizType = searchParams.get("quizType");

  // Met à jour isQuiz selon la présence du paramètre quizType dans l'URL
  useEffect(() => {
    setIsQuiz(!!quizType);
  }, [quizType]);

  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();

  // Utilisation du hook de chapitres
  const {
    chapters,
    finalExam,
    setChapters,
    isLoadingChapters,
    currentLesson,
    setCurrentLesson,
    lessonLoading,
    lessonError,
    setCompletedLessons,
    setFinalExam,
    learnerProgressStatus,
    setLearnerProgressStatus,
  } = useChapters({ courseId, lessonId });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("presentation");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isTesting, setIsTesting] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isTestStarting, setIsTestStarting] = useState(false);

  // Met à jour la position de l'indicateur quand l'onglet change
  useEffect(() => {
    if (!tabsRef.current) return;
    const active = tabsRef.current.querySelector('[data-state="active"]');
    if (active) {
      const rect = (active as HTMLElement).getBoundingClientRect();
      const parentRect = tabsRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [activeTab]);

  const handleVideoProgress = (progressPercent: number) => {
    setProgress(progressPercent);
  };

  // Utilisation du hook pour la gestion des commentaires
  const { handleAddComment, handleAddReply } = useComments({
    lessonId: currentLesson?.id,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row mx-auto">
        <div className="w-full lg:flex-1">
          {/* Si isQuiz est true, afficher QuizInfosPage */}
          {(learnerProgressStatus === "WAITING_ADMIN" &&
          currentLesson?.order === 1 ) || ( quizType === "FINAL_QUIZ" && learnerProgressStatus === "WAITING_ADMIN") ? (
            <WaitingAdminMessage />
          ) : isQuiz &&
            !isTesting &&
            (quizType === "PHASE_QUIZ" || quizType === "FINAL_QUIZ") ? (
            <QuizInfosPage
              setIsTesting={setIsTesting}
              setChapters={setChapters}
              chapters={chapters}
              finalExam={finalExam}
            />
          ) : !currentLesson && !isQuiz ? (
            isLoadingChapters || lessonLoading ? (
              <LessonPageSkeleton />
            ) : lessonId &&
              chapters.length > 0 &&
              !chapters.some(
                (ch) =>
                  Array.isArray(ch.lessons) &&
                  ch.lessons.some((lesson) => lesson.id === lessonId)
              ) ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <span className="text-lg font-semibold mb-2 text-destructive">
                  {t("lessonPage.noVideoFoundTitle")}
                </span>
                <span className="text-muted-foreground">
                  {t("lessonPage.noVideoFoundDescription")}
                </span>
              </div>
            ) : lessonError && chapters.length > 0 ? (
              <NoAccessMessage
                message={lessonError}
                redirectPath={`/courses/${courseId}`}
                redirectLabel={t("lessonPage.backToCourse", "Retour au cours")}
              />
            ) : null
          ) : (
            <>
              {isTesting ? (
                /* Quand isTesting est true, afficher uniquement le quiz */
                <div className="flex items-center justify-center">
                  <VideoQuiz
                    courseId={courseId || ""}
                    setChapters={setChapters}
                    chapters={chapters}
                    setCurrentLesson={setCurrentLesson}
                    currentLesson={currentLesson}
                    setIsTesting={setIsTesting}
                    setCompletedLessons={setCompletedLessons}
                    setIsQuiz={setIsQuiz}
                    setFinalExam={setFinalExam}
                    finalExam={finalExam}
                    isContinuing={isContinuing}
                    setIsContinuing={setIsContinuing}
                    setLearnerProgressStatus={setLearnerProgressStatus}
                    LearnerProgressStatus={learnerProgressStatus}
                    setIsTestStarting={setIsTestStarting}
                  />
                </div>
              ) : (
                /* Quand isTesting est false, afficher la vidéo, les onglets et la navigation */
                <>
                  <div className="mb-6">
                    <Suspense
                      fallback={
                        <Card className="aspect-video flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </Card>
                      }
                    >
                      <VideoPlayer
                        videoUrl={currentLesson?.videoUrl || null}
                        title={currentLesson?.title}
                        onProgress={handleVideoProgress}
                        lessonLoading={lessonLoading}
                      />
                    </Suspense>
                  </div>

                  {/* Onglets */}
                  <div className="relative mb-6 px-2 sm:px-8">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className={`w-full${isRTL ? " rtl-tabs" : ""}`}
                    >
                      <TabsList
                        ref={tabsRef}
                        className={`tabs-list flex flex-nowrap w-full border-b border-gray-200 bg-transparent p-0 h-auto relative gap-3.5 overflow-x-auto scrollbar-thin scrollbar-thumb-muted${
                          isRTL ? " justify-end" : ""
                        }`}
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        <TabsTrigger
                          value="presentation"
                          className="tabs-trigger min-w-max"
                        >
                          {t("lessonPage.presentationTab")}
                        </TabsTrigger>
                        <TabsTrigger
                          value="comments"
                          className="tabs-trigger min-w-max"
                        >
                          {t("lessonPage.commentsTab")}
                        </TabsTrigger>
                        <TabsTrigger
                          value="ressources"
                          className="tabs-trigger min-w-max"
                        >
                          {t("lessonPage.resourcesTab")}
                        </TabsTrigger>
                        {/* Indicateur animé */}
                        <span
                          className="absolute bottom-0 h-1 bg-black rounded transition-all duration-300"
                          style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                          }}
                        />
                      </TabsList>

                      <TabsContent
                        value="presentation"
                        className={`mt-3${isRTL ? " text-right" : ""}`}
                      >
                        {currentLesson && (
                          <Presentation
                            lesson={currentLesson}
                            t={t}
                            isRTL={isRTL}
                          />
                        )}
                      </TabsContent>

                      <TabsContent value="comments" className="mt-6">
                        <CommentsSection
                          lessonId={currentLesson?.id || ""}
                          initialComments={[]} // Laisser le composant charger ses propres commentaires
                          onAddComment={handleAddComment}
                          onAddReply={handleAddReply}
                          canManage={true} // Force l'activation du mode gestion pour test
                        />
                      </TabsContent>

                      <TabsContent value="ressources" className="mt-6">
                        {currentLesson && (
                          <Resources lesson={currentLesson} t={t} />
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Section Test - affichée seulement si la leçon n'est pas complétée */}
                  {!currentLesson?.isCompleted && (
                    <TestSection
                      t={t}
                      setIsTesting={setIsTesting}
                      currentLesson={currentLesson || undefined}
                      setChapters={setChapters}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Desktop Sidebar */}
        <LessonSidebar
          chapters={chapters}
          finalExam={finalExam}
          setIsTesting={setIsTesting}
          currentLessonId={currentLesson?.id || ""}
          currentLesson={currentLesson}
          setCurrentLesson={setCurrentLesson}
          courseId={courseId || ""}
          isTesting={isTesting}
          setIsQuiz={setIsQuiz}
          setFinalExam={setFinalExam}
          isTestStarting={isTestStarting}
        />
      </div>
    </div>
  );
}