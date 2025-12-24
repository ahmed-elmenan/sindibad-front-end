import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Upload,
  AlertCircle,
  Video,
  X,
  Save,
  Merge,
  Move,
  ArrowRight,
  Folder,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCourse, useCourseChapters } from "@/hooks/useCourseQueries";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateChapter,
  deleteChapter,
  createVideo,
  updateVideo,
  deleteVideo,
  mergeChapters,
  moveVideo,
  batchUpdateVideos,
  uploadVideos,
} from "@/services/chapter.service";

import type {
  VideoFile,
  UnifiedVideo,
  UnifiedChapter,
  VideoMoveOperation,
  UnifiedChapterManagerProps,
} from "@/types/ChapterManager";
import DraggableVideo from "./DraggableVideo";
import DroppableChapter from "./DroppableChapter";
import { usePageTitle } from "@/hooks/usePageTitle";

interface VideoMoveConfirmation {
  videoData: any;
  targetChapterId: string;
  dropPosition: "top" | "bottom" | "middle";
  sourceChapterTitle: string;
  targetChapterTitle: string;
  videoTitle: string;
  moveType: VideoMoveOperation["moveType"];
}

const ChapterManager: React.FC<UnifiedChapterManagerProps> = () => {
  usePageTitle("manageChapters");

  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { isLoading: courseLoading } = useCourse(courseId);
  const {
    data: chapters = [],
    isLoading: chaptersLoading,
    refetch: refetchChapters,
  } = useCourseChapters(courseId);

  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);
  const [unifiedChapters, setUnifiedChapters] = useState<UnifiedChapter[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [, setAddingVideo] = useState<{ chapterId: string } | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(
    new Set()
  );
  const [pendingVideoMoves, setPendingVideoMoves] = useState<
    VideoMoveOperation[]
  >([]);

  // Video Move Confirmation State
  const [moveConfirmationOpen, setMoveConfirmationOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<VideoMoveConfirmation | null>(
    null
  );
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  // Store original values when editing starts
  const [originalChapterValues, setOriginalChapterValues] = useState<
    Record<string, { title: string; description: string }>
  >({});
  const [originalVideoValues, setOriginalVideoValues] = useState<
    Record<
      string,
      { title: string; description: string; duration: number; order: number }
    >
  >({});

  const isLoading = courseLoading || chaptersLoading;

  // Initialize unified chapters from fetched data
  useEffect(() => {
    const processedChapters: UnifiedChapter[] = (chapters || []).map(
      (chapter, index) => ({
        id: `unified-${chapter.id}`,
        originalChapterId: chapter.id,
        chapterNumber: chapter.order, // Use order instead of chapterNumber
        title: chapter.title,
        description: chapter.description || "",
        videos: (chapter.lessons || [])
          .sort((a, b) => a.order - b.order)
          .map((lesson) => ({
            id: `unified-video-${lesson.id}`,
            originalLessonId: lesson.id,
            name: lesson.title,
            title: lesson.title,
            description: "", // LessonSummary doesn't have description
            duration: typeof lesson.duration === "number" ? lesson.duration : 0,
            videoUrl: lesson.videoUrl,
            order: lesson.order,
            isNew: false,
            isDeleted: false,
            isEditing: false,
            isMoved: false,
            originalChapterId: `unified-${chapter.id}`,
            sourceChapterType: "existing",
          })),
        isNew: false,
        isDeleted: false,
        isEditing: false,
        isExpanded: index === 0,
        isSelected: false,
      })
    );

    setUnifiedChapters(processedChapters);
  }, [chapters]);

  // Chapter selection for merging
  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapters((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(chapterId)) {
        newSelection.delete(chapterId);
      } else if (newSelection.size < 2) {
        newSelection.add(chapterId);
      } else {
        // Replace the first selected with the new one
        const [first] = Array.from(newSelection);
        newSelection.delete(first);
        newSelection.add(chapterId);
      }
      return newSelection;
    });

    // Update chapter selection state
    setUnifiedChapters((prev) =>
      prev.map((ch) => ({
        ...ch,
        isSelected: selectedChapters.has(ch.id!) || ch.id === chapterId,
      }))
    );
  };

  // Enhanced video move handling with proper ID validation
  const handleVideoMove = (
    videoData: any,
    targetChapterId: string,
    dropPosition: "top" | "bottom" | "middle" = "middle"
  ) => {
    const { chapterId: sourceChapterId, video, originalLessonId } = videoData;

    // Validate required data
    if (!video || !sourceChapterId || !targetChapterId) {
      console.error("Missing required video move data");

      toast.error({
        title: t(
          "admin.chapterManager.errors.videoMove.title",
          "Erreur de déplacement"
        ),
        description: t(
          "admin.chapterManager.errors.videoMove.missingData",
          "Données manquantes pour le déplacement de la vidéo"
        ),
      });
      return;
    }

    const sourceChapter = unifiedChapters.find(
      (ch) => ch.id === sourceChapterId
    );
    const targetChapter = unifiedChapters.find(
      (ch) => ch.id === targetChapterId
    );

    if (!sourceChapter || !targetChapter) {
      console.error("Chapter lookup failed", {
        sourceChapterId,
        targetChapterId,
      });

      toast.error({
        title: t(
          "admin.chapterManager.errors.videoMove.title",
          "Erreur de déplacement"
        ),
        description: t(
          "admin.chapterManager.errors.videoMove.chapterNotFound",
          "Chapitre source ou destination introuvable"
        ),
      });
      return;
    }

    // Skip if same chapter
    if (sourceChapterId === targetChapterId) {
      return;
    }

    // Determine move type based on actual chapter states
    const sourceIsNew = sourceChapter.isNew;
    const targetIsNew = targetChapter.isNew;

    let moveType: VideoMoveOperation["moveType"];
    if (sourceIsNew && targetIsNew) {
      moveType = "new-to-new";
    } else if (sourceIsNew && !targetIsNew) {
      moveType = "new-to-existing";
    } else if (!sourceIsNew && targetIsNew) {
      moveType = "existing-to-new";
    } else {
      moveType = "existing-to-existing";
    }

    // Additional validation for existing video moves
    if (moveType === "existing-to-existing" && !originalLessonId) {
      console.error("Missing originalLessonId for existing video move");
      return;
    }

    // Prepare confirmation data
    const confirmationData: VideoMoveConfirmation = {
      videoData,
      targetChapterId,
      dropPosition,
      sourceChapterTitle: sourceChapter.title,
      targetChapterTitle: targetChapter.title,
      videoTitle: video.title,
      moveType,
    };

    // Show confirmation dialog
    setPendingMove(confirmationData);
    setMoveConfirmationOpen(true);
  };

  // Process confirmed video move with better error handling
  const processConfirmedVideoMove = async () => {
    if (!pendingMove) return;

    setIsProcessingMove(true);

    try {
      const { videoData, targetChapterId, dropPosition, moveType } =
        pendingMove;

      const {
        id: videoId,
        chapterId: sourceChapterId,
        video,
        originalLessonId,
      } = videoData;

      const sourceChapter = unifiedChapters.find(
        (ch) => ch.id === sourceChapterId
      );
      const targetChapter = unifiedChapters.find(
        (ch) => ch.id === targetChapterId
      );

      if (!sourceChapter || !targetChapter || !video) {
        throw new Error("Missing required data for video move");
      }

      // Calculate new order for the video in target chapter
      const targetVideos = targetChapter.videos.filter((v) => !v.isDeleted);
      let newOrder: number;

      switch (dropPosition) {
        case "top":
          newOrder =
            targetVideos.length > 0
              ? Math.min(...targetVideos.map((v) => v.order)) - 1
              : 1;
          break;
        case "bottom":
          newOrder =
            targetVideos.length > 0
              ? Math.max(...targetVideos.map((v) => v.order)) + 1
              : 1;
          break;
        default: // middle
          newOrder =
            targetVideos.length > 0
              ? Math.max(...targetVideos.map((v) => v.order)) + 1
              : 1;
      }
      // Handle different move types with proper ID validation
      switch (moveType) {
        case "existing-to-existing":
          // Moving existing video between existing chapters
          if (
            !originalLessonId ||
            !sourceChapter.originalChapterId ||
            !targetChapter.originalChapterId
          ) {
            throw new Error("Missing IDs for existing-to-existing move");
          }

          await moveVideo(
            originalLessonId,
            sourceChapter.originalChapterId,
            targetChapter.originalChapterId,
            newOrder
          );

          break;

        case "existing-to-new": {
          // Moving existing video to new chapter - store for batch processing
          if (!originalLessonId || !sourceChapter.originalChapterId) {
            throw new Error("Missing IDs for existing-to-new move");
          }

          const existingToNewOperation: VideoMoveOperation = {
            videoId: originalLessonId,
            fromChapterId: sourceChapter.originalChapterId,
            toChapterId: targetChapter.originalChapterId || targetChapterId,
            newOrder,
            isNewVideo: false,
            moveType: "existing-to-new",
          };

          setPendingVideoMoves((prev) => {
            const filtered = prev.filter(
              (op) => op.videoId !== originalLessonId
            );
            return [...filtered, existingToNewOperation];
          });
          break;
        }

        case "new-to-existing": {
          // Moving new video to existing chapter - immediate API call
          if (!targetChapter.originalChapterId) {
            throw new Error(
              "Missing target chapter ID for new-to-existing move"
            );
          }

          const videoDataForAPI = {
            title: video.title,
            description: video.description,
            duration: video.duration,
            order: newOrder,
          };

          await createVideo(targetChapter.originalChapterId, videoDataForAPI);
          break;
        }

        case "new-to-new":
          // Moving between new chapters - no immediate API call needed
          break;
      }

      // Create updated video with move tracking
      const updatedVideo: UnifiedVideo = {
        ...video,
        order: newOrder,
        isMoved: moveType !== "new-to-new",
        originalChapterId: video.originalChapterId || sourceChapterId,
        sourceChapterType: sourceChapter.isNew ? "new" : "existing",
      };

      // Update local state
      setUnifiedChapters((prev) =>
        prev.map((ch) => {
          if (ch.id === sourceChapterId) {
            return {
              ...ch,
              videos: ch.videos.filter((v) => v.id !== videoId),
            };
          } else if (ch.id === targetChapterId) {
            return {
              ...ch,
              videos: [...ch.videos, updatedVideo].sort(
                (a, b) => a.order - b.order
              ),
            };
          }
          return ch;
        })
      );

      setHasChanges(true);

      // For existing-to-existing moves, refetch data to ensure consistency
      if (moveType === "existing-to-existing") {
        setTimeout(() => {
          refetchChapters();
        }, 1000);
      }

      // Afficher un toast de succès
      toast.success({
        title: t(
          "admin.chapterManager.videoMove.success",
          "Vidéo déplacée avec succès"
        ),
        description: t(
          "admin.chapterManager.videoMove.successDescription",
          '"{{videoTitle}}" a été déplacée vers "{{targetChapter}}".',
          {
            videoTitle: pendingMove?.videoTitle || "Vidéo",
            targetChapter: pendingMove?.targetChapterTitle || "Chapitre cible",
          }
        ),
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to process video move:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Remplacer alert par toast
      toast.error({
        title: t(
          "admin.chapterManager.videoMove.error",
          "Échec du déplacement de la vidéo"
        ),
        description: t(
          "admin.chapterManager.videoMove.errorDescription",
          "Une erreur est survenue lors du déplacement: {{message}}",
          { message: errorMessage }
        ),
        duration: 5000,
      });
    } finally {
      setIsProcessingMove(false);
      setMoveConfirmationOpen(false);
      setPendingMove(null);
    }
  };

  // Handle chapter merging with proper ID validation
  const handleMergeChapters = async () => {
    if (selectedChapters.size !== 2) return;

    setIsProcessingMove(true);

    try {
      const [sourceId, targetId] = Array.from(selectedChapters);
      const sourceChapter = unifiedChapters.find((ch) => ch.id === sourceId);
      const targetChapter = unifiedChapters.find((ch) => ch.id === targetId);

      if (!sourceChapter || !targetChapter) {
        throw new Error("Selected chapters not found");
      }

      // Determine which chapter has the lower number (target for merge)
      const [lowerChapter, higherChapter] =
        sourceChapter.chapterNumber < targetChapter.chapterNumber
          ? [sourceChapter, targetChapter]
          : [targetChapter, sourceChapter];

      // Calculate new orders for videos being moved
      const targetVideos = lowerChapter.videos.filter((v) => !v.isDeleted);
      const maxOrder = Math.max(...targetVideos.map((v) => v.order), 0);

      const mergedVideos = [
        ...lowerChapter.videos,
        ...higherChapter.videos.map((video, index) => ({
          ...video,
          order: maxOrder + index + 1,
          isMoved:
            !video.isNew &&
            lowerChapter.originalChapterId !== higherChapter.originalChapterId,
        })),
      ];

      // Call API for existing chapters with proper validation
      if (!lowerChapter.isNew && !higherChapter.isNew) {
        if (
          !higherChapter.originalChapterId ||
          !lowerChapter.originalChapterId
        ) {
          throw new Error("Missing original chapter IDs for merge");
        }

        await mergeChapters(
          higherChapter.originalChapterId,
          lowerChapter.originalChapterId
        );

        // Refetch data after merge
        setTimeout(() => {
          refetchChapters();
        }, 1000);
      }

      // Update local state
      setUnifiedChapters((prev) =>
        prev.map((ch) => {
          if (ch.id === lowerChapter.id) {
            return {
              ...ch,
              videos: mergedVideos,
              title: `${lowerChapter.title} & ${higherChapter.title}`,
              description:
                `${lowerChapter.description}\n\n${higherChapter.description}`.trim(),
            };
          } else if (ch.id === higherChapter.id) {
            return {
              ...ch,
              isDeleted: true,
            };
          }
          return ch;
        })
      );

      setSelectedChapters(new Set());
      setMergeDialogOpen(false);
      setHasChanges(true);

      // Afficher un toast de succès
      toast.success({
        title: t(
          "admin.chapterManager.merge.success",
          "Chapitres fusionnés avec succès"
        ),
        description: t(
          "admin.chapterManager.merge.successDescription",
          'Les chapitres "{{source}}" et "{{target}}" ont été fusionnés.',
          {
            source: sourceChapter?.title || "Chapitre source",
            target: targetChapter?.title || "Chapitre cible",
          }
        ),
        duration: 4000,
      });
    } catch (error) {
      console.error("Failed to merge chapters:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Remplacer alert par toast
      toast.error({
        title: t(
          "admin.chapterManager.merge.error",
          "Échec de la fusion des chapitres"
        ),
        description: t(
          "admin.chapterManager.merge.errorDescription",
          "Une erreur est survenue lors de la fusion: {{message}}",
          { message: errorMessage }
        ),
        duration: 6000,
      });
    } finally {
      setIsProcessingMove(false);
    }
  };

  // Get all existing video names for validation
  const getExistingVideoNames = useCallback((): Set<string> => {
    const existingNames = new Set<string>();
    unifiedChapters.forEach((chapter) => {
      chapter.videos.forEach((video) => {
        if (!video.isDeleted) {
          existingNames.add(video.name);
        }
      });
    });
    return existingNames;
  }, [unifiedChapters]);

  // Validate file naming convention
  const validateFileName = (fileName: string): boolean => {
    const pattern = /^ch\d+-v\d+\.[\w]+$/;
    return pattern.test(fileName);
  };

  const validateNoDuplicates = useCallback(
    (files: VideoFile[]): { valid: VideoFile[]; errors: string[] } => {
      const existingNames = getExistingVideoNames();
      const errors: string[] = [];
      const valid: VideoFile[] = [];

      files.forEach((file) => {
        if (existingNames.has(file.name)) {
          errors.push(
            t(
              "admin.chapterManager.errors.duplicateExisting",
              "File {{name}} already exists",
              { name: file.name }
            )
          );
        } else {
          valid.push(file);
          existingNames.add(file.name);
        }
      });

      return { valid, errors };
    },
    [t, getExistingVideoNames]
  );

  // Get next available numbers
  const getNextChapterNumber = (): number => {
    const existingNumbers = new Set<number>();
    unifiedChapters.forEach((ch) => {
      if (!ch.isDeleted) existingNumbers.add(ch.chapterNumber);
    });

    let nextNumber = 1;
    while (existingNumbers.has(nextNumber)) {
      nextNumber++;
    }
    return nextNumber;
  };

  // Extract chapter number from file name
  const getChapterNumber = (fileName: string): number => {
    const match = fileName.match(/^ch(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Organize files by chapter and merge with existing
  const organizeAndMergeFiles = useCallback((files: VideoFile[]) => {
    const chapterMap = new Map<number, VideoFile[]>();

    files.forEach((file) => {
      const chapterNum = getChapterNumber(file.name);
      if (!chapterMap.has(chapterNum)) {
        chapterMap.set(chapterNum, []);
      }
      chapterMap.get(chapterNum)?.push(file);
    });

    setUnifiedChapters((prev) => {
      const updated = [...prev];

      chapterMap.forEach((videos, chapterNumber) => {
        const existingChapterIndex = updated.findIndex(
          (ch) => ch.chapterNumber === chapterNumber && !ch.isDeleted
        );

        const newVideos: UnifiedVideo[] = videos.map((video, index) => ({
          id: `new-video-${Date.now()}-${Math.random()}-${index}`,
          name: video.name,
          title: video.title || video.name.replace(/\.[^/.]+$/, ""),
          description: video.description || "",
          duration: 0,
          order: 0,
          file: video,
          isNew: true,
          isEditing: false,
          isDeleted: false,
          isMoved: false,
          sourceChapterType: "new",
        }));

        if (existingChapterIndex >= 0) {
          const existingChapter = updated[existingChapterIndex];
          const maxOrder = Math.max(
            ...existingChapter.videos.map((v) => v.order),
            0
          );

          newVideos.forEach((video, index) => {
            video.order = maxOrder + index + 1;
          });

          updated[existingChapterIndex] = {
            ...existingChapter,
            videos: [...existingChapter.videos, ...newVideos].sort(
              (a, b) => a.order - b.order
            ),
          };
        } else {
          newVideos.forEach((video, index) => {
            video.order = index + 1;
          });

          const newChapter: UnifiedChapter = {
            id: `new-chapter-${Date.now()}-${chapterNumber}`,
            chapterNumber,
            title: `Chapter ${chapterNumber}`,
            description: "",
            videos: newVideos,
            isNew: true,
            isDeleted: false,
            isEditing: false,
            isExpanded: true,
            isSelected: false,
          };

          updated.push(newChapter);
        }
      });

      return updated.sort((a, b) => a.chapterNumber - b.chapterNumber);
    });

    setHasChanges(true);
  }, []);

  // CRUD Operations with better error handling
  const toggleChapterEdit = (chapterId: string) => {
    const chapter = unifiedChapters.find((ch) => ch.id === chapterId);

    if (chapter && !chapter.isEditing) {
      // Store original values when starting to edit
      setOriginalChapterValues((prev) => ({
        ...prev,
        [chapterId]: {
          title: chapter.title,
          description: chapter.description,
        },
      }));
    }

    setUnifiedChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, isEditing: !ch.isEditing } : ch
      )
    );
  };

  const updateChapterField = (
    chapterId: string,
    field: "title" | "description",
    value: string
  ) => {
    setUnifiedChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, [field]: value } : ch))
    );
    setHasChanges(true);
  };

  const saveChapter = async (chapterId: string) => {
    const chapter = unifiedChapters.find((ch) => ch.id === chapterId);
    const originalValues = originalChapterValues[chapterId];

    if (chapter && !chapter.isNew && chapter.originalChapterId) {
      // Check if values have actually changed
      const hasChanged =
        originalValues &&
        (originalValues.title !== chapter.title ||
          originalValues.description !== chapter.description);

      if (hasChanged) {
        try {
          await updateChapter(chapter.originalChapterId, {
            title: chapter.title,
            description: chapter.description,
          });
          toast.success({
            title: t(
              "admin.chapterManager.chapter.updateSuccess",
              "Chapitre mis à jour"
            ),
            description: t(
              "admin.chapterManager.chapter.updateSuccessDescription",
              "Les modifications ont été enregistrées avec succès"
            ),
          });
        } catch (error) {
          console.error("Failed to update chapter:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error({
            title: t(
              "admin.chapterManager.chapter.updateError",
              "Échec de la mise à jour du chapitre"
            ),
            description: t(
              "admin.chapterManager.chapter.updateErrorDescription",
              "Erreur: {{message}}",
              { message: errorMessage }
            ),
            duration: 5000,
          });
        }
      } else {
        console.log("No changes detected for chapter, skipping update request");
      }

      // Clean up stored original values
      setOriginalChapterValues((prev) => {
        const newValues = { ...prev };
        delete newValues[chapterId];
        return newValues;
      });
    }
    toggleChapterEdit(chapterId);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    const chapter = unifiedChapters.find((ch) => ch.id === chapterId);
    if (chapter) {
      if (chapter.isNew) {
        setUnifiedChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
        toast.success({
          title: t(
            "admin.chapterManager.chapter.deleteSuccess",
            "Chapitre supprimé"
          ),
          description: t(
            "admin.chapterManager.chapter.deleteSuccessDescription",
            'Le chapitre "{{title}}" a été supprimé avec succès.',
            { title: chapter.title }
          ),
          duration: 3000,
        });
      } else if (chapter.originalChapterId) {
        try {
          await deleteChapter(chapter.originalChapterId);
          setUnifiedChapters((prev) =>
            prev.filter((ch) => ch.id !== chapterId)
          );

          toast.success({
            title: t(
              "admin.chapterManager.chapter.deleteSuccess",
              "Chapitre supprimé"
            ),
            description: t(
              "admin.chapterManager.chapter.deleteSuccessDescription",
              'Le chapitre "{{title}}" a été supprimé avec succès.',
              { title: chapter.title }
            ),
            duration: 3000,
          });

          // Refetch data
          setTimeout(() => {
            refetchChapters();
          }, 1000);
        } catch (error) {
          console.error("Failed to delete chapter:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error({
            title: t(
              "admin.chapterManager.chapter.deleteError",
              "Échec de la suppression du chapitre"
            ),
            description: t(
              "admin.chapterManager.chapter.deleteErrorDescription",
              "Erreur: {{message}}",
              { message: errorMessage }
            ),
            duration: 5000,
          });
        }
      }
    }
    setHasChanges(true);
  };

  const toggleVideoEdit = (chapterId: string, videoId: string) => {
    const chapter = unifiedChapters.find((ch) => ch.id === chapterId);
    const video = chapter?.videos.find((v) => v.id === videoId);

    if (video && !video.isEditing) {
      // Store original values when starting to edit
      setOriginalVideoValues((prev) => ({
        ...prev,
        [videoId]: {
          title: video.title,
          description: video.description,
          duration: video.duration ?? 0,
          order: video.order,
        },
      }));
    }

    setUnifiedChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              videos: ch.videos.map((v) =>
                v.id === videoId ? { ...v, isEditing: !v.isEditing } : v
              ),
            }
          : ch
      )
    );
  };

  const updateVideoField = (
    chapterId: string,
    videoId: string,
    field: string,
    value: string | number
  ) => {
    setUnifiedChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              videos: ch.videos.map((v) =>
                v.id === videoId ? { ...v, [field]: value } : v
              ),
            }
          : ch
      )
    );
    setHasChanges(true);
  };

  const saveVideo = async (chapterId: string, videoId: string) => {
    const chapter = unifiedChapters.find((ch) => ch.id === chapterId);
    const video = chapter?.videos.find((v) => v.id === videoId);
    const originalValues = originalVideoValues[videoId];

    if (video && !video.isNew && video.originalLessonId) {
      // Check if values have actually changed
      const hasChanged =
        originalValues &&
        (originalValues.title !== video.title ||
          originalValues.description !== video.description ||
          originalValues.duration !== video.duration ||
          originalValues.order !== video.order);

      if (hasChanged) {
        try {
          await updateVideo(video.originalLessonId, {
            title: video.title,
            description: video.description,
            duration: video.duration,
            order: video.order,
          });
          toast.success({
            title: t(
              "admin.chapterManager.video.updateSuccess",
              "Vidéo mise à jour"
            ),
            description: t(
              "admin.chapterManager.video.updateSuccessDescription",
              "Les modifications ont été enregistrées avec succès"
            ),
          });
        } catch (error) {
          console.error("Failed to update video:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error({
            title: t(
              "admin.chapterManager.video.updateError",
              "Échec de la mise à jour de la vidéo"
            ),
            description: t(
              "admin.chapterManager.video.updateErrorDescription",
              "Erreur: {{message}}",
              { message: errorMessage }
            ),
            duration: 5000,
          });
        }
      } else {
        console.log("No changes detected for video, skipping update request");
      }

      // Clean up stored original values
      setOriginalVideoValues((prev) => {
        const newValues = { ...prev };
        delete newValues[videoId];
        return newValues;
      });
    }
    toggleVideoEdit(chapterId, videoId);
  };

  const handleDeleteVideo = async (chapterId: string, videoId: string) => {
    const chapter = unifiedChapters.find((ch) => ch.id === chapterId);
    const video = chapter?.videos.find((v) => v.id === videoId);

    if (video) {
      if (video.isNew) {
        setUnifiedChapters((prev) =>
          prev.map((ch) =>
            ch.id === chapterId
              ? { ...ch, videos: ch.videos.filter((v) => v.id !== videoId) }
              : ch
          )
        );

        toast.success({
          title: t(
            "admin.chapterManager.video.deleteSuccess",
            "Vidéo supprimée"
          ),
          description: t(
            "admin.chapterManager.video.deleteSuccessDescription",
            'La vidéo "{{title}}" a été supprimée avec succès.',
            { title: video.title || video.name }
          ),
          duration: 3000,
        });
      } else if (video.originalLessonId) {
        try {
          await deleteVideo(video.originalLessonId);
          setUnifiedChapters((prev) =>
            prev.map((ch) =>
              ch.id === chapterId
                ? { ...ch, videos: ch.videos.filter((v) => v.id !== videoId) }
                : ch
            )
          );

          toast.success({
            title: t(
              "admin.chapterManager.video.deleteSuccess",
              "Vidéo supprimée"
            ),
            description: t(
              "admin.chapterManager.video.deleteSuccessDescription",
              'La vidéo "{{title}}" a été supprimée avec succès.',
              { title: video.title || video.name }
            ),
            duration: 3000,
          });

          // Refetch data
          setTimeout(() => {
            refetchChapters();
          }, 1000);
        } catch (error) {
          console.error("Failed to delete video:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error({
            title: t(
              "admin.chapterManager.video.deleteError",
              "Échec de la suppression de la vidéo"
            ),
            description: t(
              "admin.chapterManager.video.deleteErrorDescription",
              "Erreur: {{message}}",
              { message: errorMessage }
            ),
            duration: 5000,
          });
        }
      }
    }
    setHasChanges(true);
  };

  const toggleChapterExpansion = (chapterId: string) => {
    setUnifiedChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch
      )
    );
  };

  // File upload handling
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const videoFiles = acceptedFiles as VideoFile[];

      const invalidNames = videoFiles
        .filter((file) => !validateFileName(file.name))
        .map((file) => file.name);

      if (invalidNames.length > 0) {
        invalidNames.forEach((name) => {
          toast.error({
            title: t(
              "admin.chapterManager.errors.invalidNaming.title",
              "Nom de fichier invalide"
            ),
            description: t(
              "admin.chapterManager.errors.invalidNaming.description",
              "Le fichier {{name}} ne respecte pas le format ch1-v1.mp4",
              { name }
            ),
          });
        });
        return;
      }

      const { valid: validFiles, errors: duplicateErrors } =
        validateNoDuplicates(videoFiles);

      if (duplicateErrors.length > 0) {
        duplicateErrors.forEach((error) => {
          toast.error({
            title: t(
              "admin.chapterManager.errors.duplicateFile.title",
              "Fichier en double"
            ),
            description: error,
          });
        });
        return;
      }

      setInvalidFiles([]);

      toast.success({
        title: t(
          "admin.chapterManager.success.filesValidated.title",
          "Fichiers validés"
        ),
        description: t(
          "admin.chapterManager.success.filesValidated.description",
          "{{count}} fichier(s) prêt(s) pour l'upload",
          { count: validFiles.length }
        ),
      });

      organizeAndMergeFiles(validFiles);
    },
    [t, organizeAndMergeFiles, validateNoDuplicates]
  );

  // Enhanced upload handler that processes video moves
  const handleUpload = async () => {
    if (!courseId) return;

    setIsProcessingMove(true);

    // Afficher le toast de chargement
    const loadingToast = toast.loading(
      t(
        "admin.chapterManager.upload.uploading",
        "Upload des vidéos en cours..."
      ),
      {
        duration: Infinity,
      }
    );

    try {
      // Collect all new files (videos with file objects that are new)
      const newFiles = unifiedChapters.flatMap((chapter) =>
        chapter.videos
          .filter((video) => video.file && video.isNew && !video.isDeleted)
          .map((video) => video.file!)
      );

      // Only include chapters that have new videos to upload
      const chaptersWithNewVideos = unifiedChapters
        .map((chapter) => {
          const newVideos = chapter.videos.filter(
            (video) => video.file && video.isNew && !video.isDeleted
          );
          return newVideos.length > 0 ? { chapter, newVideos } : null;
        })
        .filter((item) => item !== null);

      const metadata = {
        chapters: chaptersWithNewVideos.map(({ chapter, newVideos }) => ({
          number: chapter.chapterNumber,
          title: chapter.title,
          description: chapter.description,
          videos: newVideos.map((video) => ({
            name: video.name,
            title: video.title,
            description: video.description,
          })),
        })),
      };

      // Process pending video moves
      if (pendingVideoMoves.length > 0) {
        try {
          await batchUpdateVideos(pendingVideoMoves);
          setPendingVideoMoves([]);
        } catch (error) {
          console.error("Failed to batch update videos:", error);
          throw new Error(
            t(
              "admin.chapterManager.errors.moveFailed",
              "Échec du déplacement des vidéos"
            )
          );
        }
      }

      // Upload new files with progress tracking
      if (newFiles.length > 0) {
        await uploadVideos(courseId, newFiles, metadata, (progress) => {
          // Mettre à jour le toast avec le progress
          toast.dismiss(loadingToast);
          toast.loading(
            t(
              "admin.chapterManager.upload.progress",
              "Upload en cours... {{progress}}%",
              { progress: Math.round(progress) }
            ),
            { id: loadingToast, duration: Infinity }
          );
        });
      }

      setHasChanges(false);

      // Fermer le toast de chargement et afficher le succès
      toast.dismiss(loadingToast);
      toast.success({
        title: t(
          "admin.chapterManager.upload.success",
          "Upload terminé avec succès !"
        ),
        description: t(
          "admin.chapterManager.upload.successDescription",
          "{{count}} vidéo(s) uploadée(s). Les vidéos ont été ajoutées au cours et sont maintenant disponibles.",
          { count: newFiles.length }
        ),
        duration: 5000,
      });

      // Refetch chapters data
      setTimeout(() => {
        refetchChapters();
      }, 2000);
    } catch (error) {
      console.error("Failed to upload videos:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Fermer le toast de chargement et afficher l'erreur
      toast.dismiss(loadingToast);
      toast.error({
        title: t(
          "admin.chapterManager.upload.error",
          "Échec de l'upload des vidéos"
        ),
        description: t(
          "admin.chapterManager.upload.errorDescription",
          "Une erreur est survenue lors de l'upload: {{message}}",
          { message: errorMessage }
        ),
        duration: 8000,
      });
    } finally {
      setIsProcessingMove(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading course content...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50/30 p-4 md:p-6 lg:p-8">
        <Card className="w-full max-w-7xl mx-auto shadow-xl border-0 rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 pt-0">
          <CardHeader className="bg-gradient-to-r from-primary to-muted text-white relative overflow-hidden py-5">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <div className="flex flex-col gap-4">
                {/* Title and Statistics Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-4">
                    {/* Back Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/courses/${courseId}`)}
                      className="group rounded-full h-11 w-11 bg-white border-2 border-white hover:scale-[1.02] hover:!bg-white shadow-sm hover:shadow-md backdrop-blur-sm flex-shrink-0 transition-all duration-300"
                      title={t(
                        "admin.chapterManager.backToCourse",
                        "Retour au cours"
                      )}
                    >
                      <ArrowLeft className="h-5 w-5 text-primary transition-colors duration-300" />
                    </Button>
                    
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                        {t(
                          "admin.chapterManager.title",
                          "Gestionnaire de Contenu de Cours"
                        )}
                      </CardTitle>
                      <p className="text-white/90 text-sm md:text-base">
                        Organisez et gérez les chapitres et vidéos de votre cours
                      </p>
                    </div>
                  </div>

                  {/* Course Statistics */}
                  <div className="flex items-center gap-4 text-white/80 text-sm flex-shrink-0">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Folder className="h-4 w-4" />
                      {
                        unifiedChapters.filter((ch) => !ch.isDeleted).length
                      }{" "}
                      chapitres
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Video className="h-4 w-4" />
                      {unifiedChapters
                        .filter((ch) => !ch.isDeleted)
                        .reduce(
                          (total, ch) =>
                            total +
                            ch.videos.filter((v) => !v.isDeleted).length,
                          0
                        )}{" "}
                      vidéos
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 md:gap-3 flex-shrink-0">
                  {/* Merge Chapters Button */}
                  {selectedChapters.size === 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setMergeDialogOpen(true)}
                      disabled={isProcessingMove}
                      className="bg-white/20 hover:bg-secondary/20 border-white/30 text-white transition-all duration-200 hover:scale-105"
                    >
                      <Merge className="h-4 w-4 mr-2" />
                      Fusionner les Chapitres
                    </Button>
                  )}
                </div>

                {/* Status Messages */}
                <div className="mt-4 space-y-2">
                  {selectedChapters.size > 0 && (
                    <div className="bg-muted/20 border border-muted/30 rounded-lg p-3">
                      <p className="text-sm text-orange-100 font-medium">
                        {selectedChapters.size} chapitre(s) sélectionné(s) pour la fusion
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Drag and Drop Upload Area */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-muted rounded-full"></div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-muted bg-clip-text text-transparent">
                  {t("admin.chapterManager.addContent", "Ajouter du Contenu Vidéo")}
                </h3>
              </div>

              <div
                {...getRootProps()}
                className={`
                relative overflow-hidden border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer 
                transition-all duration-300 group
                ${
                  isDragActive
                    ? "border-primary bg-gradient-to-br from-orange-50 to-yellow-50 scale-[1.02] shadow-lg"
                    : "border-gray-300 hover:border-primary hover:bg-gradient-to-br hover:from-gray-50 hover:to-orange-50/30"
                }
              `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
                <input {...getInputProps()} disabled={isProcessingMove} />

                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isDragActive
                        ? "bg-gradient-to-br from-primary to-muted text-white scale-110"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-orange-100 group-hover:to-yellow-100 group-hover:text-primary"
                    }`}
                  >
                    <Upload className="w-8 h-8" />
                  </div>

                  <h4
                    className={`text-lg md:text-xl font-semibold mb-2 transition-colors ${
                      isDragActive
                        ? "text-primary"
                        : "text-gray-900 group-hover:text-primary"
                    }`}
                  >
                    {isDragActive
                      ? t(
                          "admin.chapterManager.dropHere",
                          "Déposez les fichiers ici"
                        )
                      : t(
                          "admin.chapterManager.dragDrop",
                          "Glissez-déposez des vidéos ou cliquez pour sélectionner"
                        )}
                  </h4>

                  <p className="text-sm md:text-base text-gray-600 mb-3 max-w-md mx-auto">
                    {t(
                      "admin.chapterManager.namingConvention",
                      "Les fichiers doivent être nommés : ch1-v1, ch1-v2, etc."
                    )}
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 max-w-2xl mx-auto">
                    <p className="text-xs md:text-sm text-orange-900">
                      <span className="font-semibold">Explication :</span> ch1-v1 signifie <span className="font-medium">vidéo 1 du chapitre 1</span>, ch1-v2 signifie <span className="font-medium">vidéo 2 du chapitre 1</span>, ch2-v1 signifie <span className="font-medium">vidéo 1 du chapitre 2</span>, etc.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    {t(
                      "admin.chapterManager.nextAvailable",
                      "Prochain disponible : Chapitre {{chapter}}",
                      {
                        chapter: getNextChapterNumber(),
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {invalidFiles.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-red-800 font-medium mb-2">
                        Erreurs de Validation de l'Upload
                      </h4>
                      <ul className="space-y-1 text-sm text-red-700">
                        {invalidFiles.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chapters List */}
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-muted to-secondary rounded-full"></div>
                  <h3 className="text-xl font-semibold bg-clip-text text-black">
                    Phases du cours
                  </h3>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                  <div className="text-primary">💡</div>
                  <p className="text-sm text-primary font-medium">
                    Glissez les vidéos entre chapitres • Sélectionnez des chapitres à fusionner
                  </p>
                </div>
              </div>

              {unifiedChapters.filter((ch) => !ch.isDeleted).length === 0 ? (
                <div className="text-center py-16 px-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun chapitre pour le moment
                  </h4>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    Commencez par ajouter un chapitre ou téléchargez des vidéos pour
                    créer automatiquement des chapitres
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <p className="text-sm text-gray-500 self-center">
                      glissez-déposez des vidéos ci-dessus
                    </p>
                  </div>
                </div>
              ) : (
                unifiedChapters
                  .filter((ch) => !ch.isDeleted)
                  .sort((a, b) => a.chapterNumber - b.chapterNumber)
                  .map((chapter, index) => (
                    <DroppableChapter
                      key={chapter.id}
                      chapter={chapter}
                      onDropVideo={handleVideoMove}
                      onSelect={handleChapterSelect}
                      isSelected={selectedChapters.has(chapter.id!)}
                      onToggleExpansion={() =>
                        toggleChapterExpansion(chapter.id!)
                      }
                      onToggleEdit={() => toggleChapterEdit(chapter.id!)}
                      onSave={() => saveChapter(chapter.id!)}
                      onDelete={() => handleDeleteChapter(chapter.id!)}
                      onUpdate={(field, value) =>
                        updateChapterField(chapter.id!, field, value)
                      }
                      onAddVideo={() =>
                        setAddingVideo({ chapterId: chapter.id! })
                      }
                    >
                      {/* Videos List */}
                      <div className="space-y-3">
                        {chapter.videos.filter((v) => !v.isDeleted).length ===
                        0 ? (
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gradient-to-br from-gray-50 to-secondary/20 hover:border-primary transition-all duration-300 group">
                            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center group-hover:from-secondary/20 group-hover:to-primary/20 transition-all duration-300">
                              <Video className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Aucune vidéo pour le moment
                            </h4>
                            <p className="text-xs text-gray-500">
                              Glissez des vidéos ici ou ajoutez-les manuellement
                            </p>
                          </div>
                        ) : (
                          chapter.videos
                            .filter((v) => !v.isDeleted)
                            .sort((a, b) => a.order - b.order)
                            .map((video, videoIndex) => (
                              <DraggableVideo
                                key={video.id}
                                video={video}
                                chapterId={chapter.id!}
                                chapterIndex={index}
                                videoIndex={videoIndex}
                                isChapterNew={!!chapter.isNew}
                                onEdit={() =>
                                  toggleVideoEdit(chapter.id!, video.id!)
                                }
                                onSave={() => saveVideo(chapter.id!, video.id!)}
                                onDelete={() =>
                                  handleDeleteVideo(chapter.id!, video.id!)
                                }
                                onUpdate={(field, value) =>
                                  updateVideoField(
                                    chapter.id!,
                                    video.id!,
                                    field,
                                    value
                                  )
                                }
                                isNew={video.isNew}
                              />
                            ))
                        )}
                      </div>
                    </DroppableChapter>
                  ))
              )}
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="bg-gradient-to-r from-gray-50 to-secondary/10 rounded-2xl p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Modifications Non Sauvegardées
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {pendingVideoMoves.length > 0
                        ? `${pendingVideoMoves.length} déplacement(s) de vidéo en attente`
                        : "Vous avez des modifications qui doivent être enregistrées"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      disabled={isProcessingMove}
                      onClick={() => {
                        setUnifiedChapters((prev) =>
                          prev
                            .filter((ch) => !ch.isNew)
                            .map((ch) => ({
                              ...ch,
                              isEditing: false,
                              isSelected: false,
                              videos: ch.videos
                                .filter((v) => !v.isNew)
                                .map((v) => ({
                                  ...v,
                                  isEditing: false,
                                  isMoved: false,
                                })),
                            }))
                        );
                        setSelectedChapters(new Set());
                        setPendingVideoMoves([]);
                        setInvalidFiles([]);
                        setHasChanges(false);
                      }}
                      className="w-full sm:w-auto hover:bg-gray-100 border-gray-300 hover:text-gray-900 transition-all duration-200 text-sm sm:text-base py-2 sm:py-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={invalidFiles.length > 0 || isProcessingMove}
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-muted hover:from-primary/90 hover:to-muted/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-2"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isProcessingMove ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Traitement...
                        </>
                      ) : (
                        "Enregistrer Toutes les Modifications"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Video Move Confirmation Dialog */}
          <AlertDialog
            open={moveConfirmationOpen}
            onOpenChange={setMoveConfirmationOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Move className="h-5 w-5" />
                  Confirmer le Déplacement de Vidéo
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <div>Êtes-vous sûr de vouloir déplacer cette vidéo ?</div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">
                        {pendingMove?.videoTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>De : {pendingMove?.sourceChapterTitle}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span>Vers : {pendingMove?.targetChapterTitle}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Type de déplacement : {pendingMove?.moveType?.replace("-", " vers ")}
                    </div>
                  </div>
                  {pendingMove?.moveType !== "new-to-new" && (
                    <div className="text-sm text-amber-600">
                      ⚠️ Cette action mettra immédiatement à jour le backend et
                      ne peut pas être facilement annulée.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isProcessingMove}>
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={processConfirmedVideoMove}
                  disabled={isProcessingMove}
                  className="bg-gradient-to-r from-primary to-muted hover:from-primary/90 hover:to-muted/90"
                >
                  {isProcessingMove ? "Déplacement..." : "Confirmer le Déplacement"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Merge Chapters Dialog */}
          <AlertDialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Fusionner les Chapitres</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir fusionner les chapitres sélectionnés ? Les
                  vidéos du chapitre avec le numéro le plus élevé seront déplacées vers le
                  chapitre avec le numéro le plus bas, et le chapitre avec le numéro le plus élevé sera
                  supprimé. Cette action ne peut pas être annulée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setSelectedChapters(new Set())}
                >
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleMergeChapters}
                  disabled={isProcessingMove}
                  className="bg-gradient-to-r from-primary to-muted hover:from-primary/90 hover:to-muted/90"
                >
                  {isProcessingMove ? "Fusion en cours..." : "Fusionner les Chapitres"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </DndProvider>
  );
};

export default ChapterManager;
