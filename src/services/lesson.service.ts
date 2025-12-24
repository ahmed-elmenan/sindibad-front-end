import api from "@/lib/axios";
import type { AxiosError } from "axios";
import type { Lesson } from "@/types";
import type { Resource } from "@/types/Resource";

/**
 * Vérifie et récupère la leçon sécurisée depuis le backend.
 * @param lessonId L'identifiant de la leçon
 */
export async function fetchAccessToLessonById(
  lessonId: string
): Promise<Lesson> {
  try {
    const response = await api.get(`/lessons/access/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch lesson: ${lessonId}`);
    handleApiError(error);
  }
}

/**
 * Récupère la prochaine leçon disponible pour un cours donné et une leçon actuelle.
 * @param currentLessonId L'identifiant de la leçon actuelle
 * @param courseId L'identifiant du cours
 */
export async function getNextResource(
  courseId: string,
  currentResourceId: string
): Promise<Resource | null> {
  try {
    const response = await api.get(
      `/lessons/next/course/${courseId}/resource/${currentResourceId}`
    );
    return response.data;
  } catch (err) {
    console.error(`Failed to fetch next resource for course: ${courseId}`, err);
    console.error(
      `Failed to fetch next resource for course: ${courseId}, currentResourceId: ${currentResourceId}`,
      err
    );
    return null;
  }
}

/**
 * Supprime une leçon et ses ressources associées (vidéo et miniature dans S3)
 * @param lessonId L'identifiant de la leçon à supprimer
 */
export async function deleteLesson(lessonId: string): Promise<void> {
  try {
    await api.delete(`/lessons/${lessonId}`);
    console.log(`✅ Leçon ${lessonId} supprimée avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de la leçon ${lessonId}:`, error);
    handleApiError(error);
  }
}

function handleApiError(error: unknown): never {
  const axiosError = error as AxiosError;
  let message: string;

  if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
    // Handle structured error response
    message = axiosError.response.data.error || axiosError.response.data.message || 'Unknown error';
  } else if (typeof axiosError.response?.data === 'string') {
    // Handle string error response
    message = axiosError.response.data;
  } else {
    message = axiosError.message || 'Unknown error';
  }

  console.error('API Error:', message);
  throw new Error(message);
}
