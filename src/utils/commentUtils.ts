import type { Comment } from "@/types"

/**
 * Trie les commentaires par date de création (plus récents en premier)
 * @param comments - Liste des commentaires à trier
 * @returns Liste triée des commentaires
 */
export function sortCommentsByDate(comments: Comment[]): Comment[] {
  return [...comments].sort((a, b) => {
    // Gérer les cas où postedAt pourrait être undefined ou invalide
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
    
    // Si les dates sont invalides, les mettre à la fin
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    
    return dateB - dateA; // Plus récents en premier
  });
}

/**
 * Filtre et trie les commentaires racines (sans parentId) par date
 * @param comments - Liste complète des commentaires
 * @returns Liste triée des commentaires racines
 */
export function getRootCommentsSorted(comments: Comment[]): Comment[] {
  return sortCommentsByDate(comments.filter(c => !c.parentId))
}

/**
 * Filtre et trie les réponses d'un commentaire par date
 * @param comment - Le commentaire parent
 * @returns Liste triée des réponses ou tableau vide
 */
export function getRepliesSorted(comment: Comment): Comment[] {
  return comment.replies ? sortCommentsByDate(comment.replies) : []
}

/**
 * Fonction utilitaire pour tronquer les commentaires longs
 * @param content - Le contenu du commentaire à tronquer
 * @param maxLength - Longueur maximale autorisée (par défaut 300)
 * @returns Le contenu tronqué avec "..." si nécessaire
 */
export function truncateComment(content: string, maxLength = 300): string {
  if (content.length <= maxLength) return content;
  
  // Tronquer le texte
  const truncated = content.substring(0, maxLength);
  // Éviter de couper un mot en plein milieu
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  
  // Retourner jusqu'au dernier espace complet + ellipse
  return truncated.substring(0, lastSpaceIndex) + "...";
}
