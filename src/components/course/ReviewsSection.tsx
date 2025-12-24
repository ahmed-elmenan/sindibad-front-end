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
  
  // Hooks for mutations
  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  
  // Separate current user's review from other reviews
  const userReview = reviews.find(review => review.canEdit === true);
  const otherReviews = reviews.filter(review => review.canEdit !== true);
  
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

  const handleEditReview = () => {
    setIsEditModalOpen(true);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {t('courseDetails.reviewsSection.title')}
            </CardTitle>
            {reviews.length > 0 && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} size="md" />
                </div>
                <span className="text-gray-600">
                  ({reviews.length} {t('courseDetails.reviewsSection.reviewsCount')})
                </span>
              </div>
            )}
          </div>
          {canManageReviews && !userReview && (
            <Button
              onClick={handleCreateReview}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('courseDetails.reviewsSection.addReview')}
            </Button>
          )}
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
            {/* Display current user's review first with highlighting */}
            {userReview && (
              <div className="border-2 border-orange-200 bg-orange-50/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    {t('courseDetails.reviewsSection.yourReview')}
                  </span>
                  <Button
                    onClick={handleEditReview}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-orange-700 font-semibold text-sm">
                      {userReview.name ? userReview.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">
                        {userReview.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={userReview.rating} size="sm" />
                      <span className="text-xs text-gray-500">
                        {new Date(userReview.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {userReview.comment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Display other reviews */}
            {otherReviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                    {review.name ? (
                      <span className="text-orange-600 font-semibold text-sm">
                        {review.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-orange-600 font-semibold text-sm">
                        U
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">
                        {review.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {otherReviews.length > 3 && (
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                {t('courseDetails.reviewsSection.seeAll')} ({reviews.length})
              </Button>
            )}
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
