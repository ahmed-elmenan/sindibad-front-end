import type React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";
import type { Comment } from "@/types";
import type { TFunction } from "i18next";
import { formatRelativeTime, truncateComment } from "@/utils";
import { CommentActions } from "./CommentActions";

interface CommentRendererProps {
  /**
   * Liste des commentaires à afficher
   */
  commentsList: Comment[];
  /**
   * ID de la leçon
   */
  lessonId: string;
  /**
   * Indique si ce sont des réponses (pour le style)
   */
  isReply?: boolean;
  /**
   * Support RTL
   */
  isRTL: boolean;
  /**
   * Fonction de traduction
   */
  t: TFunction;
  /**
   * Commentaires avec réponses étendues
   */
  expandedReplies: string[];
  /**
   * Commentaires avec contenu étendu
   */
  expandedComments: string[];
  /**
   * ID du commentaire en cours de réponse
   */
  replyingTo: string | null;
  /**
   * Contenu de la réponse en cours
   */
  replyContent: string;
  /**
   * État de soumission
   */
  isSubmitting: boolean;
  /**
   * Indique si l'utilisateur peut gérer ce commentaire (éditer, supprimer)
   */
  canManage?: boolean;
  /**
   * Callbacks
   */
  onExpandReplies: (commentId: string) => void;
  onCollapseReplies: (commentId: string) => void;
  onExpandComment: (commentId: string) => void;
  onCollapseComment: (commentId: string) => void;
  onStartReply: (commentId: string) => void;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (e: React.FormEvent, parentId: string) => void;
  onCancelReply: () => void;
  onCommentUpdated: (updatedComment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

/**
 * Composant pour afficher les commentaires de manière récursive
 */
export function CommentRenderer({
  commentsList,
  lessonId,
  isReply = false,
  isRTL,
  t,
  expandedReplies,
  expandedComments,
  replyingTo,
  replyContent,
  isSubmitting,
  canManage = false,
  onExpandReplies,
  onCollapseReplies,
  onExpandComment,
  onCollapseComment,
  onStartReply,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  onCommentUpdated,
  onCommentDeleted,
}: CommentRendererProps) {
  
  return (
    <>
      {commentsList.map((comment) => {
        // Gestion du "voir plus" pour les replies
        const showAllReplies = expandedReplies.includes(comment.id);

        return (
          <div
            key={comment.id}
            className={`flex ${
              isReply
                ? isRTL
                  ? "mr-4 sm:mr-10 mt-4"
                  : "ml-4 sm:ml-10 mt-4"
                : "border-b border-muted py-6"
            } ${isRTL ? "flex-row-reverse" : ""}`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className={`flex-shrink-0 ${isRTL ? "order-1" : ""}`}>
              <Avatar className={isReply ? "w-8 h-8" : "w-10 h-10"}>
                <AvatarImage src={comment.userAvatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {comment.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div
              className={`flex-1 min-w-0 ${
                isRTL ? "mr-4 text-right" : "ml-4"
              } ${isRTL ? "order-0" : ""}`}
            >
              <div
                className={`flex items-center justify-between ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-2 flex-wrap flex-1 ${
                    isRTL ? "justify-start" : ""
                  }`}
                >
                  <span className="font-semibold text-sm">
                    @{comment.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.postedAt, t)}
                  </span>
                  {!isReply && comment.userRole === "ADMIN" && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Badge variant="outline" className="text-xs mt-1">
                        {comment.userRole}
                      </Badge>
                    </>
                  )}
                  {canManage && (
                    <span className="flex-shrink-0 flex items-center">
                      <CommentActions
                        lessonId={lessonId}
                        comment={comment}
                        isRTL={isRTL}
                        isReply={isReply}
                        onCommentUpdated={onCommentUpdated}
                        onCommentDeleted={onCommentDeleted}
                      />
                    </span>
                  )}
                </div>
                {/* Menu d'actions si l'utilisateur peut gérer ce commentaire */}
              </div>
              <div
                className={`mt-1 text-sm ${
                  isReply ? "text-muted-foreground" : "text-foreground"
                } leading-relaxed ${isRTL ? "text-right" : ""} break-words`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                {comment.content.length > 300 &&
                !expandedComments.includes(comment.id) ? (
                  <>
                    <div
                      className="comment-truncated"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          truncateComment(comment.content)
                        ),
                      }}
                    />
                    <Button
                      variant="link"
                      className="text-xs p-0 mt-1 h-auto"
                      onClick={() => onExpandComment(comment.id)}
                    >
                      {t("comments.showMore") || "Voir plus"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div
                      className={
                        comment.content.length > 300 ? "comment-expanded" : ""
                      }
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(comment.content),
                      }}
                    />
                    {comment.content.length > 300 &&
                      expandedComments.includes(comment.id) && (
                        <Button
                          variant="link"
                          className="text-xs p-0 mt-1 h-auto"
                          onClick={() => onCollapseComment(comment.id)}
                        >
                          {t("comments.showLess") || "Voir moins"}
                        </Button>
                      )}
                  </>
                )}
              </div>
              <div
                className={`flex items-center gap-2 mt-2 ${
                  isRTL ? "justify-start rtl-element" : ""
                }`}
              >
                <Button
                  variant="link"
                  className="text-xs py-1"
                  onClick={() => onStartReply(comment.id)}
                >
                  <MessageCircle
                    className={`w-4 h-4 ${isRTL ? "order-1 ml-1" : "mr-1"}`}
                  />
                  <span>{t("comments.reply")}</span>
                </Button>
              </div>
              {replyingTo === comment.id && (
                <form
                  onSubmit={(e) => onSubmitReply(e, comment.id)}
                  className="mt-2 space-y-2"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <Textarea
                    value={replyContent}
                    onChange={(e) => onReplyContentChange(e.target.value)}
                    rows={2}
                    placeholder={t("comments.replyPlaceholder")}
                    className={`resize-none w-full overflow-y-auto break-words ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      maxWidth: "100%",
                      overflowWrap: "break-word",
                    }}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <div
                    className={`flex gap-2 ${
                      isRTL ? "justify-start flex-row-reverse" : "justify-start"
                    }`}
                  >
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyContent.trim() || isSubmitting}
                    >
                      {isSubmitting
                        ? t("comments.publishing")
                        : t("comments.publishReply")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={onCancelReply}
                    >
                      {t("comments.cancel")}
                    </Button>
                  </div>
                </form>
              )}
              {/* Affichage des réponses */}
              {/* Cas 1: Réponses chargées et affichées */}
              {showAllReplies &&
                comment.replies &&
                comment.replies.length > 0 && (
                  <div className={`mt-2 ${isRTL ? "text-right" : ""}`}>
                    <CommentRenderer
                      commentsList={comment.replies}
                      lessonId={lessonId}
                      isReply={true}
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
                    <div className={`${isRTL ? "text-left" : ""}`}>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs mt-1 font-semibold !text-black"
                        onClick={() => onCollapseReplies(comment.id)}
                      >
                        {t("comments.hideReplies")}
                      </Button>
                    </div>
                  </div>
                )}

              {/* Cas 2: Réponses non chargées ou non affichées mais le compteur indique qu'il y en a */}
              {!showAllReplies && (comment.replyCount ?? 0) > 0 && (
                <div className={`${isRTL ? "text-left" : ""}`}>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs mt-1 font-semibold !text-black"
                    onClick={() => {
                      onExpandReplies(comment.id);
                    }}
                  >
                    {t("comments.showReplies")} ({comment.replyCount}{" "}
                    {comment.replyCount === 1
                      ? t("comments.reply")
                      : t("comments.replies")}
                    )
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
