import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ChevronDown,
  Lock,
  Eye,
  FileText,
  Clock,
} from "lucide-react";
import {
  getCourseContent,
  type CourseContentDTO,
  type ChapterContentDTO,
  type LessonContentDTO,
} from "@/services/course.service";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CourseContentTreeProps {
  courseId: string;
}

const CourseContentTree = ({ courseId }: CourseContentTreeProps) => {
  const { t } = useTranslation();
  
  // États pour gérer l'expansion des phases et chapitres
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  
  const [selectedVideo, setSelectedVideo] = useState<LessonContentDTO | null>(
    null
  );

  const { data, isLoading, error } = useQuery<CourseContentDTO>({
    queryKey: ["courseContent", courseId],
    queryFn: () => getCourseContent(courseId),
  });

  // Fonctions pour toggle l'expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };
  
  const toggleChapter = (key: string) => {
    setExpandedChapters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLessonClick = (lesson: LessonContentDTO) => {
    if (!data) return;

    if (!data.hasActiveSubscription) {
      return; // Do nothing if no active subscription
    }

    // Open video modal if user has active subscription
    setSelectedVideo(lesson);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
            <div className="ml-6 space-y-2">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("courses.error.fetchContent") ||
            "Failed to load course content."}
        </AlertDescription>
      </Alert>
    );
  }

  const isLocked = !data.hasActiveSubscription;
  
  console.log('CourseContent - hasActiveSubscription:', data.hasActiveSubscription, 'isLocked:', isLocked);

  return (
    <>
      <div className="space-y-2">
        {data.chapters.length === 0 ? (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              {t("courses.noContent") || "No content available yet."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {data.chapters.map((phase: ChapterContentDTO, phaseIndex: number) => {
              // Regrouper les lessons par miniChapter
              const chaptersGrouped = phase.lessons?.reduce((acc: Record<string, LessonContentDTO[]>, lesson: LessonContentDTO) => {
                const miniChapter = lesson.miniChapter || "Sans chapitre";
                if (!acc[miniChapter]) {
                  acc[miniChapter] = [];
                }
                acc[miniChapter].push(lesson);
                return acc;
              }, {}) || {};

              console.log('Phase:', phase.title, 'Lessons count:', phase.lessons?.length, 'Chapters grouped:', Object.keys(chaptersGrouped));
              
              // Ouvrir la première phase par défaut
              const isPhaseExpanded = expandedPhases[phase.chapterId] ?? (phaseIndex === 0);

              return (
                <div key={phase.chapterId} className="border rounded-lg overflow-hidden">
                  {/* Phase Header - Cliquable */}
                  <div 
                    className="bg-gradient-to-r from-primary/5 to-orange-50/50 px-4 py-3 border-b cursor-pointer hover:from-primary/10 hover:to-orange-50 transition-colors"
                    onClick={() => togglePhase(phase.chapterId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPhaseExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <span className="font-bold text-primary text-sm">
                          Phase {phaseIndex + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {phase.title}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {Object.keys(chaptersGrouped).length} chapitre{Object.keys(chaptersGrouped).length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  {/* Chapitres dans la phase - Affichés uniquement si la phase est ouverte */}
                  {isPhaseExpanded && (
                    <div className="divide-y">
                      {Object.entries(chaptersGrouped).map(([miniChapter, lessons]: [string, LessonContentDTO[]], chapterIndex) => {
                        const chapterKey = `${phase.chapterId}-${miniChapter}`;
                        const isChapterExpanded = expandedChapters[chapterKey] ?? true;

                        return (
                          <div key={chapterKey} className="bg-white">
                            {/* Chapitre Header - Cliquable */}
                            <div 
                              className="px-4 py-2.5 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
                              onClick={() => toggleChapter(chapterKey)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isChapterExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                                  )}
                                  <span className="text-xs font-semibold text-gray-600">
                                    Chapitre {chapterIndex + 1}:
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">
                                    {miniChapter}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {lessons.length} vidéo{lessons.length > 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </div>

                            {/* Vidéos du chapitre - Affichées uniquement si le chapitre est ouvert */}
                            {isChapterExpanded && (
                              <div className="px-4 py-2 space-y-2">
                                {console.log('Chapter:', miniChapter, 'isLocked:', isLocked, 'Lessons:', lessons.length)}
                                {lessons
                                  .sort((a, b) => a.orderIndex - b.orderIndex)
                                  .map((lesson: LessonContentDTO, lessonIndex: number) => (
                                    <div
                                      key={lesson.lessonId}
                                      className={`flex items-center justify-between gap-3 p-2 rounded-md ${
                                        isLocked 
                                          ? 'bg-gray-50/50 opacity-60' 
                                          : 'hover:bg-gray-50 transition-colors group'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${
                                          isLocked 
                                            ? 'bg-gray-300 text-gray-500' 
                                            : 'bg-primary/10 text-primary'
                                        }`}>
                                          {lessonIndex + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm font-medium truncate ${
                                            isLocked ? 'text-gray-500' : 'text-gray-800'
                                          }`}>
                                            {lesson.title}
                                          </p>
                                          {lesson.duration && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                              <Clock className={`w-3 h-3 ${isLocked ? 'text-gray-400' : 'text-gray-400'}`} />
                                              <span className={`text-xs ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDuration(lesson.duration)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {/* Bouton Eye pour visualiser ou Lock si verrouillé */}
                                      {lesson.videoUrl && (
                                        isLocked ? (
                                          <div className="p-2 rounded-md bg-gray-200 text-gray-500" title="Contenu verrouillé">
                                            <Lock className="w-4 h-4" />
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e: React.MouseEvent) => {
                                              e.stopPropagation();
                                              handleLessonClick(lesson);
                                            }}
                                            className="p-2 rounded-md bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            title="Visualiser la vidéo"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                        )
                                      )}
                                    </div>
                                  ))
                                }
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo?.videoUrl && (
            <div className="aspect-video">
              <video
                controls
                className="w-full h-full rounded-lg"
                src={selectedVideo.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseContentTree;
