import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { getChaptersByCourseId } from "@/services/chapter.service";
import { fetchAccessToLessonById } from "@/services/lesson.service";
import type { Chapter } from "@/types/Chapter";
import type { Lesson } from "@/types/Lesson";
import type { QuizSummary } from "@/types/QuizSummary";
import type { ProgressStatus } from "@/types/enum/ProgressStatus";

interface UseChaptersProps {
  courseId: string | undefined;
  lessonId: string | undefined;
}

interface UseChaptersReturn {
  learnerProgressStatus: ProgressStatus;
  setLearnerProgressStatus: React.Dispatch<React.SetStateAction<ProgressStatus>>;
  chapters: Chapter[];
  finalExam: QuizSummary | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  isLoadingChapters: boolean;
  currentLesson: Lesson | undefined;
  setCurrentLesson: React.Dispatch<React.SetStateAction<Lesson | undefined>>;
  lessonLoading: boolean;
  lessonError: string | null;
  fetchLesson: (lessonId: string) => Promise<void>;
  handleLessonSelect: (lesson: Lesson) => void;
  selectCurrentLesson: () => void;
  completedLessons: string[] | undefined;
  setCompletedLessons: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  quizType: "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ" | undefined;
  setQuizType: React.Dispatch<
    React.SetStateAction<
      "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ" | undefined
    >
  >;
  setFinalExam: React.Dispatch<React.SetStateAction<QuizSummary | null>>;
}

export function useChapters({
  courseId,
  lessonId,
}: UseChaptersProps): UseChaptersReturn {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupérer quizType depuis l'URL
  const urlQuizType = searchParams.get("quizType") as
    | "SIMPLE_QUIZ"
    | "PHASE_QUIZ"
    | "FINAL_QUIZ"
    | undefined;

  // Initialiser quizType avec la valeur de l'URL si présente
  const [quizType, setQuizType] = useState<
    "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ" | undefined
  >(urlQuizType);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [finalExam, setFinalExam] = useState<QuizSummary | null>(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(
    undefined
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>();
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [fetchedCourseId, setFetchedCourseId] = useState<string | null>(null);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);
  const [learnerProgressStatus, setLearnerProgressStatus] = useState<ProgressStatus>("IN_PROGRESS");
  const [chaptersLoaded, setChaptersLoaded] = useState(false);

  // Fonction pour déterminer le type de quiz selon l'objet passé
  const determineQuizType = (
    lessonOrQuiz: any
  ): "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ" | undefined => {
    if (!quizType) {
      if (!lessonOrQuiz) return "SIMPLE_QUIZ";
      if (lessonOrQuiz.quizType === "FINAL_QUIZ" || lessonOrQuiz.isFinalQuiz)
        return "FINAL_QUIZ";
      if (
        lessonOrQuiz.quizType === "PHASE_QUIZ" ||
        lessonOrQuiz.isChapterQuiz
      )
        return "PHASE_QUIZ";
      if (lessonOrQuiz.quiz) {
        // Si c'est un objet chapitre avec quiz
        if (lessonOrQuiz.quiz.isFinalQuiz) return "FINAL_QUIZ";
        if (lessonOrQuiz.quiz.isChapterQuiz) return "PHASE_QUIZ";
      }
      return "SIMPLE_QUIZ";
    }
    return urlQuizType;
  };

  // Fonction pour vérifier l'accès à une leçon
  const checkAccess = async (
    lessonId: string
  ): Promise<{ hasAccess: boolean; lessonData?: Lesson }> => {    
    // Empêche les appels concurrents pour le même lessonId
    if (pendingLessonId === lessonId) {
      // Un appel est déjà en cours pour cette leçon
      return { hasAccess: false };
    }
    
    setPendingLessonId(lessonId);
    
    try {
      const lessonData = await fetchAccessToLessonById(lessonId);
      setPendingLessonId(null);
      return { hasAccess: true, lessonData };
    } catch (error) {
      console.error(`Access check error for lesson ${lessonId}:`, error);
      setPendingLessonId(null);
      return { hasAccess: false };
    }
  };

  // Charger les chapitres lorsque le courseId change
  useEffect(() => {
    const fetchChapters = async () => {
      if (!courseId) return;

      // Éviter de recharger les chapitres si déjà chargés pour le même courseId
      if (fetchedCourseId === courseId && chapters.length > 0) {
        return;
      }

      setIsLoadingChapters(true);
      setChaptersLoaded(false);

      try {
        const data = await getChaptersByCourseId(courseId);
        setChapters(data.chapters);
        setFinalExam(data.finalExam || null);
        setFetchedCourseId(courseId);
        setLearnerProgressStatus(data.learnerProgressStatus);

        // Initialiser les leçons complétées
        const completed: string[] = [];
        data.chapters.forEach((chapter) => {
          chapter.lessons?.forEach((lesson) => {
            if (lesson.isCompleted) {
              completed.push(lesson.id);
            }
          });
        });
        setCompletedLessons(completed);

        setChaptersLoaded(true);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "";
        toast.error(
          `Erreur lors du chargement des chapitres${
            errorMsg ? ` : ${errorMsg}` : ""
          }`
        );
      } finally {
        setIsLoadingChapters(false);
      }
    };

    if (courseId) {
      fetchChapters();
    }
  }, [courseId]);

  // Effet pour gérer le chargement de la leçon après que les chapitres soient chargés
  useEffect(() => {    
    if (!chaptersLoaded || !courseId) {
      return;
    }

    // Reset lesson error au début
    setLessonError(null);

    if (lessonId) {
      // Si lessonId est présent, charger cette leçon spécifique
      fetchLesson(lessonId);
    } else {
      // Si pas de lessonId, sélectionner automatiquement une leçon appropriée
      selectCurrentLesson();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaptersLoaded, lessonId, courseId, chapters.length]);

  // Fonction pour charger une leçon spécifique
  const fetchLesson = async (lessonId: string) => {
    setLessonLoading(true);
    setLessonError(null);

    // Vérifier que les chapitres sont chargés
    if (chapters.length === 0) {
      setLessonLoading(false);
      return;
    }

    // Déterminer le type de contenu sélectionné (leçon ou quiz)
    const allLessons = chapters.flatMap((ch) => ch.lessons || []);
    const foundLesson = allLessons.find((l) => l && l.id === lessonId);
    const foundQuiz = chapters.find(
      (ch) => ch.quiz && ch.quiz.id === lessonId
    )?.quiz;

    if (foundQuiz) {
      const type = determineQuizType(foundQuiz);
      setQuizType(type);
    } else if (foundLesson) {
      const type = determineQuizType(foundLesson);
      setQuizType(type);
    } else {
      setQuizType("SIMPLE_QUIZ");
    }

    // Vérifier l'accès pour toutes les leçons, même complétées (pour obtenir les données fraîches)
    try {
      const result = await checkAccess(lessonId);
      if (result.hasAccess && result.lessonData) {
        // S'assurer que la leçon est déverrouillée lorsqu'elle est sélectionnée
        const unlockedLessonData = {
          ...result.lessonData,
          isLocked: false, // Forcer le déverrouillage de la leçon
        };

        setCurrentLesson(unlockedLessonData);
      } else if (!result.hasAccess) {
        if (foundLesson) {
          setLessonError(
            `Vous n'avez pas accès à la vidéo: ${foundLesson.title}`
          );
        } else {
          setLessonError("Vous n'avez pas accès à cette vidéo.");
        }
      }
    } catch (e: unknown) {
      console.error('Erreur lors du chargement de la leçon:', e);
      setCurrentLesson(undefined);
      let errorMessage = "Erreur lors du chargement de la leçon.";
      if (
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        typeof (e as any).response === "object" &&
        (e as any).response !== null &&
        "status" in (e as any).response &&
        (e as any).response.status === 403
      ) {
        errorMessage = "Accès refusé à cette leçon.";
      }
      setLessonError(errorMessage);
    } finally {
      setLessonLoading(false);
    }
  };

  // Gestion de la sélection d'une leçon
  const handleLessonSelect = (lesson: Lesson) => {
    fetchLesson(lesson.id);
  };

  // Trouver une leçon appropriée basée sur l'état de verrouillage
  const findAppropriateLesson = (sortedChapters: Chapter[]) => {
    let targetChapter;
    let targetLesson;

    const chaptersWithMixedLessons = sortedChapters
      .filter((chapter) => chapter.lessons && chapter.lessons.length > 0)
      .filter((chapter) => {
        const hasLockedLesson =
          Array.isArray(chapter.lessons) &&
          chapter.lessons.some((lesson) => lesson.isLocked === true);
        const hasUnlockedLesson =
          Array.isArray(chapter.lessons) &&
          chapter.lessons.some((lesson) => lesson.isLocked === false);

        return hasLockedLesson && hasUnlockedLesson;
      });

    if (chaptersWithMixedLessons.length > 0) {
      targetChapter = chaptersWithMixedLessons[0];

      if (targetChapter.lessons && targetChapter.lessons.length > 0) {
        const unlockedLessons = targetChapter.lessons
          .filter((lesson) => !lesson.isLocked)
          .sort((a, b) => b.order - a.order);

        if (unlockedLessons.length > 0) {
          targetLesson = unlockedLessons[0];
        }
      }
    } else {
      const fullyUnlockedChapters = sortedChapters
        .filter((chapter) => chapter.lessons && chapter.lessons.length > 0)
        .filter(
          (chapter) =>
            Array.isArray(chapter.lessons) &&
            chapter.lessons.every((lesson) => lesson.isLocked === false)
        );

      const fullyLockedChapters = sortedChapters
        .filter((chapter) => chapter.lessons && chapter.lessons.length > 0)
        .filter(
          (chapter) =>
            Array.isArray(chapter.lessons) &&
            chapter.lessons.every((lesson) => lesson.isLocked === true)
        );

      if (fullyUnlockedChapters.length > 0 && fullyLockedChapters.length > 0) {
        targetLesson = handleMixedChaptersCase(
          fullyUnlockedChapters,
          fullyLockedChapters
        );
      } else if (fullyUnlockedChapters.length > 0) {
        // Si tous les chapitres sont déverrouillés, ne retourne aucune leçon
        const allChaptersUnlocked =
          fullyUnlockedChapters.length === sortedChapters.length;
        if (allChaptersUnlocked) {
          return null;
        }
        const lastUnlockedChapter = fullyUnlockedChapters.sort(
          (a, b) => b.order - a.order
        )[0];

        targetChapter = lastUnlockedChapter;

        if (targetChapter.lessons && targetChapter.lessons.length > 0) {
          targetLesson = [...targetChapter.lessons].sort(
            (a, b) => b.order - a.order
          )[0];
        }
      } else if (fullyLockedChapters.length > 0) {
        navigate("/unauthorized");
        return null;
      }
    }

    return targetLesson;
  };

  // Gérer le cas des chapitres mixtes (certains verrouillés, d'autres non)
  const handleMixedChaptersCase = (
    fullyUnlockedChapters: Chapter[],
    fullyLockedChapters: Chapter[]
  ) => {
    let highestUnlockedBeforeLocked = null;
    const lowestLockedOrder = Math.min(
      ...fullyLockedChapters.map((c) => c.order)
    );

    for (const unlockedChapter of fullyUnlockedChapters) {
      if (unlockedChapter.order < lowestLockedOrder) {
        if (
          !highestUnlockedBeforeLocked ||
          unlockedChapter.order > highestUnlockedBeforeLocked.order
        ) {
          highestUnlockedBeforeLocked = unlockedChapter;
        }
      }
    }

    if (
      highestUnlockedBeforeLocked &&
      highestUnlockedBeforeLocked.lessons &&
      highestUnlockedBeforeLocked.lessons.length > 0
    ) {
      return [...highestUnlockedBeforeLocked.lessons].sort(
        (a, b) => b.order - a.order
      )[0];
    }

    return null;
  };

  // Sélectionner la leçon appropriée et naviguer vers celle-ci
  const selectCurrentLesson = () => {
    if (!chapters || chapters.length === 0 || !courseId) return;

    // Si aucun lessonId fourni et finalExam existe
    if (!lessonId && finalExam) {
      if (!finalExam.isLocked && !finalExam.isCompleted) {
        // Naviguer vers le final quiz si unlocked et non complété
        setQuizType("FINAL_QUIZ");
        navigate(
          `/courses/${courseId}/quiz/${finalExam.id}?quizType=FINAL_QUIZ`,
          {
            replace: true,
          }
        );
        return;
      } else if (finalExam.isCompleted) {
        // Si le final quiz est complété, sélectionner la première leçon du premier chapitre
        const firstChapter = chapters[0];
        if (
          firstChapter &&
          firstChapter.lessons &&
          firstChapter.lessons.length > 0
        ) {
          const firstLesson = firstChapter.lessons[0];
          setQuizType(determineQuizType(firstLesson));
          checkAccess(firstLesson.id).then((result) => {
            if (result.hasAccess && result.lessonData) {
              setCurrentLesson(result.lessonData);
              navigate(`/courses/${courseId}/lessons/${firstLesson.id}`, {
                replace: true,
              });
            } else {
              setLessonError("Vous n'avez pas accès à cette vidéo.");
            }
          });
        }
        return;
      }
    }

    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

    // target quiz locked false :
    const targetChapter = sortedChapters.find(
      (chapter) => chapter.quiz && !chapter.quiz.isLocked
    );

    if (targetChapter && targetChapter.quiz) {
      const type = determineQuizType(targetChapter.quiz);
      setQuizType(type);
      navigate(
        `/courses/${courseId}/quiz/${targetChapter.quiz.id}?quizType=${type}`,
        {
          replace: true,
        }
      );
      return;
    }

    // Appel pertinent de getLastUncompletedLesson
    const lastUncompletedLesson = getLastUncompletedLesson(sortedChapters);
    if (lastUncompletedLesson) {
      setQuizType(determineQuizType(lastUncompletedLesson));
      checkAccess(lastUncompletedLesson.id).then((result) => {
        if (result.hasAccess && result.lessonData) {
          setCurrentLesson(result.lessonData);
          navigate(`/courses/${courseId}/lessons/${lastUncompletedLesson.id}`, {
            replace: true,
          });
        } else {
          setLessonError("Vous n'avez pas accès à cette vidéo.");
        }
      });
      return;
    }

    const targetLesson = findAppropriateLesson(sortedChapters);

    if (targetLesson) {
      setQuizType(determineQuizType(targetLesson));
      checkAccess(targetLesson.id).then((result) => {
        if (result.hasAccess && result.lessonData) {
          setCurrentLesson(result.lessonData);
          navigate(`/courses/${courseId}/lessons/${targetLesson.id}`, {
            replace: true,
          });
        } else {
          setLessonError("Vous n'avez pas accès à cette vidéo.");
        }
      });
    }
  };

  function getLastUncompletedLesson(chapters: Chapter[]) {
    // Trouver le chapitre où toutes les leçons sont unlocked
    const unlockedChapter = chapters.find(
      (chap) =>
        Array.isArray(chap.lessons) &&
        chap.lessons.every((lesson) => !lesson.isLocked)
    );
    if (!unlockedChapter) return null;

    // Filtrer les leçons non complétées
    const uncompletedLessons =
      unlockedChapter.lessons?.filter((lesson) => !lesson.isCompleted) ?? [];
    if (uncompletedLessons.length === 0) return null;

    // Prendre la dernière leçon non complétée
    return uncompletedLessons[uncompletedLessons.length - 1];
  }

  return {
    chapters,
    finalExam,
    setChapters,
    isLoadingChapters,
    currentLesson,
    setCurrentLesson,
    lessonLoading,
    lessonError,
    fetchLesson,
    handleLessonSelect,
    selectCurrentLesson,
    completedLessons,
    setCompletedLessons,
    quizType,
    setQuizType,
    setFinalExam,
    learnerProgressStatus,
    setLearnerProgressStatus,
  };
}