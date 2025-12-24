import axios from "@/lib/axios";
import type {
  QuizSubmissionRequest,
  QuizResultResponse,
  VideoQuizResponse,
  SkillResult,
} from "@/types/Quiz";
import type { QuizSummary } from "@/types/QuizSummary";

const videoQuizService = {
  async getQuizByLessonId(lessonId: string): Promise<VideoQuizResponse> {
    const response = await axios.get(`/quiz/lessons/${lessonId}`);
    return response.data;
  },
  async canAccessNextLesson(
    userId: string,
    lessonId: string
  ): Promise<boolean> {
    const response = await axios.get(
      `/quiz/learners/${userId}/lessons/${lessonId}/can-access-next`
    );
    return response.data;
  },

  async getSummaryQuiz(quizId: string): Promise<QuizSummary> {
    const response = await axios.get(`/quiz/summary/${quizId}`);
    return response.data;
  },

  async getQuizByChapterId(chapterId: string): Promise<VideoQuizResponse> {
    const response = await axios.get(`/quiz/chapters/${chapterId}`);
    return response.data;
  },

  async getFinalQuizByCourseId(courseId: string): Promise<VideoQuizResponse> {
    const response = await axios.get(`/quiz/final/${courseId}`);
    return response.data;
  },
  async getQuizTimeLeft(quizSessionId: string): Promise<{ timeLeft: number }> {
    const response = await axios.get(`/api/quiz/session/${quizSessionId}/time-left`);
    return response.data;
  },
  async submitQuiz(data: QuizSubmissionRequest): Promise<QuizResultResponse> {
    // S'assurer que chaque réponse a un timeSpent
    try {
    const submission = {
      ...data,
      answers: data.answers.map(answer => ({
        ...answer,
        timeSpent: answer.timeSpent || 60 // Utiliser 60 secondes par défaut si non fourni
      }))
    };
    const response = await axios.post(`/quiz/submit`, submission);
    const raw = response.data;
    let correctAnswersFromSkills = 0;
    let totalQuestionsFromSkills = 0;
    
   if (raw.skillResults && Array.isArray(raw.skillResults)) {
  raw.skillResults.forEach((skill: SkillResult) => {
    correctAnswersFromSkills += skill.correctAnswers || 0;
    totalQuestionsFromSkills += skill.totalQuestions || 0;
  });
}
    const formattedResult: QuizResultResponse = {
      score: raw.score ?? 0,
      passed: raw.passed ?? false,
      canAccessNextVideo: raw.canAccessNextVideo ?? false,
      totalQuestions: raw.totalQuestions || totalQuestionsFromSkills || data.answers.length,
      correctAnswers: raw.correctAnswers || correctAnswersFromSkills || Math.round((raw.score / 100) * data.answers.length),
      percentage: raw.percentage ?? raw.score ?? 0,
       messages: raw.messages || [],
       feedback: raw.feedback || raw.result || "",
      // Ajouter ces champs pour afficher les détails liés au temps
      timeUsedSeconds: raw.timeUsedSeconds,
      speedLevel: raw.speedLevel,
      speedScore: raw.speedScore,
      accuracyScore: raw.accuracyScore,
      skillResults: raw.skillResults,
      questionDetails: raw.questionDetails || []
    };
    return formattedResult;
  } catch (error) {
     console.error("Erreur de soumission du quiz:", error);
    throw error;
    }

  },
 

};

export default videoQuizService;
