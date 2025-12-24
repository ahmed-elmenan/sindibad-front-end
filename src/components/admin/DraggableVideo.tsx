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
      flex items-start gap-4 p-4 rounded-xl transition-all duration-300 group cursor-move
      ${
        isDragging
          ? "opacity-60 scale-[0.98] shadow-2xl rotate-1"
          : "shadow-sm hover:shadow-md"
      }
      ${
        isNew || video.isNew
          ? "bg-gradient-to-r from-secondary/10 to-primary/10 shadow-primary/20"
          : "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white"
      }
      ${
        video.isMoved
          ? "bg-gradient-to-r from-orange-50 to-amber-50 shadow-orange-100/50"
          : ""
      }
      ${video.isEditing ? "ring-2 ring-primary/20" : ""}
      `}
      >
        <div className="flex flex-col items-center gap-2 pt-1">
          <div
            className={`
        w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all duration-200
        ${
          isNew || video.isNew
            ? "bg-gradient-to-br from-primary to-muted shadow-primary/30"
            : video.isMoved
            ? "bg-gradient-to-br from-muted to-secondary shadow-muted/30"
            : "bg-gradient-to-br from-primary to-muted shadow-primary/30"
        }
      `}
          >
            <Video className="h-5 w-5 text-white" />
          </div>
          <Move
            className={`
        h-4 w-4 transition-all duration-200
        ${
          isDragging
            ? "text-primary"
            : "text-gray-400 group-hover:text-gray-600"
        }
      `}
          />
        </div>

        {video.isEditing ? (
          <div className="flex-1 space-y-3 bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg shadow-sm">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Video Title
              </label>
              <Input
                defaultValue={video.title || ""}
                placeholder="Enter video title..."
                onChange={(e) => onUpdate("title", e.target.value)}
                className="
          border-gray-300 
          focus:border-primary 
          focus:ring-2 
          focus:ring-primary/20 
          transition-all 
          duration-200 
          placeholder:text-gray-400
          text-sm
          font-medium
          bg-white
          shadow-sm
          hover:border-gray-400
          "
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Description
              </label>
              <Textarea
                defaultValue={video.description || ""}
                placeholder="Describe this video content..."
                onChange={(e) => onUpdate("description", e.target.value)}
                rows={3}
                className="
          border-gray-300 
          focus:border-primary 
          focus:ring-2 
          focus:ring-primary/20 
          transition-all 
          duration-200 
          placeholder:text-gray-400
          text-sm
          bg-white
          shadow-sm
          hover:border-gray-400
          resize-none
          "
              />
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">
                {video.title || video.name || "Untitled Video"}
              </h4>
              <div className="flex gap-2">
                {(isNew || video.isNew) && (
                  <span
                    className="
            inline-flex items-center gap-1 text-xs 
            bg-gradient-to-r from-primary to-muted 
            text-white px-2.5 py-1 rounded-full 
            font-semibold shadow-sm
            animate-pulse
          "
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    NEW
                  </span>
                )}
                {video.isMoved && (
                  <span
                    className="
            inline-flex items-center gap-1 text-xs 
            bg-gradient-to-r from-muted to-secondary 
            text-white px-2.5 py-1 rounded-full 
            font-semibold shadow-sm
          "
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    MOVED
                  </span>
                )}
              </div>
            </div>
            {video.name && video.name !== video.title && (
              <p className="text-sm text-muted-foreground font-mono">
                {video.name}
              </p>
            )}
            {video.description && (
              <p className="text-sm text-muted-foreground">
                {video.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
              {video.duration && (
                <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md font-medium">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {formatDurationSimple(video.duration)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md font-medium">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Order #{video.order || 0}
              </span>
              {video.isMoved && (
                <span className="inline-flex items-center gap-1 bg-muted/20 text-muted px-2 py-1 rounded-md font-medium">
                  <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
                  Moved from{" "}
                  {video.sourceChapterType === "new" ? "new" : "original"}{" "}
                  chapter
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 transition-all duration-200 opacity-100">
          {video.isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className="
              bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 shadow-sm
              transition-all duration-200 font-medium px-2 sm:px-3
            "
            >
              <Check className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="
                  h-8 w-8 p-0
                  hover:bg-gray-100
                  transition-all duration-200
                "
                  title="Actions"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {(video.file || video.originalLessonId) && (
                  <DropdownMenuItem
                    onClick={handleOpenPreview}
                    disabled={isLoadingVideo}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2 text-purple-600" />
                    <span>{isLoadingVideo ? "Chargement..." : "Preview"}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
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
