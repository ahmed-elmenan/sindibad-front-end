import { toast } from "@/components/ui/sonner";
import { postLessonComment } from "@/services/comment.service";
import type { Comment } from "@/types/Comment";
import { useTranslation } from "react-i18next";

interface UseCommentsProps {
  lessonId: string | undefined;
}

interface UseCommentsReturn {
  handleAddComment: (content: string) => Promise<Comment | null>;
  handleAddReply: (parentId: string, content: string) => Promise<Comment | null>;
}

export function useComments({ lessonId }: UseCommentsProps): UseCommentsReturn {
  const { t } = useTranslation();
  
  // Fonction principale pour ajouter un commentaire ou une réponse
  const addComment = async (content: string, parentId?: string): Promise<Comment | null> => {
    if (!lessonId) {
      toast.error("Identifiant de leçon manquant");
      return null;
    }
    
    try {
      // Limiter les appels en cas d'erreur en utilisant une promesse avec timeout
      const result = await Promise.race([
        postLessonComment(lessonId, content, parentId),
        // Timeout de 10 secondes pour éviter les blocages
        new Promise<{ data: null, error: string }>(resolve => 
          setTimeout(() => resolve({ 
            data: null, 
            error: "Délai d'attente dépassé" 
          }), 10000)
        )
      ]);
      
      // Vérifier s'il y a une erreur
      if (result.error || !result.data) {
        const errorMsg = parentId 
          ? t("lessonPage.addReplyError", "Erreur lors de l'ajout du sous-commentaire") 
          : t("lessonPage.addCommentError", "Erreur lors de l'ajout du commentaire");
        
        // Notification d'erreur
        toast.error(`${errorMsg}: ${result.error || "Erreur inconnue"}`);
        return null;
      }
      
      const commentWithDate = {
        ...result.data,
        postedAt: result.data.postedAt || new Date().toISOString()
      };
      
      // Notification différente selon qu'il s'agit d'un commentaire ou d'une réponse
      const messageKey = parentId 
        ? "lessonPage.addReplySuccess" 
        : "lessonPage.addCommentSuccess";
      
      // Notification de succès
      toast.success(t(messageKey));
      
      return commentWithDate;
    } catch (e) {
      // Cette partie ne devrait plus être exécutée car les erreurs sont gérées dans le bloc try
      // mais nous gardons ce bloc catch par sécurité
      console.error("Erreur inattendue lors de l'ajout du commentaire:", e);
      return null;
    }
  };

  // Fonction pour ajouter un nouveau commentaire
  const handleAddComment = async (content: string): Promise<Comment | null> => {
    return addComment(content);
  };

  // Fonction pour ajouter une réponse à un commentaire existant
  const handleAddReply = async (parentId: string, content: string): Promise<Comment | null> => {
    return addComment(content, parentId);
  };

  return {
    handleAddComment,
    handleAddReply
  };
}
