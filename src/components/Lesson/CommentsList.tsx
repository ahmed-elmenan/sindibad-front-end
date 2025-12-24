import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Comment } from "@/types"
import type { TFunction } from "i18next"
import { CommentRenderer } from "./CommentRenderer"

interface CommentsListProps {
  comments: Comment[]
  sortedRootComments: Comment[]
  // Ajout du nombre total de commentaires
  totalComments?: number
  isRTL: boolean
  t: TFunction
  expandedReplies: string[]
  expandedComments: string[]
  replyingTo: string | null
  replyContent: string
  isSubmitting: boolean
  showAllComments: boolean
  lessonId: string
  canManage?: boolean
  onExpandReplies: (commentId: string) => void
  onCollapseReplies: (commentId: string) => void
  onExpandComment: (commentId: string) => void
  onCollapseComment: (commentId: string) => void
  onStartReply: (commentId: string) => void
  onReplyContentChange: (content: string) => void
  onSubmitReply: (e: React.FormEvent, parentId: string) => void
  onCancelReply: () => void
  onShowAllComments: (show: boolean) => void
  onCommentUpdated: (updatedComment: Comment) => void
  onCommentDeleted: (commentId: string) => void
}

export function CommentsList({
  comments,
  sortedRootComments,
  totalComments,
  isRTL,
  t,
  expandedReplies,
  expandedComments,
  replyingTo,
  replyContent,
  isSubmitting,
  showAllComments,
  lessonId,
  canManage = false,
  onExpandReplies,
  onCollapseReplies,
  onExpandComment,
  onCollapseComment,
  onStartReply,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  onShowAllComments,
  onCommentUpdated,
  onCommentDeleted
}: CommentsListProps) {
  // Utiliser le nombre total de commentaires s'il est fourni, sinon utiliser le nombre de commentaires chargés
  const commentCount = totalComments !== undefined ? totalComments : comments.length;
  
  return (
    <div className="space-y-0">
      <h3 className={`font-semibold text-lg sm:text-xl mb-2 ${isRTL ? "text-right" : ""}`}>
        {t("comments.commentsCount", { count: commentCount })}
      </h3>
      {comments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {t("comments.noComments")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Afficher uniquement les commentaires racines (ceux sans parentId) */}
          <CommentRenderer
            commentsList={
              showAllComments
                ? sortedRootComments
                : sortedRootComments.slice(0, 5)
            }
            lessonId={lessonId}
            isRTL={isRTL}
            t={t}
            expandedReplies={expandedReplies}
            expandedComments={expandedComments}
            replyingTo={replyingTo}
            replyContent={replyContent}
            isSubmitting={isSubmitting}
            canManage={canManage}
            onExpandReplies={onExpandReplies}
            onCollapseReplies={onCollapseReplies}
            onExpandComment={onExpandComment}
            onCollapseComment={onCollapseComment}
            onStartReply={onStartReply}
            onReplyContentChange={onReplyContentChange}
            onSubmitReply={onSubmitReply}
            onCancelReply={onCancelReply}
            onCommentUpdated={onCommentUpdated}
            onCommentDeleted={onCommentDeleted}
          />
          {/* Afficher "Voir plus" si nous sommes en mode réduit ET s'il y a plus de 5 commentaires au total */}
          {!showAllComments && totalComments !== undefined && totalComments > 5 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold"
                onClick={() => onShowAllComments(true)}
              >
                {t("comments.seeMoreComments")} 
                ({totalComments - (showAllComments ? sortedRootComments.length : 5)} {t("comments.more")})
              </Button>
            </div>
          )}
          {/* Afficher "Voir moins" si nous sommes en mode étendu ET s'il y a plus de 5 commentaires chargés */}
          {showAllComments && sortedRootComments.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold"
                onClick={() => onShowAllComments(false)}
              >
                {t("comments.seeLessComments")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
