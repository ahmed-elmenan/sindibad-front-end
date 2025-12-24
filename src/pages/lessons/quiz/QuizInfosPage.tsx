"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, FileText, AlertTriangle, Play, GraduationCap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import QuizInfoSkeleton from "@/components/quiz/QuizInfosSkeleton";
import type { Chapter } from "@/types";
import type { QuizSummary } from "@/types/QuizSummary";

interface QuizInfosPageProps {
  setIsTesting: (isTesting: boolean) => void;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  chapters: Chapter[];
  finalExam: QuizSummary | null;
}

const QuizInfosPage: React.FC<QuizInfosPageProps> = ({
  setIsTesting,
  setChapters,
  chapters,
  finalExam,
}) => {
  const [openDialog, setOpenDialog] = useState(false); // modal chapitre
  const [showFinalExamDialog, setShowFinalExamDialog] = useState(false); // modal final
  const { t } = useTranslation();
  // Récupérer quizId depuis l'URL et quizType depuis les paramètres de recherche
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // recuper quiz from chapters
  useEffect(() => {
    if (!quizId || chapters.length === 0) return; // Attend que chapters soit monté
    setIsLoading(true);
    try {
      const foundQuiz = chapters
        .flatMap((ch) => ch.quiz || [])
        .find((q) => q.id === quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else if (finalExam && finalExam.id === quizId) {
        setQuiz(finalExam);
      } else {
        setQuiz(null);
        console.error("Quiz not found in chapters or final exam");
        setError(t("quizInfos.quizNotFound", "Quiz not found"));
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setError("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizId, chapters, finalExam, t]);

  if (typeof quizId === "undefined") {
    // Affiche un loader pendant que le paramètre est en train d'arriver
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <QuizInfoSkeleton />
      </div>
    );
  }


  // Handler pour démarrer le quiz de chapitre
  const handleStartQuiz = () => {
    setOpenDialog(false);
    setIsTesting(true);
    setChapters((prevChapters) => {
      if (!quiz) return prevChapters;
      return prevChapters.map((chapter: Chapter) =>
        quiz && chapter.id === quiz.chapterId
          ? {
              ...chapter,
              quiz: chapter.quiz
                ? { ...chapter.quiz, isActive: true }
                : { ...quiz, isActive: true } as QuizSummary,
            }
          : chapter
      );
    });
  };

  // Handler pour démarrer le quiz final
  const handleStartFinalExam = () => {
    setShowFinalExamDialog(false);
    setIsTesting(true);
    setChapters((prevChapters) => {
      return prevChapters.map((chapter: Chapter) =>
        quiz && chapter.id === quiz.chapterId
          ? { ...chapter, isActive: true }
          : chapter
      );
    });
  };

  if (!quizId) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              {t("quizInfos.missingQuizIdTitle", "Missing quiz ID")}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {t(
                "quizInfos.missingQuizIdDesc",
                "Unable to load quiz information"
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <QuizInfoSkeleton />
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md border-destructive/50 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              {t("quizInfos.loadErrorTitle", "Loading error")}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {t("quizInfos.loadErrorDesc", "Unable to load quiz information")}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              {t("quizInfos.retry", "Retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              {t("quizInfos.noAccessTitle", "Access denied")}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {t(
                "quizInfos.noAccessDesc",
                "You do not have access to this quiz."
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quizType = quiz.chapterId
    ? t("quizInfos.chapterQuiz", { number: chapters.find(ch => ch.id === quiz.chapterId)?.order ?? "?" })
    : t("quizInfos.finalTest", "Final test");


  return (
    <div className="container mx-auto pb-8 px-4 sm:px-6 lg:px-10">
      <div className="w-full mx-auto">
        <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl px-10">
          {/* Image centrée, largeur réduite, gradient horizontal #fff9d7 → #fff4bb avec blur */}
          <div className="relative w-full max-w-5xl mx-auto flex justify-center items-center overflow-hidden backdrop-blur-md bg-gradient-to-r from-[#fff9d7] to-[#fff0bd]">
            <img
              src="/chapterQuiz.png"
              alt="Quiz du chapitre"
              className="w-full max-w-5xl h-auto max-h-[500px] mx-auto object-contain relative z-20"
              style={{ objectPosition: "center", display: "block" }}
              onError={(e) => {
                // Fallback en cas d'erreur de chargement d'image
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container) {
                  container.style.height = "240px";
                  container.innerHTML = `
                    <div class="flex items-center justify-center h-full">
                      <div class="text-center">
                        <div class="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg class="h-8 w-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <p class="text-sm text-gray-500">Image du quiz</p>
                      </div>
                    </div>
                  `;
                }
              }}
              onLoad={(e) => {
                // Ajuster la hauteur du conteneur après chargement de l'image
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container && target.naturalHeight > 0) {
                  const aspectRatio =
                    target.naturalWidth / target.naturalHeight;
                  const containerWidth = container.offsetWidth;
                  const calculatedHeight = Math.min(
                    containerWidth / aspectRatio,
                    500
                  );
                  container.style.height = `${calculatedHeight}px`;
                }
              }}
            />
          </div>
          <CardContent className="pt-6 px-6 lg:px-8">
            {/* En-tête avec disposition améliorée */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div className="flex items-start gap-4 flex-1">
                {/* Icône améliorée */}
                <div className="h-14 w-20 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img
                    src="/questions.svg"
                    alt="Questions"
                    className="h-8 w-8 object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl lg:text-3xl font-bold leading-tight mt-3 text-gray-900">
                    {quiz.title}
                  </CardTitle>

                  {/* Badges groupés pour mobile */}
                  <div className="flex items-center gap-3 flex-wrap sm:hidden">
                    {/* Badge durée */}
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5 text-primary border-primary/30 bg-primary/5 px-3 py-1.5 w-fit"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {t("quizInfos.duration", { duration: quiz.duration })}
                      </span>
                    </Badge>
                    {/* Badge type (Quiz du chapitre ou Final test) */}
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 font-medium shadow-sm"
                    >
                      {quizType}
                    </Badge>
                  </div>

                  {/* Badge En cours avec animation si isActive */}
                  {quiz.isActive && (
                    <Badge className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 font-medium shadow-lg animate-pulse mt-2 sm:mt-0">
                      <div className="relative">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span>{t("quizInfos.inProgress", "En cours")}</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Badge type pour desktop/tablette */}
              <Badge
                variant="secondary"
                className="self-start bg-gray-100 text-gray-700 px-3 py-1.5 font-medium shadow-sm hidden sm:flex"
              >
                {quizType}
              </Badge>
            </div>

            {/* Description améliorée */}
            <CardDescription className="text-base lg:text-lg leading-relaxed py-4 text-gray-700 bg-gray-50/50 rounded-lg px-4 mb-5">
              {quiz.description}
            </CardDescription>

            {/* Avertissement redessiné */}
            <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 text-sm font-medium mb-1">
                  {t("quizInfos.importantWarning", "Important warning")}
                </p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {t(
                    "quizInfos.chapterTestWarning",
                    "This test covers all the concepts in this chapter. Make sure you have reviewed all lessons before starting."
                  )}
                </p>
              </div>
            </div>

            <Separator className="mb-8 bg-gray-200" />

            {/* Bouton d'action amélioré */}
            {!quiz.isCompleted && (
              <div className="flex justify-end rtl:justify-start">
                {quiz.chapterId ? (
                  <Button
                    size="lg"
                    onClick={() => setOpenDialog(true)}
                    className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {quiz.isActive
                      ? t("quizInfos.resumeTest", "Resume test")
                      : t("quizInfos.startTest", "Start test")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => setShowFinalExamDialog(true)}
                    className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {quiz.isActive
                      ? t("quizInfos.resumeTest", "Resume test")
                      : t("finalExam.startExam", "Start final exam")}
                  </Button>
                )}
              </div>
            )}

            {/* Modal de confirmation pour quiz de chapitre */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    {t("quizInfos.confirmStartTitle", "Confirm test start")}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {t(
                    "quizInfos.confirmStartDesc",
                    "Please confirm that you want to start the test. You will not be able to go back once started."
                  )}
                </DialogDescription>
                <div className="py-4 space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    {t(
                      "quizInfos.readyToStart",
                      "Are you ready to start this test? Once started:"
                    )}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>
                      •{" "}
                      {t(
                        "quizInfos.timerWillStart",
                        "The timer will be activated"
                      )}
                    </li>
                    <li>
                      • {t("quizInfos.cannotGoBack", "You cannot go back")}
                    </li>
                    <li>
                      •{" "}
                      {t(
                        "quizInfos.answersSaved",
                        "All your answers will be saved"
                      )}
                    </li>
                  </ul>
                </div>
                <DialogFooter className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    className="flex-1"
                  >
                    {t("quizInfos.cancel", "Cancel")}
                  </Button>
                  <Button
                    onClick={handleStartQuiz}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t("quizInfos.start", "Start")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal spécial pour quiz final */}
            <Dialog
              open={showFinalExamDialog}
              onOpenChange={setShowFinalExamDialog}
            >
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Titre accessible */}
                <DialogTitle className="sr-only">
                  {t("finalExam.confirmTitle", "Examen Final")}
                </DialogTitle>

                {/* Description accessible */}
                <DialogDescription className="sr-only">
                  {t("finalExam.confirmSubtitle", "Validez vos compétences")}
                </DialogDescription>

                {/* Ton header custom */}
                <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden">
                  <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-8 py-8">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                          <GraduationCap className="w-8 h-8 text-white drop-shadow-sm" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                            {t("finalExam.confirmTitle", "Examen Final")}
                          </h2>
                          <p className="text-white/90 font-medium">
                            {t(
                              "finalExam.confirmSubtitle",
                              "Validez vos compétences"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Progress Badge */}
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-white font-medium">
                          {t(
                            "finalExam.progressBadge",
                            "{{percent}}% du cours complété",
                            {
                              percent: 100,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corps du dialog */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold">
                      {t("finalExam.aboutTitle")}
                    </h3>
                    <p>{t("finalExam.aboutDescription")}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {t("finalExam.certificateTitle")}
                    </h3>
                    <p>{t("finalExam.certificateDescription")}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-bold text-yellow-700">
                      {t("finalExam.warningTitle")}
                    </h3>
                    <p className="text-yellow-700">
                      {t("finalExam.warningText")}
                    </p>
                    <p className="text-yellow-600 text-sm">
                      {t("finalExam.warningSubtext")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {t("finalExam.readyTitle")}
                    </h3>
                    <p>{t("finalExam.readyDescription")}</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleStartFinalExam}>
                    {t("finalExam.startExam")}
                  </Button>
                  <Button
                    className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => setShowFinalExamDialog(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizInfosPage;
