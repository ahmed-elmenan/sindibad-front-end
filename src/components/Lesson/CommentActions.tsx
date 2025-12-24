import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateComment } from "@/services/comment.service";
import { AddCommentForm } from "./AddCommentForm";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreVertical, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Comment } from "@/types";

interface CommentActionsProps {
  lessonId: string;
  comment: Comment;
  isRTL: boolean;
  isReply?: boolean;
  onCommentUpdated: (updatedComment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

export function CommentActions({ 
  lessonId, 
  comment, 
  isRTL, 
  onCommentUpdated, 
  onCommentDeleted 
}: CommentActionsProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const result = await updateComment(lessonId, commentId, content);
      
      // Vérifier si l'opération a réussi et si nous avons des données de commentaire
      if (result.data) {
        onCommentUpdated(result.data);
        setIsEditDialogOpen(false); // Fermer la boîte de dialogue
        toast.success(t("comments.updateSuccess"));
      } else if (result.error) {
        // Si nous avons une erreur spécifique
        toast.error(`${t("comments.updateError")}: ${result.error}`);
      } else {
        toast.error(t("comments.updateError"));
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error(t("comments.updateError"));
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Notifier le parent de supprimer le commentaire
      // Il s'occupera de l'appel API et de la mise à jour de l'UI
      onCommentDeleted(comment.id);
      
      // Fermer la boîte de dialogue de confirmation
      setIsDeleteDialogOpen(false);
      
      // Pas besoin d'afficher un toast ici, cela sera géré par le parent
    } catch (error) {
      console.error("Error during comment deletion process:", error);
      toast.error(t("comments.deleteError"));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 focus-visible:ring-0 hover:bg-gray-100 hover:text-black text-black rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-36 p-1 shadow-md border border-gray-200">
            <DropdownMenuItem 
              onClick={handleEdit} 
              className="cursor-pointer hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-black"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-destructive cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialogue d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-5 shadow-lg border rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{t("comments.editCommentTitle")}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <AddCommentForm
              onAddComment={() => {}} // Pas utilisé en mode édition
              onEditComment={handleUpdateComment}
              isRTL={isRTL}
              comment={comment}
              canManage={true}
              isEditing={true}
              onCancelEdit={handleCancelEdit}
              inDialog={true} // Indique que le formulaire est dans une boîte de dialogue
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px] w-[95vw] p-5 shadow-lg border rounded-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              {t("comments.deleteTitle", "Supprimer le commentaire")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="rounded-full bg-red-50 p-2.5">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-base break-words">
              {t("comments.deleteConfirmation", "Êtes-vous sûr de vouloir supprimer ce commentaire ?")}
            </p>
            <div className="flex items-center justify-center mt-2 text-amber-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <p className="text-sm">
                {t("comments.deleteWarning", "Cette action est irréversible.")}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-4 w-full max-w-full">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              className="flex-1 px-4"
              size="lg"
            >
              {t("comments.cancel", "Annuler")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="flex-1 px-4"
              size="lg"
              disabled={isDeleting}
            >
              {isDeleting 
                ? t("comments.deleting", "Suppression...") 
                : t("comments.confirmDelete", "Supprimer")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
