import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight, Video, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Chapter } from "@/types/Chapter";
import VideoPreviewModal from "@/components/admin/VideoPreviewModal";
import { getPresignedUrlForVideo } from "@/services/chapter.service";

interface ChapterAccordionProps {
  chapter: Chapter;
  index: number;
}

export default function ChapterAccordion({
  chapter,
  index,
}: ChapterAccordionProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(index === 0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const handlePreview = async (lesson: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!lesson.videoUrl) {
      toast.error("URL de vidéo non disponible");
      return;
    }

    setIsLoadingVideo(true);
    setSelectedVideoTitle(lesson.title || "Aperçu vidéo");
    
    try {
      const presignedUrl = await getPresignedUrlForVideo({ videoUrl: lesson.videoUrl });
      setVideoUrl(presignedUrl);
      setIsPreviewModalOpen(true);
    } catch (error) {
      toast.error("Erreur de chargement de la vidéo");
      console.error("Error loading video preview:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const totalDuration = chapter.lessons
    ?.sort((a: any, b: any) => a.order - b.order)
    .reduce((acc: number, lesson: any) => {
      const duration =
        typeof lesson.duration === "number" ? lesson.duration : 0;
      return acc + duration;
    }, 0) || 0;

  return (
    <>
      <Card className="bg-white border border-orange-100/50">
      <CardHeader
        className="cursor-pointer hover:bg-orange-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-orange-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("courseDetails.chapterAccordion.chapter")} {index + 1}:{" "}
                {chapter.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {chapter.lessons?.length}{" "}
                {t("courseDetails.chapterAccordion.lessons")} •{" "}
                {Math.round(totalDuration)}{" "}
                {t("courseDetails.chapterAccordion.minutes")}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {chapter.lessons
              ?.sort((a: any, b: any) => a.order - b.order)
              .map((lesson: any) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Video className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {lesson.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {lesson.duration}{" "}
                      {t("courseDetails.chapterAccordion.minutes")}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 mr-2">
                    #{lesson.order}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handlePreview(lesson, e)}
                    disabled={isLoadingVideo}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    title="Prévisualiser la vidéo"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      )}
      </Card>
      {isPreviewModalOpen && typeof document !== 'undefined' && document.body && createPortal(
        <VideoPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setVideoUrl(null);
            setSelectedVideoTitle("");
          }}
          videoUrl={videoUrl}
          videoTitle={selectedVideoTitle}
        />,
        document.body
      )}
    </>
  );
}
