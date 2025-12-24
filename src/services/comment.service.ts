import api from "../lib/axios";
import type { Comment, LessonCommentPayload } from "@/types";

/**
 * Récupère les réponses à un commentaire
 * @param lessonId - ID de la leçon
 * @param commentId - ID du commentaire parent
 * @returns Liste des réponses au commentaire ou une erreur
 */
export const getCommentReplies = async (
  lessonId: string,
  commentId: string
): Promise<{ data: Comment[]; error?: string }> => {
  try {
    const response = await api.get(`/lessons/${lessonId}/comments/${commentId}/replies`);
    return { data: response.data };
  } catch (error: any) {
    console.error(`Failed to get replies for lesson: ${lessonId}, comment: ${commentId}`, error);
    return { 
      data: [], 
      error: error?.response?.data?.message || error?.message || "Erreur lors du chargement des réponses" 
    };
  }
};

/**
 * Ajoute un nouveau commentaire à une leçon
 * @param lessonId - ID de la leçon
 * @param content - Contenu du commentaire
 * @returns Le commentaire créé ou une erreur
 */
export const addComment = async (
  lessonId: string,
  content: string
): Promise<{ data: Comment | null; error?: string }> => {
  try {
    const response = await api.post(`/lessons/${lessonId}/comments`, {
      content,
    });
    return { data: response.data };
  } catch (error: any) {
    console.error(`Failed to add comment for lesson: ${lessonId}`, error);
    return { 
      data: null, 
      error: error?.response?.data?.message || error?.message || "Erreur lors de l'ajout du commentaire" 
    };
  }
};

/**
 * Ajoute une réponse à un commentaire
 * @param lessonId - ID de la leçon
 * @param parentId - ID du commentaire parent
 * @param content - Contenu de la réponse
 * @returns La réponse créée ou une erreur
 */
export const addReply = async (
  lessonId: string,
  parentId: string,
  content: string
): Promise<{ data: Comment | null; error?: string }> => {
  try {
    const response = await api.post(
      `/lessons/${lessonId}/comments/${parentId}/replies`,
      { content }
    );
    return { data: response.data };
  } catch (error: any) {
    console.error(`Failed to add reply for lesson: ${lessonId}, comment: ${parentId}`, error);
    return { 
      data: null, 
      error: error?.response?.data?.message || error?.message || "Erreur lors de l'ajout de la réponse" 
    };
  }
};

/**
 * Modifie un commentaire existant
 * @param lessonId - ID de la leçon
 * @param commentId - ID du commentaire à modifier
 * @param content - Nouveau contenu du commentaire
 * @returns Le commentaire modifié ou une erreur
 */
export const updateComment = async (
  lessonId: string,
  commentId: string,
  content: string
): Promise<{ data: Comment | null; error?: string }> => {
  try {
    const response = await api.put(
      `/lessons/${lessonId}/comments/${commentId}`,
      { content }
    );
    return { data: response.data };
  } catch (error: any) {
    console.error(`Failed to update comment: ${commentId} for lesson: ${lessonId}`, error);
    return { 
      data: null, 
      error: error?.response?.data?.message || error?.message || "Erreur lors de la modification du commentaire" 
    };
  }
};

/**
 * Supprime un commentaire
 * @param lessonId - ID de la leçon
 * @param commentId - ID du commentaire à supprimer
 * @returns Succès ou erreur de la suppression
 */
export const deleteComment = async (
  lessonId: string,
  commentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await api.delete(`/lessons/${lessonId}/comments/${commentId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete comment: ${commentId} for lesson: ${lessonId}`, error);
    return { 
      success: false, 
      error: error?.response?.data?.message || error?.message || "Erreur lors de la suppression du commentaire" 
    };
  }
};

/**
 * Récupère les commentaires d'une leçon depuis l'API backend avec pagination.
 * @param lessonId L'identifiant de la leçon
 * @param page Le numéro de page (commence à 0)
 * @param size Le nombre de commentaires par page
 * @param includeReplyCounts Indique s'il faut inclure le nombre de réponses pour chaque commentaire
 * @returns Un objet contenant les commentaires et les informations de pagination
 */
export async function getLessonComments(
  lessonId: string,
  page: number = 0,
  size: number = 5,
  includeReplyCounts: boolean = true
): Promise<{ content: Comment[]; totalElements: number; error?: string }> {
  try {
    // Vérification de la valeur de includeReplyCounts dans la console
    const response = await api.get(`/lessons/${lessonId}/comments`, {
      params: {
        page,
        size,
        includeReplyCounts, // Paramètre pour demander les compteurs de réponses
        sort: "postedAt,desc", // Tri par date de publication décroissante
      },
    });

    // Si le backend renvoie déjà un objet Page, extrayons les données importantes
    if (
      response.data &&
      typeof response.data === "object" &&
      "content" in response.data
    ) {
      return {
        content: response.data.content || [],
        totalElements: response.data.totalElements || 0,
      };
    }

    // Si le backend renvoie directement le tableau de commentaires, supposons qu'il n'y a pas plus de commentaires
    return {
      content: Array.isArray(response.data) ? response.data : [],
      totalElements: Array.isArray(response.data) ? response.data.length : 0,
    };
  } catch (error: any) {
    console.error(`Failed to fetch comments for lesson: ${lessonId}`, error);
    // Retourner un objet avec une propriété d'erreur
    return {
      content: [],
      totalElements: 0,
      error: error?.response?.data?.message || error?.message || "Erreur lors du chargement des commentaires"
    };
  }
}

/**
 * Récupère les réponses d'un commentaire spécifique.
 * @param lessonId L'identifiant de la leçon
 * @param commentId L'identifiant du commentaire parent
 */
export async function getLessonCommentReplies(
  lessonId: string,
  commentId: string
): Promise<{ data: Comment[]; error?: string }> {
  try {
    const response = await api.get(
      `/lessons/${lessonId}/comments/${commentId}/replies`
    );
    return { data: response.data };
  } catch (error: any) {
    console.error(`Failed to fetch comment replies for lesson: ${lessonId}, comment: ${commentId}`, error);
    // Retourner un objet avec l'erreur et un tableau vide pour les données
    return { 
      data: [], 
      error: error?.response?.data?.message || error?.message || "Erreur lors du chargement des réponses" 
    };
  }
}

/**
 * Poste un commentaire ou une réponse pour une leçon.
 * @param lessonId L'identifiant de la leçon
 * @param content Le contenu du commentaire
 * @param parentId L'identifiant du commentaire parent (optionnel)
 */
export async function postLessonComment(
  lessonId: string,
  content: string,
  parentId?: string
): Promise<{ data: Comment | null; error?: string }> {
  try {
    const payload: LessonCommentPayload = { content };
    if (parentId) payload.parentId = parentId;
    const response = await api.post(`/lessons/${lessonId}/comments`, payload);
    return { data: response.data };
  } catch (error: any) {
    console.error(`Failed to post comment for lesson: ${lessonId}`, error);
    // Retourner un objet avec l'erreur et null pour les données
    return { 
      data: null, 
      error: error?.response?.data?.message || error?.message || "Erreur lors de l'ajout du commentaire" 
    };
  }
}