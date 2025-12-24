import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import type { Comment } from "@/types"

interface AddCommentFormProps {
  onAddComment: (content: string) => void
  onEditComment?: (commentId: string, content: string) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
  isRTL: boolean
  comment?: Comment
  canManage?: boolean
  isEditing?: boolean
  onCancelEdit?: () => void
  inDialog?: boolean // Indique si le formulaire est dans une boîte de dialogue
}

export function AddCommentForm({ 
  onAddComment, 
  onEditComment, 
  isRTL, 
  comment, 
  canManage = false,
  isEditing = false,
  onCancelEdit,
  inDialog = false
}: AddCommentFormProps) {
  const { t } = useTranslation()
  const [newComment, setNewComment] = useState(comment?.content || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Mettre à jour le commentaire lorsque nous passons en mode édition
  useEffect(() => {
    if (comment && isEditing) {
      setNewComment(comment.content)
    }
  }, [comment, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // Si on est en mode édition et qu'on a un commentaire, on l'édite
      if (isEditing && comment && onEditComment) {
        await onEditComment(comment.id, newComment.trim())
        if (onCancelEdit) onCancelEdit()
      } else {
        // Sinon, on ajoute un nouveau commentaire
        await onAddComment(newComment.trim())
        setNewComment("")
      }
    } catch (error) {
      console.error("Error with comment:", error)
      toast.error(isEditing ? t("comments.editError") : t("comments.addError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={isRTL ? "text-right" : "text-left"}>
        <Textarea
          id="comment"
          placeholder={t("comments.commentPlaceholder")}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          className={`resize-none w-full overflow-y-auto break-words ${isRTL ? "text-right" : "text-left"}`}
          style={{ 
            wordBreak: "break-word", 
            whiteSpace: "pre-wrap", 
            maxWidth: "100%",
            overflowWrap: "break-word"
          }}
        />
      </div>
      <div className={`flex gap-2 ${isRTL ? "justify-start" : "justify-start"}`}>
        <Button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting 
            ? (isEditing ? t("comments.updating") : t("comments.publishing"))
            : (isEditing ? t("comments.updateComment") : t("comments.publishComment"))}
        </Button>
        
        {isEditing && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            className="w-full sm:w-auto"
          >
            {t("common.cancel")}
          </Button>
        )}
        
        {/* Bouton de suppression uniquement quand on n'est pas dans une boîte de dialogue */}
        {canManage && comment && !inDialog && !isEditing && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("common.delete")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("comments.deleteConfirmTitle")}</DialogTitle>
              </DialogHeader>
              <p>{t("comments.deleteConfirmMessage")}</p>
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeleteDialog(false)}
                >
                  {t("common.cancel")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </form>
  );

  // Si le formulaire est dans une boîte de dialogue, on ne l'enveloppe pas dans une Card
  if (inDialog) {
    return formContent;
  }

  // Sinon, on utilise une Card comme avant
  return (
    <Card>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}
