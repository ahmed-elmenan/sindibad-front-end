import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/types/Review";
import StarRating from "@/components/course/StarRating";
import EditReviewModal from "@/components/course/EditReviewModal";
import AddReviewModal from "@/components/course/AddReviewModal";
import { useAddReview, useUpdateReview, useDeleteReview } from "@/hooks/useCourseQueries";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

interface ReviewsSectionProps {
  reviews: Review[];
  courseId: string;
  canManageReviews?: boolean;
}

export default function ReviewsSection({ 
  reviews, 
  courseId,
  canManageReviews = false
}: ReviewsSectionProps) {
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<string, boolean>>({});
  
  // Hooks for mutations
  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  
  // Separate current user's review from other reviews
  const userReview = reviews.find(review => review.canEdit === true);
  // const otherReviews = reviews.filter(review => review.canEdit !== true);
  
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  const handleCreateReview = () => {
    setIsAddModalOpen(true);
  };

  const handleAddReview = async (reviewData: { rating: number; comment: string }) => {
    try {
      await addReviewMutation.mutateAsync({
        courseId,
        reviewData
      });
      toast.success({
        title: t("courseDetails.reviewsSection.addSuccess"),
        description: t("courseDetails.reviewsSection.addSuccessDescription")
      });
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error({
        title: t("courseDetails.reviewsSection.addError"),
        description: t("courseDetails.reviewsSection.addErrorDescription")
      });
      throw error;
    }
  };

  const handleSaveReview = async (updatedData: { rating: number; comment: string }) => {
    if (!userReview) return;
    
    try {
      await updateReviewMutation.mutateAsync({
        reviewId: userReview.id,
        updateData: updatedData
      });
      toast.success({
        title: t("courseDetails.reviewsSection.updateSuccess"),
        description: t("courseDetails.reviewsSection.updateSuccessDescription")
      });
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error({
        title: t("courseDetails.reviewsSection.updateError"),
        description: t("courseDetails.reviewsSection.updateErrorDescription")
      });
      throw error;
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    try {
      await deleteReviewMutation.mutateAsync(userReview.id);
      toast.success({
        title: t("courseDetails.reviewsSection.deleteSuccess"),
        description: t("courseDetails.reviewsSection.deleteSuccessDescription")
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error({
        title: t("courseDetails.reviewsSection.deleteError"),
        description: t("courseDetails.reviewsSection.deleteErrorDescription")
      });
      throw error;
    }
  };

  return (
    <Card className="bg-white border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg md:text-xl font-semibold text-gray-800 flex items-start gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <span>{t('courseDetails.reviewsSection.title')}</span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-50 text-yellow-600 rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                  {Math.round(averageRating * 10) / 10}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-gray-800">{t('courseDetails.reviewsSection.overall')}</div>
                  <div className="text-xs text-gray-500">({reviews.length} {t('courseDetails.reviewsSection.reviewsCount')})</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {canManageReviews && !userReview ? (
              <Button
                onClick={handleCreateReview}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('courseDetails.reviewsSection.addReview')}
              </Button>
            ) : (
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="ghost"
                size="sm"
                className="text-gray-600"
              >
                {t('courseDetails.reviewsSection.seeAll')} ({reviews.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {t('courseDetails.reviewsSection.noReviews')}
            </p>
            {canManageReviews && (
              <Button
                onClick={handleCreateReview}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-500"
              >
                <Plus className="h-4 w-4" />
                {t('courseDetails.reviewsSection.beFirst')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {reviews.slice(0, visibleCount).map((review) => {
                const isUser = review.canEdit === true;
                const isExpanded = !!expandedReviewIds[review.id];
                const truncated = review.comment.length > 300;
                const displayComment = isExpanded ? review.comment : (truncated ? review.comment.slice(0, 300) + '...' : review.comment);
                return (
                  <div key={review.id} className={`p-4 rounded-lg border ${isUser ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100 bg-white'} shadow-sm`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-semibold">
                        {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{review.name}</div>
                            <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                            {isUser && (
                              <Button
                                onClick={() => setIsEditModalOpen(true)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-orange-600"
                                aria-label="Edit review"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                        </div>
                        <div className="mt-3 text-gray-700 text-sm leading-relaxed">
                          {displayComment}
                        </div>
                        {truncated && (
                          <div className="mt-2">
                            <button
                              className="text-xs text-blue-600 hover:underline"
                              onClick={() => setExpandedReviewIds(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                            >
                              {isExpanded ? t('courseDetails.reviewsSection.showLess') : t('courseDetails.reviewsSection.readMore')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center mt-2">
              {visibleCount < reviews.length ? (
                <Button onClick={() => setVisibleCount(c => Math.min(reviews.length, c + 5))} className="w-48">
                  {t('courseDetails.reviewsSection.loadMore')} (+5)
                </Button>
              ) : (
                reviews.length > 5 && (
                  <Button variant="outline" onClick={() => setVisibleCount(5)} className="w-48">
                    {t('courseDetails.reviewsSection.showLess')} ({reviews.length})
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Edit review modal */}
      {userReview && (
        <EditReviewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          review={userReview}
          onSave={handleSaveReview}
          onDelete={handleDeleteReview}
        />
      )}

      {/* Add review modal */}
      <AddReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddReview}
      />
    </Card>
  );
}
