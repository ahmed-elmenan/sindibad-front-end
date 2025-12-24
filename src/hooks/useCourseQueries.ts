import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourseById,
  getCourseReviews,
  getCourseChapters,
  getCoursePacks,
  getCourseSubscription,
  addCourseReview,
  updateCourseReview,
  deleteCourseReview
} from '@/services/course.service';

// Hook to fetch a course
export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to fetch course reviews
export const useCourseReviews = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => getCourseReviews(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Hook to fetch course chapters
export const useCourseChapters = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-chapters', courseId],
    queryFn: () => getCourseChapters(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Hook to fetch course packs
export const useCoursePacks = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-packs', courseId],
    queryFn: () => getCoursePacks(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook to fetch user subscription data
export const useCourseSubscription = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['user-data', courseId],
    queryFn: () => getCourseSubscription(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

// Hook to add a new review
export const useAddReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, reviewData }: { 
      courseId: string; 
      reviewData: { rating: number; comment: string } 
    }) => addCourseReview(courseId, reviewData),
    onSuccess: () => {
      // Refetch reviews after adding
      queryClient.invalidateQueries({ queryKey: ['course-reviews'] });
    },
  });
};

// Hook to update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reviewId, updateData }: { 
      reviewId: string; 
      updateData: { rating: number; comment: string } 
    }) => updateCourseReview(reviewId, updateData),
    onSuccess: () => {
      // Refetch reviews after updating
      queryClient.invalidateQueries({ queryKey: ['course-reviews'] });
    },
  });
};

// Hook to delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewId: string) => deleteCourseReview(reviewId),
    onSuccess: () => {
      // Refetch reviews after deletion
      queryClient.invalidateQueries({ queryKey: ['course-reviews'] });
    },
  });
};
