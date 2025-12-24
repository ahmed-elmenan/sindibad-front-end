import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Trash2 } from "lucide-react";
import type { Review } from "@/types/Review";

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
  onSave: (updatedReview: { rating: number; comment: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function EditReviewModal({
  isOpen,
  onClose,
  review,
  onSave,
  onDelete,
}: EditReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") return;

    setIsSubmitting(true);
    try {
      await onSave({ rating, comment: comment.trim() });
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
  };

  const handleRatingHover = (newRating: number) => {
    setHoveredRating(newRating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {t('courseDetails.reviewsSection.editReview')}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('courseDetails.reviewsSection.editReviewDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {t('courseDetails.reviewsSection.rating')}
            </Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={handleRatingLeave}
                  className="p-1 rounded transition-colors hover:bg-orange-50"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                ({displayRating}/5)
              </span>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
              {t('courseDetails.reviewsSection.comment')}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('courseDetails.reviewsSection.commentPlaceholder')}
              className="min-h-[120px] resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-200"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {comment.length}/500 {t('courseDetails.reviewsSection.characters')}
              </span>
              {comment.trim() === "" && (
                <span className="text-red-500">
                  {t('courseDetails.reviewsSection.commentRequired')}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {/* Cancel and Save buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="border-gray-200 text-gray-600 hover:bg-orange-500"
              >
                {t('courseDetails.reviewsSection.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting || rating === 0 || comment.trim() === ""}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t('courseDetails.reviewsSection.saving')
                  : t('courseDetails.reviewsSection.saveChanges')}
              </Button>
            </div>

            {/* Separate Delete button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting || isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('courseDetails.reviewsSection.deleteReview')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {t('courseDetails.reviewsSection.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('courseDetails.reviewsSection.confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting 
                ? t('courseDetails.reviewsSection.deleting')
                : t('courseDetails.reviewsSection.confirmDeleteButton')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
