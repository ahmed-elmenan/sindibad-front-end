import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "react-dnd";
import {
  Video,
  Move,
  Edit,
  Check,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemTypes } from "@/types/ChapterManager";
import type { DraggableVideoProps } from "@/types/ChapterManager";
import { formatDurationSimple } from "@/utils/dateUtils";
import { toast } from "sonner";
import VideoPreviewModal from "./VideoPreviewModal";
import { getPresignedUrlForVideo } from "@/services/chapter.service";

const DraggableVideo: React.FC<DraggableVideoProps> = ({
  video,
  chapterId,
  chapterIndex,
  videoIndex,
  isChapterNew,
  onEdit,
  onSave,
  onDelete,
  onUpdate,
  isNew = false,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  // Handle preview opening for both new and existing videos
  const handleOpenPreview = async () => {
    // For new videos with files
    if (video.file) {
      const url = URL.createObjectURL(video.file);
      setVideoUrl(url);
      setIsPreviewModalOpen(true);
      return;
    }

    // For existing videos, fetch presigned URL from backend
    if (video.originalLessonId && !video.file) {
      setIsLoadingVideo(true);
      try {
        console.log("Fetching presigned URL for video:", video.videoUrl);

        if (video.videoUrl) {
          // Call backend to get presigned URL
          const presignedUrl = await getPresignedUrlForVideo({
            videoUrl: video.videoUrl,
          });
          setVideoUrl(presignedUrl);
          setIsPreviewModalOpen(true);
        } else {
          toast.error("Vidéo non disponible", {
            description: "L'URL de la vidéo n'est pas disponible",
          });
        }
      } catch (error) {
        console.error("Error loading video:", error);
        toast.error("Erreur de chargement", {
          description:
            "Impossible de charger la vidéo. Vérifiez vos permissions.",
        });
      } finally {
        setIsLoadingVideo(false);
      }
    }
  };

  // Handle modal close
  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
    // Small delay to ensure modal cleanup
    setTimeout(() => {
      if (videoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
    }, 300);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (videoUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Generate thumbnail for new video files
  React.useEffect(() => {
    if (video.file) {
      const generateThumbnail = async () => {
        try {
          const videoElement = document.createElement("video");
          const objectUrl = URL.createObjectURL(video.file!);
          videoElement.src = objectUrl;
          videoElement.crossOrigin = "anonymous";
          videoElement.currentTime = 1; // Capture at 1 second

          videoElement.addEventListener("loadeddata", () => {
            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
              setThumbnail(thumbnailUrl);
            }
            URL.revokeObjectURL(objectUrl);
          });
        } catch (error) {
          console.error("Error generating thumbnail:", error);
        }
      };
      generateThumbnail();
    }
  }, [video.file]);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.VIDEO,
      item: {
        id: video.id || `temp-${Date.now()}`,
        chapterId: chapterId || "",
        video: {
          ...video,
          sourceChapterType: isChapterNew ? "new" : "existing",
        },
        chapterIndex: chapterIndex || 0,
        videoIndex: videoIndex || 0,
        originalLessonId: video.originalLessonId,
        originalChapterId: video.originalChapterId || chapterId,
        isFromNewChapter: isChapterNew,
        isNewVideo: video.isNew || isNew,
        sourceChapterIsNew: isChapterNew,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      // Disable dragging when preview modal is open
      canDrag: () => !isPreviewModalOpen,
    }),
    [
      video,
      chapterId,
      chapterIndex,
      videoIndex,
      isChapterNew,
      isNew,
      isPreviewModalOpen,
    ]
  );

  return (
    <>
      <div
        ref={drag as any}
        className={`
      flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 group cursor-move border
      ${
        isDragging
          ? "opacity-50 scale-[0.97] shadow-2xl rotate-1 border-primary/50"
          : "shadow-sm hover:shadow-lg border-gray-200/50"
      }
      ${
        isNew || video.isNew
          ? "bg-gradient-to-br from-orange-50/50 via-white to-yellow-50/30 border-orange-200/30"
          : "bg-white hover:bg-gradient-to-br hover:from-gray-50/50 hover:to-white"
      }
      ${
        video.isMoved
          ? "bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/20 border-orange-300/40"
          : ""
      }
      ${video.isEditing ? "ring-2 ring-primary/30 border-primary/40 shadow-lg" : ""}
      `}
      >
        <div className="flex flex-col items-center gap-2.5">
          <div
            className={`
        relative w-20 aspect-square rounded-xl shadow-md transition-all duration-300 overflow-hidden group-hover:shadow-lg
        ${
          isNew || video.isNew
            ? "ring-2 ring-primary/20"
            : video.isMoved
            ? "ring-2 ring-orange-300/40"
            : "ring-1 ring-gray-200/50"
        }
      `}
          >
            {thumbnail ? (
              <>
                <img
                  src={thumbnail}
                  alt="Video thumbnail"
                  className="absolute inset-0 w-full h-full min-h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </>
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isNew || video.isNew
                  ? "bg-gradient-to-br from-primary via-primary/90 to-muted"
                  : video.isMoved
                  ? "bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500"
                  : "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600"
              }`}>
                <Video className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            )}
          </div>
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
            ${isDragging 
              ? "bg-primary/10 scale-110" 
              : "bg-gray-100/50 group-hover:bg-primary/5 group-hover:scale-105"
            }
          `}>
            <Move
              className={`
            h-4 w-4 transition-all duration-300
            ${
              isDragging
                ? "text-primary animate-pulse"
                : "text-gray-400 group-hover:text-primary/70"
            }
          `}
            />
          </div>
        </div>

        {video.isEditing ? (
          <div className="flex-1 space-y-4 bg-gradient-to-br from-white via-gray-50/30 to-white p-5 rounded-xl shadow-sm border border-gray-200/50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Titre de la Vidéo
              </label>
              <Input
                defaultValue={video.title || ""}
                placeholder="Entrez le titre de la vidéo..."
                onChange={(e) => onUpdate("title", e.target.value)}
                className="
          border-gray-300/60
          focus:border-primary 
          focus:ring-2 
          focus:ring-primary/20 
          transition-all 
          duration-200 
          placeholder:text-gray-400/80
          text-sm
          font-medium
          bg-white
          shadow-sm
          hover:border-gray-400
          hover:shadow
          rounded-lg
          h-11
          "
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                Description
              </label>
              <Textarea
                defaultValue={video.description || ""}
                placeholder="Décrivez le contenu de cette vidéo..."
                onChange={(e) => onUpdate("description", e.target.value)}
                rows={3}
                className="
          border-gray-300/60
          focus:border-primary 
          focus:ring-2 
          focus:ring-primary/20 
          transition-all 
          duration-200 
          placeholder:text-gray-400/80
          text-sm
          bg-white
          shadow-sm
          hover:border-gray-400
          hover:shadow
          resize-none
          rounded-lg
          "
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-semibold text-gray-900 text-base leading-tight truncate flex-1">
                {video.title || video.name || "Vidéo sans titre"}
              </h4>
              <div className="flex gap-1.5 flex-shrink-0">
                {(isNew || video.isNew) && (
                  <span
                    className="
            inline-flex items-center gap-1.5 text-xs 
            bg-gradient-to-r from-primary to-muted 
            text-white px-3 py-1.5 rounded-full 
            font-bold shadow-sm
            animate-pulse
            ring-2 ring-primary/20
          "
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    NOUVEAU
                  </span>
                )}
                {video.isMoved && (
                  <span
                    className="
            inline-flex items-center gap-1.5 text-xs 
            bg-gradient-to-r from-orange-400 to-amber-500 
            text-white px-3 py-1.5 rounded-full 
            font-bold shadow-sm
            ring-2 ring-orange-200/50
          "
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    DÉPLACÉ
                  </span>
                )}
              </div>
            </div>
            {video.name && video.name !== video.title && (
              <p className="text-xs text-gray-500 font-mono bg-gray-100/50 px-2 py-1 rounded-md inline-block mb-2">
                {video.name}
              </p>
            )}
            {video.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                {video.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {video.duration && (
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm border border-green-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {formatDurationSimple(video.duration)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-muted/10 text-primary px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Position #{video.order || 0}
              </span>
              {video.isMoved && (
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm border border-orange-200/50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  De chapitre{" "}
                  {video.sourceChapterType === "new" ? "nouveau" : "original"}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 transition-all duration-200">
          {video.isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="
              bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
              text-white border-0 shadow-md hover:shadow-lg
              transition-all duration-200 font-semibold px-4 py-2 rounded-xl
              ring-2 ring-green-200/50 hover:ring-green-300/50
            "
            >
              <Check className="h-4 w-4 mr-1.5" />
              <span>Enregistrer</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="
                  h-9 w-9 p-0 rounded-xl
                  bg-gray-100/80 hover:bg-gray-200
                  transition-all duration-200
                  shadow-sm hover:shadow-md
                  border border-gray-200/50
                "
                  title="Actions"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-gray-200/50">
                {(video.file || video.originalLessonId) && (
                  <DropdownMenuItem
                    onClick={handleOpenPreview}
                    disabled={isLoadingVideo}
                    className="cursor-pointer rounded-lg gap-3 py-2.5 font-medium"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">{isLoadingVideo ? "Chargement..." : "Aperçu"}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer rounded-lg gap-3 py-2.5 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Edit className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Modifier</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg gap-3 py-2.5 font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <span>Supprimer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {/* Video Preview Modal - Rendered in a portal to prevent DOM hierarchy issues */}
      {isPreviewModalOpen &&
        typeof document !== "undefined" &&
        document.body &&
        createPortal(
          <VideoPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={handleClosePreview}
            videoUrl={videoUrl}
            videoTitle={video.title || video.name || "Aperçu vidéo"}
          />,
          document.body
        )}
    </>
  );
};

export default DraggableVideo;
