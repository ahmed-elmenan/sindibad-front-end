import React, { useEffect, useState, useRef } from "react";
import { useDrag } from "react-dnd";
import {
  GripVertical,
  Eye,
  Edit,
  Trash2,
  Video,
  Clock,
  MoreVertical,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ItemTypes } from "@/types/PhaseManager";
import type { UnifiedVideo } from "@/types/PhaseManager";
import type { Skill } from "@/types/Skill";
import { createPortal } from "react-dom";
import VideoPreviewModal from "@/components/admin/VideoPreviewModal";
import VideoEditModal from "@/components/admin/VideoEditModal";
import SkillsModal from "@/components/admin/SkillsModal";
import QuizManagementModal from "@/components/admin/QuizManagementModal";
import { formatFileSize, formatDurationSimple } from "@/utils/dateUtils";
import { deleteLesson } from "@/services/lesson.service";
import { toast } from "@/components/ui/sonner";
import { getPresignedUrlForVideo } from "@/services/chapter.service";
import { quizManagementService } from "@/services/quizManagement.service";
import type { QuizDetailResponse } from "@/types/QuizManagement";

interface DraggableVideoPhaseProps {
  video: UnifiedVideo;
  chapterId: string;
  phaseId: string;
  onEdit: (video: UnifiedVideo) => void;
  onDelete: (videoId: string) => void;
  onUpdate: (videoId: string, updates: Partial<UnifiedVideo>) => void;
  existingSkills: Skill[];
}

const DraggableVideoPhase: React.FC<DraggableVideoPhaseProps> = ({
  video,
  chapterId,
  phaseId,
  onDelete,
  onUpdate,
  existingSkills,
}) => {
  const [thumbnail, setThumbnail] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState<QuizDetailResponse | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [showSkillsPopover, setShowSkillsPopover] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const countRef = useRef<HTMLDivElement | null>(null);

  // Generate thumbnail when video is loaded
  useEffect(() => {
    const generateThumbnail = async () => {
      // Priorité 1: Utiliser la miniature depuis S3 (déjà générée par le backend)
      if (video.thumbnailUrl) {
        setThumbnail(video.thumbnailUrl);
        return;
      }

      // Priorité 2: Pour les nouveaux uploads avec file - générer temporairement
      if (video.file) {
        const url = URL.createObjectURL(video.file);
        const videoElement = document.createElement("video");
        videoElement.src = url;
        videoElement.currentTime = 1;

        videoElement.onloadeddata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
            setThumbnail(thumbnailUrl);
          }
          URL.revokeObjectURL(url);
        };

        videoElement.onerror = (e) => {
          console.error(`  Erreur chargement vidéo File: ${video.title}`, e);
          setThumbnail("");
        };
      }
      // Priorité 3: Pour les vidéos existantes sans miniature - Afficher icône
      else if (video.videoUrl) {
        setThumbnail(""); // Will show video icon placeholder
      } else {
        console.warn(`⚠️ Aucune source vidéo disponible pour: ${video.title}`);
        setThumbnail("");
      }
    };

    generateThumbnail();
  }, [video.file, video.videoUrl, video.thumbnailUrl, video.title]);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.VIDEO,
      item: {
        video,
        fromChapterId: chapterId,
        fromPhaseId: phaseId,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [video, chapterId, phaseId],
  );

  const handlePreview = async () => {
    setDropdownOpen(false);

    try {
      if (video.file) {
        // Pour les nouveaux fichiers (pas encore uploadés), créer URL temporaire
        const url = URL.createObjectURL(video.file);
        setVideoUrl(url);
        setShowPreview(true);
      } else if (video.videoUrl) {
        // Pour les vidéos déjà uploadées sur S3, récupérer l'URL présignée depuis le backend
        const presignedUrl = await getPresignedUrlForVideo({
          videoUrl: video.videoUrl,
        });

        if (!presignedUrl) {
          console.error("  Presigned URL is null or empty");
          toast.error({
            title: "Erreur",
            description: "Impossible de générer l'URL de prévisualisation",
          });
          return;
        }
        setVideoUrl(presignedUrl);
        setShowPreview(true);
      } else {
        console.error(
          "Aucune source vidéo disponible pour la prévisualisation",
        );
        toast.error({
          title: "Erreur",
          description: "Aucune source vidéo disponible",
        });
      }
    } catch (error) {
      console.error("  Error fetching presigned URL:", error);
      toast.error({
        title: "Erreur",
        description: "Impossible de charger la vidéo",
      });
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl("");
    }
  };

  const handleEditInfo = () => {
    setDropdownOpen(false);
    setShowEditModal(true);
  };

  const handleEditSkills = () => {
    setDropdownOpen(false);
    setShowSkillsModal(true);
  };

  const handleManageQuiz = async () => {
    setDropdownOpen(false);
    
    if (!video.originalLessonId) {
      toast.error({
        title: "Erreur",
        description: "La vidéo doit être uploadée avant de créer un quiz",
      });
      return;
    }

    // Open modal immediately for better UX and show skeletons while fetching
    setExistingQuiz(null);
    setShowQuizModal(true);
    setIsLoadingQuiz(true);

    quizManagementService.getQuizByLessonId(video.originalLessonId)
      .then((quiz) => {
        setExistingQuiz(quiz);
      })
      .catch((error) => {
        console.error("Error loading quiz:", error);
        toast.error({
          title: "Erreur",
          description: "Impossible de charger les informations du quiz",
        });
      })
      .finally(() => {
        setIsLoadingQuiz(false);
      });
  };

  const handleQuizSuccess = () => {
    // Success toast is shown by the QuizManagementModal itself.
    // Avoid showing a duplicate generic success toast here.
    // Keep this callback for future local updates if needed.
    return;
  };

  const handleDelete = () => {
    setDropdownOpen(false);

    // Si la vidéo est déjà uploadée (a un originalLessonId), afficher modal de confirmation
    if (video.originalLessonId) {
      setShowDeleteModal(true);
    } else {
      // Vidéo nouvelle (non uploadée), suppression immédiate
      onDelete(video.id!);
    }
  };

  const handleConfirmDelete = async () => {
    if (!video.originalLessonId) return;

    setIsDeleting(true);
    try {
      // Appel API pour supprimer la leçon (qui supprimera aussi la vidéo et thumbnail dans S3)
      await deleteLesson(video.originalLessonId);

      // Fermer le modal et appeler le callback de suppression
      setShowDeleteModal(false);
      onDelete(video.id!);

      toast.success({
        title: "Vidéo supprimée",
        description: `La vidéo "${video.title}" a été supprimée avec succès`,
      });
    } catch (error) {
      console.error("  Erreur suppression:", error);
      toast.error({
        title: "Erreur de suppression",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer la vidéo",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = (updates: Partial<UnifiedVideo>) => {
    onUpdate(video.id!, updates);
  };

  const handleSaveSkills = (skills: Skill[]) => {
    onUpdate(video.id!, { skills });
  };

  useEffect(() => {
    const onScroll = () => {
      if (showSkillsPopover && countRef.current) {
        setAnchorRect(countRef.current.getBoundingClientRect());
      }
    };
    const onResize = () => setShowSkillsPopover(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [showSkillsPopover]);

  return (
    <>
      <div
        ref={drag as any}
        className={`
          group relative transition-all duration-300 ease-in-out
          ${
            isDragging
              ? "opacity-50 rotate-1 shadow-2xl"
              : "opacity-100 shadow-sm hover:shadow-md"
          }
          cursor-move
        `}
      >
        <Card
          className={`
          ${
            video.isNew
              ? "bg-gradient-to-r from-orange-50/80 via-yellow-50/50 to-white border-2 border-orange-300/50"
              : video.isMoved
                ? "bg-gradient-to-r from-orange-50/50 to-white border-2 border-orange-200/40"
                : "bg-white border-2 border-gray-200/60"
          }
          ${!isDragging ? "hover:border-primary/30" : ""}
          rounded-xl overflow-hidden
          transition-all duration-300
        `}
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              {/* Thumbnail */}
              <div className="relative w-24 sm:w-28 md:w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                                   className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
                    <Video className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-400 animate-pulse" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-1 right-1">
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-black/70 backdrop-blur-sm text-white px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-white/20">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">
                        {formatDurationSimple(video.duration)}
                      </span>
                      <span className="sm:hidden">
                        {Math.floor(video.duration / 60)}:
                        {(video.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Drag Handle */}
                <div className="absolute top-1 left-1">
                  <div className="p-0.5 sm:p-1 rounded bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm transition-all duration-300 group-hover:bg-white/30">
                    <GripVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white drop-shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                {/* Title and Actions */}
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 line-clamp-1">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-primary/10 hover:to-primary/20 hover:shadow-sm hover:scale-105 transition-all duration-300 border border-gray-300/50 flex-shrink-0"
                                       className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-primary/10 hover:to-primary/20 hover:shadow-sm transition-all duration-300 border border-gray-300/50 flex-shrink-0"
                      >
                        <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-700" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 sm:w-44 rounded-lg shadow-lg border border-gray-200 bg-white"
                    >
                      <DropdownMenuItem
                        onClick={handlePreview}
                        className="rounded-md hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer transition-colors text-xs font-medium text-gray-900"
                      >
                        <Eye className="mr-2 h-4 w-4 text-gray-900" />
                        Prévisualiser
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleEditInfo}
                        className="rounded-md hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer transition-colors text-xs font-medium text-gray-900"
                      >
                        <Edit className="mr-2 h-4 w-4 text-gray-900" />
                        Modifier Info
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleEditSkills}
                        className="rounded-md hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer transition-colors text-xs font-medium text-gray-900"
                      >
                        <Edit className="mr-2 h-4 w-4 text-gray-900" />
                        Modifier Skills
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleManageQuiz}
                        disabled={isLoadingQuiz || !video.originalLessonId}
                        className="rounded-md hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900 cursor-pointer transition-colors text-xs font-medium text-gray-900"
                      >
                        <ClipboardList className="mr-2 h-4 w-4 text-gray-900" />
                        {isLoadingQuiz ? "Chargement..." : "Gérer le quiz"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="rounded-md hover:bg-gray-100 data-[highlighted]:bg-gray-100 data-[highlighted]:text-red-600 cursor-pointer transition-colors text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600">
                  {/* Order */}
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Ordre:</span>
                    <span className="font-semibold text-gray-900">{video.order || video.videoNumber}</span>
                  </span>
                  
                  <span className="text-gray-400">•</span>

                  {/* File Size */}
                  {video.fileSize && (
                    <>
                      <span className="font-semibold text-gray-900">{formatFileSize(video.fileSize)}</span>
                      <span className="text-gray-400">•</span>
                    </>
                  )}

                  {/* Skills Count with hover list (rendered in portal to avoid clipping) */}
                  {video.skills && video.skills.length > 0 && (
                    <>
                      <div
                        ref={countRef as any}
                        onMouseEnter={() => {
                          if (countRef.current) {
                            setAnchorRect(countRef.current.getBoundingClientRect());
                            setShowSkillsPopover(true);
                          }
                        }}
                        onMouseLeave={() => setShowSkillsPopover(false)}
                        className="inline-flex items-center"
                      >
                        <span className="font-semibold text-primary cursor-default">
                          {video.skills.length} {video.skills.length === 1 ? 'compétence' : 'compétences'}
                        </span>
                      </div>

                      {showSkillsPopover && anchorRect && createPortal(
                        <div
                          style={{
                            position: 'absolute',
                            top: anchorRect.bottom + window.scrollY + 6,
                            left: Math.max(8, anchorRect.right + window.scrollX - 224),
                            width: 224,
                            maxHeight: 224,
                            overflow: 'auto',
                          }}
                          className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-[9999]"
                          onMouseEnter={() => setShowSkillsPopover(true)}
                          onMouseLeave={() => setShowSkillsPopover(false)}
                        >
                          <ul className="space-y-1">
                            {video.skills.map((s) => (
                              <li key={s.id} className="text-sm text-gray-700 px-2 py-1 hover:bg-gray-50 rounded">
                                {s.name}
                              </li>
                            ))}
                          </ul>
                        </div>,
                        document.body
                      )}
                    </>
                  )}

                  {/* Status Indicators */}
                  {video.isNew && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-orange-600 font-semibold">Nouveau</span>
                    </>
                  )}
                  {video.isMoved && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-orange-600 font-semibold">Déplacé</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Video Preview Modal */}
      {showPreview &&
        createPortal(
          <VideoPreviewModal
            isOpen={showPreview}
            onClose={handleClosePreview}
            videoUrl={videoUrl}
            videoTitle={video.title}
          />,
          document.body,
        )}

      {/* Video Edit Modal */}
      {showEditModal &&
        createPortal(
          <VideoEditModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            video={video}
            onSave={handleSaveEdit}
          />,
          document.body,
        )}

      {/* Skills Modal */}
      {showSkillsModal &&
        createPortal(
          <SkillsModal
            open={showSkillsModal}
            onClose={() => setShowSkillsModal(false)}
            initialSkills={video.skills || []}
            existingSkills={existingSkills}
            onSave={handleSaveSkills}
          />,
          document.body,
        )}

      {/* Quiz Management Modal */}
      {showQuizModal &&
        video.originalLessonId &&
        createPortal(
          <QuizManagementModal
            open={showQuizModal}
            onClose={() => {
              setShowQuizModal(false);
              setExistingQuiz(null);
            }}
            quizType="SIMPLE_QUIZ"
            resourceId={video.originalLessonId}
            resourceTitle={video.title}
            availableSkills={video.skills || []}
            existingQuiz={existingQuiz}
            onSuccess={handleQuizSuccess}
            loading={isLoadingQuiz}
          />,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Confirmer la suppression
                </h3>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-2">
                      Êtes-vous sûr de vouloir supprimer cette vidéo ?
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {video.title}
                      </p>
                      {video.duration && (
                        <p className="text-xs text-gray-600">
                          Durée: {formatDurationSimple(video.duration)}
                        </p>
                      )}
                      {video.fileSize && (
                        <p className="text-xs text-gray-600">
                          Taille: {formatFileSize(video.fileSize)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>
                      Cette action est irréversible. La vidéo, la miniature et
                      toutes les données associées seront définitivement
                      supprimées de S3 et de la base de données.
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer définitivement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default DraggableVideoPhase;
