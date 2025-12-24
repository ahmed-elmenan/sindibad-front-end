import type {
  Course,
  CourseSubscription,
  EnrollmentData,
  EnrollmentResponse,
} from "../types/Course";
import type { Review } from "../types/Review";
import type { Chapter } from "../types/Chapter";
import type { Pack } from "../types/Pack";
import type { SubscriptionStatus } from "../types/enum/SubscriptionStatus";
import api from "@/lib/axios";
import type { CourseFormData } from "@/schemas/courseSchema";

export const getAllCourses = async (
  page = 1,
  limit = 12,
  filters: {
    search?: string;
    category?: string;
    level?: string;
    priceRange?: string;
    minRating?: string;
    status?: SubscriptionStatus;
  } = {}
): Promise<{ courses: Course[]; hasMore: boolean }> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      ),
    });
    const res = await api.get(`/courses?${params.toString()}`);
    return await res.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const res = await api.get("/courses/categories");
    return res.data.categories || res.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export function getPopularCourses(): Promise<Course[]> {
  return Promise.resolve([]); // Return an empty array instead of mock courses
}

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const getCourseReviews = async (id: string): Promise<Review[]> => {
  try {
    const res = await api.get(`/courses/${id}/reviews`);
    return res.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const getCourseChapters = async (id: string): Promise<Chapter[]> => {
  try {
    const res = await api.get(`/courses/${id}/chapters`);
    return res.data;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
};

export const getCoursePacks = async (id: string): Promise<Pack[]> => {
  try {
    const res = await api.get(`/courses/${id}/packs`);
    return res.data;
  } catch (error) {
    console.error("Error fetching packs:", error);
    throw error;
  }
};

export const getCourseSubscription = async (
  courseId: string
): Promise<CourseSubscription> => {
  try {
    const res = await api.get(`/courses/${courseId}/subscription`);
    return res.data;
  } catch (error) {
    console.error("Error fetching course subscription data:", error);
    throw error;
  }
};

export const getOptimalPack = (
  packs: Pack[],
  courseSubscription: CourseSubscription | undefined
): { pack: Pack | null; learners: number } => {
  // If user is not logged in
  if (!courseSubscription || !courseSubscription.loggedIn) {
    return { pack: null, learners: 0 };
  }

  // If user is already subscribed
  if (courseSubscription.subscription) {
    return { pack: null, learners: 0 };
  }

  // Determine number of learners based on role
  let learnersToUse = 0;

  if (courseSubscription.role === "LEARNER") {
    // For a learner, always use 1 (individual pack)
    learnersToUse = 1;
  } else if (courseSubscription.role === "ORGANISATION") {
    // For an organization, use the learnersCount
    learnersToUse = courseSubscription.learnersCount;
  }

  // If no learners, no pack
  if (learnersToUse <= 0) {
    return { pack: null, learners: 0 };
  }

  // Find optimal pack based on number of learners
  const optimalPack =
    packs.find(
      (pack) =>
        learnersToUse >= pack.minLearners && learnersToUse <= pack.maxLearners
    ) || packs[0]; // Fallback to first pack if none match

  return {
    pack: optimalPack || null,
    learners: learnersToUse,
  };
};

// Function to enroll in a course
export const enrollInCourse = async (
  enrollmentData: EnrollmentData
): Promise<EnrollmentResponse> => {
  try {
    const res = await api.post("/courses/enroll", enrollmentData);
    return res.data;
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    throw new Error(
      error.response?.data?.message || "Error enrolling in course"
    );
  }
};

// Function to add a new review
export const addCourseReview = async (
  courseId: string,
  reviewData: { rating: number; comment: string }
): Promise<Review> => {
  try {
    const res = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return res.data;
  } catch (error: any) {
    console.error("Error adding review:", error);
    throw new Error(error.response?.data?.message || "Error adding review");
  }
};

// Function to update a review
export const updateCourseReview = async (
  id: string,
  updateData: { rating: number; comment: string }
): Promise<Review> => {
  try {
    const res = await api.put(`/reviews/${id}`, updateData);
    return res.data;
  } catch (error: any) {
    console.error("Error updating review:", error);
    throw new Error(error.response?.data?.message || "Error updating review");
  }
};

// Function to delete a review
export const deleteCourseReview = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Error deleting review:", error);
    throw new Error(error.response?.data?.message || "Error deleting review");
  }
};

export const createCourse = async (
  courseData: CourseFormData | FormData
): Promise<Course> => {
  try {
    // Déterminer le type de Content-Type basé sur le type de données
    const config =
      courseData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
            },
          };

    const res = await api.post("/courses", courseData, config);
    return res.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const updateCourse = async (
  courseId: string,
  courseData: CourseFormData | FormData
): Promise<Course> => {
  try {
    // Déterminer le type de Content-Type basé sur le type de données
    const config =
      courseData instanceof FormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
            },
          };

    const res = await api.put(`/courses/${courseId}`, courseData, config);
    return res.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (
  courseId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete(`/courses/${courseId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error deleting course:", error);
    throw new Error(error.response?.data?.message || "Error deleting course");
  }
};
