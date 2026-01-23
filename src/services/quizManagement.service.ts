import axios from "@/lib/axios";
import type {
  QuizManagementRequest,
  QuizDetailResponse,
} from "@/types/QuizManagement";

export const quizManagementService = {
  // SIMPLE_QUIZ (Lesson Quiz)
  async createSimpleQuiz(
    lessonId: string,
    data: QuizManagementRequest
  ): Promise<QuizDetailResponse> {
    const response = await axios.post(`/lessons/${lessonId}/quiz`, data);
    return response.data;
  },

  async getQuizByLessonId(lessonId: string): Promise<QuizDetailResponse | null> {
    try {
      const response = await axios.get(`/lessons/${lessonId}/quiz`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // PHASE_QUIZ (Chapter Quiz)
  async createPhaseQuiz(
    chapterId: string,
    data: QuizManagementRequest
  ): Promise<QuizDetailResponse> {
    const response = await axios.post(`/chapters/${chapterId}/quiz`, data);
    return response.data;
  },

  async getQuizByChapterId(chapterId: string): Promise<QuizDetailResponse | null> {
    try {
      const response = await axios.get(`/chapters/${chapterId}/quiz`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // FINAL_QUIZ (Course Quiz)
  async createFinalQuiz(
    courseId: string,
    data: QuizManagementRequest
  ): Promise<QuizDetailResponse> {
    const response = await axios.post(`/courses/${courseId}/quiz`, data);
    return response.data;
  },

  async getQuizByCourseId(courseId: string): Promise<QuizDetailResponse | null> {
    try {
      const response = await axios.get(`/courses/${courseId}/quiz`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Generic Quiz Operations
  async getQuizById(quizId: string): Promise<QuizDetailResponse> {
    const response = await axios.get(`/quiz/${quizId}`);
    return response.data;
  },

  async updateQuiz(
    quizId: string,
    data: QuizManagementRequest
  ): Promise<QuizDetailResponse> {
    const response = await axios.put(`/quiz/${quizId}`, data);
    return response.data;
  },

  async deleteQuiz(quizId: string): Promise<void> {
    await axios.delete(`/quiz/${quizId}`);
  },
};
