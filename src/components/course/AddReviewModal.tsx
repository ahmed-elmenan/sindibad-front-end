import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reviewData: { rating: number; comment: string }) => Promise<void>;
}

export default function AddReviewModal({
  isOpen,
  onClose,
  onSave,
}: AddReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") return;

    setIsSubmitting(true);
    try {
      await onSave({ rating, comment: comment.trim() });
      // Reset form
      setRating(0);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error adding review:", error);
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

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      onClose();
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {t('courseDetails.reviewsSection.addReview')}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('courseDetails.reviewsSection.addReviewDescription')}
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
            {rating === 0 && (
              <p className="text-xs text-red-500">
                {t('courseDetails.reviewsSection.ratingRequired')}
              </p>
            )}
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
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-gray-200 text-gray-600 hover:bg-orange-500"
            >
              {t('courseDetails.reviewsSection.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim() === ""}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? t('courseDetails.reviewsSection.adding')
                : t('courseDetails.reviewsSection.addReviewButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
