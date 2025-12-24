import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import DOMPurify from "dompurify"
import type { Comment } from "@/types"
import { useTranslation } from "react-i18next"
import { toast } from "@/components/ui/sonner"
import { AddCommentForm } from "./AddCommentForm"
import { CommentsList } from "./CommentsList"
import { getRootCommentsSorted } from "@/utils"
import { useCommentsStore } from "@/stores/commentsStore"
import "@/styles/comments.css"

interface CommentsSectionProps {
  lessonId: string
  initialComments?: Comment[]
  canManage?: boolean
  onAddComment: (content: string) => Promise<Comment | null>
  onAddReply: (parentId: string, content: string) => Promise<Comment | null>
  onUpdateComment?: (commentId: string, content: string) => Promise<Comment | null>
  onDeleteComment?: (commentId: string) => Promise<void>
}

export function CommentsSection({ 
  lessonId, 
  initialComments = [], 
  canManage = false,
  onAddComment, 
  onAddReply,
  // onUpdateComment, // Commenté car non utilisé actuellement
  onDeleteComment
}: CommentsSectionProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir && i18n.dir() === "rtl"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [showAllComments, setShowAllComments] = useState(false);
  
  // Use the comments store - only import what we actually use in this component
  const {
    comments,
    isLoading,
    currentPage,
    commentsLoaded,
    totalComments,
    expandedReplies,
    expandedComments,
    loadComments,
    addComment: addCommentToStore,
    addReply: addReplyToStore,
    deleteComment: deleteCommentFromStore,
    collapseReplies,
    expandComment,
    collapseComment,
    initializeComments
  } = useCommentsStore();

  // We don't need these wrapper functions as they're not used in the component
  // The store functions are called directly in other handler functions

  /**
   * Initialise les commentaires à partir des commentaires initiaux
   * ou charge les commentaires depuis l'API si nécessaire
   */
  useEffect(() => {
    // Variable pour éviter des chargements multiples
    let isDataLoading = false;
    
    if (initialComments.length > 0 && !commentsLoaded) {
      // Utiliser le store pour initialiser les commentaires
      initializeComments(lessonId, initialComments);
    } 
    else if (!commentsLoaded && lessonId && !isDataLoading) {
      // Utilisation d'un drapeau pour éviter des appels multiples
      const loadData = async () => {
        isDataLoading = true;
        try {
          // Limiter l'exécution avec un timeout de sécurité
          await Promise.race([
            loadComments(lessonId, 0, true),
            // Timeout de 15 secondes
            new Promise((resolve) => setTimeout(() => {
              console.warn("Loading comments timed out");
              resolve(null);
            }, 15000))
          ]);
        } catch (error) {
          console.error("Error in comments effect:", error);
        } finally {
          isDataLoading = false;
        }
      };
      
      loadData();
    }
  }, [lessonId, commentsLoaded, loadComments, initialComments, initializeComments]);
  
  // These helper functions are not used in the component, so they've been removed
  // We call addCommentToStore and addReplyToStore directly where needed

  /**
   * Trie les commentaires racines (non-réponses) dans l'ordre approprié
   * Utilise useMemo pour éviter des tris inutiles lors des re-renders
   * @returns Un tableau des commentaires racines triés
   */
  const sortedRootComments = useMemo(() => {
    return getRootCommentsSorted(comments);
  }, [comments]);

  /**
   * Gère la soumission d'une réponse à un commentaire
   * Sanitize le contenu, appelle l'API, et met à jour l'état local
   * @param e - L'événement de formulaire
   * @param parentId - L'identifiant du commentaire parent
   */
  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const sanitizedContent = DOMPurify.sanitize(replyContent.trim())
      
      // Limiter l'exécution pour éviter les appels multiples
      const newReply = await Promise.race([
        onAddReply(parentId, sanitizedContent),
        // Timeout de 10 secondes
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000))
      ]);
      
      if (newReply) {
        addReplyToStore(parentId, newReply);
        
        // Réinitialiser le formulaire uniquement en cas de succès
        setReplyContent("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error("Error adding reply:", error)
      // Pas besoin d'afficher un toast ici car onAddReply gère déjà l'affichage d'erreur
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Charge et affiche les réponses à un commentaire spécifique
   * @param commentId - L'identifiant du commentaire à développer
   */
  const handleExpandReplies = useCallback((commentId: string) => {
    // Call the store directly to load replies and expand them
    useCommentsStore.getState().loadReplies(lessonId, commentId);
    useCommentsStore.getState().expandReplies(commentId);
  }, [lessonId])

  /**
   * Masque les réponses d'un commentaire spécifique
   * @param commentId - L'identifiant du commentaire à replier
   */
  const handleCollapseReplies = useCallback((commentId: string) => {
    collapseReplies(commentId);
  }, [collapseReplies])

  /**
   * Développe un commentaire pour afficher son contenu complet
   * @param commentId - L'identifiant du commentaire à développer
   */
  const handleExpandComment = useCallback((commentId: string) => {
    expandComment(commentId);
  }, [expandComment])

  /**
   * Replie un commentaire pour n'afficher que son aperçu
   * @param commentId - L'identifiant du commentaire à replier
   */
  const handleCollapseComment = useCallback((commentId: string) => {
    collapseComment(commentId);
  }, [collapseComment])

  /**
   * Active le formulaire de réponse pour un commentaire spécifique
   * @param commentId - L'identifiant du commentaire auquel répondre
   */
  const handleStartReply = useCallback((commentId: string) => {
    setReplyingTo(commentId)
  }, [])

  /**
   * Met à jour le contenu de la réponse en cours de rédaction
   * @param content - Le nouveau contenu de la réponse
   */
  const handleReplyContentChange = useCallback((content: string) => {
    setReplyContent(content)
  }, [])

  /**
   * Annule la rédaction d'une réponse et réinitialise l'état
   */
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
    setReplyContent("")
  }, [])

  /**
   * Gère l'affichage de tous les commentaires ou leur limitation
   * Charge la page suivante de commentaires si nécessaire
   * @param show - True pour afficher tous les commentaires, False pour limiter
   */
  const handleShowAllComments = useCallback((show: boolean) => {
    if (show) {
      if (comments.length < totalComments) {
        loadComments(lessonId, currentPage + 1, false);
      }
      setShowAllComments(true);
    } else {
      setShowAllComments(show);
    }
  }, [comments.length, totalComments, currentPage, loadComments, lessonId])
  
  /**
   * Gère l'ajout d'un nouveau commentaire à la leçon
   * Appelle l'API et met à jour l'état local en cas de succès
   * @param content - Le contenu du commentaire à ajouter
   */
  const handleAddComment = async (content: string) => {
    try {
      // Limiter l'exécution pour éviter les appels multiples
      const newComment = await Promise.race([
        onAddComment(content),
        // Timeout de 10 secondes
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000))
      ]);
      
      if (newComment) {
        addCommentToStore(lessonId, newComment);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Pas besoin d'afficher un toast ici car onAddComment gère déjà l'affichage d'erreur
    }
  }

  /**
   * Gère l'ajout et la suppression des styles CSS pour le support RTL
   * Crée une feuille de style dynamique pour les éléments RTL
   */
  useEffect(() => {
    if (isRTL && !document.getElementById('rtl-comments-style')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'rtl-comments-style';
      styleElement.textContent = `
        .rtl-element {
          direction: rtl;
          text-align: right;
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      if (!isRTL) {
        const existingStyle = document.getElementById('rtl-comments-style');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      }
    };
  }, [isRTL]);
  
  /**
   * Gère la mise à jour d'un commentaire existant
   * @param updatedComment - Le commentaire mis à jour
   */
  // Adaptateur pour la mise à jour des commentaires depuis CommentRenderer
  const handleCommentUpdatedAdapter = useCallback((updatedComment: Comment) => {
    // Forcer une mise à jour immédiate de l'UI avec le commentaire mis à jour
    const store = useCommentsStore.getState();
    
    // Utiliser directement la fonction updateComment du store
    store.updateComment(updatedComment);
    
    // Note: Ne pas ajouter de toast ici car CommentActions.tsx affiche déjà une notification
  }, []);

  
  /**
   * Gère la suppression d'un commentaire existant
   * @param commentId - ID du commentaire à supprimer
   */
  const handleDeleteComment = async (commentId: string) => {
    try {
      // Forcer une mise à jour immédiate de l'UI avant d'appeler l'API
      // Mettre à jour localement l'état du store
      const store = useCommentsStore.getState();
      
      // Récupérer l'état actuel pour la mise à jour optimiste
      const { comments } = store;
      
      // Mise à jour optimiste: supprimer d'abord le commentaire de l'UI
      const updatedComments = comments.filter(c => c.id !== commentId);
      store.setComments(updatedComments);
      
      // Ensuite appeler l'API via le store
      await deleteCommentFromStore(lessonId, commentId, onDeleteComment);
      
    } catch (error) {
      console.error("Error in delete comment flow:", error);
      toast.error(t("comments.deleteError", "Erreur lors de la suppression"));
      
      // En cas d'erreur, recharger les commentaires pour rétablir l'état correct
      loadComments(lessonId, 0, true);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0 w-full max-w-full overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <AddCommentForm onAddComment={handleAddComment} isRTL={isRTL} />
      {isLoading && !commentsLoaded ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
        </div>
      ) : (
        <CommentsList
          comments={comments}
          totalComments={totalComments}
          sortedRootComments={sortedRootComments}
          lessonId={lessonId}
          isRTL={isRTL}
          t={t}
          expandedReplies={expandedReplies}
          expandedComments={expandedComments}
          replyingTo={replyingTo}
          replyContent={replyContent}
          isSubmitting={isSubmitting}
          showAllComments={showAllComments}
          canManage={canManage}
          onExpandReplies={handleExpandReplies}
          onCollapseReplies={handleCollapseReplies}
          onExpandComment={handleExpandComment}
          onCollapseComment={handleCollapseComment}
          onStartReply={handleStartReply}
          onReplyContentChange={handleReplyContentChange}
          onSubmitReply={handleReplySubmit}
          onCancelReply={handleCancelReply}
          onShowAllComments={handleShowAllComments}
          onCommentUpdated={handleCommentUpdatedAdapter}
          onCommentDeleted={handleDeleteComment}
        />
      )}
      
      {isLoading && commentsLoaded && (
        <div className="flex justify-center py-4">
          <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full"></div>
        </div>
      )}
    </div>
  )
}
