import api from "@/lib/axios";
import type { Lesson } from "@/types";
import type { CourseSummary } from "@/types/Chapter";
import type { Chapter } from "@/types/Chapter";
import type { VideoMoveOperation } from "@/types/ChapterManager";

// Input validation helper
const validateIds = (...ids: (string | undefined | null)[]): boolean => {
  return ids.every(
    (id) => id && id.trim() !== "" && id !== "undefined" && id !== "null"
  );
};

// Chapter CRUD Operations
export const createChapter = async (
  courseId: string,
  data: {
    title: string;
    description: string;
    chapterNumber: number;
  }
): Promise<Chapter> => {
  if (!validateIds(courseId)) {
    throw new Error("Invalid course ID provided");
  }

  const response = await api.post(`/courses/${courseId}/chapters`, data);
  return response.data;
};

export const updateChapter = async (
  chapterId: string,
  data: {
    title: string;
    description: string;
  }
): Promise<Chapter> => {
  if (!validateIds(chapterId)) {
    throw new Error("Invalid chapter ID provided");
  }

  const response = await api.patch(`/admin/chapters/${chapterId}`, data);
  return response.data;
};

export const deleteChapter = async (chapterId: string): Promise<void> => {
  if (!validateIds(chapterId)) {
    throw new Error("Invalid chapter ID provided");
  }

  await api.delete(`/chapters/${chapterId}`);
};

// Video CRUD Operations
export const createVideo = async (
  chapterId: string,
  data: {
    title: string;
    description: string;
    duration: number;
    order: number;
  }
): Promise<Lesson> => {
  if (!validateIds(chapterId)) {
    throw new Error("Invalid chapter ID provided");
  }

  const response = await api.post(`/chapters/${chapterId}/lessons`, data);
  return response.data;
};

export const updateVideo = async (
  videoId: string,
  data: {
    title?: string;
    description?: string;
    duration?: number;
    order?: number;
  }
): Promise<Lesson> => {
  if (!validateIds(videoId)) {
    throw new Error("Invalid video ID provided");
  }
  try {
    const response = await api.patch(`/admin/videos/${videoId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update video:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to update video: ${error.message}`);
    } else {
      throw new Error("Failed to update video: Unknown error occurred");
    }
  }
};

export const getPresignedUrlForVideo = async (video: { videoUrl: string }) => {
  // Call backend to get presigned URL
  const response = await api.get(
    `/admin/videos/presigned-url?videoUrl=${encodeURIComponent(video.videoUrl)}`
  );

  const data = response.data;

  console.log("Received presigned URL:", data.presignedUrl);
  return data.presignedUrl;
};

/**
 * Récupère les chapitres d'un cours depuis l'API backend.
 * @param courseId L'identifiant du cours
 */
export async function getChaptersByCourseId(
  courseId: string
): Promise<CourseSummary> {
  try {
    const response = await api.get(`/chapters/by-course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch chapters: ${error.message}`);
    } else {
      throw new Error("Failed to fetch chapters: Unknown error occurred");
    }
  }
}

export const deleteVideo = async (videoId: string): Promise<void> => {
  if (!validateIds(videoId)) {
    throw new Error("Invalid video ID provided");
  }
  try {
    console.log(`Deleting video with ID: ${videoId}`);
    await api.delete(`/lessons/${videoId}`);
  } catch (error) {
    console.error("Failed to delete video:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    } else {
      throw new Error("Failed to delete video: Unknown error occurred");
    }
  }
};

// Special Operations with enhanced validation
export const mergeChapters = async (
  sourceChapterId: string,
  targetChapterId: string
): Promise<void> => {
  if (!validateIds(sourceChapterId, targetChapterId)) {
    throw new Error("Invalid chapter IDs provided for merge operation");
  }

  if (sourceChapterId === targetChapterId) {
    throw new Error("Source and target chapter IDs cannot be the same");
  }

  await api.post(`/chapters/merge`, { sourceChapterId, targetChapterId });
};

export const moveVideo = async (
  videoId: string,
  fromChapterId: string,
  toChapterId: string,
  newOrder: number
): Promise<void> => {
  // Enhanced validation
  if (!validateIds(videoId, fromChapterId, toChapterId)) {
    const errorDetails = {
      videoId: videoId || "undefined",
      fromChapterId: fromChapterId || "undefined",
      toChapterId: toChapterId || "undefined",
    };
    console.error("Invalid IDs provided to moveVideo:", errorDetails);
    throw new Error(
      `Invalid IDs provided for video move operation: ${JSON.stringify(
        errorDetails
      )}`
    );
  }

  if (fromChapterId === toChapterId) {
    throw new Error("Source and target chapter IDs cannot be the same");
  }

  if (typeof newOrder !== "number" || newOrder < 0) {
    throw new Error("Invalid order value provided");
  }

  try {
    const requestBody = {
      fromChapterId,
      toChapterId,
      newOrder,
    };

    const response = await api.post(`/admin/${videoId}/move`, requestBody);

    return response.data;
  } catch (error) {
    console.error("API call failed for video move:", error);

    if (error instanceof Error) {
      throw new Error(`Failed to move video: ${error.message}`);
    } else {
      throw new Error("Failed to move video: Unknown error occurred");
    }
  }
};

export const batchUpdateVideos = async (
  operations: VideoMoveOperation[]
): Promise<void> => {
  if (!operations || operations.length === 0) {
    return; // Nothing to process
  }

  // Validate all operations before sending
  const invalidOperations = operations.filter(
    (op) =>
      !validateIds(op.videoId, op.fromChapterId, op.toChapterId) ||
      typeof op.newOrder !== "number" ||
      op.newOrder < 0
  );

  if (invalidOperations.length > 0) {
    console.error("Invalid operations found:", invalidOperations);
    throw new Error(
      `Invalid operations detected: ${invalidOperations.length} out of ${operations.length}`
    );
  }

  try {
    await api.post(`/lessons/batch-update`, { operations });
  } catch (error) {
    console.error("Batch update failed:", error);
    throw new Error(
      `Failed to batch update videos: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const moveNewVideoToExisting = async (
  videoData: any,
  targetChapterId: string,
  newOrder: number
): Promise<Lesson> => {
  if (!validateIds(targetChapterId)) {
    throw new Error("Invalid target chapter ID provided");
  }

  if (typeof newOrder !== "number" || newOrder < 0) {
    throw new Error("Invalid order value provided");
  }

  const response = await api.post(`/chapters/${targetChapterId}/lessons/new`, {
    ...videoData,
    order: newOrder,
  });
  return response.data;
};

// File Upload
// Note: Video duration will be calculated by the backend from the actual file

// Future improvement: Could implement chunked uploads for very large files

// Progress callback type
export type UploadProgressCallback = (progress: number) => void;

export const uploadVideos = async (
  courseId: string,
  files: File[],
  metadata: any,
  onProgress?: UploadProgressCallback
): Promise<void> => {
  if (!validateIds(courseId)) {
    throw new Error("Invalid course ID provided");
  }

  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  try {
    const formData = new FormData();

    // Collect file metadata
    const fileNames: string[] = [];
    const fileSizes: string[] = [];
    const fileTypes: string[] = [];

    // Add all video files to FormData
    files.forEach((file) => {
      formData.append("files", file);

      // Collect metadata for batch append
      fileNames.push(file.name);
      fileSizes.push(file.size.toString());
      fileTypes.push(file.type);
    });

    // Append metadata arrays
    fileNames.forEach((name) => formData.append("fileNames", name));
    fileSizes.forEach((size) => formData.append("fileSizes", size));
    fileTypes.forEach((type) => formData.append("fileTypes", type));

    // Add metadata as a JSON string in FormData (better than URL parameter)
    const metadataPayload = {
      chapters: metadata.chapters.map((chapter: any) => ({
        chapterId: chapter.chapterId, // phaseNumber (devient l'order du Chapter dans le backend)
        number: chapter.number,
        title: chapter.title, // Titre de la phase (devient le titre du Chapter)
        description: chapter.description, // Description de la phase
        chapterName: chapter.chapterName, // Nom du mini-chapitre (pour regrouper les leçons)
        videos: chapter.videos.map((video: any, videoIndex: number) => ({
          name: video.name,
          title: video.title,
          description: video.description,
          order: videoIndex + 1,
          skills: video.skills || [],
          referenceUrl: video.referenceUrl || "",
          chapterName: video.chapterName, // Nom du mini-chapitre (pour la leçon)
          // Let backend calculate duration from actual file
          originalFileName: files.find((f) => f.name === video.name)?.name,
        })),
      })),
    };

    // Add metadata as FormData field instead of URL parameter
    formData.append("metadata", JSON.stringify(metadataPayload));
    formData.append("courseId", courseId);

    console.log("Uploading videos with metadata:", metadataPayload);

    // Send to backend endpoint
    const response = await api.post(
      `/admin/courses/${courseId}/upload-videos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add progress tracking
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.(percentCompleted);
          }
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Video upload failed:", error);
    throw new Error(
      `Failed to upload videos: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
