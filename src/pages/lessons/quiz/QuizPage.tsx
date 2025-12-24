import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Clock,
  Award,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  BookOpen,
  Zap,
  AlertCircle,
  Download,
  Check,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import videoQuizService from "@/services/quiz.service";
import certificateService from "@/services/certificate.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  VideoQuizResponse,
  QuizSubmissionRequest,
  QuizResultResponse,
  StudentAnswer,
} from "@/types/Quiz";
import { Button } from "@/components/ui/button";
import QuizSkeleton from "@/components/quiz/QuizSkeleton";
import type { Chapter, Lesson } from "@/types";
import type { QuizSummary } from "@/types/QuizSummary";
import type { ProgressStatus } from "@/types/enum/ProgressStatus";

// Version adaptée du type VideoQuizResponse pour notre composant
interface AdaptedVideoQuizResponse
  extends Omit<VideoQuizResponse, "questions"> {
  questions: {
    id: string;
    questionText: string;
    questionType: string;
    points: number;
    skillName?: string;
    timeLimit: number;
    options?: { id: string; optionText: string }[];
    placeholder?: string;
    maxLength?: number;
    //skillsCovered?: string[];
  }[];
}

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}
  >
    {children}
  </div>
);

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "skill" | "points" | "success" | "error";
};

const Badge: React.FC<BadgeProps> = ({ children, variant = "default" }) => {
  const getStyles = () => {
    switch (variant) {
      case "skill":
        return { backgroundColor: "#fed315", color: "#0b0607" };
      case "points":
        return { backgroundColor: "#94bf21", color: "white" };
      case "success":
        return { backgroundColor: "#94bf21", color: "white" };
      case "error":
        return { backgroundColor: "#e54e1c", color: "white" };
      default:
        return { backgroundColor: "#e58633", color: "white" };
    }
  };

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={getStyles()}
    >
      {children}
    </span>
  );
};

interface Props {
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  chapters: Chapter[];
  courseId: string;
  setCurrentLesson: React.Dispatch<React.SetStateAction<Lesson | undefined>>;
  currentLesson?: Lesson;
  setIsTesting?: (isTesting: boolean) => void;
  setIsQuiz?: (isQuiz: boolean) => void;
  setCompletedLessons: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  finalExam: QuizSummary | null;
  setFinalExam: React.Dispatch<React.SetStateAction<QuizSummary | null>>;
  isContinuing: boolean;
  setIsContinuing: React.Dispatch<React.SetStateAction<boolean>>;
  setLearnerProgressStatus: React.Dispatch<
    React.SetStateAction<ProgressStatus>
  >;
  LearnerProgressStatus: ProgressStatus;
  setIsTestStarting: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoQuiz: React.FC<Props> = ({
  setChapters,
  chapters,
  courseId,
  setCurrentLesson,
  currentLesson,
  setIsTesting,
  setCompletedLessons,
  setIsQuiz,
  setFinalExam,
  setIsContinuing,
  isContinuing,
  setLearnerProgressStatus,
  setIsTestStarting,
}) => {
  // Nous n'avons plus besoin de récupérer les chapitres car nous utilisons directement le service
  // Nous n'utilisons pas useChapters directement pour éviter des appels API inutiles
  const { quizId } = useParams<{ quizId: string }>();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizType = searchParams.get("quizType"); // Valeur: "PHASE_QUIZ"
  const [quiz, setQuiz] = useState<AdaptedVideoQuizResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{
    [questionId: string]: { selectedOptionIds?: string[]; answerText?: string };
  }>({});
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentResourceId] = useState<string>(quizId || lessonId || "");
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [warning, setWarning] = useState(false);
  const [questionTimers, setQuestionTimers] = useState<{
    [questionId: string]: number;
  }>({});
  const [currentQuestionTimeLeft, setCurrentQuestionTimeLeft] =
    useState<number>(0);
  const [questionStartTimes, setQuestionStartTimes] = useState<{
    [questionId: string]: number;
  }>({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState<{
    [questionId: string]: number;
  }>({});

  const [showReview, setShowReview] = useState(false);

  // Support RTL pour l'arabe
  const isRTL = i18n.language === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (quizType) {
        if (quizType === "SIMPLE_QUIZ") {
          data = await videoQuizService.getQuizByLessonId(currentResourceId);
        } else if (quizType === "PHASE_QUIZ") {
          // get chapter id from quizid
          const currentChapter = chapters.find(
            (chapter) => chapter.quiz && chapter.quiz.id === quizId
          );
          data = await videoQuizService.getQuizByChapterId(
            currentChapter?.id || ""
          );
        } else if (quizType === "FINAL_QUIZ") {
          data = await videoQuizService.getFinalQuizByCourseId(courseId);
        }
      } else {
        data = await videoQuizService.getQuizByLessonId(currentResourceId);
      }

      if (!data) {
        throw new Error(t("quiz.noQuiz"));
      }
      const adaptedData: AdaptedVideoQuizResponse = {
        ...data,
        title: data.title,
        questions: (data.questions as any[]).map((q) => ({
          id: q.questionId,
          questionText: q.questionText,
          questionType: q.type,
          points: q.points,
          skillName: q.skillName,
          timeLimit: q.timeLimit || 60, // Utiliser le timeLimit spécifique ou 60 secondes par défaut
          options: q.options
            ? q.options.map((opt: any) => ({
                id: opt.optionId,
                optionText: opt.text,
              }))
            : [],
          placeholder: q.placeholder,
          maxLength: q.maxLength,
        })),
      };

      setQuiz(adaptedData);

      // Initialiser les timers pour chaque question
      if (adaptedData.questions.length > 0) {
        const initialTimers = adaptedData.questions.reduce((acc, q) => {
          acc[q.id] = q.timeLimit;
          return acc;
        }, {} as { [questionId: string]: number });

        setQuestionTimers(initialTimers);
        setCurrentQuestionTimeLeft(adaptedData.questions[0].timeLimit);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement du quiz :", error);
      setError(error instanceof Error ? error.message : t("errors.generic"));
      setLoading(false);
    }
  }, [quizType, currentResourceId, chapters, quizId, courseId, t]);

  // Fonction pour enregistrer le temps passé
  const recordTimeSpent = useCallback(
    (questionId: string) => {
      if (questionStartTimes[questionId]) {
        const timeSpent = Math.round(
          (Date.now() - questionStartTimes[questionId]) / 1000
        );

        setQuestionTimeSpent((prev) => ({
          ...prev,
          [questionId]: timeSpent,
        }));

        console.log(`Question ${questionId}: temps passé = ${timeSpent}s`);
      }
    },
    [questionStartTimes]
  );
  const handleSubmit = useCallback(async () => {
    if (!quiz) return;

    setSubmitting(true);
    setError(null);
    setIsTestStarting(false);
    // Enregistrer le temps pour la dernière question
    const lastQuestionId = quiz.questions[currentQuestion].id;
    recordTimeSpent(lastQuestionId);
    const submission: QuizSubmissionRequest = {
      quizSessionId: quiz.quizSessionId,
      answers: quiz.questions.map((question) => {
        const answer = answers[question.id];
        // Utiliser le temps enregistré pour cette question ou calculer si c'est la question actuelle
        let timeSpent: number;
        if (question.id === quiz.questions[currentQuestion].id) {
          // Pour la question actuelle, calculer le temps passé maintenant
          timeSpent = questionStartTimes[question.id]
            ? Math.round((Date.now() - questionStartTimes[question.id]) / 1000)
            : question.timeLimit;
        } else {
          // Pour les questions précédentes, utiliser le temps déjà enregistré
          timeSpent = questionTimeSpent[question.id] || question.timeLimit;
        }
        return {
          questionId: question.id,
          questionType: question.questionType,
          selectedOptionIds: answer?.selectedOptionIds || [],
          answerText: answer?.answerText,
          timeSpent: timeSpent,
        } as StudentAnswer;
      }),
      submissionTime: new Date().toISOString(),
    };

    try {
      const resultData = await videoQuizService.submitQuiz(submission);
      setResult(resultData);
      setShowReview(true);
      setShowResults(false);

      // Mettre à jour la leçon dans chapters
      if (currentLesson) {
        setChapters((prevChapters) =>
          prevChapters.map((chapter) => {
            chapter.lessons?.map((lesson) => {
              if (lesson.id === currentLesson.id) {
                lesson.hasActiveQuiz = false;
                lesson.isLocked = false;
                lesson.isCompleted = true;
              }
            });
            return chapter;
          })
        );
      }

      // unlock next lesson si la leçon courante n'est pas la dernière du chapitre
      setChapters((prev) =>
        prev.map((chapter) => {
          // Trouver le chapitre de la leçon courante
          if (
            currentLesson &&
            chapter.lessons?.some((lesson) => lesson.id === currentLesson.id)
          ) {
            // Trier les leçons par ordre
            const sortedLessons = [...(chapter.lessons ?? [])].sort(
              (a, b) => a.order - b.order
            );
            // Trouver l'index de la leçon courante
            const currentIndex = sortedLessons.findIndex(
              (lesson) => lesson.id === currentLesson.id
            );
            // Si ce n'est pas la dernière leçon
            if (currentIndex < sortedLessons.length - 1) {
              const nextLessonId = sortedLessons[currentIndex + 1].id;
              return {
                ...chapter,
                lessons: chapter.lessons?.map((lesson) =>
                  lesson.id === nextLessonId
                    ? { ...lesson, isLocked: false }
                    : lesson
                ),
              };
              // Si c'est la dernière leçon, unlocker le chapterQuiz
            } else if (
              currentIndex === sortedLessons.length - 1 &&
              chapter.quiz
            ) {
              return {
                ...chapter,
                quiz: {
                  ...chapter.quiz,
                  isLocked: false,
                },
              };
            }
          }
          return chapter;
        })
      );

      setCompletedLessons((prev) => {
        const lessonIdToAdd = currentLesson?.id;
        if (!lessonIdToAdd) return prev;
        if (!prev) return [lessonIdToAdd];
        return [...prev, lessonIdToAdd];
      });

      // Mettre à jour le quiz du chapitre si c'est un PHASE_QUIZ
      if (quizType === "PHASE_QUIZ" && quizId) {
        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.quiz && chapter.quiz.id === quizId
              ? {
                  ...chapter,
                  quiz: {
                    ...chapter.quiz,
                    hasActiveQuiz: false,
                    isCompleted: true,
                    isLocked: true,
                  },
                }
              : chapter
          )
        );

        const isLastChapter =
          chapters.length > 0 &&
          chapters[chapters.length - 1].quiz &&
          chapters[chapters.length - 1].quiz?.id === quizId;

        if (!isLastChapter) {
          // unlocked first lesson in next chapter
          setLearnerProgressStatus("WAITING_ADMIN");
          const currentChapter = chapters.find(
            (chapter) => chapter.quiz?.id === quizId
          );
          const nextChapter = chapters.find(
            (chapter) => chapter.order === (currentChapter?.order || 0) + 1
          );
          setChapters((prev) =>
            prev.map((chapter) => {
              if (chapter.id === nextChapter?.id) {
                return {
                  ...chapter,
                  lessons: chapter.lessons?.map((lesson, index) =>
                    index === 0 ? { ...lesson, isLocked: false } : lesson
                  ),
                };
              }
              return chapter;
            })
          );
        } else {
          setFinalExam((prev) => (prev ? { ...prev, isLocked: false } : prev));
        }
      }
      if (quizType === "FINAL_QUIZ" && quizId) {
        setFinalExam((prev) =>
          prev ? { ...prev, isLocked: true, isCompleted: true } : prev
        );
      }
    } catch (error: any) {
      console.error("Erreur lors de la soumission du quiz :", error);
      setError(error instanceof Error ? error.message : t("quiz.submitError"));
    } finally {
      setSubmitting(false);
    }
    // Added missing dependencies
  }, [
    quiz,
    setIsTestStarting,
    currentQuestion,
    recordTimeSpent,
    answers,
    questionStartTimes,
    questionTimeSpent,
    currentLesson,
    setChapters,
    setCompletedLessons,
    quizType,
    quizId,
    chapters,
    setFinalExam,
    setLearnerProgressStatus,
    t,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const syncQuizTimer = useCallback(async () => {
    if (!quiz || result || submitting) return;

    try {
      let data;
      if (quizType === "SIMPLE_QUIZ") {
        data = await videoQuizService.getQuizByLessonId(currentResourceId);
      } else if (quizType === "PHASE_QUIZ") {
        const currentChapter = chapters.find(
          (chapter) => chapter.quiz && chapter.quiz.id === quizId
        );
        data = await videoQuizService.getQuizByChapterId(
          currentChapter?.id || ""
        );
      } else if (quizType === "FINAL_QUIZ") {
        data = await videoQuizService.getFinalQuizByCourseId(courseId);
      }

      if (data && data.questions) {
        // Mettre à jour les timers de questions si nécessaire
        // Cette partie dépend de l'API, ajustez-la selon votre implémentation
        const currentQ = quiz.questions[currentQuestion];
        if (currentQ) {
          const serverQuestion = data.questions.find(
            (q) => q.id === currentQ.id
          );
          if (serverQuestion && serverQuestion.timeLeft !== undefined) {
            setCurrentQuestionTimeLeft(serverQuestion.timeLeft);

            // Auto-submit si le temps est écoulé
            if (serverQuestion.timeLeft <= 0) {
              if (currentQuestion < quiz.questions.length - 1) {
                handleNextQuestion();
              } else {
                handleSubmit();
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation du timer:", error);
    }
  }, [
    quiz,
    result,
    submitting,
    quizType,
    currentResourceId,
    chapters,
    quizId,
    courseId,
    currentQuestion,
  ]);

  const handleDownloadCertificate = useCallback(async () => {
  setDownloadingCertificate(true);
  try {
    // Ajouter des logs pour déboguer
    console.log("Téléchargement du certificat pour le cours:", courseId);
    
    const blob = await certificateService.downloadCertificate(courseId);
    
    // Créer une URL pour le blob et déclencher le téléchargement
    const url = URL.createObjectURL(blob);
    
    // Option 1: Télécharger automatiquement
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-${courseId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Option 2: Ouvrir dans un nouvel onglet pour visualisation
    window.open(url, '_blank');
    
    // Important: libérer la mémoire
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    
  } catch (error) {
    console.error("Erreur lors du téléchargement du certificat :", error);
    setError(
      error instanceof Error ? error.message : t("certificate.downloadError")
    );
    
    // Afficher une alerte pour informer l'utilisateur
    alert("Erreur lors du téléchargement du certificat. Veuillez réessayer.");
  } finally {
    setDownloadingCertificate(false);
  }
}, [courseId, t]);
  // Timer
  // Initialiser le temps de début quand une question est affichée
  useEffect(() => {
    if (quiz && quiz.questions[currentQuestion]) {
      const questionId = quiz.questions[currentQuestion].id;

      if (!questionStartTimes[questionId]) {
        setQuestionStartTimes((prev) => ({
          ...prev,
          [questionId]: Date.now(),
        }));
      }
    }
  }, [quiz, currentQuestion]);

  useEffect(() => {
    if (quiz) {
      // Créer un objet qui contient le timeLimit pour chaque question
      const initialTimers = quiz.questions.reduce((acc, question) => {
        // Utiliser le timeLimit spécifique à la question ou une valeur par défaut
        acc[question.id] = question.timeLimit || 60; // 60 secondes par défaut si non défini
        return acc;
      }, {} as { [questionId: string]: number });

      setQuestionTimers(initialTimers);
      // Initialiser le timer pour la première question
      if (quiz.questions.length > 0) {
        setCurrentQuestionTimeLeft(initialTimers[quiz.questions[0].id]);
      }
    }
  }, [quiz]);

  useEffect(() => {
    if (!quiz || result || submitting) return;

    const currentQ = quiz.questions[currentQuestion];
    if (!currentQ) return;

    // Utiliser le temps restant pour la question actuelle
    if (currentQuestionTimeLeft > 0) {
      const timer = setTimeout(() => {
        setCurrentQuestionTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (currentQuestionTimeLeft === 0) {
      // Si le temps est écoulé pour cette question, passer à la suivante
      // ou soumettre le quiz si c'est la dernière question
      if (currentQuestion < quiz.questions.length - 1) {
        handleNextQuestion();
      } else {
        handleSubmit();
      }
    }
  }, [currentQuestionTimeLeft, quiz, result, submitting, currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      // Récupérer les réponses actuelles ou initialiser un tableau vide
      const currentAnswer = prev[questionId] || {};
      const selectedOptionIds = currentAnswer.selectedOptionIds || [];

      // Vérifier si l'option est déjà sélectionnée
      const isSelected = selectedOptionIds.includes(optionId);

      // Créer un nouveau tableau avec ou sans l'option sélectionnée
      let newSelectedOptionIds;
      if (isSelected) {
        // Si déjà sélectionné, on le retire
        newSelectedOptionIds = selectedOptionIds.filter(
          (id) => id !== optionId
        );
      } else {
        // Sinon on l'ajoute
        newSelectedOptionIds = [...selectedOptionIds, optionId];
      }

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          selectedOptionIds: newSelectedOptionIds,
        },
      };
    });
  };
  /*const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedOptionId: optionId },
    }));
  };*/

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], answerText: text },
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      // Enregistrer le temps passé sur la question actuelle
      const currentQuestionId = quiz.questions[currentQuestion].id;
      recordTimeSpent(currentQuestionId);

      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);

      // Mettre à jour le timer pour la nouvelle question
      const nextQuestionId = quiz.questions[nextQuestion].id;
      setCurrentQuestionTimeLeft(questionTimers[nextQuestionId]);
    }
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  // Déverrouiller la leçon actuelle pour le test
  useEffect(() => {
    if (currentLesson && currentLesson.isLocked) {
      // Créer une copie de la leçon avec isLocked = false
      const unlockedLesson = { ...currentLesson, isLocked: false };
      setCurrentLesson(unlockedLesson);
    }
  }, [currentLesson, setCurrentLesson]);

  useEffect(() => {
    setIsTestStarting(true);
    fetchQuiz();
    // Added missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attemptsRef = useRef(0);

  useEffect(() => {
    let lastTrigger = 0;
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden || document.hasFocus?.() === false) {
        // prevent double count within 500ms (blur + visibilitychange)
        if (now - lastTrigger < 500) return;
        lastTrigger = now;
        setWarning(true);
        attemptsRef.current += 1;
        if (attemptsRef.current >= 3) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("blur", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleSubmit]);

  // État de chargement
  if (loading) {
    return (
      <div className="w-full min-h-96 flex-1">
        <QuizSkeleton />
      </div>
    );
  }

  // État d'erreur
  if (error || !quiz) {
    return (
      <div
        className="min-h-96 p-8"
        style={{
          background: "linear-gradient(135deg, #fdfdfe 0%, #fff8f6 100%)",
          direction,
        }}
      >
        <Card className="p-8 text-center">
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "#e54e1c" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "#0b0607" }}
          >
            {error ? t("errors.generic") : t("quiz.noQuiz")}
          </h3>
          <p className="text-gray-600 mb-4">{error || t("quiz.noQuiz")}</p>
          <Button onClick={fetchQuiz}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("quiz.retry")}
          </Button>
        </Card>
      </div>
    );
  }

  const handleNavigateToNextResource = () => {
    const currentLessonId = currentLesson?.id;
    if (quizType === "PHASE_QUIZ" && quizId) {
      //verifier si il y'a un chapitre apres ce quiz
      const currentChapter = chapters.find(
        (chapter) => chapter.quiz?.id === quizId
      );
      //si il y a un chapitre naviguer vers la premiere lecon de ce chapitre sinon vers final quiz
      if (currentChapter) {
        const nextChapter = chapters.find(
          (chapter) => chapter.order === currentChapter.order + 1
        );
        if (nextChapter?.lessons?.length) {
          navigate(`/courses/${courseId}/lessons/${nextChapter.lessons[0].id}`);
          return;
        }
      }
    } else if (quizType === "FINAL_QUIZ" && quizId) {
      console.log("Navigating after FINAL_QUIZ");
      return;
    }
    // Trouver le chapitre contenant la leçon courante
    const currentChapter = chapters.find((chapter) =>
      chapter.lessons?.some((lesson) => lesson.id === currentLessonId)
    );
    setIsQuiz?.(false);
    setIsTesting?.(false);
    if (!currentChapter || !currentChapter.lessons) return;
    // Trier les leçons par ordre
    const sortedLessons = [...currentChapter.lessons].sort(
      (a, b) => a.order - b.order
    );
    // Trouver l'index de la leçon courante
    const currentIndex = sortedLessons.findIndex(
      (lesson) => lesson.id === currentLessonId
    );

    // Si ce n'est pas la dernière leçon, naviguer vers la suivante
    if (currentIndex < sortedLessons.length - 1) {
      const nextLesson = sortedLessons[currentIndex + 1];
      setCurrentLesson(undefined);
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
    } else if (
      currentIndex === sortedLessons.length - 1 &&
      currentChapter.quiz
    ) {
      // Si la leçon courante est la dernière, naviguer vers le quiz du chapitre
      navigate(
        `/courses/${courseId}/quiz/${currentChapter.quiz.id}?quizType=PHASE_QUIZ`
      );
    }
  };

  // Résultats du quiz
  if (showReview && result && quiz) {
    return (
      <div
        className="min-h-screen p-6 md:p-20 w-full"
        style={{
          background: "linear-gradient(135deg, #fdfdfe 0%, #fff8f6 100%)",
          direction,
        }}
      >
        <div className="w-full max-w-5xl mx-auto">
          {/* En-tête de la révision */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#94bf21" }}
                  >
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ color: "#0b0607" }}
                    >
                      {t("quiz.reviewTitle") || "Révision du quiz"}
                    </h1>
                    <p className="text-lg" style={{ color: "#e58633" }}>
                      {quiz.title}
                    </p>
                  </div>
                </div>

                {/* Résumé rapide */}
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    {result.correctAnswers}/{result.totalQuestions} correctes
                  </span>
                  <span className="text-gray-600">
                    Score: {Math.round(result.percentage || result.score)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Liste des questions avec réponses correctes */}
          <div className="space-y-6 mb-8">
            {result.questionDetails?.map((questionDetail, index) => {
              return (
                <Card key={questionDetail.questionId} className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0`}
                      style={{
                        backgroundColor: questionDetail.correct
                          ? "#94bf21"
                          : "#e54e1c",
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={questionDetail.correct ? "success" : "error"}
                        >
                          {questionDetail.correct
                            ? t("quiz.correct") || "Correct"
                            : t("quiz.incorrect") || "Incorrect"}
                        </Badge>
                        {questionDetail.skillName && (
                          <Badge variant="skill">
                            {questionDetail.skillName}
                          </Badge>
                        )}
                        <Badge variant="points">
                          {questionDetail.points} {t("quiz.points") || "pts"}
                        </Badge>
                      </div>
                      <h3
                        className="text-xl font-semibold mb-4"
                        style={{ color: "#0b0607" }}
                      >
                        {questionDetail.questionText}
                      </h3>

                      {/* Affichage pour QCM */}
                      {questionDetail.questionType === "MULTIPLE_CHOICE" &&
                        questionDetail.options && (
                          <div className="space-y-3">
                            {questionDetail.options.map((option) => {
                              return (
                                <div
                                  key={option.optionId}
                                  className={`p-3 rounded-lg flex items-center ${
                                    option.correct
                                      ? "bg-green-50 border border-green-200"
                                      : option.wasSelected
                                      ? "bg-red-50 border border-red-200"
                                      : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                                      option.correct
                                        ? "bg-green-500"
                                        : option.wasSelected
                                        ? "bg-red-500"
                                        : "bg-gray-300"
                                    }`}
                                  >
                                    {option.correct && (
                                      <Check className="w-4 h-4 text-white" />
                                    )}
                                    {!option.correct && option.wasSelected && (
                                      <X className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span
                                    className={`flex-1 ${
                                      option.correct
                                        ? "text-green-800 font-medium"
                                        : option.wasSelected
                                        ? "text-red-800 font-medium"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {option.optionText}
                                  </span>
                                  {option.correct && (
                                    <div className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                      {t("quiz.correctAnswer") ||
                                        "Réponse correcte"}
                                    </div>
                                  )}
                                  {option.wasSelected && !option.correct && (
                                    <div className="ml-auto px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                      {t("quiz.yourChoice") || "Votre choix"}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                      {/* Affichage pour questions ouvertes */}
                      {questionDetail.questionType === "OPEN_QUESTION" && (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-2">
                              {t("quiz.yourAnswer") || "Votre réponse:"}
                            </div>
                            <div className="text-gray-800">
                              {questionDetail.studentAnswer ||
                                t("quiz.noAnswer") ||
                                "Pas de réponse"}
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-lg border ${
                              questionDetail.correct
                                ? "bg-green-50 border-green-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div
                              className={`text-sm mb-2 ${
                                questionDetail.correct
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {t("quiz.correctAnswer") || "Réponse correcte:"}
                            </div>
                            <div
                              className={`font-medium ${
                                questionDetail.correct
                                  ? "text-green-800"
                                  : "text-yellow-800"
                              }`}
                            >
                              {questionDetail.correctAnswer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bouton pour voir le score final */}
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={() => {
                setShowReview(false);
                setShowResults(true);
              }}
              className="px-8"
            >
              <Award className="w-5 h-5 mr-2" />
              {t("quiz.viewResults") || "Voir mon score final"}
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (showResults && result) {
    const percentage = Math.round(result.percentage || result.score);
    const passed = result.passed;

    return (
      <div
        className="min-h-screen p-20 w-full"
        style={{
          background: "linear-gradient(135deg, #fdfdfe 0%, #fff8f6 100%)",
          direction,
        }}
      >
        <div className="w-full mx-auto">
          {/*En-tête des résultats */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
              style={{ backgroundColor: passed ? "#94bf21" : "#e54e1c" }}
            >
              {passed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </div>
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: "#0b0607" }}
            >
              {passed ? t("quiz.success") : t("quiz.failure")}
            </h1>
          </div>

          {/* Carte de score */}
          <Card className="p-8 mb-8">
            <div className="text-center">
              <div
                className="text-8xl font-bold mb-6"
                style={{ color: passed ? "#94bf21" : "#e54e1c" }}
              >
                {percentage}%
              </div>
              <div
                className="text-3xl font-semibold mb-8"
                style={{ color: "#0b0607" }}
              >
                {result.correctAnswers}/{result.totalQuestions}{" "}
                {t("quiz.correctAnswers")}
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-6 mb-8">
                <div
                  className="h-6 rounded-full transition-all duration-1000"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${
                      passed ? "#94bf21" : "#e54e1c"
                    } 0%, ${passed ? "#fed315" : "#e58633"} 100%)`,
                  }}
                />
              </div>

              {/* Temps utilisé (simple affichage informatif) */}
              {result.timeUsedSeconds && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: "#e58633" }} />
                    <span className="text-lg font-medium">
                      {t("quiz.timeUsed")}: {formatTime(result.timeUsedSeconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* Messages du backend */}
              {Array.isArray(result.messages) && result.messages.length > 0 && (
                <div
                  className={`rounded-lg p-6 mb-6 ${
                    passed
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {result.messages.map((message, index) => (
                    <p
                      key={index}
                      className={`text-lg font-medium mb-2 ${
                        passed ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {message}
                    </p>
                  ))}
                </div>
              )}

              {/* Feedback traditionnel si pas de messages */}
              {(!Array.isArray(result.messages) ||
                result.messages.length === 0) &&
                result.feedback && (
                  <div
                    className={`rounded-lg p-6 mb-6 ${
                      passed
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p
                      className={`text-lg font-medium ${
                        passed ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.feedback}
                    </p>
                  </div>
                )}

              {/* Section des compétences */}
              {quiz.skillsCovered && quiz.skillsCovered.length > 0 && (
                <div className="mb-8">
                  <h3
                    className="text-2xl font-bold mb-6"
                    style={{ color: "#0b0607" }}
                  >
                    {t("quiz.skillsCovered")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {quiz.skillsCovered.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col items-center text-center h-full">
                          <div
                            className="w-12 h-12 rounded-full mb-3 flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "#e58633" }}
                          >
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div
                            className="font-semibold text-sm leading-tight"
                            style={{ color: "#0b0607" }}
                          >
                            {skill}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {quizType === "FINAL_QUIZ" && (result.passed || (result as any).finalQuizPassed) && (
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center justify-center mb-2">
      <Award className="w-6 h-6 mr-2 text-green-600" />
      <span className="text-lg font-semibold text-green-800">
        {t("certificate.available") || "Certificat disponible !"}
      </span>
    </div>
    <p className="text-sm text-center text-green-700">
      {t("certificate.downloadNow") || "Vous pouvez télécharger votre certificat de réussite dès maintenant."}
    </p>
  </div>
)}

              {/*Boutons d'action*/}
              <div className="flex gap-4 justify-center">
                {result.canAccessNextVideo && (
                  <Button
                    size="lg"
                    disabled={isContinuing}
                    onClick={async () => {
                      setIsContinuing(true);
                      try {
                        if (!courseId) return;
                        handleNavigateToNextResource();
                      } finally {
                        setIsContinuing(false);
                      }
                    }}
                    className={
                      isContinuing ? "opacity-70 pointer-events-none" : ""
                    }
                  >
                    {isContinuing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t("courses.continue")}
                      </>
                    ) : (
                      <>
                        <Award className="w-5 h-5 mr-2" />
                        {t("courses.continue")}
                      </>
                    )}
                  </Button>
                )}
                {quizType === "FINAL_QUIZ" && (result.passed || result.finalQuizPassed) && (
                   <Button
                       size="lg"
                       onClick={handleDownloadCertificate}
                       disabled={downloadingCertificate}
                       variant="secondary"
                    >
                    {downloadingCertificate ? (
                    <>
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                          {t("certificate.downloading")}
                    </>
                    ) : (
                    <>
                       <Download className="w-5 h-5 mr-2" />
                          {t("certificate.download")}
                     </>
                    )}
                   </Button>
                 )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  } else {
    const currentQ = quiz.questions[currentQuestion];

    return (
      <div
        className="min-h-screen p-20 w-full"
        style={{
          background: "linear-gradient(135deg, #fdfdfe 0%, #fff8f6 100%)",
          direction,
        }}
      >
        <Dialog open={warning} onOpenChange={setWarning}>
          <DialogContent
            className="max-w-md mx-auto bg-red-50 border-2 border-red-500"
            style={{ direction }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-red-600 font-bold text-xl flex items-center gap-2"
                style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
              >
                <AlertCircle className="w-8 h-8" />
                ATTENTION!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4 text-lg font-bold text-red-800">
              Vous avez quitté la fenêtre du quiz! Cette action est considérée
              comme une tentative de triche.
            </div>
            <div className="text-center py-2 text-base font-semibold text-red-600">
              Après 3 tentatives, votre quiz sera automatiquement soumis.
            </div>
            <Button
              onClick={() => setWarning(false)}
              className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white"
            >
              J'ai compris
            </Button>
          </DialogContent>
        </Dialog>
        <div className="w-full mx-auto">
          {/* En-tête du quiz */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#e54e1c" }}
                  >
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ color: "#0b0607" }}
                    >
                      {t("quiz.title")} - {quiz.title}
                    </h1>
                    <p className="text-lg" style={{ color: "#e58633" }}>
                      {t("quiz.testDescription")}
                    </p>
                  </div>
                </div>

                {/* Tags des compétences */}
                {quiz.skillsCovered && (
                  <div className="flex flex-wrap gap-2">
                    {quiz.skillsCovered.map((skill, index) => (
                      <Badge key={index} variant="skill">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Timer et progression */}
              <div className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end gap-2 mb-3">
                  <Clock className="w-6 h-6" style={{ color: "#e54e1c" }} />
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color:
                        currentQuestionTimeLeft < 10 ? "#e54e1c" : "#0b0607",
                    }}
                  >
                    {formatTime(currentQuestionTimeLeft)}
                  </span>
                </div>
                <div className="text-sm mb-2" style={{ color: "#0b0607" }}>
                  {t("quiz.question")} {currentQuestion + 1} {t("quiz.of")}{" "}
                  {quiz.questions.length}
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${getProgressPercentage()}%`,
                      background:
                        "linear-gradient(90deg, #e54e1c 0%, #fed315 50%, #94bf21 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Question actuelle */}
          <Card className="p-8 mb-8">
            <div className="mb-8">
              <div className="flex items-start gap-6 mb-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: "#e54e1c" }}
                >
                  {currentQuestion + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="points">
                      {t("quiz.question")} {currentQuestion + 1}
                    </Badge>
                    {currentQ.skillName && (
                      <Badge variant="skill">{currentQ.skillName}</Badge>
                    )}
                  </div>
                  <h2
                    className="text-2xl font-bold leading-relaxed"
                    style={{ color: "#0b0607" }}
                  >
                    {currentQ.questionText}
                  </h2>
                </div>
              </div>

              {/* Contenu de la question */}
              {currentQ.questionType === "MULTIPLE_CHOICE" &&
              currentQ.options ? (
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => {
                    // Vérifier si cette option est dans le tableau des options sélectionnées
                    const isSelected =
                      answers[currentQ.id]?.selectedOptionIds?.includes(
                        option.id
                      ) || false;

                    return (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          isSelected
                            ? "border-opacity-100 shadow-lg"
                            : "border-opacity-30 hover:border-opacity-60"
                        }`}
                        style={{
                          borderColor: "#e54e1c",
                          backgroundColor: isSelected ? "#fff8f6" : "white",
                        }}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 ${
                            isRTL ? "ml-4" : "mr-4"
                          } flex items-center justify-center transition-all duration-300`}
                          style={{
                            borderColor: isSelected ? "#e54e1c" : "#e5e7eb",
                            backgroundColor: isSelected
                              ? "#e54e1c"
                              : "transparent",
                          }}
                        >
                          {isSelected && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className="text-lg font-medium flex-1"
                          style={{ color: "#0b0607" }}
                        >
                          {String.fromCharCode(65 + index)}. {option.optionText}
                        </span>
                        <input
                          type="checkbox"
                          value={option.id}
                          checked={isSelected}
                          onChange={() =>
                            handleOptionChange(currentQ.id, option.id)
                          }
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : currentQ.questionType === "OPEN_QUESTION" ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full p-6 border-2 rounded-xl text-lg transition-all duration-300 focus:border-opacity-100 focus:shadow-lg resize-none"
                    style={{
                      borderColor: "rgba(229, 78, 28, 0.3)",
                      minHeight: "200px",
                      textAlign: isRTL ? "right" : "left",
                    }}
                    placeholder={t("quiz.openQuestionPlaceholder")}
                    value={answers[currentQ.id]?.answerText || ""}
                    onChange={(e) =>
                      handleTextChange(currentQ.id, e.target.value)
                    }
                    onFocus={(e) =>
                      ((e.target as HTMLTextAreaElement).style.borderColor =
                        "rgba(229, 78, 28, 1)")
                    }
                    onBlur={(e) =>
                      ((e.target as HTMLTextAreaElement).style.borderColor =
                        "rgba(229, 78, 28, 0.3)")
                    }
                  />

                  <div
                    className="flex justify-between text-sm"
                    style={{ color: "#e58633" }}
                  >
                    <span>{t("quiz.openAnswer")}</span>
                    <span>
                      {(answers[currentQ.id]?.answerText || "").length}{" "}
                      {t("quiz.characters")}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col-reverse gap-4 items-stretch sm:flex-row sm:items-center sm:justify-between mt-8">
            {/* Points de progression */}
            <div className="flex gap-2 justify-center sm:justify-center order-2 sm:order-none mb-2 sm:mb-0">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentQuestion ? "scale-125" : ""
                  }`}
                  style={{
                    backgroundColor:
                      index === currentQuestion
                        ? "#e54e1c"
                        : answers[quiz.questions[index].id]
                        ? "#94bf21"
                        : "#e5e7eb",
                  }}
                />
              ))}
            </div>
            {/* Espace vide pour maintenir l'équilibre visuel */}
            <div className="flex-grow"></div>

            {/* Bouton suivant ou soumettre */}
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="accent"
                size="lg"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t("quiz.submitting")}
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    {t("quiz.submit")}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isRTL ? (
                  <>
                    {t("quiz.next")}
                    <ChevronRight className="w-5 h-5 ml-2 rotate-180" />
                  </>
                ) : (
                  <>
                    {t("quiz.next")}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default VideoQuiz;
