import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import {
  FileVideo,
  GripVertical,
  Eye,
  Edit,
  Trash2,
  Video,
  Clock,
  Folder,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemTypes } from "@/types/PhaseManager";
import type { UnifiedVideo } from "@/types/PhaseManager";
import type { Skill } from "@/types/Skill";
import { createPortal } from "react-dom";
import VideoPreviewModal from "@/components/admin/VideoPreviewModal";
import VideoEditModal from "@/components/admin/VideoEditModal";
import SkillsModal from "@/components/admin/SkillsModal";
import { formatFileSize, formatDurationSimple } from "@/utils/dateUtils";
import { deleteLesson } from "@/services/lesson.service";
import { toast } from "@/components/ui/sonner";
import { getPresignedUrlForVideo } from "@/services/chapter.service";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <>
      <div
        ref={drag as any}
        className={`
          group relative transition-all duration-300 ease-in-out
          ${
            isDragging
              ? "opacity-50 scale-95 rotate-1 shadow-2xl"
              : "opacity-100 scale-100 hover:scale-[1.005] shadow-sm hover:shadow-md"
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
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {/* Order Badge */}
                  <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-muted/20 to-secondary/20 text-muted px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border border-muted/30 shadow-sm">
                    <Folder className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>Order: {video.order || video.videoNumber}</span>
                  </span>

                  {/* Status Badges */}
                  {video.isNew && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white px-1.5 sm:px-2 py-0.5 rounded-lg font-bold shadow-sm animate-pulse ring-1 ring-white/30">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping absolute"></div>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                      Nouveau
                    </span>
                  )}
                  {video.isMoved && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs bg-gradient-to-r from-orange-600 to-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-lg font-bold shadow-sm ring-1 ring-white/20">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full"></div>
                      MOVED
                    </span>
                  )}

                  {/* File Info */}
                  <div className="flex items-center gap-0.5 sm:gap-1 text-gray-600 bg-gray-100/80 px-1.5 sm:px-2 py-0.5 rounded-lg font-medium border border-gray-200/50 text-[10px] sm:text-xs">
                    <FileVideo className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>
                      {video.videoUrl
                        ?.split(".")
                        .pop()
                        ?.split("?")[0]
                        ?.toUpperCase() || "MP4"}
                    </span>
                  </div>
                  {video.fileSize && (
                    <div className="flex items-center text-gray-600 bg-gray-100/80 px-1.5 sm:px-2 py-0.5 rounded-lg font-medium border border-gray-200/50 text-[10px] sm:text-xs">
                      <span>{formatFileSize(video.fileSize)}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {video.skills && video.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {video.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border border-primary/20 shadow-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {video.skills.length > 2 && (
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border border-gray-200">
                        +{video.skills.length - 2}
                      </span>
                    )}
                  </div>
                )}
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
