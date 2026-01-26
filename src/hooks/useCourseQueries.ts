import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourseById,
  getCourseReviews,
  getCourseChapters,
  getCoursePacks,
  getCourseSubscription,
  getAdminCourseDetails,
  addCourseReview,
  updateCourseReview,
  deleteCourseReview
} from '@/services/course.service';

/**
 * OPTIMIZED: Hook to fetch all admin course details in a single request
 * This replaces the need for 4 separate hooks (useCourse, useCourseReviews, useCourseChapters, useCoursePacks)
 * Reduces network latency and improves page load performance significantly
 */
export const useAdminCourseDetails = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-course-details', courseId],
    queryFn: () => getAdminCourseDetails(courseId!),
    enabled: !!courseId,
    // Les options globales s'appliquent automatiquement (staleTime: Infinity, etc.)
  })
}

// Hook to fetch a course
export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
    // Les options globales s'appliquent automatiquement
  })
}

// Hook to fetch course reviews
export const useCourseReviews = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => getCourseReviews(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 15, // Override: 15 minutes pour les reviews (contenu plus dynamique)
  })
}

// Hook to fetch course chapters
export const useCourseChapters = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-chapters', courseId],
    queryFn: () => getCourseChapters(courseId!),
    enabled: !!courseId,
    // Les options globales s'appliquent automatiquement
  })
}

// Hook to fetch course packs
export const useCoursePacks = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course-packs', courseId],
    queryFn: () => getCoursePacks(courseId!),
    enabled: !!courseId,
    // Les options globales s'appliquent automatiquement
  })
}

// Hook to fetch user subscription data
export const useCourseSubscription = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['user-data', courseId],
    queryFn: () => getCourseSubscription(courseId!),
    enabled: !!courseId,
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